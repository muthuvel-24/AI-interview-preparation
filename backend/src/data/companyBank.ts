export interface CompanyProfile {
  id: string;
  name: string;
  logo: string;
  targetRole: string;
  difficulty: 'High' | 'Medium' | 'Standard';
  requiredSkills: string[];
  rounds: { name: string; description: string }[];
  roadmapSteps: { title: string; duration: string; topics: string[] }[];
}

export const COMPANIES_DATA: CompanyProfile[] = [
  {
    id: 'google',
    name: 'Google',
    logo: '🔍',
    targetRole: 'Software Engineer (L3)',
    difficulty: 'High',
    requiredSkills: [
      'Data Structures', 'Algorithms', 'System Design', 'C++', 'Java', 'Python',
      'Operating Systems', 'Graphs & Trees', 'Dynamic Programming'
    ],
    rounds: [
      { name: 'Round 1: Online Assessment', description: '2 Hard Algorithmic Questions on HackerRank/Codility (90 mins)' },
      { name: 'Round 2: Technical Phone Screen', description: '1-on-1 Data Structures & Algorithms coding in Google Doc' },
      { name: 'Round 3-5: Onsite Technical Rounds', description: 'Advanced Graph/DP Coding, System Design & Googliness HR round' },
    ],
    roadmapSteps: [
      { title: 'Phase 1: DSA Mastery', duration: '4 Weeks', topics: ['Trees & Graphs', 'Dynamic Programming', 'Tries & Heaps'] },
      { title: 'Phase 2: Core CS Fundamentals', duration: '2 Weeks', topics: ['OS Concurrency & Threads', 'DBMS B+ Trees', 'TCP/IP Handshake'] },
      { title: 'Phase 3: System Design & Mock Interviews', duration: '3 Weeks', topics: ['Distributed Rate Limiter', 'Load Balancing', 'Googliness HR Scenarios'] },
    ],
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logo: '📦',
    targetRole: 'SDE-1',
    difficulty: 'High',
    requiredSkills: [
      'Data Structures', 'Algorithms', 'Object Oriented Design', 'Amazon Leadership Principles',
      'Java', 'AWS Basics', 'SQL'
    ],
    rounds: [
      { name: 'Round 1: Online Assessment (OA)', description: 'Debugging + 2 Coding Questions + Work Simulation' },
      { name: 'Round 2-4: Onsite Loops', description: 'Coding + Low Level Design (LLD) + Leadership Principles (STAR method)' },
    ],
    roadmapSteps: [
      { title: 'Phase 1: Arrays, HashMaps & Trees', duration: '3 Weeks', topics: ['Two Pointers', 'Sliding Window', 'Binary Tree Traversal'] },
      { title: 'Phase 2: Amazon 16 Leadership Principles', duration: '1 Week', topics: ['Customer Obsession', 'Ownership', 'Bias for Action STAR stories'] },
      { title: 'Phase 3: Low Level System Design', duration: '2 Weeks', topics: ['Parking Lot System', 'Elevator System', 'Design Patterns'] },
    ],
  },
  {
    id: 'tcs',
    name: 'TCS (Digital / Prime)',
    logo: '🏢',
    targetRole: 'Systems Engineer',
    difficulty: 'Standard',
    requiredSkills: [
      'Aptitude & Reasoning', 'C / Python / Java', 'SQL', 'DBMS Basics',
      'Web Development (React/Node.js)'
    ],
    rounds: [
      { name: 'Round 1: NQT Exam', description: 'Numerical, Reasoning, Verbal Aptitude + 2 Coding Problems' },
      { name: 'Round 2: Technical + HR Interview', description: 'Academic project walkthrough, SQL queries, OOPS fundamentals' },
    ],
    roadmapSteps: [
      { title: 'Phase 1: Quantitative Aptitude & Logic', duration: '2 Weeks', topics: ['Permutations & Combinations', 'Probability', 'Pipes & Cisterns'] },
      { title: 'Phase 2: Coding & SQL', duration: '2 Weeks', topics: ['String Manipulation', 'Array Searching', 'SQL Joins & Group By'] },
      { title: 'Phase 3: HR & Final Prep', duration: '1 Week', topics: ['Self Introduction', 'Project Explanation', 'Company Knowledge'] },
    ],
  },
];
