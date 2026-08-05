export interface MCQQuestion {
  id: string;
  category: 'Data Structures' | 'Algorithms' | 'Operating Systems' | 'DBMS' | 'Computer Networks' | 'System Design' | 'OOP';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const MCQ_BANK: MCQQuestion[] = [
  // --- DATA STRUCTURES ---
  {
    id: 'ds-1',
    category: 'Data Structures',
    question: 'What is the worst-case time complexity of searching in a Hash Table with chaining?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N^2)'],
    correctAnswer: 2,
    explanation: 'In the worst case, all keys hash to the same bucket resulting in a linked list of length N, making search O(N).',
  },
  {
    id: 'ds-2',
    category: 'Data Structures',
    question: 'Which data structure is primarily used to implement Recursion in programming languages?',
    options: ['Queue', 'Stack', 'Heap', 'Tree'],
    correctAnswer: 1,
    explanation: 'The call stack is used by function execution contexts to track recursive function invocations.',
  },
  {
    id: 'ds-3',
    category: 'Data Structures',
    question: 'What is the time complexity to find the minimum element in a Min-Heap of size N?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
    correctAnswer: 0,
    explanation: 'In a Min-Heap, the minimum element is always stored at the root node, accessible in O(1) time.',
  },
  {
    id: 'ds-4',
    category: 'Data Structures',
    question: 'Which tree traversal visits the root node first, followed by left and right subtrees?',
    options: ['In-order', 'Pre-order', 'Post-order', 'Level-order'],
    correctAnswer: 1,
    explanation: 'Pre-order traversal visits Node -> Left Subtree -> Right Subtree.',
  },
  {
    id: 'ds-5',
    category: 'Data Structures',
    question: 'What is the height balance property of an AVL Tree for any node?',
    options: ['|Height(Left) - Height(Right)| <= 1', '|Height(Left) - Height(Right)| == 0', 'Height(Left) > Height(Right)', 'Height(Right) > Height(Left)'],
    correctAnswer: 0,
    explanation: 'In an AVL tree, the height difference between left and right subtrees of any node is at most 1.',
  },

  // --- ALGORITHMS ---
  {
    id: 'algo-1',
    category: 'Algorithms',
    question: 'Which sorting algorithm has the best average-case time complexity among comparison sorts?',
    options: ['Bubble Sort', 'Quick Sort', 'Selection Sort', 'Insertion Sort'],
    correctAnswer: 1,
    explanation: 'Quick Sort has an average-case complexity of O(N log N) with low constant factors.',
  },
  {
    id: 'algo-2',
    category: 'Algorithms',
    question: 'What design paradigm does Dijkstra Algorithm for single-source shortest paths follow?',
    options: ['Dynamic Programming', 'Greedy Approach', 'Divide and Conquer', 'Backtracking'],
    correctAnswer: 1,
    explanation: 'Dijkstra algorithm picks the unvisited node with the current minimum tentative distance at each step (Greedy choice).',
  },
  {
    id: 'algo-3',
    category: 'Algorithms',
    question: 'What is the space complexity of Breadth-First Search (BFS) on a graph with V vertices and E edges?',
    options: ['O(1)', 'O(V)', 'O(E)', 'O(V + E)'],
    correctAnswer: 1,
    explanation: 'BFS uses a queue to store visited vertices, consuming O(V) auxiliary space.',
  },
  {
    id: 'algo-4',
    category: 'Algorithms',
    question: 'What is the time complexity of the Floyd-Warshall all-pairs shortest path algorithm?',
    options: ['O(V^2)', 'O(V^3)', 'O(V * E)', 'O(E log V)'],
    correctAnswer: 1,
    explanation: 'Floyd-Warshall runs three nested loops over all vertices V, resulting in O(V^3) time.',
  },

  // --- OPERATING SYSTEMS ---
  {
    id: 'os-1',
    category: 'Operating Systems',
    question: 'Which of the following conditions is NOT required for a Deadlock to occur?',
    options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'],
    correctAnswer: 2,
    explanation: 'No Preemption is required for deadlock. If preemption is allowed, resources can be forcibly reclaimed, breaking deadlock.',
  },
  {
    id: 'os-2',
    category: 'Operating Systems',
    question: 'What page replacement algorithm suffers from Belady Anomaly?',
    options: ['Least Recently Used (LRU)', 'Optimal Page Replacement', 'First-In-First-Out (FIFO)', 'Least Frequently Used (LFU)'],
    correctAnswer: 2,
    explanation: 'Belady Anomaly occurs in FIFO where increasing the number of page frames leads to more page faults.',
  },
  {
    id: 'os-3',
    category: 'Operating Systems',
    question: 'What is the purpose of the Translation Lookaside Buffer (TLB) in CPU memory management?',
    options: ['Cache Disk Blocks', 'Cache Virtual-to-Physical Address Translations', 'Store Process Control Blocks', 'Manage I/O Interrupts'],
    correctAnswer: 1,
    explanation: 'The TLB is a high-speed hardware cache used to translate virtual addresses to physical frame numbers quickly.',
  },

  // --- DBMS ---
  {
    id: 'db-1',
    category: 'DBMS',
    question: 'Which normal form eliminates Transitive Dependencies in a relational database table?',
    options: ['First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Third Normal Form (3NF)', 'Boyce-Codd Normal Form (BCNF)'],
    correctAnswer: 2,
    explanation: '3NF requires that every non-prime attribute is non-transitively dependent on every candidate key.',
  },
  {
    id: 'db-2',
    category: 'DBMS',
    question: 'What does the "I" stand for in ACID properties of database transactions?',
    options: ['Integrity', 'Isolation', 'Index', 'Inheritance'],
    correctAnswer: 1,
    explanation: 'ACID stands for Atomicity, Consistency, Isolation, and Durability.',
  },
  {
    id: 'db-3',
    category: 'DBMS',
    question: 'Which index structure is most widely used in relational databases like PostgreSQL and MySQL InnoDB?',
    options: ['Binary Search Tree', 'B+ Tree', 'Red-Black Tree', 'Skip List'],
    correctAnswer: 1,
    explanation: 'B+ Trees store data pointers at leaf nodes and have high fan-out, making them ideal for disk-based databases.',
  },

  // --- COMPUTER NETWORKS ---
  {
    id: 'cn-1',
    category: 'Computer Networks',
    question: 'At which OSI layer does the IP (Internet Protocol) operate?',
    options: ['Data Link Layer', 'Network Layer', 'Transport Layer', 'Application Layer'],
    correctAnswer: 1,
    explanation: 'IP is responsible for logical addressing and routing, which occurs at OSI Layer 3 (Network Layer).',
  },
  {
    id: 'cn-2',
    category: 'Computer Networks',
    question: 'Which transport layer protocol provides reliable, connection-oriented byte stream transmission?',
    options: ['UDP', 'TCP', 'ICMP', 'ARP'],
    correctAnswer: 1,
    explanation: 'TCP (Transmission Control Protocol) establishes connections via a 3-way handshake and guarantees delivery.',
  },

  // --- SYSTEM DESIGN & OOP ---
  {
    id: 'sd-1',
    category: 'System Design',
    question: 'Which load balancing algorithm distributes requests evenly in sequence among server nodes?',
    options: ['Least Connections', 'Round Robin', 'IP Hash', 'Weighted Random'],
    correctAnswer: 1,
    explanation: 'Round Robin forwards incoming requests to servers in sequential order.',
  },
  {
    id: 'oop-1',
    category: 'OOP',
    question: 'Which OOP principle allows a subclass to provide a specific implementation of a method defined in its superclass?',
    options: ['Abstraction', 'Encapsulation', 'Polymorphism (Method Overriding)', 'Multiple Inheritance'],
    correctAnswer: 2,
    explanation: 'Method overriding is dynamic (runtime) polymorphism where a child class replaces a parent class method implementation.',
  },
];
