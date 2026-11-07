export interface RoadmapTask {
  id: string;
  title: string;
  type: 'concept' | 'problem' | 'question' | 'interview' | 'project';
  targetUrl?: string;
  estimatedMinutes: number;
  xpReward: number;
  description: string;
  keyTakeaways?: string[];
}

export interface RoadmapDay {
  dayNumber: number;
  title: string;
  focusArea: string;
  estimatedMinutes: number;
  tasks: RoadmapTask[];
}

export interface RoadmapWeek {
  weekNumber: number;
  title: string;
  focusArea: string;
  milestoneObjective: string;
  days: RoadmapDay[];
}

export interface SeedRoadmap {
  id: string;
  slug: string;
  title: string;
  role: string;
  durationDays: number;
  level: 'Beginner to Intermediate' | 'Intermediate to Advanced' | 'All Levels';
  description: string;
  targetCompanies: string[];
  icon: string;
  badgeColor: string;
  totalTasks: number;
  totalXp: number;
  weeks: RoadmapWeek[];
}

// Helper to create tasks quickly
const makeTask = (
  id: string,
  title: string,
  type: RoadmapTask['type'],
  targetUrl: string,
  min: number,
  xp: number,
  desc: string,
  tips?: string[]
): RoadmapTask => ({
  id,
  title,
  type,
  targetUrl,
  estimatedMinutes: min,
  xpReward: xp,
  description: desc,
  keyTakeaways: tips,
});

// =========================================================================
// 1. FULL STACK DEVELOPER (COMPLETE 30-DAY PLACEMENT SPRINT)
// =========================================================================
const fullStackDays: RoadmapDay[] = [
  // Week 1 (Days 1-7)
  {
    dayNumber: 1,
    title: 'JavaScript Runtime, Call Stack & Event Loop',
    focusArea: 'JS Internals',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d1-t1', 'Review Event Loop, Microtask Queue & Promises', 'concept', '/questions', 30, 30, 'Understand how Call Stack, Web APIs, Microtasks, and Callback Queue interact.'),
      makeTask('fs-d1-t2', 'Practice: Two Sum & Array Hash Maps', 'problem', '/problems/two-sum', 30, 40, 'Implement optimal O(n) hash map lookup in JavaScript.'),
    ],
  },
  {
    dayNumber: 2,
    title: 'Closures, Lexical Scope & Prototype Chain',
    focusArea: 'JS Engine',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d2-t1', 'Master Lexical Scoping and Prototype Inheritance', 'question', '/questions', 30, 30, 'Deep dive into prototype chaining, closures, and currying.'),
      makeTask('fs-d2-t2', 'Practice: Valid Palindrome Two Pointers', 'problem', '/problems/valid-palindrome', 30, 40, 'In-place alphanumeric pointer scan without extra memory.'),
    ],
  },
  {
    dayNumber: 3,
    title: 'Asynchronous JS, Promises & Error Handling',
    focusArea: 'Async Architecture',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d3-t1', 'Promise.all, allSettled, race & Error Propagation', 'concept', '/questions', 30, 30, 'Concurrent promise execution and graceful async rejection handling.'),
      makeTask('fs-d3-t2', 'Practice: Longest Substring Without Repeating Characters', 'problem', '/problems/longest-substring-without-repeating-characters', 30, 45, 'Sliding window technique using Set/Map in JS.'),
    ],
  },
  {
    dayNumber: 4,
    title: 'TypeScript Generics, Type Guards & Utility Types',
    focusArea: 'TypeScript',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d4-t1', 'Master Generics, Union Types, Type Guards & Pick/Omit', 'question', '/questions', 30, 30, 'Learn keyof, typeof, conditional types, and utility types in TS.'),
      makeTask('fs-d4-t2', 'Practice: Valid Parentheses Stack Logic', 'problem', '/problems/valid-parentheses', 30, 40, 'Validate bracket pairs with stack data structure.'),
    ],
  },
  {
    dayNumber: 5,
    title: 'React Fiber Architecture & Virtual DOM Diffing',
    focusArea: 'React Internals',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d5-t1', 'Virtual DOM Diffing & Component Lifecycle', 'concept', '/questions', 30, 30, 'Understand O(n) heuristic diffing, reconciliation, and key attributes.'),
      makeTask('fs-d5-t2', 'Practice: Reverse Linked List (In-Place)', 'problem', '/problems/reverse-linked-list', 30, 40, 'Iterative 3-pointer list reversal.'),
    ],
  },
  {
    dayNumber: 6,
    title: 'React Hooks Mastery & Performance Profiling',
    focusArea: 'React Performance',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d6-t1', 'useMemo, useCallback, React.memo & Re-render Prevention', 'concept', '/questions', 30, 30, 'Profile expensive renders and avoid memory leaks in hooks.'),
      makeTask('fs-d6-t2', 'Practice: Merge Two Sorted Lists', 'problem', '/problems/merge-two-sorted-lists', 30, 40, 'Merge linked lists using dummy head pointer.'),
    ],
  },
  {
    dayNumber: 7,
    title: 'Week 1 Frontend Checkpoint & AI Mock Interview',
    focusArea: 'Frontend Milestone',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d7-t1', 'AI Mock Interview: Frontend Core Checkpoint', 'interview', '/mock-interview', 45, 60, 'Complete a 5-question AI technical round focused on JavaScript and React.'),
      makeTask('fs-d7-t2', 'Review Week 1 Placement Analytics', 'concept', '/analytics', 15, 25, 'Inspect topic radar and verify skill breakdown.'),
    ],
  },

  // Week 2 (Days 8-14)
  {
    dayNumber: 8,
    title: 'Node.js Architecture & Libuv Thread Pool',
    focusArea: 'Node.js Core',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d8-t1', 'Understand Node.js Single Thread & Libuv Worker Threads', 'concept', '/questions', 30, 30, 'How Libuv handles crypto, fs, and zlib asynchronously.'),
      makeTask('fs-d8-t2', 'Practice: Binary Search in Sorted Array', 'problem', '/problems/binary-search', 30, 40, 'Logarithmic halving avoiding integer overflow.'),
    ],
  },
  {
    dayNumber: 9,
    title: 'Express Middleware & Centralized Error Handling',
    focusArea: 'Backend APIs',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d9-t1', 'Middleware Chaining, CORS & Custom Error Handlers', 'concept', '/placement-modules', 30, 30, 'Structure clean middleware layers with unified error formatting.'),
      makeTask('fs-d9-t2', 'Practice: Maximum Subarray (Kadane’s)', 'problem', '/problems/maximum-subarray', 30, 45, 'Solve Kadane’s dynamic scan in O(n) time.'),
    ],
  },
  {
    dayNumber: 10,
    title: 'RESTful API Standards & Idempotency Rules',
    focusArea: 'API Design',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d10-t1', 'PUT vs PATCH, Idempotency & HTTP Status Codes', 'question', '/questions', 30, 30, 'Design REST endpoints compliant with Tier-1 engineering standards.'),
      makeTask('fs-d10-t2', 'Practice: Best Time to Buy and Sell Stock', 'problem', '/problems/best-time-to-buy-and-sell-stock', 30, 40, 'Single-pass min price tracker.'),
    ],
  },
  {
    dayNumber: 11,
    title: 'Relational Modeling & Advanced SQL Queries',
    focusArea: 'Databases',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d11-t1', 'SQL Joins, Group By, Having & Window Functions', 'concept', '/questions?category=Database', 30, 35, 'Write complex relational queries and aggregation pipelines.'),
      makeTask('fs-d11-t2', 'Practice: Climbing Stairs (1D DP)', 'problem', '/problems/climbing-stairs', 30, 40, 'Dynamic programming recurrence with constant space.'),
    ],
  },
  {
    dayNumber: 12,
    title: 'Database Indexing Internals (B+ Trees)',
    focusArea: 'Database Performance',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d12-t1', 'B+ Trees, Composite Indexes & Query Optimization', 'question', '/questions', 30, 35, 'How B+ trees provide O(log n) lookups and index tradeoffs.'),
      makeTask('fs-d12-t2', 'Practice: Maximum Depth of Binary Tree', 'problem', '/problems/maximum-depth-of-binary-tree', 30, 40, 'Recursive tree height calculation.'),
    ],
  },
  {
    dayNumber: 13,
    title: 'Database Transactions & ACID Guarantees',
    focusArea: 'Concurrency & ACID',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d13-t1', 'Isolation Levels, Dirty Reads & Phantom Reads', 'concept', '/questions', 30, 35, 'Compare Read Committed, Repeatable Read, and Serializable.'),
      makeTask('fs-d13-t2', 'Practice: Invert Binary Tree', 'problem', '/problems/invert-binary-tree', 30, 40, 'Classic tree mirror inversion recurrence.'),
    ],
  },
  {
    dayNumber: 14,
    title: 'Week 2 Backend Checkpoint & AI Mock Interview',
    focusArea: 'Backend Milestone',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d14-t1', 'AI Mock Interview: Backend & DB Round', 'interview', '/mock-interview', 45, 60, '5-question AI interview evaluating Node.js and SQL/NoSQL systems.'),
      makeTask('fs-d14-t2', 'Check Mid-Sprint Placement Score', 'concept', '/analytics', 15, 25, 'Track readiness progression and badge unlocks.'),
    ],
  },

  // Week 3 (Days 15-21)
  {
    dayNumber: 15,
    title: 'Horizontal Scaling & Load Balancing (L4 vs L7)',
    focusArea: 'System Architecture',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d15-t1', 'Round Robin, Least Connections & Consistent Hashing', 'concept', '/placement-modules', 30, 35, 'Understand consistent hashing rings and sticky sessions.'),
      makeTask('fs-d15-t2', 'Practice: Coin Change (Dynamic Programming)', 'problem', '/problems/coin-change', 30, 50, 'Unbounded knapsack dynamic programming formulation.'),
    ],
  },
  {
    dayNumber: 16,
    title: 'Distributed Caching Strategies with Redis',
    focusArea: 'Caching Systems',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d16-t1', 'Cache-Aside, Write-Through, Invalidation & LRU Eviction', 'question', '/questions', 30, 35, 'Prevent cache penetration, stampede, and memory bloat.'),
      makeTask('fs-d16-t2', 'Practice: Two Sum II (Sorted Two Pointers)', 'problem', '/problems/two-sum', 30, 40, 'In-place two-pointer convergence.'),
    ],
  },
  {
    dayNumber: 17,
    title: 'Rate Limiting Algorithms & DDoS Protection',
    focusArea: 'API Security',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d17-t1', 'Token Bucket vs Leaky Bucket Algorithms', 'concept', '/questions', 30, 35, 'Implement sliding window rate limiting using Redis.'),
      makeTask('fs-d17-t2', 'Practice: Longest Substring Review', 'problem', '/problems/longest-substring-without-repeating-characters', 30, 40, 'Window expansion and contraction conditions.'),
    ],
  },
  {
    dayNumber: 18,
    title: 'Authentication & Security: JWT vs Sessions',
    focusArea: 'Auth Architecture',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d18-t1', 'Stateless JWTs, Refresh Tokens & XSS/CSRF Defenses', 'question', '/questions', 30, 35, 'Security review of HttpOnly cookies and token revocation.'),
      makeTask('fs-d18-t2', 'Practice: Valid Parentheses Stack Deep Dive', 'problem', '/problems/valid-parentheses', 30, 40, 'Complex string expressions and edge cases.'),
    ],
  },
  {
    dayNumber: 19,
    title: 'Message Queues & Asynchronous Processing',
    focusArea: 'Distributed Messaging',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d19-t1', 'Kafka vs RabbitMQ: Event Streams vs Message Queues', 'concept', '/placement-modules', 30, 35, 'Consumer groups, partition keys, and at-least-once delivery.'),
      makeTask('fs-d19-t2', 'Practice: Maximum Subarray Divide & Conquer', 'problem', '/problems/maximum-subarray', 30, 45, 'Analyze O(n log n) divide-and-conquer vs O(n) Kadane.'),
    ],
  },
  {
    dayNumber: 20,
    title: 'System Design Case: URL Shortener (Bitly)',
    focusArea: 'High-Level Design',
    estimatedMinutes: 75,
    tasks: [
      makeTask('fs-d20-t1', 'Capacity Planning, Base62 Encoding & Caching Tier', 'concept', '/placement-modules', 45, 45, 'Estimate QPS, storage requirements, and distributed ID generation.'),
      makeTask('fs-d20-t2', 'Practice: Reverse Linked List Recursive vs Iterative', 'problem', '/problems/reverse-linked-list', 30, 40, 'Compare recursive stack space O(n) with iterative O(1).'),
    ],
  },
  {
    dayNumber: 21,
    title: 'Week 3 System Design AI Mock Interview',
    focusArea: 'Architecture Milestone',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d21-t1', 'AI Mock Interview: System Design & Scalability', 'interview', '/mock-interview', 45, 75, 'Present architectural trade-offs to AI interview panel.'),
      makeTask('fs-d21-t2', 'Review System Design Radar Scores', 'concept', '/analytics', 15, 25, 'Inspect multi-dimensional competence chart.'),
    ],
  },

  // Week 4 (Days 22-28)
  {
    dayNumber: 22,
    title: 'High-Speed Coding: Linear Patterns Sprint',
    focusArea: 'Coding Speed',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d22-t1', 'Practice: Best Time to Buy and Sell Stock', 'problem', '/problems/best-time-to-buy-and-sell-stock', 30, 40, 'Speed drill: code optimal solution under 15 minutes.'),
      makeTask('fs-d22-t2', 'Inspect AI Code Complexity Analysis', 'concept', '/coding', 30, 30, 'Verify Big-O reasoning and clean code suggestions.'),
    ],
  },
  {
    dayNumber: 23,
    title: 'High-Speed Coding: Binary Search & Monotonic Spaces',
    focusArea: 'Logarithmic Algorithms',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d23-t1', 'Practice: Binary Search Boundary Handling', 'problem', '/problems/binary-search', 30, 40, 'Handle lower bound, upper bound, and duplicate elements.'),
      makeTask('fs-d23-t2', 'Review Top Search Questions', 'question', '/questions', 30, 30, 'Answer binary search on answer spaces questions.'),
    ],
  },
  {
    dayNumber: 24,
    title: 'High-Speed Coding: Trees & Graph Traversals',
    focusArea: 'Trees & Graphs',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d24-t1', 'Practice: Maximum Depth of Binary Tree', 'problem', '/problems/maximum-depth-of-binary-tree', 30, 40, 'Recursive DFS vs iterative queue-based BFS.'),
      makeTask('fs-d24-t2', 'Practice: Invert Binary Tree', 'problem', '/problems/invert-binary-tree', 30, 40, 'Invert tree nodes in-place under 15 minutes.'),
    ],
  },
  {
    dayNumber: 25,
    title: 'High-Speed Coding: Dynamic Programming Sprint',
    focusArea: 'DP Optimization',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d25-t1', 'Practice: Climbing Stairs Space Optimization', 'problem', '/problems/climbing-stairs', 30, 40, 'Reduce memory from O(n) array to two variables O(1).'),
      makeTask('fs-d25-t2', 'Practice: Coin Change DP Table', 'problem', '/problems/coin-change', 30, 50, 'Build bottom-up array and explain unreachable states (-1).'),
    ],
  },
  {
    dayNumber: 26,
    title: 'Web Performance Optimization & Core Web Vitals',
    focusArea: 'Frontend Production',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d26-t1', 'LCP, FID/INP, CLS & Code Splitting Strategies', 'concept', '/questions', 30, 35, 'Optimize bundle size, lazy loading, and asset compression.'),
      makeTask('fs-d26-t2', 'Practice: Merge Two Sorted Lists Optimal', 'problem', '/problems/merge-two-sorted-lists', 30, 40, 'Clean pointer recombination.'),
    ],
  },
  {
    dayNumber: 27,
    title: 'Behavioral & Leadership Rounds (STAR Framework)',
    focusArea: 'HR & Behavioral',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d27-t1', 'Prepare Situation, Task, Action & Result Stories', 'question', '/questions?category=Behavioral', 30, 35, 'Structure stories for technical disagreements and failures.'),
      makeTask('fs-d27-t2', 'AI Mock Interview: HR & Cultural Fit Round', 'interview', '/mock-interview', 30, 50, 'Practice speaking aloud to AI evaluator.'),
    ],
  },
  {
    dayNumber: 28,
    title: 'Full Placement Round 1 Simulation Contest',
    focusArea: 'Campus Contest',
    estimatedMinutes: 75,
    tasks: [
      makeTask('fs-d28-t1', 'Timed Multi-Question Practice Challenge', 'problem', '/coding', 45, 60, 'Solve 2 problems consecutively within 45-minute timer.'),
      makeTask('fs-d28-t2', 'AI Code Complexity & Quality Review', 'concept', '/coding', 30, 35, 'Review algorithmic efficiency ratings across solutions.'),
    ],
  },

  // Final Placement Sprint (Days 29-30)
  {
    dayNumber: 29,
    title: 'Full Stack Machine Coding & Architecture Round',
    focusArea: 'Machine Coding',
    estimatedMinutes: 90,
    tasks: [
      makeTask('fs-d29-t1', 'Full Length Technical Placement AI Mock Round', 'interview', '/mock-interview', 60, 100, 'Complete rigorous 5-question comprehensive technical interview.'),
      makeTask('fs-d29-t2', 'Review Evaluation Report & Model Answers', 'concept', '/interviews', 30, 40, 'Study AI recruiter feedback and campus model answers.'),
    ],
  },
  {
    dayNumber: 30,
    title: 'Final Placement Readiness & Tier-1 Certification',
    focusArea: 'Placement Ready',
    estimatedMinutes: 60,
    tasks: [
      makeTask('fs-d30-t1', 'Comprehensive Analytics & Badge Verification', 'concept', '/analytics', 30, 50, 'Verify placement readiness index and unlock Tier-1 badge.'),
      makeTask('fs-d30-t2', 'Resume & Project Architecture Checklist Review', 'concept', '/placement-modules', 30, 50, 'Final campus checklist for Tier-1 engineering placement day.'),
    ],
  },
];

// Helper to group 30 days into 4 clean weeks
const groupDaysIntoWeeks = (days: RoadmapDay[], weekTitles: string[]): RoadmapWeek[] => [
  {
    weekNumber: 1,
    title: weekTitles[0] || 'Week 1: Core Foundations & Coding Basics',
    focusArea: 'Fundamentals',
    milestoneObjective: 'Master core language syntax, linear data structures, and foundational problem solving.',
    days: days.slice(0, 7),
  },
  {
    weekNumber: 2,
    title: weekTitles[1] || 'Week 2: Advanced Data Structures & Backend APIs',
    focusArea: 'Core Systems',
    milestoneObjective: 'Build resilient API services, database indexing, and non-linear data structures.',
    days: days.slice(7, 14),
  },
  {
    weekNumber: 3,
    title: weekTitles[2] || 'Week 3: System Design, Scalability & Caching',
    focusArea: 'Architecture & Scaling',
    milestoneObjective: 'Design distributed architectures, handle caching, and evaluate high-level trade-offs.',
    days: days.slice(14, 21),
  },
  {
    weekNumber: 4,
    title: weekTitles[3] || 'Week 4: Placement Drills, Contest Contests & Final Rounds',
    focusArea: 'Placement Simulation',
    milestoneObjective: 'Execute time-bound placement coding rounds, behavioral STAR answers, and campus mocks.',
    days: days.slice(21, 30), // Days 22-30 (9 comprehensive days)
  },
];

// =========================================================================
// 2. DATA STRUCTURES & ALGORITHMS (30-DAY LEETCODE MASTERY)
// =========================================================================
const dsaDays: RoadmapDay[] = [
  // Week 1 (Days 1-7): Arrays, Strings, Two Pointers, Binary Search
  {
    dayNumber: 1,
    title: 'Two Pointers & Array Hash Mapping',
    focusArea: 'Arrays',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d1-t1', 'Practice: Two Sum (Hash Map Lookup)', 'problem', '/problems/two-sum', 30, 40, 'Optimal O(n) hash table lookup.'),
      makeTask('dsa-d1-t2', 'Two Pointers Concept Review', 'concept', '/questions', 30, 30, 'Left and right pointer convergence rules.'),
    ],
  },
  {
    dayNumber: 2,
    title: 'Valid Palindromes & String Invariants',
    focusArea: 'Strings',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d2-t1', 'Practice: Valid Palindrome Two Pointers', 'problem', '/problems/valid-palindrome', 30, 40, 'In-place alphanumeric filtering.'),
      makeTask('dsa-d2-t2', 'String Manipulation & Memory Allocation', 'question', '/questions', 30, 30, 'Immutable strings vs string builders.'),
    ],
  },
  {
    dayNumber: 3,
    title: 'Subarray Scans & Kadane’s Algorithm',
    focusArea: 'Prefix / Dynamic Scan',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d3-t1', 'Practice: Maximum Subarray (Kadane’s)', 'problem', '/problems/maximum-subarray', 30, 45, 'Local maximum vs global maximum DP formulation.'),
      makeTask('dsa-d3-t2', 'Prefix Sums & Range Sum Queries', 'concept', '/placement-modules', 30, 30, 'O(1) range sum lookups.'),
    ],
  },
  {
    dayNumber: 4,
    title: 'Greedy Scans & Single-Pass Optimization',
    focusArea: 'Greedy',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d4-t1', 'Practice: Best Time to Buy and Sell Stock', 'problem', '/problems/best-time-to-buy-and-sell-stock', 30, 40, 'Single-pass min price tracker.'),
      makeTask('dsa-d4-t2', 'Greedy vs Dynamic Programming Comparison', 'question', '/questions', 30, 30, 'When greedy choice property holds.'),
    ],
  },
  {
    dayNumber: 5,
    title: 'Sliding Window: Variable Window Lengths',
    focusArea: 'Sliding Window',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d5-t1', 'Practice: Longest Substring Without Repeating', 'problem', '/problems/longest-substring-without-repeating-characters', 30, 45, 'Set/Map frequency tracking in window.'),
      makeTask('dsa-d5-t2', 'Sliding Window Template Patterns', 'concept', '/placement-modules', 30, 30, 'Master the canonical expand-and-shrink loop.'),
    ],
  },
  {
    dayNumber: 6,
    title: 'Logarithmic Halving: Binary Search Basics',
    focusArea: 'Binary Search',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d6-t1', 'Practice: Binary Search Core', 'problem', '/problems/binary-search', 30, 40, 'Avoiding integer overflow with left + (right - left) / 2.'),
      makeTask('dsa-d6-t2', 'Search Space Bounds & Termination', 'question', '/questions', 30, 30, 'While left <= right vs while left < right.'),
    ],
  },
  {
    dayNumber: 7,
    title: 'Week 1 Algorithmic Checkpoint & Mock Round',
    focusArea: 'Week 1 Review',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d7-t1', 'AI Mock Interview: Linear DSA Round', 'interview', '/mock-interview', 45, 60, 'Explain Big-O trade-offs to AI evaluator.'),
      makeTask('dsa-d7-t2', 'Review Problem Solutions & Complexity', 'concept', '/coding', 15, 25, 'Inspect verified optimal solutions.'),
    ],
  },

  // Week 2 (Days 8-14): Linked Lists, Stacks, Queues, Recursion
  {
    dayNumber: 8,
    title: 'Linked List In-Place Pointer Mutations',
    focusArea: 'Linked Lists',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d8-t1', 'Practice: Reverse Linked List', 'problem', '/problems/reverse-linked-list', 30, 40, '3-pointer reversal (prev, curr, next).'),
      makeTask('dsa-d8-t2', 'Fast & Slow Pointer Technique', 'concept', '/placement-modules', 30, 30, 'Floyd’s cycle detection algorithm.'),
    ],
  },
  {
    dayNumber: 9,
    title: 'Dummy Head Nodes & List Combinations',
    focusArea: 'Linked Lists',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d9-t1', 'Practice: Merge Two Sorted Lists', 'problem', '/problems/merge-two-sorted-lists', 30, 40, 'Dummy sentinel pointer pattern.'),
      makeTask('dsa-d9-t2', 'Memory Locality: Arrays vs Linked Lists', 'question', '/questions', 30, 30, 'CPU cache lines and pointer hopping overhead.'),
    ],
  },
  {
    dayNumber: 10,
    title: 'Stack LIFO Invariants & Parentheses',
    focusArea: 'Stacks',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d10-t1', 'Practice: Valid Parentheses', 'problem', '/problems/valid-parentheses', 30, 40, 'Stack bracket matching with Map.'),
      makeTask('dsa-d10-t2', 'Monotonic Stack Principles', 'concept', '/placement-modules', 30, 30, 'Next Greater Element in O(n) time.'),
    ],
  },
  {
    dayNumber: 11,
    title: 'Recursion Call Stack & Base Cases',
    focusArea: 'Recursion',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d11-t1', 'Call Stack Frames & Memory Limits', 'concept', '/questions', 30, 30, 'StackOverflowError causes and tail-call optimization.'),
      makeTask('dsa-d11-t2', 'Practice: Climbing Stairs Recursive Scan', 'problem', '/problems/climbing-stairs', 30, 40, 'From exponential recursion to linear DP.'),
    ],
  },
  {
    dayNumber: 12,
    title: 'Queues & BFS Level Order Fundamentals',
    focusArea: 'Queues',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d12-t1', 'FIFO Queue Implementation & Circular Buffers', 'concept', '/questions', 30, 30, 'Array-based vs linked-list-based queues.'),
      makeTask('dsa-d12-t2', 'Practice: Maximum Depth of Binary Tree (BFS)', 'problem', '/problems/maximum-depth-of-binary-tree', 30, 40, 'Iterative queue level traversal.'),
    ],
  },
  {
    dayNumber: 13,
    title: 'Backtracking: Permutations & Subsets',
    focusArea: 'Backtracking',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d13-t1', 'Backtracking State Space Trees', 'concept', '/placement-modules', 30, 35, 'Choose, explore, un-choose paradigm.'),
      makeTask('dsa-d13-t2', 'Practice: Invert Binary Tree', 'problem', '/problems/invert-binary-tree', 30, 40, 'Recursive subtree swaps.'),
    ],
  },
  {
    dayNumber: 14,
    title: 'Week 2 Non-Linear Checkpoint & AI Mock',
    focusArea: 'Week 2 Review',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d14-t1', 'AI Mock Interview: Lists, Stacks & Recursion', 'interview', '/mock-interview', 45, 60, 'Defend recursive call stack depth in interviews.'),
      makeTask('dsa-d14-t2', 'Check Topic Mastery Radar', 'concept', '/analytics', 15, 25, 'Verify non-linear structures mastery score.'),
    ],
  },

  // Week 3 (Days 15-21): Trees, BST, Heaps, Graphs
  {
    dayNumber: 15,
    title: 'Binary Tree Traversals (Inorder, Preorder, Postorder)',
    focusArea: 'Binary Trees',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d15-t1', 'Tree Traversals: DFS vs BFS', 'concept', '/questions', 30, 35, 'Tree decomposition and structural recursion.'),
      makeTask('dsa-d15-t2', 'Practice: Maximum Depth of Binary Tree', 'problem', '/problems/maximum-depth-of-binary-tree', 30, 40, 'Divide and conquer height formula.'),
    ],
  },
  {
    dayNumber: 16,
    title: 'Binary Search Trees (BST) Invariants',
    focusArea: 'BST',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d16-t1', 'BST Search, Insertion & Deletion O(log n)', 'concept', '/placement-modules', 30, 35, 'Inorder traversal yields sorted sequence.'),
      makeTask('dsa-d16-t2', 'Practice: Invert Binary Tree Speed Drill', 'problem', '/problems/invert-binary-tree', 30, 40, 'Recursive tree mutation under 10 minutes.'),
    ],
  },
  {
    dayNumber: 17,
    title: 'Heaps & Priority Queues (Min-Heap, Max-Heap)',
    focusArea: 'Heaps',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d17-t1', 'Binary Heap Array Representation & Sift-Up/Down', 'concept', '/questions', 30, 35, 'Top K elements in O(n log k) using min-heap.'),
      makeTask('dsa-d17-t2', 'Practice: Two Sum Optimal Hash Map', 'problem', '/problems/two-sum', 30, 40, 'Speed review without hesitation.'),
    ],
  },
  {
    dayNumber: 18,
    title: 'Graph Representation: Adjacency List & Matrix',
    focusArea: 'Graphs',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d18-t1', 'Adjacency Lists, Directed vs Undirected Graphs', 'concept', '/placement-modules', 30, 35, 'Visited sets to prevent infinite loops in cycles.'),
      makeTask('dsa-d18-t2', 'Practice: Binary Search on Rotated Arrays', 'problem', '/problems/binary-search', 30, 40, 'Finding sorted half.'),
    ],
  },
  {
    dayNumber: 19,
    title: 'Graph BFS: Shortest Path in Unweighted Graphs',
    focusArea: 'Graph BFS',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d19-t1', 'Queue-Based Graph BFS & Level Counting', 'concept', '/placement-modules', 30, 35, 'Shortest path guarantee of BFS.'),
      makeTask('dsa-d19-t2', 'Practice: Coin Change DP Solution', 'problem', '/problems/coin-change', 30, 50, 'Minimum coins for target amount.'),
    ],
  },
  {
    dayNumber: 20,
    title: 'Graph DFS: Connected Components & Cycle Detection',
    focusArea: 'Graph DFS',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d20-t1', 'Cycle Detection (Directed vs Undirected) & Kahn’s Algorithm', 'concept', '/questions', 30, 35, 'Topological sorting with in-degrees.'),
      makeTask('dsa-d20-t2', 'Practice: Valid Parentheses Edge Cases', 'problem', '/problems/valid-parentheses', 30, 40, 'Unmatched closing brackets and empty strings.'),
    ],
  },
  {
    dayNumber: 21,
    title: 'Week 3 Trees & Graphs AI Mock Interview',
    focusArea: 'Week 3 Review',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d21-t1', 'AI Mock Interview: Trees & Graphs Round', 'interview', '/mock-interview', 45, 75, 'Explain graph complexity O(V + E) verbally.'),
      makeTask('dsa-d21-t2', 'Review Algorithm Radar Metrics', 'concept', '/analytics', 15, 25, 'Track mastery progression.'),
    ],
  },

  // Week 4 (Days 22-28): Dynamic Programming Mastery
  {
    dayNumber: 22,
    title: 'Dynamic Programming: Memoization vs Tabulation',
    focusArea: 'DP Principles',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d22-t1', 'Overlapping Subproblems & Optimal Substructure', 'concept', '/placement-modules', 30, 35, 'Top-down with cache vs bottom-up iterative table.'),
      makeTask('dsa-d22-t2', 'Practice: Climbing Stairs (Bottom-Up)', 'problem', '/problems/climbing-stairs', 30, 40, 'dp[i] = dp[i-1] + dp[i-2] state transition.'),
    ],
  },
  {
    dayNumber: 23,
    title: '1D DP: Maximum Subarray & Knapsack Formulations',
    focusArea: '1D DP',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d23-t1', 'Practice: Maximum Subarray Kadane Proof', 'problem', '/problems/maximum-subarray', 30, 45, 'Local choice vs global optimum.'),
      makeTask('dsa-d23-t2', '0/1 Knapsack State Space Formulation', 'concept', '/questions', 30, 35, 'Include vs exclude recurrence.'),
    ],
  },
  {
    dayNumber: 24,
    title: 'Unbounded Knapsack & Coin Change DP',
    focusArea: 'DP Knapsack',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d24-t1', 'Practice: Coin Change Minimum Coins', 'problem', '/problems/coin-change', 30, 50, 'Formulate dp[amount] using coin options.'),
      makeTask('dsa-d24-t2', 'Coin Change 2: Number of Ways', 'concept', '/placement-modules', 30, 35, 'Order of loops preventing duplicate combinations.'),
    ],
  },
  {
    dayNumber: 25,
    title: 'Longest Common Subsequence (2D DP)',
    focusArea: '2D DP',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d25-t1', 'LCS Table Construction & String Matching', 'concept', '/questions', 30, 35, 'dp[i][j] matching characters vs diagonal transitions.'),
      makeTask('dsa-d25-t2', 'Practice: Best Time to Buy and Sell Stock', 'problem', '/problems/best-time-to-buy-and-sell-stock', 30, 40, 'State transition with buy/sell flags.'),
    ],
  },
  {
    dayNumber: 26,
    title: 'Greedy Strategies vs Interval Scheduling',
    focusArea: 'Greedy Intervals',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d26-t1', 'Interval Merging & Activity Selection Algorithm', 'concept', '/questions', 30, 35, 'Sorting by start time vs end time.'),
      makeTask('dsa-d26-t2', 'Practice: Merge Two Sorted Lists Sentinel', 'problem', '/problems/merge-two-sorted-lists', 30, 40, 'In-place pointer splicing.'),
    ],
  },
  {
    dayNumber: 27,
    title: 'Bit Manipulation & Low-Level Math Tricks',
    focusArea: 'Bitwise',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d27-t1', 'Bitwise AND, OR, XOR & Bit Shifting', 'concept', '/questions', 30, 35, 'XOR properties: x ^ x = 0, x ^ 0 = x for single number.'),
      makeTask('dsa-d27-t2', 'Practice: Binary Search Bit Shift Mid', 'problem', '/problems/binary-search', 30, 40, 'Using (left + right) >>> 1 for unsigned mid.'),
    ],
  },
  {
    dayNumber: 28,
    title: 'High-Pressure Timed Placement OA Simulation',
    focusArea: 'Campus Contest',
    estimatedMinutes: 75,
    tasks: [
      makeTask('dsa-d28-t1', 'Solve 2 LeetCode Mediums under 45 mins', 'problem', '/coding', 45, 60, 'Time-bound simulation replicating Goldman Sachs & Amazon OA.'),
      makeTask('dsa-d28-t2', 'AI Code Complexity Inspector', 'concept', '/coding', 30, 35, 'Inspect Big-O time and space proofs.'),
    ],
  },

  // Final Placement Sprint (Days 29-30)
  {
    dayNumber: 29,
    title: 'Comprehensive DSA Placement AI Mock Round',
    focusArea: 'Final Mock',
    estimatedMinutes: 90,
    tasks: [
      makeTask('dsa-d29-t1', '5-Question Algorithmic AI Placement Interview', 'interview', '/mock-interview', 60, 100, 'Live coding discussion covering arrays, trees, and DP.'),
      makeTask('dsa-d29-t2', 'Study AI Recruiter Evaluation Report', 'concept', '/interviews', 30, 40, 'Review correctness, technical depth, and model answers.'),
    ],
  },
  {
    dayNumber: 30,
    title: 'Tier-1 Coding Certification & Final Analytics',
    focusArea: 'Placement Certified',
    estimatedMinutes: 60,
    tasks: [
      makeTask('dsa-d30-t1', 'Verify 100% Placement Readiness Radar', 'concept', '/analytics', 30, 50, 'Unlock Diamond Tier-1 Candidate badge.'),
      makeTask('dsa-d30-t2', 'Final LeetCode 75 Core Cheatsheet Review', 'concept', '/placement-modules', 30, 50, 'Final formula review before on-campus placement day.'),
    ],
  },
];

// =========================================================================
// 3. CORE COMPUTER SCIENCE (COMPLETE 30-DAY CAMPUS ROUND-1 SPRINT)
// =========================================================================
const coreCsDays: RoadmapDay[] = [
  // Week 1 (Days 1-7): Operating Systems
  {
    dayNumber: 1,
    title: 'Processes vs Threads & Context Switching',
    focusArea: 'OS Processes',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d1-t1', 'Process Address Space (Code, Data, Heap, Stack)', 'concept', '/placement-modules', 30, 35, 'Understand virtual address spaces and PCB isolation.'),
      makeTask('cs-d1-t2', 'Top 10 Process & Thread Questions', 'question', '/questions?category=Computer%20Science', 30, 35, 'Why thread switching is faster than process switching.'),
    ],
  },
  {
    dayNumber: 2,
    title: 'CPU Scheduling Algorithms & Starvation',
    focusArea: 'OS Scheduling',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d2-t1', 'Round Robin, SJF, Priority Scheduling & Aging', 'concept', '/placement-modules', 30, 35, 'Calculate average waiting time and turnaround time.'),
      makeTask('cs-d2-t2', 'Practice: Two Sum Optimal Review', 'problem', '/problems/two-sum', 30, 40, 'Hash map lookup under 15 minutes.'),
    ],
  },
  {
    dayNumber: 3,
    title: 'Process Synchronization & Race Conditions',
    focusArea: 'OS Synchronization',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d3-t1', 'Critical Section Problem, Mutex vs Semaphores', 'question', '/questions', 30, 35, 'Counting semaphores vs binary semaphores.'),
      makeTask('cs-d3-t2', 'Practice: Valid Parentheses Stack', 'problem', '/problems/valid-parentheses', 30, 40, 'LIFO stack matching.'),
    ],
  },
  {
    dayNumber: 4,
    title: 'Deadlocks: Coffman Conditions & Prevention',
    focusArea: 'OS Deadlocks',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d4-t1', '4 Coffman Conditions & Banker’s Algorithm', 'concept', '/questions', 30, 35, 'Mutual exclusion, Hold & Wait, No Preemption, Circular Wait.'),
      makeTask('cs-d4-t2', 'Deadlock Detection & Resource Allocation Graphs', 'question', '/questions', 30, 30, 'Cycle detection in resource allocation graphs.'),
    ],
  },
  {
    dayNumber: 5,
    title: 'Memory Management: Paging & Segmentation',
    focusArea: 'OS Memory',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d5-t1', 'Virtual Memory, Page Tables & TLB Hit Ratio', 'concept', '/placement-modules', 30, 35, 'Internal vs external fragmentation and page size trade-offs.'),
      makeTask('cs-d5-t2', 'Page Replacement: FIFO, LRU & Optimal (Belady’s)', 'question', '/questions', 30, 30, 'Belady’s Anomaly explanation.'),
    ],
  },
  {
    dayNumber: 6,
    title: 'File Systems, Inodes & System Calls',
    focusArea: 'OS File Systems',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d6-t1', 'Inodes, Hard Links vs Soft Links & File Descriptors', 'concept', '/questions', 30, 35, 'How open() and read() system calls transition to kernel mode.'),
      makeTask('cs-d6-t2', 'Practice: Reverse Linked List Pointer Scan', 'problem', '/problems/reverse-linked-list', 30, 40, 'Memory pointer reversal.'),
    ],
  },
  {
    dayNumber: 7,
    title: 'Week 1 Operating Systems AI Mock Interview',
    focusArea: 'OS Milestone',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d7-t1', 'AI Mock Interview: Operating Systems Round', 'interview', '/mock-interview', 45, 60, 'Defend OS processes, scheduling, and deadlocks verbally.'),
      makeTask('cs-d7-t2', 'Check OS Topic Mastery Score', 'concept', '/analytics', 15, 25, 'Inspect topic radar graph.'),
    ],
  },

  // Week 2 (Days 8-14): Database Management Systems (DBMS)
  {
    dayNumber: 8,
    title: 'Relational Model, Keys & ER Diagrams',
    focusArea: 'DBMS Modeling',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d8-t1', 'Super Key, Candidate Key, Primary Key & Foreign Key', 'concept', '/placement-modules', 30, 35, 'Referential integrity and cascade delete rules.'),
      makeTask('cs-d8-t2', 'ER Diagram to Relational Schema Mapping', 'question', '/questions?category=Database', 30, 30, 'Cardinality ratios (1:1, 1:N, M:N).'),
    ],
  },
  {
    dayNumber: 9,
    title: 'Database Normalization: 1NF, 2NF, 3NF & BCNF',
    focusArea: 'Normalization',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d9-t1', 'Functional Dependencies & Normalization Rules', 'concept', '/placement-modules', 30, 35, 'Eliminating insertion, deletion, and update anomalies.'),
      makeTask('cs-d9-t2', 'Practice: Binary Search Logarithmic Implementation', 'problem', '/problems/binary-search', 30, 40, 'Boundary check drill.'),
    ],
  },
  {
    dayNumber: 10,
    title: 'SQL Masterclass: Joins & Aggregations',
    focusArea: 'SQL Queries',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d10-t1', 'INNER, LEFT, RIGHT, FULL OUTER & SELF JOIN', 'question', '/questions?category=Database', 30, 35, 'Solve complex multi-table relational joins.'),
      makeTask('cs-d10-t2', 'GROUP BY, HAVING vs WHERE & Window Functions', 'question', '/questions?category=Database', 30, 35, 'RANK(), DENSE_RANK() and ROW_NUMBER() in SQL.'),
    ],
  },
  {
    dayNumber: 11,
    title: 'Database Transactions & ACID Properties',
    focusArea: 'DBMS ACID',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d11-t1', 'Atomicity, Consistency, Isolation & Durability', 'concept', '/questions', 30, 35, 'Write-Ahead Logging (WAL) and checkpointing.'),
      makeTask('cs-d11-t2', 'Practice: Maximum Subarray Kadane', 'problem', '/problems/maximum-subarray', 30, 40, 'Contiguous maximum sum.'),
    ],
  },
  {
    dayNumber: 12,
    title: 'Concurrency Control & Two-Phase Locking (2PL)',
    focusArea: 'DBMS Concurrency',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d12-t1', 'Growing vs Shrinking Phase & Strict 2PL', 'concept', '/questions', 30, 35, 'Preventing cascading aborts and serializability.'),
      makeTask('cs-d12-t2', 'Deadlocks in DBMS: Wait-Die vs Wound-Wait', 'question', '/questions', 30, 30, 'Timestamp-based deadlock prevention.'),
    ],
  },
  {
    dayNumber: 13,
    title: 'B+ Tree Indexing & Query Plans',
    focusArea: 'DBMS Indexing',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d13-t1', 'Clustered vs Non-Clustered Indexes', 'concept', '/placement-modules', 30, 35, 'Why B+ Trees are preferred over B-Trees in disk I/O.'),
      makeTask('cs-d13-t2', 'Practice: Merge Two Sorted Lists', 'problem', '/problems/merge-two-sorted-lists', 30, 40, 'Sorted pointer traversal.'),
    ],
  },
  {
    dayNumber: 14,
    title: 'Week 2 DBMS Checkpoint & AI Mock Interview',
    focusArea: 'DBMS Milestone',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d14-t1', 'AI Mock Interview: DBMS & SQL Round', 'interview', '/mock-interview', 45, 60, 'Explain normalization and ACID trade-offs to AI recruiter.'),
      makeTask('cs-d14-t2', 'Review DBMS Question Bank Mastery', 'concept', '/questions?category=Database', 15, 25, 'Verify completed status.'),
    ],
  },

  // Week 3 (Days 15-21): Computer Networks
  {
    dayNumber: 15,
    title: 'OSI 7-Layer Model vs TCP/IP Protocol Suite',
    focusArea: 'Network Models',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d15-t1', 'Physical to Application Layer Responsibilities', 'concept', '/placement-modules', 30, 35, 'Encapsulation, decapsulation, and protocol headers.'),
      makeTask('cs-d15-t2', 'Top Networking Interview Questions', 'question', '/questions?category=Computer%20Science', 30, 30, 'Hub vs Switch vs Router vs Gateway.'),
    ],
  },
  {
    dayNumber: 16,
    title: 'TCP 3-Way Handshake & 4-Way Teardown',
    focusArea: 'Transport Layer',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d16-t1', 'SYN, SYN-ACK, ACK & TIME_WAIT State', 'concept', '/questions', 30, 35, 'Why TIME_WAIT is needed to prevent old duplicate packets.'),
      makeTask('cs-d16-t2', 'Practice: Best Time to Buy and Sell Stock', 'problem', '/problems/best-time-to-buy-and-sell-stock', 30, 40, 'Single-pass min tracker.'),
    ],
  },
  {
    dayNumber: 17,
    title: 'TCP Flow Control vs Congestion Control',
    focusArea: 'TCP Internals',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d17-t1', 'Sliding Window Protocol, Slow Start & AIMD', 'concept', '/placement-modules', 30, 35, 'Receiver advertised window vs congestion window.'),
      makeTask('cs-d17-t2', 'TCP vs UDP: Reliability vs Low-Latency', 'question', '/questions', 30, 30, 'Why VoIP and gaming prefer UDP.'),
    ],
  },
  {
    dayNumber: 18,
    title: 'IP Addressing, Subnetting & CIDR',
    focusArea: 'Network Layer',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d18-t1', 'IPv4 Classes, Subnet Masks & CIDR Notation', 'concept', '/placement-modules', 30, 35, 'Calculate network ID, broadcast address, and host counts.'),
      makeTask('cs-d18-t2', 'NAT (Network Address Translation) & Private IPs', 'question', '/questions', 30, 30, 'How NAT conserves IPv4 address space.'),
    ],
  },
  {
    dayNumber: 19,
    title: 'DNS Resolution & The Lifecycle of a URL Request',
    focusArea: 'Application Layer',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d19-t1', 'What happens when you type google.com in browser?', 'concept', '/questions', 30, 40, 'Browser cache, OS resolver, Root, TLD, Authoritative DNS, TCP/TLS handshake.'),
      makeTask('cs-d19-t2', 'Practice: Maximum Depth of Binary Tree', 'problem', '/problems/maximum-depth-of-binary-tree', 30, 40, 'Tree recursion.'),
    ],
  },
  {
    dayNumber: 20,
    title: 'HTTP, HTTPS, SSL/TLS Handshake & WebSockets',
    focusArea: 'Web Protocols',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d20-t1', 'TLS Symmetric vs Asymmetric Encryption', 'concept', '/questions', 30, 35, 'Digital certificates, Certificate Authorities, and session keys.'),
      makeTask('cs-d20-t2', 'HTTP/1.1 vs HTTP/2 (Multiplexing) vs HTTP/3 (QUIC)', 'question', '/questions', 30, 35, 'Head-of-line blocking solutions.'),
    ],
  },
  {
    dayNumber: 21,
    title: 'Week 3 Networks Checkpoint & AI Mock Interview',
    focusArea: 'Networks Milestone',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d21-t1', 'AI Mock Interview: Computer Networks Round', 'interview', '/mock-interview', 45, 60, 'Explain TCP handshake and DNS resolution under pressure.'),
      makeTask('cs-d21-t2', 'Check Computer Science Readiness Radar', 'concept', '/analytics', 15, 25, 'Verify Core CS progress.'),
    ],
  },

  // Week 4 (Days 22-28): Object-Oriented Programming (OOP) & Design
  {
    dayNumber: 22,
    title: '4 Pillars of OOP: Encapsulation, Abstraction, Inheritance, Polymorphism',
    focusArea: 'Core OOP',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d22-t1', 'Compile-Time vs Runtime Polymorphism', 'concept', '/placement-modules', 30, 35, 'Method overloading vs method overriding and vtable lookups.'),
      makeTask('cs-d22-t2', 'Practice: Valid Palindrome Two Pointers', 'problem', '/problems/valid-palindrome', 30, 40, 'Clean OOP string method solution.'),
    ],
  },
  {
    dayNumber: 23,
    title: 'SOLID Principles with Real-World Code Examples',
    focusArea: 'SOLID Principles',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d23-t1', 'Single Responsibility, Open-Closed, Liskov, Interface Segregation, Dependency Inversion', 'concept', '/placement-modules', 35, 40, 'Concrete code examples in Java/C++ violating and fixing each rule.'),
      makeTask('cs-d23-t2', 'Top SOLID Interview Questions', 'question', '/questions', 25, 30, 'Why Dependency Inversion decouples business logic from frameworks.'),
    ],
  },
  {
    dayNumber: 24,
    title: 'Creational Design Patterns: Singleton & Factory',
    focusArea: 'Design Patterns',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d24-t1', 'Thread-Safe Singleton (Double-Checked Locking) & Factory Pattern', 'concept', '/placement-modules', 30, 35, 'Prevent reflection and serialization attacks on Singletons.'),
      makeTask('cs-d24-t2', 'Practice: Climbing Stairs DP Table', 'problem', '/problems/climbing-stairs', 30, 40, 'Dynamic programming review.'),
    ],
  },
  {
    dayNumber: 25,
    title: 'Structural Patterns: Adapter, Decorator, Facade',
    focusArea: 'Design Patterns',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d25-t1', 'Decorator Pattern vs Subclassing & Adapter Wrapper', 'concept', '/questions', 30, 35, 'Composition over inheritance principles in enterprise code.'),
      makeTask('cs-d25-t2', 'Practice: Coin Change DP Knapsack', 'problem', '/problems/coin-change', 30, 50, 'Coin change optimal tabulation.'),
    ],
  },
  {
    dayNumber: 26,
    title: 'Behavioral Patterns: Observer & Strategy',
    focusArea: 'Design Patterns',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d26-t1', 'Observer (Pub/Sub) & Strategy Pattern Invariants', 'concept', '/placement-modules', 30, 35, 'Event emitter architectures and dynamic runtime algorithm swapping.'),
      makeTask('cs-d26-t2', 'Practice: Invert Binary Tree Speed Challenge', 'problem', '/problems/invert-binary-tree', 30, 40, 'Solve in under 10 minutes.'),
    ],
  },
  {
    dayNumber: 27,
    title: 'Campus Aptitude, Puzzles & Logical Reasoning',
    focusArea: 'Campus Round 1',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d27-t1', 'Top 10 Classic Placement Puzzles', 'question', '/questions', 30, 35, '25 Horses Race, 3 Bulbs & Switches, Burning Ropes.'),
      makeTask('cs-d27-t2', 'Quantitative Aptitude Review', 'concept', '/placement-modules', 30, 30, 'Speed math, probability, permutations, and time & work.'),
    ],
  },
  {
    dayNumber: 28,
    title: 'Comprehensive Core CS Written Round Simulation',
    focusArea: 'Placement Contest',
    estimatedMinutes: 75,
    tasks: [
      makeTask('cs-d28-t1', 'Full 20-Question Core CS Written Assessment', 'question', '/questions', 45, 60, 'High-speed timed quiz across OS, DBMS, Networks, and OOP.'),
      makeTask('cs-d28-t2', 'Practice: Two Sum O(n) Hash Map Drill', 'problem', '/problems/two-sum', 30, 40, 'Flawless code execution.'),
    ],
  },

  // Final Placement Sprint (Days 29-30)
  {
    dayNumber: 29,
    title: 'Technical Round 1 Hiring Manager AI Simulation',
    focusArea: 'Round 1 Simulation',
    estimatedMinutes: 90,
    tasks: [
      makeTask('cs-d29-t1', 'Full-Length Core CS Placement AI Mock Round', 'interview', '/mock-interview', 60, 100, 'Comprehensive oral defense of OS, DBMS, Networks, and OOP.'),
      makeTask('cs-d29-t2', 'Study AI Evaluation Report & Model Answers', 'concept', '/interviews', 30, 40, 'Analyze STAR communication scores and model solutions.'),
    ],
  },
  {
    dayNumber: 30,
    title: 'Final Tier-1 Campus Placement Certification',
    focusArea: 'Placement Ready',
    estimatedMinutes: 60,
    tasks: [
      makeTask('cs-d30-t1', 'Verify 100% Core CS Readiness Score', 'concept', '/analytics', 30, 50, 'Inspect achievement badges and unlock Tier-1 certification.'),
      makeTask('cs-d30-t2', 'Final Last-Minute Placement Interview Cheatsheet', 'concept', '/placement-modules', 30, 50, 'Master recap sheet for on-campus company arrival.'),
    ],
  },
];

// =========================================================================
// EXPORT ALL ROADMAPS (EACH HAS EXACTLY 30 DAYS ACROSS 4 WEEKS)
// =========================================================================
export const SEED_ROADMAPS: SeedRoadmap[] = [
  {
    id: 'roadmap-fullstack-30',
    slug: 'full-stack-30',
    title: 'Full Stack Developer 30-Day Placement Sprint',
    role: 'Full Stack Developer',
    durationDays: 30,
    level: 'Intermediate to Advanced',
    description: 'A comprehensive 30-day (4-week) structured curriculum covering modern frontend (React/TS), backend (Node/Express), database optimization, distributed system design, and placement mock rounds.',
    targetCompanies: ['Google', 'Amazon', 'Microsoft', 'Flipkart', 'Uber', 'Swiggy', 'Razorpay'],
    icon: 'Layers',
    badgeColor: 'brand',
    totalTasks: fullStackDays.reduce((acc, d) => acc + d.tasks.length, 0), // 60 total tasks!
    totalXp: fullStackDays.reduce((acc, d) => acc + d.tasks.reduce((sum, t) => sum + t.xpReward, 0), 0),
    weeks: groupDaysIntoWeeks(fullStackDays, [
      'Week 1: Modern JS/TS & React Deep Dive (Days 1–7)',
      'Week 2: Backend Architecture & Database Optimization (Days 8–14)',
      'Week 3: System Design, Scalability & Caching (Days 15–21)',
      'Week 4: Advanced Problem Solving, Contests & Final Rounds (Days 22–30)',
    ]),
  },
  {
    id: 'roadmap-dsa-30',
    slug: 'dsa-30',
    title: 'DSA 30-Day LeetCode Placement Mastery',
    role: 'Data Structures & Algorithms',
    durationDays: 30,
    level: 'All Levels',
    description: 'A full 30-day intensive algorithmic sprint covering the top 15 placement patterns: Two Pointers, Sliding Window, Binary Search, Linked Lists, Stacks, Trees, Graphs, and Dynamic Programming.',
    targetCompanies: ['Google', 'Microsoft', 'Amazon', 'Adobe', 'Goldman Sachs', 'Morgan Stanley'],
    icon: 'Code2',
    badgeColor: 'emerald',
    totalTasks: dsaDays.reduce((acc, d) => acc + d.tasks.length, 0), // 60 total tasks!
    totalXp: dsaDays.reduce((acc, d) => acc + d.tasks.reduce((sum, t) => sum + t.xpReward, 0), 0),
    weeks: groupDaysIntoWeeks(dsaDays, [
      'Week 1: Arrays, Strings, Two Pointers & Binary Search (Days 1–7)',
      'Week 2: Linked Lists, Stacks, Queues & Recursion (Days 8–14)',
      'Week 3: Binary Trees, BST, Heaps & Graph Traversals (Days 15–21)',
      'Week 4: Dynamic Programming & High-Speed Contests (Days 22–30)',
    ]),
  },
  {
    id: 'roadmap-core-cs-30',
    slug: 'core-cs-30',
    title: 'Core Computer Science 30-Day Placement Sprint',
    role: 'Core CS (OS, DBMS, CN, OOP)',
    durationDays: 30,
    level: 'All Levels',
    description: 'A complete 30-day deep dive covering Operating Systems, DBMS (normalization/transactions), Computer Networks (protocols/security), and Object-Oriented Design (SOLID/patterns) for Tier-1 campus placements.',
    targetCompanies: ['TCS Digital', 'Infosys Power Programmer', 'Cognizant', 'Wipro Turbo', 'Oracle', 'Cisco'],
    icon: 'Cpu',
    badgeColor: 'purple',
    totalTasks: coreCsDays.reduce((acc, d) => acc + d.tasks.length, 0), // 60 total tasks!
    totalXp: coreCsDays.reduce((acc, d) => acc + d.tasks.reduce((sum, t) => sum + t.xpReward, 0), 0),
    weeks: groupDaysIntoWeeks(coreCsDays, [
      'Week 1: Operating Systems Internals & Memory (Days 1–7)',
      'Week 2: Database Management Systems & SQL Mastery (Days 8–14)',
      'Week 3: Computer Networks & Protocols (Days 15–21)',
      'Week 4: Object-Oriented Design, SOLID & Campus Drills (Days 22–30)',
    ]),
  },
];
