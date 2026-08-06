export interface ResumeAnalysisResult {
  atsScore: number;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  parsedData: {
    skillsFound: string[];
    missingKeywords: string[];
    experienceLevel: string;
    targetRoleFit: string;
  };
}

export const analyzeResumeContent = async (
  resumeText: string,
  targetRole: string = 'Software Development Engineer'
): Promise<ResumeAnalysisResult> => {
  const apiKey = process.env.AI_API_KEY;

  if (apiKey && apiKey !== 'placeholder') {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert ATS (Applicant Tracking System) & Tech Recruiter. Analyze the given resume for a CSE graduate applying for the target role. Return valid JSON only.',
            },
            {
              role: 'user',
              content: `Target Role: ${targetRole}\nResume Text:\n${resumeText}\n\nReturn JSON in format: {"atsScore": number, "strengths": string[], "gaps": string[], "suggestions": string[], "parsedData": {"skillsFound": string[], "missingKeywords": string[], "experienceLevel": string, "targetRoleFit": string}}`,
            },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      const data = (await response.json()) as any;
      if (data?.choices?.[0]?.message?.content) {
        return JSON.parse(data.choices[0].message.content) as ResumeAnalysisResult;
      }
    } catch (e) {
      console.warn('AI API Call failed, falling back to heuristic engine:', e);
    }
  }

  const lowerText = resumeText.toLowerCase();

  const cseKeywords = [
    'data structures', 'algorithms', 'python', 'java', 'javascript', 'typescript',
    'react', 'node.js', 'express', 'sql', 'postgresql', 'mongodb', 'docker',
    'git', 'aws', 'rest api', 'system design', 'c++', 'oop'
  ];

  const foundSkills = cseKeywords.filter(k => lowerText.includes(k));
  const missingKeywords = cseKeywords.filter(k => !lowerText.includes(k)).slice(0, 5);

  let score = 65 + (foundSkills.length * 3);
  if (lowerText.includes('project') || lowerText.includes('built')) score += 10;
  if (lowerText.includes('internship') || lowerText.includes('experience')) score += 10;
  if (score > 96) score = 96;

  return {
    atsScore: Math.min(score, 98),
    strengths: [
      foundSkills.length > 5 ? `Strong technical skill alignment (${foundSkills.slice(0, 4).join(', ')})` : 'Good baseline computer science knowledge',
      lowerText.includes('project') ? 'Practical project work highlighted' : 'Clear academic coursework listed',
      'Clean formatting suitable for ATS parsing',
    ],
    gaps: [
      missingKeywords.length > 0 ? `Missing key CSE keywords: ${missingKeywords.join(', ')}` : 'Quantifiable metrics (e.g. % improvement) could be stronger',
      'Add more deployment & cloud infrastructure experience (AWS/Docker)',
      'Include links to GitHub repositories for verification',
    ],
    suggestions: [
      'Use action verbs (e.g., Developed, Engineered, Optimized) at the start of each bullet point.',
      'Quantify achievements with numbers (e.g., "Reduced query latency by 40%").',
      `Add explicit sections for ${missingKeywords.slice(0, 3).join(', ')} to boost ATS keyword matching score.`,
      'Include a concise 2-line Professional Summary tailored to ' + targetRole + '.',
    ],
    parsedData: {
      skillsFound: foundSkills.length > 0 ? foundSkills : ['Java', 'Data Structures', 'Git'],
      missingKeywords,
      experienceLevel: lowerText.includes('intern') ? 'Entry Level (Internship Experience)' : 'Fresh Graduate',
      targetRoleFit: score >= 80 ? 'High Alignment' : 'Moderate Alignment',
    },
  };
};

export const rephraseResumeBullet = async (
  bullet: string,
  targetRole: string = 'Software Engineer'
): Promise<{ original: string; suggestions: string[] }> => {
  const apiKey = process.env.AI_API_KEY;

  if (apiKey && apiKey !== 'placeholder') {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert resume writer. Rephrase the bullet point into 3 STAR-method, action-verb driven bullets with realistic metrics for the given role. Return JSON {"suggestions": string[]}.',
            },
            {
              role: 'user',
              content: `Role: ${targetRole}\nBullet: "${bullet}"`,
            },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      const data = (await response.json()) as any;
      if (data?.choices?.[0]?.message?.content) {
        const parsed = JSON.parse(data.choices[0].message.content);
        return { original: bullet, suggestions: parsed.suggestions || [] };
      }
    } catch (e) {
      console.warn('AI Rephrase API failed:', e);
    }
  }

  // Fallback STAR rephraser engine
  const verbs = ['Engineered', 'Architected', 'Optimized', 'Spearheaded', 'Implemented'];
  const v1 = `${verbs[0]} a high-performance feature using modern software patterns, improving system throughput by 30%.`;
  const v2 = `${verbs[1]} scalable backend services for ${targetRole} workflows, reducing response latency by 45%.`;
  const v3 = `${verbs[2]} and deployed end-to-end functionality, ensuring 99.9% uptime across production environments.`;

  return {
    original: bullet,
    suggestions: [
      `${verbs[0]} ${bullet.replace(/^(built|created|made|worked on)\s+/i, '')}, resulting in a 35% performance boost.`,
      `${verbs[1]} modular solution based on ${bullet}, reducing query execution time by 40%.`,
      `${verbs[2]} comprehensive application workflow for ${targetRole} domain, increasing test coverage by 25%.`,
    ],
  };
};

export const matchResumeToJD = async (
  resumeText: string,
  jobDescription: string
): Promise<{
  matchPercentage: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  fitLevel: string;
  summary: string;
}> => {
  const apiKey = process.env.AI_API_KEY;

  if (apiKey && apiKey !== 'placeholder') {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Compare the candidate resume against the Job Description. Return JSON {"matchPercentage": number, "matchedKeywords": string[], "missingKeywords": string[], "fitLevel": string, "summary": string}.',
            },
            {
              role: 'user',
              content: `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}`,
            },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      const data = (await response.json()) as any;
      if (data?.choices?.[0]?.message?.content) {
        return JSON.parse(data.choices[0].message.content);
      }
    } catch (e) {
      console.warn('AI JD Match API failed:', e);
    }
  }

  // Fallback heuristic JD matcher
  const jdLower = jobDescription.toLowerCase();
  const resumeLower = resumeText.toLowerCase();

  const commonKeywords = [
    'react', 'next.js', 'typescript', 'javascript', 'node.js', 'express', 'python',
    'java', 'c++', 'sql', 'postgresql', 'mongodb', 'docker', 'aws', 'git', 'rest api',
    'graphql', 'testing', 'jest', 'ci/cd', 'agile', 'system design', 'data structures'
  ];

  const jdReqs = commonKeywords.filter(k => jdLower.includes(k));
  const matched = jdReqs.filter(k => resumeLower.includes(k));
  const missing = jdReqs.filter(k => !resumeLower.includes(k));

  const pct = jdReqs.length > 0 ? Math.round((matched.length / jdReqs.length) * 100) : 75;

  return {
    matchPercentage: Math.max(pct, 60),
    matchedKeywords: matched.length > 0 ? matched : ['JavaScript', 'React', 'Git'],
    missingKeywords: missing.length > 0 ? missing : ['Docker', 'AWS'],
    fitLevel: pct >= 80 ? 'Strong Match' : pct >= 60 ? 'Moderate Match' : 'Potential Skill Gap',
    summary: `Candidate matches ${matched.length} out of ${jdReqs.length} key technical requirements specified in the job description.`,
  };
};

export const generateInterviewResponse = async (
  type: 'HR' | 'TECHNICAL',
  roleName: string,
  companyName: string,
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<{ reply: string; score?: number; feedback?: string }> => {
  const apiKey = process.env.AI_API_KEY;

  if (apiKey && apiKey !== 'placeholder') {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert interviewer for ${companyName} conducting a ${type} interview for a ${roleName} role. Keep questions concise and realistic.`,
            },
            ...messages,
          ],
        }),
      });

      const data = (await response.json()) as any;
      if (data?.choices?.[0]?.message?.content) {
        return { reply: data.choices[0].message.content };
      }
    } catch (e) {
      console.warn('AI Interview API call failed:', e);
    }
  }

  const lastUserMsg = messages[messages.length - 1]?.content.toLowerCase() || '';

  if (type === 'HR') {
    if (messages.length <= 1) {
      return {
        reply: `Hello! Welcome to your HR interview for ${companyName}. To start off, please introduce yourself and tell me why you want to join ${companyName} as a ${roleName}?`,
      };
    }
    if (lastUserMsg.includes('team') || lastUserMsg.includes('project') || lastUserMsg.includes('work')) {
      return {
        reply: `That sounds like a valuable experience! Can you tell me about a time when you faced a conflict or disagreement within a team project, and how you resolved it?`,
      };
    }
    return {
      reply: `Great response. Where do you see yourself in 3 to 5 years, and how does working at ${companyName} fit into your career aspirations?`,
    };
  } else {
    if (messages.length <= 1) {
      return {
        reply: `Welcome to your Technical interview for the ${roleName} position at ${companyName}. Let's begin: Can you explain the difference between Process and Thread, and how Memory Management works in modern Operating Systems?`,
      };
    }
    if (lastUserMsg.includes('thread') || lastUserMsg.includes('process') || lastUserMsg.includes('memory')) {
      return {
        reply: `Excellent explanation. Now, suppose you are designing a high-traffic web service. How would you choose between SQL (Relational) and NoSQL databases for storing user session data versus order records?`,
      };
    }
    return {
      reply: `Good technical intuition! Let's move to data structures: How would you implement a Rate Limiter algorithm (e.g. Token Bucket or Leaky Bucket) for an API Gateway?`,
    };
  }
};

export const generateCodingHint = async (
  challengeTitle: string,
  code: string
): Promise<string> => {
  const apiKey = process.env.AI_API_KEY;

  if (apiKey && apiKey !== 'placeholder') {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a coding mentor. Provide a 2-sentence incremental hint for the user code without giving away the complete solution.',
            },
            {
              role: 'user',
              content: `Problem: ${challengeTitle}\nUser Code:\n${code}`,
            },
          ],
        }),
      });

      const data = (await response.json()) as any;
      if (data?.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
      }
    } catch (e) {
      console.warn('AI Hint API failed:', e);
    }
  }

  // Fallback hint engine
  if (challengeTitle.toLowerCase().includes('sum')) {
    return '💡 Hint: Consider using a Hash Map to store elements and their index as you iterate. Check if (target - currentNum) exists in the map in O(1) time.';
  }
  if (challengeTitle.toLowerCase().includes('palindrome')) {
    return '💡 Hint: Normalize the string by keeping only alphanumeric characters in lowercase. Compare the cleaned string with its reverse.';
  }
  return '💡 Hint: Check your edge cases (empty input, single element) and consider using a dynamic programming array or 2-pointer approach.';
};

export const analyzeCodeComplexity = async (
  code: string,
  language: string = 'javascript'
): Promise<{ timeComplexity: string; spaceComplexity: string; explanation: string }> => {
  const apiKey = process.env.AI_API_KEY;

  if (apiKey && apiKey !== 'placeholder') {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Analyze the Big-O Time & Space complexity of the given code. Return JSON {"timeComplexity": string, "spaceComplexity": string, "explanation": string}.',
            },
            {
              role: 'user',
              content: `Language: ${language}\nCode:\n${code}`,
            },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      const data = (await response.json()) as any;
      if (data?.choices?.[0]?.message?.content) {
        return JSON.parse(data.choices[0].message.content);
      }
    } catch (e) {
      console.warn('AI Complexity API failed:', e);
    }
  }

  // Fallback Big-O analyzer
  const lowerCode = code.toLowerCase();
  let time = 'O(N)';
  let space = 'O(N)';
  let explanation = 'Single loop pass through the input size N, with auxiliary space allocated for tracking elements.';

  if (lowerCode.includes('for') && (lowerCode.match(/for/g) || []).length >= 2) {
    time = 'O(N^2)';
    explanation = 'Nested loops detected causing quadratic O(N^2) time complexity.';
  } else if (lowerCode.includes('map') || lowerCode.includes('set') || lowerCode.includes('seen')) {
    time = 'O(N)';
    space = 'O(N)';
    explanation = 'Linear single pass O(N) using Hash Map for O(1) average lookup time.';
  } else if (lowerCode.includes('sort')) {
    time = 'O(N log N)';
    space = 'O(1)';
    explanation = 'Sorting algorithm used leading to O(N log N) time complexity.';
  }

  return { timeComplexity: time, spaceComplexity: space, explanation };
};
