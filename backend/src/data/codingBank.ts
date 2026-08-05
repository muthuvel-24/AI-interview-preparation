export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface CodingChallenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  starterCode: {
    javascript: string;
    python: string;
  };
  testCases: TestCase[];
}

export const CODING_BANK: CodingChallenge[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    description:
      'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target` as a JSON array `[i, j]`.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
  // Your code here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []`,
    },
    testCases: [
      { input: 'twoSum([2, 7, 11, 15], 9)', expectedOutput: '[0,1]' },
      { input: 'twoSum([3, 2, 4], 6)', expectedOutput: '[1,2]' },
      { input: 'twoSum([3, 3], 6)', expectedOutput: '[0,1]' },
    ],
  },
  {
    id: 'valid-palindrome',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    category: 'Strings',
    description:
      'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Return `true` or `false`.',
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true' },
      { input: 's = "race a car"', output: 'false' },
    ],
    starterCode: {
      javascript: `function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === clean.split('').reverse().join('');
}`,
      python: `def is_palindrome(s):
    clean = ''.join(ch.lower() for ch in s if ch.isalnum())
    return clean == clean[::-1]`,
    },
    testCases: [
      { input: 'isPalindrome("A man, a plan, a canal: Panama")', expectedOutput: 'true' },
      { input: 'isPalindrome("race a car")', expectedOutput: 'false' },
      { input: 'isPalindrome(" ")', expectedOutput: 'true' },
    ],
  },
  {
    id: 'reverse-linked-list',
    title: 'Reverse Array / Vector',
    difficulty: 'Easy',
    category: 'Arrays',
    description:
      'Given an array `arr`, return a new array with all elements in reversed order.',
    examples: [
      { input: 'arr = [1, 2, 3, 4, 5]', output: '[5,4,3,2,1]' },
    ],
    starterCode: {
      javascript: `function reverseArray(arr) {
  return arr.slice().reverse();
}`,
      python: `def reverse_array(arr):
    return arr[::-1]`,
    },
    testCases: [
      { input: 'reverseArray([1, 2, 3, 4, 5])', expectedOutput: '[5,4,3,2,1]' },
      { input: 'reverseArray([10, 20])', expectedOutput: '[20,10]' },
    ],
  },
];
