export interface SeedExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface SeedTestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface SeedStarterCode {
  javascript: string;
  python: string;
  java: string;
  cpp: string;
}

export interface SeedProblem {
  title: string;
  slug: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: SeedExample[];
  constraints: string[];
  starterCode: SeedStarterCode;
  testCases: SeedTestCase[];
  acceptanceRate: number;
  companies: string[];
  hints: string[];
  order: number;
}

export const SEED_PROBLEMS: SeedProblem[] = [
  // =========================================================================
  // 1. ARRAYS
  // =========================================================================
  {
    title: 'Two Sum',
    slug: 'two-sum',
    category: 'Arrays',
    difficulty: 'Easy',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have ***exactly one solution***, and you may not use the *same* element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
      },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your code here
  
}`,
      python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Write your code here
        pass`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
        return new int[]{};
    }
}`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here
        return {};
    }
};`,
    },
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isHidden: false },
      { input: '[3,3]\n6', expectedOutput: '[0,1]', isHidden: false },
      { input: '[1,5,7,12,19]\n20', expectedOutput: '[0,4]', isHidden: true },
      { input: '[-3,4,3,90]\n0', expectedOutput: '[0,2]', isHidden: true },
    ],
    acceptanceRate: 84.5,
    companies: ['Amazon', 'Google', 'Apple', 'Microsoft'],
    hints: [
      'A really brute force way would be to search for all possible pairs of numbers but that would be slow. Can we do it in O(N)?',
      'A Hash Map allows O(1) lookups for the complement (target - nums[i]).',
      'Optimal Pattern: Store seen numbers in a Hash Map {number: index}. For each element, check if target - nums[i] exists.',
    ],
    order: 1,
  },
  {
    title: 'Best Time to Buy and Sell Stock',
    slug: 'best-time-to-buy-and-sell-stock',
    category: 'Arrays',
    difficulty: 'Easy',
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`-th day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return *the maximum profit you can achieve from this transaction*. If you cannot achieve any profit, return \`0\`.`,
    examples: [
      {
        input: 'prices = [7,1,5,3,6,4]',
        output: '5',
        explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.',
      },
      {
        input: 'prices = [7,6,4,3,1]',
        output: '0',
        explanation: 'In this case, no transactions are done and the max profit = 0.',
      },
    ],
    constraints: [
      '1 <= prices.length <= 10^5',
      '0 <= prices[i] <= 10^4',
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
  // Write your code here
  
}`,
      python: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        # Write your code here
        pass`,
      java: `class Solution {
    public int maxProfit(int[] prices) {
        // Write your code here
        return 0;
    }
}`,
      cpp: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        // Write your code here
        return 0;
    }
};`,
    },
    testCases: [
      { input: '[7,1,5,3,6,4]', expectedOutput: '5', isHidden: false },
      { input: '[7,6,4,3,1]', expectedOutput: '0', isHidden: false },
      { input: '[2,4,1]', expectedOutput: '2', isHidden: true },
      { input: '[3,2,6,5,0,3]', expectedOutput: '4', isHidden: true },
    ],
    acceptanceRate: 81.3,
    companies: ['Amazon', 'Apple', 'Google', 'Cisco'],
    hints: [
      'Maintain the minimum price seen so far as you iterate through the days.',
      'Max profit at day i is max(0, prices[i] - min_price_so_far).',
    ],
    order: 2,
  },
  {
    title: 'Product of Array Except Self',
    slug: 'product-of-array-except-self',
    category: 'Arrays',
    difficulty: 'Medium',
    description: `Given an integer array \`nums\`, return *an array \`answer\` such that \`answer[i]\` is equal to the product of all the elements of \`nums\` except \`nums[i]\`*.

The product of any prefix or suffix of \`nums\` is **guaranteed** to fit in a **32-bit** integer.

You must write an algorithm that runs in **O(n)** time and without using the division operation.`,
    examples: [
      { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]' },
      { input: 'nums = [-1,1,0,-3,3]', output: '[0,0,9,0,0]' },
    ],
    constraints: [
      '2 <= nums.length <= 10^5',
      '-30 <= nums[i] <= 30',
      'Cannot use division operator.',
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number[]}
 */
function productExceptSelf(nums) {
  // Write your code here
  
}`,
      python: `class Solution:
    def productExceptSelf(self, nums: list[int]) -> list[int]:
        # Write your code here
        pass`,
      java: `class Solution {
    public int[] productExceptSelf(int[] nums) {
        // Write your code here
        return new int[]{};
    }
}`,
      cpp: `class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        // Write your code here
        return {};
    }
};`,
    },
    testCases: [
      { input: '[1,2,3,4]', expectedOutput: '[24,12,8,6]', isHidden: false },
      { input: '[-1,1,0,-3,3]', expectedOutput: '[0,0,9,0,0]', isHidden: false },
      { input: '[4,5,1,8,2]', expectedOutput: '[80,64,320,40,160]', isHidden: true },
    ],
    acceptanceRate: 65.2,
    companies: ['Amazon', 'Meta', 'Microsoft', 'Apple'],
    hints: [
      'Product except self at index i = (product of elements to left of i) * (product of elements to right of i).',
      'Use a prefix product pass from left to right, then a suffix product pass from right to left in O(1) auxiliary space.',
    ],
    order: 3,
  },

  // =========================================================================
  // 2. STRINGS
  // =========================================================================
  {
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    category: 'Strings',
    difficulty: 'Medium',
    description: `Given a string \`s\`, find the length of the **longest substring** without duplicate characters.

A **substring** is a contiguous non-empty sequence of characters within a string.`,
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", length 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", length 1.' },
      { input: 's = "pwwkew"', output: '3', explanation: 'The answer is "wke", length 3.' },
    ],
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.',
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  // Write your code here
  
}`,
      python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # Write your code here
        pass`,
      java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Write your code here
        return 0;
    }
}`,
      cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // Write your code here
        return 0;
    }
};`,
    },
    testCases: [
      { input: '"abcabcbb"', expectedOutput: '3', isHidden: false },
      { input: '"bbbbb"', expectedOutput: '1', isHidden: false },
      { input: '"pwwkew"', expectedOutput: '3', isHidden: false },
      { input: '""', expectedOutput: '0', isHidden: true },
      { input: '"dvdf"', expectedOutput: '3', isHidden: true },
    ],
    acceptanceRate: 51.2,
    companies: ['Microsoft', 'Amazon', 'Bloomberg', 'Meta'],
    hints: [
      'Use a dynamic sliding window [left, right] with a Hash Map storing character -> last seen index.',
      'When character at right is duplicate, jump left = max(left, lastSeen[char] + 1).',
    ],
    order: 4,
  },
  {
    title: 'Valid Anagram',
    slug: 'valid-anagram',
    category: 'Strings',
    difficulty: 'Easy',
    description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an **anagram** of \`s\`, and \`false\` otherwise.

An **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true' },
      { input: 's = "rat", t = "car"', output: 'false' },
    ],
    constraints: [
      '1 <= s.length, t.length <= 5 * 10^4',
      's and t consist of lowercase English letters.',
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
function isAnagram(s, t) {
  // Write your code here
  
}`,
      python: `class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        # Write your code here
        pass`,
      java: `class Solution {
    public boolean isAnagram(String s, String t) {
        // Write your code here
        return false;
    }
}`,
      cpp: `class Solution {
public:
    boolean isAnagram(string s, string t) {
        // Write your code here
        return false;
    }
};`,
    },
    testCases: [
      { input: '"anagram"\n"nagaram"', expectedOutput: 'true', isHidden: false },
      { input: '"rat"\n"car"', expectedOutput: 'false', isHidden: false },
      { input: '"a"\n"ab"', expectedOutput: 'false', isHidden: true },
      { input: '"listen"\n"silent"', expectedOutput: 'true', isHidden: true },
    ],
    acceptanceRate: 82.1,
    companies: ['Amazon', 'Facebook', 'Uber', 'Goldman Sachs'],
    hints: [
      'If lengths differ, return false immediately.',
      'Use a fixed 26-element array count[26] to increment for s and decrement for t in O(N) time and O(1) space.',
    ],
    order: 5,
  },
  {
    title: 'Group Anagrams',
    slug: 'group-anagrams',
    category: 'Strings',
    difficulty: 'Medium',
    description: `Given an array of strings \`strs\`, group the **anagrams** together. You can return the answer in any order.

An **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase.`,
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
      { input: 'strs = [""]', output: '[[""]]' },
      { input: 'strs = ["a"]', output: '[["a"]]' },
    ],
    constraints: [
      '1 <= strs.length <= 10^4',
      '0 <= strs[i].length <= 100',
      'strs[i] consists of lowercase English letters.',
    ],
    starterCode: {
      javascript: `/**
 * @param {string[]} strs
 * @return {string[][]}
 */
function groupAnagrams(strs) {
  // Write your code here
  
}`,
      python: `class Solution:
    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:
        # Write your code here
        pass`,
      java: `class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        // Write your code here
        return new ArrayList<>();
    }
}`,
      cpp: `class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        // Write your code here
        return {};
    }
};`,
    },
    testCases: [
      { input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["eat","tea","ate"],["tan","nat"],["bat"]]', isHidden: false },
      { input: '[""]', expectedOutput: '[[""]]', isHidden: false },
      { input: '["a"]', expectedOutput: '[["a"]]', isHidden: false },
    ],
    acceptanceRate: 67.4,
    companies: ['Amazon', 'Google', 'Meta', 'Salesforce'],
    hints: [
      'Two strings are anagrams if and only if their sorted strings are equal.',
      'Use a Hash Map where the key is the sorted string and value is the list of anagrams.',
    ],
    order: 6,
  },

  // =========================================================================
  // 3. TWO POINTERS
  // =========================================================================
  {
    title: 'Container With Most Water',
    slug: 'container-with-most-water',
    category: 'Two Pointers',
    difficulty: 'Medium',
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i\`-th line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return *the maximum amount of water a container can store*.`,
    examples: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49' },
      { input: 'height = [1,1]', output: '1' },
    ],
    constraints: [
      'n == height.length',
      '2 <= n <= 10^5',
      '0 <= height[i] <= 10^4',
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function maxArea(height) {
  // Write your code here
  
}`,
      python: `class Solution:
    def maxArea(self, height: list[int]) -> int:
        # Write your code here
        pass`,
      java: `class Solution {
    public int maxArea(int[] height) {
        // Write your code here
        return 0;
    }
}`,
      cpp: `class Solution {
public:
    int maxArea(vector<int>& height) {
        // Write your code here
        return 0;
    }
};`,
    },
    testCases: [
      { input: '[1,8,6,2,5,4,8,3,7]', expectedOutput: '49', isHidden: false },
      { input: '[1,1]', expectedOutput: '1', isHidden: false },
      { input: '[4,3,2,1,4]', expectedOutput: '16', isHidden: true },
      { input: '[1,2,1]', expectedOutput: '2', isHidden: true },
    ],
    acceptanceRate: 59.1,
    companies: ['Amazon', 'Google', 'Meta', 'Goldman Sachs'],
    hints: [
      'Initialize left = 0 and right = n - 1.',
      'Always move the pointer that points to the shorter line inward.',
    ],
    order: 7,
  },
  {
    title: '3Sum',
    slug: 'three-sum',
    category: 'Two Pointers',
    difficulty: 'Medium',
    description: `Given an integer array nums, return all unique triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must not contain duplicate triplets.`,
    examples: [
      { input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]' },
      { input: 'nums = [0,1,1]', output: '[]' },
      { input: 'nums = [0,0,0]', output: '[[0,0,0]]' },
    ],
    constraints: [
      '3 <= nums.length <= 3000',
      '-10^5 <= nums[i] <= 10^5',
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function threeSum(nums) {
  // Write your code here
  
}`,
      python: `class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        # Write your code here
        pass`,
      java: `class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        // Write your code here
        return new ArrayList<>();
    }
}`,
      cpp: `class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        // Write your code here
        return {};
    }
};`,
    },
    testCases: [
      { input: '[-1,0,1,2,-1,-4]', expectedOutput: '[[-1,-1,2],[-1,0,1]]', isHidden: false },
      { input: '[0,1,1]', expectedOutput: '[]', isHidden: false },
      { input: '[0,0,0]', expectedOutput: '[[0,0,0]]', isHidden: false },
      { input: '[-2,0,1,1,2]', expectedOutput: '[[-2,0,2],[-2,1,1]]', isHidden: true },
    ],
    acceptanceRate: 48.7,
    companies: ['Amazon', 'Meta', 'Apple', 'Google'],
    hints: [
      'Sort the array first to enable two-pointer scans and avoid duplicate triplets.',
      'Iterate through the array fixing nums[i], then use left and right pointers to find remaining pair.',
    ],
    order: 8,
  },
  {
    title: 'Trapping Rain Water',
    slug: 'trapping-rain-water',
    category: 'Two Pointers',
    difficulty: 'Hard',
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' },
      { input: 'height = [4,2,0,3,2,5]', output: '9' },
    ],
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5',
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function trap(height) {
  // Write your code here
  
}`,
      python: `class Solution:
    def trap(self, height: list[int]) -> int:
        # Write your code here
        pass`,
      java: `class Solution {
    public int trap(int[] height) {
        // Write your code here
        return 0;
    }
}`,
      cpp: `class Solution {
public:
    int trap(vector<int>& height) {
        // Write your code here
        return 0;
    }
};`,
    },
    testCases: [
      { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6', isHidden: false },
      { input: '[4,2,0,3,2,5]', expectedOutput: '9', isHidden: false },
      { input: '[2,0,2]', expectedOutput: '2', isHidden: true },
      { input: '[3,0,0,2,0,4]', expectedOutput: '10', isHidden: true },
    ],
    acceptanceRate: 60.8,
    companies: ['Amazon', 'Google', 'Goldman Sachs', 'Apple'],
    hints: [
      'Water trapped above bar i = max(0, min(max_left, max_right) - height[i]).',
      'Use two pointers left and right moving inward maintaining leftMax and rightMax in O(1) space.',
    ],
    order: 9,
  },

  // =========================================================================
  // 4. STACK
  // =========================================================================
  {
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    category: 'Stack',
    difficulty: 'Easy',
    description: 'Given a string `s` containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.',
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Write your code here
  
}`,
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        # Write your code here
        pass`,
      java: `class Solution {
    public boolean isValid(String s) {
        // Write your code here
        return false;
    }
}`,
      cpp: `class Solution {
public:
    bool isValid(string s) {
        // Write your code here
        return false;
    }
};`,
    },
    testCases: [
      { input: '"()"', expectedOutput: 'true', isHidden: false },
      { input: '"()[]{}"', expectedOutput: 'true', isHidden: false },
      { input: '"(]"', expectedOutput: 'false', isHidden: false },
      { input: '"([)]"', expectedOutput: 'false', isHidden: true },
      { input: '"{[]}"', expectedOutput: 'true', isHidden: true },
    ],
    acceptanceRate: 78.9,
    companies: ['Google', 'Meta', 'Bloomberg', 'Cisco'],
    hints: [
      'Use a stack to push opening brackets and pop to verify corresponding closing brackets.',
    ],
    order: 10,
  },
  {
    title: 'Min Stack Design',
    slug: 'min-stack',
    category: 'Stack',
    difficulty: 'Medium',
    description: `Design a stack that supports push, pop, top, and retrieving the minimum element in **constant time O(1)**.

Implement the \`MinStack\` class:
- \`push(val)\` pushes val onto stack.
- \`pop()\` removes element on top.
- \`top()\` gets the top element.
- \`getMin()\` retrieves the minimum element in the stack.`,
    examples: [
      {
        input: 'push(-2) -> push(0) -> push(-3) -> getMin() -> pop() -> top() -> getMin()',
        output: '[-3, 0, -2]',
        explanation: 'MinStack tracks running minimums alongside values.',
      },
    ],
    constraints: [
      '-2^31 <= val <= 2^31 - 1',
      'Methods pop, top and getMin operations will always be called on non-empty stacks.',
    ],
    starterCode: {
      javascript: `class MinStack {
  constructor() {
    // Write your code here
  }

  push(val) {
    // Write your code here
  }

  pop() {
    // Write your code here
  }

  top() {
    // Write your code here
  }

  getMin() {
    // Write your code here
  }
}`,
      python: `class MinStack:
    def __init__(self):
        # Write your code here
        pass

    def push(self, val: int) -> None:
        pass

    def pop(self) -> None:
        pass

    def top(self) -> int:
        pass

    def getMin(self) -> int:
        pass`,
      java: `class MinStack {
    public MinStack() {
        // Write your code here
    }
    
    public void push(int val) {
    }
    
    public void pop() {
    }
    
    public int top() {
        return 0;
    }
    
    public int getMin() {
        return 0;
    }
}`,
      cpp: `class MinStack {
public:
    MinStack() {
        // Write your code here
    }
    
    void push(int val) {
    }
    
    void pop() {
    }
    
    int top() {
        return 0;
    }
    
    int getMin() {
        return 0;
    }
};`,
    },
    testCases: [
      { input: '["MinStack","push","push","push","getMin","pop","top","getMin"]\n[[],[-2],[0],[-3],[],[],[],[]]', expectedOutput: '[null,null,null,null,-3,null,0,-2]', isHidden: false },
      { input: '["MinStack","push","push","getMin"]\n[[],[1],[2],[]]', expectedOutput: '[null,null,null,1]', isHidden: false },
    ],
    acceptanceRate: 53.6,
    companies: ['Amazon', 'Bloomberg', 'Microsoft'],
    hints: [
      'Maintain an auxiliary min-stack that pushes the current minimum every time a new element is pushed.',
    ],
    order: 11,
  },
  {
    title: 'Daily Temperatures',
    slug: 'daily-temperatures',
    category: 'Stack',
    difficulty: 'Medium',
    description: `Given an array of integers \`temperatures\` representing the daily temperatures, return *an array \`answer\` such that \`answer[i]\` is the number of days you have to wait after the \`i\`-th day to get a warmer temperature*. If there is no future day for which this is possible, keep \`answer[i] == 0\`.`,
    examples: [
      { input: 'temperatures = [73,74,75,71,69,72,76,73]', output: '[1,1,4,2,1,1,0,0]' },
      { input: 'temperatures = [30,40,50,60]', output: '[1,1,1,0]' },
      { input: 'temperatures = [30,60,90]', output: '[1,1,0]' },
    ],
    constraints: [
      '1 <= temperatures.length <= 10^5',
      '30 <= temperatures[i] <= 100',
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} temperatures
 * @return {number[]}
 */
function dailyTemperatures(temperatures) {
  // Write your code here
  
}`,
      python: `class Solution:
    def dailyTemperatures(self, temperatures: list[int]) -> list[int]:
        # Write your code here
        pass`,
      java: `class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        // Write your code here
        return new int[]{};
    }
}`,
      cpp: `class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        // Write your code here
        return {};
    }
};`,
    },
    testCases: [
      { input: '[73,74,75,71,69,72,76,73]', expectedOutput: '[1,1,4,2,1,1,0,0]', isHidden: false },
      { input: '[30,40,50,60]', expectedOutput: '[1,1,1,0]', isHidden: false },
      { input: '[30,60,90]', expectedOutput: '[1,1,0]', isHidden: false },
      { input: '[89,62,70,58,47,47,46,76,100,70]', expectedOutput: '[8,1,5,4,3,2,1,1,0,0]', isHidden: true },
    ],
    acceptanceRate: 66.8,
    companies: ['Amazon', 'Bloomberg', 'Meta', 'Netflix'],
    hints: [
      'Use a Monotonic Decreasing Stack storing indices.',
      'When the current temperature is greater than stack top, pop and calculate distance.',
    ],
    order: 12,
  },

  // =========================================================================
  // 5. LINKED LISTS
  // =========================================================================
  {
    title: 'Reverse Linked List',
    slug: 'reverse-linked-list',
    category: 'Linked Lists',
    difficulty: 'Easy',
    description: `Given the \`head\` of a singly linked list, reverse the list, and return *the reversed list*.`,
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', output: '[2,1]' },
      { input: 'head = []', output: '[]' },
    ],
    constraints: [
      'The number of nodes in the list is the range [0, 5000].',
      '-5000 <= Node.val <= 5000',
    ],
    starterCode: {
      javascript: `/**
 * @param {ListNode} head
 * @return {ListNode}
 */
function reverseList(head) {
  // Write your code here
  
}`,
      python: `class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        # Write your code here
        pass`,
      java: `class Solution {
    public ListNode reverseList(ListNode head) {
        // Write your code here
        return null;
    }
}`,
      cpp: `class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        // Write your code here
        return nullptr;
    }
};`,
    },
    testCases: [
      { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]', isHidden: false },
      { input: '[1,2]', expectedOutput: '[2,1]', isHidden: false },
      { input: '[]', expectedOutput: '[]', isHidden: false },
    ],
    acceptanceRate: 75.3,
    companies: ['Meta', 'Amazon', 'Apple', 'Google'],
    hints: [
      'Maintain three pointers: prev = null, curr = head, next = null.',
      'At each step, next = curr.next, curr.next = prev, prev = curr, curr = next.',
    ],
    order: 13,
  },
  {
    title: 'Merge Two Sorted Lists',
    slug: 'merge-two-sorted-lists',
    category: 'Linked Lists',
    difficulty: 'Easy',
    description: `You are given the heads of two sorted linked lists \`list1\` and \`list2\`.

Merge the two lists into one **sorted** list. The list should be made by splicing together the nodes of the first two lists.

Return *the head of the merged linked list*.`,
    examples: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' },
      { input: 'list1 = [], list2 = []', output: '[]' },
      { input: 'list1 = [], list2 = [0]', output: '[0]' },
    ],
    constraints: [
      'The number of nodes in both lists is in range [0, 50].',
      '-100 <= Node.val <= 100',
      'Both list1 and list2 are sorted in non-decreasing order.',
    ],
    starterCode: {
      javascript: `/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
function mergeTwoLists(list1, list2) {
  // Write your code here
  
}`,
      python: `class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        # Write your code here
        pass`,
      java: `class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        // Write your code here
        return null;
    }
}`,
      cpp: `class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        // Write your code here
        return nullptr;
    }
};`,
    },
    testCases: [
      { input: '[1,2,4]\n[1,3,4]', expectedOutput: '[1,1,2,3,4,4]', isHidden: false },
      { input: '[]\n[]', expectedOutput: '[]', isHidden: false },
      { input: '[]\n[0]', expectedOutput: '[0]', isHidden: false },
    ],
    acceptanceRate: 63.8,
    companies: ['Amazon', 'Microsoft', 'Google', 'Apple'],
    hints: [
      'Use a dummy head node to simplify edge cases.',
      'Compare list1.val and list2.val and advance the pointer with smaller value.',
    ],
    order: 14,
  },
  {
    title: 'Linked List Cycle',
    slug: 'linked-list-cycle',
    category: 'Linked Lists',
    difficulty: 'Easy',
    description: `Given \`head\`, the head of a linked list, determine if the linked list has a cycle in it.

Return \`true\` if there is a cycle in the linked list. Otherwise, return \`false\`.`,
    examples: [
      { input: 'head = [3,2,0,-4], pos = 1', output: 'true' },
      { input: 'head = [1,2], pos = 0', output: 'true' },
      { input: 'head = [1], pos = -1', output: 'false' },
    ],
    constraints: [
      'The number of the nodes in the list is in the range [0, 10^4].',
      '-10^5 <= Node.val <= 10^5',
    ],
    starterCode: {
      javascript: `/**
 * @param {ListNode} head
 * @return {boolean}
 */
function hasCycle(head) {
  // Write your code here
  
}`,
      python: `class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        # Write your code here
        pass`,
      java: `class Solution {
    public boolean hasCycle(ListNode head) {
        // Write your code here
        return false;
    }
}`,
      cpp: `class Solution {
public:
    bool hasCycle(ListNode *head) {
        // Write your code here
        return false;
    }
};`,
    },
    testCases: [
      { input: '[3,2,0,-4]\n1', expectedOutput: 'true', isHidden: false },
      { input: '[1,2]\n0', expectedOutput: 'true', isHidden: false },
      { input: '[1]\n-1', expectedOutput: 'false', isHidden: false },
    ],
    acceptanceRate: 50.1,
    companies: ['Amazon', 'Microsoft', 'Bloomberg', 'Cisco'],
    hints: [
      'Floyd\'s Tortoise and Hare algorithm: use slow (1 step) and fast (2 steps) pointers.',
      'If slow and fast meet, a cycle exists; if fast reaches null, no cycle exists.',
    ],
    order: 15,
  },

  // =========================================================================
  // 6. TREES
  // =========================================================================
  {
    title: 'Maximum Depth of Binary Tree',
    slug: 'maximum-depth-of-binary-tree',
    category: 'Trees',
    difficulty: 'Easy',
    description: `Given the \`root\` of a binary tree, return *its maximum depth*.

A binary tree's **maximum depth** is the number of nodes along the longest path from the root node down to the farthest leaf node.`,
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '3' },
      { input: 'root = [1,null,2]', output: '2' },
    ],
    constraints: [
      'The number of nodes in the tree is in the range [0, 10^4].',
      '-100 <= Node.val <= 100',
    ],
    starterCode: {
      javascript: `/**
 * @param {TreeNode} root
 * @return {number}
 */
function maxDepth(root) {
  // Write your code here
  
}`,
      python: `class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        # Write your code here
        pass`,
      java: `class Solution {
    public int maxDepth(TreeNode root) {
        // Write your code here
        return 0;
    }
}`,
      cpp: `class Solution {
public:
    int maxDepth(TreeNode* root) {
        // Write your code here
        return 0;
    }
};`,
    },
    testCases: [
      { input: '[3,9,20,null,null,15,7]', expectedOutput: '3', isHidden: false },
      { input: '[1,null,2]', expectedOutput: '2', isHidden: false },
      { input: '[]', expectedOutput: '0', isHidden: false },
    ],
    acceptanceRate: 74.8,
    companies: ['Google', 'Amazon', 'Apple', 'Microsoft'],
    hints: [
      'Base case: if root is null, return 0.',
      'Recursive case: 1 + max(maxDepth(root.left), maxDepth(root.right)).',
    ],
    order: 16,
  },
  {
    title: 'Invert Binary Tree',
    slug: 'invert-binary-tree',
    category: 'Trees',
    difficulty: 'Easy',
    description: `Given the \`root\` of a binary tree, invert the tree, and return *its root*.`,
    examples: [
      { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' },
      { input: 'root = [2,1,3]', output: '[2,3,1]' },
      { input: 'root = []', output: '[]' },
    ],
    constraints: [
      'The number of nodes in the tree is in the range [0, 100].',
      '-100 <= Node.val <= 100',
    ],
    starterCode: {
      javascript: `/**
 * @param {TreeNode} root
 * @return {TreeNode}
 */
function invertTree(root) {
  // Write your code here
  
}`,
      python: `class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        # Write your code here
        pass`,
      java: `class Solution {
    public TreeNode invertTree(TreeNode root) {
        // Write your code here
        return null;
    }
}`,
      cpp: `class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        // Write your code here
        return nullptr;
    }
};`,
    },
    testCases: [
      { input: '[4,2,7,1,3,6,9]', expectedOutput: '[4,7,2,9,6,3,1]', isHidden: false },
      { input: '[2,1,3]', expectedOutput: '[2,3,1]', isHidden: false },
      { input: '[]', expectedOutput: '[]', isHidden: false },
    ],
    acceptanceRate: 77.2,
    companies: ['Google', 'Homebrew / Twitter', 'Amazon', 'Cisco'],
    hints: [
      'Swap root.left and root.right, then recursively invert both subtrees.',
    ],
    order: 17,
  },
  {
    title: 'Binary Tree Level Order Traversal',
    slug: 'binary-tree-level-order-traversal',
    category: 'Trees',
    difficulty: 'Medium',
    description: `Given the \`root\` of a binary tree, return *the level order traversal of its nodes' values* (i.e., from left to right, level by level).`,
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' },
      { input: 'root = [1]', output: '[[1]]' },
      { input: 'root = []', output: '[]' },
    ],
    constraints: [
      'The number of nodes in the tree is in the range [0, 2000].',
      '-1000 <= Node.val <= 1000',
    ],
    starterCode: {
      javascript: `/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
function levelOrder(root) {
  // Write your code here
  
}`,
      python: `class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> list[list[int]]:
        # Write your code here
        pass`,
      java: `class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        // Write your code here
        return new ArrayList<>();
    }
}`,
      cpp: `class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        // Write your code here
        return {};
    }
};`,
    },
    testCases: [
      { input: '[3,9,20,null,null,15,7]', expectedOutput: '[[3],[9,20],[15,7]]', isHidden: false },
      { input: '[1]', expectedOutput: '[[1]]', isHidden: false },
      { input: '[]', expectedOutput: '[]', isHidden: false },
    ],
    acceptanceRate: 66.5,
    companies: ['Amazon', 'LinkedIn', 'Meta', 'Microsoft'],
    hints: [
      'Use a Breadth-First Search (BFS) Queue.',
      'At each iteration of the queue, loop level_size times to group all nodes belonging to the current level.',
    ],
    order: 18,
  },
  {
    title: 'Validate Binary Search Tree',
    slug: 'validate-binary-search-tree',
    category: 'Trees',
    difficulty: 'Medium',
    description: `Given the \`root\` of a binary tree, determine if it is a valid binary search tree (BST).

A **valid BST** is defined as follows:
- The left subtree of a node contains only nodes with keys **less than** the node's key.
- The right subtree of a node contains only nodes with keys **greater than** the node's key.
- Both the left and right subtrees must also be binary search trees.`,
    examples: [
      { input: 'root = [2,1,3]', output: 'true' },
      { input: 'root = [5,1,4,null,null,3,6]', output: 'false' },
    ],
    constraints: [
      'The number of nodes in the tree is in the range [1, 10^4].',
      '-2^31 <= Node.val <= 2^31 - 1',
    ],
    starterCode: {
      javascript: `/**
 * @param {TreeNode} root
 * @return {boolean}
 */
function isValidBST(root) {
  // Write your code here
  
}`,
      python: `class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        # Write your code here
        pass`,
      java: `class Solution {
    public boolean isValidBST(TreeNode root) {
        // Write your code here
        return false;
    }
}`,
      cpp: `class Solution {
public:
    bool isValidBST(TreeNode* root) {
        // Write your code here
        return false;
    }
};`,
    },
    testCases: [
      { input: '[2,1,3]', expectedOutput: 'true', isHidden: false },
      { input: '[5,1,4,null,null,3,6]', expectedOutput: 'false', isHidden: false },
      { input: '[2,2,2]', expectedOutput: 'false', isHidden: true },
    ],
    acceptanceRate: 32.8,
    companies: ['Amazon', 'Microsoft', 'Bloomberg', 'Oracle'],
    hints: [
      'Checking only immediate parent and child is NOT enough! All nodes in right subtree must exceed ancestor.',
      'Pass down valid range boundaries: validate(node, min, max).',
    ],
    order: 19,
  },

  // =========================================================================
  // 7. SEARCHING
  // =========================================================================
  {
    title: 'Binary Search',
    slug: 'binary-search',
    category: 'Searching',
    difficulty: 'Easy',
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with **O(log n)** runtime complexity.`,
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' },
    ],
    constraints: [
      '1 <= nums.length <= 10^4',
      '-10^4 < nums[i], target < 10^4',
      'All the integers in nums are unique.',
      'nums is sorted in ascending order.',
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {
  // Write your code here
  
}`,
      python: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        # Write your code here
        pass`,
      java: `class Solution {
    public int search(int[] nums, int target) {
        // Write your code here
        return -1;
    }
}`,
      cpp: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        // Write your code here
        return -1;
    }
};`,
    },
    testCases: [
      { input: '[-1,0,3,5,9,12]\n9', expectedOutput: '4', isHidden: false },
      { input: '[-1,0,3,5,9,12]\n2', expectedOutput: '-1', isHidden: false },
      { input: '[5]\n5', expectedOutput: '0', isHidden: true },
    ],
    acceptanceRate: 57.8,
    companies: ['Microsoft', 'Google', 'Amazon', 'Adobe'],
    hints: [
      'Initialize left = 0, right = nums.length - 1.',
      'mid = left + Math.floor((right - left) / 2) prevents integer overflow.',
    ],
    order: 20,
  },
  {
    title: 'Search in Rotated Sorted Array',
    slug: 'search-in-rotated-sorted-array',
    category: 'Searching',
    difficulty: 'Medium',
    description: `There is an integer array \`nums\` sorted in ascending order (with distinct values) that has been rotated at an unknown pivot index.

Given the array \`nums\` after the possible rotation and an integer \`target\`, return the index of \`target\` if it is in \`nums\`, or \`-1\` if it is not in \`nums\`.

You must achieve **O(log n)** runtime complexity.`,
    examples: [
      { input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4' },
      { input: 'nums = [4,5,6,7,0,1,2], target = 3', output: '-1' },
      { input: 'nums = [1], target = 0', output: '-1' },
    ],
    constraints: [
      '1 <= nums.length <= 5000',
      '-10^4 <= nums[i] <= 10^4',
      'All values of nums are unique.',
      'nums is guaranteed to be rotated at some pivot.',
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function searchRotated(nums, target) {
  // Write your code here
  
}`,
      python: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        # Write your code here
        pass`,
      java: `class Solution {
    public int search(int[] nums, int target) {
        // Write your code here
        return -1;
    }
}`,
      cpp: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        // Write your code here
        return -1;
    }
};`,
    },
    testCases: [
      { input: '[4,5,6,7,0,1,2]\n0', expectedOutput: '4', isHidden: false },
      { input: '[4,5,6,7,0,1,2]\n3', expectedOutput: '-1', isHidden: false },
      { input: '[1]\n0', expectedOutput: '-1', isHidden: false },
      { input: '[6,7,1,2,3,4,5]\n6', expectedOutput: '0', isHidden: true },
    ],
    acceptanceRate: 40.5,
    companies: ['Amazon', 'Microsoft', 'Adobe', 'Goldman Sachs'],
    hints: [
      'Notice that at least one half of the rotated array (either left or right) is ALWAYS normally sorted.',
      'Identify which half is normally sorted, check if target falls within that range, and prune the other half.',
    ],
    order: 21,
  },
  {
    title: 'Find Minimum in Rotated Sorted Array',
    slug: 'find-minimum-in-rotated-sorted-array',
    category: 'Searching',
    difficulty: 'Medium',
    description: `Suppose an array of length \`n\` sorted in ascending order is rotated between \`1\` and \`n\` times.

Given the sorted rotated array \`nums\` of **unique** elements, return *the minimum element of this array*.

You must write an algorithm that runs in **O(log n)** time.`,
    examples: [
      { input: 'nums = [3,4,5,1,2]', output: '1' },
      { input: 'nums = [4,5,6,7,0,1,2]', output: '0' },
      { input: 'nums = [11,13,15,17]', output: '11' },
    ],
    constraints: [
      'n == nums.length',
      '1 <= n <= 5000',
      '-5000 <= nums[i] <= 5000',
      'All the integers of nums are unique.',
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function findMin(nums) {
  // Write your code here
  
}`,
      python: `class Solution:
    def findMin(self, nums: list[int]) -> int:
        # Write your code here
        pass`,
      java: `class Solution {
    public int findMin(int[] nums) {
        // Write your code here
        return 0;
    }
}`,
      cpp: `class Solution {
public:
    int findMin(vector<int>& nums) {
        // Write your code here
        return 0;
    }
};`,
    },
    testCases: [
      { input: '[3,4,5,1,2]', expectedOutput: '1', isHidden: false },
      { input: '[4,5,6,7,0,1,2]', expectedOutput: '0', isHidden: false },
      { input: '[11,13,15,17]', expectedOutput: '11', isHidden: false },
      { input: '[2,1]', expectedOutput: '1', isHidden: true },
    ],
    acceptanceRate: 50.4,
    companies: ['Amazon', 'Microsoft', 'Bloomberg', 'Apple'],
    hints: [
      'Compare nums[mid] with nums[right]. If nums[mid] > nums[right], the minimum MUST reside in right half (left = mid + 1).',
      'Otherwise right = mid.',
    ],
    order: 22,
  },

  // =========================================================================
  // 8. SORTING
  // =========================================================================
  {
    title: 'Merge Intervals',
    slug: 'merge-intervals',
    category: 'Sorting',
    difficulty: 'Medium',
    description: `Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return *an array of the non-overlapping intervals that cover all the intervals in the input*.`,
    examples: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: 'Since intervals [1,3] and [2,6] overlap, merge them into [1,6].' },
      { input: 'intervals = [[1,4],[4,5]]', output: '[[1,5]]' },
    ],
    constraints: [
      '1 <= intervals.length <= 10^4',
      'intervals[i].length == 2',
      '0 <= start_i <= end_i <= 10^4',
    ],
    starterCode: {
      javascript: `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
function merge(intervals) {
  // Write your code here
  
}`,
      python: `class Solution:
    def merge(self, intervals: list[list[int]]) -> list[list[int]]:
        # Write your code here
        pass`,
      java: `class Solution {
    public int[][] merge(int[][] intervals) {
        // Write your code here
        return new int[][]{};
    }
}`,
      cpp: `class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        // Write your code here
        return {};
    }
};`,
    },
    testCases: [
      { input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]', isHidden: false },
      { input: '[[1,4],[4,5]]', expectedOutput: '[[1,5]]', isHidden: false },
      { input: '[[1,4],[0,4]]', expectedOutput: '[[0,4]]', isHidden: true },
    ],
    acceptanceRate: 47.3,
    companies: ['Google', 'Uber', 'Amazon', 'Salesforce'],
    hints: [
      'Sort intervals by start time: intervals.sort((a, b) => a[0] - b[0]).',
      'If current interval start <= previous interval end, merge: prev.end = max(prev.end, curr.end).',
    ],
    order: 23,
  },
  {
    title: 'Sort Colors (Dutch National Flag)',
    slug: 'sort-colors',
    category: 'Sorting',
    difficulty: 'Medium',
    description: `Given an array \`nums\` with \`n\` objects colored red, white, or blue, sort them **in-place** so that objects of the same color are adjacent, with the colors in the order red, white, and blue.

We will use the integers \`0\`, \`1\`, and \`2\` to represent the color red, white, and blue, respectively.

You must solve this problem without using the library's sort function in **O(n)** time and **O(1)** extra space.`,
    examples: [
      { input: 'nums = [2,0,2,1,1,0]', output: '[0,0,1,1,2,2]' },
      { input: 'nums = [2,0,1]', output: '[0,1,2]' },
    ],
    constraints: [
      'n == nums.length',
      '1 <= n <= 300',
      'nums[i] is either 0, 1, or 2.',
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number[]}
 */
function sortColors(nums) {
  // Write your code here (return sorted array)
  
}`,
      python: `class Solution:
    def sortColors(self, nums: list[int]) -> list[int]:
        # Write your code here
        pass`,
      java: `class Solution {
    public int[] sortColors(int[] nums) {
        // Write your code here
        return nums;
    }
}`,
      cpp: `class Solution {
public:
    vector<int> sortColors(vector<int>& nums) {
        // Write your code here
        return nums;
    }
};`,
    },
    testCases: [
      { input: '[2,0,2,1,1,0]', expectedOutput: '[0,0,1,1,2,2]', isHidden: false },
      { input: '[2,0,1]', expectedOutput: '[0,1,2]', isHidden: false },
      { input: '[0]', expectedOutput: '[0]', isHidden: true },
    ],
    acceptanceRate: 61.9,
    companies: ['Microsoft', 'Apple', 'Amazon', 'Paypal'],
    hints: [
      'Dijkstra\'s Dutch National Flag partition algorithm.',
      'Maintain three pointers: low = 0, mid = 0, high = n - 1. Swap nums[mid] == 0 with low, and nums[mid] == 2 with high.',
    ],
    order: 24,
  },
  {
    title: 'Top K Frequent Elements',
    slug: 'top-k-frequent-elements',
    category: 'Sorting',
    difficulty: 'Medium',
    description: `Given an integer array \`nums\` and an integer \`k\`, return *the \`k\` most frequent elements*. You may return the answer in **any order**.`,
    examples: [
      { input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1,2]' },
      { input: 'nums = [1], k = 1', output: '[1]' },
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
      'k is in the range [1, the number of unique elements in the array].',
      'It is guaranteed that the answer is unique.',
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number[]}
 */
function topKFrequent(nums, k) {
  // Write your code here
  
}`,
      python: `class Solution:
    def topKFrequent(self, nums: list[int], k: int) -> list[int]:
        # Write your code here
        pass`,
      java: `class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        // Write your code here
        return new int[]{};
    }
}`,
      cpp: `class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        // Write your code here
        return {};
    }
};`,
    },
    testCases: [
      { input: '[1,1,1,2,2,3]\n2', expectedOutput: '[1,2]', isHidden: false },
      { input: '[1]\n1', expectedOutput: '[1]', isHidden: false },
      { input: '[4,1,-1,2,-1,2,3]\n2', expectedOutput: '[-1,2]', isHidden: true },
    ],
    acceptanceRate: 64.1,
    companies: ['Amazon', 'Meta', 'Google', 'Uber'],
    hints: [
      'Count frequencies using a Hash Map.',
      'Bucket Sort approach achieves O(N) linear time: create array of buckets where index = frequency.',
    ],
    order: 25,
  },

  // =========================================================================
  // 9. DYNAMIC PROGRAMMING
  // =========================================================================
  {
    title: 'Maximum Subarray (Kadane\'s Algorithm)',
    slug: 'maximum-subarray',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return *its sum*.`,
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
      { input: 'nums = [1]', output: '1' },
      { input: 'nums = [5,4,-1,7,8]', output: '23' },
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
  // Write your code here
  
}`,
      python: `class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        # Write your code here
        pass`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Write your code here
        return 0;
    }
}`,
      cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Write your code here
        return 0;
    }
};`,
    },
    testCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6', isHidden: false },
      { input: '[1]', expectedOutput: '1', isHidden: false },
      { input: '[5,4,-1,7,8]', expectedOutput: '23', isHidden: false },
      { input: '[-1]', expectedOutput: '-1', isHidden: true },
    ],
    acceptanceRate: 63.4,
    companies: ['Microsoft', 'Apple', 'LinkedIn', 'Amazon'],
    hints: [
      'Kadane\'s Algorithm: currentSum = max(nums[i], currentSum + nums[i]).',
    ],
    order: 26,
  },
  {
    title: 'Climbing Stairs',
    slug: 'climbing-stairs',
    category: 'Dynamic Programming',
    difficulty: 'Easy',
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    examples: [
      { input: 'n = 2', output: '2', explanation: '1 step + 1 step, or 2 steps.' },
      { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, or 2+1.' },
    ],
    constraints: ['1 <= n <= 45'],
    starterCode: {
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
  // Write your code here
  
}`,
      python: `class Solution:
    def climbStairs(self, n: int) -> int:
        # Write your code here
        pass`,
      java: `class Solution {
    public int climbStairs(int n) {
        // Write your code here
        return 0;
    }
}`,
      cpp: `class Solution {
public:
    int climbStairs(int n) {
        // Write your code here
        return 0;
    }
};`,
    },
    testCases: [
      { input: '2', expectedOutput: '2', isHidden: false },
      { input: '3', expectedOutput: '3', isHidden: false },
      { input: '5', expectedOutput: '8', isHidden: true },
      { input: '8', expectedOutput: '34', isHidden: true },
    ],
    acceptanceRate: 53.7,
    companies: ['Amazon', 'Adobe', 'Apple', 'Google'],
    hints: [
      'Notice that dp[i] = dp[i-1] + dp[i-2], which matches the Fibonacci sequence.',
      'Optimize space to O(1) using two scalar variables.',
    ],
    order: 27,
  },
  {
    title: 'Coin Change',
    slug: 'coin-change',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return *the fewest number of coins that you need to make up that amount*. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.`,
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1' },
      { input: 'coins = [2], amount = 3', output: '-1' },
      { input: 'coins = [1], amount = 0', output: '0' },
    ],
    constraints: [
      '1 <= coins.length <= 12',
      '1 <= coins[i] <= 2^31 - 1',
      '0 <= amount <= 10^4',
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
function coinChange(coins, amount) {
  // Write your code here
  
}`,
      python: `class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        # Write your code here
        pass`,
      java: `class Solution {
    public int coinChange(int[] coins, int amount) {
        // Write your code here
        return -1;
    }
}`,
      cpp: `class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        // Write your code here
        return -1;
    }
};`,
    },
    testCases: [
      { input: '[1,2,5]\n11', expectedOutput: '3', isHidden: false },
      { input: '[2]\n3', expectedOutput: '-1', isHidden: false },
      { input: '[1]\n0', expectedOutput: '0', isHidden: false },
      { input: '[186,419,83,408]\n6249', expectedOutput: '20', isHidden: true },
    ],
    acceptanceRate: 46.7,
    companies: ['Amazon', 'Walmart', 'Goldman Sachs', 'Uber'],
    hints: [
      'Bottom-up Dynamic Programming: let dp[i] be the minimum coins needed for amount i.',
      'Initialize dp array of size amount + 1 with Infinity, dp[0] = 0.',
    ],
    order: 28,
  },
  {
    title: 'House Robber',
    slug: 'house-robber',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    description: `You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed.

Adjacent houses have security systems connected and **it will automatically contact the police if two adjacent houses were broken into on the same night**.

Given an integer array \`nums\` representing the amount of money of each house, return *the maximum amount of money you can rob tonight without alerting the police*.`,
    examples: [
      { input: 'nums = [1,2,3,1]', output: '4', explanation: 'Rob house 1 (money = 1) and rob house 3 (money = 3). Total = 1 + 3 = 4.' },
      { input: 'nums = [2,7,9,3,1]', output: '12', explanation: 'Rob house 1 (2), house 3 (9), house 5 (1). Total = 12.' },
    ],
    constraints: [
      '1 <= nums.length <= 100',
      '0 <= nums[i] <= 400',
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function rob(nums) {
  // Write your code here
  
}`,
      python: `class Solution:
    def rob(self, nums: list[int]) -> int:
        # Write your code here
        pass`,
      java: `class Solution {
    public int rob(int[] nums) {
        // Write your code here
        return 0;
    }
}`,
      cpp: `class Solution {
public:
    int rob(vector<int>& nums) {
        // Write your code here
        return 0;
    }
};`,
    },
    testCases: [
      { input: '[1,2,3,1]', expectedOutput: '4', isHidden: false },
      { input: '[2,7,9,3,1]', expectedOutput: '12', isHidden: false },
      { input: '[2,1,1,2]', expectedOutput: '4', isHidden: true },
    ],
    acceptanceRate: 51.5,
    companies: ['Google', 'Cisco', 'Amazon', 'Airbnb'],
    hints: [
      'Recurrence relation: rob[i] = max(rob[i-1], rob[i-2] + nums[i]).',
      'Can be solved in O(N) time and O(1) space with two variables: prev1 and prev2.',
    ],
    order: 29,
  },

  // =========================================================================
  // 10. GRAPHS
  // =========================================================================
  {
    title: 'Number of Islands',
    slug: 'number-of-islands',
    category: 'Graphs',
    difficulty: 'Medium',
    description: `Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return *the number of islands*.

An **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.`,
    examples: [
      {
        input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
        output: '1',
      },
      {
        input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
        output: '3',
      },
    ],
    constraints: [
      'm == grid.length',
      'n == grid[i].length',
      '1 <= m, n <= 300',
      'grid[i][j] is \'0\' or \'1\'.',
    ],
    starterCode: {
      javascript: `/**
 * @param {character[][]} grid
 * @return {number}
 */
function numIslands(grid) {
  // Write your code here
  
}`,
      python: `class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        # Write your code here
        pass`,
      java: `class Solution {
    public int numIslands(char[][] grid) {
        // Write your code here
        return 0;
    }
}`,
      cpp: `class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        // Write your code here
        return 0;
    }
};`,
    },
    testCases: [
      {
        input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
        expectedOutput: '1',
        isHidden: false,
      },
      {
        input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
        expectedOutput: '3',
        isHidden: false,
      },
      {
        input: '[["1"]]',
        expectedOutput: '1',
        isHidden: true,
      },
    ],
    acceptanceRate: 59.8,
    companies: ['Amazon', 'Google', 'Bloomberg', 'Meta'],
    hints: [
      'Traverse each cell of the grid. When you encounter a \'1\', increment island count and trigger a BFS or DFS.',
      'During DFS, sink the island by changing visited \'1\'s to \'0\'s.',
    ],
    order: 30,
  },
  {
    title: 'Course Schedule',
    slug: 'course-schedule',
    category: 'Graphs',
    difficulty: 'Medium',
    description: `There are a total of \`numCourses\` courses you have to take, labeled from \`0\` to \`numCourses - 1\`. You are given an array \`prerequisites\` where \`prerequisites[i] = [a_i, b_i]\` indicates that you **must** take course \`b_i\` first if you want to take course \`a_i\`.

Return \`true\` if you can finish all courses. Otherwise, return \`false\`.`,
    examples: [
      { input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true', explanation: 'To take course 1 you should have finished course 0. So it is possible.' },
      { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', output: 'false', explanation: 'Circular prerequisite dependency.' },
    ],
    constraints: [
      '1 <= numCourses <= 2000',
      '0 <= prerequisites.length <= 5000',
      'prerequisites[i].length == 2',
      'All the pairs prerequisites[i] are unique.',
    ],
    starterCode: {
      javascript: `/**
 * @param {number} numCourses
 * @param {number[][]} prerequisites
 * @return {boolean}
 */
function canFinish(numCourses, prerequisites) {
  // Write your code here
  
}`,
      python: `class Solution:
    def canFinish(self, numCourses: int, prerequisites: list[list[int]]) -> bool:
        # Write your code here
        pass`,
      java: `class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        // Write your code here
        return false;
    }
}`,
      cpp: `class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        // Write your code here
        return false;
    }
};`,
    },
    testCases: [
      { input: '2\n[[1,0]]', expectedOutput: 'true', isHidden: false },
      { input: '2\n[[1,0],[0,1]]', expectedOutput: 'false', isHidden: false },
      { input: '3\n[[0,1],[0,2],[1,2]]', expectedOutput: 'true', isHidden: true },
    ],
    acceptanceRate: 47.9,
    companies: ['Amazon', 'Google', 'Microsoft', 'Uber'],
    hints: [
      'Model courses as a directed graph where an edge represents a prerequisite dependency.',
      'A cycle means you can never finish the courses. Use Kahn\'s In-Degree BFS algorithm for topological sort.',
    ],
    order: 31,
  },
];
