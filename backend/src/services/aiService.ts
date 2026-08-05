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
