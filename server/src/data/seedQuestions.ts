import { QuestionCategory } from '../models/Question.js';

export interface SeedQuestion {
  title: string;
  category: QuestionCategory;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  answer: string;
  explanation: string;
  interviewTips: string[];
  companies: string[];
}

export const SEED_QUESTIONS: SeedQuestion[] = [
  // =========================================================================
  // JAVA TRACK (15 PLACEMENT QUESTIONS)
  // =========================================================================
  {
    title: 'Java HashMap Internal Architecture & Hash Collisions',
    category: 'Programming',
    topic: 'Java',
    difficulty: 'Hard',
    question: 'How does Java HashMap handle hash collisions, and what optimization was introduced in Java 8?',
    answer: 'HashMap uses an array of Node buckets: index = hash(key) & (n - 1). When two distinct keys compute to the same bucket index (collision), HashMap stores them in a linked list. In Java 8, when a bucket exceeds TREEIFY_THRESHOLD (8 nodes) and total capacity >= 64, the linked list is transformed into a balanced Red-Black Tree (TreeNode), reducing search complexity from O(n) to O(log n). If elements decrease below 6, it converts back to a linked list.',
    explanation: 'This prevents Denial-of-Service attacks where adversaries craft colliding keys to degrade HashMap operations into O(n) linked list scans.',
    interviewTips: [
      'Explain the contract between equals() and hashCode(): if two objects are equal, their hash codes must match.',
      'Mention load factor (default 0.75) and resizing doubling threshold.'
    ],
    companies: ['Goldman Sachs', 'Oracle', 'Morgan Stanley', 'Amazon'],
  },
  {
    title: 'JVM Memory Architecture & Runtime Data Areas',
    category: 'Programming',
    topic: 'Java',
    difficulty: 'Medium',
    question: 'Describe the main components of JVM memory architecture (Heap, Stack, Metaspace).',
    answer: 'JVM Memory is divided into: (1) Heap: shared among all threads, stores all object instances and arrays, managed by Garbage Collector (divided into Young Gen and Old Gen); (2) Stack: private per-thread, stores stack frames containing local variables, partial results, and method invocation return addresses; (3) Metaspace (formerly PermGen): stores class metadata, static variables, and bytecode outside the heap in native memory; (4) Program Counter (PC) Register: tracks currently executing JVM instruction; (5) Native Method Stack: for C/C++ native calls.',
    explanation: 'Stack memory allocation is fast and deallocated automatically on method exit. Objects on the Heap require Garbage Collection.',
    interviewTips: [
      'Contrast StackOverflowError (recursive calls exceeding stack depth) with OutOfMemoryError (heap full or metaspace full).',
      'Explain why Java 8 replaced PermGen with Metaspace (avoid fixed MaxPermSize limits).'
    ],
    companies: ['Amazon', 'Microsoft', 'Oracle', 'SAP'],
  },
  {
    title: 'Java Garbage Collection & Generational Hypothesis',
    category: 'Programming',
    topic: 'Java',
    difficulty: 'Hard',
    question: 'How does Garbage Collection work in Java, and what is the Weak Generational Hypothesis?',
    answer: 'The Generational Hypothesis observes that most objects die shortly after allocation (high infant mortality). The JVM Heap is split into: Young Generation (Eden space + Survivor spaces S0/S1) and Old/Tenured Generation. New objects are allocated in Eden. Minor GC scans Young Gen and copies surviving objects between S0 and S1, incrementing their age counter. When age exceeds TenuringThreshold (default 15), objects are promoted to Old Gen. Major/Full GC cleans Old Gen using algorithms like G1 GC (Garbage-First) or ZGC.',
    explanation: 'G1 GC divides the heap into equal non-contiguous regions and collects regions with the most garbage first to satisfy user-defined pause time targets.',
    interviewTips: [
      'Explain Stop-The-World (STW) pauses.',
      'Explain how GC Roots work (local stack variables, active thread references, static variables).'
    ],
    companies: ['Google', 'Goldman Sachs', 'Salesforce'],
  },
  {
    title: 'Java String Immutability and String Constant Pool',
    category: 'Programming',
    topic: 'Java',
    difficulty: 'Easy',
    question: 'Why are Strings immutable in Java, and how does the String Constant Pool save memory?',
    answer: 'Strings are immutable for security, thread-safety, and performance: (1) Security: strings carry file paths, database URLs, and network ports; mutability would allow parameters to be modified maliciously after authorization checks; (2) Thread Safety: immutable objects can be shared across multiple threads without synchronization; (3) Caching: hash codes can be cached at creation time, speeding up HashMap lookups; (4) String Pool: identical string literals reference the same shared memory address in the String Pool.',
    explanation: 'String s1 = "hello"; String s2 = "hello"; s1 == s2 evaluates to true because both point to the pool instance. String s3 = new String("hello") forces a new object on the heap.',
    interviewTips: [
      'Explain string.intern() method to manually place heap strings into the pool.',
      'Advocate StringBuilder for single-threaded concatenations and StringBuffer for synchronized thread-safe concatenations.'
    ],
    companies: ['Adobe', 'Cisco', 'Cognizant', 'Infosys'],
  },
  {
    title: 'Java Multithreading: synchronized vs volatile vs ReentrantLock',
    category: 'Programming',
    topic: 'Java',
    difficulty: 'Hard',
    question: 'What are the differences between synchronized, volatile, and ReentrantLock in Java concurrency?',
    answer: 'volatile guarantees visibility across CPU core caches (reads/writes go directly to main memory), preventing instruction reordering, but DOES NOT guarantee atomicity (count++ is not thread-safe). synchronized is an intrinsic monitor lock providing both visibility and mutual exclusion (atomicity), but it blocks threads unconditionally without timeouts. ReentrantLock from java.util.concurrent offers advanced capabilities: fairness policies (FIFO lock grants), tryLock(timeout) non-blocking acquisition, and multiple Condition queues.',
    explanation: 'Use volatile for single-variable flags (e.g., boolean running = true); use synchronized or ReentrantLock for critical sections modifying multiple shared states.',
    interviewTips: [
      'Explain double-checked locking singleton with volatile helper variable to prevent partially initialized object leakage.',
      'Mention that ReentrantLock must always be unlocked in a finally block.'
    ],
    companies: ['Amazon', 'Bloomberg', 'Morgan Stanley'],
  },
  {
    title: 'Comparable vs Comparator in Java',
    category: 'Programming',
    topic: 'Java',
    difficulty: 'Easy',
    question: 'What is the difference between Comparable and Comparator interfaces in Java?',
    answer: 'Comparable defines the natural ordering of a class by implementing compareTo(T o) within the class itself (e.g. String or Integer implement Comparable). It allows only one sorting strategy. Comparator defines custom or alternate ordering by implementing compare(T o1, T o2) in an external class or lambda. It does not require modifying the source class, and multiple comparators can be defined for different fields (e.g., sort by age, sort by name).',
    explanation: 'Collections.sort(list) uses Comparable. Collections.sort(list, comparator) or list.sort(Comparator.comparing(User::getAge)) uses Comparator.',
    interviewTips: [
      'Know the return contract: negative if o1 < o2, zero if equal, positive if o1 > o2.',
      'Demonstrate modern Java 8 syntax: Comparator.comparing(Employee::getSalary).reversed().'
    ],
    companies: ['TCS', 'Infosys', 'Wipro', 'Capgemini'],
  },
  {
    title: 'Checked vs Unchecked Exceptions in Java',
    category: 'Programming',
    topic: 'Java',
    difficulty: 'Easy',
    question: 'Explain the difference between Checked and Unchecked Exceptions in Java.',
    answer: 'Checked Exceptions inherit from Exception (excluding RuntimeException) and are checked at compile-time; the compiler forces the method to handle them via try-catch or declare them with throws (e.g. IOException, SQLException). They represent recoverable external failure conditions. Unchecked Exceptions inherit from RuntimeException or Error and occur at runtime (e.g. NullPointerException, ArrayIndexOutOfBoundsException, IllegalArgumentException). They represent programming defects or fatal system failures.',
    explanation: 'Errors (like OutOfMemoryError, StackOverflowError) inherit from Throwable and should not be caught as they signify unrecoverable JVM conditions.',
    interviewTips: [
      'Draw the hierarchy: Throwable -> (Error, Exception -> (RuntimeException, Checked Exceptions)).',
      'Mention try-with-resources (AutoCloseable) introduced in Java 7 to automatically close streams.'
    ],
    companies: ['Accenture', 'Cognizant', 'HCL', 'Oracle'],
  },
  {
    title: 'Java 8 Streams: map vs flatMap & Lazy Evaluation',
    category: 'Programming',
    topic: 'Java',
    difficulty: 'Medium',
    question: 'How do map() and flatMap() differ in Java 8 Streams, and what is lazy evaluation?',
    answer: 'map() performs a 1-to-1 transformation, transforming an element of type T into another element of type R (e.g., Stream<String> -> Stream<Integer>). flatMap() performs a 1-to-many transformation and flattens nested streams (e.g., Stream<List<String>> -> Stream<String>). Lazy Evaluation means intermediate stream operations (filter, map, sorted) do not execute immediately; they build an execution pipeline that only executes when a terminal operation (collect, forEach, reduce) is invoked.',
    explanation: 'Lazy evaluation optimizes performance: in list.stream().filter(x -> x > 10).findFirst(), processing stops as soon as the first matching element is discovered (short-circuiting).',
    interviewTips: [
      'Demonstrate flatMap with an example of extracting all tags from a list of blog posts.',
      'Clarify that a stream cannot be reused once a terminal operation has executed.'
    ],
    companies: ['Flipkart', 'Swiggy', 'Walmart Labs', 'Amazon'],
  },
  {
    title: 'Fail-Fast vs Fail-Safe Iterators in Java',
    category: 'Programming',
    topic: 'Java',
    difficulty: 'Medium',
    question: 'What is the difference between Fail-Fast and Fail-Safe iterators in Java collections?',
    answer: 'Fail-Fast iterators (e.g., ArrayList, HashMap, HashSet) immediately throw ConcurrentModificationException if the collection is structurally modified during iteration (except through the iterator\'s own remove() method). They check an internal modCount flag. Fail-Safe / Weakly-Consistent iterators (e.g., ConcurrentHashMap, CopyOnWriteArrayList) operate on a clone or snapshot of the collection, allowing modifications during iteration without throwing ConcurrentModificationException.',
    explanation: 'CopyOnWriteArrayList creates a fresh copy of the underlying array on every mutation (add/set), making it ideal for read-heavy, write-infrequent multi-threaded scenarios.',
    interviewTips: [
      'Explain that fail-fast behavior is on a best-effort basis and should not be relied upon for hard concurrency logic.',
      'Explain how ConcurrentHashMap achieves thread-safety without locking the entire table (CAS operations and synchronized on node bucket head).'
    ],
    companies: ['Amazon', 'Uber', 'Paypal', 'Microsoft'],
  },
  {
    title: 'Java Abstract Class vs Interface (Java 8/9 Updates)',
    category: 'Programming',
    topic: 'Java',
    difficulty: 'Easy',
    question: 'How do Abstract Classes and Interfaces differ, especially with Java 8 default and Java 9 private methods?',
    answer: 'An Abstract Class can have state (instance variables, constructors) and can define non-public methods and full implementation. A class can extend only one abstract class (single inheritance). An Interface represents a contract ("is-a" vs "can-do"). A class can implement multiple interfaces. Since Java 8, interfaces can contain default methods (providing backward compatibility for APIs) and static helper methods. In Java 9, interfaces can also contain private methods to encapsulate shared helper logic between default methods.',
    explanation: 'If diamond problem occurs due to duplicate default methods from two interfaces, the compiler forces the implementing class to explicitly override and resolve the ambiguity.',
    interviewTips: [
      'Use an abstract class when classes share code and state; use interfaces to define polymorphic capabilities across unrelated classes (e.g. Comparable, Serializable).',
      'Mention that interface fields are always public static final.'
    ],
    companies: ['Cisco', 'Dell', 'IBM', 'Oracle'],
  },
  {
    title: 'Java Memory Model (JMM) & Happens-Before Guarantee',
    category: 'Programming',
    topic: 'Java',
    difficulty: 'Hard',
    question: 'What is the Java Memory Model (JMM), and what does the "Happens-Before" relationship guarantee?',
    answer: 'The JMM defines how the JVM and CPU hardware interact regarding reading and writing memory variables across multiple concurrent threads. Due to CPU caches, write buffers, and compiler instruction reordering, writes by thread A might not be visible to thread B immediately. The "Happens-Before" relationship is a formal guarantee that memory writes by one action are visible to another specific action. Key rules: (1) Program Order Rule: each action in a thread happens-before subsequent actions; (2) Volatile Variable Rule: a write to volatile happens-before every subsequent read of that variable; (3) Monitor Lock Rule: an unlock on a monitor happens-before every subsequent lock on the same monitor.',
    explanation: 'Understanding happens-before is critical for writing lock-free algorithms, custom thread-safe queues, and high-frequency trading applications.',
    interviewTips: [
      'Show how the volatile rule combined with program order rule makes double-checked locking thread-safe.',
      'Mention memory barriers (fences) inserted by the JIT compiler.'
    ],
    companies: ['Goldman Sachs', 'Morgan Stanley', 'Tower Research'],
  },
  {
    title: 'Autoboxing, Unboxing, and the Integer Cache Trap',
    category: 'Programming',
    topic: 'Java',
    difficulty: 'Medium',
    question: 'How does Autoboxing work in Java, and why does Integer a = 127; Integer b = 127; a == b return true, but 128 returns false?',
    answer: 'Autoboxing is the automatic conversion by the Java compiler of primitive types into their corresponding object wrapper classes (e.g., int -> Integer.valueOf(int)). Unboxing is the reverse (Integer.intValue()). In Java, Integer.valueOf() caches instances for values in the range [-128, 127] (IntegerCache). When autoboxing 127, both variables reference the same cached object in memory, so == evaluates to true. For 128 (outside the cache range), new distinct Integer objects are allocated on the heap, so == evaluates to false.',
    explanation: 'Always use .equals() when comparing wrapper objects, and be cautious of hidden performance penalties or NullPointerExceptions when unboxing null objects.',
    interviewTips: [
      'Show that Long, Short, Byte, and Character also maintain small caches.',
      'Explain the performance impact of autoboxing inside large loops (allocating millions of temporary wrapper objects on the heap).'
    ],
    companies: ['Amazon', 'Adobe', 'Oracle', 'ThoughtWorks'],
  },
  {
    title: 'Serialization, Deserialization, and the transient Keyword',
    category: 'Programming',
    topic: 'Java',
    difficulty: 'Medium',
    question: 'How does Java Object Serialization work, and what is the purpose of serialVersionUID and the transient keyword?',
    answer: 'Serialization is the process of converting an object\'s state into a byte stream (using ObjectOutputStream); deserialization reconstructs the object from byte stream (ObjectInputStream). A class must implement java.io.Serializable (a marker interface). The serialVersionUID is a unique version identifier used during deserialization to verify that the sender and receiver of a serialized object have loaded classes that are compatible. The transient keyword marks sensitive or temporary fields (like passwords, session tokens, or cached calculations) that should NOT be included in the serialized byte stream.',
    explanation: 'If a class does not declare serialVersionUID, the JVM compiler calculates a default hash based on class members. Any slight code modification causes InvalidClassException upon deserialization.',
    interviewTips: [
      'Explain that static fields are also not serialized because they belong to the class, not the instance.',
      'Mention alternative fast modern serialization formats used in production (Protocol Buffers, JSON, Kryo).'
    ],
    companies: ['Oracle', 'Cisco', 'Infosys', 'TCS'],
  },
  {
    title: 'Deadlock Detection and Thread Dump Analysis in Java',
    category: 'Programming',
    topic: 'Java',
    difficulty: 'Hard',
    question: 'How do you induce and detect a Deadlock in Java, and how do you analyze it using Thread Dumps?',
    answer: 'A deadlock occurs when Thread 1 holds Lock A and waits for Lock B, while Thread 2 holds Lock B and waits for Lock A. Neither thread can proceed. In production, deadlocks are detected by generating a Java Thread Dump using jcmd <pid> Thread.print or jstack <pid>. The JVM automatically runs cycle detection on thread wait-for graphs and prints a dedicated section at the bottom of the dump: "Found one Java-level deadlock:" showing the locked object monitors and blocked threads.',
    explanation: 'Deadlock prevention in code: (1) acquire locks in a globally consistent order (e.g. always acquire smaller ID lock first), (2) use lock.tryLock(timeout) instead of synchronized to fail gracefully.',
    interviewTips: [
      'Demonstrate how to write a simple 2-thread deadlock program.',
      'Explain the difference between BLOCKED state (waiting for synchronized monitor) and WAITING state (waiting on lock.lock() or object.wait()).'
    ],
    companies: ['Amazon', 'Google', 'Salesforce', 'PayPal'],
  },
  {
    title: 'Singleton Design Pattern: Double-Checked Locking in Java',
    category: 'Programming',
    topic: 'Java',
    difficulty: 'Medium',
    question: 'How do you implement a thread-safe Singleton in Java using Double-Checked Locking, and why is volatile mandatory?',
    answer: 'Double-checked locking checks the instance twice: first without locking (fast path), and if null, enters synchronized block and checks again before instantiating. The volatile keyword is MANDATORY because object creation (instance = new Singleton()) consists of 3 bytecode steps: (1) allocate memory, (2) initialize constructor, (3) assign reference. Without volatile, CPU instruction reordering can execute step 3 before step 2, causing another thread to observe a non-null but uninitialized partially constructed object.',
    explanation: 'Alternatively, the Bill Pugh Singleton (using a static inner helper class) provides lazy initialization and thread-safety guaranteed by the JVM classloader without explicit synchronization.',
    interviewTips: [
      'Write the complete double-checked locking code snippet on whiteboard/editor.',
      'Mention that an Enum Singleton (Joshua Bloch) is the most bulletproof pattern against reflection and serialization attacks.'
    ],
    companies: ['Microsoft', 'Uber', 'Adobe', 'Flipkart'],
  },

  // =========================================================================
  // PYTHON TRACK (15 PLACEMENT QUESTIONS)
  // =========================================================================
  {
    title: 'Python Global Interpreter Lock (GIL)',
    category: 'Programming',
    topic: 'Python',
    difficulty: 'Hard',
    question: 'What is the Python GIL (Global Interpreter Lock), why does it exist, and how do you achieve true CPU parallelism?',
    answer: 'The GIL is a mutex in CPython that prevents multiple native threads from executing Python bytecodes simultaneously. It exists because CPython memory management is not thread-safe and relies on reference counting. To achieve true parallel execution for CPU-bound tasks, developers use the multiprocessing module (which spawns separate OS processes with their own memory and GIL) or offload computation to C/Rust extensions (like NumPy) that release the GIL.',
    explanation: 'For I/O-bound tasks (network requests, disk access), standard threading or asyncio works well because the GIL is released during I/O operations.',
    interviewTips: [
      'Distinguish clearly between CPU-bound (use multiprocessing) and I/O-bound (use asyncio / threading).',
      'Mention PEP 703 (free-threaded Python 3.13) which enables disabling the GIL experimentally.'
    ],
    companies: ['Google', 'Meta', 'Bloomberg'],
  },
  {
    title: 'Python Memory Management & Reference Counting',
    category: 'Programming',
    topic: 'Python',
    difficulty: 'Hard',
    question: 'How does Python manage memory and handle cyclic garbage collection?',
    answer: 'Python utilizes a two-tier memory management system: (1) Reference Counting: every object maintains an ob_refcnt counter. When variable references are assigned or passed, refcount increments; when references go out of scope or are deleted, refcount decrements. Once refcount hits 0, memory is immediately deallocated. (2) Cyclic Garbage Collector: reference counting cannot reclaim cyclic references (e.g., Object A references B, and B references A). Python\'s generational GC (Generations 0, 1, 2) periodically runs heuristics detecting reference cycles and freeing unreachable isolated object graphs.',
    explanation: 'Python also employs a private memory allocator (PyMalloc) with pools, arenas, and blocks optimized for small objects (<= 512 bytes) to minimize OS malloc overhead.',
    interviewTips: [
      'Demonstrate how weakref module breaks circular references without increasing ob_refcnt.',
      'Show how the gc module can inspect or disable garbage collector generations.'
    ],
    companies: ['Google', 'Stripe', 'Netflix', 'Amazon'],
  },
  {
    title: 'Python Generators, Iterators, and the yield Keyword',
    category: 'Programming',
    topic: 'Python',
    difficulty: 'Easy',
    question: 'How do Python Generators differ from regular functions, and what are their memory benefits?',
    answer: 'A generator is a function containing one or more yield expressions. Unlike regular functions that compute an entire sequence and return it at once, a generator yields values lazily on-demand using the iterator protocol (__iter__ and __next__). Once yielded, its execution state (local variables and instruction pointer) is suspended until the next value is requested, resulting in O(1) space complexity regardless of stream size.',
    explanation: 'Processing a 10 GB log file using readlines() loads the entire file into RAM, crashing with MemoryError. A generator streams line by line with minuscule memory overhead.',
    interviewTips: [
      'Show generator expressions (x*x for x in range(n)) versus list comprehensions.',
      'Explain that once exhausted, a generator cannot be reset without re-instantiation.'
    ],
    companies: ['Amazon', 'Cisco', 'Salesforce'],
  },
  {
    title: 'Python Decorators & @functools.wraps',
    category: 'Programming',
    topic: 'Python',
    difficulty: 'Medium',
    question: 'What is a Decorator in Python, and why is @functools.wraps essential when writing custom decorators?',
    answer: 'A decorator is a design pattern that allows modifying or extending the behavior of a function or class without permanently changing its source code. In Python, functions are first-class citizens. A decorator is a higher-order function that takes a function as an argument, defines a nested wrapper function that adds behavior (logging, timing, auth check), and returns the wrapper. @functools.wraps(fn) preserves original function metadata (such as __name__, __doc__, and type annotations), which would otherwise be overwritten by the wrapper.',
    explanation: 'Syntax sugar @my_decorator above def my_func(): is functionally equivalent to my_func = my_decorator(my_func).',
    interviewTips: [
      'Demonstrate how to write decorators that take arguments (requires 3 nested function levels).',
      'Explain common use-cases: @lru_cache, @login_required, timing profilers.'
    ],
    companies: ['Meta', 'Uber', 'Spotify', 'Twitter'],
  },
  {
    title: 'Python Dict Implementation & O(1) Lookup Complexity',
    category: 'Programming',
    topic: 'Python',
    difficulty: 'Hard',
    question: 'How is Python\'s dictionary internally implemented, and why is it insertion-ordered since Python 3.6?',
    answer: 'In Python 3.6+, dict uses a compact hash table design combining two arrays: a sparse indices array and a dense entries array storing [hash, key, value] in insertion order. When a key is inserted, hash(key) indexes into the indices array, which points to the next available entry index. Hash collisions are resolved using Open Addressing with pseudo-random probing (perturbation). This compact design reduces memory footprint by ~30% and inherently preserves insertion order.',
    explanation: 'Keys in a dictionary must be hashable—they must have an immutable hash value (__hash__) and support equality testing (__eq__).',
    interviewTips: [
      'Explain why unhashable types like lists cannot be used as dictionary keys, but tuples can (if all tuple elements are hashable).',
      'Mention that average-case lookup is O(1), but worst-case collision degradation can reach O(n).'
    ],
    companies: ['Google', 'Microsoft', 'Palantir', 'Databricks'],
  },
  {
    title: 'Python "is" vs "==" and Integer Interning',
    category: 'Programming',
    topic: 'Python',
    difficulty: 'Easy',
    question: 'What is the difference between "is" and "==", and what is Python integer interning?',
    answer: '"==" checks equality of value (invokes the __eq__ method). "is" checks object identity—whether two references point to the exact same physical memory address in RAM (id(a) == id(b)). In CPython, small integers in the range [-5, 256] are pre-allocated and interned at interpreter startup. Therefore, a = 256; b = 256; a is b evaluates to True. However, x = 1000; y = 1000; x is y may evaluate to False (unless created within the same code block / constant folding).',
    explanation: 'Always use "is" when checking against singletons like None (if x is None:), and use "==" for value comparisons.',
    interviewTips: [
      'Show that empty lists a = []; b = [] evaluate to a == b (True) but a is b (False).',
      'Mention String interning for short identifier-like strings.'
    ],
    companies: ['Amazon', 'Adobe', 'VMware', 'Cisco'],
  },
  {
    title: 'Python List vs Tuple: Performance and Mutability',
    category: 'Programming',
    topic: 'Python',
    difficulty: 'Easy',
    question: 'How do Lists and Tuples differ in Python, and why are Tuples more memory-efficient?',
    answer: 'Lists are mutable (elements can be appended, inserted, or modified); Tuples are immutable. Because lists are dynamic, CPython over-allocates extra buffer capacity to achieve O(1) amortized appends. Tuples have a fixed size, meaning CPython allocates the exact memory needed without over-allocation padding. Furthermore, small tuples (length <= 20) are cached by CPython into free lists for fast re-allocation. Immutable tuples containing only hashable items are also hashable and can serve as dictionary keys.',
    explanation: 'sys.getsizeof([]) is typically larger than sys.getsizeof(()) for equivalent elements due to list over-allocation.',
    interviewTips: [
      'Mention namedtuple from collections module for readable, lightweight data containers.',
      'Show that tuples can contain mutable objects (e.g. tuple with list), in which case the tuple itself cannot be hashed.'
    ],
    companies: ['Infosys', 'Wipro', 'TCS', 'Paypal'],
  },
  {
    title: 'Python Asyncio & Event Loop vs Threading',
    category: 'Programming',
    topic: 'Python',
    difficulty: 'Hard',
    question: 'How does Asyncio achieve concurrency in Python without multi-threading?',
    answer: 'Asyncio provides single-threaded cooperative multitasking using an Event Loop and Coroutines (defined via async def and awaited with await). Unlike OS threading (preemptive multitasking, where the OS kernel arbitrarily interrupts threads and causes race conditions), coroutines cooperatively yield execution back to the event loop only at explicit await points during I/O operations (network, disk). Because only one coroutine executes at any millisecond, lock contention and context-switching overhead are drastically reduced.',
    explanation: 'A blocking CPU-bound call (e.g. time.sleep() instead of await asyncio.sleep()) will freeze the entire event loop and all concurrent tasks.',
    interviewTips: [
      'Distinguish coroutine functions from task objects (asyncio.create_task).',
      'Show how to run blocking code concurrently in a separate thread pool using asyncio.to_thread().'
    ],
    companies: ['FastAPI', 'Discord', 'Uber', 'Meta'],
  },
  {
    title: 'Python *args and **kwargs Mechanism',
    category: 'Programming',
    topic: 'Python',
    difficulty: 'Easy',
    question: 'What are *args and **kwargs, and how are variable-length arguments passed in Python?',
    answer: '*args allows passing an arbitrary number of positional arguments to a function, which Python bundles into an immutable tuple. **kwargs allows passing an arbitrary number of keyword/named arguments, which Python bundles into a dictionary. The asterisk (*) can also be used for argument unpacking when calling functions (e.g., func(*my_list, **my_dict)). Python 3 also supports keyword-only arguments specified after a bare asterisk def func(a, *, b): where b must be passed by keyword.',
    explanation: 'The order in function definitions must always be: standard positional arguments, *args, keyword-only arguments, and finally **kwargs.',
    interviewTips: [
      'Demonstrate unpacking dictionaries into kwargs.',
      'Explain how *args and **kwargs are standard for wrapper functions in decorators.'
    ],
    companies: ['Samsung', 'Dell', 'Capgemini', 'IBM'],
  },
  {
    title: 'Python Dunder Methods and Duck Typing',
    category: 'Programming',
    topic: 'Python',
    difficulty: 'Medium',
    question: 'What are Python Dunder (Magic) methods, and how do they enable Duck Typing?',
    answer: 'Dunder methods (names prefixed and suffixed with double underscores like __init__, __str__, __len__, __getitem__) allow custom classes to hook into Python\'s built-in operators and syntax protocols. Duck Typing is Python\'s philosophy: "If it walks like a duck and quacks like a duck, it\'s a duck." Rather than inspecting an object\'s explicit class hierarchy, Python checks whether the required behavior exists. For instance, implementing __getitem__ and __len__ allows any custom class to support slicing, indexing, and the len() function natively.',
    explanation: 'Python operator overloading is completely driven by dunders: obj1 + obj2 translates to obj1.__add__(obj2).',
    interviewTips: [
      'Contrast __str__ (human-readable string representation) with __repr__ (unambiguous official string, ideally valid Python code to recreate the object).',
      'Explain __enter__ and __exit__ for custom context managers.'
    ],
    companies: ['Spotify', 'Twilio', 'Dropbox', 'Stripe'],
  },
  {
    title: 'Shallow Copy vs Deep Copy in Python',
    category: 'Programming',
    topic: 'Python',
    difficulty: 'Easy',
    question: 'What is the difference between copy.copy() (shallow copy) and copy.deepcopy() (deep copy)?',
    answer: 'A Shallow Copy (copy.copy() or list[:]) constructs a new collection object and inserts references to the elements found in the original. If elements are mutable objects (like nested lists), mutating the nested list in the copy will mutate the original. A Deep Copy (copy.deepcopy()) recursively copies all nested objects, creating fully independent copies in memory so that modifications to any part of the clone have zero effect on the original.',
    explanation: 'For primitive, flat structures, shallow copy is sufficient and avoids the CPU and memory overhead of deep recursion.',
    interviewTips: [
      'Provide a short code example with nested list [[1, 2], [3, 4]] to prove the difference.',
      'Mention how deepcopy tracks visited objects in a memo dictionary to handle circular references safely.'
    ],
    companies: ['Amazon', 'Goldman Sachs', 'Oracle'],
  },
  {
    title: 'Context Managers and the "with" Statement in Python',
    category: 'Programming',
    topic: 'Python',
    difficulty: 'Medium',
    question: 'How does Python\'s "with" statement work, and how do you build a custom Context Manager?',
    answer: 'The with statement simplifies resource management (files, network sockets, DB connections, thread locks) by ensuring cleanup actions run reliably, even if exceptions are thrown. A class implements the Context Management protocol by defining two dunder methods: (1) __enter__() sets up the resource and returns it to the "as" target; (2) __exit__(exc_type, exc_val, exc_tb) handles teardown and cleans up. If an exception occurred, __exit__ can return True to suppress it or False to propagate it.',
    explanation: 'Alternatively, contextlib.contextmanager allows creating context managers from simple generator functions using yield.',
    interviewTips: [
      'Write a simple custom Timer context manager that measures block execution time.',
      'Explain why with open("file.txt") as f: is preferred over manual try-finally f.close().'
    ],
    companies: ['Google', 'Meta', 'Netflix', 'Palantir'],
  },
  {
    title: 'Python Multiple Inheritance & Method Resolution Order (MRO)',
    category: 'Programming',
    topic: 'Python',
    difficulty: 'Hard',
    question: 'How does Python resolve method calls in multiple inheritance, and what is the C3 Linearization algorithm?',
    answer: 'Python supports multiple inheritance. When a method or attribute is called on an instance, Python searches the inheritance tree according to the class\'s Method Resolution Order (MRO), accessible via Class.mro() or Class.__mro__. Since Python 2.3, MRO is computed using the C3 Linearization algorithm. C3 guarantees monotonicity (subclasses always appear before parents) and preserves the local precedence order specified in class definition (e.g. class C(A, B) ensures A precedes B).',
    explanation: 'Calling super().method() in Python does not call the immediate parent—it calls the next class in the computed MRO sequence.',
    interviewTips: [
      'Explain the Diamond Problem (Class D extends B and C, both extending A) and how C3 resolves it cleanly without duplicate calls.',
      'Show that invalid hierarchies that violate monotonicity will throw TypeError at class creation time.'
    ],
    companies: ['Meta', 'Uber', 'Databricks'],
  },
  {
    title: 'Classmethod vs Staticmethod vs Instance Method in Python',
    category: 'Programming',
    topic: 'Python',
    difficulty: 'Easy',
    question: 'What is the distinction between Instance Methods, @classmethod, and @staticmethod in Python?',
    answer: 'Instance methods take self as the first parameter; they can access and modify both instance state (self.x) and class state. Class methods are decorated with @classmethod and take cls as the first parameter; they can modify class-level state that applies across all instances and are commonly used as alternate factory constructors (e.g. Date.from_string()). Static methods are decorated with @staticmethod; they take neither self nor cls and behave like plain functions bound to the class namespace for logical grouping.',
    explanation: 'Static methods cannot access or alter class or instance state directly.',
    interviewTips: [
      'Give a concrete factory constructor example using @classmethod (e.g. Employee.from_json(json_str)).',
      'Explain that calling Class.method() vs instance.method() works for both static and class methods.'
    ],
    companies: ['TCS', 'Infosys', 'Amazon', 'Cisco'],
  },
  {
    title: 'Python Scope Resolution: The LEGB Rule',
    category: 'Programming',
    topic: 'Python',
    difficulty: 'Easy',
    question: 'How does Python search for variables, and what is the LEGB scope rule?',
    answer: 'Python resolves names using the LEGB hierarchy in strict order: (1) L - Local: variables defined inside the current function/lambda; (2) E - Enclosing: variables in the local scope of any enclosing/outer functions (closures); (3) G - Global: variables declared at the top-level of the current module file; (4) B - Built-in: preloaded built-in functions and exceptions (len, range, print). If a variable is not found in any of these 4 scopes, Python raises NameError.',
    explanation: 'To modify an enclosing or global variable inside a nested function, the nonlocal or global keywords must be explicitly used.',
    interviewTips: [
      'Explain UnboundLocalError: assigning x = 5 inside a function causes Python to treat x as local throughout the function, causing an error if accessed before assignment.',
      'Show how nonlocal enables stateful closure counters.'
    ],
    companies: ['Adobe', 'Paypal', 'Cognizant', 'HCL'],
  },

  // =========================================================================
  // C++ TRACK (15 PLACEMENT QUESTIONS)
  // =========================================================================
  {
    title: 'C++ Virtual Functions and the VTable',
    category: 'Programming',
    topic: 'C++',
    difficulty: 'Hard',
    question: 'How does runtime polymorphism work in C++, and what is the role of the vptr and vtable?',
    answer: 'When a class declares a virtual function, the compiler creates a static Virtual Method Table (vtable) containing function pointers to the most-derived implementations. Each object instance of that class contains an invisible pointer (vptr) located at offset 0 pointing to its class\'s vtable. When a virtual function is invoked through a base pointer/reference, the program dereferences the vptr, indexes into the vtable, and calls the appropriate override dynamically.',
    explanation: 'This introduces a tiny runtime cost: dynamic dispatch dereferencing and an additional pointer size (8 bytes on 64-bit systems) per object.',
    interviewTips: [
      'Explain why base class destructors should always be virtual (prevents undefined behavior / memory leak on delete basePtr).',
      'Mention that pure virtual functions (= 0) have NULL or error entries in the vtable.'
    ],
    companies: ['Qualcomm', 'Microsoft', 'NVIDIA', 'Adobe'],
  },
  {
    title: 'C++ Smart Pointers: unique_ptr, shared_ptr, and weak_ptr',
    category: 'Programming',
    topic: 'C++',
    difficulty: 'Medium',
    question: 'Explain the three C++11 smart pointers and how weak_ptr resolves cyclic reference memory leaks.',
    answer: 'Smart pointers implement RAII (Resource Acquisition Is Initialization): (1) std::unique_ptr: exclusive ownership, zero overhead, cannot be copied (move-only via std::move), automatically deletes resource when out of scope; (2) std::shared_ptr: shared ownership, maintains a control block with an atomic reference count; resource is freed when reference count hits 0; (3) std::weak_ptr: non-owning reference to an object managed by shared_ptr. It does not increment the reference count, preventing circular reference memory leaks (e.g. Node A -> Node B -> Node A).',
    explanation: 'To access the object from a weak_ptr, you must call .lock() which atomically returns a shared_ptr if the target is still alive.',
    interviewTips: [
      'Always prefer std::make_unique and std::make_shared because they allocate control block and object in a single contiguous memory block.',
      'Show that unique_ptr has zero memory overhead compared to raw pointers.'
    ],
    companies: ['NVIDIA', 'Google', 'Electronic Arts', 'Qualcomm'],
  },
  {
    title: 'Move Semantics, Rvalue References (&&), and std::move',
    category: 'Programming',
    topic: 'C++',
    difficulty: 'Hard',
    question: 'What are Move Semantics in C++11, and how does std::move eliminate expensive deep copies?',
    answer: 'Prior to C++11, passing or returning temporary objects forced expensive deep copies (allocating new heap memory and copying buffer bytes). Move semantics introduces Rvalue References (Type&&) targeting temporary objects that are about to be destroyed. A Move Constructor or Move Assignment operator steals the internal pointers/resources of the temporary object (setting the source pointer to nullptr) in O(1) time without copying memory. std::move does NOT actually move anything; it is an unconditional static_cast converting an lvalue into an rvalue reference, enabling move constructors.',
    explanation: 'Vector resizing, string returns, and transferring unique_ptr ownership all rely on move semantics for massive performance gains.',
    interviewTips: [
      'Define Lvalue (has persistent memory address, can appear on left of =) vs Rvalue (temporary value with no identifiable memory address).',
      'Explain Rule of 5: if you define Destructor, Copy Constructor, Copy Assignment, you should also define Move Constructor and Move Assignment.'
    ],
    companies: ['Bloomberg', 'Google', 'NVIDIA', 'Amazon'],
  },
  {
    title: 'RAII (Resource Acquisition Is Initialization) in C++',
    category: 'Programming',
    topic: 'C++',
    difficulty: 'Medium',
    question: 'What is RAII in C++, and how does it prevent resource leaks in the presence of exceptions?',
    answer: 'RAII binds the lifecycle of a resource (heap memory, file handles, database connections, mutex locks) to the lifetime of a stack-allocated object. Resource acquisition occurs inside the constructor. When the stack object goes out of scope—whether through standard function exit, return, or an unhandled exception triggering stack unwinding—its destructor is guaranteed by the C++ compiler to execute automatically, releasing the resource.',
    explanation: 'std::lock_guard, std::unique_ptr, and std::fstream are canonical examples of RAII in the C++ standard library.',
    interviewTips: [
      'Contrast RAII with Java/C# try-finally blocks or GC finalizers.',
      'Explain that destructors should never throw exceptions (destructor is noexcept by default in C++11).'
    ],
    companies: ['Cisco', 'Adobe', 'Microsoft', 'Morgan Stanley'],
  },
  {
    title: 'Diamond Problem and Virtual Inheritance in C++',
    category: 'Programming',
    topic: 'C++',
    difficulty: 'Hard',
    question: 'What is the Diamond Problem in C++ multiple inheritance, and how does virtual base class inheritance resolve it?',
    answer: 'The Diamond Problem occurs when class D inherits from both B and C, and both B and C inherit from a common base class A. Without virtual inheritance, class D contains two distinct, duplicated sub-objects of class A (one via B, one via C). This creates ambiguity (d.member is ambiguous) and wastes memory. Virtual inheritance (class B : virtual public A) forces the compiler to maintain only a single shared instance of base class A in the most-derived object D, resolved through an internal virtual base pointer (vbptr).',
    explanation: 'When virtual inheritance is used, the most-derived class (D) is directly responsible for calling the constructor of the virtual base class (A).',
    interviewTips: [
      'Draw the diamond diagram on whiteboard.',
      'Explain why C++ allows multiple inheritance while Java only allows multiple interface implementations.'
    ],
    companies: ['Oracle', 'Qualcomm', 'Electronic Arts'],
  },
  {
    title: 'Stack vs Heap Memory Allocation in C++',
    category: 'Programming',
    topic: 'C++',
    difficulty: 'Easy',
    question: 'How does Stack memory allocation differ from Heap memory allocation in C++?',
    answer: 'Stack memory is managed automatically by the CPU architecture. Memory allocation involves simply moving the stack pointer register (SP), making it virtually instantaneous. Variables are allocated during function execution and deallocated automatically on function return. Heap memory is allocated dynamically at runtime via new/malloc in a large pool of free memory. It must be manually deallocated using delete/free (or smart pointers); otherwise memory leaks occur. Heap allocation involves searching free lists and fragmentation overhead, making it significantly slower.',
    explanation: 'Stack memory is limited (typically 1-8 MB), causing Stack Overflow on deep recursion or huge local arrays int arr[1000000]. Large buffers must be allocated on the Heap.',
    interviewTips: [
      'Always use delete[] for arrays allocated with new[].',
      'Mention that modern C++ prefers std::vector on the stack whose internal buffer is dynamically managed on the heap.'
    ],
    companies: ['Intel', 'Texas Instruments', 'Qualcomm'],
  },
  {
    title: 'Const Correctness and the "mutable" Keyword in C++',
    category: 'Programming',
    topic: 'C++',
    difficulty: 'Medium',
    question: 'What is Const Correctness, and what is the role of the "mutable" keyword in C++?',
    answer: 'Const correctness is the practice of using const to declare that an object, parameter, pointer, or member function will not modify state. A const member function void display() const guarantees it will not alter any member variables of the calling object. The mutable keyword allows a specific member variable to be modified even inside a const member function. It is used for variables that represent internal implementation details rather than external logical state (e.g., caching return values, hit counters, mutex locks).',
    explanation: 'Pointers have two distinct const positions: const int* p (pointer to constant int; data cannot change) vs int* const p (constant pointer to int; address cannot change).',
    interviewTips: [
      'Explain the "read right-to-left" trick for parsing complex const pointers.',
      'Show a thread-safe getter where a mutable std::mutex is locked inside a const getter method.'
    ],
    companies: ['Amazon', 'Bloomberg', 'NVIDIA'],
  },
  {
    title: 'C++ Templates & Template Specialization',
    category: 'Programming',
    topic: 'C++',
    difficulty: 'Hard',
    question: 'How do C++ Templates work at compile-time, and what is Full vs Partial Template Specialization?',
    answer: 'Templates enable generic programming without runtime overhead. The compiler generates concrete classes or functions at compile-time (template instantiation) for each distinct type used. Template Specialization allows overriding the default generic implementation for specific types. Full Specialization specifies concrete types for all template parameters (template<> class MyClass<int>). Partial Specialization customizes for a subset of parameters or compound patterns (e.g., template<typename T> class MyClass<T*> specializing for all pointer types).',
    explanation: 'Function templates support full specialization and overloading, but do NOT support partial specialization (only class templates support partial specialization).',
    interviewTips: [
      'Explain std::vector<bool> as a famous example of full template specialization in the STL (packed into 1 bit per boolean).',
      'Mention that templates must typically be implemented in header (.h) files because the compiler needs full definitions during instantiation.'
    ],
    companies: ['Google', 'Microsoft', 'Tower Research'],
  },
  {
    title: 'Inline Functions vs Preprocessor #define Macros',
    category: 'Programming',
    topic: 'C++',
    difficulty: 'Easy',
    question: 'Why are inline functions preferred over #define preprocessor macros in C++?',
    answer: 'Macros (#define SQUARE(x) (x*x)) are simple text substitutions handled by the preprocessor before compilation; they lack type safety, do not respect scope, cannot be debugged with breakpoints, and cause subtle side-effect bugs (e.g. SQUARE(x++) expands to (x++ * x++) evaluating x twice). Inline functions (inline int square(int x)) are true functions handled by the compiler: they are type-checked, follow scoping rules, evaluate arguments exactly once, and can be inlined by the compiler (substituting the function body directly at call site) to eliminate function call overhead.',
    explanation: 'The inline keyword is a hint to the compiler; modern compilers automatically inline small functions based on cost-benefit heuristics even without the keyword.',
    interviewTips: [
      'Mention constexpr functions in C++11/14/17 which can evaluate at compile-time.',
      'Show how macro pitfalls fail on expressions with operators.'
    ],
    companies: ['Cisco', 'Samsung', 'Intel'],
  },
  {
    title: 'Friend Class and Friend Functions in C++',
    category: 'Programming',
    topic: 'C++',
    difficulty: 'Medium',
    question: 'What are Friend functions and Friend classes in C++, and when are they used?',
    answer: 'A friend function or friend class is granted access to the private and protected members of another class. Friendship is declared inside the target class using the friend keyword. It is not reciprocal (if A is friend of B, B is not automatically friend of A) and not transitive (if A is friend of B and B is friend of C, A is not friend of C), nor inherited. Key use-case: overloading stream insertion/extraction operators (operator<< and operator>>) where the left operand is std::ostream rather than the class instance.',
    explanation: 'While breaking strict encapsulation, friendship is valuable for tight unit tests or collaborating data structures (e.g. LinkedList declaring LinkedListIterator as a friend).',
    interviewTips: [
      'Write the signature: friend std::ostream& operator<<(std::ostream& os, const MyClass& obj).',
      'Explain that friendship must be granted by the class itself; an external class cannot forcefully declare itself a friend.'
    ],
    companies: ['Oracle', 'Adobe', 'TCS'],
  },
  {
    title: 'Operator Overloading Guidelines in C++',
    category: 'Programming',
    topic: 'C++',
    difficulty: 'Medium',
    question: 'How does Operator Overloading work in C++, and which operators cannot be overloaded?',
    answer: 'Operator overloading allows user-defined types to use standard C++ operators (+, -, *, ==, [], ()) with customized semantics. Operators can be overloaded as member functions (first operand is *this) or non-member functions (useful when left operand is a primitive or foreign type). Operators that CANNOT be overloaded: (1) Scope resolution operator (::), (2) Member selector (.), (3) Member pointer selector (.*), (4) Ternary conditional operator (?:), and (5) sizeof operator. C++20 also introduced the Three-way comparison spaceship operator (<=>).',
    explanation: 'Overloading should preserve intuitive mathematical properties (e.g., if + is overloaded, += should usually be overloaded with matching semantics).',
    interviewTips: [
      'Show how operator[] can return a reference to allow both reads and writes (arr[i] = val).',
      'Explain pre-increment (++x) vs post-increment (x++) overloading (post-increment takes a dummy int parameter).'
    ],
    companies: ['Microsoft', 'Goldman Sachs', 'Sony'],
  },
  {
    title: 'C++ Lambda Expressions & Capture Lists',
    category: 'Programming',
    topic: 'C++',
    difficulty: 'Medium',
    question: 'How do C++11 Lambda Expressions work, and what is the difference between [=], [&], and explicit captures?',
    answer: 'Lambdas are anonymous callable function objects defined inline with syntax: [capture](parameters) -> return_type { body }. The capture list determines how variables from the enclosing scope are accessed: (1) [=] captures all enclosing variables by value (read-only copy); (2) [&] captures all enclosing variables by reference; (3) [this] captures the current class instance pointer; (4) [x, &y] explicitly captures x by value and y by reference. C++14 introduced generic lambdas (auto parameter types) and initialized capture ([p = std::move(ptr)]).',
    explanation: 'Under the hood, the compiler creates an unnamed functor class containing captured variables as member fields and overloads operator().',
    interviewTips: [
      'Warn about dangling references: capturing local variables by reference [&] in a lambda that outlives the enclosing function causes undefined behavior.',
      'Show how std::sort uses a lambda comparator.'
    ],
    companies: ['Bloomberg', 'Uber', 'NVIDIA'],
  },
  {
    title: 'Sizeof an Empty Class in C++',
    category: 'Programming',
    topic: 'C++',
    difficulty: 'Easy',
    question: 'What is sizeof(EmptyClass) in C++, and why is it not 0?',
    answer: 'In C++, sizeof an empty class (class Empty {};) is 1 byte (never 0). This is because every distinct object in C++ must have a unique memory address in RAM. If sizeof were 0, an array Empty arr[10]; would have all 10 elements sharing the exact same memory address (&arr[0] == &arr[1]), violating pointer arithmetic rules. However, under Empty Base Optimization (EBO), if an empty class is inherited as a base class, compilers optimize it to occupy 0 bytes in the derived class layout.',
    explanation: 'If the class contains a virtual function, its size becomes 8 bytes (on 64-bit systems) due to the vptr pointer.',
    interviewTips: [
      'Mention Empty Base Optimization (EBO) and how std::unique_ptr uses it with custom deleters.',
      'Show how adding virtual functions changes the size from 1 to 8 bytes.'
    ],
    companies: ['Qualcomm', 'Apple', 'Intel'],
  },
  {
    title: 'Vector Capacity Doubling & Iterator Invalidation',
    category: 'Programming',
    topic: 'C++',
    difficulty: 'Medium',
    question: 'How does std::vector allocate memory dynamically, and when does Iterator Invalidation occur?',
    answer: 'std::vector maintains three pointers: start, finish (current size), and end_of_storage (capacity). When elements exceed capacity during push_back(), the vector allocates a new contiguous memory block (typically 2x the old capacity in GCC/Clang or 1.5x in MSVC), moves/copies existing elements to the new block, and deletes the old memory. Iterator Invalidation occurs during this reallocation: all existing pointers, references, and iterators to vector elements point to the deallocated old block and become dangling pointers (undefined behavior).',
    explanation: 'Using vector.reserve(N) pre-allocates buffer capacity in advance, preventing reallocations and iterator invalidation during insertions.',
    interviewTips: [
      'Explain amortized O(1) time complexity of push_back().',
      'Explain why erasing an element from vector invalidates all iterators at or after the erased position.'
    ],
    companies: ['Google', 'Amazon', 'Electronic Arts'],
  },
  {
    title: 'Exception Safety Guarantees in C++',
    category: 'Programming',
    topic: 'C++',
    difficulty: 'Hard',
    question: 'What are the 4 levels of Exception Safety Guarantees in C++ software engineering?',
    answer: 'The 4 levels (established by David Abrahams) are: (1) No-Throw Guarantee (Nothrow): the function never throws exceptions and always succeeds (declared noexcept; required for destructors, move constructors, and swap); (2) Strong Exception Guarantee (Commit or Rollback): if an exception is thrown, the program state remains exactly as it was before the function call (transactional); (3) Basic Exception Guarantee: if an exception is thrown, no resources or memory are leaked, and all invariants remain valid, but state may have changed; (4) No Guarantee: memory leaks or corrupted state occurs on exception.',
    explanation: 'The Copy-and-Swap idiom is the gold standard design pattern for achieving the Strong Exception Guarantee in assignment operators.',
    interviewTips: [
      'Explain the Copy-and-Swap idiom step-by-step.',
      'Explain why std::vector::push_back only uses move constructor if it is marked noexcept (otherwise falls back to copying to maintain strong exception safety).'
    ],
    companies: ['Microsoft', 'Morgan Stanley', 'Bloomberg'],
  },

  // =========================================================================
  // JAVASCRIPT CORE TRACK (15 PLACEMENT QUESTIONS)
  // =========================================================================
  {
    title: 'JavaScript Event Loop & Concurrency Model',
    category: 'Programming',
    topic: 'JavaScript',
    difficulty: 'Medium',
    question: 'How does the JavaScript Event Loop work, and what is the difference between Microtasks and Macrotasks?',
    answer: 'JavaScript is single-threaded with a non-blocking I/O event-driven concurrency model. Synchronous code executes on the Call Stack. Asynchronous callbacks are delegated to browser WebAPIs/Node libuv and placed into two priority queues: Microtask Queue (Promises, queueMicrotask, MutationObserver) and Macrotask/Task Queue (setTimeout, setInterval, setImmediate, I/O). After the Call Stack empties, the Event Loop processes the entire Microtask Queue before picking the next task from the Macrotask Queue.',
    explanation: 'A common bug occurs when students assume setTimeout(fn, 0) executes before Promise.resolve(). Because microtasks have strictly higher priority, Promise handlers will always preempt setTimeout(fn, 0) callbacks within the same tick.',
    interviewTips: [
      'Draw the Call Stack, Web APIs, Microtask Queue, and Callback Queue.',
      'Explain that process.nextTick in Node.js has an even higher priority microtask queue.',
      'Mention that an infinite microtask loop (e.g. recursive Promise.resolve) will starve the UI and Macrotasks.'
    ],
    companies: ['Amazon', 'Google', 'Microsoft', 'Atlassian'],
  },
  {
    title: 'Closures and Lexical Scope in JavaScript',
    category: 'Programming',
    topic: 'JavaScript',
    difficulty: 'Easy',
    question: 'What is a Closure in JavaScript, and what are its primary practical applications?',
    answer: 'A closure is the combination of a function bundled together with references to its surrounding state (lexical environment). In JavaScript, closures are created every time a function is created, at function creation time. A closure gives an inner function access to an outer function\'s scope even after the outer function has returned.',
    explanation: 'Common real-world applications include data encapsulation/privacy (emulating private methods before ES private class fields), currying and partial application, memoization wrappers, and event listener handlers that preserve state.',
    interviewTips: [
      'Show the classic for (var i = 0; i < 3; i++) setTimeout bug and how let or an IIFE fixes it.',
      'Warn about memory leaks if closures retain large objects that are no longer needed.'
    ],
    companies: ['Uber', 'Meta', 'Swiggy', 'Flipkart'],
  },
  {
    title: 'Debounce vs Throttle Implementation in JavaScript',
    category: 'Programming',
    topic: 'JavaScript',
    difficulty: 'Medium',
    question: 'What is the operational difference between Debouncing and Throttling, and how do you write both from scratch?',
    answer: 'Debounce delays function execution until after a specified quiet period has elapsed since the LAST time it was invoked (e.g. search autocomplete typing). Every new event resets the timer. Throttle limits function execution to at most once per specified time interval (e.g. window resize, scroll position monitoring), ignoring additional events during the cooldown period.',
    explanation: 'Debounce waits for silence; throttle guarantees steady periodic execution during continuous activity.',
    interviewTips: [
      'Write the debounce function: function debounce(fn, delay) { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; }',
      'Explain leading vs trailing edge execution.'
    ],
    companies: ['Flipkart', 'Swiggy', 'Razorpay', 'CRED'],
  },
  {
    title: 'Hoisting and the Temporal Dead Zone (TDZ)',
    category: 'Programming',
    topic: 'JavaScript',
    difficulty: 'Easy',
    question: 'How does Hoisting work in JavaScript, and what is the Temporal Dead Zone for let and const?',
    answer: 'During JavaScript creation/compilation phase, variable and function declarations are hoisted to the top of their scope. var declarations are hoisted and initialized with undefined, allowing them to be read before declaration without error. let and const declarations are hoisted but remain UNINITIALIZED. The period between entering scope and reaching the declaration line is the Temporal Dead Zone (TDZ); accessing the variable inside the TDZ throws ReferenceError.',
    explanation: 'Function declarations are hoisted completely with their implementation body, whereas function expressions assigned to variables follow variable hoisting rules.',
    interviewTips: [
      'Demonstrate why typeof unassignedVar returns "undefined", but typeof tdzVar inside TDZ throws ReferenceError.',
      'Explain block scoping for let/const vs function scoping for var.'
    ],
    companies: ['Infosys', 'Wipro', 'Adobe', 'Cisco'],
  },
  {
    title: 'Promises, Async/Await, and Promise Combinators',
    category: 'Programming',
    topic: 'JavaScript',
    difficulty: 'Medium',
    question: 'Explain Promise.all, Promise.allSettled, Promise.race, and Promise.any with real use cases.',
    answer: '1. Promise.all: Waits for ALL promises to resolve; rejects immediately if ANY promise rejects (fail-fast, useful for dependent batch queries). 2. Promise.allSettled: Waits for all promises to settle (resolve or reject); returns array of {status, value/reason}; never short-circuits. 3. Promise.race: Settles with the outcome of the FIRST promise that settles (useful for request timeout wrappers). 4. Promise.any: Resolves with the FIRST fulfilled value; rejects only if ALL reject with an AggregateError.',
    explanation: 'async/await is syntactic sugar over generators and promises, allowing asynchronous code to be written synchronously with standard try/catch.',
    interviewTips: [
      'Show how to implement a timeout with Promise.race([fetchData(), timeout(5000)]).',
      'Mention that unhandled promise rejections crash Node.js processes in modern versions.'
    ],
    companies: ['Paypal', 'Amazon', 'Atlassian', 'Microsoft'],
  },
  {
    title: 'Call, Apply, and Bind Methods in JavaScript',
    category: 'Programming',
    topic: 'JavaScript',
    difficulty: 'Easy',
    question: 'How do call(), apply(), and bind() alter the "this" context of functions in JavaScript?',
    answer: 'call(), apply(), and bind() explicitly bind a custom "this" context to a function. (1) call(thisArg, arg1, arg2): invokes function immediately with comma-separated arguments; (2) apply(thisArg, [argsArray]): invokes function immediately with arguments passed as an array; (3) bind(thisArg, arg1, arg2): DOES NOT invoke function immediately; returns a new bound function with permanently set "this" and optional curried arguments.',
    explanation: 'Arrow functions DO NOT have their own "this"; they lexically inherit "this" from the surrounding outer scope, so call, apply, and bind have no effect on arrow functions.',
    interviewTips: [
      'Mnemonic: Call for Comma-separated, Apply for Array of arguments.',
      'Show how Math.max.apply(null, [1, 5, 2]) was used before ES6 spread syntax (...).'
    ],
    companies: ['Cognizant', 'TCS', 'Paytm', 'Capgemini'],
  },
  {
    title: 'Prototypal Inheritance & The Prototype Chain',
    category: 'Programming',
    topic: 'JavaScript',
    difficulty: 'Medium',
    question: 'How does prototypal inheritance work under the hood in JavaScript, and what is Object.prototype?',
    answer: 'Every JavaScript object has an internal slot [[Prototype]] linking to another object. When accessing a property obj.prop, JavaScript engine searches obj itself; if not found, it traverses obj.__proto__, continuing up the chain until found or until null is reached (top of chain is Object.prototype.__proto__ === null). ES6 classes are syntactic sugar over this prototypal mechanism.',
    explanation: 'Methods defined on Class.prototype are shared across all instances in memory, saving significant RAM compared to declaring methods inside constructor closures.',
    interviewTips: [
      'Contrast classical OOP inheritance (class-based copy) with JavaScript prototypical delegation (live pointer reference).',
      'Explain Object.create(parentObj) and hasOwnProperty().'
    ],
    companies: ['Google', 'Meta', 'Amazon', 'Adobe'],
  },
  {
    title: 'Deep Copy vs Shallow Copy & structuredClone in JavaScript',
    category: 'Programming',
    topic: 'JavaScript',
    difficulty: 'Medium',
    question: 'What is the difference between shallow and deep copy, and why is structuredClone preferred over JSON methods?',
    answer: 'Shallow copy (e.g. Object.assign({}, obj) or {...obj}) only copies top-level primitives; nested object references are shared. Mutating a nested property affects both copies. Deep copy duplicates the entire nested structure. JSON.parse(JSON.stringify(obj)) has severe flaws: it strips functions, undefined, and Symbol, turns Date to string, throws on BigInt, and crashes on cyclic references. The modern standard structuredClone(obj) copies nested objects cleanly and handles circular references, Dates, and Sets.',
    explanation: 'For production performance, structuredClone executes native C++ traversal inside V8 engine without string serialization overhead.',
    interviewTips: [
      'Show that spread operator {...user, address: {...user.address}} is shallow beyond level 1.',
      'Explain how a WeakMap can track visited nodes to handle circular references in a custom recursive clone.'
    ],
    companies: ['Microsoft', 'Uber', 'Razorpay', 'Atlassian'],
  },
  {
    title: 'Currying and Function Composition in JavaScript',
    category: 'Programming',
    topic: 'JavaScript',
    difficulty: 'Medium',
    question: 'What is function currying in JavaScript, and how do you write an infinite curry function add(1)(2)...(n)?',
    answer: 'Currying transforms a multi-argument function f(a, b, c) into a chain of single-argument unary functions f(a)(b)(c). It enables partial application and function composition. An infinite curry function uses closures and overrides valueOf() or Symbol.toPrimitive: function add(a) { const next = (b) => add(a + b); next.valueOf = () => a; return next; }.',
    explanation: 'Currying is heavily used in functional utilities (Ramda, Lodash/fp) and middleware pipelines (Redux middleware currying (store) => (next) => (action)).',
    interviewTips: [
      'Write a generic curry(fn) utility that checks if args.length >= fn.length.',
      'Explain how currying improves code reusability (e.g., const logError = log("ERROR")).'
    ],
    companies: ['Salesforce', 'Flipkart', 'Intuit', 'CRED'],
  },
  {
    title: 'JavaScript Memory Leaks: Detached DOM, Timers & Closures',
    category: 'Programming',
    topic: 'JavaScript',
    difficulty: 'Hard',
    question: 'What are the most common causes of Memory Leaks in JavaScript Single Page Applications, and how do you detect them?',
    answer: 'Common causes: (1) Forgotten setInterval/setTimeout callbacks holding closures over component state; (2) Detached DOM trees: removing a DOM element from document while keeping a JS variable reference; (3) Unremoved global window/document event listeners; (4) Closures unintentionally retaining large outer variables; (5) Growing Map/Set collections without cleanup. Detect using Chrome DevTools Memory tab: Take Heap Snapshots and compare "Delta", or run Allocation Instrumentation on Timeline.',
    explanation: 'Mark-and-Sweep garbage collection cannot collect objects reachable from root references (window, active closures, DOM tree).',
    interviewTips: [
      'Always emphasize cleanup returns in React useEffect (clearInterval, removeEventListener).',
      'Explain WeakMap and WeakSet for garbage-collection friendly caching.'
    ],
    companies: ['Meta', 'Netflix', 'Airbnb', 'Spotify'],
  },
  {
    title: 'Map vs Object & WeakMap vs WeakSet in ES6',
    category: 'Programming',
    topic: 'JavaScript',
    difficulty: 'Medium',
    question: 'Why would you use ES6 Map over a plain Object, and what makes WeakMap unique?',
    answer: 'Map advantages over Object: (1) Keys can be ANY data type (including functions and objects), whereas Object keys are restricted to Strings and Symbols; (2) Preserves insertion order during iteration; (3) Built-in size property (no Object.keys(obj).length); (4) Better performance in frequent key addition/removal. WeakMap holds WEAK references to object keys: if no other reference exists to a key object, both key and value are automatically garbage-collected. WeakMap is not iterable and has no size property.',
    explanation: 'WeakMaps are ideal for private class data and associating metadata with DOM elements without preventing DOM garbage collection.',
    interviewTips: [
      'State clearly that WeakMap keys MUST be objects, not primitive numbers or strings.',
      'Explain why WeakMap cannot be iterated: because Garbage Collector timing is non-deterministic.'
    ],
    companies: ['Amazon', 'Google', 'Cisco', 'Stripe'],
  },
  {
    title: 'Generator Functions and Iterators (Symbol.iterator)',
    category: 'Programming',
    topic: 'JavaScript',
    difficulty: 'Hard',
    question: 'How do Generator functions (function*) work, and how do they relate to the Iterable Protocol?',
    answer: 'Generator functions (syntax: function*) return a Generator object that conforms to both Iterable and Iterator protocols. Execution can be paused using the "yield" keyword and resumed with .next(). Each .next(arg) call returns { value: any, done: boolean } and can optionally pass a value back into the generator where it last yielded. Any object implementing [Symbol.iterator]() can be iterated using for...of and spread operators (...).',
    explanation: 'Generators enable infinite sequences, custom lazy pipelines (reading gigabyte files line-by-line), and form the foundation of saga libraries (Redux-Saga).',
    interviewTips: [
      'Demonstrate implementing [Symbol.iterator] on a custom LinkedList or Tree.',
      'Explain how async/await was originally polyfilled using Generators + Promises (co library).'
    ],
    companies: ['Atlassian', 'Bloomberg', 'Morgan Stanley'],
  },
  {
    title: 'JavaScript Type Coercion: == vs === and Object.is',
    category: 'Programming',
    topic: 'JavaScript',
    difficulty: 'Easy',
    question: 'Explain the difference between abstract equality (==), strict equality (===), and Object.is() in JavaScript.',
    answer: 'Abstract equality (==) performs implicit type coercion according to the Abstract Equality Comparison Algorithm before checking value (e.g. 0 == "0" is true, false == 0 is true, null == undefined is true). Strict equality (===) checks both type and value without coercion (0 === "0" is false). However, === fails in two edge cases: NaN === NaN evaluates to FALSE, and +0 === -0 evaluates to TRUE. Object.is() handles both edge cases correctly: Object.is(NaN, NaN) is true, and Object.is(+0, -0) is false.',
    explanation: 'React uses Object.is() internally in React.memo and Object equality checks for hooks.',
    interviewTips: [
      'Explain the 8 falsy values: false, 0, -0, 0n, "", null, undefined, NaN.',
      'Explain why [] == ![] evaluates to true ([] == false -> [] == 0 -> "" == 0 -> 0 == 0 -> true).'
    ],
    companies: ['Cognizant', 'TCS', 'Infosys', 'Capgemini'],
  },
  {
    title: 'Event Bubbling, Capturing, and Event Delegation',
    category: 'Programming',
    topic: 'JavaScript',
    difficulty: 'Easy',
    question: 'What are Event Bubbling and Event Capturing in the DOM, and how does Event Delegation optimize performance?',
    answer: 'DOM events propagate in 3 phases: (1) Capturing phase: event travels down from window to target; (2) Target phase; (3) Bubbling phase: event bubbles up from target back to window. Event Delegation is a performance optimization pattern where a single event listener is attached to a parent element rather than attaching separate listeners to hundreds of child elements (e.g. list items). When any child is clicked, the event bubbles up to the parent, which inspects e.target to identify the clicked child.',
    explanation: 'Event Delegation drastically reduces memory footprint and automatically handles dynamically inserted elements without reattaching listeners.',
    interviewTips: [
      'Explain e.stopPropagation() (stops propagation up/down) vs e.preventDefault() (stops default browser behavior like anchor tag navigation).',
      'Explain addEventListener third parameter: useCapture (boolean).'
    ],
    companies: ['Swiggy', 'Zomato', 'Microsoft', 'Uber'],
  },
  {
    title: 'Web Workers and Multi-Threading in Browser JavaScript',
    category: 'Programming',
    topic: 'JavaScript',
    difficulty: 'Hard',
    question: 'How do Web Workers allow running CPU-intensive operations without freezing the browser UI?',
    answer: 'Because the main browser thread runs UI rendering, user interaction, and JavaScript execution, heavy computations (image processing, large dataset sorting, cryptographic hashing) block the main thread, causing frame drops (jank) and frozen buttons. Web Workers run in an isolated background thread with their own global scope (DedicatedWorkerGlobalScope) and communicate with the main thread via asynchronous message passing (postMessage and onmessage) using structured cloning or ArrayBuffer transfers.',
    explanation: 'Web Workers DO NOT have access to the DOM, window, or document objects, preventing thread concurrency race conditions on DOM elements.',
    interviewTips: [
      'Mention SharedArrayBuffer and Atomics for zero-copy shared memory between threads.',
      'Contrast Dedicated Web Workers, Shared Workers, and Service Workers (used for offline PWA caching).'
    ],
    companies: ['Figma', 'Canva', 'Google', 'Adobe'],
  },

  // =========================================================================
  // REACT & MODERN WEB DEVELOPMENT (10 QUESTIONS)
  // =========================================================================
  {
    title: 'React Fiber Architecture and Reconciliation',
    category: 'Web Development',
    topic: 'React',
    difficulty: 'Hard',
    question: 'What is React Fiber, and how does it improve over the legacy stack reconciler?',
    answer: 'React Fiber is a complete rewrite of React\'s reconciliation engine that represents the component tree as a linked list of Fiber nodes. The old Stack Reconciler was synchronous and recursive: once rendering started, it could not be interrupted, dropping animation frames on deep component trees. Fiber breaks rendering work into incremental units, allowing React to pause, resume, prioritize (urgent user input vs offscreen rendering), and abort work.',
    explanation: 'Fiber splits rendering into two phases: the asynchronous Render Phase (can be paused/restarted) and the synchronous Commit Phase (applies changes to DOM).',
    interviewTips: [
      'Connect Fiber to modern Concurrent Features: useTransition, Suspense, and startTransition.',
      'Explain how the diffing algorithm operates in O(n) by checking element type and keys.'
    ],
    companies: ['Meta', 'Netflix', 'Uber', 'Airbnb'],
  },
  {
    title: 'React useEffect Lifecycle & Stale Closures',
    category: 'Web Development',
    topic: 'React',
    difficulty: 'Medium',
    question: 'Why do stale closures happen inside useEffect and useCallback, and how do you resolve them?',
    answer: 'A stale closure occurs when a callback or effect captures state/props variables from an earlier render cycle because those variables were omitted from its dependency array. Because the closure references the older lexical environment, invoking it yields out-of-date state. Solutions include: (1) accurately declaring all captured variables in the dependency array, (2) using functional state updates (setCount(prev => prev + 1)), or (3) using useRef to store mutable values that do not trigger re-renders.',
    explanation: 'Using functional state updates avoids re-subscribing intervals/listeners on every single render.',
    interviewTips: [
      'Highlight the useEffect cleanup return function and when it runs (before the next effect run and on unmount).',
      'Explain why disabling the eslint-plugin-react-hooks exhaustive-deps rule is an anti-pattern.'
    ],
    companies: ['Razorpay', 'CRED', 'Flipkart', 'Stripe'],
  },
  {
    title: 'React Virtual DOM and Diffing Algorithm',
    category: 'Web Development',
    topic: 'React',
    difficulty: 'Medium',
    question: 'How does React\'s Virtual DOM work, and how does the reconciliation diffing algorithm achieve O(N) performance?',
    answer: 'The Virtual DOM is a lightweight JavaScript object representation of the real DOM. When state changes, React constructs a new Virtual DOM tree and diffs it against the previous tree. Standard tree edit distance algorithms run in O(N^3). React uses two heuristic assumptions to achieve O(N): (1) Two elements of different types produce different trees (React tears down the old tree completely); (2) Elements with the same "key" attribute are stable across renders, allowing React to match and reorder children efficiently.',
    explanation: 'Keys should never be array indices if the list can be filtered, sorted, or mutated, as index keys degrade diffing and cause state corruption in uncontrolled inputs.',
    interviewTips: [
      'Explain why direct DOM manipulation is slow (triggers expensive browser Layout and Paint operations).',
      'Explain React Batching (automatic batching in React 18 for promises, timeouts, and native events).'
    ],
    companies: ['Meta', 'Netflix', 'Airbnb', 'CRED'],
  },
  {
    title: 'Node.js Streams and Backpressure Handling',
    category: 'Web Development',
    topic: 'Node.js',
    difficulty: 'Medium',
    question: 'What is Backpressure in Node.js streams, and how do you prevent buffer overflow when writing large files?',
    answer: 'Backpressure occurs when the producer of data emits data faster than the consumer can process or write it (e.g., reading a fast disk file and writing over a slow network socket). Without backpressure control, unconsumed chunks accumulate in RAM, triggering high memory usage and Node crashes. Streams handle backpressure using return values from stream.write(): when write() returns false, the buffer is full (highWaterMark reached), and the producer should pause until the consumer emits the \'drain\' event.',
    explanation: 'The pipeline() function or stream.pipe() automatically orchestrates backpressure and cleans up descriptors on error.',
    interviewTips: [
      'Always advocate stream.pipeline(readable, transform, writable, callback) over .pipe() because pipeline handles automatic error teardown.',
      'Mention the four stream types: Readable, Writable, Duplex, and Transform.'
    ],
    companies: ['PayPal', 'LinkedIn', 'Walmart', 'Twilio'],
  },
  {
    title: 'Cross-Origin Resource Sharing (CORS) & Preflight OPTIONS',
    category: 'Web Development',
    topic: 'Web Development',
    difficulty: 'Medium',
    question: 'How does CORS security work in browsers, and what triggers an HTTP Preflight OPTIONS request?',
    answer: 'CORS is a browser security mechanism that restricts cross-origin HTTP requests originating from client scripts. When a web application makes a request to a different origin (protocol, domain, or port), the browser sends headers (Origin). The server must respond with Access-Control-Allow-Origin matching the requester. A Preflight Request (OPTIONS) is automatically sent by the browser before the actual request if the request is NOT a "Simple Request" (e.g. methods other than GET/POST/HEAD, Content-Type other than text/plain or multipart, or custom Authorization headers).',
    explanation: 'CORS is strictly enforced by the BROWSER, not by server-to-server HTTP calls (e.g., curl or Postman bypass CORS entirely).',
    interviewTips: [
      'Explain the Access-Control-Allow-Headers and Access-Control-Allow-Credentials headers.',
      'Explain how a server reverse proxy (like Nginx) can eliminate CORS by hosting client and API under the same origin.'
    ],
    companies: ['Cloudflare', 'Stripe', 'Twilio', 'Amazon'],
  },
  {
    title: 'Web Storage: LocalStorage vs SessionStorage vs Cookies',
    category: 'Web Development',
    topic: 'Web Development',
    difficulty: 'Easy',
    question: 'Compare LocalStorage, SessionStorage, and HTTP Cookies in terms of capacity, lifecycle, and security.',
    answer: '1. LocalStorage: ~5-10 MB capacity, persists across browser sessions until explicitly cleared, accessible via JavaScript (vulnerable to XSS). 2. SessionStorage: ~5 MB capacity, scoped to current tab session, cleared when tab closes. 3. Cookies: ~4 KB capacity, sent with every HTTP request to server (increases payload size), configurable expiration. Security flags: HttpOnly prevents JavaScript access (mitigating XSS theft of auth tokens), Secure enforces HTTPS transmission, SameSite (Strict/Lax) mitigates CSRF attacks.',
    explanation: 'Never store JWT authentication tokens in LocalStorage if sensitive; use HttpOnly Secure SameSite cookies to protect against XSS token harvesting.',
    interviewTips: [
      'Explain the difference between XSS (Cross-Site Scripting) and CSRF (Cross-Site Request Forgery).',
      'Detail the 3 SameSite values: Strict, Lax, None.'
    ],
    companies: ['Auth0', 'Stripe', 'Google', 'Amazon'],
  },
  {
    title: 'WebSockets vs Server-Sent Events (SSE) vs Long Polling',
    category: 'Web Development',
    topic: 'Web Development',
    difficulty: 'Medium',
    question: 'How do WebSockets, Server-Sent Events (SSE), and Long Polling differ for real-time applications?',
    answer: '1. WebSockets: Full-duplex, bidirectional communication over a single persistent TCP connection. Initiated via HTTP handshake and upgraded (101 Switching Protocols). Ideal for interactive apps like chat, gaming, collaborative editors. 2. Server-Sent Events (SSE): Unidirectional communication (server to client only) over standard HTTP streaming using text/event-stream. Features built-in automatic reconnection and message IDs. Ideal for stock tickers, notification feeds. 3. Long Polling: Client opens request; server holds it open until new data is available or timeout, then client immediately reconnects. Inefficient with high HTTP overhead.',
    explanation: 'SSE operates over standard HTTP/2 multiplexing natively through browser EventSource API with zero third-party libraries.',
    interviewTips: [
      'Show that WebSockets can be blocked by certain corporate firewalls that inspect only standard HTTP, whereas SSE uses standard HTTP ports.',
      'Explain heartbeat ping/pong frames in WebSockets.'
    ],
    companies: ['Discord', 'Slack', 'Uber', 'TradingView'],
  },
  {
    title: 'MongoDB Replica Sets and Write Concerns',
    category: 'Database',
    topic: 'MongoDB',
    difficulty: 'Medium',
    question: 'How do MongoDB Replica Sets ensure High Availability, and what does Write Concern { w: "majority" } mean?',
    answer: 'A MongoDB Replica Set consists of a group of mongod processes maintaining the same data set: one Primary node (accepts all write operations) and multiple Secondary nodes (replicate the Primary\'s oplog). If the Primary becomes unreachable, an automated election elects an eligible Secondary. Write Concern describes the level of acknowledgement requested from MongoDB: { w: "majority" } requires acknowledgment that the write was committed to a calculated majority of data-bearing replica nodes before returning success, preventing dirty writes during failover.',
    explanation: 'Combining { w: "majority" } with readConcern: "majority" prevents reading data that could subsequently roll back after a network partition.',
    interviewTips: [
      'Explain that heartbeat pings run every 2 seconds; failover typically completes within 10-12 seconds.',
      'Mention that reads can be routed to secondaries using Read Preferences (primaryPreferred, secondary, nearest).'
    ],
    companies: ['Cisco', 'Cognizant', 'Infosys', 'TCS'],
  },
  {
    title: 'React useMemo vs useCallback vs React.memo',
    category: 'Web Development',
    topic: 'React',
    difficulty: 'Medium',
    question: 'When should you use useMemo, useCallback, and React.memo, and what is the cost of overusing them?',
    answer: 'React.memo is a Higher Order Component that skips re-rendering a component if its props have not changed (shallow comparison). useMemo caches the RESULT of an expensive mathematical computation between renders. useCallback caches the function DEFINITION reference so passing it to child components does not break React.memo equality. Overusing them is an anti-pattern: allocating memory for dependency arrays and comparing props on every render often costs more CPU than simply re-rendering lightweight components.',
    explanation: 'Only use them when passing callbacks to optimized children or when calculations are genuinely expensive (> 1ms execution time).',
    interviewTips: [
      'Explain referential equality in JavaScript: () => {} !== () => {}.',
      'Mention React 19 React Compiler which auto-memoizes components automatically.'
    ],
    companies: ['Meta', 'Uber', 'Coinbase', 'DoorDash'],
  },
  {
    title: 'Node.js Clustering and Worker Threads Architecture',
    category: 'Web Development',
    topic: 'Node.js',
    difficulty: 'Hard',
    question: 'How do Node.js Cluster module and Worker Threads differ, and how do you utilize all CPU cores?',
    answer: 'The Cluster module launches multiple independent Node.js processes sharing the same server port via OS process forking (master-worker model). Each process has its own V8 instance, memory, and Event Loop. Ideal for scaling I/O-bound web servers across multi-core CPUs. Worker Threads run multiple threads within a SINGLE Node.js process, sharing memory address space via SharedArrayBuffer. Ideal for CPU-intensive tasks like cryptographic hashing or machine learning calculations without blocking the main event loop.',
    explanation: 'Clustering scales HTTP throughput; Worker Threads offload blocking CPU math.',
    interviewTips: [
      'Explain how PM2 uses Node cluster module under the hood in production.',
      'Explain how IPC communication happens between clustered master and workers.'
    ],
    companies: ['Walmart', 'Netflix', 'Paypal', 'GoDaddy'],
  },

  // =========================================================================
  // SQL & DATABASE SYSTEMS TRACK (15 PLACEMENT QUESTIONS)
  // =========================================================================
  {
    title: 'ACID Properties and Database Transaction Isolation Levels',
    category: 'Database',
    topic: 'SQL',
    difficulty: 'Hard',
    question: 'Explain the 4 ANSI SQL Transaction Isolation Levels and the anomalies each prevents.',
    answer: 'The 4 isolation levels are: (1) Read Uncommitted (allows Dirty Reads, Non-repeatable Reads, Phantom Reads); (2) Read Committed (prevents Dirty Reads by only reading committed data; default in PostgreSQL/Oracle); (3) Repeatable Read (prevents Dirty and Non-repeatable Reads by ensuring rows read once remain unchanged; default in MySQL InnoDB via MVCC); (4) Serializable (highest isolation, prevents all anomalies including Phantom Reads via range locks or snapshot serializability).',
    explanation: 'Higher isolation reduces concurrency and increases lock contention/deadlock likelihood. Modern databases use Multi-Version Concurrency Control (MVCC) to achieve high isolation without locking read queries.',
    interviewTips: [
      'Define Dirty Read (reading uncommitted changes that roll back).',
      'Define Non-repeatable Read (rereading a row finds updated data).',
      'Define Phantom Read (re-executing a range query finds newly inserted rows).'
    ],
    companies: ['Amazon', 'Microsoft', 'Intuit', 'Morgan Stanley'],
  },
  {
    title: 'B-Tree vs Hash Indexing in Relational Databases',
    category: 'Database',
    topic: 'SQL',
    difficulty: 'Medium',
    question: 'Why do relational databases prefer B+ Trees over Hash Tables for primary indexing?',
    answer: 'While Hash Tables offer O(1) lookup for exact equality matches (WHERE id = 5), they cannot support range queries (WHERE age BETWEEN 20 AND 30), ordering (ORDER BY created_at), or prefix searches (WHERE name LIKE \'Al%\'). B+ Trees keep data balanced and sorted with high fan-out, storing all records at the leaf level linked sequentially. This allows B+ Trees to perform point lookups in O(log N) disk reads while supporting rapid sequential scans for range queries.',
    explanation: 'Additionally, B+ Tree nodes match operating system disk block pages (e.g. 4KB-16KB), minimizing mechanical or SSD I/O cycles.',
    interviewTips: [
      'Distinguish between Clustered Index (physical table ordering, 1 per table) and Non-Clustered/Secondary Index (pointer to row).',
      'Mention Composite Index left-prefix rule (index on (A, B) works for queries on A, but not for B alone).'
    ],
    companies: ['Uber', 'Oracle', 'JPMorgan', 'Adobe'],
  },
  {
    title: 'Clustered vs Non-Clustered Indexes in SQL',
    category: 'Database',
    topic: 'SQL',
    difficulty: 'Medium',
    question: 'What is the structural difference between Clustered and Non-Clustered Indexes, and why can a table have only one clustered index?',
    answer: 'A Clustered Index dictates the physical order in which actual data rows are stored on disk. The leaf nodes of the B+ Tree contain the actual data pages. Since physical records can only be stored in one sorted sequence on disk, there can only be ONE clustered index per table (typically Primary Key). A Non-Clustered (Secondary) Index is stored in a separate structure: its leaf nodes contain index keys paired with pointers (Row ID or clustered key) back to the actual data rows. Tables can have many non-clustered indexes.',
    explanation: 'A query reading clustered index requires 0 extra lookup steps; non-clustered index may trigger a "Bookmark / Key Lookup" to fetch unindexed columns.',
    interviewTips: [
      'Explain "Covering Index": an index that includes all columns requested by SELECT, eliminating the secondary key lookup.',
      'Explain the write overhead: each INSERT/UPDATE must update all secondary B+ Trees.'
    ],
    companies: ['Microsoft', 'Amazon', 'Oracle', 'Cisco'],
  },
  {
    title: 'Database Normalization: 1NF to BCNF with Real Examples',
    category: 'Database',
    topic: 'SQL',
    difficulty: 'Medium',
    question: 'Explain the rules of Normalization from 1NF to BCNF and why excessive normalization can harm read performance.',
    answer: '1NF: Atomic values (no multi-valued attributes/arrays) and unique row identity. 2NF: In 1NF and no Partial Dependency (every non-key attribute must depend on the WHOLE composite primary key). 3NF: In 2NF and no Transitive Dependency (non-key attribute cannot depend on another non-key attribute: A -> B -> C). BCNF (Boyce-Codd): Stricter 3NF where for every functional dependency X -> Y, X must be a super key. Trade-off: High normalization eliminates redundancy and update anomalies, but requires expensive multi-table JOINs for reads; production reporting databases often intentionally denormalize.',
    explanation: 'Denormalization trades disk space and write overhead to minimize read JOIN latencies.',
    interviewTips: [
      'Give concrete student-course-instructor table decomposition example.',
      'Explain when OLAP star/snowflake schema denormalization is preferred over 3NF.'
    ],
    companies: ['TCS Digital', 'Infosys', 'Wipro', 'Capgemini'],
  },
  {
    title: 'Finding the Nth Highest Salary in SQL (Multiple Approaches)',
    category: 'Database',
    topic: 'SQL',
    difficulty: 'Medium',
    question: 'Write SQL queries to find the Nth highest salary in an Employee table using Window Functions and correlated subqueries.',
    answer: 'Approach 1 (Standard Modern SQL using DENSE_RANK()):\nWITH RankedSalaries AS (\n  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) as rnk FROM Employee\n)\nSELECT salary FROM RankedSalaries WHERE rnk = N LIMIT 1;\n\nApproach 2 (Offset subquery):\nSELECT DISTINCT salary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET N-1;\n\nApproach 3 (Correlated Subquery):\nSELECT salary FROM Employee e1 WHERE N-1 = (SELECT COUNT(DISTINCT e2.salary) FROM Employee e2 WHERE e2.salary > e1.salary);',
    explanation: 'DENSE_RANK() handles duplicate salaries correctly (e.g. two employees sharing top salary) without skipping ranks like standard RANK() would.',
    interviewTips: [
      'Explain why DENSE_RANK() is superior to RANK() and ROW_NUMBER() for tied salaries.',
      'Contrast correlated subquery O(N^2) complexity with window function O(N log N) sorting.'
    ],
    companies: ['Amazon', 'Flipkart', 'Paytm', 'Oracle'],
  },
  {
    title: 'SQL Joins: INNER, LEFT, RIGHT, FULL OUTER & CROSS JOIN',
    category: 'Database',
    topic: 'SQL',
    difficulty: 'Easy',
    question: 'Illustrate the difference between all standard SQL JOIN types and explain the mechanics of Hash Join vs Nested Loop Join.',
    answer: '1. INNER JOIN: Returns records with matching keys in BOTH tables. 2. LEFT JOIN: Returns ALL records from left table and matched records from right table (NULL if no match). 3. RIGHT JOIN: Returns all records from right table. 4. FULL OUTER JOIN: Returns all records when match exists in EITHER left or right table. 5. CROSS JOIN: Cartesian product of all rows (M x N rows). Query Engine Execution: Nested Loop Join (good for small tables with indexed lookups), Hash Join (creates in-memory hash table of smaller table for fast scans), and Merge Join (for pre-sorted inputs).',
    explanation: 'Cross joins can crash memory on large tables; always ensure ON predicates are indexed.',
    interviewTips: [
      'Explain what happens when joining on NULL keys (NULL = NULL evaluates to UNKNOWN, so rows will not match in standard join).',
      'Explain LEFT JOIN WHERE right_table.id IS NULL to find unmatched rows (anti-join).'
    ],
    companies: ['Cognizant', 'Accenture', 'TCS', 'Infosys'],
  },
  {
    title: 'GROUP BY vs HAVING Clause in SQL Aggregations',
    category: 'Database',
    topic: 'SQL',
    difficulty: 'Easy',
    question: 'What is the operational difference between WHERE and HAVING in SQL, and what is the execution order of a SQL query?',
    answer: 'WHERE filters rows BEFORE aggregation occurs; it cannot reference aggregate functions (e.g. SUM(), COUNT()). HAVING filters grouped records AFTER the GROUP BY aggregation has executed. Complete SQL Execution Order: (1) FROM & JOIN -> (2) WHERE -> (3) GROUP BY -> (4) HAVING -> (5) SELECT -> (6) DISTINCT -> (7) ORDER BY -> (8) LIMIT / OFFSET. Understanding this order clarifies why column aliases defined in SELECT cannot be used in WHERE clauses.',
    explanation: 'Filtering rows as early as possible in WHERE reduces the dataset volume before expensive grouping and memory aggregation.',
    interviewTips: [
      'Write an example query: SELECT department, COUNT(*) FROM Employee WHERE status = \'Active\' GROUP BY department HAVING COUNT(*) > 5;',
      'Remind interviewer that HAVING without GROUP BY acts as a filter over the entire table.'
    ],
    companies: ['Oracle', 'Dell', 'Capgemini', 'IBM'],
  },
  {
    title: 'Database Sharding vs Partitioning vs Read Replication',
    category: 'Database',
    topic: 'SQL',
    difficulty: 'Hard',
    question: 'How do Horizontal Partitioning, Sharding, and Read Replicas scale database systems, and what are their trade-offs?',
    answer: 'Read Replication: Replicates writes from primary database to read replicas using replication log. Scales read-heavy workloads (80-20 ratio), but offers eventual consistency and does NOT solve write bottlenecks. Partitioning: Splitting a large table into smaller physical pieces on the SAME server (e.g. partition by year). Speeds up query pruning. Sharding: Horizontal partitioning across MULTIPLE autonomous physical servers. Each shard contains a distinct subset of data (sharded by shard_key like user_id). Scales writes indefinitely, but introduces complex distributed joins, cross-shard transactions, and rebalancing challenges.',
    explanation: 'Carefully choosing the Shard Key (high cardinality, uniform distribution) prevents hotspots where one shard receives 90% of traffic.',
    interviewTips: [
      'Compare Hash-based Sharding (uniform distribution) with Range-based Sharding (efficient range queries but prone to hot shards on dates).',
      'Mention Consistent Hashing to minimize data migration when adding shards.'
    ],
    companies: ['Amazon', 'Google', 'Uber', 'Salesforce'],
  },
  {
    title: 'Pessimistic vs Optimistic Locking in Concurrency',
    category: 'Database',
    topic: 'SQL',
    difficulty: 'Medium',
    question: 'When should you use Optimistic Concurrency Control (OCC) vs Pessimistic Locking in database transactions?',
    answer: 'Pessimistic Locking assumes conflicts are frequent; it places exclusive locks on rows immediately (e.g. SELECT ... FOR UPDATE) preventing any other transaction from reading or modifying until commit. Ideal for high-contention operations like booking the last seat on a flight or debiting inventory. Optimistic Locking assumes conflicts are rare; it allows transactions to read and modify without locks, checking a version column (__v or updated_at) at write time: UPDATE items SET stock = 4, version = version + 1 WHERE id = 1 AND version = 3. If rows affected == 0, another write occurred, and the transaction aborts and retries.',
    explanation: 'Optimistic locking has zero lock contention overhead and avoids database deadlocks, making it ideal for web applications.',
    interviewTips: [
      'Show the exact SQL statement for Optimistic Concurrency Control with version counter.',
      'Explain that Mongoose implements OCC using the __v field with optimisticConcurrency: true.'
    ],
    companies: ['Razorpay', 'Flipkart', 'Stripe', 'Paypal'],
  },
  {
    title: 'SQL Injection Prevention & Parameterized Queries',
    category: 'Database',
    topic: 'SQL',
    difficulty: 'Easy',
    question: 'How does SQL Injection work, and why do Prepared Statements guarantee immunity?',
    answer: 'SQL Injection happens when untrusted user input is directly concatenated into a dynamic SQL string (e.g. SELECT * FROM users WHERE user = \'\' + input). If attacker inputs \' OR \'1\'=\'1\', the SQL logic is altered to bypass authentication. Prepared Statements / Parameterized Queries guarantee immunity by separating query CODE from user DATA. The SQL engine compiles and optimizes the query structure template first, then binds the user parameters strictly as literal data values, making it syntactically impossible for input to be interpreted as executable SQL commands.',
    explanation: 'Using ORMs (Mongoose, Prisma, Hibernate) does not automatically prevent injection if developers use raw query strings (e.g. prisma.$queryRawUnsafe).',
    interviewTips: [
      'Explain Second-Order SQL Injection (stored payload executed later in a different query).',
      'State clearly that client-side input validation is useful for UX, but ONLY server-side parameterized queries ensure security.'
    ],
    companies: ['Cloudflare', 'Cisco', 'Goldman Sachs', 'Auth0'],
  },
  {
    title: 'Triggers, Stored Procedures, and Database Views',
    category: 'Database',
    topic: 'SQL',
    difficulty: 'Easy',
    question: 'Compare Triggers, Stored Procedures, and Views (including Materialized Views) with their real-world trade-offs.',
    answer: 'Stored Procedure: Precompiled set of SQL statements stored on the database server. Reduces network traffic by executing complex multi-step logic on server, but shifts CPU load to DB and is difficult to version-control. Trigger: Event-driven stored procedure invoked automatically upon INSERT, UPDATE, or DELETE. Useful for audit trails, but makes debugging hidden side-effects notorious. View: Virtual table defined by a saved SELECT query; simplifies complex queries and restricts column access. Materialized View: Physically stores the precomputed query result on disk, refreshing periodically; delivers instantaneous analytics at the cost of stale data.',
    explanation: 'Modern microservice architectures generally prefer business logic in application code rather than stored procedures to keep DB stateless and horizontally scalable.',
    interviewTips: [
      'Explain when to use Materialized Views (read-heavy dashboards with millions of rows).',
      'Warn about recursive triggers causing cascading server lockups.'
    ],
    companies: ['Oracle', 'Cognizant', 'TCS', 'Infosys'],
  },
  {
    title: 'Multi-Version Concurrency Control (MVCC) in PostgreSQL & MySQL',
    category: 'Database',
    topic: 'SQL',
    difficulty: 'Hard',
    question: 'How does Multi-Version Concurrency Control (MVCC) eliminate read-write locking conflicts in modern databases?',
    answer: 'MVCC ensures that "readers never block writers, and writers never block readers". Instead of overwriting data in-place and placing shared locks, when a row is updated or deleted, the database creates a NEW version of the row with creation and expiration transaction IDs (e.g. xmin and xmax in PostgreSQL). When a transaction reads, it sees a point-in-time snapshot containing only rows whose xmin committed before the read transaction started and whose xmax has not yet expired. Older row versions (dead tuples) are asynchronously cleaned up by VACUUM processes.',
    explanation: 'MVCC provides Snapshot Isolation without requiring expensive shared read locks across thousands of concurrent queries.',
    interviewTips: [
      'Explain PostgreSQL VACUUM and why bloated tables occur if autovacuum is misconfigured.',
      'Contrast MVCC with 2-Phase Locking (2PL).'
    ],
    companies: ['Uber', 'GitLab', 'Databricks', 'Snowflake'],
  },
  {
    title: 'Write-Ahead Logging (WAL) and Database Crash Recovery',
    category: 'Database',
    topic: 'SQL',
    difficulty: 'Hard',
    question: 'What is Write-Ahead Logging (WAL), and how does the ARIES recovery algorithm ensure Durability across power cuts?',
    answer: 'Writing updated data pages to random disk sectors is slow. Write-Ahead Logging (WAL) guarantees Atomicity and Durability by ensuring that all modifications are written sequentially to an append-only log file on disk BEFORE the actual data pages are flushed to disk. During transaction COMMIT, the database only forces the WAL log buffer to disk (fast sequential write via fsync). If the power fails, the ARIES recovery algorithm executes upon reboot: (1) Analysis: scan WAL to identify active transactions and dirty pages; (2) Redo: roll forward all logged changes to restore state; (3) Undo: roll back changes of incomplete/uncommitted transactions.',
    explanation: 'Checkpoints periodically flush all dirty in-memory buffer pool pages to disk, bounding recovery time so the engine does not replay the entire history.',
    interviewTips: [
      'Explain fsync() system call and its relationship to durability guarantees.',
      'Connect WAL to CDC (Change Data Capture) systems like Debezium.'
    ],
    companies: ['Google', 'AWS Aurora', 'CockroachDB', 'Microsoft'],
  },
  {
    title: 'Composite Indexes and the Leftmost Prefix Rule',
    category: 'Database',
    topic: 'SQL',
    difficulty: 'Medium',
    question: 'Given an index on columns (A, B, C), which queries utilize the index, and what is the Leftmost Prefix Rule?',
    answer: 'The Leftmost Prefix Rule states that a multi-column composite index can only be used by the query optimizer if the query conditions match columns in sequential order starting from the LEFTMOST column. Index on (A, B, C) can satisfy: WHERE A = 1; WHERE A = 1 AND B = 2; WHERE A = 1 AND B = 2 AND C = 3; and WHERE A = 1 AND C = 3 (uses index for A, filters C). It CANNOT be used for queries filtering only: WHERE B = 2; or WHERE C = 3. Furthermore, once an inequality range filter (<, >, BETWEEN) is encountered on a column, subsequent columns cannot use index ordering.',
    explanation: 'When ordering index columns, place highest-cardinality equality columns first, followed by range filter and sorting columns.',
    interviewTips: [
      'Analyze query execution plan using EXPLAIN ANALYZE.',
      'Show how reordering WHERE clauses in SQL does NOT matter (optimizer reorders), but column order in CREATE INDEX is critical.'
    ],
    companies: ['Amazon', 'Adobe', 'Swiggy', 'Zomato'],
  },
  {
    title: 'NULL Values and Three-Valued Logic in SQL',
    category: 'Database',
    topic: 'SQL',
    difficulty: 'Easy',
    question: 'Why does NULL = NULL evaluate to false or unknown in SQL, and how does Three-Valued Logic affect NOT IN subqueries?',
    answer: 'In SQL, NULL represents an unknown or missing value, not zero or empty string. Therefore, two unknown values cannot be judged equal: NULL = NULL evaluates to UNKNOWN. To check for nulls, IS NULL or IS NOT NULL must be used. Three-Valued Logic (TRUE, FALSE, UNKNOWN) creates a notorious trap in NOT IN subqueries: SELECT * FROM users WHERE id NOT IN (SELECT manager_id FROM employees). If ANY manager_id is NULL, the entire NOT IN expression evaluates to UNKNOWN, returning 0 rows! Solution: use NOT EXISTS or filter out NULLs in subquery.',
    explanation: 'COUNT(column_name) ignores NULL rows, while COUNT(*) counts all rows regardless of nullability.',
    interviewTips: [
      'Always advocate NOT EXISTS over NOT IN due to NULL safety and query planner optimization.',
      'Explain COALESCE(val, default_val) to handle null values gracefully.'
    ],
    companies: ['Microsoft', 'Morgan Stanley', 'Infosys', 'TCS'],
  },

  // =========================================================================
  // OPERATING SYSTEMS & CORE CS TRACK (15 PLACEMENT QUESTIONS)
  // =========================================================================
  {
    title: 'Process vs Thread and Context Switching Cost',
    category: 'Computer Science',
    topic: 'Operating Systems',
    difficulty: 'Easy',
    question: 'What is the structural difference between a Process and a Thread, and why is Thread context switching faster?',
    answer: 'A Process is an executing instance of a program with its own isolated address space, Page Table, file descriptors, heap, and registers. A Thread is the smallest schedulable unit of execution within a process; multiple threads of the same process share the same virtual address space, heap, and code segments, but each has its own private Stack and Program Counter (PC). Thread context switching is faster because the MMU does not need to invalidate the Translation Lookaside Buffer (TLB) or reload memory page tables.',
    explanation: 'Process context switches require saving CPU registers, swapping page tables (CR3 register on x86), and flushing TLB caches, creating substantial CPU memory cache thrashing.',
    interviewTips: [
      'Contrast IPC mechanisms (pipes, sockets, shared memory) with thread communication (shared memory variables with synchronization).',
      'Mention race conditions and the need for mutexes, semaphores, and condition variables.'
    ],
    companies: ['Microsoft', 'Qualcomm', 'Intel', 'Samsung'],
  },
  {
    title: 'Deadlocks and the 4 Coffman Conditions',
    category: 'Computer Science',
    topic: 'Operating Systems',
    difficulty: 'Medium',
    question: 'What are the 4 Coffman Conditions necessary for a Deadlock to occur, and how do you prevent each?',
    answer: 'A deadlock occurs when a set of processes are blocked because each is holding a resource and waiting for another. The 4 Coffman conditions are: (1) Mutual Exclusion: resources cannot be shared; (2) Hold and Wait: a process holds at least one resource and requests others; (3) No Preemption: resources cannot be forcibly seized; (4) Circular Wait: a closed chain of processes where each holds a resource needed by the next. Breaking ANY ONE condition prevents deadlocks. Circular wait is most commonly eliminated in production by enforcing a strict global resource acquisition ordering (hierarchical locking).',
    explanation: 'If all threads acquire locks in identical alphabetical or memory address order, circular wait becomes mathematically impossible.',
    interviewTips: [
      'Draw the Resource Allocation Graph (RAG) with cycles.',
      'Explain Lock Ordering: Lock(A) then Lock(B), never inverse in another thread.'
    ],
    companies: ['Amazon', 'Google', 'Cisco', 'Adobe'],
  },
  {
    title: 'Banker\'s Algorithm for Deadlock Avoidance',
    category: 'Computer Science',
    topic: 'Operating Systems',
    difficulty: 'Hard',
    question: 'Explain how Banker\'s Algorithm determines whether allocating resources leaves the system in a Safe State.',
    answer: 'Banker\'s Algorithm avoids deadlocks by testing for safety before granting any resource request. It maintains 4 matrices: Available (vector of available instances per resource), Max (maximum demand of each process), Allocation (currently allocated resources), and Need (Max - Allocation). When a process requests resources: (1) Verify Request <= Need and Request <= Available; (2) Pre-allocate speculatively; (3) Run Safety Algorithm: find an execution sequence (P1, P2, ... Pn) where each process can satisfy its remaining Need with Available + currently allocated resources. If such a Safe Sequence exists, grant request; else reject and make process wait.',
    explanation: 'Rarely used in general-purpose OS because processes cannot predict their maximum resource demands in advance.',
    interviewTips: [
      'Distinguish Deadlock Prevention (breaking Coffman conditions) vs Deadlock Avoidance (dynamic safety checking like Banker\'s) vs Deadlock Detection & Recovery.',
      'Explain recovery strategies: kill all deadlocked processes vs kill one at a time vs preemption.'
    ],
    companies: ['Qualcomm', 'Intel', 'Samsung', 'Oracle'],
  },
  {
    title: 'CPU Scheduling Algorithms: Preemptive vs Non-Preemptive',
    category: 'Computer Science',
    topic: 'Operating Systems',
    difficulty: 'Medium',
    question: 'Compare FCFS, Shortest Job First (SJF), Round Robin (RR), and Multi-Level Feedback Queue (MLFQ) scheduling.',
    answer: '1. First-Come-First-Served (FCFS): Non-preemptive, suffers from Convoy Effect (short processes wait behind long ones). 2. Shortest Job First (SJF / SRTF): Provably optimal minimum average waiting time; but causes starvation of long jobs and burst times cannot be known in advance. 3. Round Robin (RR): Preemptive, assigns fixed time quantum (e.g. 10-50ms) per process in FIFO order. Fair with excellent responsiveness; if quantum is too small, excessive context switching degrades throughput; if too large, degrades to FCFS. 4. MLFQ: Modern OS standard; multiple priority queues that dynamically adjust process priority based on observed CPU-bound vs I/O-bound behavior.',
    explanation: 'Linux uses Completely Fair Scheduler (CFS) based on a red-black tree tracking virtual runtime (vruntime).',
    interviewTips: [
      'Define Turnaround Time = Completion Time - Arrival Time.',
      'Define Waiting Time = Turnaround Time - Burst Time.'
    ],
    companies: ['Microsoft', 'Intel', 'Cisco', 'Apple'],
  },
  {
    title: 'Virtual Memory, Paging, and Address Translation',
    category: 'Computer Science',
    topic: 'Operating Systems',
    difficulty: 'Hard',
    question: 'How does the MMU translate a Virtual Address to a Physical Address using Multi-Level Page Tables and the TLB?',
    answer: 'Virtual memory gives each process the illusion of a contiguous, private memory space while physical RAM is fragmented. Virtual address is split into: Virtual Page Number (VPN) and Page Offset. Translation steps: (1) MMU checks Translation Lookaside Buffer (TLB), a fast associative hardware cache; on TLB Hit, physical frame number is returned in 1 CPU cycle. (2) On TLB Miss, MMU performs page table walk using multi-level page tables (e.g. 4-level on x86-64: PML4 -> PDP -> PD -> PT). (3) Physical Frame Number (PFN) + Offset produces physical RAM address. (4) Result is cached in TLB.',
    explanation: 'Multi-level paging saves massive RAM by allocating lower-level page tables only for memory regions the process actually uses.',
    interviewTips: [
      'Explain Page Size: standard 4 KB (2^12 bytes, meaning 12 bits for offset).',
      'Explain Huge Pages (2 MB or 1 GB) and why databases like PostgreSQL use them to reduce TLB misses.'
    ],
    companies: ['Google', 'Meta', 'NVIDIA', 'AMD'],
  },
  {
    title: 'Page Replacement Algorithms: LRU, Clock, and Belady\'s Anomaly',
    category: 'Computer Science',
    topic: 'Operating Systems',
    difficulty: 'Medium',
    question: 'Explain Least Recently Used (LRU) vs Clock Page Replacement, and demonstrate Belady\'s Anomaly in FIFO.',
    answer: 'When a Page Fault occurs and all physical frames are occupied, the OS must evict a page. 1. Optimal (OPT): Evicts page that will not be used for the longest future time (theoretical benchmark). 2. LRU: Evicts page unused for the longest time past; requires expensive hardware timestamp or linked list updates on every memory access. 3. Clock Algorithm (Second Chance): Practical O(1) approximation of LRU using a circular buffer and a 1-bit "used" reference flag. 4. Belady\'s Anomaly: A counter-intuitive phenomenon where increasing the number of physical page frames results in MORE page faults. FIFO suffers from Belady\'s anomaly; stack-based algorithms (LRU, OPT) are mathematically immune.',
    explanation: 'The Clock algorithm is used in Linux because checking a single hardware bit on eviction avoids the prohibitive overhead of true LRU.',
    interviewTips: [
      'Sketch the Clock algorithm pointer and bit reset (1 -> 0, advance; if 0, evict).',
      'Give Belady\'s anomaly reference string example: 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5.'
    ],
    companies: ['Amazon', 'Microsoft', 'Qualcomm', 'Intel'],
  },
  {
    title: 'Thrashing and the Working Set Model',
    category: 'Computer Science',
    topic: 'Operating Systems',
    difficulty: 'Medium',
    question: 'What causes Thrashing in an operating system, and how does the Working Set Model prevent it?',
    answer: 'Thrashing occurs when a computer\'s virtual memory subsystem is in a constant state of paging—spending more CPU cycles swapping pages in and out between RAM and disk than executing real user instructions. Cause: High degree of multiprogramming where the sum of working sets of all active processes exceeds physical RAM capacity. The CPU scheduler sees low CPU utilization (because all processes are blocked waiting for disk I/O) and mistakenly launches MORE processes, compounding the disaster. Prevention: The Working Set Model monitors the set of pages referenced by a process in recent time window Delta. If sum(WorkingSets) > TotalRAM, suspend a process completely.',
    explanation: 'Suspending one process frees up frames so remaining processes can satisfy their working sets and finish rapidly.',
    interviewTips: [
      'Explain Locality of Reference: Temporal Locality (recently referenced items referenced again soon) and Spatial Locality (nearby addresses referenced soon).',
      'Explain Page Fault Frequency (PFF) strategy: if fault rate too high, allocate frames; if too low, reclaim.'
    ],
    companies: ['VMware', 'Red Hat', 'AWS', 'Google'],
  },
  {
    title: 'Inter-Process Communication (IPC): Pipes, Sockets, and Shared Memory',
    category: 'Computer Science',
    topic: 'Operating Systems',
    difficulty: 'Medium',
    question: 'Compare Pipes, Message Queues, Sockets, and Shared Memory for Inter-Process Communication in terms of speed and scope.',
    answer: '1. Shared Memory: Fastest IPC because multiple processes map the same physical RAM pages into their virtual address spaces. Zero kernel copy overhead (reading and writing directly to memory), but requires manual user-space synchronization (semaphores/mutexes). 2. Pipes (Anonymous/Named): Unidirectional byte streams managed by kernel buffer. Anonymous pipes require parent-child relationship; Named pipes (FIFOs) allow unrelated processes on same machine. 3. Message Queues: Kernel-managed discrete message blocks with priority types; asynchronous. 4. Sockets: Bidirectional communication over network stack (UNIX domain sockets for local machine, TCP/UDP sockets for distributed networks). Slower due to serialization and network protocols.',
    explanation: 'UNIX domain sockets bypass the network stack entirely, providing double the throughput of localhost TCP loopback sockets.',
    interviewTips: [
      'State clearly why Shared Memory is the fastest (avoids copying data into kernel space and back).',
      'Explain how mmap() system call creates memory-mapped files.'
    ],
    companies: ['Bloomberg', 'Morgan Stanley', 'Apple', 'Meta'],
  },
  {
    title: 'Mutex vs Semaphore (Binary vs Counting Semaphore)',
    category: 'Computer Science',
    topic: 'Operating Systems',
    difficulty: 'Easy',
    question: 'What is the fundamental difference between a Mutex and a Semaphore? Can a thread unlock a Mutex locked by another thread?',
    answer: 'A Mutex (Mutual Exclusion) is a LOCKING mechanism intended to serialize access to a single shared resource. Crucially, a Mutex has OWNERSHIP: only the specific thread that acquired/locked the mutex is permitted to unlock it. A Semaphore is a SIGNALING mechanism consisting of an integer counter and two atomic operations: wait() / P() and signal() / V(). A Semaphore has NO ownership: any thread (or interrupt service routine) can signal to wake up waiting threads. A Counting Semaphore controls access to a pool of N identical resources (e.g. database connection pool).',
    explanation: 'Treating a binary semaphore as a mutex without ownership checks leads to dangerous race conditions and lock-hijacking bugs.',
    interviewTips: [
      'Explain Priority Inversion: a low-priority thread holds a mutex needed by a high-priority thread, blocked by medium-priority threads. Fixed via Priority Inheritance.',
      'Contrast Spinlock (busy waiting in loop, good for short waits on multi-core) vs Sleeping Lock (puts thread to sleep via scheduler).'
    ],
    companies: ['Cisco', 'Qualcomm', 'Amazon', 'Intel'],
  },
  {
    title: 'System Calls and User Mode vs Kernel Mode (Protection Rings)',
    category: 'Computer Science',
    topic: 'Operating Systems',
    difficulty: 'Easy',
    question: 'Why do modern CPUs distinguish between User Mode and Kernel Mode, and how does a System Call transition between them?',
    answer: 'To ensure system stability and security, CPU hardware enforces Protection Rings: Ring 0 (Kernel Mode, unrestricted access to hardware instructions and physical memory) and Ring 3 (User Mode, restricted unprivileged instructions). User applications run in Ring 3 and CANNOT directly write to disk, access network cards, or modify page tables. When a program needs OS services (e.g. read(), fork(), malloc()), it triggers a System Call via a software interrupt (int 0x80) or assembly instruction (syscall/sysenter). The CPU switches to Ring 0, executes kernel handler code via Interrupt Descriptor Table (IDT), and returns to Ring 3 via sysret.',
    explanation: 'This dual-mode boundary prevents buggy or malicious user applications from crashing the entire machine or reading other processes\' private memory.',
    interviewTips: [
      'Explain that system calls have non-trivial overhead (saving user register state, switching stacks, flushing execution pipelines).',
      'Mention vDSO / vSyscall in Linux for accelerating frequent read-only syscalls like gettimeofday().'
    ],
    companies: ['Microsoft', 'Apple', 'Red Hat', 'Google'],
  },
  {
    title: 'Memory Fragmentation: Internal vs External Fragmentation',
    category: 'Computer Science',
    topic: 'Operating Systems',
    difficulty: 'Easy',
    question: 'What is the difference between Internal and External Fragmentation, and how does Paging solve External Fragmentation?',
    answer: 'Internal Fragmentation occurs when memory is allocated in fixed-size blocks (e.g. 4KB pages). If a process requests 100 bytes, the entire 4096-byte page is allocated, wasting 3996 bytes INSIDE the allocated boundary. External Fragmentation occurs when free memory is broken into many small non-contiguous chunks over time. Total free memory may be 100 MB, but because no single contiguous block is larger than 10 MB, a request for 20 MB fails. Paging completely eliminates External Fragmentation because physical memory is divided into fixed frames and virtual pages can be mapped to ANY non-contiguous physical frames.',
    explanation: 'Paging accepts small internal fragmentation (at most half a page on the last page of a process) to completely eradicate external fragmentation.',
    interviewTips: [
      'Explain Segmentation (variable-size logical blocks like code, stack, heap) and why segmentation suffers from external fragmentation.',
      'Explain Memory Compaction (moving allocated processes to combine free holes) and why it is expensive.'
    ],
    companies: ['Samsung', 'Qualcomm', 'Intel', 'Infosys'],
  },
  {
    title: 'Zombie Processes vs Orphan Processes in Unix/Linux',
    category: 'Computer Science',
    topic: 'Operating Systems',
    difficulty: 'Easy',
    question: 'What is the difference between a Zombie Process and an Orphan Process, and how are both cleaned up?',
    answer: 'Orphan Process: A child process whose parent process terminated or crashed before the child finished. The OS handles orphans by having the init process (PID 1 or systemd) "adopt" them. When the orphan finishes, init waits on it and reaps its entry immediately. Zombie Process: A child process that has completed execution (via exit()), but whose parent has NOT YET read its exit status code via the wait() or waitpid() system call. A zombie retains an entry in the OS Process Table (consuming a PID, but no RAM or CPU). If parent never calls wait(), zombies accumulate until PID exhaustion.',
    explanation: 'You cannot kill a zombie with kill -9 because it is already dead! You must kill its parent process so init adopts and reaps it.',
    interviewTips: [
      'Show command to view zombies: ps aux | grep "Z".',
      'Explain SIGCHLD signal: kernel sends SIGCHLD to parent when child terminates; parent registers a signal handler calling waitpid(-1, NULL, WNOHANG).'
    ],
    companies: ['Red Hat', 'Amazon', 'Cisco', 'Cognizant'],
  },
  {
    title: 'Translation Lookaside Buffer (TLB) and Cache Invalidation',
    category: 'Computer Science',
    topic: 'Operating Systems',
    difficulty: 'Hard',
    question: 'What is the role of the TLB in memory performance, and why does a Process Context Switch require TLB invalidation?',
    answer: 'The TLB is a high-speed hardware Associative Cache inside the CPU Memory Management Unit (MMU) that stores recent Virtual-to-Physical page translations. Without TLB, every memory read requires 4 additional memory accesses to traverse the multi-level page table! TLB Hit rate is typically > 99%, reducing translation to 1 CPU cycle. Because each process has its own private virtual address space mapping to different physical addresses, when the OS context switches from Process A to Process B, cached TLB translations become invalid. The OS invalidates TLB by reloading register CR3 or uses Address Space Identifiers (ASID / PCID) to tag translations.',
    explanation: 'Process Context ID (PCID) tags on modern x86 processors allow keeping TLB entries across context switches, speeding up switches by 30%.',
    interviewTips: [
      'Explain why Threads of the SAME process do not need TLB invalidation (they share identical address space).',
      'Mention TLB Shootdown in multi-core systems when a page table entry is modified on one core.'
    ],
    companies: ['Intel', 'AMD', 'NVIDIA', 'Apple'],
  },
  {
    title: 'Linux Inode Architecture and Hard Links vs Symbolic Links',
    category: 'Computer Science',
    topic: 'Operating Systems',
    difficulty: 'Medium',
    question: 'What is an Inode in Linux file systems, and how do Hard Links differ from Soft (Symbolic) Links?',
    answer: 'An Inode (Index Node) is a data structure on disk that stores all metadata about a file (file size, permissions, owner, timestamps, and pointers to data disk blocks) EXCEPT for its file name and file content! Directory entries simply map filename -> inode_number. Hard Link: An additional directory entry pointing directly to the SAME existing inode number. Deleting original filename does not delete file content until link count drops to 0. Cannot cross file system boundaries. Soft (Symbolic) Link: A special file whose data content is simply a path string pointing to another file. If target file is deleted or renamed, soft link becomes broken (dangling pointer).',
    explanation: 'A file is only deleted from disk when both its hard link count reaches 0 AND no running process has an open file descriptor referencing it.',
    interviewTips: [
      'Show command: ls -i to view inode numbers.',
      'Explain why hard links cannot be created for directories (to prevent infinite directory tree loops).'
    ],
    companies: ['Red Hat', 'Canonical', 'Google', 'Cisco'],
  },
  {
    title: 'Critical Section Problem: Race Conditions and Peterson\'s Algorithm',
    category: 'Computer Science',
    topic: 'Operating Systems',
    difficulty: 'Medium',
    question: 'What three requirements must a solution to the Critical Section problem satisfy, and how does Peterson\'s Algorithm solve it for two processes?',
    answer: 'A Critical Section is a code segment where shared resources are modified. Any valid solution must satisfy 3 requirements: (1) Mutual Exclusion: only one process in critical section at a time; (2) Progress: if no process is in critical section, only processes wishing to enter can participate in selection, without indefinite delay; (3) Bounded Waiting: a bound must exist on the number of times other processes can enter before a requesting process is granted entry (prevents starvation). Peterson\'s Algorithm uses two shared variables: boolean flag[2] (intention to enter) and int turn (polite yield of turn). Process i sets flag[i] = true, turn = j, and waits while (flag[j] && turn == j).',
    explanation: 'While mathematically elegant, software solutions like Peterson\'s fail on modern multi-core processors due to CPU out-of-order execution and store buffering unless memory barriers are used.',
    interviewTips: [
      'Explain Hardware synchronization primitives: Test-And-Set (TAS) and Compare-And-Swap (CAS).',
      'Explain atomic instructions and memory barriers / fences.'
    ],
    companies: ['Oracle', 'Microsoft', 'Qualcomm', 'Intel'],
  },

  // =========================================================================
  // COMPUTER NETWORKS & SYSTEM PROTOCOLS (5 QUESTIONS)
  // =========================================================================
  {
    title: 'TCP 3-Way Handshake and 4-Way Connection Teardown',
    category: 'Computer Science',
    topic: 'Computer Networks',
    difficulty: 'Medium',
    question: 'Describe the steps and packet flags involved in establishing and closing a TCP connection.',
    answer: 'Connection Establishment (3-Way): (1) Client sends SYN with initial sequence number (ISN_c); (2) Server responds with SYN-ACK, acknowledging ISN_c + 1 and sending ISN_s; (3) Client sends ACK acknowledging ISN_s + 1. Connection is now ESTABLISHED.\nConnection Teardown (4-Way): (1) Active closer sends FIN; (2) Passive receiver sends ACK; (3) Passive receiver finishes sending remaining data and sends its own FIN; (4) Active closer responds with ACK and enters TIME_WAIT state (2MSL duration) before closing.',
    explanation: 'The TIME_WAIT state (typically 2 minutes) ensures that delayed duplicate packets dissipate in the network and the final ACK was reliably received by the peer.',
    interviewTips: [
      'Explain SYN Flood attacks and how SYN Cookies mitigate them without storing half-open TCB state.',
      'Explain why teardown takes 4 steps instead of 3 (TCP is full-duplex; one direction can close while the other still streams data).'
    ],
    companies: ['Cisco', 'Cloudflare', 'Akamai', 'Google'],
  },
  {
    title: 'TCP vs UDP: Operational Characteristics and Protocols',
    category: 'Computer Science',
    topic: 'Computer Networks',
    difficulty: 'Easy',
    question: 'Compare TCP and UDP in terms of reliability, ordering, header overhead, and real-world application protocols.',
    answer: 'TCP (Transmission Control Protocol): Connection-oriented, guarantees in-order delivery, reliable retransmission of lost packets via sequence numbers and ACKs, implements Congestion Control and Flow Control (sliding window). Header size: 20-60 bytes. Used for: HTTP/HTTPS, SSH, FTP, SMTP. UDP (User Datagram Protocol): Connectionless, unreliable, packets can arrive out of order, duplicated, or dropped without notification. No flow or congestion control. Lightweight header size: strictly 8 bytes. Minimal latency. Used for: DNS lookups, VoIP, Video Streaming, Real-time multiplayer gaming, and HTTP/3 (QUIC).',
    explanation: 'QUIC (foundation of HTTP/3) runs over UDP in user-space to achieve 0-RTT handshakes and eliminate TCP Head-of-Line blocking.',
    interviewTips: [
      'Explain why gaming uses UDP: dropped position coordinates are immediately obsolete; waiting for TCP retransmission creates stutter.',
      'Explain MTU (Maximum Transmission Unit, typically 1500 bytes) and IP packet fragmentation.'
    ],
    companies: ['Cisco', 'Riot Games', 'Netflix', 'Cloudflare'],
  },
  {
    title: 'DNS Resolution Workflow and Record Types',
    category: 'Computer Science',
    topic: 'Computer Networks',
    difficulty: 'Medium',
    question: 'Explain the recursive and iterative stages of DNS resolution and define A, AAAA, CNAME, MX, and TXT records.',
    answer: 'Resolution Steps: (1) Client checks browser cache -> OS hosts file/cache; (2) Sends recursive query to Local Recursive Resolving Server (e.g. ISP or 8.8.8.8); (3) Resolver performs iterative queries: queries Root DNS Server (.) -> receives TLD server (.com) -> queries TLD server -> receives Authoritative Nameserver (ns1.example.com) -> queries Authoritative server -> receives IP address. Record Types: A (maps hostname to IPv4 address), AAAA (maps to IPv6), CNAME (Canonical Name, alias pointing hostname to another domain name), MX (Mail Exchange, specifies mail servers with priority), TXT (stores text metadata, critical for SPF and DKIM email authentication).',
    explanation: 'DNS uses UDP port 53 for standard queries for speed; uses TCP port 53 for zone transfers or responses exceeding 512 bytes.',
    interviewTips: [
      'Explain DNS Time-To-Live (TTL) and caching implications during server migrations.',
      'Mention DNS Spoofing / Cache Poisoning and how DNSSEC cryptographically signs records.'
    ],
    companies: ['Cloudflare', 'Akamai', 'AWS Route 53', 'Google'],
  },
  {
    title: 'HTTP/1.1 vs HTTP/2 vs HTTP/3 (QUIC) Evolution',
    category: 'Computer Science',
    topic: 'Computer Networks',
    difficulty: 'Hard',
    question: 'How did HTTP/2 and HTTP/3 solve Head-of-Line (HoL) blocking present in preceding HTTP versions?',
    answer: 'HTTP/1.1: Allowed persistent connections (Keep-Alive), but suffered from Application-layer Head-of-Line blocking: browsers could only send one request at a time per TCP connection (workaround: opening 6 parallel TCP connections per domain). HTTP/2: Introduced Binary Framing and Multiplexing: interleaves multiple concurrent bi-directional streams over a single TCP connection, with HPACK header compression and Server Push. However, it suffered from TCP-layer HoL blocking: if a single TCP packet is dropped, the OS TCP stack pauses ALL multiplexed streams until packet retransmission. HTTP/3: Replaces TCP with QUIC over UDP. Each stream is truly independent; losing a packet in stream 3 has zero impact on streams 1, 2, or 4.',
    explanation: 'HTTP/3 also enables Connection Migration: if a smartphone switches from Wi-Fi to 4G/5G, connection survives without re-handshaking because QUIC uses 64-bit Connection IDs rather than IP/port tuples.',
    interviewTips: [
      'Explain 0-RTT connection resumption in TLS 1.3 / QUIC.',
      'Explain Server Push and why it was mostly deprecated in favor of 103 Early Hints.'
    ],
    companies: ['Cloudflare', 'Google', 'Meta', 'Fastly'],
  },
  {
    title: 'TLS/SSL 1.3 Cryptographic Handshake Workflow',
    category: 'Computer Science',
    topic: 'Computer Networks',
    difficulty: 'Hard',
    question: 'How does the TLS 1.3 handshake establish an encrypted HTTPS connection in 1-RTT, and why is RSA key exchange deprecated?',
    answer: 'TLS 1.2 required 2 round trips (2-RTT). TLS 1.3 optimizes to 1-RTT: (1) ClientHello: Client sends supported cipher suites and speculatively sends its Elliptic Curve Diffie-Hellman (ECDH) key share; (2) ServerHello: Server picks cipher suite, sends its own ECDH key share, server digital certificate, and finishes handshake. Both parties independently compute the symmetric session key (AES-GCM or ChaCha20-Poly1305) from shared secrets. RSA Key Exchange was deprecated because it does not support Forward Secrecy: if an attacker records encrypted traffic today and steals the server private key 5 years later, all historical traffic can be decrypted. Ephemeral Diffie-Hellman (ECDHE) generates fresh ephemeral keys per session, guaranteeing Forward Secrecy.',
    explanation: 'Symmetric encryption (AES) is thousands of times faster than Asymmetric encryption (RSA/ECC), which is why asymmetric crypto is only used to establish shared keys.',
    interviewTips: [
      'Define Perfect Forward Secrecy (PFS).',
      'Explain Certificate Authorities (CAs) and Public Key Infrastructure (PKI) certificate validation chains.'
    ],
    companies: ['Cloudflare', 'Stripe', 'Google', 'Cisco'],
  },
  // =========================================================================
  // CSE CURRICULUM: DATA STRUCTURES & ALGORITHMS (DSA TRACK)
  // =========================================================================
  {
    title: 'Two Pointers vs Sliding Window Technique',
    category: 'Data Structures & Algorithms',
    topic: 'Data Structures & Algorithms',
    difficulty: 'Medium',
    question: 'What is the algorithmic distinction between Two Pointers and Sliding Window, and what problem patterns dictate their choice?',
    answer: 'Two Pointers: Employs two independent indices that either converge toward each other (e.g. from array ends in sorted Two Sum, Palindrome verification) or move at different speeds (e.g. Fast & Slow pointer in cycle detection). Sliding Window: A specialized sub-category of two pointers that maintains a contiguous subarray or substring "window" bounded by left and right pointers. Used for range-based optimal value problems (e.g. maximum sum subarray of size K, longest substring without repeating characters). Key selection heuristic: If the problem asks for contiguous ranges with monotonic expansion/shrink constraints, use Sliding Window; if looking for pair relationships or sorted convergence, use Two Pointers.',
    explanation: 'Sliding window turns brute-force O(n²) nested loop range queries into optimal O(n) linear scans by adding right elements and subtracting left elements.',
    interviewTips: [
      'Always clearly state the window expansion condition and window shrink (while loop) invariant.',
      'Check if negative numbers exist; standard sliding window requires monotonic property which negative numbers can break.'
    ],
    companies: ['Google', 'Amazon', 'Microsoft', 'Adobe', 'Meta'],
  },
  {
    title: "Floyd's Cycle-Finding Algorithm (Tortoise and Hare)",
    category: 'Data Structures & Algorithms',
    topic: 'Data Structures & Algorithms',
    difficulty: 'Medium',
    question: "Prove why Floyd's Tortoise and Hare algorithm detects cycles in O(n) time and O(1) space, and how to find the exact cycle start node.",
    answer: "Phase 1 (Cycle Detection): Initialize slow and fast pointers at head. Move slow by 1 step, fast by 2 steps. If fast hits null, no cycle exists. If slow == fast, a cycle is guaranteed. Mathematical Proof: In each step, the relative distance between fast and slow decreases by 1 inside the loop of length C, so fast must catch slow in at most C steps. Phase 2 (Cycle Start): Let distance from head to cycle entrance be L1, distance from entrance to meeting point be L2, and remaining loop distance be L3. Fast travelled L1 + L2 + k*C. Slow travelled L1 + L2. Since fast is twice as fast: 2*(L1 + L2) = L1 + L2 + k*C => L1 = k*C - L2 = (k-1)*C + L3. Thus, if one pointer resets to head and both move at 1 step/iteration, they will meet exactly at the cycle entrance node.",
    explanation: 'Achieves O(1) auxiliary space without modifying the linked list or allocating a hash set of visited addresses.',
    interviewTips: [
      'Draw the L1, L2, L3 diagram on the whiteboard for the interviewer.',
      'Mention that the same concept applies to array problems like "Find the Duplicate Number" (LeetCode 287).'
    ],
    companies: ['Amazon', 'Microsoft', 'Oracle', 'Goldman Sachs'],
  },
  {
    title: 'Lowest Common Ancestor (LCA) in Binary Tree vs BST',
    category: 'Data Structures & Algorithms',
    topic: 'Data Structures & Algorithms',
    difficulty: 'Medium',
    question: 'How does finding the Lowest Common Ancestor differ in a Binary Search Tree (BST) versus a general Binary Tree?',
    answer: 'In a BST: We leverage the ordering invariant (left < root < right). Starting at root: (1) If both p and q are smaller than root->val, LCA must be in left subtree; (2) If both are greater, LCA must be in right subtree; (3) Otherwise, current root is the split point and therefore the LCA. Time: O(h), Space: O(1) iterative. In a General Binary Tree: No value ordering exists. We must use postorder DFS: (1) Base cases: if root is null or root == p or root == q, return root; (2) Recursively search left and right subtrees; (3) If both left and right return non-null, root is the LCA; (4) If only one subtree returns non-null, propagate that non-null node upwards. Time: O(n), Space: O(h) recursion stack.',
    explanation: 'LCA is fundamental in Git commit history trees, corporate organizational hierarchies, and network routing topologies.',
    interviewTips: [
      'Clarify if nodes p and q are guaranteed to exist in the tree.',
      'Explain iterative approaches using parent pointers in a hash map for very deep trees.'
    ],
    companies: ['Meta', 'Amazon', 'Apple', 'Google'],
  },
  {
    title: 'Graph Cycle Detection: Directed vs Undirected Algorithms',
    category: 'Data Structures & Algorithms',
    topic: 'Data Structures & Algorithms',
    difficulty: 'Hard',
    question: 'Why does simple visited-node tracking fail for cycle detection in directed graphs, and what algorithms resolve this?',
    answer: 'In an Undirected Graph: A cycle exists if during BFS/DFS traversal we encounter an already-visited neighbor that is NOT the immediate parent node. Alternatively, Disjoint Set Union (Union-Find) detects a cycle if both endpoints of an edge already share the same root. In a Directed Graph: Re-visiting a previously visited node does NOT necessarily mean a cycle (e.g. Diamond shape A->B, A->C, B->D, C->D has no cycle). A cycle only exists if an edge points to a node currently in the active recursion call stack (a Back-Edge). Resolved by: (1) 3-Color DFS: White (unvisited), Gray (currently in recursion stack), Black (fully processed). A cycle exists if we visit a Gray node; (2) Kahn\'s Algorithm (BFS Topological Sort): Count in-degrees. Repeatedly remove 0 in-degree nodes. If total processed nodes < V, a cycle exists.',
    explanation: 'Kahn algorithm time complexity is O(V + E) and directly outputs the build/dependency order if acyclic.',
    interviewTips: [
      'Mention real-world use cases: Package dependency managers (npm, pip), Makefile targets, deadlocks in OS resource graphs.',
      'Explain the difference between Tree Edges, Back Edges, Forward Edges, and Cross Edges in DFS trees.'
    ],
    companies: ['Google', 'Microsoft', 'Uber', 'Directi'],
  },
  {
    title: "Kadane's Algorithm for Maximum Subarray Sum",
    category: 'Data Structures & Algorithms',
    topic: 'Data Structures & Algorithms',
    difficulty: 'Easy',
    question: "Explain the dynamic programming decision in Kadane's Algorithm that achieves O(n) runtime and O(1) auxiliary space.",
    answer: "At each element nums[i], we make a local optimal decision: Should we extend the running contiguous subarray, or should we discard past elements and start a fresh subarray at nums[i]? State recurrence: currentMax = max(nums[i], currentMax + nums[i]). Global tracking: globalMax = max(globalMax, currentMax). If currentMax becomes negative, carrying it forward would strictly reduce the sum of subsequent subarrays, so resetting or starting anew is optimal. Space is O(1) because we only keep two scalar variables (currentMax and globalMax).",
    explanation: 'Handles all-negative arrays correctly by returning the single least-negative element.',
    interviewTips: [
      'Be prepared to return the actual start and end indices of the maximum subarray, not just the maximum sum.',
      'Mention divide-and-conquer alternative O(n log n) and compare with Kadane.'
    ],
    companies: ['Amazon', 'Samsung', 'Microsoft', 'Paytm', 'TCS Digital'],
  },
  {
    title: 'Dijkstra vs Bellman-Ford Shortest Path Comparison',
    category: 'Data Structures & Algorithms',
    topic: 'Data Structures & Algorithms',
    difficulty: 'Hard',
    question: 'Why does Dijkstra fail with negative edge weights, and how does Bellman-Ford detect negative cycles?',
    answer: 'Dijkstra Algorithm uses a Greedy strategy with a Min-Heap. Once a node is marked visited/extracted from the priority queue, Dijkstra assumes its shortest path is finalized and will never re-evaluate it. If a negative edge exists downstream, a previously settled node could be reached through a cheaper path, violating Dijkstra greedy invariant. Time: O((V + E) log V). Bellman-Ford Algorithm uses Dynamic Programming: It relaxes all E edges V-1 times. Since a simple path in a graph with V vertices has at most V-1 edges, all shortest paths must settle within V-1 iterations. Negative Cycle Detection: Run relaxation a V-th time. If any distance reduces, a negative weight cycle exists because distances can keep decreasing infinitely. Time: O(V * E).',
    explanation: 'For all-pairs shortest paths, Floyd-Warshall O(V³) is used for dense graphs.',
    interviewTips: [
      'Mention Johnson algorithm for sparse graphs with negative weights.',
      'Explain network routing protocols: OSPF uses Dijkstra; RIP uses Bellman-Ford (Distance Vector).'
    ],
    companies: ['Google', 'Cisco', 'Uber', 'Amazon'],
  },
  {
    title: 'Monotonic Stack Pattern for Next Greater Element',
    category: 'Data Structures & Algorithms',
    topic: 'Data Structures & Algorithms',
    difficulty: 'Hard',
    question: 'How does a Monotonic Stack solve Next Greater Element and Largest Rectangle in Histogram in amortized linear time?',
    answer: 'A Monotonic Stack maintains elements in strictly ascending or descending order. For Next Greater Element: Traverse array from right to left. While stack is not empty and stack.top() <= currentElement, pop stack. The top of stack is now the next greater element (or -1 if empty). Push currentElement onto stack. Time Complexity: While it contains a nested while loop, every element is pushed onto the stack exactly once and popped at most once. Total operations = 2n, giving an amortized O(n) runtime over the brute-force O(n²) scan. Space is O(n) in worst case.',
    explanation: 'Crucial in financial stock span analysis, daily temperatures, trapping rainwater, and histogram rectangles.',
    interviewTips: [
      'Explain why monotonic increasing stack is used for Next Smaller and monotonic decreasing for Next Greater.',
      'Walk through the amortized time analysis to show why it is O(n) not O(n²).'
    ],
    companies: ['Amazon', 'Google', 'Flipkart', 'Bloomberg'],
  },
  {
    title: 'Trie (Prefix Tree) Architecture and Complexity',
    category: 'Data Structures & Algorithms',
    topic: 'Data Structures & Algorithms',
    difficulty: 'Medium',
    question: 'How is a Trie data structure structured, and why is it superior to a Hash Map for auto-complete prefix search?',
    answer: 'A Trie is an N-ary tree where each node represents a character. A TrieNode typically contains: (1) children: array of size 26 (for lowercase English) or HashMap; (2) isEndOfWord: boolean flag indicating if a valid dictionary word terminates here. In a Hash Map: Looking up prefix "app" requires checking all stored keys or hashing every prefix, taking O(N * L) where N is dictionary size. In a Trie: Traversing "a" -> "p" -> "p" takes exactly O(L) operations, where L is prefix length, strictly independent of how many millions of words exist in the dictionary. Auto-complete: Navigate to the prefix end node, then run DFS/BFS to collect all downstream words.',
    explanation: 'Memory trade-off: A naive Trie with size-26 pointers per node can consume significant memory; Compressed Tries (Radix Tree / Patricia Trie) merge single-child chains.',
    interviewTips: [
      'Mention Trie applications: IP routing routing tables (Longest Prefix Match), spell checkers, T9 predictive text.',
      'Explain how storing frequency or top-K recommendations at each node enables fast autocomplete.'
    ],
    companies: ['Google', 'Microsoft', 'Uber', 'Twitter'],
  },
  // =========================================================================
  // CSE CURRICULUM: DATABASE MANAGEMENT SYSTEMS (DBMS & SQL TRACK)
  // =========================================================================
  {
    title: 'B+ Tree Index Internals in Relational Engines (InnoDB)',
    category: 'Database',
    topic: 'Database Management Systems',
    difficulty: 'Hard',
    question: 'Why do relational databases like MySQL (InnoDB) and PostgreSQL choose B+ Trees over Hash Indexes or Binary Search Trees?',
    answer: '1. Disk Block Alignment & High Fanout: RAM access is in nanoseconds, disk/SSD page access is in milliseconds. BSTs have fanout 2 and tree height log2(N), requiring 20+ random disk I/O operations. A B+ Tree node matches the OS/DB page size (typically 16 KB) with a fanout of 1000+, keeping tree depth to 3-4 levels for billions of rows (only 3-4 disk reads). 2. Range Queries: In Hash indexes, equality lookup is O(1) but range queries (WHERE age BETWEEN 20 AND 30) require full table scans because hashing destroys order. In B+ Trees, all actual data pointers reside exclusively at leaf nodes, and leaf nodes are linked in a bi-directional doubly linked list, enabling lightning-fast sequential range scans. 3. Cache Predictability: Non-leaf nodes only hold keys and page pointers, allowing internal nodes to fit entirely into RAM buffer pool.',
    explanation: 'B+ Trees differ from standard B-Trees because B-Tree internal nodes also store row data, reducing fanout and increasing tree height.',
    interviewTips: [
      'State MySQL InnoDB default page size (16KB) and calculate how many keys fit per page.',
      'Explain Index-Organized Tables vs Heap Tables.'
    ],
    companies: ['Amazon', 'Oracle', 'Salesforce', 'Uber', 'Google'],
  },
  {
    title: 'Database Transaction Isolation Levels and Concurrency Anomalies',
    category: 'Database',
    topic: 'Database Management Systems',
    difficulty: 'Hard',
    question: 'Define the 4 SQL isolation levels and the specific anomalies (Dirty Read, Non-Repeatable Read, Phantom Read) each prevents.',
    answer: '1. Read Uncommitted: Transactions read uncommitted changes of other transactions. Anomaly: Dirty Read (reading data that gets rolled back). 2. Read Committed (Postgres default): Transactions only read committed data. Prevents Dirty Reads. Anomaly: Non-Repeatable Read (re-reading the same row within the same transaction yields different values because another transaction committed an update). 3. Repeatable Read (MySQL InnoDB default): Guarantees that any row read once remains identical across subsequent reads in that transaction. Prevents Dirty Reads and Non-Repeatable Reads. Anomaly: Phantom Read (new rows inserted by another transaction match query filter upon re-query). Note: InnoDB prevents phantom reads even at Repeatable Read using Next-Key Locking. 4. Serializable: Strictest level; transactions execute with identical results as if executed sequentially. Prevents all anomalies using two-phase locking (2PL) or Serializable Snapshot Isolation (SSI).',
    explanation: 'Higher isolation levels reduce concurrency throughput and increase deadlock probability due to lock contention.',
    interviewTips: [
      'Explain MVCC (Multi-Version Concurrency Control) and how Snapshot Isolation works without read locks.',
      'Give a real banking example of why Read Committed causes race conditions in double-spending.'
    ],
    companies: ['Stripe', 'PayPal', 'Goldman Sachs', 'Amazon', 'Visa'],
  },
  {
    title: 'Clustered vs Non-Clustered (Secondary) Index Differences',
    category: 'Database',
    topic: 'Database Management Systems',
    difficulty: 'Medium',
    question: 'How do clustered and non-clustered indexes physically organize data on disk, and what is a Covering Index?',
    answer: 'Clustered Index: Defines the physical on-disk sorted order of table rows. The leaf nodes of the clustered B+ tree contain the ACTUAL row data columns. Hence, a table can have only ONE clustered index (typically Primary Key). Non-Clustered (Secondary) Index: Stored as a separate B+ tree structure on disk. The leaf nodes contain the indexed columns plus a pointer to the clustered index key. Bookmark/Key Lookup: Querying columns not in the secondary index requires traversing the secondary index first, grabbing the primary key, and making a second traversal into the clustered index. Covering Index: An optimization where all columns requested in the SELECT statement exist inside the secondary index itself, completely eliminating the secondary clustered index lookup.',
    explanation: 'Covering index queries run 10x-50x faster because disk seek operations are cut in half.',
    interviewTips: [
      'Explain composite indexes and the Leftmost Prefix Rule (e.g. index on (A, B) works for A and (A,B), but not B alone).',
      'Explain why indexing columns with low cardinality (e.g. gender or boolean) is an anti-pattern.'
    ],
    companies: ['Microsoft', 'Amazon', 'Oracle', 'Flipkart'],
  },
  {
    title: 'Database Normalization: 1NF to BCNF with Concrete Violations',
    category: 'Database',
    topic: 'Database Management Systems',
    difficulty: 'Medium',
    question: 'Explain the progression of database normalization from 1NF to BCNF and the update/delete anomalies eliminated.',
    answer: 'Normalization decomposes tables to eliminate redundancy and update/insert/delete anomalies: (1) 1NF (Atomic): Columns contain atomic scalar values (no comma-separated lists or repeating groups) and each row has a primary key. (2) 2NF (No Partial Dependency): Must be in 1NF, and every non-prime attribute must depend on the WHOLE candidate key, not a subset of a composite key. (3) 3NF (No Transitive Dependency): Must be in 2NF, and no non-prime attribute should depend on another non-prime attribute (X -> Y where Y is non-prime and X is not candidate key). (4) BCNF (Boyce-Codd): Stricter 3NF; for every functional dependency X -> Y, X MUST be a superkey. Anomalies eliminated: Update anomaly (updating an author name in 50 book rows), Insert anomaly (cannot record author until they publish a book), Delete anomaly (deleting last book accidentally deletes author record).',
    explanation: 'In high-scale OLAP read-heavy analytics systems, deliberate denormalization (Star Schema / Snowflake) is preferred to avoid multi-table JOINs.',
    interviewTips: [
      'Give a concrete student-course or employee-department example on whiteboard.',
      'Explain when denormalization is acceptable in production.'
    ],
    companies: ['Amazon', 'Infosys SP', 'TCS Digital', 'Wipro Turbo'],
  },
  // =========================================================================
  // CSE CURRICULUM: OPERATING SYSTEMS & LINUX (OS TRACK)
  // =========================================================================
  {
    title: 'Process vs Thread and Context Switching Overhead',
    category: 'Computer Science',
    topic: 'Operating Systems',
    difficulty: 'Medium',
    question: 'How do Processes and Threads differ in memory layout, and what hardware/kernel operations make process context switches expensive?',
    answer: 'Memory Layout: A Process has its own independent, protected virtual address space containing Text, Data, Heap, and Stack, managed via a Process Control Block (PCB). Threads within the same process share the Text, Data, Heap, open file descriptors, and socket handles, but maintain private Thread Control Blocks (TCB), Program Counters (PC), CPU registers, and Stack frames. Context Switching Overhead: Thread context switch: Saves and restores CPU registers, PC, and stack pointer within the same address space. Process context switch: In addition to register saving, the kernel must switch the active page directory by updating the CPU CR3 control register. This flushes the Translation Lookaside Buffer (TLB) hardware cache. All subsequent memory reads miss the TLB and trigger multi-level page table traversals in RAM, dramatically degrading instruction throughput for thousands of CPU cycles.',
    explanation: 'Forking a process in Linux uses Copy-On-Write (COW): child shares parent physical pages read-only until either modifies a page, creating a private copy on demand.',
    interviewTips: [
      'Explain Linux task_struct and how Linux implements threads as light-weight processes via clone() system call.',
      'Discuss Goroutines or Java Virtual Threads vs OS kernel threads.'
    ],
    companies: ['Google', 'Meta', 'Microsoft', 'Qualcomm', 'Intel'],
  },
  {
    title: 'Deadlock 4 Conditions and the Banker Safety Algorithm',
    category: 'Computer Science',
    topic: 'Operating Systems',
    difficulty: 'Hard',
    question: 'What are the Coffman conditions for deadlock, and how does the Banker Algorithm guarantee a safe state?',
    answer: "The 4 Coffman conditions must hold simultaneously: (1) Mutual Exclusion: At least one resource held in non-shareable mode; (2) Hold and Wait: A process holds resources while requesting additional ones; (3) No Preemption: Resources cannot be forcibly seized; (4) Circular Wait: P0 waits for P1, P1 waits for P2... Pn waits for P0. Prevention: Breaking any single condition eliminates deadlocks. The most practical is breaking Circular Wait by establishing a global strict ordering on resource IDs (all threads must acquire lock A before lock B). Banker's Algorithm (Dijkstra): Avoidance algorithm for systems with multiple resource instances. It tracks Allocation, Max, Available, and Need matrices (Need = Max - Allocation). Before granting a request, it simulates the allocation and checks if there exists a Safe Sequence <P1, P2... Pn> where each process can finish with currently available resources + already held resources. If no safe sequence exists, request is rejected.",
    explanation: 'In practice, modern general-purpose operating systems like Linux use the Ostrich Algorithm (ignoring deadlocks because occurrence is rare compared to avoidance overhead).',
    interviewTips: [
      'Explain Deadlock Detection via Resource Allocation Graphs (RAG) and cycle finding.',
      'Compare Deadlock (processes blocked forever) with Livelock (processes continuously change state without making forward progress) and Starvation.'
    ],
    companies: ['Microsoft', 'Amazon', 'Cisco', 'Nvidia'],
  },
  {
    title: 'Virtual Memory, Multi-Level Paging, and Thrashing',
    category: 'Computer Science',
    topic: 'Operating Systems',
    difficulty: 'Hard',
    question: 'How does 64-bit multi-level paging map virtual addresses to physical RAM, and what causes Thrashing?',
    answer: 'Virtual Memory decouples application memory from physical RAM, providing isolated 48-bit or 57-bit virtual address spaces. Paging Architecture: Virtual memory is divided into fixed-size Pages (typically 4 KB); physical RAM is divided into matching Page Frames. A single linear page table for 2^48 bytes would require petabytes of RAM, so x86-64 uses 4-Level Paging (PML4 -> PDPT -> PD -> PT -> Offset). Translation: CPU checks Translation Lookaside Buffer (TLB) hardware cache. If TLB miss occurs, Memory Management Unit (MMU) walks the 4-level page table to find the Page Frame Number (PFN) and combines it with offset. If page is marked not-present in RAM, MMU triggers a Page Fault interrupt. The OS pauses the thread, fetches the page from swap disk, updates page table, and resumes thread. Thrashing: Occurs when the sum of the Working Sets of all active processes exceeds available physical RAM. The OS spends 99% of its CPU time swapping pages in and out of disk rather than executing user instructions, causing system freeze.',
    explanation: 'Solved using the Working Set Model or Page-Fault Frequency (PFF) algorithm: OS suspends or swaps out low-priority processes to free memory for active ones.',
    interviewTips: [
      'Explain Inverted Page Tables vs Hierarchical Page Tables.',
      'Explain Demand Paging and Copy-On-Write (COW).'
    ],
    companies: ['Google', 'Apple', 'Intel', 'Microsoft', 'Nvidia'],
  },
  // =========================================================================
  // CSE CURRICULUM: COMPUTER NETWORKS (NETWORKS TRACK)
  // =========================================================================
  {
    title: 'TCP 3-Way Handshake & 4-Way Teardown with TIME_WAIT',
    category: 'Computer Science',
    topic: 'Computer Networks',
    difficulty: 'Medium',
    question: 'Explain the packet exchange in TCP connection establishment, termination, and the necessity of the TIME_WAIT state.',
    answer: 'Connection Establishment (3-Way Handshake): (1) Client -> Server: SYN (Synchronize sequence number X); (2) Server -> Client: SYN-ACK (Server sequence Y, Acknowledgement X+1); (3) Client -> Server: ACK (Acknowledgement Y+1). Both endpoints now synchronize sequence numbers and agree on window size and MSS (Maximum Segment Size). Connection Termination (4-Way Handshake): (1) Client -> Server: FIN (Client has finished sending data); (2) Server -> Client: ACK (Acknowledges client FIN; server may still send remaining data); (3) Server -> Client: FIN (Server has finished sending); (4) Client -> Server: ACK (Client acknowledges server FIN). Why TIME_WAIT (2 * MSL = Maximum Segment Lifetime, ~60-120s) is mandatory for the active closer: (1) Reliability: If the client final ACK is lost, server will retransmit FIN. The client must remain alive in TIME_WAIT to resend ACK, preventing server from hanging in LAST_ACK; (2) Segment Drain: Prevents old delayed duplicate packets from a previous connection incarnation from interfering with a new socket reusing the same IP/Port tuple.',
    explanation: 'High connection-churn servers can suffer from TIME_WAIT port exhaustion; mitigated by SO_REUSEADDR socket option.',
    interviewTips: [
      'Explain SYN Flood attacks and how SYN Cookies mitigate them without allocating kernel backlog memory.',
      'Compare Half-Closed TCP connections with clean teardowns.'
    ],
    companies: ['Cloudflare', 'Amazon', 'Cisco', 'Google', 'Meta'],
  },
  {
    title: 'The 7 Layers of the OSI Model vs 4 Layers of TCP/IP',
    category: 'Computer Science',
    topic: 'Computer Networks',
    difficulty: 'Easy',
    question: 'Enumerate the 7 OSI layers, their corresponding Protocol Data Units (PDUs), and real placement networking protocols.',
    answer: '1. Physical Layer: Transmits raw bits over physical transmission media (cables, fiber, RF). PDU: Bit. Protocols: Ethernet PHY, DSL. 2. Data Link Layer: Node-to-node framing, physical MAC addressing, error detection (CRC). PDU: Frame. Protocols: Ethernet, Wi-Fi 802.11, ARP. 3. Network Layer: Host-to-host packet routing across heterogeneous networks using logical IP addressing. PDU: Packet. Protocols: IPv4, IPv6, ICMP, OSPF, BGP. 4. Transport Layer: End-to-end process-to-process communication, multiplexing ports, segmentation, reliability. PDU: Segment (TCP) / Datagram (UDP). Protocols: TCP, UDP. 5. Session Layer: Establishes, manages, and terminates presentation sessions. Protocols: RPC, NetBIOS. 6. Presentation Layer: Syntax translation, character encoding (ASCII/UTF-8), compression, encryption/decryption (TLS). 7. Application Layer: High-level human-computer network interaction protocols. PDU: Message/Data. Protocols: HTTP, DNS, SMTP, FTP, SSH. In the 4-layer TCP/IP Model: Application, Presentation, and Session are combined into Application Layer; Network is Internet Layer; Data Link and Physical are Network Access Layer.',
    explanation: 'Routers operate primarily at Layer 3; Layer 2 Switches at Layer 2; Next-Gen Firewalls and Load Balancers operate up to Layer 7.',
    interviewTips: [
      'Explain Data Encapsulation (Headers prepended) on egress and Decapsulation on ingress.',
      'Be ready to explain where ARP belongs (between Layer 2 and Layer 3).'
    ],
    companies: ['Cisco', 'Juniper', 'Amazon', 'TCS Prime', 'Infosys'],
  },
  {
    title: 'DNS Resolution Lifecycle: Step-by-Step Traversal',
    category: 'Computer Science',
    topic: 'Computer Networks',
    difficulty: 'Medium',
    question: 'Trace the complete recursive and iterative sequence when a client resolves a domain name like "api.google.com".',
    answer: '1. Local Cache Check: Browser checks its internal DNS cache -> OS cache -> hosts file. 2. Recursive Query: If missed, client queries the configured Local Recursive DNS Resolver (e.g. ISP resolver or Google 8.8.8.8, Cloudflare 1.1.1.1). The resolver undertakes iterative queries on behalf of client. 3. Root Nameserver (.): Recursive resolver queries one of the 13 global root server IP addresses. Root server replies with the Top-Level Domain (TLD) nameserver IP for ".com". 4. TLD Nameserver (.com): Resolver queries ".com" TLD server. TLD server replies with Authoritative Nameserver IP addresses for "google.com" (e.g. ns1.google.com). 5. Authoritative Nameserver: Resolver queries "google.com" Authoritative server for the specific A or AAAA record of "api.google.com". Authoritative server returns target IP address (e.g. 142.250.190.46) with TTL (Time To Live). 6. Caching and Return: Resolver caches result according to TTL and returns IP to browser OS, which initiates TCP handshake.',
    explanation: 'DNS uses UDP port 53 for speed; falls back to TCP port 53 if packet exceeds 512 bytes or for zone transfers.',
    interviewTips: [
      'Explain CNAME vs A vs AAAA vs MX records.',
      'Explain Anycast routing used by root and CDN nameservers.'
    ],
    companies: ['Cloudflare', 'Akamai', 'Google', 'AWS Route 53'],
  },
  // =========================================================================
  // CSE CURRICULUM: FULL-STACK SYSTEM DESIGN (SYSTEM DESIGN TRACK)
  // =========================================================================
  {
    title: 'Caching Strategies: Cache-Aside vs Write-Through vs Write-Behind',
    category: 'Web Development',
    topic: 'System Design',
    difficulty: 'Medium',
    question: 'Compare Cache-Aside, Write-Through, and Write-Behind (Write-Back) caching patterns with failure modes and consistency trade-offs.',
    answer: '1. Cache-Aside (Lazy Loading): The application code is responsible for caching. On Read: Check cache; if hit, return. If miss, query DB, write to cache, and return. On Write: Update DB directly and invalidate/delete cache key. Pros: Resilient to cache crashes (DB is source of truth); only requested data is cached. Cons: Cache miss latency penalty for cold keys; potential stale data if cache deletion fails. 2. Write-Through: Application writes data to cache; cache immediately and synchronously updates database within the same transaction. Pros: Cache is never stale; clean app code. Cons: High write latency (writes wait on both cache and DB); writes cache data that may never be read again. 3. Write-Behind (Write-Back): Application writes to cache and returns immediately. Cache asynchronously flushes accumulated updates to DB in batches every few seconds. Pros: Ultra-fast write throughput; batches reduce database IOPS. Cons: High risk of data loss if cache node crashes before flushing dirty pages to disk.',
    explanation: 'Eviction policies: LRU (Least Recently Used), LFU (Least Frequently Used), and FIFO.',
    interviewTips: [
      'Explain the Cache Stampede (Thundering Herd) problem and how Mutex locks or Probabilistic Early Expiration solve it.',
      'Discuss Redis vs Memcached differences.'
    ],
    companies: ['Amazon', 'Uber', 'Netflix', 'Twitter', 'Meta'],
  },
  {
    title: 'Distributed Message Queues: Apache Kafka vs RabbitMQ',
    category: 'Web Development',
    topic: 'System Design',
    difficulty: 'Hard',
    question: 'How do message storage, delivery models, and ordering guarantees differ between Apache Kafka and RabbitMQ?',
    answer: '1. Architecture & Storage: RabbitMQ: Traditional message broker. Messages are pushed to consumers via exchanges and queues, and deleted from disk/memory once acknowledged. State resides in broker. Apache Kafka: Distributed, append-only partitioned commit log. Messages are persisted to disk for a configured retention period (e.g. 7 days) regardless of consumption. Consumers pull data and maintain their own offset pointers. 2. Delivery & Ordering: RabbitMQ: Strict FIFO within a single queue, but concurrent consumers can cause out-of-order processing. Kafka: Strict FIFO ordering is guaranteed within a specific Partition, but not across multiple partitions of a topic. To preserve ordering for a specific user, use user_id as partition key so all events for that user land in the same partition. 3. Scale: RabbitMQ handles tens of thousands of messages/sec (ideal for complex routing, task queues). Kafka easily streams millions of events/sec through sequential disk I/O, zero-copy kernel pagecache, and batching.',
    explanation: 'Delivery semantics: At-most-once, At-least-once (requires idempotent consumers), and Exactly-once (Kafka transactional producer/consumer API).',
    interviewTips: [
      'Explain how Kafka Consumer Groups enable horizontal scaling.',
      'Explain Idempotency and Deduplication strategies using unique transaction IDs.'
    ],
    companies: ['LinkedIn', 'Uber', 'Stripe', 'Netflix', 'Goldman Sachs'],
  },
  {
    title: 'The CAP Theorem and PACELC Distributed Trade-Offs',
    category: 'Web Development',
    topic: 'System Design',
    difficulty: 'Hard',
    question: 'Explain why a distributed database can only guarantee 2 of the 3 CAP properties, and define the PACELC theorem.',
    answer: 'CAP Theorem: In any asynchronous networked distributed data store, you can only simultaneously guarantee two of: Consistency (C: every read receives the most recent write or error), Availability (A: every non-failing node returns a non-error response, without guarantee of latest write), Partition Tolerance (P: system continues operating despite arbitrary dropped or delayed network packets between nodes). In real distributed physical networks, network partitions (P) are unavoidable due to router failures, cable cuts, or latency spikes. Therefore, during a partition, a system MUST choose between: CP (sacrifices availability; rejects writes to avoid split-brain, e.g. HBase, MongoDB, ZooKeeper) or AP (sacrifices consistency; returns stale data to stay available, e.g. Cassandra, DynamoDB, CouchDB). PACELC Theorem (Daniel Abadi): Extends CAP for normal operation when no partition exists: If Partition (P): choose Availability (A) or Consistency (C); Else (E): choose Latency (L) or Consistency (C). Example: DynamoDB is PA/EL (favors low latency in normal mode).',
    explanation: 'Eventual Consistency: If no new updates are made to a given data item, all replicas will eventually return the same value.',
    interviewTips: [
      'Explain Quorum Consensus formula: R + W > N (Read quorum + Write quorum > Total replicas).',
      'Explain Split-Brain problem in distributed master election.'
    ],
    companies: ['Amazon', 'Google', 'Microsoft', 'Databricks', 'Snowflake'],
  },
  // =========================================================================
  // CORE PROGRAMMING: PYTHON & C++ (SYSTEMS & APPLICATION CODING)
  // =========================================================================
  {
    title: 'Python: Global Interpreter Lock (GIL) and Concurrency',
    category: 'Programming',
    topic: 'Python',
    difficulty: 'Hard',
    question: 'What is the Python GIL, why was it introduced in CPython, and how do you achieve true parallelism in Python?',
    answer: 'The Global Interpreter Lock (GIL) is a mutual-exclusion mutex used by the CPython interpreter to ensure that only ONE native operating system thread executes Python bytecode at any given moment, even on multi-core processors. Why it exists: CPython uses Reference Counting for memory management. Without the GIL, concurrent threads modifying object reference counts would trigger race conditions and memory corruption. The GIL provides thread safety for C libraries and makes single-threaded performance fast. Concurrency vs Parallelism in Python: (1) I/O-Bound Tasks (network requests, DB queries, file reads): Use threading or asyncio. When a thread awaits I/O, CPython releases the GIL, allowing other threads to run concurrently; (2) CPU-Bound Tasks (matrix multiplication, image processing): Python threading is useless because threads fight for the GIL, resulting in slower execution than single-thread. Solution: Use the multiprocessing module (spawns separate OS processes with independent memory spaces and separate GIL instances) or compiled extensions in C/C++/Cython.',
    explanation: 'PEP 703 introduces free-threaded Python 3.13 (optional build without GIL) using biased reference counting and mimalloc.',
    interviewTips: [
      'Explain ProcessPoolExecutor vs ThreadPoolExecutor in concurrent.futures.',
      'Explain why asyncio uses a cooperative single-threaded event loop rather than preemptive OS threads.'
    ],
    companies: ['Google', 'Dropbox', 'Netflix', 'Meta'],
  },
  {
    title: 'C++: Virtual Destructors and VTable Dynamic Dispatch',
    category: 'Programming',
    topic: 'C++',
    difficulty: 'Medium',
    question: 'Why must base class destructors be declared virtual in C++, and how does the VTable achieve dynamic polymorphism?',
    answer: 'Virtual Destructor: When a derived class object is deleted through a pointer to the base class (e.g. Base* b = new Derived(); delete b;), if the Base destructor is NOT declared virtual, the compiler performs static binding at compile time. Only Base::~Base() executes; Derived::~Derived() is NEVER invoked, causing resource and memory leaks for all dynamic memory allocated inside Derived. Declaring virtual ~Base() forces dynamic binding via the VTable, ensuring destructors execute in reverse order of inheritance (Derived -> Base). VTable (Virtual Method Table): An array of function pointers created by the compiler for every class containing at least one virtual function. VPTR (Virtual Pointer): A hidden pointer inserted at the very beginning of each object instance pointing to the class VTable. Dynamic Dispatch: When calling b->foo(), the compiled code dereferences b->vptr, looks up the offset for foo in the VTable, and calls the derived implementation at runtime (adds ~1-2 pointer dereference CPU cycles).',
    explanation: 'Classes with virtual methods incur a size overhead of one pointer (8 bytes on 64-bit systems) for the VPTR.',
    interviewTips: [
      'Explain pure virtual functions (= 0) and Abstract Base Classes (interfaces).',
      'Explain object slicing when passing derived objects by value instead of by reference/pointer.'
    ],
    companies: ['Microsoft', 'Bloomberg', 'Adobe', 'Electronic Arts', 'Qualcomm'],
  },
  {
    title: 'JavaScript: Microtask Queue vs Macrotask Queue in Event Loop',
    category: 'Web Development',
    topic: 'JavaScript',
    difficulty: 'Hard',
    question: 'How does the JavaScript Event Loop prioritize Microtasks versus Macrotasks, and what is the execution order of Promise vs setTimeout?',
    answer: 'JavaScript is single-threaded. Concurrency is handled via the Call Stack, Web APIs, Microtask Queue, and Task (Macrotask) Queue. Priority Rule: The Event Loop executes the synchronous code on Call Stack until empty. BEFORE taking the next Macrotask from the Task Queue, the Event Loop MUST exhaust ALL pending jobs in the Microtask Queue completely, including any new microtasks enqueued while processing existing microtasks. Macrotasks: setTimeout, setInterval, setImmediate (Node.js), I/O operations, UI rendering events. Microtasks: Promise.then/catch/finally callbacks, queueMicrotask(), MutationObserver, process.nextTick (Node.js highest priority). Execution Order Example: console.log("1"); setTimeout(() => console.log("2"), 0); Promise.resolve().then(() => console.log("3")); console.log("4"); Output: "1", "4", "3", "2". Synchronous 1 and 4 log first; microtask 3 logs immediately when stack empties; timer macrotask 2 runs in the subsequent event loop tick.',
    explanation: 'Starvation: An infinite recursive microtask loop (e.g. recursive Promise.resolve().then(...)) will freeze the browser and prevent UI rendering or user clicks completely.',
    interviewTips: [
      'Explain how requestAnimationFrame fits into the rendering phase between microtask exhaustion and macrotasks.',
      'Explain async/await syntax: everything after await is syntactic sugar for Promise.then() and placed on the microtask queue.'
    ],
    companies: ['Google', 'Meta', 'Amazon', 'Netflix', 'Uber'],
  },

  // =========================================================================
  // DATA STRUCTURES & ALGORITHMS (ADDITIONAL TIER-1 PLACEMENT QUESTIONS)
  // =========================================================================
  {
    title: 'Binary Search on Answer / Monotonic Predicate',
    category: 'Data Structures & Algorithms',
    topic: 'Data Structures & Algorithms',
    difficulty: 'Medium',
    question: 'How do you apply Binary Search to non-array optimization problems (e.g. Koko Eating Bananas or Ship Packages)?',
    answer: 'Pattern: When a problem asks to find the minimum or maximum value X that satisfies a condition, and the condition is monotonic (if X is feasible, all values > X are feasible; or vice versa), we can binary search the answer space [low, high]. Algorithm: 1. Identify search range [minPossible, maxPossible]. 2. Define a helper function isFeasible(speed): iterates through the input in O(N) time and returns true/false. 3. In the while (low <= high) loop, calculate mid = low + (high - low) / 2. If isFeasible(mid) is true, record mid as potential answer and search the lower half (high = mid - 1) to find minimum. Else, search upper half (low = mid + 1). Complexity: O(N * log(Range)). Eliminates brute force linear scan over massive value spaces.',
    explanation: 'Monotonicity is the prerequisite: if speeding up eating never increases time, the search space is strictly sorted in boolean feasibility space (false, false, ..., true, true).',
    interviewTips: [
      'Mention edge case: low + (high - low) / 2 avoids 32-bit integer overflow.',
      'Highlight that the array elements themselves do not need to be sorted; only the feasibility function output across the range must be monotonic.'
    ],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Bloomberg'],
  },
  {
    title: 'Sliding Window Maximum using Monotonic Deque',
    category: 'Data Structures & Algorithms',
    topic: 'Data Structures & Algorithms',
    difficulty: 'Hard',
    question: 'How do you find the maximum in every sliding window of size K in O(N) time using a Monotonic Deque?',
    answer: 'Approach: Use a Double-Ended Queue (Deque) storing array INDICES in monotonic decreasing order of their corresponding values. Invariant: The front of the deque deque.peekFirst() always stores the index of the maximum element in the current window. For each element nums[i]: 1. Remove Outdated Indices: While deque is not empty and deque.peekFirst() <= i - k, drop the front element (it fell out of the sliding window). 2. Maintain Monotonicity: While deque is not empty and nums[deque.peekLast()] <= nums[i], pop from back. Smaller elements will NEVER be the maximum in any future window containing nums[i]. 3. Push current index: deque.addLast(i). 4. Record Result: When i >= k - 1, output nums[deque.peekFirst()]. Complexity: O(N) time because each index is added to and removed from the deque at most once (amortized O(1) per step); O(K) space.',
    explanation: 'A naive heap approach takes O(N log K) time and requires lazy removal. The monotonic deque achieves optimal O(N) linear time.',
    interviewTips: [
      'Store indices, NOT values, in the deque so you can determine if a stored element is out of window bounds in O(1).',
      'Explain that every element enters once and leaves once, so the inner while loop executes at most N times total.'
    ],
    companies: ['Amazon', 'Google', 'Salesforce', 'Microsoft', 'Uber'],
  },
  {
    title: 'Topological Sort & Course Schedule (Kahn\'s BFS vs DFS Cycle Detection)',
    category: 'Data Structures & Algorithms',
    topic: 'Data Structures & Algorithms',
    difficulty: 'Medium',
    question: 'Explain how Kahn\'s BFS algorithm detects cycles and produces a valid topological ordering of a Directed Acyclic Graph (DAG).',
    answer: 'Kahn\'s Algorithm: 1. Calculate the in-degree (number of incoming edges) for every vertex in the graph. 2. Initialize a Queue and enqueue all vertices with in-degree = 0 (vertices with no prerequisites). 3. While the queue is not empty, dequeue vertex u and append it to the topological order list. 4. For each neighbor v of u, decrement inDegree[v] by 1. If inDegree[v] becomes 0, enqueue v. 5. Cycle Detection: If the count of processed vertices equals total vertices V, the graph is a valid DAG and the order is valid. If processed count < V, there exists a directed cycle, and topological ordering is impossible! Complexity: O(V + E) time and O(V + E) space using an adjacency list.',
    explanation: 'Vertices in a directed cycle never have their in-degrees reduced to zero, preventing them from ever entering the queue.',
    interviewTips: [
      'Mention how DFS with 3-color states (White = unvisited, Gray = visiting/in stack, Black = completed) can also detect back-edges and cycles.',
      'Highlight real-world applications: build dependency resolution (npm, Maven, Bazel) and spreadsheet formula recalculation.'
    ],
    companies: ['Amazon', 'Google', 'Apple', 'Oracle', 'Goldman Sachs'],
  },
  {
    title: 'Disjoint Set Union (DSU) / Union-Find with Path Compression & Rank',
    category: 'Data Structures & Algorithms',
    topic: 'Data Structures & Algorithms',
    difficulty: 'Medium',
    question: 'How do Path Compression and Union by Rank achieve near-constant amortized time complexity in Disjoint Set Union (DSU)?',
    answer: 'DSU maintains a forest of trees where each node points to its parent. Operations: 1. Find(i) with Path Compression: Recursively finds the root of set containing i, and flattens the tree by re-pointing i directly to the root: parent[i] = find(parent[i]). 2. Union(i, j) by Rank/Size: Find roots root_i and root_j. If roots match, i and j are already in the same component (detects cycle in undirected graph). Otherwise, attach the root of the shorter tree beneath the root of the taller tree to keep depth minimal. Complexity: Combining both optimizations yields an amortized time complexity of O(alpha(N)) per operation, where alpha is the Inverse Ackermann function. For all practical values of N (up to 10^80 atoms in universe), alpha(N) < 5, making operations effectively O(1) constant time.',
    explanation: 'Without path compression or rank, the tree can degenerate into a linear linked list of depth N, degrading operations to O(N).',
    interviewTips: [
      'Write out the 6-line find() function with path compression cleanly on a whiteboard.',
      'Explain its application in Kruskal\'s Minimum Spanning Tree (MST) algorithm and connected components in dynamic graphs.'
    ],
    companies: ['Microsoft', 'Google', 'Amazon', 'Meta', 'Salesforce'],
  },
  {
    title: 'Trapping Rain Water: Two Pointers vs Monotonic Stack',
    category: 'Data Structures & Algorithms',
    topic: 'Data Structures & Algorithms',
    difficulty: 'Hard',
    question: 'How does the Two-Pointer technique calculate trapped rain water in O(N) time and O(1) auxiliary space?',
    answer: 'Key Invariant: The water trapped above index i is determined by min(max_left, max_right) - height[i]. If max_left < max_right, the amount of water trapped on the left side is bottlenecked solely by max_left, regardless of how much taller the right side might be! Two-Pointer Algorithm: 1. Initialize left = 0, right = n - 1, max_left = 0, max_right = 0, total_water = 0. 2. While left < right: if height[left] <= height[right]: if height[left] >= max_left, update max_left = height[left]; else, total_water += max_left - height[left]; left++. Else (height[right] < height[left]): if height[right] >= max_right, update max_right = height[right]; else, total_water += max_right - height[right]; right--. 3. Return total_water. Complexity: O(N) time single pass, O(1) auxiliary space (eliminates the O(N) arrays needed by prefix-max methods).',
    explanation: 'Because we process the smaller of height[left] and height[right], we know with mathematical certainty that an equal or taller wall exists on the opposite boundary.',
    interviewTips: [
      'First explain the O(N) space prefix-max and suffix-max intuition before presenting the O(1) space two-pointer proof.',
      'Handle edge cases: arrays of length < 3 cannot trap water.'
    ],
    companies: ['Amazon', 'Google', 'Apple', 'Meta', 'Bloomberg'],
  },
  {
    title: 'Top K Frequent Elements: Min-Heap vs QuickSelect / Bucket Sort',
    category: 'Data Structures & Algorithms',
    topic: 'Data Structures & Algorithms',
    difficulty: 'Medium',
    question: 'Compare Min-Heap O(N log K) and Bucket Sort O(N) approaches for finding the Top K Frequent Elements.',
    answer: '1. Min-Heap Approach: Count frequencies using a Hash Map {num: freq}. Push entries into a Min-Heap of size K ordered by frequency. If heap size exceeds K, poll/pop the minimum element. At the end, the heap contains strictly the K most frequent elements. Time: O(N log K), Space: O(N + K). 2. Bucket Sort Approach (Optimal O(N)): Count frequencies in a Hash Map. Create an array of buckets where bucket index represents frequency (0 to N). Place each number into bucket[freq]. Iterate backwards from index N down to 0, collecting numbers until K elements are accumulated. Time: strictly O(N) linear time, Space: O(N).',
    explanation: 'Bucket sort works in O(N) because the maximum possible frequency of any element in an array of size N is bounded by N.',
    interviewTips: [
      'Explain why a Min-Heap is chosen over a Max-Heap (a Min-Heap of size K maintains the largest K elements while discarding smaller ones in O(log K)).',
      'Mention QuickSelect as an alternative with O(N) average time and O(1) extra space.'
    ],
    companies: ['Amazon', 'Meta', 'Google', 'Microsoft', 'Oracle'],
  },

  // =========================================================================
  // DATABASE MANAGEMENT SYSTEMS (ADDITIONAL TIER-1 PLACEMENT QUESTIONS)
  // =========================================================================
  {
    title: 'Database Sharding: Range vs Hash vs Directory & Resharding',
    category: 'Database',
    topic: 'Database Management Systems',
    difficulty: 'Hard',
    question: 'What are the main database sharding strategies, and how do you handle hot-spotting and resharding in production?',
    answer: 'Sharding partitions large tables horizontally across multiple independent database nodes. Strategies: 1. Range-Based Sharding: Partition by contiguous key ranges (e.g., user_id 1-1M -> Shard 1, 1M-2M -> Shard 2). Pros: Easy range queries. Cons: Hotspots (recent signups hammer the newest shard). 2. Hash-Based Sharding: Shard = hash(shard_key) % N. Pros: Even uniform distribution across nodes. Cons: Adding a new shard requires migrating almost all data unless Consistent Hashing is used. 3. Directory / Lookup Sharding: A central mapping service maps entity IDs to shards. Pros: Total flexibility to move tenants. Cons: Single point of failure and extra lookup latency. Resharding & Hotspots: Mitigate with Consistent Hashing (virtual nodes) so adding node N+1 only moves K/N keys, or split hot partition keys with salted hashes (user_id + random(0-9)).',
    explanation: 'Cross-shard queries and distributed multi-shard joins (scatter-gather) are prohibitively slow; choosing the right shard key (like company_id in B2B SaaS) is existential.',
    interviewTips: [
      'Explain why cross-shard transactions require Two-Phase Commit (2PC) and how that hurts availability.',
      'Always evaluate whether vertical scaling or read-replicas can solve the issue before jumping to sharding complexity.'
    ],
    companies: ['Amazon', 'Stripe', 'Uber', 'Salesforce', 'Meta'],
  },
  {
    title: 'Write-Ahead Logging (WAL) and ARIES Crash Recovery',
    category: 'Database',
    topic: 'Database Management Systems',
    difficulty: 'Hard',
    question: 'How does Write-Ahead Logging (WAL) guarantee the Atomicity and Durability (ACID) of transactions during unexpected system crashes?',
    answer: 'Core Principle: Before any modified data page is written from RAM to the actual disk database files, the corresponding log record describing the modification (delta) must be flushed to non-volatile disk in an append-only Write-Ahead Log (WAL). Why WAL is Fast: Writing to the WAL is sequential disk I/O (append-only), whereas writing dirty pages to database tables requires random I/O seeks across different table files. ARIES Recovery Algorithm (3 Phases after Crash): 1. Analysis Phase: Scans log forward from the last Checkpoint to identify all dirty pages in memory and active (uncommitted) transactions at the time of the crash. 2. Redo Phase: Replays all logged changes forward from the oldest unwritten page to restore database state exactly to the crash moment (re-establishing Durability). 3. Undo Phase: Scans backwards to roll back changes made by active transactions that never committed before the crash (re-establishing Atomicity).',
    explanation: 'Checkpoints periodically flush all dirty buffer pool pages to disk and write a checkpoint marker to WAL, limiting the recovery scan distance.',
    interviewTips: [
      'Mention fsync() system call ensuring data is written to physical disk platters/SSDs rather than OS page cache.',
      'Differentiate undo logs (used for rollback and MVCC snapshots) from redo logs (used for crash recovery).'
    ],
    companies: ['Oracle', 'Microsoft', 'Google', 'Amazon', 'CockroachDB'],
  },
  {
    title: 'Optimistic Concurrency Control (OCC) vs Pessimistic Locking',
    category: 'Database',
    topic: 'Database Management Systems',
    difficulty: 'Medium',
    question: 'When should you choose Optimistic Concurrency Control over Pessimistic Locking (SELECT FOR UPDATE) in high-throughput applications?',
    answer: '1. Pessimistic Locking: Assumes conflicts are frequent. Acquires database locks upfront: SELECT * FROM products WHERE id = 1 FOR UPDATE. Other concurrent transactions attempting to read/write this row block until the lock is released on COMMIT/ROLLBACK. Pros: 100% data integrity with zero retry loops. Cons: High lock contention, thread starvation, decreased throughput, and risk of deadlocks. Ideal for: Financial transfers, seat reservations with high contention. 2. Optimistic Concurrency Control (OCC): Assumes conflicts are rare. Reads data without locking, accompanied by a version number or timestamp. On update: UPDATE inventory SET stock = stock - 1, version = version + 1 WHERE id = 1 AND version = current_version. If another transaction changed the row first, affected rows = 0, indicating a conflict. The application then aborts or retries the transaction. Pros: Zero database locks, maximum read throughput. Cons: Wasted CPU on rollback/retry storms under high write contention. Ideal for: Web applications, shopping cart updates, low-contention CRUD.',
    explanation: 'Pessimistic locking moves the contention management to the database lock manager; OCC moves conflict resolution to the application retry logic.',
    interviewTips: [
      'Write the atomic SQL UPDATE statement with version check on the whiteboard.',
      'Explain why OCC is preferred for web REST APIs where holding a database lock across HTTP round-trips would cause catastrophic connection exhaustion.'
    ],
    companies: ['Amazon', 'Stripe', 'Paypal', 'Walmart', 'Goldman Sachs'],
  },
  {
    title: 'SQL Window Functions: ROW_NUMBER(), RANK(), DENSE_RANK() & LEAD/LAG',
    category: 'Database',
    topic: 'Database Management Systems',
    difficulty: 'Medium',
    question: 'What is the precise behavioral difference between ROW_NUMBER(), RANK(), and DENSE_RANK() in SQL, and when do you use PARTITION BY?',
    answer: 'Window functions perform calculations across a set of table rows related to the current row without collapsing rows like GROUP BY does. Differences on Tied Values (e.g., scores 100, 90, 90, 80): 1. ROW_NUMBER(): Assigns a unique sequential integer to every row regardless of ties. Result: 1, 2, 3, 4. 2. RANK(): Assigns identical rank to ties, but SKIPS subsequent ranks to maintain count alignment. Result: 1, 2, 2, 4 (skips 3). 3. DENSE_RANK(): Assigns identical rank to ties, and does NOT skip subsequent ranks. Result: 1, 2, 2, 3. PARTITION BY: Divides query results into partitions where the window function applies independently to each partition (e.g., finding the top 3 highest-paid employees in each department: DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC)). LEAD() / LAG(): Accesses data from subsequent or previous rows without doing self-joins.',
    explanation: 'Window functions execute in the SQL pipeline after WHERE, GROUP BY, and HAVING, but before ORDER BY and LIMIT.',
    interviewTips: [
      'Write a subquery or Common Table Expression (CTE) showing how to get the Nth highest salary using DENSE_RANK().',
      'Explain why window functions cannot appear directly in WHERE clauses (must wrap in a CTE or subquery).'
    ],
    companies: ['Oracle', 'Microsoft', 'Amazon', 'Uber', 'Salesforce'],
  },

  // =========================================================================
  // FULL-STACK SYSTEM DESIGN (ADDITIONAL TIER-1 PLACEMENT QUESTIONS)
  // =========================================================================
  {
    title: 'Consistent Hashing with Virtual Nodes',
    category: 'Web Development',
    topic: 'System Design',
    difficulty: 'Hard',
    question: 'How does Consistent Hashing minimize data movement when scaling a distributed cache from N to N+1 nodes?',
    answer: 'Naive Hashing Problem: In server = hash(key) % N, changing N (adding or removing a server) causes almost ALL keys (N / (N+1)) to remap to different servers, wiping out cache hit rates (cache avalanche) and hammering the database. Consistent Hashing Solution: 1. Both cache nodes and data keys are hashed using the same 32-bit/64-bit hash function (e.g. MurmurHash) onto an abstract circular ring [0, 2^32 - 1]. 2. Key Placement: To find where key K belongs, hash K onto the ring and walk clockwise until encountering the first server node. 3. Node Addition: When adding a new server, only keys between the new node and its counter-clockwise predecessor move to the new node! All other keys remain intact. Data movement drops to K / N on average. Virtual Nodes: A physical server is mapped to 100-300 virtual points on the ring (hash(server_ip + "#1"), hash(server_ip + "#2")). This ensures uniform balanced key distribution and prevents "hot spot" skew.',
    explanation: 'Virtual nodes also allow assigning more virtual replicas to more powerful hardware nodes proportionally.',
    interviewTips: [
      'Draw the circular hash ring and explain clockwise lookup.',
      'Cite production systems utilizing Consistent Hashing: Amazon DynamoDB, Apache Cassandra, Discord message routing, and Akamai CDNs.'
    ],
    companies: ['Amazon', 'Google', 'Discord', 'Netflix', 'Cloudflare'],
  },
  {
    title: 'Distributed Unique ID Generation: Twitter Snowflake vs UUID',
    category: 'Web Development',
    topic: 'System Design',
    difficulty: 'Medium',
    question: 'Why is standard UUID v4 problematic for database primary keys, and how does Twitter Snowflake generate 64-bit globally unique, roughly time-sorted IDs?',
    answer: '1. Why UUID v4 Fails as DB Primary Key: UUIDs are 128-bit random hex strings. In B+ Tree indexes, random inserts cause massive page fragmentation, frequent page splits, and cache eviction because records are scattered randomly across disk pages instead of appending sequentially. 2. Twitter Snowflake 64-Bit Architecture: Generates compact 64-bit integer IDs (fits into standard BIGINT) with rough chronological sorting: - 1 Sign Bit: Always 0 (keeps integer positive). - 41 Timestamp Bits: Milliseconds since custom epoch (e.g. 2026-01-01). 2^41 ms gives ~69 years of lifetime. - 10 Machine / Datacenter ID Bits: 2^10 = 1024 unique generator worker nodes without cross-coordination. - 12 Sequence Number Bits: 2^12 = 4096 unique IDs per millisecond per node. Throughput: 1024 nodes * 4096 IDs/ms = ~4.19 Million unique IDs per second globally without database locks or coordination.',
    explanation: 'Because the most significant 41 bits represent timestamp, new IDs naturally append to the right edge of B+ Tree index pages, avoiding page splits.',
    interviewTips: [
      'Explain how clock drift is handled: if system clock moves backwards, the node sleeps or rejects ID generation until the clock catches up.',
      'Compare Snowflake with database auto-increment (single point of failure) and UUID v7 (128-bit time-ordered).'
    ],
    companies: ['Twitter', 'Amazon', 'Stripe', 'Uber', 'Meta'],
  },
  {
    title: 'Distributed Locks with Redis: Redlock vs Fencing Tokens',
    category: 'Web Development',
    topic: 'System Design',
    difficulty: 'Hard',
    question: 'How do you implement a safe distributed lock in Redis, and what is the Martin Kleppmann critique regarding GC pauses and fencing tokens?',
    answer: '1. Single-Node Redis Lock: SET lock_key unique_token NX PX 30000. NX ensures key is created only if it does not exist; PX sets 30-second TTL to prevent deadlocks if the holder crashes. Release Lock: Must use an atomic Lua script that compares the stored unique_token before deleting, preventing Process A from deleting Process B\'s lock if A\'s execution exceeded TTL. 2. The Martin Kleppmann GC Pause Problem: Suppose Client 1 acquires lock with 30s TTL. Client 1 experiences a 35s Stop-The-World JVM Garbage Collection pause. The lock expires in Redis. Client 2 acquires the lock. Client 1 resumes from GC unaware that its lock expired, and both Client 1 and Client 2 mutate the shared resource concurrently! 3. Fencing Tokens Solution: Every time a lock is acquired, the lock service returns a monotonically increasing sequence number (fencing token: 101, 102, 103...). When writing to the storage system, the storage rejects any write containing a token lower than the highest token seen so far. Client 1\'s write (token 101) is rejected because Client 2 already wrote with token 102.',
    explanation: 'Redis TTL relies on physical system clock time, making it susceptible to clock skew and long pause anomalies.',
    interviewTips: [
      'Write the atomic Lua script for lock release.',
      'Differentiate between Redlock (multi-node consensus across 5 independent Redis instances) and ZooKeeper ephemeral sequential nodes.'
    ],
    companies: ['Stripe', 'Amazon', 'Netflix', 'Uber', 'Google'],
  },
  {
    title: 'Idempotent API Design with Idempotency Keys',
    category: 'Web Development',
    topic: 'System Design',
    difficulty: 'Medium',
    question: 'How do financial and payment systems (like Stripe) prevent duplicate charges when network timeouts cause client retries?',
    answer: 'Problem: If a client charges $100 and the network drops before receiving the HTTP 200 response, the client retries the POST request. Without idempotency, the customer is charged $200. Idempotency Key Architecture: 1. Client generates a unique UUID (e.g. Idempotency-Key: 7b3e...) and attaches it as an HTTP header to the mutation request. 2. Gateway / Payment Service intercepts request: queries Redis/DB for the key in an atomic transaction. 3. Three Execution States: - If key does not exist: Insert key with state "IN_PROGRESS" and process the charge. - If key exists and is "IN_PROGRESS": Return HTTP 409 Conflict or hold connection to prevent concurrent race condition. - If key exists and is "COMPLETED": Instantly return the exact CACHED HTTP response body and status code saved from the first successful charge without re-executing any business logic! 4. The customer is charged exactly once, and client receives successful confirmation.',
    explanation: 'Idempotency turns unsafe POST mutations into safe replayable operations across unreliable network layers.',
    interviewTips: [
      'Explain database unique constraints on idempotency_key column.',
      'Discuss TTL for idempotency records (typically retained for 24 to 72 hours).'
    ],
    companies: ['Stripe', 'Paypal', 'Amazon', 'Adyen', 'Uber'],
  },

  // =========================================================================
  // COMPUTER NETWORKS (ADDITIONAL TIER-1 PLACEMENT QUESTIONS)
  // =========================================================================
  {
    title: 'Subnetting, CIDR Notation & IP Addressing (/24 vs /16)',
    category: 'Computer Science',
    topic: 'Computer Networks',
    difficulty: 'Medium',
    question: 'How does CIDR notation calculate the network address, broadcast address, and usable host count for a /24 and /28 subnet?',
    answer: 'IPv4 addresses are 32 bits long. CIDR (Classless Inter-Domain Routing) /N indicates that the first N bits represent the Network Prefix, and the remaining (32 - N) bits represent Host IDs. Formulas: - Total IP addresses in subnet = 2^(32 - N). - Usable Host IPs = 2^(32 - N) - 2 (subtract 2: one for Network ID where all host bits are 0, and one for Broadcast Address where all host bits are 1). Examples: 1. Subnet 192.168.1.0/24: - Host bits = 32 - 24 = 8 bits. Total IPs = 2^8 = 256. - Usable Hosts = 256 - 2 = 254 usable IPs (192.168.1.1 through 192.168.1.254). - Subnet Mask = 255.255.255.0. 2. Subnet 10.0.0.0/28: - Host bits = 32 - 28 = 4 bits. Total IPs = 2^4 = 16. - Usable Hosts = 16 - 2 = 14 usable IPs (10.0.0.1 through 10.0.0.14). - Network ID = 10.0.0.0, Broadcast = 10.0.0.15. Subnet Mask = 255.255.255.240.',
    explanation: 'Subnetting partitions large physical networks into logical isolated subnets, reducing broadcast traffic and improving routing efficiency.',
    interviewTips: [
      'Explain private IP ranges (RFC 1918): 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.',
      'Show how bitwise AND between an IP address and Subnet Mask extracts the Network Address.'
    ],
    companies: ['Cisco', 'Amazon (AWS VPC)', 'Cloudflare', 'Juniper', 'Google'],
  },
  {
    title: 'TCP Congestion Control: Slow Start, Congestion Avoidance & Fast Retransmit',
    category: 'Computer Science',
    topic: 'Computer Networks',
    difficulty: 'Hard',
    question: 'How does TCP regulate throughput without collapsing the internet? Detail the 4 phases of TCP Tahoe and Reno.',
    answer: 'TCP uses Congestion Window (cwnd) maintained by sender alongside Receiver Advertised Window (rwnd). Max data in flight = min(cwnd, rwnd). 4 Phases: 1. Slow Start: cwnd starts at 1-10 MSS (Maximum Segment Size). For every ACK received, cwnd increases by 1 MSS (exponential growth: 1, 2, 4, 8...). Continues until cwnd reaches ssthresh (Slow Start Threshold). 2. Congestion Avoidance: Once cwnd >= ssthresh, growth slows to additive linear increase: cwnd increases by 1 MSS per Round Trip Time (RTT). (Additive Increase). 3. Fast Retransmit (Triple Duplicate ACKs): If packet N is lost but subsequent packets arrive, receiver returns Duplicate ACKs for N-1. When sender receives 3 duplicate ACKs, it immediately retransmits packet N without waiting for the retransmission timeout (RTO) timer to expire! 4. Fast Recovery (TCP Reno): Instead of dropping cwnd back to 1 MSS (which Tahoe did), Reno cuts ssthresh = cwnd / 2, sets cwnd = ssthresh, and resumes linear Congestion Avoidance (Multiplicative Decrease). Formula: AIMD (Additive Increase, Multiplicative Decrease).',
    explanation: 'AIMD guarantees mathematical convergence to fair and optimal network bandwidth utilization across competing TCP flows.',
    interviewTips: [
      'Explain how packet loss is detected: Triple Duplicate ACKs (minor congestion) vs Timeout (severe network congestion).',
      'Mention modern BBR (Bottleneck Bandwidth and RTT) developed by Google which measures bandwidth instead of packet loss.'
    ],
    companies: ['Google', 'Cloudflare', 'Cisco', 'Meta', 'Amazon'],
  },
  {
    title: 'HTTPS TLS 1.3 Cryptographic Handshake Internals',
    category: 'Computer Science',
    topic: 'Computer Networks',
    difficulty: 'Medium',
    question: 'How did TLS 1.3 reduce handshake latency from 2-RTT down to 1-RTT (and 0-RTT resumption), and how is Perfect Forward Secrecy guaranteed?',
    answer: '1. TLS 1.2 vs TLS 1.3 Latency: TLS 1.2 required 2 full network round-trips (2-RTT) before application data could be sent. TLS 1.3 redesigned the exchange to achieve 1-RTT by combining the cipher suite negotiation and key exchange into the very first message! 2. TLS 1.3 1-RTT Handshake: - ClientHello: Client sends supported ciphers AND its own Ephemeral Diffie-Hellman public key share (assuming the server supports common curves like X25519). - ServerHello: Server chooses cipher, sends certificate, signature, and its own key share. Both sides immediately derive symmetric session keys (AES-GCM or ChaCha20). - Next message: Browser sends encrypted HTTP request. 3. 0-RTT Resumption: Returning clients reuse pre-shared cryptographic secrets to transmit encrypted early data in the very first packet. 4. Perfect Forward Secrecy (PFS): TLS 1.3 mandated Ephemeral Diffie-Hellman (ECDHE) and banned RSA key exchange. Because ephemeral keys are discarded after session close, an attacker who steals the server private key years later CANNOT decrypt recorded past traffic.',
    explanation: 'Static RSA key exchange allowed anyone with the server private key to decrypt all historic recordings of user traffic.',
    interviewTips: [
      'Explain symmetric encryption (AES - fast bulk data transfer) vs asymmetric encryption (RSA/ECDH - slow handshake key negotiation).',
      'Mention replay attacks in 0-RTT early data and how web servers require anti-replay caches.'
    ],
    companies: ['Cloudflare', 'Google', 'Meta', 'Apple', 'Microsoft'],
  },

  // =========================================================================
  // WEB DEVELOPMENT & FULL-STACK (ADDITIONAL TIER-1 PLACEMENT QUESTIONS)
  // =========================================================================
  {
    title: 'React Fiber Architecture & Virtual DOM Reconciliation',
    category: 'Web Development',
    topic: 'React',
    difficulty: 'Hard',
    question: 'Why did React rewrite its core engine from the Stack Reconciler to the Fiber Reconciler, and how does work scheduling function?',
    answer: '1. The Problem with Stack Reconciler (React 15): Virtual DOM reconciliation was recursive and synchronous. For large component trees, mounting or updating locked the main JavaScript thread for 50-100ms. Browsers could not handle user clicks, typing, or 60fps animations, resulting in dropped frames (jank). 2. React Fiber Architecture (React 16+): Fiber represents a virtual stack frame as a mutable linked list data structure (child, sibling, return pointers). Core Innovations: - Incremental Rendering: Large rendering tasks are split into small units of work. - Time Slicing & Prioritization: React yields control back to the browser event loop using MessageChannel / requestIdleCallback so the browser can paint pixels or process high-priority user input. - Two Phases: * Render Phase (Asynchronous & Interruptible): Computes diffs and builds the Work-in-Progress Fiber tree. Can be paused, aborted, or restarted. * Commit Phase (Synchronous): Applies DOM mutations (appendChild, removeChild) in a single atomic burst so users never see half-rendered UI.',
    explanation: 'Fiber enables concurrent features like Suspense, useTransition, and automatic batching by treating component rendering as interruptible work units.',
    interviewTips: [
      'Explain the "double buffering" technique where React maintains a current tree and a workInProgress tree.',
      'Explain why keys in lists must be stable and unique (helps React identify which items were moved vs inserted).'
    ],
    companies: ['Meta', 'Amazon', 'Vercel', 'Uber', 'Airbnb'],
  },
  {
    title: 'Node.js Event Loop Phases & Concurrency Model',
    category: 'Web Development',
    topic: 'Node.js',
    difficulty: 'Hard',
    question: 'What are the 6 distinct phases of the Libuv Event Loop in Node.js, and how do setImmediate and process.nextTick execute?',
    answer: 'Node.js uses Libuv to handle non-blocking asynchronous I/O over a single thread. The Event Loop cycles continuously through 6 phases: 1. Timers: Executes callbacks scheduled by expired setTimeout() and setInterval(). 2. Pending Callbacks: Executes I/O callbacks deferred from the previous loop iteration (e.g. TCP errors). 3. Idle, Prepare: Internal Libuv housekeeping. 4. Poll: Retrieves new I/O events (reading disk files, network sockets). If poll queue is empty, Node blocks here waiting for incoming connections unless timers have expired or setImmediate() callbacks are queued. 5. Check: Executes callbacks scheduled specifically by setImmediate(). 6. Close Callbacks: Executes socket/handle closure callbacks (e.g. socket.on("close")). Priority Intermediaries: - process.nextTick(): NOT part of the event loop. Runs immediately after current JS operation completes, before the event loop advances to ANY phase. - Promise.then() (Microtask queue): Runs immediately after nextTick queue empties.',
    explanation: 'setImmediate runs in the Check phase (designed to run after Poll I/O), whereas setTimeout(fn, 0) runs in the Timers phase.',
    interviewTips: [
      'Explain the Libuv Thread Pool (default 4 threads, configurable via UV_THREADPOOL_SIZE) used for synchronous file I/O, DNS lookup, and crypto operations.',
      'Show code demonstrating process.nextTick vs Promise.then vs setImmediate.'
    ],
    companies: ['Netflix', 'Uber', 'PayPal', 'LinkedIn', 'Amazon'],
  },
  {
    title: 'Authentication Security: JWT vs Server Sessions & Refresh Token Rotation',
    category: 'Web Development',
    topic: 'Web Development',
    difficulty: 'Medium',
    question: 'How do you securely store JWTs in a web browser to prevent both XSS and CSRF attacks, and how does Refresh Token Rotation work?',
    answer: '1. Storage Vulnerabilities: - Storing JWT in localStorage: Vulnerable to Cross-Site Scripting (XSS). Any third-party NPM package or malicious script can execute localStorage.getItem("token") and exfiltrate credentials! - Storing JWT in standard Cookie: Vulnerable to Cross-Site Request Forgery (CSRF). 2. Production Secure Architecture: - Access Token (Short-lived, e.g. 15 mins): Stored in memory (React state / variable). Immune to XSS persistent harvesting. - Refresh Token (Long-lived, e.g. 7 days): Stored in an HttpOnly, Secure, SameSite=Strict Cookie. JavaScript code CANNOT access HttpOnly cookies, neutralizing XSS exfiltration! SameSite=Strict neutralizes CSRF attacks. 3. Refresh Token Rotation (RTR): Whenever the short-lived access token expires: client sends the refresh token cookie to /api/auth/refresh. The server validates the token, INVALIDATES the old refresh token immediately, and issues a brand-new access token + brand-new refresh token pair. Replay Detection: If an attacker steals a used refresh token and tries to redeem it, the server detects that an already-invalidated token was presented, flags token theft, and invalidates ALL active sessions for that user account.',
    explanation: 'Stateless JWTs cannot be revoked on logout unless a token blocklist is maintained in Redis; short access token TTL mitigates this.',
    interviewTips: [
      'Explain the 3 parts of a JWT: Header (algorithm), Payload (claims), and Signature (HMAC-SHA256).',
      'Explain why JWT payload should never contain sensitive information like passwords (it is base64url encoded, not encrypted).'
    ],
    companies: ['Auth0', 'Stripe', 'Google', 'Amazon', 'Microsoft'],
  }
];
