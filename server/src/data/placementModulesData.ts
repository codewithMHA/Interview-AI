export interface VisualAnimationStep {
  step: number;
  label: string;
  visualDesc: string;
  badge?: string;
}

export interface VisualDiagramAnimation {
  title: string;
  description: string;
  steps: VisualAnimationStep[];
}

export interface ModuleItem {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  companyTags: string[];
  questionPrompt: string;
  conceptSummary: string;
  detailedAnswer: string;
  visualDiagramAnimation?: VisualDiagramAnimation;
  codeSnippet?: {
    language: string;
    code: string;
  };
  complexityAnalysis?: {
    time: string;
    space: string;
    explanation: string;
  };
  interviewerRubric: {
    whatInterviewersLookFor: string[];
    commonMistakes: string[];
    followUpQuestions?: string[];
  };
}

export interface PlacementModule {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  iconName: string;
  gradient: string;
  description: string;
  importanceRating: string;
  items: ModuleItem[];
}

export const PLACEMENT_MODULES: PlacementModule[] = [
  // =========================================================================
  // 1. AI MOCK INTERVIEWS (System Design & Core Architecture - 10 ITEMS)
  // =========================================================================
  {
    id: 'ai-mock-interviews',
    title: 'AI Mock Interviews',
    subtitle: 'High-Level Design & System Architecture',
    badge: 'Tier-1 Technical Rounds',
    iconName: 'Bot',
    gradient: 'from-violet-600 to-indigo-600',
    description: 'Realistic interview simulation questions with comprehensive architectural diagrams, trade-off evaluations, and interviewer follow-up probes.',
    importanceRating: 'Mandatory for Product Companies (Google, Amazon, Uber, Atlassian)',
    items: [
      {
        id: 'mock-1',
        title: 'Design a URL Shortening Service (TinyURL)',
        category: 'System Design',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Google', 'Microsoft', 'Adobe'],
        questionPrompt: 'Design a scalable URL shortening service like TinyURL that takes a long URL and generates a short alias, with high availability and low latency redirection.',
        conceptSummary: 'Tests capacity estimation, Base62 encoding vs MD5 hashing, database selection (NoSQL vs SQL), distributed ID generation, and multi-tier Redis caching.',
        detailedAnswer: `1. Requirements & Scale Estimation:
- Write QPS: 100M URLs/month ≈ 40 writes/second.
- Read QPS: 10:1 Read-to-Write ratio ≈ 400 reads/second.
- Storage: 100M * 500 bytes * 12 months * 5 years ≈ 3 TB total storage.

2. Short Key Generation:
- Use Base62 encoding (a-z, A-Z, 0-9).
- A 7-character Base62 string allows 62^7 ≈ 3.5 Trillion unique URLs, comfortably satisfying lifetime requirements.
- Generation Approach: Use a distributed counter (Twitter Snowflake or ZooKeeper range allocation) to assign unique 64-bit integer IDs, then convert the integer directly to Base62 string (e.g., ID 125 -> "cb"). This eliminates collision retries.

3. Database Schema & Choice:
- High read-heavy workload with no complex relations: NoSQL key-value/document store (DynamoDB or MongoDB) or MySQL with a clustered index on short_key.
- Schema: short_key (PK, 7 chars), original_url (VARCHAR 2048), user_id, created_at, expires_at.

4. Caching & Performance:
- Place a Redis cluster in front of the database storing the most active 20% URLs (80-20 Pareto principle) with LRU eviction.
- Return HTTP 302 (Found) instead of 301 (Permanent Redirect) so all clicks hit our analytics service.`,
        visualDiagramAnimation: {
          title: 'TinyURL High-Performance Read/Write Architecture Flow',
          description: 'Step-by-step lifecycle of generating short aliases and executing low-latency redirects.',
          steps: [
            { step: 1, label: 'Client Shorten Request', visualDesc: 'Client posts long URL: "https://interviewai.dev/practice/system-design" to API Gateway load balancer.', badge: 'REST POST' },
            { step: 2, label: 'Distributed ID Generator', visualDesc: 'Snowflake / ZooKeeper counter emits unique 64-bit integer ID (e.g. 12519284) without database locks.', badge: 'O(1) ID' },
            { step: 3, label: 'Base62 Bijective Encoding', visualDesc: 'Integer 12519284 converts into compact 7-character string "aX9K1z" (62^7 = 3.5 Trillion unique URLs).', badge: 'Base62' },
            { step: 4, label: 'Database Persistence', visualDesc: 'Original URL and short alias written to distributed DB with short_key as clustered primary index.', badge: 'Clustered Index' },
            { step: 5, label: 'Redis Cache Warmup', visualDesc: 'Key "aX9K1z" placed in multi-tier Redis LRU cache cluster with 24-hour TTL for high-speed reads.', badge: 'Sub-5ms Cache' },
            { step: 6, label: 'Redirect Resolution', visualDesc: 'Reader requests "tiny.url/aX9K1z" -> Redis Cache Hit -> Server issues HTTP 302 Found redirect to client.', badge: 'HTTP 302' }
          ]
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Proactive back-of-the-envelope calculation of storage and read/write QPS.',
            'Clear explanation of why Base62 conversion is superior to MD5 hashing with collision checks.',
            'Understanding of HTTP 301 vs 302 redirect trade-offs.'
          ],
          commonMistakes: [
            'Using random string generation without a collision mitigation strategy.',
            'Forgetting caching and letting 100% of read traffic hit the disk database.',
            'Ignoring distributed race conditions when multiple app servers generate keys.'
          ],
          followUpQuestions: [
            'How would you handle URL expiration and automatic garbage collection of expired keys?',
            'What happens if the Redis cache node crashes? How do you prevent cache avalanche?'
          ]
        }
      },
      {
        id: 'mock-2',
        title: 'What Happens When You Type google.com in Browser?',
        category: 'Core Engineering',
        difficulty: 'Medium',
        companyTags: ['Google', 'Meta', 'Cisco', 'Cloudflare'],
        questionPrompt: 'Explain in chronological, granular detail what happens from the millisecond you hit Enter on "google.com" until the webpage pixels finish rendering on screen.',
        conceptSummary: 'Evaluates full-stack technical depth across Browser parsing, OS DNS resolution, ARP, TCP handshake, TLS 1.3 cryptographic exchange, HTTP/2 multiplexing, DOM construction, CSSOM, Render Tree, and GPU compositing.',
        detailedAnswer: `Step-by-Step Flow:
1. URL Parsing & HSTS: Browser checks if protocol is HTTP/HTTPS and checks HSTS (HTTP Strict Transport Security) list to enforce HTTPS immediately.
2. DNS Resolution:
   - Browser checks internal cache -> OS hosts file/cache -> Resolving name server -> Root DNS (.) -> TLD (.com) -> Authoritative Nameserver.
   - Address Resolution Protocol (ARP) translates the gateway IP to a physical MAC address if not in ARP cache.
3. TCP 3-Way Handshake:
   - Client sends SYN -> Server responds SYN-ACK -> Client sends ACK.
4. TLS 1.3 Cryptographic Handshake:
   - ClientHello (cipher suites + DH key share) -> ServerHello (certificate + server DH key share).
   - Symmetric session keys are derived; connection is encrypted in 1-RTT.
5. HTTP Request & Server Processing:
   - Browser sends GET / HTTP/2. Server reverse proxy (Nginx) terminates TLS, routes request to internal microservices, and returns HTTP 200 with HTML payload.
6. Browser Critical Rendering Path (CRP):
   - HTML Parser builds Document Object Model (DOM).
   - CSS Parser builds CSS Object Model (CSSOM).
   - DOM + CSSOM combine into the Render Tree (excluding display: none).
   - Layout phase calculates exact pixel coordinates and bounding boxes.
   - Paint phase fills pixels into raster layers.
   - GPU Compositing combines layers onto screen.`,
        visualDiagramAnimation: {
          title: 'Web Navigation & Critical Rendering Path Flow',
          description: 'Chronological path of network packets and browser layout rendering.',
          steps: [
            { step: 1, label: 'Browser Cache & HSTS Check', visualDesc: 'Browser checks local HSTS pre-load list, DNS cache, and OS hosts file for pre-resolved IP.', badge: 'Local Cache' },
            { step: 2, label: 'Recursive DNS Query', visualDesc: 'ISP resolver queries Root (.) -> TLD (.com) -> Google Authoritative Nameserver -> returns IP 142.250.190.46.', badge: 'DNS' },
            { step: 3, label: 'TCP 3-Way Handshake', visualDesc: 'SYN sent with sequence number -> SYN-ACK received from server -> ACK returned to establish socket.', badge: 'TCP Socket' },
            { step: 4, label: 'TLS 1.3 Key Exchange', visualDesc: 'ClientHello with ECDH public key share -> ServerHello with certificate -> Session symmetric keys generated.', badge: 'TLS 1.3' },
            { step: 5, label: 'HTTP/2 Stream Request', visualDesc: 'Browser transmits "GET / HTTP/2" request with headers; server streams compressed HTML response.', badge: 'HTTP/2' },
            { step: 6, label: 'DOM/CSSOM & GPU Paint', visualDesc: 'Parses DOM + CSSOM -> constructs Render Tree -> calculates Layout boxes -> GPU rasters pixels to display.', badge: 'GPU Paint' }
          ]
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Systematic chronological order from network protocols down to browser render tree.',
            'Accurate distinction between DOM, CSSOM, Layout, and Paint.',
            'Mentioning modern protocols (TLS 1.3, HTTP/2 multiplexing, TCP).'
          ],
          commonMistakes: [
            'Skipping DNS hierarchy and saying "browser simply calls the IP".',
            'Confusing display: none (excluded from Render Tree) with visibility: hidden (included in Render Tree).',
            'Failing to mention the TLS encryption handshake.'
          ],
          followUpQuestions: [
            'How does HTTP/2 multiplexing solve the Head-of-Line (HoL) blocking problem of HTTP/1.1?',
            'What causes browser Layout Thrashing (Reflow), and how do you optimize it?'
          ]
        }
      },
      {
        id: 'mock-3',
        title: 'Design a Distributed Rate Limiter',
        category: 'System Design',
        difficulty: 'Medium',
        companyTags: ['Stripe', 'Amazon', 'Cloudflare', 'Paypal'],
        questionPrompt: 'Design a distributed rate limiting middleware capable of throttling API requests per user/IP (e.g., max 100 requests per minute) across a cluster of 50 backend servers.',
        conceptSummary: 'Compares Token Bucket, Leaky Bucket, Fixed Window, and Sliding Window Log/Counter algorithms, combined with distributed Redis Lua scripts to eliminate race conditions.',
        detailedAnswer: `1. Algorithm Comparison:
- Token Bucket: Refills tokens at a constant rate; allows bursts up to bucket capacity. Simple and memory-efficient.
- Leaky Bucket: Processes requests at a constant FIFO rate; smooths bursts out.
- Sliding Window Counter: Hybrid approach combining current window count with weighted previous window count. Extremely accurate with low memory footprint.

2. Distributed Architecture:
- Place the Rate Limiter middleware behind the API Gateway (Kong / Envoy) or inside the backend application layer.
- Centralized State: Use a Redis cluster with key pattern 'rate_limit:{user_id}:{minute_timestamp}'.

3. Concurrency & Race Conditions:
- When 10 parallel requests arrive from the same client across different backend nodes, naive 'GET then INCR' creates a classic Read-Modify-Write race condition.
- Solution: Run an atomic Redis Lua Script:
  local current = redis.call('incr', KEYS[1])
  if current == 1 then redis.call('expire', KEYS[1], ARGV[1]) end
  if current > tonumber(ARGV[2]) then return 0 else return 1 end

4. HTTP Headers:
- Return standard headers: X-RateLimit-Limit, X-RateLimit-Remaining, and Retry-After (with HTTP 429 Too Many Requests).`,
        visualDiagramAnimation: {
          title: 'Atomic Redis Lua Token Bucket Throttling Flow',
          description: 'Step-by-step verification of incoming user requests under high concurrency.',
          steps: [
            { step: 1, label: 'Incoming Request', visualDesc: 'Client sends API request to Gateway with Authorization Header (User ID: 4096).', badge: 'HTTP API' },
            { step: 2, label: 'Rate Limiter Middleware', visualDesc: 'Middleware intercepts request and constructs Redis key: "rate_limit:user:4096:min_12".', badge: 'Interceptor' },
            { step: 3, label: 'Atomic Lua Script Execution', visualDesc: 'Redis executes script: INCR key, sets 60s TTL if key is new, evaluates current count against limit (100).', badge: 'Atomic Redis' },
            { step: 4, label: 'Threshold Evaluation', visualDesc: 'Count <= 100: Return 1 (Allow). Count > 100: Return 0 (Throttle). Zero race conditions across cluster nodes.', badge: 'Limit Check' },
            { step: 5, label: 'HTTP Response Routing', visualDesc: 'If allowed: Forward to Microservices. If throttled: Instantly return HTTP 429 with Retry-After: 42s.', badge: 'HTTP 429' }
          ]
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Recognizing concurrency race conditions in distributed environments.',
            'Using atomic Redis Lua scripts or Redis Transactions rather than client-side increments.',
            'Specifying appropriate HTTP 429 status code and Retry-After headers.'
          ],
          commonMistakes: [
            'Suggesting in-memory server state without explaining why cluster nodes would have out-of-sync counts.',
            'Choosing Sliding Window Log without recognizing that storing timestamps for millions of requests causes O(N) memory blowup.'
          ],
          followUpQuestions: [
            'How do you handle rate limiting if the Redis cluster becomes unavailable (Fail Open vs Fail Closed)?',
            'How would you adjust rate limits dynamically for premium vs free tier users?'
          ]
        }
      },
      {
        id: 'mock-4',
        title: 'Design a Scalable Multi-Channel Notification Service',
        category: 'System Design',
        difficulty: 'Hard',
        companyTags: ['Uber', 'Swiggy', 'Netflix', 'Amazon'],
        questionPrompt: 'Design an asynchronous notification system capable of sending millions of real-time alerts daily via Push Notifications (APNs/FCM), SMS (Twilio), and Emails (SendGrid/SES).',
        conceptSummary: 'Covers message queue decoupling (Kafka/RabbitMQ), rate limiting per user, idempotency deduplication, and handling third-party vendor downtime.',
        detailedAnswer: `1. Core Architectural Components:
- Notification API Gateway: Validates payloads, checks user communication preferences (opt-ins, quiet hours), and emits events.
- Distributed Message Bus: Apache Kafka or RabbitMQ with separate topic partitions for 'push-notifications', 'sms-alerts', and 'transactional-emails'.
- Worker Fleet: Consumer groups dedicated to specific channel types to isolate failure domains (e.g. email slowness does not block urgent OTP SMS).
- Notification DB: Stores notification history, delivery statuses (SENT, DELIVERED, FAILED), and metadata in MongoDB/PostgreSQL.

2. Reliability & Idempotency:
- Every event carries an idempotency_key (e.g. order_id + status + channel). Workers verify against Redis before dispatching to avoid double-charging or duplicate spam.
- Implement Exponential Backoff with Jitter for transient provider outages (HTTP 503/429).
- Dead Letter Queue (DLQ): Poison pill messages failing 5 retries move to DLQ for manual inspection and alerting.

3. Prioritization:
- Dedicated High-Priority queue for OTPs and two-factor tokens (< 2s SLA) vs Bulk Marketing queue.`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Decoupling synchronous API calls from asynchronous message dispatch using Kafka/RabbitMQ.',
            'Handling third-party API rate limits and downtime using DLQs and exponential backoff.',
            'Idempotency design to prevent duplicate notification delivery.'
          ],
          commonMistakes: [
            'Designing a synchronous system where the client waits for the external email provider to respond.',
            'Mixing urgent OTPs with bulk promotional blasts in the same processing queue.'
          ],
          followUpQuestions: [
            'How do you respect user quiet hours across different time zones efficiently?',
            'How would you deduplicate notifications if a user clicks checkout twice within 500ms?'
          ]
        }
      },
      {
        id: 'mock-5',
        title: 'Distributed Caching Strategies & Cache Invalidation',
        category: 'System Design',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Microsoft', 'Salesforce', 'Meta'],
        questionPrompt: 'Explain how distributed caching works, compare Cache-Aside vs Write-Through vs Write-Behind, and describe how to mitigate Cache Avalanche and Cache Stampede (Thundering Herd).',
        conceptSummary: 'Evaluates real-world distributed caching patterns, TTL strategies, mutual exclusion locks for hot keys, and consistent hashing.',
        detailedAnswer: `1. Invalidation Patterns:
- Cache-Aside (Lazy Loading): Application queries cache first. On miss, it reads database, stores in cache, and returns. Resilience: Cache failure does not bring down DB, but data can be stale until TTL expires.
- Write-Through: Application writes to cache, and cache synchronously writes to DB before acknowledging. Strong consistency, but higher write latency.
- Write-Behind (Write-Back): Application writes to cache immediately; cache asynchronously batches writes to DB. High write performance, but risk of data loss on cache node crash.

2. Cache Failure Modes & Mitigations:
- Cache Avalanche: Multiple keys expire at the exact same second, causing a flood of queries directly to the database. Mitigation: Add random jitter to TTL (e.g. TTL = 3600s + rand(0, 300s)).
- Cache Stampede / Thundering Herd: A single ultra-popular hot key expires, and 10,000 concurrent requests all miss and hit DB at once. Mitigation: Use distributed Mutex locks (Redis Redlock or SETNX) so only one thread recomputes the key while others wait or return stale cache temporarily.
- Cache Penetration: Queries for non-existent records hit the DB continuously. Mitigation: Store NULL values with short TTL, or use a Bloom Filter in front of the cache.`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Clear operational tradeoffs between Cache-Aside and Write-Through.',
            'Precise solutions for Cache Avalanche (jitter) and Thundering Herd (mutex locks).',
            'Knowledge of eviction policies (LRU, LFU, FIFO).'
          ],
          commonMistakes: [
            'Treating cache as a permanent database without eviction policies.',
            'Confusing Cache Penetration (queries for non-existent keys) with Cache Avalanche (simultaneous expiration).'
          ],
          followUpQuestions: [
            'How does Consistent Hashing prevent massive remapping when adding or removing Redis nodes in a cluster?',
            'When would you choose Memcached over Redis?'
          ]
        }
      },
      {
        id: 'mock-6',
        title: 'Design an Idempotent Payment Processing Gateway',
        category: 'System Design',
        difficulty: 'Hard',
        companyTags: ['Stripe', 'PayPal', 'Razorpay', 'Adyen'],
        questionPrompt: 'How do you design a payment processing backend ensuring that a user is never double-charged even under network timeouts, client retries, or server crashes?',
        conceptSummary: 'Focuses on financial system reliability, idempotency keys, Two-Phase Commit / Saga orchestrator, and distributed locking.',
        detailedAnswer: `1. Idempotency Key Workflow:
- Client generates a UUID v4 'Idempotency-Key' header on the checkout page before sending the POST /charge request.
- Payment Service receives request and attempts an atomic lock in Redis/Postgres:
  INSERT INTO payment_requests (idempotency_key, status) VALUES ('xyz', 'PROCESSING') ON CONFLICT DO NOTHING;
- If insert fails: Another request with this key is already active or completed. Wait and return cached response.

2. State Machine:
- States: INITIATED -> AUTHORIZING -> CAPTURED -> SETTLED (or FAILED / REFUNDED).
- State transitions are append-only to an immutable financial audit ledger.

3. Distributed Transactions (Saga Pattern):
- For multi-step payment flows (reserve inventory, debit wallet, call payment gateway, emit receipt), use Orchestrated Saga with compensating transactions:
  If the external gateway times out, execute a reconciliation job that queries the gateway status before deciding to reverse the inventory hold.

4. Webhook Reconciliation:
- Since networks are unreliable, never rely solely on synchronous HTTP response from payment networks (Visa/Mastercard). Listen to asynchronous signed webhooks and verify signatures using HMAC-SHA256.`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Zero tolerance for double billing: explicit use of unique client idempotency keys.',
            'Understanding why distributed two-phase commit (2PC) blocks and why Saga pattern with compensating steps is preferred.',
            'Security validation of incoming webhooks with cryptographic HMAC signatures.'
          ],
          commonMistakes: [
            'Relying on database autoincrement ID for idempotency instead of client-generated UUID.',
            'Assuming HTTP timeout means payment failed (it may have succeeded at the bank!).'
          ],
          followUpQuestions: [
            'How do you reconcile ledger balances if a webhook is received out of chronological order?',
            'What database isolation level would you configure for user account balances (e.g. SERIALIZABLE)?'
          ]
        }
      },
      {
        id: 'mock-7',
        title: 'Design a Real-Time Group Chat Service (WhatsApp/Slack)',
        category: 'System Design',
        difficulty: 'Hard',
        companyTags: ['Meta', 'Slack', 'Discord', 'Microsoft Teams'],
        questionPrompt: 'Design the core architecture for a 1-to-1 and group chat application supporting instant delivery, read receipts, and offline message synchronization.',
        conceptSummary: 'Explores persistent bidirectional WebSocket connections, message routing through Redis Pub/Sub or Kafka, and wide-column NoSQL databases (Cassandra/ScyllaDB).',
        detailedAnswer: `1. Connection Management:
- Use WebSockets for persistent, full-duplex, low-latency communication.
- WebSocket Gateways maintain open TCP sockets with active users.
- A central Redis Session Store maps user_id -> gateway_server_id so incoming messages know which server holds the recipient's open socket.

2. 1-to-1 Messaging Flow:
- User A sends message over WebSocket to Gateway-1.
- Gateway-1 writes message to Cassandra database (fast write throughput, partitioned by conversation_id).
- Gateway-1 looks up User B in Redis Session Store:
  * If online on Gateway-3: publish to Gateway-3 via Redis Pub/Sub, which pushes down to User B.
  * If offline: emit event to Push Notification Service (Apple APNs / Google FCM).

3. Group Messaging & Fan-out:
- Small Groups (< 500 members): Message is published to group topic; workers fan-out to all online group members.
- Message Order: Use distributed monotonic sequencing (Snowflake ID or message sequence numbers per channel).`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Choosing WebSockets over HTTP Long Polling for bidirectional messaging.',
            'Explaining how messages are routed to the specific server holding the recipient\'s TCP connection.',
            'Selecting an appropriate write-heavy database (Cassandra / DynamoDB / ScyllaDB).'
          ],
          commonMistakes: [
            'Using relational database with table locks for storing billions of high-velocity chat messages.',
            'Neglecting offline message synchronization when a user reconnects after a tunnel or airplane mode.'
          ],
          followUpQuestions: [
            'How do you implement End-to-End Encryption (E2EE) using the Signal Protocol (Double Ratchet)?',
            'How would you scale a channel with 100,000 members (live stream chat) where fan-out becomes expensive?'
          ]
        }
      },
      {
        id: 'mock-8',
        title: 'Design a Distributed Web Crawler',
        category: 'System Design',
        difficulty: 'Hard',
        companyTags: ['Google', 'Microsoft (Bing)', 'Yahoo', 'Baidu'],
        questionPrompt: 'Design a distributed web crawler that periodically traverses the World Wide Web to fetch, parse, and index billions of web pages while respecting site politeness.',
        conceptSummary: 'Focuses on URL Frontier architecture, priority queues, Bloom filters for deduplication, DNS caching, and robots.txt compliance.',
        detailedAnswer: `1. Workflow:
- Seed URLs -> URL Frontier -> Fetcher Workers -> Parser -> Duplicate Detector -> Content Store & Link Extractor -> back to Frontier.

2. URL Frontier Architecture:
- Politeness: Never overwhelm a single host with thousands of requests per second. Route all URLs for domain 'xyz.com' to a dedicated FIFO queue processed by one worker with a rate limiter (e.g. 1 req/sec).
- Priority: Separate queues based on PageRank and update frequency (e.g. news sites crawled hourly, static archives crawled monthly).

3. Duplicate Detection & Storage:
- Avoid fetching the same URL twice using a distributed Bloom Filter or Redis Bitset (stores 1 billion URLs in ~1.2 GB of RAM with < 1% false positive rate).
- Content Deduplication: Calculate 64-bit SimHash of page text to detect mirrored or duplicated content across different URLs.

4. Performance Optimizations:
- Custom high-speed DNS resolver cache (DNS resolution accounts for ~70% of crawler latency if queried naively).`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Designing politeness and priority mechanisms inside the URL Frontier.',
            'Using Bloom Filters for ultra-efficient URL deduplication in memory.',
            'Adherence to web standards (robots.txt parsing and caching).'
          ],
          commonMistakes: [
            'Storing every visited URL as a raw string in a relational database table (causes catastrophic disk I/O bottlenecks).',
            'Ignoring infinite crawl traps (e.g. calendars generating infinite URL links).'
          ],
          followUpQuestions: [
            'How do you detect and handle spider traps (dynamically generated endless links)?',
            'How do you render client-side JavaScript Single Page Apps (React/Vue) during crawling?'
          ]
        }
      },
      {
        id: 'mock-9',
        title: 'Design a Geospatial Ride-Sharing Dispatch System (Uber/Lyft)',
        category: 'System Design',
        difficulty: 'Hard',
        companyTags: ['Uber', 'Lyft', 'Grab', 'DoorDash'],
        questionPrompt: 'Design a real-time ride-matching system that ingests GPS coordinates from hundreds of thousands of active drivers every 4 seconds and quickly finds the nearest available drivers for a rider request.',
        conceptSummary: 'Covers geospatial indexing (Uber H3 hexagonal grid vs Google S2 vs Geohash), ephemeral in-memory state in Redis, and distributed dispatch algorithms.',
        detailedAnswer: `1. Scale & Location Ingestion:
- 500,000 active drivers sending GPS (latitude, longitude, driver_id, status) every 4 seconds = 125,000 writes/sec.
- Relational databases cannot sustain 125k geospatial writes/second.
- Solution: Maintain active driver locations strictly in an in-memory spatial index (Redis Geospatial / H3).

2. Geospatial Indexing:
- Geohash / S2 / Uber H3: Divide earth surface into hierarchical hexagonal cells.
- H3 provides uniform adjacent cell distance (unlike squares where diagonals are sqrt(2) times longer).
- Every 4 seconds, update driver location: Driver's current cell ID is computed in O(1) mathematical calculation on the mobile device or gateway.

3. Dispatch & Match Algorithm:
- When rider requests ride: Calculate rider's H3 cell (e.g. Resolution 8, ~460m radius).
- Query Redis for drivers in rider's cell + immediate 6 neighboring cells ring-1 (k-ring).
- Filter drivers by status = AVAILABLE.
- Rank candidate drivers by ETA (using pre-computed road network graph with A* routing) and broadcast ride offer to top driver.`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Understanding why standard SQL queries (SELECT * WHERE distance < 5km) fail at 125k QPS.',
            'Knowledge of spatial partitioning algorithms (Geohash, Quadtree, Uber H3).',
            'Using in-memory fast stores (Redis GEOADD / GEORADIUS) for real-time driver state.'
          ],
          commonMistakes: [
            'Persisting every 4-second GPS ping directly to disk database (PostgreSQL/MySQL).',
            'Failing to handle driver concurrency (two riders matching with the same driver simultaneously).'
          ],
          followUpQuestions: [
            'How do you prevent race conditions when two riders in the same neighborhood request a ride simultaneously?',
            'How would you handle surge pricing based on local supply and demand ratios?'
          ]
        }
      },
      {
        id: 'mock-10',
        title: 'SQL vs NoSQL Architectural Decision Matrix & CAP Theorem',
        category: 'Core Engineering',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Google', 'Cisco', 'Salesforce'],
        questionPrompt: 'When would you select a Relational Database (PostgreSQL/MySQL) versus a NoSQL Database (MongoDB, Cassandra, DynamoDB)? Frame your answer using the CAP Theorem and ACID vs BASE properties.',
        conceptSummary: 'Tests senior architectural reasoning regarding data consistency, transaction guarantees, horizontal sharding, query flexibility, and fault tolerance.',
        detailedAnswer: `1. ACID vs BASE:
- Relational (ACID): Atomicity, Consistency, Isolation, Durability. Strict schema, foreign key constraints, multi-table joins. Perfect for financial transactions, e-commerce orders, and inventory balance.
- NoSQL (BASE): Basically Available, Soft state, Eventual consistency. Schema-less or flexible schema, denormalized documents or wide columns. Built for massive horizontal scale and high write velocity.

2. CAP Theorem Trade-Offs (under Network Partition P):
- CP Systems (Consistency + Partition Tolerance): E.g., MongoDB, HBase. If network splits, nodes reject writes if consensus cannot be verified, prioritizing data correctness over availability.
- AP Systems (Availability + Partition Tolerance): E.g., Cassandra, DynamoDB. Nodes continue accepting reads and writes locally, reconciling conflicts later via Vector Clocks or Last-Write-Wins (LWW).

3. Pragmatic Selection Framework:
- Choose SQL when: Complex relational queries, strict ACID guarantees, data integrity is existential (banking/payments).
- Choose Document (MongoDB): Hierarchical data, rapid prototyping, dynamic product catalogs.
- Choose Wide-Column (Cassandra): Ultra-high write QPS, time-series, IoT telemetry, chat messages.
- Choose Key-Value (Redis): Microsecond latency caching, session tokens, leaderboard scores.`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Explaining that Network Partition (P) is inevitable in distributed systems, making CA purely theoretical.',
            'Articulating clear business examples for SQL (finance) vs NoSQL (telemetry/social feed).',
            'Understanding horizontal vs vertical scaling limits.'
          ],
          commonMistakes: [
            'Saying "NoSQL is always faster than SQL" without qualification.',
            'Believing ACID is impossible in all NoSQL databases (many modern stores provide single-document or multi-document transactions).'
          ],
          followUpQuestions: [
            'What is database Sharding, and what are the trade-offs of range-based vs hash-based sharding?',
            'What is the difference between Optimistic Concurrency Control (OCC) and Pessimistic Locking?'
          ]
        }
      },
      {
        id: 'mock-11',
        title: 'Design a Scalable Video Streaming Platform (YouTube / Netflix)',
        category: 'System Design',
        difficulty: 'Hard',
        companyTags: ['Netflix', 'Google', 'Amazon', 'Meta'],
        questionPrompt: 'Design a globally distributed video streaming platform like YouTube or Netflix. Explain video chunking, adaptive bitrate streaming (HLS/DASH), transcoding pipelines, and edge CDN delivery.',
        conceptSummary: 'Covers master video ingestion, parallel chunk transcoding into multiple resolutions (1080p, 720p, 480p), storage in S3/blob, manifest generation (m3u8), and globally distributed CDN caching.',
        detailedAnswer: '1. Ingestion & Transcoding Pipeline:\n- Client uploads source raw video (often high bitrate ProRes or MP4).\n- Ingestion service writes raw file to temporary Object Storage (S3 / GCS) and publishes an "upload_completed" event to Kafka.\n- Distributed Transcoder Workers (FFmpeg workers in Kubernetes) split video into 5-10 second chunks (.ts files) and encode chunks into multiple resolutions (1080p, 720p, 480p) and codecs (H.264, VP9, AV1).\n- Worker generates Master Playlist (.m3u8 manifest) mapping bandwidth levels to chunk URLs.\n\n2. Adaptive Bitrate Streaming (ABR):\n- Client media player (ExoPlayer / Video.js) measures network throughput every 5 seconds.\n- If user wifi drops from 15 Mbps to 2 Mbps, player requests next chunk at 480p instead of 1080p without buffering or pausing video.\n\n3. Content Delivery Network (CDN):\n- 95%+ of video read requests are served directly from Edge CDN PoPs (Point of Presence) located close to users.\n- 80/20 Pareto distribution: Popular trending videos are permanently cached in edge RAM/NVMe storage; long-tail videos fetched on-demand from origin S3.',
        visualDiagramAnimation: {
          title: 'Adaptive Bitrate Video Transcoding & CDN Streaming',
          description: 'End-to-end lifecycle from raw video upload to multi-resolution CDN playback.',
          steps: [
            { step: 1, label: 'Video Upload', visualDesc: 'Content creator uploads 4K raw video to S3; Kafka event notifies transcoding cluster.', badge: 'Upload / Kafka' },
            { step: 2, label: 'Chunk Transcoding', visualDesc: 'FFmpeg workers parallelize chunking into 6-second segments at 1080p, 720p, 480p resolutions.', badge: 'FFmpeg Transcode' },
            { step: 3, label: 'Manifest Generation', visualDesc: 'Master HLS manifest (.m3u8) created containing stream bitrates and segment URIs.', badge: 'HLS .m3u8' },
            { step: 4, label: 'CDN Edge Warmup', visualDesc: 'Edge CDN nodes cache segments close to user geography, achieving sub-20ms first-frame latency.', badge: 'CDN Edge Hit' },
            { step: 5, label: 'Adaptive Playback', visualDesc: 'Player dynamically switches chunk bitrates based on real-time client bandwidth measurement.', badge: 'Bufferless Stream' }
          ]
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Differentiating video storage (chunks in blob storage) from video metadata (PostgreSQL/NoSQL).',
            'Explaining Adaptive Bitrate Streaming (HLS/DASH) and why raw monolithic MP4s are unacceptable at scale.',
            'Understanding CDN caching tiers and the 80/20 long-tail distribution.'
          ],
          commonMistakes: [
            'Attempting to stream video directly from a single monolithic web server or database.',
            'Ignoring the transcoding delay and attempting synchronous transcoding in the upload request.'
          ],
          followUpQuestions: [
            'How would you design live streaming (e.g. Twitch / YouTube Live) where latency must be under 3 seconds (CMAF / LL-HLS)?',
            'How do you protect copyrighted media using Digital Rights Management (Widevine / FairPlay)?'
          ]
        }
      },
      {
        id: 'mock-12',
        title: 'Design a Real-Time Collaborative Document Editor (Google Docs / Figma)',
        category: 'System Design',
        difficulty: 'Hard',
        companyTags: ['Google', 'Figma', 'Microsoft', 'Atlassian'],
        questionPrompt: 'Design a real-time collaborative text editor where multiple users can type in the same document simultaneously without edit conflicts or text overwrites.',
        conceptSummary: 'Evaluates Operational Transformation (OT) vs Conflict-free Replicated Data Types (CRDTs), WebSocket bidirectional channels, and distributed state synchronization.',
        detailedAnswer: '1. The Core Concurrency Problem:\nIf User A inserts character "X" at index 3 while User B deletes character at index 2 concurrently, naive string replacement results in corrupted, desynchronized documents across clients.\n\n2. Conflict Resolution Strategies:\n- Operational Transformation (OT) [Google Docs]:\n  * Operations are represented as tuples: Insert(pos, char) or Delete(pos).\n  * Client executes locally with zero latency, then sends operation to Centralized OT Server.\n  * Server transforms incoming concurrent operations against previously committed operations and broadcasts transformed operations to other peers.\n  * Requires a single central ordering authority.\n- Conflict-Free Replicated Data Types (CRDTs) [Figma, Apple Notes]:\n  * Each character is assigned a globally unique, mathematically immutable Fractional ID (e.g., between position 1.0 and 2.0, generate 1.5).\n  * Operations commute mathematically: regardless of arrival order, all replicas converge to the exact same state without central server coordination.\n\n3. Communication & Persistence Architecture:\n- WebSockets for bi-directional low-latency operation transport.\n- Redis Pub/Sub cluster distributes operations across document room servers.\n- Periodic snapshotting (every 30 seconds) into PostgreSQL + Append-only log of operations in Apache Kafka for full version history.',
        visualDiagramAnimation: {
          title: 'Collaborative Document Real-Time Sync Pipeline',
          description: 'How concurrent keystrokes are transformed and synchronized across multiple users.',
          steps: [
            { step: 1, label: 'Local Keystroke', visualDesc: 'User A types "X" at position 2; editor applies optimistically to local DOM in 0ms.', badge: 'Local Apply' },
            { step: 2, label: 'WebSocket Push', visualDesc: 'Operation Op(Insert, pos: 2, char: "X", version: 10) sent over WebSocket to gateway.', badge: 'WebSocket Op' },
            { step: 3, label: 'OT Server Transform', visualDesc: 'Server detects concurrent Op from User B; transforms pos 2 to pos 3 to account for concurrent delete.', badge: 'Transform Matrix' },
            { step: 4, label: 'PubSub Fanout', visualDesc: 'Transformed operation broadcasted via Redis Pub/Sub to all connected active room peers.', badge: 'Redis Fanout' },
            { step: 5, label: 'Peer Convergence', visualDesc: 'User B client applies transformed operation; both documents reach identical character state.', badge: 'Zero Conflict' }
          ]
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Clear understanding of why simple locking (pessimistic locking) is completely unusable for collaborative typing.',
            'Deep comparison between Operational Transformation (OT) and CRDTs.',
            'Handling network disconnects, offline edits, and reconnection reconciliation.'
          ],
          commonMistakes: [
            'Proposing sending the entire document string on every keystroke.',
            'Ignoring race conditions when operations arrive out of order.'
          ]
        }
      },
      {
        id: 'mock-13',
        title: 'Design an E-Commerce Flash Sale System (Amazon Prime Day / Flipkart Big Billion)',
        category: 'System Design',
        difficulty: 'Hard',
        companyTags: ['Amazon', 'Flipkart', 'Alibaba', 'Swiggy'],
        questionPrompt: 'Design a flash sale architecture capable of handling 500,000 requests/sec for a limited inventory of 1,000 iPhones without overselling or crashing the database.',
        conceptSummary: 'Deals with extreme read/write bursts, distributed inventory decrement via Redis Lua scripts, asynchronous order fulfillment queues, and traffic shedding.',
        detailedAnswer: '1. Preventing Database Meltdown:\n- Standard RDBMS transactions (SELECT FOR UPDATE) collapse under 500k QPS due to lock contention and connection pool exhaustion.\n- Solution: Decouple inventory check from database persistence. The primary database should never be touched during the 60-second burst!\n\n2. Multi-Layer Flash Sale Defense:\n- Layer 1: Cloudflare Edge Rate Limiting & CAPTCHA: Drop bot traffic, scrapers, and duplicate clicking.\n- Layer 2: In-Memory Atomic Inventory Check (Redis):\n  * Pre-warm Redis with stock: SET iphone_stock 1000.\n  * Execute an atomic Lua script: Checks if stock > 0, decrements stock by 1, and returns SUCCESS. Because Redis is single-threaded, Lua execution is 100% atomic with zero race conditions!\n  * If stock <= 0, fail-fast immediately with HTTP 410 "Sold Out" in 2ms!\n- Layer 3: Asynchronous Order Queue (Kafka / RabbitMQ):\n  * The 1,000 successful buyers receive a signed Order Token and their purchase is placed into an order queue.\n  * Worker consumers slowly write the 1,000 orders to PostgreSQL at a safe pace of 50 writes/sec.\n- Layer 4: Payment Window Timeout:\n  * User has 10 minutes to pay. If unpaid, inventory is returned to Redis automatically via delayed message.',
        visualDiagramAnimation: {
          title: 'Flash Sale High-Concurrency Inventory Funnel',
          description: 'Funneling 500,000 incoming requests down to 1,000 atomic purchases.',
          steps: [
            { step: 1, label: '500k QPS Burst', visualDesc: 'Flash sale starts; 500,000 requests hit API Gateway load balancers within 2 seconds.', badge: '500k QPS' },
            { step: 2, label: 'Redis Lua Decrement', visualDesc: 'Atomic Redis Lua script decrements stock in memory. 499,000 requests rejected in 2ms.', badge: 'O(1) Atomic Lua' },
            { step: 3, label: 'Sold Out Gate', visualDesc: 'Once stock hits 0, Gateway returns cached HTTP 410 Sold Out; 0 requests hit internal services.', badge: 'Fail Fast' },
            { step: 4, label: 'Kafka Queue Buffering', visualDesc: 'The 1,000 successful purchases queued in Kafka topic; workers write to DB at controlled pace.', badge: 'Kafka Buffer' },
            { step: 5, label: 'Payment Gateway Order', visualDesc: 'User redirected to payment gateway; 10-minute TTL hold released if payment abandoned.', badge: 'Eventual Consistency' }
          ]
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Proactive recognition that traditional SQL locks cannot handle 500k QPS.',
            'Using atomic Redis Lua scripts or Redis DECRBY to prevent overselling.',
            'Understanding asynchronous queue buffering to protect the underlying relational database.'
          ],
          commonMistakes: [
            'Proposing SELECT FOR UPDATE on MySQL or PostgreSQL for 500k concurrent requests.',
            'Failing to handle order cancellation and inventory return logic.'
          ]
        }
      },
      {
        id: 'mock-14',
        title: 'Design a Distributed Unique ID Generator (Twitter Snowflake / Instagram ID)',
        category: 'System Design',
        difficulty: 'Medium',
        companyTags: ['Twitter / X', 'Meta', 'Amazon', 'Uber'],
        questionPrompt: 'Design a distributed 64-bit ID generator that generates unique, roughly time-sortable IDs at 50,000 IDs/second across multiple data centers without cross-node network locks.',
        conceptSummary: 'Snowflake bit allocation (timestamp, datacenter ID, machine ID, sequence number), clock skew handling (NTP drift), and monotonic sortability.',
        detailedAnswer: '1. Why UUID / Database Auto-Increment Fails at Scale:\n- Database AUTO_INCREMENT: Creates a single point of failure and bottleneck; multi-master auto-increment with offsets is fragile during node additions.\n- UUID v4: 128 bits (too large for primary indexes), completely random (ruins B+ Tree page locality and fragmentation), not time-sortable.\n\n2. Twitter Snowflake 64-Bit Structure:\n- Bit 0 (1 bit): Reserved sign bit (always 0).\n- Bits 1-41 (41 bits): Epoch Timestamp in milliseconds (2^41 ms ≈ 69 years of IDs from custom epoch).\n- Bits 42-46 (5 bits): Data Center ID (supports up to 32 datacenters).\n- Bits 47-51 (5 bits): Worker Machine ID (supports up to 32 worker instances per datacenter).\n- Bits 52-63 (12 bits): Sequence Counter (supports 4,096 unique IDs per millisecond per worker).\n- Theoretical Throughput: 32 * 32 * 4,096 * 1,000 ≈ 4 Billion IDs/second across the fleet!\n\n3. Handling Edge Cases & Clock Skew:\n- NTP Clock Drift: If server clock moves backwards, current timestamp < last recorded timestamp. Generator must wait or throw error until clock catches up to prevent duplicate IDs.',
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Explaining the exact bit allocation of a 64-bit integer.',
            'Understanding why time-sortable IDs are critical for B+ Tree database index performance.',
            'Identifying clock drift/skew as the primary failure mode and proposing solutions.'
          ],
          commonMistakes: [
            'Suggesting UUIDv4 as a primary key without acknowledging B+ Tree page split degradation.',
            'Using centralized Redis INCR without explaining single-point-of-failure risks.'
          ]
        }
      },
      {
        id: 'mock-15',
        title: 'Design an Autocomplete / Typeahead Search Suggestion System (Google / Amazon Search)',
        category: 'System Design',
        difficulty: 'Hard',
        companyTags: ['Google', 'Amazon', 'Microsoft', 'Uber'],
        questionPrompt: 'Design an autocomplete search system that provides the top 5 most relevant query suggestions within 50 milliseconds as the user types each character.',
        conceptSummary: 'Trie data structure with frequency caching, prefix indexing, offline MapReduce/Spark data processing, and multi-tier edge caching.',
        detailedAnswer: '1. Requirements & Latency Budget:\n- User types at ~200ms per keystroke. Autocomplete must return results in < 50ms (sub-human perception time).\n- Read QPS: Extremely high (1 search = 5-10 autocomplete queries).\n\n2. Core Data Structure: Trie (Prefix Tree):\n- A Trie node holds children pointers (a-z, 0-9) and metadata.\n- Optimization (Node Caching): Finding top 5 queries by traversing all child leaves at runtime is O(K) where K is number of words under prefix. Instead, pre-compute and store the Top 5 most frequent search queries directly in EACH Trie node! A prefix lookup becomes instantaneous O(Prefix Length) with zero subtree traversals!\n\n3. Scale & Sharding Strategy:\n- Scale: Millions of query keywords. Shard the Trie by prefix ranges (e.g. Server 1 holds queries starting with "a"-"c", Server 2 holds "d"-"f").\n- Consistent Hashing for even distribution of prefixes.\n\n4. Data Collection & Analytics Pipeline:\n- Keystrokes are NOT written directly to the Trie in real-time.\n- Log search events to Kafka -> Stream processing (Apache Flink / Spark) calculates rolling frequency counts over past 7 days -> Weekly batch updates the Trie snapshot in memory.',
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Proposing Trie data structure with pre-computed Top-K suggestions stored at each node.',
            'Differentiating online read path (Trie in RAM + CDN cache) from offline analytics update path (Spark/Flink).',
            'Explaining prefix sharding and debounce on the client side.'
          ],
          commonMistakes: [
            'Querying SQL database with LIKE "prefix%" in real-time on every keystroke.',
            'Updating the Trie synchronously on every user search.'
          ]
        }
      }

    ]
  },

  // =========================================================================
  // 2. DSA & CODING SANDBOX (High-Yield Placement Patterns - 10 ITEMS)
  // =========================================================================
  {
    id: 'dsa-coding-sandbox',
    title: 'DSA & Coding Sandbox',
    subtitle: 'High-Yield Algorithmic Patterns',
    badge: 'Campus OA & Coding Rounds',
    iconName: 'Code2',
    gradient: 'from-emerald-600 to-teal-600',
    description: 'Master the top algorithmic problem patterns (Sliding Window, Two Pointers, Monotonic Stack, 0/1 DP, Trees) with optimal code templates and complexity proofs.',
    importanceRating: 'Required for all Technical Online Assessments (OA) and LeetCode Medium/Hard Rounds',
    items: [
      {
        id: 'dsa-1',
        title: 'Longest Substring Without Repeating Characters',
        category: 'Sliding Window',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Google', 'Microsoft', 'Bloomberg'],
        questionPrompt: 'Given a string s, find the length of the longest substring without duplicate characters.',
        conceptSummary: 'Classic Dynamic Sliding Window pattern using a Hash Map or array lookup to track the last seen index of each character.',
        detailedAnswer: `We maintain a dynamic sliding window [left, right]. As the right pointer traverses the string:
- If character s[right] has been seen before at an index >= left, we immediately jump the left pointer to last_seen_index + 1.
- Update the last seen position of s[right] to the current index.
- Calculate max_length = max(max_length, right - left + 1).

This achieves a single pass O(N) solution without shrinking the window one character at a time.`,
        visualDiagramAnimation: {
          title: 'Sliding Window Character Inversion Flow',
          description: 'Step-by-step trace of left and right pointers maintaining the maximum duplicate-free substring.',
          steps: [
            { step: 1, label: 'Initialize Pointers', visualDesc: 'Set left = 0, right = 0, maxLength = 0. Initialize lastSeen array with -1 for all 128 ASCII symbols.', badge: 'Window Setup' },
            { step: 2, label: 'Expand Right Window', visualDesc: 'Right pointer consumes char s[right]. Check if lastSeen[c] >= left to detect duplicate within current window.', badge: 'O(1) Check' },
            { step: 3, label: 'Pointer Jump on Collision', visualDesc: 'Duplicate found! Instantly jump left = lastSeen[c] + 1 without iterating or shrinking one-by-one.', badge: 'Jump Pointer' },
            { step: 4, label: 'Record Maximum Length', visualDesc: 'Update lastSeen[c] = right. Compute maxLength = max(maxLength, right - left + 1) in O(1) time.', badge: 'Max Window' }
          ]
        },
        codeSnippet: {
          language: 'Java',
          code: `public class Solution {
    public int lengthOfLongestSubstring(String s) {
        int[] lastSeen = new int[128];
        Arrays.fill(lastSeen, -1);
        int maxLength = 0, left = 0;

        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (lastSeen[c] >= left) {
                left = lastSeen[c] + 1; // Jump left pointer past duplicate
            }
            lastSeen[c] = right;
            maxLength = Math.max(maxLength, right - left + 1);
        }
        return maxLength;
    }
}`
        },
        complexityAnalysis: {
          time: 'O(N)',
          space: 'O(1) / O(min(N, M))',
          explanation: 'Traverses string s of length N exactly once. Memory is bounded by alphabet charset size (128 ASCII symbols), which is O(1) auxiliary space.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Recognizing the sliding window pattern immediately.',
            'Jumping the left pointer directly using the hash map index rather than incrementing one-by-one.',
            'Handling edge cases: empty string "", single character "a", string with all identical chars "bbbbb".'
          ],
          commonMistakes: [
            'Using a nested loop resulting in O(N^2) or O(N^3) time complexity.',
            'Forgetting the condition "lastSeen[c] >= left", which causes the left pointer to move backward erroneously.'
          ]
        }
      },
      {
        id: 'dsa-2',
        title: '0/1 Knapsack & Dynamic Programming Optimization',
        category: 'Dynamic Programming',
        difficulty: 'Medium',
        companyTags: ['Flipkart', 'Paypal', 'Walmart', 'Oracle'],
        questionPrompt: 'Given weights and values of N items, put these items in a knapsack of capacity W to get the maximum total value. Each item can be picked at most once.',
        conceptSummary: 'Fundamental DP problem demonstrating overlapping subproblems, optimal substructure, and space optimization from 2D matrix to 1D reverse iteration.',
        detailedAnswer: `Let dp[i][w] be the maximum value attainable using a subset of the first i items with weight capacity w.
Recurrence Relation:
- If weight[i-1] <= w:
    dp[i][w] = max(dp[i-1][w], value[i-1] + dp[i-1][w - weight[i-1]])
- Else:
    dp[i][w] = dp[i-1][w]

Space Optimization to O(W):
Notice that computing dp[i][w] only requires values from the previous row dp[i-1]. By iterating capacity w backwards from W down to weight[i-1], we can maintain a single 1D array dp[w], preventing earlier values from being overwritten before being read.`,
        visualDiagramAnimation: {
          title: '0/1 Knapsack 1D Array Space Compression Flow',
          description: 'Step-by-step memory transition avoiding premature subproblem overwrites.',
          steps: [
            { step: 1, label: 'Initialize 1D Array', visualDesc: 'Allocate dp[0...W] initialized to 0, representing maximum value achievable with current subset of items.', badge: 'DP Array' },
            { step: 2, label: 'Process Item i', visualDesc: 'Given item with weight wt[i] and profit val[i], determine whether including it yields higher value.', badge: 'Decision State' },
            { step: 3, label: 'Iterate Capacity Backwards', visualDesc: 'Loop w from W down to wt[i]. Because we move backwards, dp[w - wt[i]] contains the previous item\'s score!', badge: 'Reverse Loop' },
            { step: 4, label: 'State Transition', visualDesc: 'Execute dp[w] = max(dp[w], val[i] + dp[w - wt[i]]). Prevents same item from being picked multiple times.', badge: 'Optimal Max' },
            { step: 5, label: 'Final Output', visualDesc: 'Return dp[W] holding optimal value across all N items in O(N*W) time and O(W) auxiliary space.', badge: 'Solution' }
          ]
        },
        codeSnippet: {
          language: 'C++',
          code: `int knapSack(int W, vector<int>& wt, vector<int>& val, int n) {
    vector<int> dp(W + 1, 0);

    for (int i = 0; i < n; i++) {
        // Iterate backwards so we use results from previous item
        for (int w = W; w >= wt[i]; w--) {
            dp[w] = max(dp[w], val[i] + dp[w - wt[i]]);
        }
    }
    return dp[W];
}`
        },
        complexityAnalysis: {
          time: 'O(N * W)',
          space: 'O(W)',
          explanation: 'Pseudo-polynomial time complexity proportional to N items multiplied by capacity W. Space is reduced from O(N*W) down to O(W).'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Explaining the base cases (capacity 0 or 0 items).',
            'Deriving the 2D recurrence relation clearly before demonstrating the 1D space optimization.',
            'Explaining why iterating capacity backwards in the 1D array is mathematically necessary.'
          ],
          commonMistakes: [
            'Iterating capacity forwards in 1D array (which mistakenly turns it into Unbounded Knapsack where items can be reused).'
          ]
        }
      },
      {
        id: 'dsa-3',
        title: '3Sum: Two Pointers & Duplicate Elimination',
        category: 'Two Pointers',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Meta', 'Apple', 'Google'],
        questionPrompt: 'Given an integer array nums, return all unique triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.',
        conceptSummary: 'Reduces an O(N³) brute force search to O(N²) by sorting the array and using two inward-moving pointers while systematically skipping duplicate values.',
        detailedAnswer: `1. Sort the array in ascending order.
2. Iterate index i from 0 to n-3:
   - If nums[i] > 0, break early (triplet sum of positive numbers cannot equal 0).
   - If i > 0 and nums[i] == nums[i-1], continue (skip duplicate pivot).
3. Set two pointers: left = i + 1, right = n - 1.
   - While left < right:
     * sum = nums[i] + nums[left] + nums[right]
     * If sum == 0: add triplet, then while left < right and nums[left] == nums[left+1] increment left; while left < right and nums[right] == nums[right-1] decrement right; increment left, decrement right.
     * Else if sum < 0: left++ (need a larger sum).
     * Else: right-- (need a smaller sum).`,
        codeSnippet: {
          language: 'Java',
          code: `public List<List<Integer>> threeSum(int[] nums) {
    Arrays.sort(nums);
    List<List<Integer>> res = new ArrayList<>();

    for (int i = 0; i < nums.length - 2; i++) {
        if (nums[i] > 0) break;
        if (i > 0 && nums[i] == nums[i - 1]) continue;

        int left = i + 1, right = nums.length - 1;
        while (left < right) {
            int sum = nums[i] + nums[left] + nums[right];
            if (sum == 0) {
                res.add(Arrays.asList(nums[i], nums[left], nums[right]));
                while (left < right && nums[left] == nums[left + 1]) left++;
                while (left < right && nums[right] == nums[right - 1]) right--;
                left++;
                right--;
            } else if (sum < 0) {
                left++;
            } else {
                right--;
            }
        }
    }
    return res;
}`
        },
        complexityAnalysis: {
          time: 'O(N²)',
          space: 'O(1) auxiliary (ignoring output)',
          explanation: 'Sorting takes O(N log N). Outer loop runs N times with an inner two-pointer scan taking O(N), yielding overall O(N²) time.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Deduplication without using an expensive HashSet of lists.',
            'Sorting the array first to enable directional two-pointer movement.',
            'Early termination when nums[i] > 0.'
          ],
          commonMistakes: [
            'Using 3 nested loops (O(N³) time leading to TLE).',
            'Missing duplicate checks, resulting in duplicate triplets in the output.'
          ]
        }
      },
      {
        id: 'dsa-4',
        title: 'Trapping Rain Water (Two Pointers & Monotonic Stack)',
        category: 'Two Pointers',
        difficulty: 'Hard',
        companyTags: ['Amazon', 'Google', 'Goldman Sachs', 'Microsoft'],
        questionPrompt: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
        conceptSummary: 'Demonstrates finding the limiting boundary: trapped water at index i is determined by min(max_left, max_right) - height[i]. Solved in O(1) space with two pointers.',
        detailedAnswer: `Mathematical Observation:
Water trapped above bar i = max(0, min(max_left, max_right) - height[i]).

Two Pointers O(1) Memory Approach:
- Initialize left = 0, right = n - 1, left_max = 0, right_max = 0.
- While left < right:
  * If height[left] < height[right]:
    - If height[left] >= left_max: update left_max = height[left].
    - Else: water += left_max - height[left].
    - left++.
  * Else:
    - If height[right] >= right_max: update right_max = height[right].
    - Else: water += right_max - height[right].
    - right--.

Because height[left] < height[right], we know with mathematical certainty that left_max < right_max, so the water level is strictly bounded by left_max!`,
        codeSnippet: {
          language: 'C++',
          code: `int trap(vector<int>& height) {
    int left = 0, right = height.size() - 1;
    int leftMax = 0, rightMax = 0;
    int totalWater = 0;

    while (left < right) {
        if (height[left] < height[right]) {
            if (height[left] >= leftMax) leftMax = height[left];
            else totalWater += leftMax - height[left];
            left++;
        } else {
            if (height[right] >= rightMax) rightMax = height[right];
            else totalWater += rightMax - height[right];
            right--;
        }
    }
    return totalWater;
}`
        },
        complexityAnalysis: {
          time: 'O(N)',
          space: 'O(1)',
          explanation: 'Traverses array using two pointers meeting in the middle. Uses constant extra variables.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Explaining why left_max bounds the height when height[left] < height[right].',
            'Comparing O(N) space array approach vs O(1) two-pointer approach.'
          ],
          commonMistakes: [
            'Recalculating left_max and right_max from scratch at every index in O(N²).'
          ]
        }
      },
      {
        id: 'dsa-5',
        title: 'Merge K Sorted Lists (Min-Heap Priority Queue)',
        category: 'Heap / Priority Queue',
        difficulty: 'Hard',
        companyTags: ['Amazon', 'Meta', 'Uber', 'Microsoft'],
        questionPrompt: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
        conceptSummary: 'Teaches multi-way merging using a Min-Heap (PriorityQueue) of size K, comparing root nodes to maintain continuous sorted output.',
        detailedAnswer: `1. Initialize a Min-Heap (PriorityQueue) ordered by node.val.
2. Insert the head node of each of the k non-empty linked lists into the heap (initial size <= K).
3. Create a dummy head pointer for the result list.
4. While the heap is not empty:
   - Extract min node from heap: curr = pq.poll().
   - Append curr to result list.
   - If curr.next is not null, insert curr.next into the heap.
5. Return dummy.next.`,
        codeSnippet: {
          language: 'Java',
          code: `public ListNode mergeKLists(ListNode[] lists) {
    if (lists == null || lists.length == 0) return null;
    PriorityQueue<ListNode> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a.val));

    for (ListNode node : lists) {
        if (node != null) pq.offer(node);
    }

    ListNode dummy = new ListNode(0);
    ListNode tail = dummy;

    while (!pq.isEmpty()) {
        ListNode minNode = pq.poll();
        tail.next = minNode;
        tail = tail.next;

        if (minNode.next != null) {
            pq.offer(minNode.next);
        }
    }
    return dummy.next;
}`
        },
        complexityAnalysis: {
          time: 'O(N log K)',
          space: 'O(K)',
          explanation: 'N is the total number of nodes across all lists. Heap contains at most K nodes at any time, so insertion/extraction takes O(log K).'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Keeping heap size bounded to K rather than dumping all N nodes into the heap.',
            'Comparing Min-Heap approach with Divide & Conquer pair merging.'
          ],
          commonMistakes: [
            'Merging lists one-by-one sequentially, which yields O(K * N) time complexity.'
          ]
        }
      },
      {
        id: 'dsa-6',
        title: 'Binary Tree Maximum Path Sum',
        category: 'Binary Trees / DFS',
        difficulty: 'Hard',
        companyTags: ['Meta', 'Amazon', 'DoorDash', 'Google'],
        questionPrompt: 'A path in a binary tree is a sequence of nodes where each pair of adjacent nodes has an edge. Find the maximum path sum of any non-empty path.',
        conceptSummary: 'Post-order DFS traversal calculating the maximum one-way contribution a subtree can offer upward, while updating a global maximum that treats the current node as the bridge.',
        detailedAnswer: `At any given node:
1. Recursively compute the maximum branch gain from the left child: leftGain = max(0, dfs(node.left)).
2. Recursively compute the maximum branch gain from the right child: rightGain = max(0, dfs(node.right)).
3. Price of the path turning at the current node: priceNewPath = node.val + leftGain + rightGain.
4. Update the global maximum: maxPathSum = max(maxPathSum, priceNewPath).
5. Return to parent: node.val + max(leftGain, rightGain) (a valid path cannot branch both ways at higher ancestors).`,
        codeSnippet: {
          language: 'Python',
          code: `class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        self.max_sum = float('-inf')

        def dfs(node):
            if not node:
                return 0
            # Ignore negative paths by taking max(0, ...)
            left_gain = max(0, dfs(node.left))
            right_gain = max(0, dfs(node.right))

            # Current node as the highest bridge node of the path
            current_path = node.val + left_gain + right_gain
            self.max_sum = max(self.max_sum, current_path)

            # Return max single branch contribution to parent
            return node.val + max(left_gain, right_gain)

        dfs(root)
        return self.max_sum`
        },
        complexityAnalysis: {
          time: 'O(N)',
          space: 'O(H)',
          explanation: 'Visits every node exactly once. Call stack memory equals tree height H (O(log N) balanced, O(N) worst-case skewed).'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Using max(0, dfs(...)) to prune subtrees that would reduce total path sum.',
            'Clear distinction between what is updated globally (bridge sum) and what is returned to parent (single branch).'
          ],
          commonMistakes: [
            'Forgetting that tree values can be negative, initializing max_sum to 0 instead of -infinity.'
          ]
        }
      },
      {
        id: 'dsa-7',
        title: 'Course Schedule & Topological Sort (Kahn\'s Algorithm)',
        category: 'Graphs / BFS',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Google', 'Microsoft', 'Uber'],
        questionPrompt: 'There are numCourses courses labeled 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [a, b] indicates you must take b before a. Can you finish all courses?',
        conceptSummary: 'Directed graph cycle detection using Kahn\'s BFS In-Degree Topological Sort algorithm.',
        detailedAnswer: `1. Model courses as directed graph: Edge b -> a means course b must be completed before course a.
2. Calculate in-degree (number of prerequisites) for every node.
3. Push all nodes with inDegree == 0 (no prerequisites needed) into a BFS Queue.
4. While queue is not empty:
   - Dequeue course u, increment completedCount++.
   - For every neighbor v of u:
     * inDegree[v]--
     * If inDegree[v] == 0: push v into queue.
5. If completedCount == numCourses, all courses can be taken (DAG without cycles). Otherwise, a circular dependency exists.`,
        codeSnippet: {
          language: 'Java',
          code: `public boolean canFinish(int numCourses, int[][] prerequisites) {
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
    int[] inDegree = new int[numCourses];

    for (int[] pre : prerequisites) {
        adj.get(pre[1]).add(pre[0]);
        inDegree[pre[0]]++;
    }

    Queue<Integer> q = new LinkedList<>();
    for (int i = 0; i < numCourses; i++) {
        if (inDegree[i] == 0) q.offer(i);
    }

    int visited = 0;
    while (!q.isEmpty()) {
        int u = q.poll();
        visited++;
        for (int v : adj.get(u)) {
            if (--inDegree[v] == 0) {
                q.offer(v);
            }
        }
    }
    return visited == numCourses;
}`
        },
        complexityAnalysis: {
          time: 'O(V + E)',
          space: 'O(V + E)',
          explanation: 'V is number of courses, E is prerequisites. Every vertex and directed edge is processed exactly once.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Understanding why a cycle in a prerequisite graph makes completion impossible.',
            'Explaining Kahn\'s BFS in-degree tracking vs DFS 3-color (White/Gray/Black) cycle detection.'
          ],
          commonMistakes: [
            'Reversing edge direction (setting edge from child to prerequisite instead of prerequisite to child).'
          ]
        }
      },
      {
        id: 'dsa-8',
        title: 'Word Ladder (Bidirectional BFS)',
        category: 'Graphs / Shortest Path',
        difficulty: 'Hard',
        companyTags: ['Amazon', 'Google', 'LinkedIn', 'Snapchat'],
        questionPrompt: 'Given two words, beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence from beginWord to endWord, mutating 1 letter at a time.',
        conceptSummary: 'Shortest path in an unweighted state-space graph using Bidirectional Breadth-First Search (BFS) to reduce search space exponent from b^d to 2 * b^(d/2).',
        detailedAnswer: `Standard BFS explores outward from beginWord with branching factor b up to depth d, exploring O(b^d) nodes.
Bidirectional BFS maintains two frontiers:
1. Frontier A starting at beginWord.
2. Frontier B starting at endWord.
At each step, always expand the smaller frontier to minimize branch expansion.
When a mutated word from Frontier A is found in Frontier B, the search paths intersect, and we immediately return the total step count.`,
        codeSnippet: {
          language: 'Java',
          code: `public int ladderLength(String beginWord, String endWord, List<String> wordList) {
    Set<String> dict = new HashSet<>(wordList);
    if (!dict.contains(endWord)) return 0;

    Set<String> set1 = new HashSet<>();
    Set<String> set2 = new HashSet<>();
    set1.add(beginWord);
    set2.add(endWord);
    int step = 1;

    while (!set1.isEmpty() && !set2.isEmpty()) {
        if (set1.size() > set2.size()) {
            Set<String> temp = set1; set1 = set2; set2 = temp;
        }
        Set<String> nextSet = new HashSet<>();
        for (String word : set1) {
            char[] chs = word.toCharArray();
            for (int i = 0; i < chs.length; i++) {
                char old = chs[i];
                for (char c = 'a'; c <= 'z'; c++) {
                    chs[i] = c;
                    String target = String.valueOf(chs);
                    if (set2.contains(target)) return step + 1;
                    if (dict.contains(target)) {
                        nextSet.add(target);
                        dict.remove(target);
                    }
                }
                chs[i] = old;
            }
        }
        set1 = nextSet;
        step++;
    }
    return 0;
}`
        },
        complexityAnalysis: {
          time: 'O(M * N)',
          space: 'O(M * N)',
          explanation: 'M is word length (number of characters) and N is total words in dictionary. Bidirectional BFS cuts search tree volume by 90%+ in practice.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Explaining how swapping set1 and set2 keeps expansion bounded to the smaller frontier.',
            'Removing visited words from dict to avoid infinite loops without a separate visited set.'
          ],
          commonMistakes: [
            'Comparing every word in dictionary with nested loop of string comparisons (O(N² * M)).'
          ]
        }
      },
      {
        id: 'dsa-9',
        title: 'Daily Temperatures / Next Greater Element (Monotonic Stack)',
        category: 'Monotonic Stack',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Bloomberg', 'Meta', 'Netflix'],
        questionPrompt: 'Given an array of temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature.',
        conceptSummary: 'Monotonic Decreasing Stack pattern: maintains indices of elements in strictly decreasing temperature order until a warmer day resolves past days.',
        detailedAnswer: `1. Initialize answer array with zeros and an empty Stack of indices.
2. Iterate index i through temperatures:
   - While stack is not empty and temperatures[i] > temperatures[stack.peek()]:
     * prevIndex = stack.pop()
     * answer[prevIndex] = i - prevIndex
   - Push current index i onto stack.
3. Every index enters the stack once and exits at most once, providing guaranteed linear O(N) time.`,
        codeSnippet: {
          language: 'Python',
          code: `def dailyTemperatures(temperatures: list[int]) -> list[int]:
    n = len(temperatures)
    ans = [0] * n
    stack = []  # stores indices

    for i, temp in enumerate(temperatures):
        while stack and temp > temperatures[stack[-1]]:
            prev_i = stack.pop()
            ans[prev_i] = i - prev_i
        stack.append(i)

    return ans`
        },
        complexityAnalysis: {
          time: 'O(N)',
          space: 'O(N)',
          explanation: 'Each element is pushed onto the stack once and popped at most once. Auxiliary stack memory stores at most N indices.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Explaining the Monotonic Decreasing invariant.',
            'Storing index on stack rather than value, so distance can be calculated.'
          ],
          commonMistakes: [
            'Using nested loops running in O(N²) worst-case on descending sequences.'
          ]
        }
      },
      {
        id: 'dsa-10',
        title: 'LRU Cache Design (Doubly Linked List + Hash Map)',
        category: 'System Design / Data Structures',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Google', 'Microsoft', 'Apple'],
        questionPrompt: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with O(1) time complexity for both get(key) and put(key, value) operations.',
        conceptSummary: 'Combines a Hash Map for O(1) key-to-node lookup and a Doubly Linked List with dummy head and tail for O(1) node detachment and insertion.',
        detailedAnswer: `1. Architecture:
- Hash Map: key -> Node(key, value, prev, next). Enables O(1) search.
- Doubly Linked List:
  * dummyHead <-> node1 <-> node2 <-> dummyTail
  * Most Recently Used (MRU) placed right behind dummyHead.
  * Least Recently Used (LRU) located right before dummyTail.
2. get(key):
   - If key not in map, return -1.
   - Detach node from current list position and moveToHead(node). Return node.value.
3. put(key, value):
   - If key exists: update value and moveToHead(node).
   - If key new: create node, insertAtHead(node), put in map.
   - If capacity exceeded: removeLRUNode() from dummyTail.prev, remove from map.`,
        visualDiagramAnimation: {
          title: 'LRU Cache O(1) Detach & Re-insert Flow',
          description: 'Step-by-step memory pointer reassignment during get and put operations.',
          steps: [
            { step: 1, label: 'Dual Architecture', visualDesc: 'Hash Map {key -> Node} provides O(1) lookup. Doubly Linked List [Head <-> Nodes <-> Tail] tracks usage recency.', badge: 'O(1) Access' },
            { step: 2, label: 'Accessing Key (get)', visualDesc: 'Key found in Hash Map. Node detached from its current neighbors (prev.next = next, next.prev = prev) in O(1).', badge: 'Detach Node' },
            { step: 3, label: 'Promote to Head (MRU)', visualDesc: 'Node re-inserted directly after dummy Head as Most Recently Used. Node value returned to caller.', badge: 'Move to Head' },
            { step: 4, label: 'Capacity Overflow (put)', visualDesc: 'Cache exceeds maximum size. The node immediately preceding dummy Tail is the Least Recently Used item.', badge: 'LRU Found' },
            { step: 5, label: 'O(1) Eviction', visualDesc: 'Evict tail.prev from list and delete key from Hash Map simultaneously in O(1) time without list traversal.', badge: 'O(1) Evicted' }
          ]
        },
        codeSnippet: {
          language: 'Java',
          code: `class LRUCache {
    class Node {
        int key, val;
        Node prev, next;
        Node(int k, int v) { key = k; val = v; }
    }

    private final int capacity;
    private final Map<Integer, Node> map = new HashMap<>();
    private final Node head = new Node(0, 0);
    private final Node tail = new Node(0, 0);

    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }

    public int get(int key) {
        if (!map.containsKey(key)) return -1;
        Node node = map.get(key);
        remove(node);
        insertHead(node);
        return node.val;
    }

    public void put(int key, int value) {
        if (map.containsKey(key)) {
            remove(map.get(key));
        }
        Node node = new Node(key, value);
        insertHead(node);
        map.put(key, node);

        if (map.size() > capacity) {
            Node lru = tail.prev;
            remove(lru);
            map.remove(lru.key);
        }
    }

    private void remove(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void insertHead(Node node) {
        node.next = head.next;
        node.prev = head;
        head.next.prev = node;
        head.next = node;
    }
}`
        },
        complexityAnalysis: {
          time: 'O(1) for both get() and put()',
          space: 'O(Capacity)',
          explanation: 'Hash map lookups and doubly-linked pointer rewrites both execute in guaranteed O(1) time.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Using pseudo head and tail sentinel nodes to eliminate null checks and edge case pointer bugs.',
            'Storing the key inside the Node struct so eviction can remove the key from the Hash Map in O(1).'
          ],
          commonMistakes: [
            'Using single linked list (which requires O(N) traversal to delete previous node).',
            'Forgetting to delete from hash map when evicting LRU item.'
          ]
        }
      },
      {
        id: 'dsa-11',
        title: 'Median of Two Sorted Arrays (Binary Search on Partition - Hard)',
        category: 'Binary Search',
        difficulty: 'Hard',
        companyTags: ['Amazon', 'Google', 'Microsoft', 'Apple'],
        questionPrompt: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays in O(log(min(m, n))) runtime complexity.',
        conceptSummary: 'Binary search on the smaller array partition index. Balances elements on the left half and right half so maxLeft <= minRight.',
        detailedAnswer: '1. Algorithmic Principle:\nInstead of merging arrays in O(M + N), binary search on the partition cut of the smaller array. Let array A be smaller (size m) and B be larger (size n).\n- Partition cut in A at i, cut in B at j = (m + n + 1) / 2 - i.\n- Left half contains A[0..i-1] and B[0..j-1]; Right half contains A[i..m-1] and B[j..n-1].\n- Condition for correct partition: maxLeftA <= minRightB AND maxLeftB <= minRightA.\n- If maxLeftA > minRightB, cut A is too far right -> binary search left (high = i - 1).\n- If maxLeftB > minRightA, cut A is too far left -> binary search right (low = i + 1).\n- Median is max(maxLeft) for odd total size, or average of max(maxLeft) and min(minRight) for even total size.',
        codeSnippet: {
          language: 'Java',
          code: 'public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n    if (nums1.length > nums2.length) return findMedianSortedArrays(nums2, nums1);\n    int m = nums1.length, n = nums2.length;\n    int low = 0, high = m;\n    while (low <= high) {\n        int partitionA = (low + high) / 2;\n        int partitionB = (m + n + 1) / 2 - partitionA;\n        int maxLeftA = (partitionA == 0) ? Integer.MIN_VALUE : nums1[partitionA - 1];\n        int minRightA = (partitionA == m) ? Integer.MAX_VALUE : nums1[partitionA];\n        int maxLeftB = (partitionB == 0) ? Integer.MIN_VALUE : nums2[partitionB - 1];\n        int minRightB = (partitionB == n) ? Integer.MAX_VALUE : nums2[partitionB];\n        if (maxLeftA <= minRightB && maxLeftB <= minRightA) {\n            if ((m + n) % 2 == 0) {\n                return ((double)Math.max(maxLeftA, maxLeftB) + Math.min(minRightA, minRightB)) / 2;\n            } else {\n                return (double)Math.max(maxLeftA, maxLeftB);\n            }\n        } else if (maxLeftA > minRightB) {\n            high = partitionA - 1;\n        } else {\n            low = partitionA + 1;\n        }\n    }\n    return 0.0;\n}'
        },
        complexityAnalysis: {
          time: 'O(log(min(M, N)))',
          space: 'O(1)',
          explanation: 'Binary search is executed strictly on the smaller array length, halving search space at each iteration.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Ensuring binary search is executed on the smaller array to prevent out-of-bounds on the second array.',
            'Correct boundary sentinel handling with Integer.MIN_VALUE and MAX_VALUE.',
            'Explaining the mathematical partition invariant.'
          ],
          commonMistakes: [
            'Proposing the O(M+N) merge solution when interviewer specifically asks for O(log(min(M,N))).',
            'Integer division off-by-one errors in (m + n + 1) / 2.'
          ]
        }
      },
      {
        id: 'dsa-12',
        title: 'Coin Change Problem (Unbounded Knapsack & Bottom-Up DP - Medium)',
        category: 'Dynamic Programming',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Microsoft', 'Bloomberg', 'Walmart'],
        questionPrompt: 'You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount.',
        conceptSummary: 'Classic Bottom-Up Tabulation. State: dp[i] = minimum coins to make amount i. Transition: dp[i] = min(dp[i], dp[i - coin] + 1).',
        detailedAnswer: '1. Tabulation DP Formulation:\n- Define dp array of size amount + 1, initialized to infinity (or amount + 1 as sentinel).\n- Base Case: dp[0] = 0 (0 coins required to form amount 0).\n- Recurrence Relation: For each amount i from 1 to total amount, and for each coin in coins: if i - coin >= 0, dp[i] = min(dp[i], dp[i - coin] + 1).\n- Result: Return dp[amount] if dp[amount] <= amount, else -1 (impossible to form amount).',
        codeSnippet: {
          language: 'C++',
          code: 'int coinChange(vector<int>& coins, int amount) {\n    vector<int> dp(amount + 1, amount + 1);\n    dp[0] = 0;\n    for (int i = 1; i <= amount; i++) {\n        for (int coin : coins) {\n            if (i - coin >= 0) {\n                dp[i] = min(dp[i], dp[i - coin] + 1);\n            }\n        }\n    }\n    return dp[amount] > amount ? -1 : dp[amount];\n}'
        },
        complexityAnalysis: {
          time: 'O(Amount * N)',
          space: 'O(Amount)',
          explanation: 'Nested loops iterate Amount times across N coin denominations; 1D array stores intermediate subproblem solutions.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Recognizing that greedy choice fails (e.g., coins [1, 3, 4], amount 6: greedy gives 4+1+1=3 coins, optimal DP gives 3+3=2 coins).',
            'Bottom-up space optimization using a 1D DP array.'
          ],
          commonMistakes: [
            'Using a greedy approach (always taking the largest coin) which is provably suboptimal for non-canonical coin systems.'
          ]
        }
      },
      {
        id: 'dsa-13',
        title: 'Lowest Common Ancestor (LCA) in a Binary Tree (Divide & Conquer - Medium)',
        category: 'Binary Trees',
        difficulty: 'Medium',
        companyTags: ['Meta', 'Amazon', 'Microsoft', 'LinkedIn'],
        questionPrompt: 'Given a binary tree, find the lowest common ancestor (LCA) of two given nodes p and q.',
        conceptSummary: 'Post-order DFS traversal. If current node matches p or q, return current node. If left and right subtrees both return non-null, current node is the LCA.',
        detailedAnswer: '1. Recursive Invariant:\n- Base Cases: If current root is NULL, return NULL. If root == p or root == q, return root.\n- Recursive Calls: Recurse on left child and right child.\n- Decision Logic:\n  * If both left and right return non-null, p and q are located in separate subtrees -> Current root is the unique Lowest Common Ancestor!\n  * If only one subtree returns non-null, propagate that non-null node upwards.\n  * If both return null, return null.',
        codeSnippet: {
          language: 'Python',
          code: 'def lowestCommonAncestor(root, p, q):\n    if not root or root == p or root == q:\n        return root\n    left = lowestCommonAncestor(root.left, p, q)\n    right = lowestCommonAncestor(root.right, p, q)\n    if left and right:\n        return root\n    return left if left else right'
        },
        complexityAnalysis: {
          time: 'O(N)',
          space: 'O(H)',
          explanation: 'Visits every tree node once in the worst case; recursion call stack takes O(H) where H is tree height.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Clean post-order traversal logic without unnecessary parent pointer maps.',
            'Handling case where p is an ancestor of q.'
          ],
          commonMistakes: [
            'Confusing general Binary Tree LCA with Binary Search Tree (BST) LCA (in BST we can compare values; in general binary tree we must search both subtrees).'
          ]
        }
      },
      {
        id: 'dsa-14',
        title: 'Alien Dictionary (Graph Topological Sort & Cycle Detection - Hard)',
        category: 'Graphs & Topological Sort',
        difficulty: 'Hard',
        companyTags: ['Airbnb', 'Google', 'Meta', 'Amazon'],
        questionPrompt: 'There is a new alien language that uses the English alphabet. Given a list of words from the alien dictionary sorted lexicographically, derive the order of letters in this language.',
        conceptSummary: 'Build directed graph of character precedence by comparing adjacent words. Detect cycles using 3-color DFS or Kahn algorithm BFS in-degree tracking.',
        detailedAnswer: '1. Graph Construction:\n- Compare adjacent words word[i] and word[i+1].\n- Find first character position where word[i][k] != word[i+1][k]. Add directed edge: word[i][k] -> word[i+1][k] and increment in-degree of word[i+1][k].\n- Prefix Edge Case: If word[i] is longer than word[i+1] and word[i] starts with word[i+1] (e.g. ["abc", "ab"]), the dictionary is invalid! Return empty string immediately.\n\n2. Topological Sort (Kahn Algorithm):\n- Add all characters with in-degree == 0 into a Queue.\n- Process queue: Pop character, append to result order, decrement in-degrees of neighbors. When neighbor in-degree hits 0, push to queue.\n- Cycle Check: If result length != total unique characters, a cycle exists (contradictory ordering) -> Return "".',
        complexityAnalysis: {
          time: 'O(C) where C is total characters in all words',
          space: 'O(U + E) where U is unique letters (<= 26) and E is edges',
          explanation: 'Comparing adjacent words takes linear time over characters; topological sort runs on bounded alphabet size.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Proactive identification of the prefix invalid edge case (["apple", "app"]).',
            'Correct cycle detection returning empty string when circular dependency exists.'
          ],
          commonMistakes: [
            'Comparing all pairs of words instead of only adjacent words.',
            'Forgetting that characters appearing only once with 0 dependencies must still be included in output.'
          ]
        }
      },
      {
        id: 'dsa-15',
        title: 'Sliding Window Maximum (Monotonic Decreasing Deque - Hard)',
        category: 'Monotonic Queue / Deque',
        difficulty: 'Hard',
        companyTags: ['Amazon', 'Google', 'Microsoft', 'Citadel'],
        questionPrompt: 'You are given an array of integers nums and an integer k representing a sliding window of size k moving from left to right. Return the max sliding window.',
        conceptSummary: 'Maintains a Monotonic Decreasing Deque of indices. Guarantees front of deque is always the maximum element in the current window in O(N) total time.',
        detailedAnswer: '1. Monotonic Deque Invariant:\n- Store indices in a double-ended queue (deque).\n- Maintain strictly decreasing order of element values: nums[deque.front()] > nums[deque.second()] > ...\n- When sliding window moves to index i:\n  * Evict Expired Indices: If deque.front() <= i - k, the front element has fallen outside window -> pop_front().\n  * Maintain Monotonic Property: While deque is not empty and nums[deque.back()] < nums[i], pop_back(). Those smaller elements can NEVER be the maximum in any future window containing nums[i]!\n  * Push current index i to back of deque.\n  * Record Result: When i >= k - 1, the maximum for the current window is nums[deque.front()].',
        codeSnippet: {
          language: 'Java',
          code: 'public int[] maxSlidingWindow(int[] nums, int k) {\n    if (nums == null || k <= 0) return new int[0];\n    int n = nums.length;\n    int[] result = new int[n - k + 1];\n    Deque<Integer> deque = new ArrayDeque<>();\n    for (int i = 0; i < n; i++) {\n        while (!deque.isEmpty() && deque.peekFirst() < i - k + 1) {\n            deque.pollFirst();\n        }\n        while (!deque.isEmpty() && nums[deque.peekLast()] < nums[i]) {\n            deque.pollLast();\n        }\n        deque.offerLast(i);\n        if (i >= k - 1) {\n            result[i - k + 1] = nums[deque.peekFirst()];\n        }\n    }\n    return result;\n}'
        },
        complexityAnalysis: {
          time: 'O(N)',
          space: 'O(K)',
          explanation: 'Each element index is pushed into the deque once and popped at most once; deque holds at most K indices.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Linear O(N) solution using Deque rather than O(N log K) using Max-Heap.',
            'Storing indices in the deque rather than values (needed to check if element has expired from window).'
          ],
          commonMistakes: [
            'Using PriorityQueue / Max-Heap which takes O(N log K) and requires slow O(K) removals.'
          ]
        }
      }

    ]
  },

  // =========================================================================
  // 3. AI CODE COMPLEXITY & OPTIMIZATION (10 ITEMS)
  // =========================================================================
  {
    id: 'code-complexity-optimization',
    title: 'AI Code Complexity & Optimization',
    subtitle: 'Big-O Analysis & Performance Refactoring',
    badge: 'Code Quality & Efficiency',
    iconName: 'Cpu',
    gradient: 'from-blue-600 to-indigo-600',
    description: 'Learn how to detect sub-optimal code, eliminate hidden complexity bottlenecks (nested loops, string copying, recursion overhead), and refactor to optimal Big-O.',
    importanceRating: 'Critical: Interviewers test if you can analyze and reduce time/space complexity without being prompted',
    items: [
      {
        id: 'opt-1',
        title: 'Two-Sum: Refactoring from O(N²) Brute Force to O(N) Hash Map',
        category: 'Complexity Optimization',
        difficulty: 'Easy',
        companyTags: ['Amazon', 'Microsoft', 'Apple', 'Meta'],
        questionPrompt: 'Analyze the performance flaw in the standard nested-loop Two-Sum implementation and demonstrate how to optimize both time complexity and memory overhead.',
        conceptSummary: 'Trading space for time: Replacing an O(N) inner linear search with an O(1) hash table lookup.',
        detailedAnswer: `Brute Force Flaw:
The brute force solution tests all pairs (i, j) with nested loops:
for i = 0 to N-1:
    for j = i+1 to N-1:
        if nums[i] + nums[j] == target: return [i, j]
Total comparisons = N * (N - 1) / 2 = O(N²). For an array of 100,000 integers, N² requires 10,000,000,000 operations, resulting in a Time Limit Exceeded (TLE) in online assessments.

Optimal O(N) Transformation:
Instead of scanning the remaining array for target - nums[i], we store previously visited numbers and their indices in a Hash Map. For each number, we query the map in O(1) time. Total time collapses from O(N²) to O(N).`,
        visualDiagramAnimation: {
          title: 'Nested Loop Inversion & Space-Time Tradeoff Flow',
          description: 'Visualizing how hash-based memoization eliminates redundant passes.',
          steps: [
            { step: 1, label: 'Identify Quadratic Bottleneck', visualDesc: 'Nested loop compares every item against every other item (N * N operations). At N=100K, 10B operations causes TLE.', badge: 'O(N²) Trap' },
            { step: 2, label: 'Create Complement Lookup Key', visualDesc: 'For element x, formulate target requirement: complement = target - x.', badge: 'Key Inversion' },
            { step: 3, label: 'Probe Hash Map in O(1)', visualDesc: 'Check hash bucket for complement. If absent, record map[x] = currentIndex and advance pointer.', badge: 'O(1) Probing' },
            { step: 4, label: 'Algorithmic Collapse', visualDesc: 'Inner loop is completely eradicated. Total runtime collapses to O(N) single pass in 12 milliseconds.', badge: 'O(N) Optimal' }
          ]
        },
        complexityAnalysis: {
          time: 'O(N) vs O(N²)',
          space: 'O(N) vs O(1)',
          explanation: 'Single linear pass through array with O(1) average lookup in hash map.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Explaining the trade-off: spending O(N) memory to buy a 1000x execution speedup.',
            'Mentioning hash collisions and the difference between average O(1) and worst-case O(N) in unkeyed hash tables.'
          ],
          commonMistakes: [
            'Using the same element twice (e.g. nums[i] * 2 == target at index i).'
          ]
        }
      },
      {
        id: 'opt-2',
        title: 'Subarray Sum Equals K: From O(N³) to O(N) Using Prefix Sums',
        category: 'Prefix Sum Optimization',
        difficulty: 'Medium',
        companyTags: ['Google', 'Meta', 'Uber', 'Amazon'],
        questionPrompt: 'Given an array of integers nums and an integer k, return the total number of continuous subarrays whose sum equals to k.',
        conceptSummary: 'Demonstrates moving from O(N³) naive brute force -> O(N²) cumulative sum -> O(N) prefix sum with frequency map.',
        detailedAnswer: `Optimization Evolution:
1. Naive O(N³): Generate all subarrays (i to j) and compute sum by looping from i to j.
2. Improved O(N²): Accumulate sum on the fly as right pointer expands. Still fails on large N >= 20,000.
3. Optimal O(N):
   Let prefix_sum[i] be the cumulative sum from index 0 to i.
   The sum of any subarray from i to j is: sum(i, j) = prefix_sum[j] - prefix_sum[i - 1].
   We want sum(i, j) == k, which rearranges to:
   prefix_sum[i - 1] == prefix_sum[j] - k.

As we iterate through the array and compute the running prefix sum, we simply check how many times (prefix_sum - k) has appeared previously using a Hash Map {prefix_sum: count}.`,
        codeSnippet: {
          language: 'Python',
          code: `def subarraySum(nums: list[int], k: int) -> int:
    prefix_counts = {0: 1}  # Base case: empty prefix has sum 0
    current_sum = 0
    count = 0

    for num in nums:
        current_sum += num
        # If (current_sum - k) exists, that means valid subarray ending here
        if (current_sum - k) in prefix_counts:
            count += prefix_counts[current_sum - k]

        prefix_counts[current_sum] = prefix_counts.get(current_sum, 0) + 1

    return count`
        },
        complexityAnalysis: {
          time: 'O(N)',
          space: 'O(N)',
          explanation: 'Traverses the list once doing O(1) dictionary lookups. Space stores at most N distinct prefix sums.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Initializing the hash map with {0: 1} to handle subarrays starting from index 0.',
            'Explaining why Two Pointers or Sliding Window CANNOT be used here (because array can contain negative numbers!).'
          ],
          commonMistakes: [
            'Attempting to use Sliding Window when negative numbers are present, which invalidates the monotonic window property.'
          ]
        }
      },
      {
        id: 'opt-3',
        title: 'String Concatenation in Loops (Immutable String Copy vs StringBuilder)',
        category: 'Language Runtime Optimization',
        difficulty: 'Easy',
        companyTags: ['Java Placement Drives', 'TCS Digital', 'Infosys', 'Amazon'],
        questionPrompt: 'Explain why repeated string concatenation inside a loop (s += word) degrades to quadratic O(N²) time complexity in Java and JavaScript, and how to refactor it to O(N).',
        conceptSummary: 'Because strings are immutable in Java/JavaScript/Python, each concatenation creates a brand-new string array and copies all preceding characters, resulting in triangular 1 + 2 + ... + N = O(N²) character copies.',
        detailedAnswer: `Performance Bottleneck:
String s = "";
for (int i = 0; i < N; i++) {
    s += "a";
}
In iteration 1: copies 1 char. Iteration 2: copies 2 chars. Iteration N: copies N chars.
Total memory copied = 1 + 2 + ... + N = N * (N + 1) / 2 ≈ O(N²).
For N = 100,000, this copies ~5 Billion characters and triggers thousands of Garbage Collection (GC) pauses.

Optimal O(N) Refactoring:
Use StringBuilder in Java / C++ std::string / Python ''.join(list).
StringBuilder uses a dynamic backing char[] array with geometric doubling (16 -> 32 -> 64). Appends happen in amortized O(1) time. Total time collapses from O(N²) to O(N).`,
        codeSnippet: {
          language: 'Java',
          code: `// Optimal O(N) Implementation
public String buildSentence(String[] words) {
    StringBuilder sb = new StringBuilder();
    for (String word : words) {
        sb.append(word).append(" ");
    }
    return sb.toString().trim();
}`
        },
        complexityAnalysis: {
          time: 'O(N) vs O(N²)',
          space: 'O(N)',
          explanation: 'Appends in amortized O(1) without intermediate object allocations and GC thrashing.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Understanding string immutability at the heap level.',
            'Explaining geometric doubling of array buffers and amortized constant analysis.'
          ],
          commonMistakes: [
            'Believing the Java JIT compiler optimizes string concatenation inside loops (it does for static single-line expressions, NOT across loop iterations).'
          ]
        }
      },
      {
        id: 'opt-4',
        title: 'Fibonacci Sequence: From O(2^N) Recursion to O(1) Space DP',
        category: 'Recursion to Iteration',
        difficulty: 'Easy',
        companyTags: ['Google', 'Microsoft', 'Adobe', 'Cognizant'],
        questionPrompt: 'Show the progression of computing the Nth Fibonacci number from naive recursion down to optimal O(N) time with O(1) auxiliary space, and explain the call stack footprint.',
        conceptSummary: 'Demonstrates eliminating the exponential 2^N recursion tree through memoization, then eliminating the DP table to achieve O(1) register space.',
        detailedAnswer: `Complexity Progression:
1. Naive Recursion: fib(n) = fib(n-1) + fib(n-2)
   - Generates binary recursion tree of depth N -> O(2^N) operations.
   - For N = 50, takes millions of seconds.
2. Top-Down Memoization:
   - Stores computed values in array -> O(N) time, O(N) auxiliary space + O(N) call stack.
3. Bottom-Up Iterative DP:
   - Fills dp[0..n] iteratively -> O(N) time, O(N) array space.
4. Optimal State Reduction O(1) Space:
   - Since computing fib(n) only depends on the previous two values fib(n-1) and fib(n-2), we only need two variables (prev2, prev1) and a temp variable.
   - Time: O(N), Space: O(1).`,
        codeSnippet: {
          language: 'C++',
          code: `int fib(int n) {
    if (n <= 1) return n;
    int prev2 = 0, prev1 = 1;

    for (int i = 2; i <= n; i++) {
        int current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    return prev1;
}`
        },
        complexityAnalysis: {
          time: 'O(N)',
          space: 'O(1)',
          explanation: 'Executes a single loop of N iterations using 3 scalar integer variables in CPU registers.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Explaining overlapping subproblems in the recursion tree.',
            'Mentioning Matrix Exponentiation achieves O(log N) time for extreme scale.'
          ],
          commonMistakes: [
            'Using recursion without memoization leading to stack overflow on N > 10,000.'
          ]
        }
      },
      {
        id: 'opt-5',
        title: 'Search in 2D Row & Column Sorted Matrix (O(M+N) Staircase Search)',
        category: 'Search Optimization',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Microsoft', 'Oracle', 'Goldman Sachs'],
        questionPrompt: 'Given an m x n matrix where each row is sorted ascending left-to-right and each column is sorted ascending top-to-bottom, search for target in optimal time.',
        conceptSummary: 'Shows how starting search at top-right or bottom-left corner turns the 2D matrix into a Binary Search Tree (BST), eliminating an entire row or column in O(1).',
        detailedAnswer: `Why Top-Left Fails:
If you start at (0, 0), moving right increases value, and moving down also increases value! There is no distinct decision boundary.

Staircase Search from Top-Right (0, n-1):
- If matrix[row][col] == target: found!
- If matrix[row][col] > target: the entire current column below must also be greater than target (because columns are sorted). Therefore, col--.
- If matrix[row][col] < target: the entire current row to the left must also be smaller than target. Therefore, row++.

Each step either decrements col or increments row. Total steps <= m + n.`,
        codeSnippet: {
          language: 'Java',
          code: `public boolean searchMatrix(int[][] matrix, int target) {
    if (matrix == null || matrix.length == 0) return false;
    int row = 0, col = matrix[0].length - 1;

    while (row < matrix.length && col >= 0) {
        if (matrix[row][col] == target) return true;
        else if (matrix[row][col] > target) col--; // Prune column
        else row++; // Prune row
    }
    return false;
}`
        },
        complexityAnalysis: {
          time: 'O(M + N)',
          space: 'O(1)',
          explanation: 'At each comparison, either one row or one column is discarded. Maximum iterations = M + N.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Explaining why corners (0, n-1) or (m-1, 0) have binary decision properties while (0, 0) does not.'
          ],
          commonMistakes: [
            'Running Binary Search on every row individually, which takes O(M log N) instead of optimal O(M + N).'
          ]
        }
      },
      {
        id: 'opt-6',
        title: 'Find the Duplicate Number in Read-Only Array (Floyd\'s Cycle Detection)',
        category: 'Cycle Detection Optimization',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Microsoft', 'Google', 'Qualcomm'],
        questionPrompt: 'Given an array of n + 1 integers where each integer is in range [1, n], find the one duplicate number without modifying the array and using only O(1) extra space.',
        conceptSummary: 'Interpreting array values as pointer addresses nums[i] -> next_index. Because of duplicate value, multiple indices point to the same next node, creating a cycle solved with Floyd\'s Tortoise and Hare algorithm.',
        detailedAnswer: `Mathematical Transformation:
Treat index as node and nums[index] as pointer:
index -> nums[index] -> nums[nums[index]] -> ...
Since numbers are in [1, n] and there are n+1 items, by Pigeonhole Principle, at least two indices point to the same value, forming a cycle.

Algorithm:
1. Phase 1 (Find intersection):
   tortoise = nums[0], hare = nums[0]
   do {
       tortoise = nums[tortoise];
       hare = nums[nums[hare]];
   } while (tortoise != hare);
2. Phase 2 (Find cycle entrance = duplicate value):
   tortoise = nums[0]
   while (tortoise != hare) {
       tortoise = nums[tortoise];
       hare = nums[hare];
   }
   return tortoise;`,
        codeSnippet: {
          language: 'C++',
          code: `int findDuplicate(vector<int>& nums) {
    int slow = nums[0];
    int fast = nums[0];

    // Phase 1: Detect cycle
    do {
        slow = nums[slow];
        fast = nums[nums[fast]];
    } while (slow != fast);

    // Phase 2: Find entrance of cycle
    slow = nums[0];
    while (slow != fast) {
        slow = nums[slow];
        fast = nums[fast];
    }
    return slow;
}`
        },
        complexityAnalysis: {
          time: 'O(N)',
          space: 'O(1)',
          explanation: 'Traverses cycle in linear time without allocating any memory or modifying the original input array.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Proving why the entrance to the cycle is guaranteed to be the duplicate number.',
            'Adhering strictly to constraints: no sorting (cannot modify array) and no HashSet (O(1) space limit).'
          ],
          commonMistakes: [
            'Negating values in array (modifies array, which violates the read-only constraint).'
          ]
        }
      },
      {
        id: 'opt-7',
        title: 'Valid Anagram: From Sorting O(N log N) to Fixed Array O(N)',
        category: 'Memory & Cache Optimization',
        difficulty: 'Easy',
        companyTags: ['Amazon', 'Facebook', 'Adobe', 'Uber'],
        questionPrompt: 'Given two strings s and t, return true if t is an anagram of s. Optimize character frequency counting from sorting or heavy HashMaps to cache-friendly O(1) auxiliary space.',
        conceptSummary: 'Demonstrates that for bounded alphabets (lowercase English a-z), a fixed 26-element primitive integer array provides 10x lower overhead than Java HashMap / Python dict due to contiguous L1 CPU cache alignment.',
        detailedAnswer: `Optimization Comparison:
1. Sorting: Sort both strings and compare equality -> O(N log N) time and O(N) memory for string copy.
2. HashMap: Store character counts in Map<Character, Integer>. Overhead: autoboxing primitive char to Character object, allocating hash table buckets, hash calculation overhead.
3. Fixed Array O(1) Space:
   int[26] count = new int[26];
   Traverse s: count[s[i] - 'a']++
   Traverse t: count[t[i] - 'a']--
   Verify all 26 elements are zero.
   Array fits directly inside 64-byte CPU cache line (26 * 4 bytes = 104 bytes).`,
        codeSnippet: {
          language: 'Java',
          code: `public boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;
    int[] count = new int[26];

    for (int i = 0; i < s.length(); i++) {
        count[s.charAt(i) - 'a']++;
        count[t.charAt(i) - 'a']--;
    }

    for (int c : count) {
        if (c != 0) return false;
    }
    return true;
}`
        },
        complexityAnalysis: {
          time: 'O(N)',
          space: 'O(1)',
          explanation: 'Single linear pass through strings. Fixed array of size 26 is strictly O(1) auxiliary space.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Length check early exit: if s.length() != t.length() return false immediately.',
            'Combining increment and decrement in a single loop pass.'
          ],
          commonMistakes: [
            'Sorting the strings which adds unnecessary O(N log N) sorting overhead.'
          ]
        }
      },
      {
        id: 'opt-8',
        title: 'Inverting a Binary Tree: Call Stack Overflow Risk vs Iterative BFS Queue',
        category: 'Recursion Depth Optimization',
        difficulty: 'Easy',
        companyTags: ['Google', 'Homebrew / Twitter', 'Amazon', 'Cisco'],
        questionPrompt: 'Explain how recursive tree inversion can crash production services via StackOverflowError on skewed trees, and refactor it into an iterative queue-based BFS traversal.',
        conceptSummary: 'Every recursive call consumes stack frames (~1 KB to 8 KB per frame). For a skewed linked-list style tree with 100,000 nodes, recursion blows past default thread stack limits (typically 1 MB).',
        detailedAnswer: `Recursive Risk:
void invert(TreeNode node) {
    if (node == null) return;
    swap(node.left, node.right);
    invert(node.left);
    invert(node.right);
}
On a skewed tree (every node has only one child), recursion depth = N. When N exceeds thread stack limit (~10,000 frames in Java/Node), process crashes with StackOverflowError.

Iterative BFS Solution:
Use a Queue allocated on the Heap (where gigabytes of RAM reside, rather than the small 1MB Thread Call Stack).
While queue is not empty:
- Dequeue node.
- Swap node.left and node.right.
- If node.left != null, enqueue node.left.
- If node.right != null, enqueue node.right.`,
        codeSnippet: {
          language: 'Python',
          code: `def invertTree(root: Optional[TreeNode]) -> Optional[TreeNode]:
    if not root:
        return None

    queue = collections.deque([root])
    while queue:
        curr = queue.popleft()
        curr.left, curr.right = curr.right, curr.left  # Swap children

        if curr.left:
            queue.append(curr.left)
        if curr.right:
            queue.append(curr.right)

    return root`
        },
        complexityAnalysis: {
          time: 'O(N)',
          space: 'O(W) on Heap',
          explanation: 'W is maximum width of tree (up to N/2 on leaf level). Memory lives on Heap rather than Thread Stack, preventing process crash.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Distinguishing between Heap Memory and Thread Stack limits.',
            'Ability to translate recursive tree algorithms to iterative without difficulty.'
          ],
          commonMistakes: [
            'Assuming all trees are balanced with O(log N) depth.'
          ]
        }
      },
      {
        id: 'opt-9',
        title: 'Deep Object Cloning & Memory Leaks in JavaScript/Node.js',
        category: 'V8 Engine Optimization',
        difficulty: 'Medium',
        companyTags: ['Atlassian', 'Stripe', 'Netflix', 'Razorpay'],
        questionPrompt: 'Explain why JSON.parse(JSON.stringify(obj)) is dangerous for deep cloning in Node.js, and demonstrate modern standard solutions like structuredClone and circular reference handling.',
        conceptSummary: 'Covers V8 serialization overhead, data corruption (Date becoming String, undefined and functions stripped, BigInt throwing TypeError), and memory leaks from cyclic object references.',
        detailedAnswer: `Flaws of JSON Serialization Cloning:
1. Data Loss: Functions, Symbol, and undefined properties are silently stripped.
2. Type Mutation: Date objects turn into ISO strings; RegExp objects become empty objects {}.
3. Crash on BigInt: JSON.stringify throws TypeError: Do not know how to serialize a BigInt.
4. Crash on Circular References: If obj.self = obj, throws TypeError: Converting circular structure to JSON.
5. Extreme Performance Cost: Stringifies entire object graph into intermediate string then parses it back through V8 lexer.

Modern Solutions:
- Native Web/Node API: structuredClone(obj) is built into Node 17+ and all modern browsers. It supports Dates, RegExps, Maps, Sets, TypedArrays, and handles circular references automatically!`,
        codeSnippet: {
          language: 'TypeScript / Node.js',
          code: `// Modern Native Deep Clone with Circular Reference Support
const original = {
    id: 101,
    createdAt: new Date(),
    metadata: new Map([['env', 'production']]),
};
// Native standard structuredClone (Zero external dependencies)
const cloned = structuredClone(original);`
        },
        complexityAnalysis: {
          time: 'O(N)',
          space: 'O(N)',
          explanation: 'Direct C++ V8 engine internal memory traversal without string serialization overhead.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Knowing standard language API structuredClone vs outdated JSON hack.',
            'Understanding how circular references cause infinite loops in manual recursive cloner unless a WeakMap is used.'
          ],
          commonMistakes: [
            'Recommending lodash.cloneDeep without mentioning standard native structuredClone.'
          ]
        }
      },
      {
        id: 'opt-10',
        title: 'Front-End High-Frequency Event Debouncing vs Throttling',
        category: 'Client Performance Optimization',
        difficulty: 'Easy',
        companyTags: ['Meta', 'Uber', 'Swiggy', 'Zomato'],
        questionPrompt: 'Explain how unconstrained UI events (input keystrokes, scroll, resize) can degrade performance from 60 FPS to UI freezing, and write custom implementations of debounce and throttle.',
        conceptSummary: 'Debounce waits for a pause of quiet time before executing (ideal for Search input and auto-save); Throttle guarantees execution at most once per fixed time interval (ideal for scroll progress and window resize).',
        detailedAnswer: `Problem:
A user typing fast triggers an onChange event every 50ms. If each triggers an API fetch, the browser floods the server with 20 redundant network requests, causing out-of-order race conditions and UI jank.

Debounce Mechanics:
Resets timer on every keystroke. Executes only after user stops typing for X milliseconds.

Throttle Mechanics:
Executes immediately, then ignores subsequent events for X milliseconds, guaranteeing periodic updates during continuous interaction.`,
        codeSnippet: {
          language: 'TypeScript',
          code: `// Custom TypeScript Debounce Function
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    waitMs: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return function (...args: Parameters<T>) {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func(...args);
        }, waitMs);
    };
}`
        },
        complexityAnalysis: {
          time: 'O(1) scheduling per event',
          space: 'O(1) closure state',
          explanation: 'Reduces network API traffic by up to 95% and prevents DOM layout thrashing.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Proper TypeScript generic typing preserving argument and return signatures.',
            'Cleaning up existing setTimeout timers to prevent memory leaks.',
            'Clear practical distinction: when to use debounce (search input) vs throttle (infinite scroll).'
          ],
          commonMistakes: [
            'Losing this binding or function arguments in naive setTimeout wrapping.'
          ]
        }
      },
      {
        id: 'opt-11',
        title: 'Finding Intersection of Two Linked Lists: From O(M * N) to O(M + N) with O(1) Space',
        category: 'Pointer Alignment Optimization',
        difficulty: 'Easy',
        companyTags: ['Amazon', 'Microsoft', 'Apple', 'Bloomberg'],
        questionPrompt: 'Given the heads of two singly linked-lists headA and headB, return the node at which the two lists intersect. Optimize from O(M*N) nested search to O(1) auxiliary space without modifying list structures.',
        conceptSummary: 'Two pointer traversal where each pointer switches to the head of the opposite list upon reaching null. Equalizes total traversal distance (M + N) and meets at the intersection node.',
        detailedAnswer: '1. Evolution of Approaches:\n- Brute Force O(M * N) Time, O(1) Space: For each node in list A, iterate through all nodes in list B checking pointer equality.\n- Hash Set O(M + N) Time, O(M) Space: Store all nodes of list A in a HashSet, then traverse list B looking for first node present in set.\n- Optimal Two-Pointer O(M + N) Time, O(1) Space:\n  * Pointer pA starts at headA; pointer pB starts at headB.\n  * When pA reaches null, redirect it to headB.\n  * When pB reaches null, redirect it to headA.\n  * Why this works: Let length of A be a + c and B be b + c (where c is shared segment). Pointer A travels a + c + b; Pointer B travels b + c + a. Both travel the EXACT same distance (a + b + c) and arrive at the intersection simultaneously!',
        complexityAnalysis: {
          time: 'O(M + N)',
          space: 'O(1)',
          explanation: 'Both pointers iterate at most two passes across lists A and B; zero auxiliary data structures used.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Explaining the elegant mathematical traversal equalization.',
            'Guaranteeing loop termination when lists do not intersect (both become null at the end of the second pass).'
          ],
          commonMistakes: [
            'Modifying node values or reversing lists (forbidden in interview specifications).'
          ]
        }
      },
      {
        id: 'opt-12',
        title: 'Array Rotation: From O(N * K) Shifts to O(N) In-Place 3-Step Reverse Algorithm',
        category: 'Memory & In-Place Optimization',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Microsoft', 'Adobe', 'Cisco'],
        questionPrompt: 'Given an array, rotate the array to the right by k steps, where k is non-negative. Optimize from O(N) extra space to O(1) auxiliary memory.',
        conceptSummary: 'The 3-Step Reversal Algorithm. Reversing entire array, then reversing first k elements, then reversing remaining n - k elements achieves in-place rotation in O(1) space.',
        detailedAnswer: '1. Approaches Comparison:\n- Naive Shift: Shift array right by 1 step, repeated K times. Time: O(N * K), Space: O(1). TLE on large arrays.\n- Auxiliary Array: Copy elements to new array at (i + k) % n. Time: O(N), Space: O(N). Allocates extra RAM.\n- Optimal 3-Step In-Place Reverse: Time: O(N), Space: O(1).\n  * Step 1: k = k % n (handle k > n).\n  * Step 2: Reverse the entire array [0..n-1]. (e.g. [1,2,3,4,5,6,7] -> [7,6,5,4,3,2,1]).\n  * Step 3: Reverse the first k elements [0..k-1]. ([5,6,7, 4,3,2,1]).\n  * Step 4: Reverse the remaining n-k elements [k..n-1]. ([5,6,7, 1,2,3,4]) -> Perfectly rotated in-place!',
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Proactive k = k % n modulo check upfront.',
            'Writing a clean two-pointer in-place reverse helper function.'
          ],
          commonMistakes: [
            'Forgetting k % n, causing out-of-bounds exceptions when k > array length.'
          ]
        }
      },
      {
        id: 'opt-13',
        title: 'SQL N+1 Query Problem in ORMs (Hibernate / Prisma / Mongoose): Profiling & Eager Loading',
        category: 'Database & Backend Optimization',
        difficulty: 'Medium',
        companyTags: ['Uber', 'Salesforce', 'Stripe', 'Atlassian'],
        questionPrompt: 'What is the N+1 query problem in Object-Relational Mappers (ORMs)? How does it cripple database performance, and how do you resolve it using JOIN FETCH or batch loading?',
        conceptSummary: '1 initial query fetches N parent records, and the ORM lazily executes N separate queries to fetch children. Resolved via Eager Loading (JOIN FETCH in SQL) or batch fetching (IN clause).',
        detailedAnswer: '1. The Disaster Scenario:\nSuppose an API fetches 100 User profiles and their latest Posts:\n- Query 1: SELECT * FROM users LIMIT 100; (returns 100 users).\n- Queries 2..101: For each user, the ORM lazily fires: SELECT * FROM posts WHERE user_id = ?;\n- Result: 101 database network round-trips! Even if each query takes 2ms, total latency explodes to 200ms+ and saturates DB connection pools.\n\n2. Production Solutions:\n- SQL / Hibernate: Use JOIN FETCH: SELECT u FROM User u JOIN FETCH u.posts. Executes in 1 single SQL query!\n- Node.js / Prisma / Mongoose: Use include: { posts: true } or .populate("posts"). The ORM generates: SELECT * FROM posts WHERE user_id IN (1, 2, ..., 100). Reduces 101 round-trips to just 2 queries!',
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Explaining how lazy loading defaults trigger the N+1 problem.',
            'Differentiating JOIN FETCH (1 query with Cartesian product overhead) vs Batch In-Clause (2 queries with no Cartesian blowup).'
          ],
          commonMistakes: [
            'Blaming database indexes for slow queries when the root cause is application-level N+1 query loops.'
          ]
        }
      },
      {
        id: 'opt-14',
        title: 'Bit Manipulation: Counting Set Bits From O(32) to Brian Kernighan O(K Set Bits)',
        category: 'Bitwise Micro-Optimization',
        difficulty: 'Easy',
        companyTags: ['Google', 'Microsoft', 'Apple', 'NVIDIA'],
        questionPrompt: 'Write an algorithm to count the number of 1-bits (Hamming Weight) in an integer. Explain why Brian Kernighan algorithm runs in O(K) where K is number of set bits instead of 32 iterations.',
        conceptSummary: 'Clears the lowest set bit using n = n & (n - 1) in each step. Loop terminates immediately when all set bits are processed.',
        detailedAnswer: '1. Why n & (n - 1) Works:\nSubtracting 1 from a binary number flips all bits up to and including the lowest set bit (e.g. 12 = 1100 in binary; 11 = 1011 in binary).\n- Performing bitwise AND n & (n - 1) yields: 1100 & 1011 = 1000. Notice the rightmost set bit has been flipped to 0!\n- Iterating this operation clears exactly one set bit per step. If an integer has only two 1-bits (e.g. 1024 + 1), the loop executes only 2 times instead of 32 or 64 times!',
        codeSnippet: {
          language: 'C++',
          code: 'int hammingWeight(uint32_t n) {\n    int count = 0;\n    while (n != 0) {\n        n = n & (n - 1); // Clears the lowest set bit\n        count++;\n    }\n    return count;\n}'
        },
        complexityAnalysis: {
          time: 'O(K) where K is number of set bits (at most 32)',
          space: 'O(1)',
          explanation: 'Loop runs strictly proportional to the number of 1s in the binary representation.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Clear arithmetic explanation of why n & (n - 1) zeroes the rightmost 1-bit.',
            'Awareness of CPU hardware instructions like __builtin_popcount or POPCNT.'
          ],
          commonMistakes: [
            'Using modulo % 2 and division / 2 on signed negative integers without handling negative sign extension.'
          ]
        }
      },
      {
        id: 'opt-15',
        title: 'React Re-Rendering Optimization: Virtual DOM Diffs, React.memo, useMemo & Stable Callbacks',
        category: 'Frontend Performance Optimization',
        difficulty: 'Medium',
        companyTags: ['Meta', 'Uber', 'Airbnb', 'Swiggy'],
        questionPrompt: 'Why do React components re-render unnecessarily? How do React.memo, useMemo, and useCallback maintain referential equality across render cycles?',
        conceptSummary: 'React re-renders all children by default when a parent re-renders. Preventing renders requires shallow prop comparison via React.memo paired with referential stability of objects and callbacks.',
        detailedAnswer: '1. Why Naive React.memo Fails Without useCallback:\nIf parent passes an inline function: <Child onClick={() => doSomething()} />, JavaScript creates a brand new function reference in memory on EVERY parent render! Even if Child is wrapped in React.memo, its shallow comparison sees prevProps.onClick !== nextProps.onClick and forces a full re-render!\n\n2. The Performance Triage Checklist:\n- Rule 1: Wrap expensive pure child components in React.memo.\n- Rule 2: Wrap callbacks passed to memoized children in useCallback(fn, [deps]) to preserve referential equality.\n- Rule 3: Wrap heavy computations (filtering 10,000 array elements) in useMemo(() => compute(), [deps]).\n- Rule 4: Use key prop properly in lists (never use array index for dynamic mutable lists).',
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Understanding why inline function definitions violate referential equality for React.memo.',
            'Knowing when NOT to use useMemo (overhead of memoization on trivial arithmetic).'
          ],
          commonMistakes: [
            'Wrapping every component and function in React.memo and useCallback indiscriminately without profiling.'
          ]
        }
      }

    ]
  },

  // =========================================================================
  // 4. HR & BEHAVIORAL EVALUATOR (10 ITEMS)
  // =========================================================================
  {
    id: 'hr-behavioral-evaluator',
    title: 'HR & Behavioral Evaluator',
    subtitle: 'STAR Framework & Placement Soft Skills',
    badge: 'Campus Placement HR Clearance',
    iconName: 'MessageSquare',
    gradient: 'from-amber-600 to-orange-600',
    description: 'Ace campus recruitment HR and managerial rounds. Master structured answers using the STAR method (Situation, Task, Action, Result) with proven placement scripts.',
    importanceRating: 'Determines offer confirmation: Over 40% of students with good coding skills fail due to poor HR responses',
    items: [
      {
        id: 'hr-1',
        title: 'Tell Me About Yourself (CSE Placement Pitch)',
        category: 'Introduction',
        difficulty: 'Easy',
        companyTags: ['All Placement Drives', 'TCS Digital', 'Infosys', 'Amazon', 'Cisco'],
        questionPrompt: 'Tell me about yourself, your academic background, and why you are interested in this software engineering role.',
        conceptSummary: 'The 90-Second Formula: Past (Education & Core CS), Present (Flagship Projects & Technical Stack), Future (Why this specific company & role).',
        detailedAnswer: `Winning Structure (90 Seconds):
1. Who you are & Education (15s):
   "I am a final-year Computer Science Engineering student at [College Name], passionate about building high-performance backend systems and clean web applications."

2. Technical Core & Hands-On Experience (45s):
   "Over the last three years, I have focused heavily on Data Structures, Algorithms, and Full-Stack development with React, Node.js, and MongoDB. Recently, I built an AI-powered interview platform that helps engineering students prepare for placements using automated complexity analysis and Gemini integration. In this project, I resolved concurrency bottlenecks in code execution using Judge0 sandboxes and reduced database query latency by 40% through B-Tree index optimization."

3. Why this Company & Role (30s):
   "I have solved over 250 DSA problems across LeetCode and GeeksForGeeks, but what excites me most about [Company Name] is your engineering culture around distributed systems and high-throughput reliability. I would love to contribute my technical foundation and problem-solving energy to your software development team."`,
        visualDiagramAnimation: {
          title: 'The 90-Second Present-Past-Future Elevator Pitch Flow',
          description: 'Structured storytelling architecture for opening placement rounds.',
          steps: [
            { step: 1, label: 'Present (30 Seconds)', visualDesc: 'State your current education/role, primary tech stack (e.g., Full-Stack TS/Node & React), and top technical passions.', badge: 'Current Identity' },
            { step: 2, label: 'Past (30 Seconds)', visualDesc: 'Highlight 1 key project: problem solved, architectural decision made, and quantifiable impact (e.g. built microservice with 99.9% uptime).', badge: 'Concrete Proof' },
            { step: 3, label: 'Future (30 Seconds)', visualDesc: 'Connect your trajectory directly to why you want to work at this specific company and how you can add immediate engineering value.', badge: 'Company Hook' }
          ]
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Crisp delivery (under 2 minutes) without reciting resume word-for-word.',
            'Highlighting quantitative project achievements (e.g. "reduced latency by 40%").',
            'Enthusiasm and cultural alignment with the hiring company.'
          ],
          commonMistakes: [
            'Talking extensively about personal hobbies, school marks, or family background.',
            'Speaking without structure or exceeding 3 minutes.',
            'Sounding generic without naming the specific company.'
          ]
        }
      },
      {
        id: 'hr-2',
        title: 'Resolving Technical Disagreements & Team Conflict',
        category: 'Teamwork & Conflict',
        difficulty: 'Medium',
        companyTags: ['Amazon (LP: Have Backbone; Disagree and Commit)', 'Microsoft', 'Atlassian'],
        questionPrompt: 'Describe a situation where you had a disagreement with a project teammate or peer regarding a technical design decision. How did you resolve it?',
        conceptSummary: 'Amazon Leadership Principle / STAR format evaluating maturity, data-driven decision making, and team cohesion.',
        detailedAnswer: `STAR Response:
- Situation: During our final-year capstone project, our team of four was building a real-time collaborative document editor. A peer wanted to use MongoDB document polling, whereas I proposed using WebSockets paired with Redis Pub/Sub for live cursor synchronization.
- Task: We had only 6 weeks before campus evaluation, and debating without consensus was threatening our delivery milestone. My goal was to reach a technical consensus quickly without alienating my teammate.
- Action: Rather than arguing subjectively, I created a quick benchmark prototype comparing both approaches under 50 simultaneous connections. I demonstrated with concrete metrics that MongoDB polling generated 300 redundant queries per second with a 650ms latency lag, while WebSockets maintained real-time latency below 45ms with minimal server load. I acknowledged his concern about WebSocket reconnection logic and volunteered to write the resilient reconnection handler myself.
- Result: My teammate agreed with the data, and we integrated WebSockets cleanly. Our project received the highest grade in the department, and our teammate specifically thanked me during the viva for handling the decision constructively.`,
        visualDiagramAnimation: {
          title: 'STAR Method Behavioral Execution Blueprint',
          description: 'Visual breakdown of the 4 quadrants of a high-scoring behavioral response.',
          steps: [
            { step: 1, label: 'Situation (20%)', visualDesc: 'Set the context: company/project, team size, timeline, and the specific high-stakes challenge faced.', badge: 'Context' },
            { step: 2, label: 'Task (15%)', visualDesc: 'Clearly define YOUR personal responsibility, role, and the concrete goal you needed to achieve.', badge: 'Objective' },
            { step: 3, label: 'Action (50%)', visualDesc: 'Deep-dive into the specific actions YOU took: debugging methods, code architecture, stakeholder alignment, and trade-offs.', badge: 'Core Ownership' },
            { step: 4, label: 'Result (15%)', visualDesc: 'Share the measurable outcome: latency dropped 45%, zero downtime release, and the key lesson you learned for the future.', badge: 'Quantified Impact' }
          ]
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Using data and benchmarks rather than ego or authority to resolve arguments.',
            'Empathy: understanding the peer\'s valid concerns and offering help.',
            'Clear outcome where project succeeded and relationship was preserved.'
          ],
          commonMistakes: [
            'Portraying the teammate as incompetent or stubborn.',
            'Saying "I never had any conflict with anyone" (interviewers know this is false).',
            'Giving up immediately without standing up for technical quality.'
          ]
        }
      },
      {
        id: 'hr-3',
        title: 'Describe Your Most Challenging Technical Bug and How You Fixed It',
        category: 'Problem Solving & Debugging',
        difficulty: 'Medium',
        companyTags: ['Google', 'Amazon', 'Cisco', 'Salesforce'],
        questionPrompt: 'Tell me about the hardest bug or technical problem you encountered in a project. Walk me through your diagnostic approach and how you identified the root cause.',
        conceptSummary: 'Tests systematic debugging discipline, logging analysis, avoiding shot-in-the-dark guessing, and implementing permanent regression tests.',
        detailedAnswer: `STAR Response:
- Situation: In my full-stack MERN application, users reported that occasionally their saved coding submissions would intermittently disappear or revert to blank state under concurrent saves.
- Task: The bug was intermittent and could not be reproduced locally with single-user clicks. I needed to isolate the root cause without corrupting production user records.
- Action:
  1. Systematic Logging: I added correlation IDs to all incoming HTTP requests and logged MongoDB write operations with exact timestamps.
  2. Reproduction: I wrote an automated load script simulating 10 rapid concurrent update requests.
  3. Root Cause Analysis: I discovered a classic Race Condition (Lost Update anomaly). Multiple asynchronous Node.js requests were fetching the document, modifying the JavaScript object in memory, and calling document.save(), causing the later write to overwrite the earlier write.
  4. Fix: I replaced document.save() with atomic MongoDB operators ($set and $inc) and implemented Optimistic Concurrency Control using Mongoose __v version keys.
- Result: Zero lost updates occurred in subsequent stress testing with 500 parallel writes, and query latency decreased by 18% because atomic field updates avoid full document serialization.`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Structured scientific method: logging, reproduction, hypothesis, verification.',
            'Understanding underlying database race conditions and atomic operations.'
          ],
          commonMistakes: [
            'Saying "I just searched on StackOverflow and changed random code until it worked".',
            'Picking a trivial syntax error like a missing semicolon.'
          ]
        }
      },
      {
        id: 'hr-4',
        title: 'Why Do You Want to Join Our Company Specifically?',
        category: 'Company Alignment',
        difficulty: 'Easy',
        companyTags: ['All Companies', 'Amazon', 'TCS', 'Infosys', 'Wipro'],
        questionPrompt: 'Why are you specifically interested in starting your engineering career with our company rather than other tech firms?',
        conceptSummary: 'Requires demonstrating authentic research into the company\'s products, engineering blog, tech stack, and corporate culture rather than giving generic flattery.',
        detailedAnswer: `Formula: Product Impact + Engineering Scale + Personal Growth:
"I have followed [Company Name]'s engineering blog for the past year, especially your article on transitioning to event-driven microservices with Kafka. As a student passionate about distributed systems and scalability, being in an environment that handles millions of transactions daily is the ideal proving ground for me.

Secondly, I admire your engineering culture around ownership. In your campus pre-placement talk, the engineering director highlighted how associate software engineers are entrusted with writing production code that ships to real users within their first quarter. I am excited to bring my foundation in full-stack engineering, learn from senior architects, and make measurable contributions to your upcoming product milestones."`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Specific facts about the company (engineering blog, business products, recent innovations).',
            'Direct alignment between the candidate\'s skills and what the company actually builds.'
          ],
          commonMistakes: [
            'Saying "Because you are a Fortune 500 company and have good salary and brand name".',
            'Confusing the company with a competitor (e.g. praising AWS to an Azure interviewer).'
          ]
        }
      },
      {
        id: 'hr-5',
        title: 'What Are Your Greatest Technical Strengths and Genuine Weakness?',
        category: 'Self-Awareness',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Microsoft', 'Goldman Sachs', 'Cognizant'],
        questionPrompt: 'What do you consider your greatest technical strength, and what is one genuine area of weakness you are actively working to improve?',
        conceptSummary: 'Never use fake humble-brag weaknesses ("I work too hard"). State a real, non-disqualifying technical weakness paired with an active, measurable remediation plan.',
        detailedAnswer: `Strength:
"My greatest strength is my ability to break down ambiguous technical requirements into modular, testable components. When working on projects, I don't jump into coding immediately; I sketch the data model, define API contracts, and consider edge cases first, which prevents expensive refactoring later."

Genuine Weakness & Active Remediation:
"In the past, my genuine weakness was getting caught in 'perfectionist over-engineering'—spending too much time optimizing edge-case algorithms or UI micro-animations before delivering the minimum viable product (MVP).
To fix this, I adopted Agile time-boxing. I now break features into strict 2-hour milestones: first make it work, then make it right, and only optimize if metrics justify it. This has increased my project delivery speed significantly while keeping code quality high."`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Authenticity and self-awareness.',
            'Actionable steps being taken to overcome the weakness.'
          ],
          commonMistakes: [
            'Saying "I have no weaknesses" (displays arrogance).',
            'Saying a disqualifying weakness: "I hate working with people" or "I am bad at coding".'
          ]
        }
      },
      {
        id: 'hr-6',
        title: 'Describe a Time You Delivered Under an Impossible Deadline',
        category: 'Pressure & Prioritization',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Uber', 'Flipkart', 'Swiggy'],
        questionPrompt: 'Tell me about a project where you faced a tight or seemingly impossible deadline. How did you prioritize tasks and deliver under pressure?',
        conceptSummary: 'Evaluates ruthless prioritization, MVP scope reduction, proactive stakeholder communication, and remaining calm under high pressure.',
        detailedAnswer: `STAR Response:
- Situation: During our national 36-hour hackathon, our payment integration API broke 8 hours before final judging due to an unannounced third-party sandbox deprecation.
- Task: We had to demonstrate an end-to-end working checkout flow to the judging panel with only 8 hours remaining and our primary feature broken.
- Action:
  1. Triage: I called an immediate 10-minute huddle. Rather than panicking, I separated core judging criteria (working payment simulation) from non-essential polish.
  2. Scope Reduction: I built a lightweight in-memory mock payment gateway that replicated the real gateway\'s webhook lifecycle and signed cryptographic signatures.
  3. Transparent Communication: I informed our team mentor about the pivot and verified it complied with judging rules.
- Result: We completed the end-to-end user journey with 2 hours to spare, demoed the product flawlessly, and secured 2nd place out of 85 participating engineering colleges.`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Calm crisis management and ability to prioritize essential vs non-essential tasks.',
            'Decisive action without waiting for someone else to fix the problem.'
          ],
          commonMistakes: [
            'Blaming teammates or third parties without taking ownership.',
            'Giving up or submitting an incomplete, non-functional project.'
          ]
        }
      },
      {
        id: 'hr-7',
        title: 'Tell Me About a Time You Made a Critical Mistake or Failed',
        category: 'Accountability & Resilience',
        difficulty: 'Medium',
        companyTags: ['Google', 'Meta', 'Microsoft', 'Atlassian'],
        questionPrompt: 'Can you share an instance where a technical decision you made turned out to be wrong or failed? What happened and what did you learn?',
        conceptSummary: 'Assesses intellectual honesty, accountability (owning the failure without excuses), root-cause analysis, and growth mindset.',
        detailedAnswer: `STAR Response:
- Situation: In my 3rd year web application, I decided to build a custom authentication system using raw crypto tokens rather than using established, audited security libraries like bcrypt and JSON Web Token standards.
- Task: During a peer security code review, a teammate demonstrated that my custom hashing algorithm had timing vulnerabilities susceptible to side-channel attacks.
- Action:
  1. Ownership: I immediately acknowledged the flaw without being defensive.
  2. Immediate Remediation: I put aside pride, researched industry best practices (OWASP guidelines), and refactored the auth layer completely using bcrypt with 12 salt rounds and JWT with httpOnly secure cookies.
  3. Preventive Learning: I documented our security checklist and added automated linting rules to prevent dangerous crypto implementations in our repo.
- Result: The vulnerability was eliminated before deployment. This taught me a foundational engineering lesson: never reinvent security primitives in production; always rely on peer-reviewed, industry-standard cryptographic tools.`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Immediate ownership: no finger-pointing.',
            'Deep takeaway that permanently changed the candidate\'s engineering behavior.'
          ],
          commonMistakes: [
            'Saying "I never made any mistake" or picking a mistake where someone else was at fault.',
            'Failing to show what preventive measures were implemented.'
          ]
        }
      },
      {
        id: 'hr-8',
        title: 'How Do You Handle Critical Code Review Feedback?',
        category: 'Egoless Programming',
        difficulty: 'Easy',
        companyTags: ['Amazon', 'Google', 'Microsoft', 'Red Hat'],
        questionPrompt: 'Imagine a senior engineer reviews your pull request and leaves 15 critical comments requesting substantial changes to your architecture. How do you respond?',
        conceptSummary: 'Evaluates "egoless programming"—understanding that critique of code is NOT a critique of personal worth, and embracing reviews as accelerated learning.',
        detailedAnswer: `Response Philosophy:
"I view rigorous code reviews as the highest-value mentorship an early-career engineer can receive.
My approach follows three steps:

1. Separate Ego from Code: I remind myself that feedback on my code is an investment by a senior engineer into system quality and my professional development, never a personal criticism.
2. Group and Prioritize: I categorize comments into:
   - Architectural/Design concerns (discuss trade-offs or clarify misunderstandings).
   - Performance and Security fixes (implement immediately).
   - Style/Convention suggestions (update to match team conventions).
3. Collaborative Dialogue: If I disagree with a comment, I don't argue emotionally; I test both approaches with a small benchmark or refer to the team\'s architecture guidelines. If the senior engineer has valid context I lacked, I thank them, implement the changes, and document the pattern so the entire team benefits."`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Maturity: treating code reviews as learning opportunities rather than confrontations.',
            'Willingness to adopt team standards and write readable code.'
          ],
          commonMistakes: [
            'Getting defensive or saying "If my code works, they shouldn\'t complain about style".'
          ]
        }
      },
      {
        id: 'hr-9',
        title: 'Describe an Initiative You Took Outside College Coursework',
        category: 'Proactiveness & Drive',
        difficulty: 'Medium',
        companyTags: ['Google', 'Atlassian', 'Uber', 'Amazon'],
        questionPrompt: 'Tell me about a technical project, open-source contribution, or community initiative you undertook purely on your own initiative without any academic requirement.',
        conceptSummary: 'Demonstrates passion for technology beyond passing exams, intrinsic motivation, and self-directed problem solving.',
        detailedAnswer: `STAR Response:
- Situation: In our college, junior students struggled repeatedly with setting up local development environments (Node version mismatch, MongoDB PATH errors, Docker config), consuming hours of club workshops.
- Task: Nobody asked me to solve this, but I wanted to eliminate this barrier so juniors could focus on actual coding rather than environment debugging.
- Action:
  1. I created an open-source GitHub template called "campus-dev-starter" with automated Docker Compose files, devcontainer setups for VS Code, and automated GitHub Actions scripts.
  2. I recorded a 10-minute video walkthrough and hosted an optional weekend hands-on session for 80 first- and second-year students.
- Result: Over 120 students in our college now use the repository, and environment setup time during coding hackathons dropped from 2 hours to under 5 minutes. The college coding club made it the official onboarding repo.`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Genuine passion for technology and empathy for peers.',
            'Taking action without waiting for instructions or grades.'
          ],
          commonMistakes: [
            'Listing a mandatory course assignment as "personal initiative".'
          ]
        }
      },
      {
        id: 'hr-10',
        title: 'Where Do You See Yourself in 3 to 5 Years as an Engineer?',
        category: 'Career Vision',
        difficulty: 'Easy',
        companyTags: ['All Placement Drives', 'TCS Digital', 'Infosys', 'Amazon', 'Cisco'],
        questionPrompt: 'Where do you see yourself professionally in 3 to 5 years, and how does this role fit into your long-term career aspirations?',
        conceptSummary: 'Shows realistic ambition, desire to master technical fundamentals before rushing into management, and commitment to the company.',
        detailedAnswer: `Realistic 5-Year Roadmap:
"In the next 1 to 2 years, my priority is to master [Company Name]'s tech stack, establish a reputation for high-quality, reliable code, and become fully autonomous in shipping complex features from design doc to production deployment.

In 3 to 5 years, as I grow into a Mid-to-Senior Software Engineer, I see myself taking end-to-end architectural ownership of critical microservices, mentoring incoming campus hires, and participating in high-level system design decisions.

My goal is not just to write code, but to solve real business bottlenecks and contribute to building systems that scale reliably to millions of users."`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Realistic progression: mastering technical foundations first before leading teams.',
            'Focus on business impact and mentorship alongside personal skill advancement.'
          ],
          commonMistakes: [
            'Saying "I want to be a Manager or VP in 2 years" (unrealistic and displays disinterest in hands-on engineering).',
            'Saying "I plan to pursue an MBA or MS abroad in 1 year" (signals high flight risk to campus recruiters).'
          ]
        }
      },
      {
        id: 'hr-11',
        title: 'How Do You Prioritize Tasks When Juggling Multiple Competing Deadlines?',
        category: 'Time Management',
        difficulty: 'Easy',
        companyTags: ['All Placement Drives', 'Amazon', 'Google', 'Microsoft', 'Deloitte'],
        questionPrompt: 'Tell me about a time you were overwhelmed with multiple competing project deadlines and academic exams. How did you prioritize and deliver?',
        conceptSummary: 'Evaluates structured prioritization (Eisenhower Matrix / Impact vs Effort), transparent stakeholder communication, scope negotiation, and delivering high-quality MVPs.',
        detailedAnswer: '1. Model Answer Structure (STAR):\n- Situation: "During my 6th semester, our team had a major Capstone Project milestone due the same week as 3 university semester examinations."\n- Task: "As the backend lead, I had to ensure our API services were deployed while preparing thoroughly for my core CS subjects."\n- Action:\n  * Prioritization Framework: I categorized deliverables by Impact vs Urgency. Non-critical stretch features (like dark mode and extra analytics charts) were deprioritized.\n  * Scope Negotiation: I held a quick 15-minute sync with our project guide to agree on a core functional MVP (Authentication + CRUD + Live Demo).\n  * Time Blocking: Dedicated 7:00 AM - 1:00 PM to deep-focus exam revision, and afternoons to focused sprint coding.\n- Result: "We successfully presented the working MVP ahead of schedule, receiving an A grade on the project, and I achieved a 9.1 SGPA that semester."',
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Proactive scope management rather than panic or pretending everything can be done simultaneously.',
            'Transparent communication with project guides/stakeholders before deadlines pass.'
          ],
          commonMistakes: [
            'Saying "I never get stressed, I just pull all-nighters" (signals unsustainable habits and poor time management).'
          ]
        }
      },
      {
        id: 'hr-12',
        title: 'Tell Me About a Time You Worked with a Difficult Team Member or Slacker',
        category: 'Conflict & Collaboration',
        difficulty: 'Medium',
        companyTags: ['All Placement Drives', 'Amazon', 'TCS Prime', 'Infosys SP', 'Cisco'],
        questionPrompt: 'Describe a situation where a team member was not pulling their weight or disagreed with everyone. How did you handle it?',
        conceptSummary: 'Focuses on empathy, root-cause diagnosis (blocker vs motivation), private communication without public shaming, task realignment, and team success.',
        detailedAnswer: '1. Golden Rule: Never badmouth teammates in an interview. Frame conflict around communication and support.\n\n2. Model Answer Framework:\n- Situation: In our college hackathon team of 4, one frontend contributor stopped attending standups and missed their component deliverable 24 hours before submission.\n- Action:\n  * Private 1-on-1: Instead of calling them out in the group chat, I reached out privately to check if everything was okay. They admitted they were struggling with React state management and felt intimidated asking the group.\n  * Realignment: I paired with them for 45 minutes to set up the data contracts, broke their remaining task into 3 small bite-sized subcomponents, and took ownership of the complex API integration myself.\n- Result: They completed the UI components confidently, our demo ran seamlessly, and we placed in the Top 5 teams. The teammate later thanked me for supporting them instead of escalating to mentors.',
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Empathy and seeking to understand root causes before passing judgment.',
            'Resolving issues privately without toxic confrontation or escalating to authorities unnecessarily.'
          ],
          commonMistakes: [
            'Blaming the teammate and complaining about how incompetent they were.',
            'Saying "I just did all their work myself and cut them out" (displays zero teamwork).'
          ]
        }
      },
      {
        id: 'hr-13',
        title: 'Describe a Situation Where You Had to Learn a Complex Technology in a Short Time',
        category: 'Learning Agility',
        difficulty: 'Easy',
        companyTags: ['All Placement Drives', 'Google', 'Amazon', 'Microsoft', 'Razorpay'],
        questionPrompt: 'Tell me about an instance where you were assigned an unfamiliar framework or language and had to become productive rapidly.',
        conceptSummary: 'Demonstrates curiosity, documentation-first approach, rapid prototyping, and self-directed problem solving under tight timeframes.',
        detailedAnswer: '1. The 3-Step Rapid Learning Framework:\n- Phase 1 - Official Docs & Mental Model: "I read official documentation and architecture guides rather than watching 10-hour generic video tutorials."\n- Phase 2 - Hello World Prototype: "Within 24 hours, I build a small end-to-end toy application to understand lifecycle, error handling, and build tooling."\n- Phase 3 - Codebase Immersion: "I inspect existing production pull requests in open source repositories to observe idiomatic design patterns."',
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Methodical approach to learning rather than random copy-pasting.',
            'Self-reliance combined with knowing when to ask for guidance.'
          ],
          commonMistakes: [
            'Claiming to master a complete ecosystem in 2 hours without concrete evidence.'
          ]
        }
      },
      {
        id: 'hr-14',
        title: 'Do You Have Any Questions for Us? (The Reverse Interview Technique)',
        category: 'Curiosity & Culture Fit',
        difficulty: 'Easy',
        companyTags: ['All Placement Drives', 'All Companies'],
        questionPrompt: 'We have 5 minutes left. Do you have any questions for me about the company or the engineering team?',
        conceptSummary: 'Demonstrates deep curiosity, research on the company, and genuine passion for engineering excellence. Never say "No, I have no questions"!',
        detailedAnswer: '3 High-Impact Questions Every Student Should Ask:\n- Question 1 (Engineering Culture): "What does the typical onboarding process look like for a campus hire, and what distinguishes an entry-level engineer who succeeds in their first 6 months?"\n- Question 2 (Architecture & Scale): "I noticed your engineering team recently migrated to microservices/cloud. What has been the biggest architectural challenge during that transition?"\n- Question 3 (Mentorship): "How does code review and technical design feedback happen within your sprint teams?"',
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Asking thoughtful, technical, or culture-oriented questions.',
            'Showing genuine enthusiasm for long-term growth.'
          ],
          commonMistakes: [
            'Saying "No, everything was clear" (signals disinterest).',
            'Asking only about salary, vacation days, or free snacks in Round 1.'
          ]
        }
      },
      {
        id: 'hr-15',
        title: 'Tell Me About a Time You Showed Leadership Even Without a Formal Title',
        category: 'Leadership & Initiative',
        difficulty: 'Medium',
        companyTags: ['Amazon (Ownership Principle)', 'Google', 'Microsoft', 'Atlassian'],
        questionPrompt: 'Describe a situation where you took initiative to solve a problem or guide peers without being officially designated as the leader.',
        conceptSummary: 'Amazon Leadership Principle: Ownership. Leaders do not say "that is not my job". They spot inefficiencies, create solutions, and elevate the team.',
        detailedAnswer: '1. Model Story (Automating Team Testing):\n- Situation: In our college lab project, team members were manually testing REST APIs with Postman, repeatedly breaking features before demo presentations.\n- Action: Without being asked, I spent a weekend setting up an automated CI test pipeline using Jest and GitHub Actions that ran regression tests on every pull request, and hosted a 20-minute demo showing the team how to write unit tests.\n- Result: Pull request merge conflicts dropped by 80%, zero broken endpoints during final faculty evaluation, and the college department adopted the GitHub Actions starter template for future batches.',
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Demonstrating personal ownership without complaining or finger-pointing.',
            'Measurable impact and elevating peer engineering standards.'
          ],
          commonMistakes: [
            'Claiming to boss other people around without formal authority.'
          ]
        }
      }

    ]
  },

  // =========================================================================
  // 5. 30-DAY ADAPTIVE ROADMAP (FULL 5-WEEK PLACEMENT SYLLABUS)
  // =========================================================================
  {
    id: '30-day-adaptive-roadmap',
    title: '30-Day Adaptive Roadmap',
    subtitle: 'Strategic Placement Curriculum',
    badge: 'Structured Study Plan',
    iconName: 'Compass',
    gradient: 'from-rose-600 to-pink-600',
    description: 'A 5-week comprehensive syllabus sprint specifically engineered for campus recruitment season, covering linear & non-linear DSA, core CS theory, system design, and placement interview simulations.',
    importanceRating: 'Prevents burnout and guarantees 100% syllabus coverage before on-campus recruitment drives commence',
    items: [
      {
        id: 'roadmap-week-1',
        title: 'Week 1: Core Programming, Complexity & Linear DSA',
        category: 'Roadmap Milestone (Days 1–7)',
        difficulty: 'Medium',
        companyTags: ['All Product Companies', 'Campus OA Prep', 'Amazon', 'TCS Digital'],
        questionPrompt: 'What topics and practice milestones must be completed in Week 1 of the placement preparation sprint?',
        conceptSummary: 'Focuses on language mastery (Java/Python/C++), Big-O asymptotic analysis, Arrays, Two Pointers, Sliding Window, and Prefix Sums.',
        detailedAnswer: `Week 1 Execution Plan (Days 1 - 7):
- Days 1-2: Complexity Analysis & Language Mastery:
  * Review language memory model (Java JVM memory model & Garbage Collection / C++ pointers & references / Python GIL).
  * Master Big-O: calculate time and space complexity for nested loops, recursion trees, and dynamic array resizing.
  * Solve 5 basic warmup problems (Two Sum, Valid Anagram, Reverse String).
- Days 3-4: Arrays, Two Pointers & In-Place Manipulations:
  * Two Pointers: Two Sum II (sorted), 3Sum, Container With Most Water, Trapping Rain Water.
  * Prefix Sums: Subarray Sum Equals K, Range Sum Query, Product of Array Except Self.
- Days 5-6: Sliding Window & Fast/Slow Pointers:
  * Dynamic Sliding Window: Longest Substring Without Repeating Characters, Minimum Window Substring.
  * Fast & Slow Pointers: Linked List Cycle Detection, Middle of Linked List, Palindrome Linked List.
- Day 7: Weekly Checkpoint & Timed Assessment:
  * Take a 90-minute timed mock coding assessment (3 problems: 1 Easy, 2 Medium) with zero IDE auto-complete.`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Consistency over cramming: 3-4 problems daily with deep understanding rather than copying 20 solutions.'
          ],
          commonMistakes: [
            'Jumping straight into Hard Dynamic Programming before mastering Two Pointers and Arrays.'
          ]
        }
      },
      {
        id: 'roadmap-week-2',
        title: 'Week 2: Non-Linear Data Structures & Core Computer Science (OS & DBMS)',
        category: 'Roadmap Milestone (Days 8–14)',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Cisco', 'Oracle', 'TCS Digital', 'Infosys'],
        questionPrompt: 'What non-linear data structures and core CS theory topics are guaranteed to be tested during campus interview rounds and should be completed in Week 2?',
        conceptSummary: 'Covers Stacks, Queues, Binary Trees, BSTs, Heaps/Priority Queues, DBMS (ACID & Indexing), SQL Queries, and OS fundamentals.',
        detailedAnswer: `Week 2 Execution Plan (Days 8 - 14):
- Days 8-9: Stacks, Queues & Monotonic Patterns:
  * Valid Parentheses, Min Stack with O(1) getMin, Daily Temperatures, Largest Rectangle in Histogram.
  * Implement Queue using Stacks and LRU Cache.
- Days 10-11: Binary Trees & Binary Search Trees (BST):
  * Tree Traversals: In-order, Pre-order, Post-order (both Recursive and Iterative).
  * BFS Level Order Traversal, Maximum Depth, Lowest Common Ancestor (LCA), Validate BST.
  * Heaps: Top K Frequent Elements, Merge K Sorted Lists.
- Days 12-13: Core CS Theory (Guaranteed 25-30% of technical interview):
  * Database Management Systems (DBMS): ACID properties, Transaction Isolation Levels (Dirty Read, Phantom Read), Clustered vs Non-Clustered Indexes, B+ Trees, 1NF to BCNF Normalization.
  * SQL Practice: Hand-write complex queries (2nd highest salary, INNER vs LEFT JOIN, GROUP BY with HAVING, Window functions ROW_NUMBER() and DENSE_RANK()).
  * Operating Systems: Process vs Thread, Context Switching, CPU Scheduling, Deadlocks (4 Coffman conditions), Paging, Virtual Memory.
- Day 14: Core CS Rapid-Fire Quiz & Self-Audit.`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Ability to write error-free SQL queries by hand on a whiteboard or Google Doc without an IDE.'
          ],
          commonMistakes: [
            'Neglecting SQL queries because you focused 100% on LeetCode.'
          ]
        }
      },
      {
        id: 'roadmap-week-3',
        title: 'Week 3: Advanced Algorithms, Graphs, DP & Computer Networks',
        category: 'Roadmap Milestone (Days 15–21)',
        difficulty: 'Hard',
        companyTags: ['Google', 'Amazon', 'Microsoft', 'Uber', 'Flipkart'],
        questionPrompt: 'What advanced algorithmic patterns (Graphs, Dynamic Programming) and networking concepts must be completed in Week 3 to clear high-package product rounds?',
        conceptSummary: 'Graph algorithms (BFS, DFS, Dijkstra, Topological Sort), 1D and 2D Dynamic Programming patterns, and Computer Networks fundamentals.',
        detailedAnswer: `Week 3 Execution Plan (Days 15 - 21):
- Days 15-16: Graph Algorithms:
  * Graph Representations: Adjacency List vs Matrix.
  * BFS & DFS: Number of Islands, Rotting Oranges, Clone Graph.
  * Topological Sort: Course Schedule I & II (Kahn's In-Degree algorithm).
  * Shortest Paths: Dijkstra's Algorithm with Priority Queue.
- Days 17-18: Dynamic Programming Mastery:
  * 1D DP: Climbing Stairs, House Robber, Coin Change, Longest Increasing Subsequence (LIS).
  * 2D DP: 0/1 Knapsack, Longest Common Subsequence (LCS), Edit Distance, Unique Paths.
  * Practice identifying recurrence relations and space-optimizing from 2D to 1D arrays.
- Days 19-20: Computer Networks & Security:
  * OSI 7-Layer vs TCP/IP 4-Layer models.
  * TCP 3-Way Handshake, TCP vs UDP comparison, Flow Control vs Congestion Control.
  * HTTP/1.1 vs HTTP/2 vs HTTP/3 (QUIC), TLS 1.3 cryptographic handshake, DNS resolution hierarchy.
  * Web Security: CORS, CSRF tokens, XSS sanitization, SQL Injection prevention.
- Day 21: Full-Length Online Assessment Simulation (4 Questions, 120 Minutes).`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Formulating DP state transitions step-by-step before writing code.',
            'Deep networking understanding: explaining why UDP is used for DNS and gaming while TCP is used for HTTP.'
          ],
          commonMistakes: [
            'Memorizing DP solutions instead of practicing the 4-step framework: State definition, Base case, Recurrence relation, Computation order.'
          ]
        }
      },
      {
        id: 'roadmap-week-4',
        title: 'Week 4: System Design, Full-Stack Architecture & OOP / LLD',
        category: 'Roadmap Milestone (Days 22–28)',
        difficulty: 'Hard',
        companyTags: ['Amazon', 'Google', 'Atlassian', 'Uber', 'Salesforce'],
        questionPrompt: 'How should Week 4 be spent to master High-Level System Design, Low-Level Object Oriented Design (LLD), and project viva preparation?',
        conceptSummary: 'Covers High-Level Design (HLD) scaling patterns, SOLID principles, Design Patterns, and deep-dive preparation for resume projects.',
        detailedAnswer: `Week 4 Execution Plan (Days 22 - 28):
- Days 22-23: High-Level System Design (HLD):
  * Architectural building blocks: Load Balancers (L4 vs L7, Round Robin vs Least Connections), Reverse Proxies (Nginx), Distributed Caching (Redis/Memcached).
  * Scalability Patterns: Database Sharding, Replication (Leader-Follower), CAP Theorem, Microservices vs Monolith.
  * Core Design Drills: URL Shortener (TinyURL), Distributed Rate Limiter, Scalable Multi-Channel Notification Service.
- Days 24-25: Low-Level Design (LLD) & Object-Oriented Programming:
  * SOLID Principles with concrete code violations and refactored examples.
  * Design Patterns: Singleton, Factory, Builder, Observer (Pub/Sub), Strategy.
  * Practice designing: Parking Lot, Splitwise expense sharing, Elevator System.
- Days 26-27: Resume Project Deep-Dive & Architecture Defense:
  * Prepare deep architectural answers for your flagship projects: Why did you choose React/Node/MongoDB? How did you handle authentication? What was the biggest concurrency bottleneck?
  * Quantify your project achievements: "Reduced query latency by 40%", "Integrated Judge0 isolated execution for 4 languages".
- Day 28: System Design Peer Mock Interview & Whiteboard Defense.`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Ability to drive system design conversations with structured requirements and back-of-the-envelope calculations.',
            'Deep ownership of every technology listed on the resume.'
          ],
          commonMistakes: [
            'Putting technologies on resume (e.g. Docker, Kafka, Redis) without being able to explain how they work internally.'
          ]
        }
      },
      {
        id: 'roadmap-week-5',
        title: 'Week 5: Placement Mock Marathon, Company Patterns & HR Mastery',
        category: 'Roadmap Milestone (Days 29–35)',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Google', 'TCS Digital', 'Infosys', 'Wipro', 'Cognizant'],
        questionPrompt: 'What final sprint activities must be executed in Week 5 to transition from technical practice to clearing actual on-campus placement drives?',
        conceptSummary: 'Simulates high-pressure company-specific assessment patterns, STAR framework HR behavioral preparation, and whiteboard problem-solving drills.',
        detailedAnswer: `Week 5 Execution Plan (Days 29 - 35):
- Days 29-30: Company-Specific Question Pattern Drills:
  * Tier-1 Product Track (Amazon, Google, Microsoft): High-frequency LeetCode tagged questions, Monotonic Stack, Trie, Union-Find.
  * Mass-Recruitment & Digital Track (TCS Digital, Infosys Power Programmer, Cognizant GenC Next): Advanced quantitative aptitude, technical MCQs on C/Java pointers, and 2 medium coding challenges.
- Days 31-32: HR & Managerial Round Preparation (STAR Method):
  * Script and practice the 90-second "Tell Me About Yourself" pitch until natural.
  * Prepare 4 distinct STAR stories covering: Team conflict, Challenging technical bug, Missed deadline/pressure, and Personal initiative.
  * Prepare intelligent questions to ask the interviewer at the end of the round.
- Days 33-34: Full Dress Rehearsal Mock Interviews:
  * Complete 2 full AI Mock Interviews (1 Technical + 1 HR/Behavioral) on the InterviewAI platform.
  * Review feedback rubrics, eliminate filler words, and calibrate communication clarity.
- Day 35: Rest, Mental Preparation & Placement Day Readiness:
  * Review quick-revision cheat sheets for Big-O complexities and SQL queries.
  * Sleep 8 hours, ensure formal dress and resume copies are ready. Enter interview with confidence!`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Polished, confident communication under pressure.',
            'Clear thinking out loud during live coding rounds without long awkward silences.',
            'Humility, curiosity, and strong culture fit.'
          ],
          commonMistakes: [
            'Cramming new complex algorithms on the night before the interview and losing sleep.',
            'Neglecting behavioral rounds after clearing technical assessments.'
          ]
        }
      },
      {
        id: 'roadmap-mock-drills',
        title: 'High-Pressure Live Coding & Speed Drills Protocol (30-Minute Interview Clock)',
        category: 'Interview Preparation',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Google', 'Microsoft', 'Uber', 'Atlassian'],
        questionPrompt: 'How should you structure your time when given an unseen coding problem in a 45-minute technical round? What is the 5-phase structured response protocol?',
        conceptSummary: 'Time budgeting: 5 min clarify & constraints, 10 min brute-force & optimal approach, 15 min clean modular implementation, 5 min edge cases dry-run, 5 min complexity analysis.',
        detailedAnswer: `1. The 30-Minute Live Coding Clock:
- Phase 1 (Minutes 0-5) - Clarify & Define Bounds:
  * Restate problem in your own words to verify mutual understanding.
  * Clarify constraints: Array size (N <= 10^5 indicates O(N) or O(N log N)), range of values (can numbers be negative? integer overflow?), duplicates allowed?
  * Clarify inputs/outputs and write 2 edge test cases (empty input, single element, negative numbers).
- Phase 2 (Minutes 5-12) - State Brute-Force & Pivot to Optimal:
  * Always state the brute-force approach first (e.g., "A naive nested loop takes O(N^2) time").
  * Analyze bottleneck: "We are repeatedly searching in unsorted data, so a Hash Map or Two Pointers can reduce search time to O(1) or O(log N)".
  * Communicate the trade-off: Time O(N) vs Space O(N).
  * Get verbal sign-off from interviewer: "Does this approach look good to implement?"
- Phase 3 (Minutes 12-25) - Clean, Modular Code:
  * Write idiomatic, readable variable names (not single letters where meaning matters).
  * Handle edge cases upfront (null checks, empty arrays).
  * Verbalize code as you type: "Here I initialize the hash map to store complement values."
- Phase 4 (Minutes 25-30) - Dry Run & Edge Case Walkthrough:
  * NEVER say "I am done" without stepping through your code line by line with a sample input.
  * Trace variables in a comment block.
  * Check for off-by-one errors (index < n vs <= n).
- Phase 5 (Minutes 30-35) - Complexity Analysis:
  * State Time Complexity and Space Complexity explicitly with justification.`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Proactive constraint clarification before typing code.',
            'Continuous thinking out loud (no silent 10-minute coding blocks).',
            'Independent dry run on edge cases before announcing completion.'
          ],
          commonMistakes: [
            'Immediately jumping into coding without clarifying constraints.',
            'Staying silent while thinking or debugging.',
            'Ignoring interviewer hints or defending an suboptimal approach stubbornly.'
          ],
          followUpQuestions: [
            'How would your solution change if the input array cannot fit into RAM (external sorting)?',
            'Can we eliminate the O(N) extra space if we are allowed to mutate the input array?'
          ]
        }
      },
      {
        id: 'roadmap-behavioral-mastery',
        title: 'Behavioral & Leadership Rounds Mastery (STAR Framework & Red-Flag Checklist)',
        category: 'HR & Behavioral',
        difficulty: 'Easy',
        companyTags: ['Amazon', 'Google', 'Microsoft', 'Salesforce', 'Adobe'],
        questionPrompt: 'How do you answer behavioral questions such as "Tell me about a time you faced a serious technical disagreement with a teammate" without sounding defensive or generic?',
        conceptSummary: 'Structuring answers using Situation, Task, Action, Result (STAR), focusing 70% of response time on personal Action, and quantifying measurable business/academic outcomes.',
        detailedAnswer: `1. The STAR Answering Blueprint:
- Situation (15%): Set the brief context (Project, team size, semester, deadline). Keep it concise.
- Task (10%): The specific challenge or conflict that needed resolution.
- Action (60%): The core of your answer! What did YOU personally do?
  * Focus on collaborative data-driven problem solving: "Instead of arguing opinions, I suggested benchmarking both approaches with a synthetic workload."
  * Show emotional intelligence and empathy: "I scheduled a 1-on-1 coffee chat to understand their architectural concerns regarding caching."
- Result (15%): Quantifiable, positive outcome and personal reflection.
  * "Our benchmark revealed the Redis cache reduced latency by 42%. We successfully delivered 2 days ahead of schedule, and my teammate and I co-authored the service documentation."

2. The 5 Core Stories Every Student Must Prepare:
- Story 1: Handling a tight deadline or high-stress deliverable.
- Story 2: Technical failure or bug that reached production/demo, and how you recovered.
- Story 3: Disagreement with a teammate or project guide and how you resolved it diplomatically.
- Story 4: Stepping up to learn an unfamiliar technology rapidly under pressure.
- Story 5: Proudest technical project and architectural decisions made.

3. Red Flags to Avoid:
- Blaming teammates, professors, or management.
- Using vague generalizations ("We did this, we worked hard"). Use "I researched, I implemented, I proposed".
- Not having a clear, positive learning outcome.`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Use of structured STAR format with concrete details.',
            'High ownership mindset and personal accountability for failures.',
            'Data-driven decision making and collaborative maturity.'
          ],
          commonMistakes: [
            'Rambling for 10 minutes without reaching the point.',
            'Speaking negatively about former teammates or project guides.',
            'Claiming to have never made any technical mistakes.'
          ]
        }
      },
      {
        id: 'roadmap-company-specific',
        title: 'Placement Strategy: Service-Based (TCS/Wipro/Infosys) vs Product-Based (FAANG/Startups)',
        category: 'Career Guidance',
        difficulty: 'Easy',
        companyTags: ['TCS', 'Infosys', 'Wipro', 'Amazon', 'Google', 'Swiggy', 'Zomato'],
        questionPrompt: 'How should your placement preparation strategy differ between Service-Based Company drives (TCS Digital/Prime, Infosys DSE/SP) and Tier-1 Product Companies (FAANG, Unicorns)?',
        conceptSummary: 'Aptitude & pseudo-code mastery vs deep LeetCode Medium/Hard algorithmic agility, System Design, and CS core internals.',
        detailedAnswer: `1. Service-Based Companies (TCS Ninja/Digital/Prime, Infosys SE/DSE/SP, Cognizant, Wipro, Accenture):
- Rounds Breakdown:
  * Round 1: Online Aptitude (Quantitative, Logical, Verbal Reasoning) + Coding Assessment (1-2 questions, Easy to Low-Medium).
  * Round 2: Technical + HR composite interview (Basic OOP concepts, basic SQL queries, final year project summary).
- High-Yield Focus:
  * Aptitude speed & mental math (Percentages, Time & Work, Permutations).
  * Standard basic algorithms: Palindrome, Reverse Linked List, Fibonacci, Prime check, String manipulation.
  * Core definitions: OOP 4 pillars with real-world analogies, SQL Joins, Primary vs Unique key.

2. Product-Based Companies (Amazon, Microsoft, Google, Uber, Razorpay, Flipkart, Atlassian):
- Rounds Breakdown:
  * Round 1: Online Coding (3-4 problems on HackerRank/LeetCode Medium to Hard, strict time and memory limits).
  * Rounds 2 & 3: Live Technical Problem Solving & DSA (Two Pointers, Sliding Window, Trees, Graphs, DP).
  * Round 4: CS Core (OS virtual memory, DBMS transactions/indexes, Computer Networks TCP/IP) + LLD/OOP design.
  * Round 5: Hiring Manager / Behavioral (STAR questions, leadership principles).
- High-Yield Focus:
  * Deep pattern recognition: Monotonic Stack, Topological Sort, Disjoint Set Union (DSU), Segment Trees, DP with memoization.
  * Writing clean, production-grade bug-free code live while communicating thought processes.
  * Core CS deep internals: B+ Tree fan-out, Paging/Thrashing, TCP 3-way handshake, Event Loop.`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Realistic assessment of personal strengths and target company profiles.',
            'Targeted time management balancing aptitude with deep algorithmic problem solving.'
          ],
          commonMistakes: [
            'Ignoring aptitude tests completely and getting filtered out in Round 1 of mass campus drives.',
            'Memorizing code without understanding time and space trade-offs.'
          ]
        }
      }

    ]
  },

  // =========================================================================
  // 6. CORE DBMS & OPERATING SYSTEMS (8 CSE PLACEMENT ITEMS)
  // =========================================================================
  {
    id: 'dbms-os-core',
    title: 'Core DBMS & Operating Systems',
    subtitle: 'B+ Trees, ACID, Deadlocks, Paging & Linux Internals',
    badge: 'Core CSE Curriculum',
    iconName: 'Database',
    gradient: 'from-teal-600 to-emerald-700',
    description: 'Foundational Database Management Systems and Operating System concepts asked in technical screening rounds by Microsoft, Oracle, Salesforce, Amazon, and Cisco.',
    importanceRating: 'Mandatory for all On-Campus Technical Rounds',
    items: [
      {
        id: 'dbms-1',
        title: 'B+ Tree Indexing Internals vs Hash Indexes in Relational Databases',
        category: 'Database Management Systems',
        difficulty: 'Medium',
        companyTags: ['Oracle', 'Microsoft', 'Amazon', 'Salesforce'],
        questionPrompt: 'Explain how B+ Tree indexing works in MySQL InnoDB or PostgreSQL. Why are B+ Trees overwhelmingly preferred over Binary Search Trees or Hash Tables for disk storage?',
        conceptSummary: 'Covers high branching factor (fan-out), sequential leaf node linked lists for range queries, logarithmic disk I/O reduction, and cache line alignment.',
        detailedAnswer: `1. Why B+ Trees beat BSTs and Hash Tables:
- High Fan-Out (Branching Factor): A B+ Tree node matches the disk page size (typically 16 KB in InnoDB). Each node holds 1,000+ keys. A 3-level B+ Tree can index 1,000^3 = 1 Billion records with only 3 to 4 disk I/O seeks! In contrast, a BST has a fan-out of 2, requiring ~30 seeks for 1B items.
- Range Queries via Leaf Linked List: In a B+ Tree, internal nodes only store routing keys, while all data/record pointers reside strictly in the leaf nodes. Leaf nodes are linked via a doubly-linked list. A range query (e.g., WHERE age BETWEEN 20 AND 30) finds the lower bound in O(log N) and then traverses linearly in O(K) without re-traversing the tree.
- Hash Indexes: Provide O(1) equality searches (WHERE id = 5) but fail completely on range scans (WHERE age > 25) and sorting (ORDER BY age).

2. Clustered vs Secondary Index:
- Clustered Index (Primary Key): The leaf nodes of the B+ Tree contain the actual physical row data.
- Secondary Index: The leaf nodes contain the secondary key column paired with the Primary Key value (not physical pointer), requiring a second B+ Tree lookup (Index Bookmark Lookup) unless it is a "Covering Index".`,
        visualDiagramAnimation: {
          title: 'B+ Tree 3-Level Search & Sequential Range Traversal',
          description: 'Step-by-step traversal from root node to doubly linked leaf nodes.',
          steps: [
            { step: 1, label: 'Root Node Inspection', visualDesc: 'Query: WHERE id BETWEEN 24 AND 45. Search begins at Root Page (16KB page loaded into buffer pool in 1 I/O).', badge: 'Root Page' },
            { step: 2, label: 'Internal Branch Routing', visualDesc: 'Binary search inside internal node points to child page holding keys 20..50. Zero data payloads stored here.', badge: 'Routing Key' },
            { step: 3, label: 'Leaf Node Boundary Hit', visualDesc: 'Traverse down to Leaf Page. Target lower bound (id = 24) located in exact leaf slot in O(log N).', badge: 'Leaf Hit' },
            { step: 4, label: 'Linear Range Scan', visualDesc: 'Instead of re-traversing the root, follow the next-leaf pointer across the leaf linked list until id = 45 is reached.', badge: 'O(K) Scan' }
          ]
        },
        complexityAnalysis: {
          time: 'O(log_B N) where B >= 1000',
          space: 'O(N)',
          explanation: '3 to 4 disk page reads satisfy lookups across hundreds of millions of database rows.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Explaining how disk block page size (16KB) dictates high branching factor.',
            'Highlighting that B+ Trees store all actual record pointers in leaf nodes connected by a linked list.',
            'Knowing why Hash tables cannot support SQL range queries or prefix pattern matches.'
          ],
          commonMistakes: [
            'Confusing B-Trees (data in all nodes) with B+ Trees (data only in leaf nodes).',
            'Claiming Hash indexes are always better because of O(1) without noting range query failure.'
          ],
          followUpQuestions: [
            'What is a Covering Index in MySQL and how does it prevent table lookups?',
            'How do write-intensive workloads suffer from B+ Tree page splits?'
          ]
        }
      },
      {
        id: 'dbms-2',
        title: 'SQL Isolation Levels & Concurrency Anomalies (ACID)',
        category: 'Database Management Systems',
        difficulty: 'Medium',
        companyTags: ['Microsoft', 'Amazon', 'Goldman Sachs', 'Uber'],
        questionPrompt: 'Explain the 4 ANSI SQL Transaction Isolation Levels. What specific anomalies (Dirty Read, Non-Repeatable Read, Phantom Read) does each level prevent?',
        conceptSummary: 'Evaluates transaction atomicity and isolation, MVCC (Multi-Version Concurrency Control), and lock-based vs snapshot-based concurrency.',
        detailedAnswer: `1. The 3 Concurrency Anomalies:
- Dirty Read: Transaction A reads data modified by uncommitted Transaction B. If B rolls back, A read data that never technically existed.
- Non-Repeatable Read: Transaction A reads row X. Transaction B modifies or deletes row X and commits. Transaction A re-reads row X and finds changed data.
- Phantom Read: Transaction A queries a range (e.g. SELECT COUNT(*) WHERE age > 21). Transaction B inserts a new row matching that predicate and commits. Transaction A re-queries and sees "phantom" new rows.

2. ANSI SQL Isolation Levels:
- Read Uncommitted: Prevents nothing. Allows Dirty, Non-Repeatable, and Phantom reads.
- Read Committed: Prevents Dirty Reads. Guarantees queries only see committed data. (Default in PostgreSQL & Oracle).
- Repeatable Read: Prevents Dirty & Non-Repeatable Reads. Guarantees that re-reading any specific row within a transaction produces identical data. (Default in MySQL InnoDB via Next-Key locks/MVCC).
- Serializable: Prevents all anomalies including Phantom Reads by simulating serial linear execution.

3. Multi-Version Concurrency Control (MVCC):
Modern engines like MySQL InnoDB and Postgres avoid read locks using MVCC: each row maintains a creation transaction ID (trx_id) and rollback pointer to undo logs, allowing readers to read older consistent snapshots without blocking writers.`,
        codeSnippet: {
          language: 'SQL',
          code: `-- Setting transaction isolation in PostgreSQL / MySQL
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
START TRANSACTION;
SELECT balance FROM accounts WHERE user_id = 101;
-- Concurrent updates to user 101 by other transactions will not mutate our view
COMMIT;`
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Clear matrix explaining all 4 isolation levels against the 3 concurrency phenomena.',
            'Understanding why Serializable causes high lock contention and transaction aborts.',
            'Mentioning MVCC and Undo Logs as the modern non-blocking read mechanism.'
          ],
          commonMistakes: [
            'Confusing Non-Repeatable Read (row values changed) with Phantom Read (new rows inserted into range).',
            'Assuming higher isolation level is always better without noting throughput degradation.'
          ]
        }
      },
      {
        id: 'dbms-3',
        title: 'Database Normalization (1NF to BCNF) and Real-World De-normalization',
        category: 'Database Management Systems',
        difficulty: 'Medium',
        companyTags: ['Oracle', 'Infosys', 'TCS Digital', 'Wipro'],
        questionPrompt: 'Walk through 1NF, 2NF, 3NF, and BCNF with concrete database schema examples. When should an engineering team deliberately de-normalize in production?',
        conceptSummary: 'Eliminating insertion, update, and deletion anomalies through functional dependency analysis, and balancing read latency with write redundancy.',
        detailedAnswer: `1. Normalization Stages:
- 1NF (First Normal Form): Atomic values only (no comma-separated lists or array columns); unique row identifier (Primary Key).
- 2NF (Second Normal Form): Must be in 1NF + No Partial Functional Dependencies (every non-key attribute must depend on the FULL candidate key, relevant for composite primary keys).
- 3NF (Third Normal Form): Must be in 2NF + No Transitive Dependencies (non-key columns cannot determine other non-key columns, e.g., ZipCode -> State; move to separate table).
- BCNF (Boyce-Codd Normal Form): Strict 3NF where for every functional dependency X -> Y, X must be a super key.

2. Why & When to De-normalize:
- Normalized databases require multi-table JOINs (e.g. Orders JOIN Users JOIN Products JOIN Addresses).
- High-read scale systems (e.g. Amazon order history, social media feeds) de-normalize by copying customer_name and product_title directly into the orders table.
- Benefit: Single-table O(1) clustered reads without expensive distributed hash joins.
- Cost: Redundant disk usage and need for transactional sync (or event-driven eventual consistency) when customer updates their name.`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Clear definition of Partial vs Transitive dependencies.',
            'Real-world justification for de-normalization in microservices and reporting warehouses.',
            'Understanding update and deletion anomalies.'
          ],
          commonMistakes: [
            'Describing normalization without using functional dependency terminology (X -> Y).',
            'Claiming production systems must always be 100% normalized.'
          ]
        }
      },
      {
        id: 'os-1',
        title: 'Process vs Thread Architecture & Cost of Context Switching (TLB Flushing)',
        category: 'Operating Systems & Linux',
        difficulty: 'Medium',
        companyTags: ['Microsoft', 'Google', 'Cisco', 'Qualcomm'],
        questionPrompt: 'What is the precise structural difference between a Process and a Thread? Detail what happens inside the CPU and OS kernel during a context switch.',
        conceptSummary: 'Covers PCB vs TCB, virtual memory page tables, translation lookaside buffer (TLB) invalidation, register saving, and cache thrashing.',
        detailedAnswer: `1. Process vs Thread:
- Process: An executing program instance with its own isolated Virtual Address Space (Text, Data, Heap, Stack), File Descriptors, and Process Control Block (PCB). Processes cannot access each other's memory without IPC.
- Thread: The smallest unit of execution dispatched by the OS kernel. Multiple threads within the same process share the Virtual Address Space, Heap, and File Descriptors, but maintain independent Stacks, Program Counters (PC), and Thread Control Blocks (TCB).

2. Context Switch Breakdown:
- Thread-to-Thread (Same Process):
  * Save CPU registers and program counter into current TCB.
  * Load registers and stack pointer from new TCB.
  * Virtual memory page tables remain identical; NO TLB flush required. Fast (~1 to 2 microseconds).
- Process-to-Process:
  * Switch CPU privilege mode to Kernel Mode via interrupt or syscall.
  * Save current process state into PCB.
  * Switch Virtual Memory Address Space (update CR3 register in x86).
  * Invalidate / Flush the Translation Lookaside Buffer (TLB)!
  * CPU L1/L2 hardware caches go cold, causing massive memory stall penalties on subsequent instructions. Significantly more expensive (~5 to 10 microseconds + cold cache penalty).`,
        visualDiagramAnimation: {
          title: 'CPU Hardware Context Switch & Register State Save',
          description: 'Step-by-step kernel switch from Process A to Process B.',
          steps: [
            { step: 1, label: 'Timer Interrupt / Syscall', visualDesc: 'OS Timer interrupt fires. CPU traps from User Mode into Kernel Mode ring 0.', badge: 'Ring 0 Trap' },
            { step: 2, label: 'Save Process A State', visualDesc: 'Push General Purpose Registers, Program Counter, and Stack Pointer into Process A PCB in RAM.', badge: 'Save PCB' },
            { step: 3, label: 'Switch Memory Directory (CR3)', visualDesc: 'Load new page table root into CPU CR3 register. Flushes CPU Translation Lookaside Buffer (TLB).', badge: 'TLB Flush' },
            { step: 4, label: 'Restore Process B State', visualDesc: 'Pop registers and stack pointer from Process B PCB. CPU transitions back to User Mode.', badge: 'User Mode' }
          ]
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Highlighting that threads within a process share the heap and address space.',
            'Explaining TLB flushing and CPU cache misses as the true cost of process context switching.',
            'Mentioning CPU registers, program counter, and stack pointer.'
          ],
          commonMistakes: [
            'Saying threads have no independent memory (threads must have independent stacks and registers).',
            'Assuming context switching has zero CPU hardware penalty.'
          ]
        }
      },
      {
        id: 'os-2',
        title: 'Coffman Deadlock Conditions & Banker\'s Safety Avoidance Algorithm',
        category: 'Operating Systems & Linux',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Microsoft', 'Oracle', 'Goldman Sachs'],
        questionPrompt: 'What are the 4 Coffman conditions required for a Deadlock to occur? How does Dijkstra\'s Banker\'s Algorithm dynamically avoid entering an unsafe state?',
        conceptSummary: 'Deadlock prevention by breaking Coffman conditions vs Deadlock avoidance using resource matrices (Available, Max, Allocation, Need).',
        detailedAnswer: `1. The 4 Coffman Conditions (All 4 must hold simultaneously):
- Mutual Exclusion: At least one resource must be held in a non-shareable mode.
- Hold and Wait: A process holds at least one resource and requests additional resources held by other processes.
- No Preemption: Resources cannot be forcibly seized; only released voluntarily by the holding process.
- Circular Wait: A closed chain of processes exists: P0 waits for P1, P1 waits for P2 ... Pn waits for P0.

2. Prevention Strategy:
- Break Circular Wait by enforcing a strict global resource hierarchy: all threads must acquire locks in ascending ID order (e.g., Lock A before Lock B).

3. Banker's Algorithm (Deadlock Avoidance):
Before granting a resource request, the OS simulates the allocation:
- Maintains matrices: Allocation[i][j], Max[i][j], Need[i][j] = Max - Allocation, and Available[j].
- Evaluates if there exists a "Safe Sequence" <P0, P1, ... Pn> such that for each Pi, its remaining Need can be satisfied by currently Available resources plus resources already held by completed processes.
- If safe sequence exists: Grant resource. If state becomes Unsafe: Process must wait.`,
        visualDiagramAnimation: {
          title: 'Banker\'s Safety Algorithm State Evaluation Flow',
          description: 'Step-by-step verification of safe allocation sequence.',
          steps: [
            { step: 1, label: 'Resource Request Intercept', visualDesc: 'Process P1 requests R1 resources. Kernel calculates hypothetical Available vector if granted.', badge: 'Request' },
            { step: 2, label: 'Compute Need Matrix', visualDesc: 'For each process: Need[i] = Max[i] - Allocation[i]. Determine who can finish with available resources.', badge: 'Need Matrix' },
            { step: 3, label: 'Find Eligible Process', visualDesc: 'Process P0 satisfies Need <= Work. Mark P0 finished; release P0 allocated resources back to Work vector.', badge: 'Safe Step' },
            { step: 4, label: 'Safe Sequence Verified', visualDesc: 'All processes terminate successfully: Safe Sequence <P0, P2, P1>. Allocation approved!', badge: 'Safe State' }
          ]
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Listing all 4 Coffman conditions by name without prompting.',
            'Explaining how lock ordering prevents Circular Wait in multi-threaded programming.',
            'Differentiating Deadlock Prevention vs Avoidance (Banker\'s) vs Detection & Recovery.'
          ],
          commonMistakes: [
            'Confusing an Unsafe state with an actual Deadlock (an unsafe state has the POTENTIAL to deadlock, but isn\'t deadlocked yet).'
          ]
        }
      },
      {
        id: 'os-3',
        title: 'Virtual Memory, Paging, Page Fault Lifecycle & Thrashing',
        category: 'Operating Systems & Linux',
        difficulty: 'Hard',
        companyTags: ['Google', 'Microsoft', 'Apple', 'Intel', 'NVIDIA'],
        questionPrompt: 'Explain how Virtual Memory and multi-level Paging work. Walk through the exact hardware/kernel sequence when a Page Fault interrupt occurs.',
        conceptSummary: 'Memory Management Unit (MMU), Page Directory, Page Table Entries (PTE), dirty/valid bits, swap space, and working set model to combat thrashing.',
        detailedAnswer: `1. Virtual Memory Architecture:
- Translates program virtual addresses to physical RAM frames via the Memory Management Unit (MMU) and Page Tables.
- Advantages: Process isolation, memory protection, and allowing programs to exceed physical RAM capacity.

2. Page Fault Interrupt Sequence:
- Instruction attempts to access virtual address X.
- MMU queries the TLB cache. If TLB Miss, MMU walks the Page Table.
- Valid Bit = 0: Page is not currently mapped into physical RAM (resides in disk Swap Space).
- MMU triggers a Page Fault Hardware Exception (Interrupt 14).
- Kernel context-switches current thread to Page Fault Handler.
- OS checks if address is valid (not a Segmentation Fault).
- OS allocates an empty physical frame (or evicts a page using LRU/Clock algorithm; if dirty bit = 1, writes back to disk first).
- OS initiates asynchronous disk I/O to read the 4KB page from Swap into RAM.
- OS updates Page Table entry (sets frame number and Valid Bit = 1).
- Kernel restarts the trapped instruction; TLB hits, and execution proceeds transparently.

3. Thrashing:
When the sum of working sets across active processes exceeds physical RAM, the OS spends >90% of CPU time paging in/out from disk rather than executing user code. Resolved by suspending processes until working sets fit in memory.`,
        visualDiagramAnimation: {
          title: 'Virtual Address Translation & Page Fault Handling Flow',
          description: 'Step-by-step lifecycle from MMU address probe to swap frame restoration.',
          steps: [
            { step: 1, label: 'Virtual Address Access', visualDesc: 'CPU executes instruction referencing virtual address 0x7FFF0040. MMU checks TLB cache.', badge: 'TLB Probe' },
            { step: 2, label: 'Page Table Walk & Miss', visualDesc: 'TLB Miss: MMU walks Multi-level Page Table. Valid bit is 0 (page resident on disk Swap).', badge: 'Valid Bit 0' },
            { step: 3, label: 'Page Fault Trap', visualDesc: 'MMU raises CPU Page Fault Exception (Interrupt 14). Kernel takes control in Ring 0.', badge: 'Interrupt 14' },
            { step: 4, label: 'Disk Swap Read', visualDesc: 'Kernel allocates physical RAM frame, initiates DMA disk I/O, and loads 4KB block from swap.', badge: 'Disk DMA' },
            { step: 5, label: 'Table Update & Restart', visualDesc: 'PTE updated with RAM frame and Valid bit = 1. Trapped instruction restarts seamlessly.', badge: 'Restart' }
          ]
        },
        complexityAnalysis: {
          time: 'O(1) with TLB hit (~1ns); ~10ms on disk swap Page Fault',
          space: '4 KB per memory page',
          explanation: 'Memory page access is sub-nanosecond on TLB hits but 100,000x slower on disk swap access.'
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Explaining the role of the MMU and TLB.',
            'Listing the Page Fault steps in precise order (Interrupt -> Check valid -> Read disk -> Update PTE -> Restart instruction).',
            'Defining Thrashing and the Working Set concept.'
          ],
          commonMistakes: [
            'Confusing Page Fault (normal virtual memory retrieval) with Segmentation Fault (illegal memory access).'
          ]
        }
      },
      {
        id: 'os-4',
        title: 'Linux Inodes, File Descriptors, Hard Links vs Soft Links',
        category: 'Operating Systems & Linux',
        difficulty: 'Easy',
        companyTags: ['Red Hat', 'Amazon', 'Cisco', 'Cloudflare'],
        questionPrompt: 'What is an Inode in the Linux file system? How do Hard Links and Symbolic (Soft) Links differ under the hood?',
        conceptSummary: 'Explains filesystem metadata, inode reference counters, superblock, and what happens when a file is deleted while still open.',
        detailedAnswer: `1. What is an Inode (Index Node)?
An Inode is a data structure on disk storing metadata about a file:
- File size, permissions (rwx), ownership (UID, GID), timestamps (atime, mtime, ctime).
- Disk block pointers pointing to the actual data blocks.
- Link count (number of directory entries pointing to this inode).
- Crucial Detail: An Inode does NOT store the filename or file contents. Filenames are stored inside Directory data blocks mapped to Inode numbers!

2. Hard Link vs Soft Link:
- Hard Link: A directory entry pointing directly to an existing Inode.
  * Shares the exact same Inode number and physical data blocks.
  * Increments the Inode's link count by 1.
  * If the original file name is deleted (rm), the file data remains intact on disk as long as link count > 0!
  * Cannot cross filesystem boundaries or link directories.
- Soft Link (Symbolic Link / Symlink): A small independent file with its OWN Inode.
  * Contains the text path of the target file.
  * If the target file is moved or deleted, the symlink becomes "dangling / broken".
  * Can cross file systems and link directories.`,
        codeSnippet: {
          language: 'Bash / Linux',
          code: `# Create file and inspect inode
touch file.txt && ls -i file.txt
# Output: 1048576 file.txt

# Create hard link (shares inode 1048576, link count becomes 2)
ln file.txt hardlink.txt

# Create soft link (new inode, points to file.txt path)
ln -s file.txt softlink.txt`
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Stating clearly that filenames are NOT stored in the inode itself.',
            'Explaining the Inode link counter and how deletion works.',
            'Highlighting that Hard links share inodes while Soft links create new pointer inodes.'
          ],
          commonMistakes: [
            'Believing deleting a file immediately wipes data blocks even if hard links or open file descriptors exist.'
          ]
        }
      },
      {
        id: 'os-5',
        title: 'Inter-Process Communication (IPC): Pipes, Shared Memory, Sockets & Semaphores',
        category: 'Operating Systems & Linux',
        difficulty: 'Medium',
        companyTags: ['Google', 'Meta', 'Microsoft', 'Bloomberg'],
        questionPrompt: 'Compare the primary IPC mechanisms in Unix/Linux. Which provides the highest throughput and lowest latency, and what synchronization is required?',
        conceptSummary: 'Performance and synchronization tradeoffs between Shared Memory, Unix Domain Sockets, Message Queues, and Pipes.',
        detailedAnswer: `1. IPC Mechanisms Comparison:
- Anonymous Pipes (pipe): Unidirectional FIFO stream between parent and child processes. Managed in kernel buffer memory (~64KB). Limited to related processes.
- Named Pipes (FIFO): Persists as a special file in filesystem; allows communication between unrelated processes.
- Shared Memory (shmget / mmap):
  * The fastest IPC mechanism. Multiple processes map the same physical RAM frames into their respective virtual address spaces.
  * Zero Kernel Copying: Data does not pass through the OS kernel or intermediate buffers.
  * Requirement: Requires explicit synchronization (e.g. POSIX Mutexes or Semaphores) to prevent race conditions.
- Unix Domain Sockets (UDS):
  * Bidirectional byte stream or datagram socket used for IPC on the same machine.
  * Much faster than TCP loopback sockets (127.0.0.1) because routing, checksumming, and packet framing are bypassed.
- Message Queues (POSIX mq): Kernel-managed queues with priority tagging.`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Identifying Shared Memory as the highest throughput IPC because of zero kernel-space copying.',
            'Emphasizing the necessity of semaphores or spinlocks when using shared memory.',
            'Knowing why Unix Domain Sockets outperform TCP loopback connections.'
          ],
          commonMistakes: [
            'Claiming network sockets are suitable for high-frequency internal single-machine IPC without mentioning overhead.'
          ]
        }
      },
      {
        id: 'dbms-4',
        title: 'Database Sharding, Partitioning (Horizontal vs Vertical) & Consistent Hashing',
        category: 'Database Management Systems',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Google', 'Meta', 'Uber', 'Salesforce'],
        questionPrompt: 'What is the architectural difference between horizontal partitioning, vertical partitioning, and database sharding? How does consistent hashing prevent massive data reshuffling when nodes join or fail?',
        conceptSummary: 'Covers Sharding Keys, Range vs Hash Sharding, Cross-Shard Joins, Hotspotting, and the Consistent Hashing Ring with Virtual Nodes.',
        detailedAnswer: `1. Partitioning vs Sharding:
- Vertical Partitioning: Splitting a single table by columns (e.g., separating wide, rarely accessed text columns like user_bio and avatar_blob into a separate table from frequently queried credentials).
- Horizontal Partitioning: Splitting a table by rows within the SAME database server instance (e.g. Postgres range partitioning orders by order_date).
- Database Sharding: Horizontal partitioning across MULTIPLE autonomous physical database machines or clusters. Each shard holds a disjoint subset of data.

2. Sharding Architectures & Strategies:
- Range-Based Sharding: Shard 1 holds IDs 1..1M, Shard 2 holds 1M..2M.
  * Pros: Easy to query ranges.
  * Cons: Causes severe write hotspots when IDs are auto-incrementing (all new writes flood the newest shard).
- Hash-Based Sharding: Shard ID = Hash(UserID) % N.
  * Pros: Uniform write distribution across nodes.
  * Cons: Adding or removing a database node changes N, requiring rehashing and migrating ~100% of all data across the cluster!

3. Consistent Hashing Solution:
- Treat hash output space as a fixed circle/ring [0, 2^32 - 1].
- Database servers and keys are both hashed onto points on this ring.
- A key is stored on the first server encountered moving clockwise.
- Impact of Scale: When a node is added or removed, ONLY keys between that node and its predecessor (an average of K/N keys) need relocation!
- Virtual Nodes: Each physical machine is mapped to 100-200 virtual points on the ring to balance load uniformly and eliminate hot spots.`,
        visualDiagramAnimation: {
          title: 'Consistent Hashing Ring & Shard Allocation Flow',
          description: 'Step-by-step key routing and minimal re-shuffling on node addition.',
          steps: [
            { step: 1, label: 'Ring Setup', visualDesc: 'Hash ring defined on 360-degree circle [0 to 2^32-1]. Database Nodes A, B, C hashed to positions on perimeter.', badge: 'Circle [0..2^32]' },
            { step: 2, label: 'Key Mapping', visualDesc: 'Incoming key "user_892" hashes to 110 degrees. Moving clockwise, it falls into Node B (located at 140 degrees).', badge: 'Clockwise Route' },
            { step: 3, label: 'Node Addition', visualDesc: 'Node D added at position 90 degrees. Only keys between 45 and 90 degrees relocate to D; Node B and C remain untouched!', badge: 'Minimal Migration' },
            { step: 4, label: 'Virtual Node Balancing', visualDesc: 'Each physical node assigned 150 virtual hash tokens across the ring to prevent unbalanced clusters.', badge: 'Uniform Spread' }
          ]
        },
        codeSnippet: {
          language: 'Python',
          code: `import hashlib
import bisect

class ConsistentHashRing:
    def __init__(self, nodes=None, replicas=3):
        self.replicas = replicas
        self.ring = []
        self.ring_map = {}
        for node in (nodes or []):
            self.add_node(node)

    def _hash(self, key: str) -> int:
        return int(hashlib.md5(key.encode('utf-8')).hexdigest(), 16)

    def add_node(self, node: str):
        for i in range(self.replicas):
            v_key = f"{node}#replica_{i}"
            h = self._hash(v_key)
            bisect.insort(self.ring, h)
            self.ring_map[h] = node

    def get_node(self, key: str) -> str:
        if not self.ring:
            return None
        h = self._hash(key)
        idx = bisect.bisect_right(self.ring, h)
        if idx == len(self.ring):
            idx = 0
        return self.ring_map[self.ring[idx]]`
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Clear distinction between partitioning (same DB) vs sharding (distributed across servers).',
            'Understanding why simple Hash % N fails at scale during cluster resizing.',
            'Explaining how virtual nodes solve the non-uniform distribution problem in consistent hashing.'
          ],
          commonMistakes: [
            'Recommending range sharding on monotonically increasing timestamp or auto-increment IDs.',
            'Overlooking cross-shard JOIN and distributed transaction overhead.'
          ],
          followUpQuestions: [
            'How do you execute a SQL query that spans multiple shards without an index on the sharding key?',
            'What is the rebalancing impact if a shard node suddenly crashes?'
          ]
        }
      },
      {
        id: 'dbms-5',
        title: 'Write-Ahead Logging (WAL) & ARIES Database Crash Recovery',
        category: 'Database Management Systems',
        difficulty: 'Hard',
        companyTags: ['Oracle', 'Microsoft', 'Salesforce', 'Amazon', 'PostgreSQL Core'],
        questionPrompt: 'How do relational databases guarantee the Atomicity and Durability of ACID across unexpected power failures or crashes? Explain Write-Ahead Logging (WAL) and the 3 phases of ARIES recovery.',
        conceptSummary: 'Log Sequence Numbers (LSN), dirty page table, checkpointing, flushing sequential append-only logs before dirty RAM pages, and Analysis-Redo-Undo phases.',
        detailedAnswer: `1. The Core Problem:
Flushing dirty database tables to random disk blocks on every single commit is extremely slow (high random I/O latency). Instead, database engines buffer page modifications in RAM (Buffer Pool). But if power cuts, unwritten RAM modifications are lost!

2. The Write-Ahead Logging (WAL) Rule:
- Before any dirty database table page in RAM is allowed to be flushed to disk, the corresponding log record describing the update MUST first be flushed to the sequential, append-only WAL file on disk.
- Committing a transaction only requires flushing the small sequential WAL record (fsync), NOT writing all heavy 16KB data pages to random disk sectors. Sequential disk append is orders of magnitude faster than random writes.

3. Checkpointing:
- Periodically, the engine flushes all dirty RAM pages to disk and records a "Checkpoint" entry in the WAL log.
- This bounds crash recovery time so the engine does not have to replay logs from the beginning of time.

4. ARIES Crash Recovery (3 Phases):
- Phase 1 - Analysis Phase: Scans WAL forward from the latest checkpoint. Identifies dirty pages in buffer pool and "loser" transactions that were active (uncommitted) at the time of crash.
- Phase 2 - Redo Phase ("Repeating History"): Replays all logged changes forward from the oldest uncheckpointed dirty page. Restores database state to the exact microsecond of the crash.
- Phase 3 - Undo Phase: Scans WAL backwards to rollback and undo all modifications made by "loser" (uncommitted) transactions, writing Compensating Log Records (CLRs) to ensure idempotency if another crash occurs during recovery.`,
        visualDiagramAnimation: {
          title: 'Write-Ahead Log (WAL) Flush & ARIES Crash Recovery',
          description: 'Step-by-step lifecycle from RAM Buffer Pool to sequential WAL and ARIES 3-phase restart.',
          steps: [
            { step: 1, label: 'RAM Modification', visualDesc: 'Transaction modifies row: balance = 500. Buffer pool page in RAM marked DIRTY. Engine assigns LSN #1042.', badge: 'RAM Buffer Pool' },
            { step: 2, label: 'WAL Append & Fsync', visualDesc: 'WAL log record #1042 flushed sequentially to disk. Transaction receives COMMIT OK. Random table disk page remains unwritten in RAM.', badge: 'Append-Only WAL' },
            { step: 3, label: 'Power Failure & Reboot', visualDesc: 'Power cuts. RAM buffer lost. Database boots into ARIES Crash Recovery mode.', badge: 'Crash Event' },
            { step: 4, label: 'Analysis & Redo Replay', visualDesc: 'Phase 1 analyzes active transactions. Phase 2 re-applies LSN #1042 forward, restoring database state to crash instant.', badge: 'ARIES Redo' },
            { step: 5, label: 'Undo Loser Transactions', visualDesc: 'Phase 3 rolls back all uncommitted transactions backwards, guaranteeing ACID Atomicity.', badge: 'ARIES Undo' }
          ]
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Articulating the fundamental WAL invariant: log record must hit disk before dirty data page.',
            'Knowing that sequential append I/O is vastly faster than random disk page writing.',
            'Explaining the 3 distinct phases of ARIES (Analysis, Redo, Undo).'
          ],
          commonMistakes: [
            'Believing databases flush all modified data tables to disk synchronously on every COMMIT.',
            'Assuming redo only applies to committed transactions (ARIES repeats history for ALL transactions first, then undos losers).'
          ],
          followUpQuestions: [
            'What is a Compensating Log Record (CLR) in ARIES and why is it needed if the server crashes during recovery?',
            'How does Group Commit improve WAL performance under heavy concurrent write loads?'
          ]
        }
      },
      {
        id: 'dbms-6',
        title: 'Database Concurrency Control: Two-Phase Locking (2PL), Pessimistic vs Optimistic Locking, & MVCC',
        category: 'Database Management Systems',
        difficulty: 'Medium',
        companyTags: ['Oracle', 'Uber', 'Goldman Sachs', 'Stripe', 'Morgan Stanley'],
        questionPrompt: 'Compare Strict Two-Phase Locking (Strict 2PL), Optimistic Concurrency Control (OCC), and Multi-Version Concurrency Control (MVCC). Why do modern engines like PostgreSQL and MySQL InnoDB use MVCC for high-concurrency workloads?',
        conceptSummary: 'Growing/shrinking lock phases, cascading abort prevention, read-write conflict elimination, snapshot isolation, and vacuuming/purge threads.',
        detailedAnswer: `1. Strict Two-Phase Locking (Strict 2PL):
- Phase 1 (Growing Phase): Transaction acquires Shared (Read) or Exclusive (Write) locks. No locks can be released.
- Phase 2 (Shrinking Phase): All Exclusive locks are held until the very end of transaction (COMMIT or ABORT) before being released simultaneously.
- Benefit: Guarantees Strict Serializability and eliminates cascading aborts.
- Problem: "Readers block Writers, and Writers block Readers". Under high traffic, long-running read queries cause massive transaction backlogs and deadlocks.

2. Optimistic Concurrency Control (OCC):
- Assumes transaction conflicts are rare.
- 3 Phases: Read Phase (read from DB, write locally to private workspace) -> Validation Phase (check if data was modified by concurrent transaction) -> Write Phase (commit if valid, abort and retry if conflict).
- Best For: Read-heavy workloads with very low write collision probability.

3. Multi-Version Concurrency Control (MVCC):
- The modern industry gold standard (PostgreSQL, MySQL InnoDB, CockroachDB).
- Core Principle: "Readers never block Writers, and Writers never block Readers!"
- How it works:
  * When a row is modified or deleted, the old version is NOT overwritten in place. Instead, a new version of the row is created with transaction visibility timestamps (xmin, xmax in Postgres; DB_TRX_ID, DB_ROLL_PTR in MySQL).
  * Read transactions read from an immutable consistent snapshot of the database taken at the start of their query or transaction.
  * Writes create newer versions without hindering read queries that are inspecting older versions.
- Housekeeping: Requires background cleanup (PostgreSQL VACUUM or InnoDB Purge Threads) to reclaim disk space from obsolete row versions (dead tuples).`,
        codeSnippet: {
          language: 'SQL',
          code: `-- 1. Pessimistic Locking (Strict row-level lock)
BEGIN;
SELECT balance FROM accounts WHERE id = 101 FOR UPDATE; -- Blocks other writers
UPDATE accounts SET balance = balance - 100 WHERE id = 101;
COMMIT;

-- 2. Optimistic Locking (Application version check)
-- Read: SELECT id, balance, version FROM accounts WHERE id = 101; (version is 5)
-- Update with conditional version check:
UPDATE accounts 
SET balance = balance - 100, version = version + 1 
WHERE id = 101 AND version = 5;
-- If rows_affected == 0, conflict detected! Application retries.`
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Clear statement that MVCC eliminates reader-writer blocking.',
            'Explaining how snapshot isolation works using row versioning.',
            'Mentioning PostgreSQL VACUUM or InnoDB undo purge mechanics for dead tuples.'
          ],
          commonMistakes: [
            'Believing MVCC eliminates all locks (write-write conflicts still require row-level exclusive locks).'
          ],
          followUpQuestions: [
            'What is the difference between Read Committed and Repeatable Read isolation levels in an MVCC database?',
            'What is write skew anomaly and does Repeatable Read prevent it?'
          ]
        }
      },
      {
        id: 'os-6',
        title: 'CPU Scheduling Algorithms: Round Robin, Preemptive Priority, Multilevel Feedback Queue (MLFQ) & CFS',
        category: 'Operating Systems & Linux',
        difficulty: 'Medium',
        companyTags: ['Microsoft', 'Intel', 'AMD', 'Amazon', 'Qualcomm'],
        questionPrompt: 'How do modern operating systems balance responsiveness for interactive processes and throughput for background batch jobs? Explain Round Robin time slicing, Multilevel Feedback Queue (MLFQ), and Linux Completely Fair Scheduler (CFS).',
        conceptSummary: 'Time quantum selection tradeoffs (context switch overhead vs latency), MLFQ priority boosting to prevent starvation, and CFS red-black tree with virtual runtime (vruntime).',
        detailedAnswer: `1. Core Scheduling Trade-Offs:
- Turnaround Time: Time from process arrival to process completion.
- Response Time: Time from arrival to first execution (crucial for interactive apps like text editors and UIs).
- Context Switching Cost: If time quantum is too small (e.g. 1ms), CPU spends 20% of its time switching register states and flushing TLBs. If too large (e.g. 100ms), system feels sluggish and non-responsive.

2. Multilevel Feedback Queue (MLFQ):
- Designed to learn process behavior dynamically without requiring future knowledge of CPU burst times.
- Rules:
  * Rule 1: Priority(A) > Priority(B) -> Process A runs.
  * Rule 2: Priority(A) == Priority(B) -> Processes run in Round Robin.
  * Rule 3: When a job enters system, it is placed at highest priority queue.
  * Rule 4 (Demotion): If a job uses up its entire time slice without yielding (CPU-bound batch process), its priority is reduced by 1 level. If it yields early (I/O-bound interactive process), it stays in top queue.
  * Rule 5 (Starvation Prevention / Priority Boost): After periodic time period S, all jobs are moved back to topmost queue!

3. Linux Completely Fair Scheduler (CFS):
- Replaced traditional O(1) scheduler in Linux kernel.
- Instead of fixed priority arrays, CFS tracks 'vruntime' (virtual runtime) for every process.
- Processes are indexed in a self-balancing Red-Black Tree where the leftmost node has the smallest vruntime.
- The CPU always picks the leftmost process (the one that has received the least CPU time).
- Higher priority (nicer) processes advance their vruntime slower, naturally receiving proportionally more CPU time while maintaining mathematical fairness.`,
        visualDiagramAnimation: {
          title: 'Multilevel Feedback Queue (MLFQ) Scheduling Pipeline',
          description: 'How processes demote on CPU consumption and boost periodically to prevent starvation.',
          steps: [
            { step: 1, label: 'Process Ingestion', visualDesc: 'New process enters Queue 0 (Highest Priority, small 8ms quantum) for rapid initial response.', badge: 'Queue 0 (8ms)' },
            { step: 2, label: 'I/O Bound Preservation', visualDesc: 'Interactive GUI process reads keystroke and yields CPU after 2ms. Remains in top Queue 0.', badge: 'Interactive Fast-Path' },
            { step: 3, label: 'CPU Bound Demotion', visualDesc: 'Number crunching thread consumes full 8ms quantum without yielding. OS demotes it to Queue 1 (16ms quantum).', badge: 'Queue 1 Demote' },
            { step: 4, label: 'Periodic Priority Boost', visualDesc: 'Every 500ms, OS boosts ALL processes back to Queue 0 to guarantee background jobs never starve.', badge: 'Anti-Starvation Boost' }
          ]
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Explaining the tradeoff between small time quantums (high context switch overhead) and large quantums (poor latency).',
            'Describing the dynamic priority adjustment in MLFQ based on I/O yield behavior.',
            'Highlighting Linux CFS use of virtual runtime ("vruntime") and Red-Black tree lookup.'
          ],
          commonMistakes: [
            'Stating Shortest Job First (SJF) can be implemented directly in practice (OS cannot predict future burst length).'
          ],
          followUpQuestions: [
            'How does Linux CFS handle multi-core processor affinity and NUMA memory nodes?',
            'What is the computational complexity of picking the next task in CFS?'
          ]
        }
      },
      {
        id: 'os-7',
        title: 'Mutex vs Counting Semaphore vs Spinlock & The Classic Producer-Consumer Problem',
        category: 'Operating Systems & Linux',
        difficulty: 'Medium',
        companyTags: ['Google', 'Meta', 'Amazon', 'Apple', 'NVIDIA'],
        questionPrompt: 'What is the fundamental difference between a Mutex, a Counting Semaphore, and a Spinlock? When should you use a spinlock instead of a sleeping mutex, and how do you solve the Producer-Consumer problem?',
        conceptSummary: 'Ownership semantics (mutex locked/unlocked strictly by same thread; semaphore signaling cross-thread), busy-waiting on multi-core vs sleeping/context switching overhead, and condition variables.',
        detailedAnswer: `1. Mutex vs Semaphore vs Spinlock:
- Mutex (Mutual Exclusion Lock):
  * Binary locking mechanism with STRICT OWNERSHIP: The thread that locks the mutex MUST be the thread that unlocks it.
  * Sleeping Lock: When a thread fails to acquire a mutex, the OS puts the thread to SLEEP (blocked state) and context-switches to another runnable thread.
- Counting Semaphore:
  * Signaling mechanism that maintains an integer counter. No ownership concept! Any thread can signal (sem_post / V) to wake up waiting threads (sem_wait / P).
  * Used for resource pooling (e.g. max 10 concurrent database connections).
- Spinlock:
  * Busy-waiting lock: Repeatedly tests atomic CPU instruction (e.g. test-and-set or compare-and-swap) in a tight loop without sleeping.
  * When to use: ONLY on multi-core SMP systems when the critical section is guaranteed to execute faster than the time it takes the OS to perform TWO context switches (~2-5 microseconds). Commonly used inside kernel interrupt handlers where sleeping is strictly prohibited!

2. Producer-Consumer Solution (Bounded Buffer):
- Requirements:
  * Producers must wait when the buffer is FULL.
  * Consumers must wait when the buffer is EMPTY.
  * Access to the shared queue must be protected by a Mutex.`,
        codeSnippet: {
          language: 'C++11',
          code: `#include <iostream>
#include <queue>
#include <thread>
#include <mutex>
#include <condition_variable>

class BoundedBuffer {
private:
    std::queue<int> queue;
    size_t capacity;
    std::mutex mtx;
    std::condition_variable not_full;
    std::condition_variable not_empty;

public:
    BoundedBuffer(size_t cap) : capacity(cap) {}

    void produce(int item) {
        std::unique_lock<std::mutex> lock(mtx);
        // Spurious wakeup protection with lambda predicate
        not_full.wait(lock, [this]() { return queue.size() < capacity; });
        queue.push(item);
        lock.unlock();
        not_empty.notify_one();
    }

    int consume() {
        std::unique_lock<std::mutex> lock(mtx);
        not_empty.wait(lock, [this]() { return !queue.empty(); });
        int item = queue.front();
        queue.pop();
        lock.unlock();
        not_full.notify_one();
        return item;
    }
};`
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Emphasizing that a Mutex has ownership while a Semaphore is a signaling mechanism without ownership.',
            'Explaining why spinlocks should never be used on single-core CPUs (causes deadlocks if holding thread is preempted).',
            'Using a while loop or lambda condition with condition_variable.wait to guard against spurious wakeups.'
          ],
          commonMistakes: [
            'Using an "if" condition instead of "while" condition around condition variable wait (vulnerable to spurious wakeups).',
            'Calling sleep inside a spinlock or calling blocking locks inside an interrupt service routine (ISR).'
          ],
          followUpQuestions: [
            'What is Priority Inversion and how does Priority Inheritance Protocol resolve it?',
            'What is the difference between notify_one() and notify_all()?'
          ]
        }
      },
      {
        id: 'os-8',
        title: 'System Calls Lifecycle: User Mode (Ring 3) vs Kernel Mode (Ring 0), Traps, Context Switch & PCB',
        category: 'Operating Systems & Linux',
        difficulty: 'Hard',
        companyTags: ['Google', 'Microsoft', 'Red Hat', 'Apple', 'AMD'],
        questionPrompt: 'Trace what happens at the hardware and CPU register level when a user program invokes a system call like read() or write(). Explain hardware privilege levels (Ring 3 vs Ring 0), interrupt descriptor table (IDT), and Process Control Block (PCB).',
        conceptSummary: 'CPU privilege mode bit flip, saving user register state on the kernel stack, trap vectors, executing kernel handler, security validation, and restoring user context.',
        detailedAnswer: `1. CPU Privilege Rings:
- x86-64 CPUs implement 4 privilege rings (Ring 0 to Ring 3). Modern operating systems use two:
  * Ring 3 (User Mode): Restricted access. Direct hardware I/O instructions (like in/out, cli) and direct page table manipulation are forbidden.
  * Ring 0 (Kernel Mode): Full unrestricted access to CPU instructions, physical memory, and peripheral hardware.

2. Complete Step-by-Step System Call Lifecycle:
- Step 1 - Invocation & Wrapper: User program calls library function (e.g. read(fd, buf, count) in glibc). Wrapper puts system call number (SYS_read = 0 on x86_64) into register %rax and arguments into %rdi, %rsi, %rdx.
- Step 2 - Trap / Software Interrupt: Wrapper executes the CPU instruction 'syscall' (or historic 'int 0x80').
- Step 3 - Hardware Privilege Transition:
  * CPU automatically switches execution mode from Ring 3 to Ring 0.
  * CPU switches stack pointer from User Stack to the Process Kernel Stack.
  * CPU saves user-space Instruction Pointer (%rip), Stack Pointer (%rsp), and Flags (%rflags).
- Step 4 - Interrupt Descriptor Table (IDT) & Dispatch: CPU jumps to the kernel's registered syscall entrypoint ('entry_SYSCALL_64'). The kernel indexes the system call dispatch table ('sys_call_table') using the number in %rax.
- Step 5 - Kernel Execution & Safety Check: The kernel function ('sys_read') executes. It validates that user-provided buffer pointer is in valid user memory space and readable.
- Step 6 - Return to User Mode: The kernel places return value (bytes read or -1 error code) in %rax and executes 'sysretq'. CPU restores saved user registers, resets privilege to Ring 3, and resumes user code execution seamlessly!`,
        visualDiagramAnimation: {
          title: 'System Call Trap & Kernel Transition Flow',
          description: 'Hardware privilege transition from User Ring 3 to Kernel Ring 0 and return.',
          steps: [
            { step: 1, label: 'User Mode Call', visualDesc: 'App invokes read(fd, buffer, 1024). glibc places syscall number into register %rax.', badge: 'User Ring 3' },
            { step: 2, label: 'Hardware Trap Gate', visualDesc: 'CPU executes SYSCALL instruction. Hardware switches CPU privilege bit from Ring 3 to Ring 0.', badge: 'Ring 3 -> Ring 0' },
            { step: 3, label: 'Register State Save', visualDesc: 'Kernel saves user %rip, %rsp, and general registers onto the thread Kernel Stack.', badge: 'Kernel Stack' },
            { step: 4, label: 'Kernel Dispatch', visualDesc: 'Kernel indexes sys_call_table[%rax] and executes device driver / filesystem read handler.', badge: 'sys_call_table' },
            { step: 5, label: 'SYSRETQ Return', visualDesc: 'CPU restores user registers from kernel stack, flips privilege bit back to Ring 3, resumes app.', badge: 'Resume Ring 3' }
          ]
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Articulating why dual-mode operation exists (hardware memory and execution protection).',
            'Explaining the role of the CPU switching to the process Kernel Stack.',
            'Understanding why system calls have measurable latency compared to regular function calls (privilege switch, cache pollution, register copying).'
          ],
          commonMistakes: [
            'Assuming regular function calls switch the CPU to Ring 0.',
            'Thinking the kernel stack is shared across all running processes (each thread has its own kernel stack).'
          ],
          followUpQuestions: [
            'What is vDSO (Virtual Dynamic Shared Object) in Linux and how does it optimize calls like gettimeofday()?',
            'What happens if a user process passes an invalid kernel pointer as an argument to write()?'
          ]
        }
      }

    ]
  },

  // =========================================================================
  // 7. COMPUTER NETWORKS & DISTRIBUTED SYSTEMS (8 CSE PLACEMENT ITEMS)
  // =========================================================================
  {
    id: 'computer-networks-system-design',
    title: 'Computer Networks & Distributed Systems',
    subtitle: 'TCP/IP, HTTP/3, WebSockets, DNS & Microservices Architecture',
    badge: 'High-Yield Networking',
    iconName: 'Network',
    gradient: 'from-sky-600 to-indigo-700',
    description: 'Master the OSI model, low-latency transport protocols, distributed caching, and microservices patterns required for modern engineering roles.',
    importanceRating: 'Essential for Backend, Full-Stack & SRE Roles',
    items: [
      {
        id: 'net-1',
        title: 'TCP 3-Way Handshake, 4-Way Teardown & Why TIME_WAIT is Necessary',
        category: 'Computer Networks',
        difficulty: 'Medium',
        companyTags: ['Cisco', 'Amazon', 'Cloudflare', 'Google'],
        questionPrompt: 'Detail the packet flow of the TCP 3-Way Handshake and 4-Way Teardown with sequence numbers. Why is the 2MSL TIME_WAIT state essential on connection close?',
        conceptSummary: 'SYN, SYN-ACK, ACK, FIN flags, initial sequence number (ISN) synchronization, delayed duplicate packets, and socket reuse prevention.',
        detailedAnswer: `1. TCP 3-Way Handshake (Connection Establishment):
- Step 1 (SYN): Client picks a random Initial Sequence Number (ISN_c = X) and sends SYN packet to Server. (Client state: SYN_SENT).
- Step 2 (SYN-ACK): Server receives SYN, allocates socket buffers, picks ISN_s = Y, sets ACK = X + 1, and sends SYN-ACK. (Server state: SYN_RCVD).
- Step 3 (ACK): Client receives SYN-ACK, sets ACK = Y + 1, and returns ACK. (Both states: ESTABLISHED). Data transmission can now begin.

2. TCP 4-Way Teardown (Connection Termination):
- Step 1 (FIN from A): Process closes socket. Client A sends FIN (seq = U). (State: FIN_WAIT_1).
- Step 2 (ACK from B): Server B acknowledges with ACK = U + 1. (Server B state: CLOSE_WAIT; Client A state: FIN_WAIT_2). Server B can still send remaining data!
- Step 3 (FIN from B): Server B finishes writing data and sends its own FIN (seq = V). (Server B state: LAST_ACK).
- Step 4 (ACK from A): Client A responds with ACK = V + 1. (Server B enters CLOSED; Client A enters TIME_WAIT).

3. Why TIME_WAIT (2MSL = 2 * Maximum Segment Lifetime ≈ 60s) is Essential:
- Reason 1: Ensure ACK Reliability. If Client A's final ACK packet is dropped by the network, Server B will retransmit its FIN. If Client A had closed immediately, it would return an RST error instead of ACK, leaving Server B uncleanly terminated.
- Reason 2: Prevent Old Duplicate Packets from Corrupting New Connections. Packets delayed in internet routers cannot reappear and be misinterpreted by a new incarnation of the same IP:port socket pair.`,
        visualDiagramAnimation: {
          title: 'TCP 3-Way Handshake & Teardown State Transition Flow',
          description: 'Step-by-step socket lifecycle from initial SYN to 2MSL TIME_WAIT.',
          steps: [
            { step: 1, label: 'Client SYN (Seq=X)', visualDesc: 'Client chooses random ISN X, sends SYN packet to target port. State -> SYN_SENT.', badge: 'SYN' },
            { step: 2, label: 'Server SYN-ACK (Seq=Y, Ack=X+1)', visualDesc: 'Server allocates buffer, picks ISN Y, sends SYN-ACK. State -> SYN_RCVD.', badge: 'SYN-ACK' },
            { step: 3, label: 'Client ACK (Ack=Y+1)', visualDesc: 'Client acknowledges server sequence number. Connection established on both sides.', badge: 'ESTABLISHED' },
            { step: 4, label: 'Client FIN Teardown', visualDesc: 'Client initiates shutdown: transmits FIN packet. Server responds with ACK.', badge: 'FIN_WAIT' },
            { step: 5, label: '2MSL TIME_WAIT Guard', visualDesc: 'Client enters TIME_WAIT for 60s to absorb stray internet duplicates before closing.', badge: 'TIME_WAIT' }
          ]
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Accurate sequence number increment logic (X -> X+1).',
            'Explaining both reasons for TIME_WAIT without being prompted.',
            'Recognizing SYN Flood attacks and SYN Cookie mitigation.'
          ],
          commonMistakes: [
            'Thinking connection teardown is always 3 steps like the handshake (it requires 4 because TCP is full-duplex).'
          ]
        }
      },
      {
        id: 'net-2',
        title: 'OSI 7-Layer Model vs TCP/IP 4-Layer Stack & Packet Encapsulation',
        category: 'Computer Networks',
        difficulty: 'Easy',
        companyTags: ['Cisco', 'Juniper', 'TCS Digital', 'Infosys'],
        questionPrompt: 'Map the 7 OSI layers to the 4 TCP/IP layers. Explain the packet encapsulation lifecycle with PDUs (Data, Segment, Packet, Frame, Bits).',
        conceptSummary: 'Protocol Data Units (PDUs), headers, MAC address vs IP address vs Port number, and hardware devices (Switch vs Router).',
        detailedAnswer: `1. OSI 7 Layers vs TCP/IP 4 Layers:
- OSI 7 (Application, Presentation, Session) -> TCP/IP: Application Layer (HTTP, DNS, SSH, TLS). PDU = Data/Payload.
- OSI 4 (Transport) -> TCP/IP: Transport Layer (TCP, UDP). PDU = Segment (contains Source & Destination Ports, Sequence Numbers).
- OSI 3 (Network) -> TCP/IP: Internet / Network Layer (IPv4, IPv6, ICMP). PDU = Packet (contains Source & Destination IP Addresses). Handled by Routers.
- OSI 2 (Data Link) -> TCP/IP: Network Access Layer (Ethernet, Wi-Fi 802.11, ARP). PDU = Frame (contains Source & Destination MAC Addresses). Handled by Switches.
- OSI 1 (Physical) -> TCP/IP: Physical Layer (Fiber, Copper, Radio waves). PDU = Bits. Handled by Hubs / Cables.

2. Encapsulation Flow (Sender to Receiver):
- Application generates payload (HTTP JSON).
- Transport adds TCP header with Port 443 -> becomes a Segment.
- Network adds IP header with target server IP -> becomes a Packet.
- Data Link adds Ethernet header with gateway MAC address & CRC checksum -> becomes a Frame.
- Physical transmits electrical/optical bits across wire.
- Receiver performs Decapsulation in reverse order!`,
        visualDiagramAnimation: {
          title: 'Packet Encapsulation & Decapsulation Flow',
          description: 'Step-by-step encapsulation down the network protocol stack.',
          steps: [
            { step: 1, label: 'Application Data', visualDesc: 'Browser constructs HTTP/2 payload: GET /index.html with user auth tokens.', badge: 'Layer 7' },
            { step: 2, label: 'Transport Segment', visualDesc: 'TCP header prepended with Source Port (52341) and Dest Port (443).', badge: 'Layer 4 (TCP)' },
            { step: 3, label: 'Network Packet', visualDesc: 'IP header added with Source IP (192.168.1.10) and Dest IP (142.250.190.46).', badge: 'Layer 3 (IP)' },
            { step: 4, label: 'Data Link Frame', visualDesc: 'Ethernet header added with Gateway Router MAC and CRC trailing checksum.', badge: 'Layer 2 (MAC)' },
            { step: 5, label: 'Physical Bitstream', visualDesc: 'Modulated into optical photons/electrical voltages transmitted across fiber.', badge: 'Layer 1 (Bits)' }
          ]
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Using correct PDU terms (Segment, Packet, Frame) for each layer.',
            'Distinguishing Port (Process) vs IP (Host) vs MAC (Local Network Interface).',
            'Explaining how switches operate at Layer 2 while routers operate at Layer 3.'
          ],
          commonMistakes: [
            'Calling an IP datagram a "frame" or a TCP chunk a "packet".'
          ]
        }
      },
      {
        id: 'net-3',
        title: 'Complete DNS Resolution Lifecycle: Root, TLD, and Authoritative Nameservers',
        category: 'Computer Networks',
        difficulty: 'Medium',
        companyTags: ['Cloudflare', 'Google', 'Akamai', 'Amazon'],
        questionPrompt: 'Explain what happens during a DNS lookup for "api.github.com". Differentiate between Recursive and Iterative DNS queries, and describe DNS record types.',
        conceptSummary: 'Recursive Resolver, Root DNS (13 IP clusters), TLD (.com), Authoritative NS, DNS caching, TTL, and records (A, AAAA, CNAME, MX, TXT).',
        detailedAnswer: `1. DNS Hierarchy & Resolution Steps:
- Client Cache: Browser and OS check local DNS cache and /etc/hosts.
- Recursive Resolver (e.g. ISP or Cloudflare 1.1.1.1): Client issues a RECURSIVE query ("Give me the answer or fail"). The Resolver now makes ITERATIVE queries ("I don't know the answer, but ask this server next"):
  * Step 1: Resolver queries Root Nameserver (.) -> Root returns IP of .com TLD Nameserver.
  * Step 2: Resolver queries .com TLD Nameserver -> TLD returns Authoritative Nameserver for github.com (e.g., ns1.p16.dynect.net).
  * Step 3: Resolver queries GitHub's Authoritative Nameserver -> It looks up "api.github.com" and returns the A record (IPv4 address e.g. 140.82.121.6) along with a TTL (Time to Live).
- Resolver caches the IP and returns it to the client browser.

2. Primary DNS Record Types:
- A: Maps hostname to IPv4 address.
- AAAA: Maps hostname to 128-bit IPv6 address.
- CNAME (Canonical Name): Alias pointing one domain name to another domain name.
- MX: Mail exchange server for the domain.
- TXT: Arbitrary text, widely used for SPF, DKIM, and domain ownership verification.`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Distinguishing Recursive query (Client to Resolver) from Iterative queries (Resolver to Root/TLD/Auth).',
            'Explaining why Root nameservers do not hold individual domain IPs.',
            'Knowing common DNS record types (A, CNAME, TXT).'
          ],
          commonMistakes: [
            'Thinking DNS uses TCP by default (it uses UDP Port 53 for speed, falling back to TCP for zone transfers or responses > 512 bytes).'
          ]
        }
      },
      {
        id: 'net-4',
        title: 'HTTP/1.1 vs HTTP/2 Multiplexing vs HTTP/3 QUIC (UDP)',
        category: 'Computer Networks',
        difficulty: 'Hard',
        companyTags: ['Google', 'Cloudflare', 'Meta', 'Netflix'],
        questionPrompt: 'How did HTTP/2 solve HTTP/1.1 Head-of-Line (HoL) blocking, and why did TCP itself become the bottleneck that motivated HTTP/3 over QUIC/UDP?',
        conceptSummary: 'Persistent connections, domain sharding, binary framing, multiplexed streams, TCP HoL blocking, and UDP-based QUIC with 0-RTT handshakes.',
        detailedAnswer: `1. HTTP/1.1 Limitations:
- Pipelining was fragile and rarely enabled. Only one active request/response per TCP connection at a time.
- Head-of-Line (HoL) Blocking at Application Layer: If a large image request takes 2 seconds, all subsequent CSS and JS requests on that connection are blocked behind it.
- Workaround: Browsers opened 6 parallel TCP connections per domain and used "Domain Sharding" (assets1.cdn, assets2.cdn).

2. HTTP/2 Breakthrough:
- Binary Framing Layer: Replaced plain text headers with binary frames.
- Multiplexing: Multiple independent bi-directional request/response streams interleaved simultaneously over a SINGLE TCP connection! No application-level HoL blocking.
- HPACK Header Compression and Server Push.

3. The Hidden Problem with HTTP/2 (Transport HoL Blocking):
- HTTP/2 uses standard TCP. If a single packet is lost in transit, TCP halts ALL multiplexed streams until that lost segment is retransmitted and acknowledged! One dropped packet stalls 50 web streams.

4. HTTP/3 with QUIC (Built on UDP):
- Replaces TCP with QUIC (Quick UDP Internet Connections) in user space.
- Independent Streams over UDP: A dropped packet on Stream 3 does NOT stall Stream 1 or Stream 2! True zero Head-of-Line blocking.
- Integrated TLS 1.3: Combines transport and cryptographic handshakes into a 1-RTT (or 0-RTT for returning clients) connection!
- Connection Migration: Uses Connection IDs instead of IP:Port tuples, so your download doesn't drop when switching from Wi-Fi to cellular.`,
        visualDiagramAnimation: {
          title: 'Evolution from HTTP/1.1 to Multiplexed HTTP/3 QUIC',
          description: 'Architectural comparison of stream transmission and packet drop handling.',
          steps: [
            { step: 1, label: 'HTTP/1.1 Serial Pipeline', visualDesc: 'Request 1 blocks Request 2 on same socket. 6 parallel TCP connections opened to compensate.', badge: 'HTTP/1.1' },
            { step: 2, label: 'HTTP/2 Binary Multiplexing', visualDesc: 'Single TCP connection interleaves streams A, B, C into binary frames simultaneously.', badge: 'HTTP/2' },
            { step: 3, label: 'TCP Transport HoL Bottleneck', visualDesc: 'Packet dropped on Stream B. OS TCP buffer stalls Streams A and C until packet is retransmitted.', badge: 'TCP Stalled' },
            { step: 4, label: 'HTTP/3 QUIC over UDP', visualDesc: 'Streams independent at UDP packet layer. Dropped packet on Stream B leaves Streams A & C completely unaffected!', badge: 'HTTP/3 QUIC' }
          ]
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Explaining the exact difference between Application-level HoL blocking and Transport-level TCP HoL blocking.',
            'Understanding why HTTP/3 chose UDP as the base layer.',
            'Mentioning Connection Migration and 0-RTT handshakes.'
          ],
          commonMistakes: [
            'Saying HTTP/3 is "unreliable" because it runs on UDP (QUIC implements its own reliable congestion control and retransmissions on top of UDP).'
          ]
        }
      },
      {
        id: 'net-5',
        title: 'CAP Theorem, PACELC, and Eventual Consistency in Distributed Systems',
        category: 'Full-Stack System Design',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Google', 'Meta', 'Netflix'],
        questionPrompt: 'State the CAP Theorem and explain why "CA" systems do not exist in distributed networks. How does the PACELC theorem provide a more comprehensive production model?',
        conceptSummary: 'Consistency (Linearizability), Availability, Partition Tolerance, latency trade-offs in normal operation (PACELC), and eventual consistency patterns.',
        detailedAnswer: `1. The CAP Theorem:
In a distributed asynchronous network, you can guarantee at most TWO of the following three properties:
- Consistency (C): Every read receives the most recent write or an error (linearizability).
- Availability (A): Every non-failing node returns a non-error response, without guarantee that it contains the most recent write.
- Partition Tolerance (P): The system continues to operate despite arbitrary packet drops or network splits between nodes.

2. Why "CA" is a Myth in Distributed Systems:
Network partitions (P) are physical facts of life: routers fail, fiber cables get cut, GC pauses simulate network dead zones. When a network splits:
- If you choose Consistency (CP): Nodes in minority partitions must reject writes to avoid split-brain inconsistency (sacrificing Availability).
- If you choose Availability (AP): Nodes continue accepting writes locally, causing data divergence across partitions (sacrificing Consistency).

3. PACELC Theorem (The Modern Extension):
CAP only describes behavior during a rare Network Partition (P). What about normal operation?
PACELC states:
- If there is a Partition (P), choose Availability (A) or Consistency (C);
- ELSE (E), choose Latency (L) or Consistency (C).
- Example: DynamoDB / Cassandra are PA/EL (prioritize availability during partition, low latency during normal state). MongoDB is PC/EC (prioritizes consistency in both states).`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Emphasizing that Partition Tolerance is non-negotiable in distributed networks.',
            'Explaining PACELC and the latency vs consistency tradeoff in normal healthy network conditions.',
            'Citing concrete database architectures (Cassandra vs MongoDB vs Spanner).'
          ],
          commonMistakes: [
            'Believing you can build a distributed "CA" database that works across data centers.'
          ]
        }
      },
      {
        id: 'net-6',
        title: 'WebSockets vs Server-Sent Events (SSE) vs Long Polling for Real-Time Apps',
        category: 'Full-Stack System Design',
        difficulty: 'Medium',
        companyTags: ['Uber', 'Slack', 'Discord', 'Stripe'],
        questionPrompt: 'Compare WebSockets, Server-Sent Events (SSE), and Short/Long Polling. How would you choose between them for a Live Chat app vs a Stock Price Tracker vs an AI Streaming LLM?',
        conceptSummary: 'Full-duplex bidirectional TCP vs unidirectional HTTP text streams, connection establishment, HTTP/2 multiplexing support, and firewall traversal.',
        detailedAnswer: `1. Protocol Comparison:
- Short Polling: Client periodically sends HTTP requests (e.g. every 2s). High overhead, redundant HTTP headers, massive server QPS.
- Long Polling: Client opens HTTP request; server holds connection open until new data arrives or timeout. Still incurs full HTTP handshake per message batch.
- Server-Sent Events (SSE):
  * Unidirectional (Server -> Client) continuous text stream over standard HTTP (Content-Type: text/event-stream).
  * Built-in browser reconnection, event IDs, and native HTTP/2 multiplexing.
  * Lightweight, traverses corporate firewalls/proxies without special protocol upgrades.
- WebSockets:
  * Full-Duplex Bi-directional persistent TCP socket (ws:// or wss://).
  * Starts with HTTP 101 Switching Protocols upgrade, then shifts to minimal 2-byte framing.
  * Ideal for high-frequency client-to-server messaging.

2. Production Selection Guide:
- AI Streaming Response (ChatGPT / Gemini): Choose SSE! Unidirectional stream from LLM server to browser, native reconnection, works over HTTP/2.
- Stock Price / Crypto Ticker: Choose SSE! High-frequency server broadcast to client; client rarely sends updates.
- Real-Time Multiplayer Game / Discord Voice & Chat: Choose WebSockets! Both client and server must exchange low-latency bidirectional payloads continuously.`,
        codeSnippet: {
          language: 'TypeScript / Node.js',
          code: `// Server-Sent Events (SSE) Express Handler
app.get('/api/stream-ai', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (data: string) => {
    res.write(\'data: \${JSON.stringify({ text: data })}\\n\\n\');
  };

  // Stream tokens as LLM generates
  sendEvent('Hello ');
  sendEvent('world!');
  res.end();
});`
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Highlighting that SSE is unidirectional over standard HTTP while WebSockets is full-duplex TCP.',
            'Correctly choosing SSE for LLM streaming and WebSockets for chat/gaming.',
            'Mentioning that SSE naturally multiplexes over HTTP/2 without socket exhaustion.'
          ],
          commonMistakes: [
            'Using WebSockets reflexively for every real-time feature even when communication is strictly unidirectional.'
          ]
        }
      },
      {
        id: 'net-7',
        title: 'Distributed Message Queues: Apache Kafka vs RabbitMQ Architecture',
        category: 'Full-Stack System Design',
        difficulty: 'Hard',
        companyTags: ['LinkedIn', 'Uber', 'Netflix', 'Amazon'],
        questionPrompt: 'Compare Apache Kafka (Append-Only Log) and RabbitMQ (AMQP Message Broker). What are the trade-offs regarding message ordering, persistence, and consumer scaling?',
        conceptSummary: 'Log-based streaming vs Smart Broker / Dumb Consumer, partitioning and consumer groups, push vs pull model, and replayability.',
        detailedAnswer: `1. Fundamental Architecture Differences:
- RabbitMQ (Smart Broker, Dumb Consumer):
  * Traditional message broker implementing AMQP. Messages route through Exchanges into FIFO Queues.
  * Messages are DELETED immediately after consumer acknowledgment.
  * Broker tracks consumer state and pushes messages to consumers.
  * Strengths: Complex routing (topic, fanout, direct), per-message acknowledgments, priority queues.
- Apache Kafka (Dumb Broker, Smart Consumer):
  * Distributed, partitioned, append-only commit log on disk.
  * Messages are PERSISTED on disk regardless of consumption and retained by time (e.g. 7 days).
  * Consumer tracks its own reading position via an "Offset".
  * Pull Model: Consumers pull batches at their own pace.
  * Replayability: A consumer can reset its offset to 0 and re-process historical events!
  * Throughput: Sequential disk writes + OS Page Cache + zero-copy (sendfile) allows millions of writes/sec.

2. Partitioning & Strict Ordering:
- Kafka guarantees strict message ordering within a single PARTITION.
- To maintain order for user events, Kafka uses the user_id as the message Partition Key, hashing all events for that user into the exact same partition log.`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Explaining Kafka as an append-only log with consumer offsets vs RabbitMQ as a transient FIFO queue.',
            'Highlighting message replayability in Kafka.',
            'Explaining how Kafka achieves ordering via partition keys.'
          ],
          commonMistakes: [
            'Claiming Kafka guarantees global ordering across all partitions (ordering is only guaranteed per partition).'
          ]
        }
      },
      {
        id: 'net-8',
        title: 'API Gateway, Service Mesh & Circuit Breaker Pattern (Resilience4j / Istio)',
        category: 'Full-Stack System Design',
        difficulty: 'Medium',
        companyTags: ['Netflix', 'Amazon', 'Uber', 'Microsoft'],
        questionPrompt: 'How do you prevent cascading failures in a microservices ecosystem? Explain the Circuit Breaker states (Closed, Open, Half-Open) and the role of an API Gateway vs Service Mesh.',
        conceptSummary: 'Cascading failures, thread pool exhaustion, circuit breaker state machine, sidecar proxy pattern (Envoy / Istio), and reverse proxying.',
        detailedAnswer: `1. The Cascading Failure Problem:
If Service A synchronously calls Service B, and Service B begins timing out (e.g., database lock contention), Service A's worker threads block waiting for responses. Soon, Service A exhausts its entire thread pool and crashes, cascading up to the API gateway and bringing down the entire platform.

2. Circuit Breaker Pattern (Michael Nygard):
A state machine wrapping external synchronous calls:
- Closed State: Normal operation. Requests pass through to downstream service. Failure counter is monitored.
- Open State: If failure rate exceeds threshold (e.g. 50% errors over 20 requests), circuit trips OPEN immediately! Subsequent calls fail-fast instantly without calling downstream service, returning a fallback response (cached data or friendly error). This gives downstream service time to recover!
- Half-Open State: After a cooldown sleep period (e.g. 15s), circuit enters Half-Open. It allows a limited probe batch (e.g. 5 trial requests). If all succeed -> Reset to CLOSED. If any fail -> Trip back to OPEN.

3. API Gateway vs Service Mesh:
- API Gateway (North-South Traffic): Handles traffic entering the cluster from clients (SSL termination, rate limiting, authentication, request routing).
- Service Mesh (East-West Traffic): Handles internal microservice-to-microservice traffic using sidecar proxies (Envoy) for mutual TLS (mTLS), distributed tracing, and automated retries.`,
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Explaining all 3 Circuit Breaker states (Closed, Open, Half-Open) with transition triggers.',
            'Differentiating North-South (API Gateway) vs East-West (Service Mesh) traffic.',
            'Mentioning fallback mechanisms (degraded responses).'
          ],
          commonMistakes: [
            'Confusing a Circuit Breaker with simple retry logic (naive retries worsen cascading failures through retry storms).'
          ]
        }
      },
      {
        id: 'net-9',
        title: 'What Happens When You Type a URL in the Browser and Press Enter? (Complete End-to-End Walkthrough)',
        category: 'Computer Networks',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Netflix', 'Apple'],
        questionPrompt: 'Describe comprehensively what happens from the moment a user types "https://www.google.com" into the browser address bar and presses Enter until the complete web page is rendered on screen.',
        conceptSummary: 'URL parsing, HSTS preloading, DNS hierarchy, ARP protocol, TCP 3-way handshake, TLS 1.3 cryptographic negotiation, HTTP/2 multiplexed GET request, CDN caching, browser DOM/CSSOM tree construction, and painting.',
        detailedAnswer: `1. Phase 1 - Parsing & Security Checks (Browser):
- The browser checks if input is a valid URL or search term.
- HSTS Preload List: Browser verifies if domain mandates HTTPS (HTTP Strict Transport Security) to prevent downgrade attacks before sending any traffic.

2. Phase 2 - DNS Resolution (Domain Name -> IP Address):
- Local Resolution: Checks Browser DNS cache -> OS cache (/etc/hosts or DNS client service) -> Router DNS cache.
- Recursive Resolution: If miss, queries Recursive Resolver (ISP or 8.8.8.8) -> Root Nameserver (.) -> Top-Level Domain (TLD) Nameserver (.com) -> Authoritative Nameserver (google.com) which returns IPv4 (A record) or IPv6 (AAAA record).

3. Phase 3 - Network & Data Link Routing (ARP & Gateway):
- ARP (Address Resolution Protocol): To send packets to default gateway router, OS broadcasts ARP request to resolve gateway router's physical MAC address.
- IP Routing: Packets traverse autonomous systems (AS) via BGP (Border Gateway Protocol) and OSPF routers.

4. Phase 4 - Transport & Security Layer (TCP & TLS 1.3):
- TCP 3-Way Handshake: Client sends SYN -> Server responds SYN-ACK -> Client sends ACK.
- TLS 1.3 Handshake: ClientHello (supported ciphers, KeyShare with ECDHE public key) -> ServerHello (chosen cipher, server KeyShare, encrypted Certificate & Finished verification). Symmetric session key established in just 1 RTT!

5. Phase 5 - HTTP/2 Protocol & Server Processing:
- Browser issues HTTP/2 GET request over TLS encrypted connection.
- Request hits CDN Edge Node or Load Balancer (NGINX / AWS ALB), which terminates TLS and forwards request to application microservices.
- Web server responds with HTTP 200 OK along with HTML payload (Transfer-Encoding: chunked or gzip/br compressed).

6. Phase 6 - Browser Rendering Engine (Critical Rendering Path):
- HTML Parser parses tokens and constructs the DOM (Document Object Model) tree.
- CSS Parser parses style sheets and constructs CSSOM (CSS Object Model) tree.
- DOM + CSSOM combine into the Render Tree (excluding hidden elements like display: none).
- Layout (Reflow): Browser computes exact geometry and coordinates for every node.
- Paint & Compositing: GPU paints pixels into bitmap layers and composites them onto the screen.`,
        visualDiagramAnimation: {
          title: 'End-to-End Web Request & Page Render Pipeline',
          description: 'Step-by-step lifecycle from keyboard Enter key to GPU display paint.',
          steps: [
            { step: 1, label: 'DNS Resolution', visualDesc: 'Browser checks local cache. Resolver queries Root -> TLD (.com) -> Authoritative Nameserver -> returns IP 142.250.190.46.', badge: 'DNS O(1) Cache / UDP' },
            { step: 2, label: 'TCP 3-Way Handshake', visualDesc: 'Client and server exchange SYN, SYN-ACK, ACK to establish reliable bi-directional byte stream.', badge: 'TCP Port 443' },
            { step: 3, label: 'TLS 1.3 Encryption', visualDesc: 'Elliptic Curve Diffie-Hellman Key Exchange completes in 1-RTT. AES-256-GCM symmetric session keys negotiated.', badge: '1-RTT TLS 1.3' },
            { step: 4, label: 'HTTP/2 Streaming', visualDesc: 'Browser sends HTTP GET. CDN / Reverse proxy streams back gzipped HTML, JavaScript bundles, and CSS chunks.', badge: 'HTTP/2 Binary Frames' },
            { step: 5, label: 'Critical Rendering Path', visualDesc: 'Browser engine parses DOM + CSSOM -> constructs Render Tree -> computes Layout -> GPU paints pixels.', badge: '60 FPS Paint' }
          ]
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Broad full-stack depth across all layers: Browser -> OS -> Network -> Server -> Rendering.',
            'Mentioning modern protocol standards (TLS 1.3, HTTP/2, HSTS).',
            'Describing the Critical Rendering Path (DOM -> CSSOM -> Render Tree -> Layout -> Paint).'
          ],
          commonMistakes: [
            'Skipping DNS resolution details or assuming DNS uses TCP (DNS primarily uses UDP port 53).',
            'Stopping explanation when server returns HTML without explaining browser parsing and layout.'
          ],
          followUpQuestions: [
            'What happens if the requested domain uses DNS Anycast?',
            'What is the difference between Reflow (Layout) and Repaint, and how do modern frontends minimize Reflows?'
          ]
        }
      },
      {
        id: 'net-10',
        title: 'TLS/SSL 1.3 Handshake & HTTPS Security: Symmetric vs Asymmetric Encryption, Certificates & CAs',
        category: 'Computer Networks',
        difficulty: 'Hard',
        companyTags: ['Cloudflare', 'Google', 'Cisco', 'Stripe', 'Amazon'],
        questionPrompt: 'How does HTTPS guarantee Confidentiality, Integrity, and Authenticity? Explain how Asymmetric encryption (RSA/ECC) bootstraps Symmetric encryption (AES-GCM), and why TLS 1.3 reduces the handshake to a single Round Trip (1-RTT).',
        conceptSummary: 'Ephemeral Diffie-Hellman key exchange (ECDHE) for Perfect Forward Secrecy (PFS), X.509 digital certificates, Certificate Authority root of trust, and 0-RTT session resumption.',
        detailedAnswer: `1. The 3 Security Pillars of HTTPS:
- Confidentiality: Prevents eavesdropping (MITM cannot inspect payload).
- Integrity: Prevents tampering; message authentication codes (HMAC / AEAD) ensure packet has not been altered in transit.
- Authenticity: Verifies the server is genuinely who it claims to be via X.509 certificates signed by trusted Certificate Authorities (CAs).

2. Why Asymmetric Bootstraps Symmetric:
- Asymmetric Encryption (RSA, ECC): Computationally expensive (uses complex modular arithmetic on huge primes or elliptic curves). Encrypting gigabytes of video or web traffic with asymmetric keys would choke server CPUs.
- Symmetric Encryption (AES-GCM, ChaCha20): Extremely fast and hardware-accelerated on modern CPUs (Intel AES-NI instructions). Both parties must share the same secret key.
- The Hybrid Protocol: Asymmetric cryptography is used ONLY during the initial handshake to securely negotiate a temporary Symmetric Session Key. All subsequent application data is encrypted with fast symmetric cryptography!

3. TLS 1.2 vs TLS 1.3 (Why TLS 1.3 is 1-RTT):
- TLS 1.2 required 2 full Round Trips (2-RTT) before application data could be transmitted (ClientHello/ServerHello, followed by Certificate/KeyExchange, followed by Finished).
- TLS 1.3 combines key exchange with the initial greeting:
  * Client sends ClientHello AND its Ephemeral Diffie-Hellman Key Share in Step 1.
  * Server responds with ServerHello, chosen cipher, server Key Share, and Certificate.
  * Both sides immediately derive the shared symmetric key. Application data can be sent immediately in Step 3! (1-RTT).
- Perfect Forward Secrecy (PFS): Mandated in TLS 1.3 by discarding static RSA key exchange. If server's private key is stolen 5 years in the future, past recorded encrypted traffic CANNOT be decrypted!`,
        visualDiagramAnimation: {
          title: 'TLS 1.3 1-RTT Cryptographic Handshake Flow',
          description: 'How modern HTTPS negotiates symmetric encryption in a single network round trip.',
          steps: [
            { step: 1, label: 'ClientHello & KeyShare', visualDesc: 'Client sends supported ciphers (e.g. TLS_AES_256_GCM_SHA384) + client ECDHE public key share.', badge: '1st Half RTT' },
            { step: 2, label: 'ServerHello & Cert', visualDesc: 'Server selects cipher, emits server ECDHE public key share + encrypted X.509 certificate.', badge: 'Server Response' },
            { step: 3, label: 'Key Derivation', visualDesc: 'Both sides multiply keys using Elliptic Curve Diffie-Hellman to derive identical symmetric session key.', badge: 'Symmetric Master Secret' },
            { step: 4, label: 'Encrypted Data Stream', visualDesc: 'Client immediately transmits HTTP GET encrypted with AES-256-GCM. 1 full round trip saved compared to TLS 1.2!', badge: 'AES-GCM Traffic' }
          ]
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Articulating why hybrid encryption is used (asymmetric for negotiation, symmetric for speed).',
            'Explaining Perfect Forward Secrecy (PFS) and why TLS 1.3 removed static RSA key exchange.',
            'Highlighting the 1-RTT (and 0-RTT session resumption) performance improvement in TLS 1.3.'
          ],
          commonMistakes: [
            'Thinking entire web conversations are encrypted with the server public/private key pair.',
            'Confusing Digital Signatures (proves identity) with Encryption (hides content).'
          ],
          followUpQuestions: [
            'What is SNI (Server Name Indication) and why is Encrypted SNI (ECH) important for privacy?',
            'What is the security risk of TLS 1.3 0-RTT early data (replay attacks)?'
          ]
        }
      },
      {
        id: 'net-11',
        title: 'Layer 4 vs Layer 7 Load Balancing & Reverse Proxies (NGINX, HAProxy, Envoy)',
        category: 'Full-Stack System Design',
        difficulty: 'Medium',
        companyTags: ['Uber', 'Meta', 'Netflix', 'Amazon', 'Airbnb'],
        questionPrompt: 'What is the fundamental architectural difference between a Layer 4 (Transport) and a Layer 7 (Application) load balancer? When would you use HAProxy/NGINX at L7 vs AWS NLB/IPVS at L4?',
        conceptSummary: 'TCP packet forwarding without inspecting payload vs terminating TCP/TLS and routing based on HTTP headers, URLs, cookies; latency and CPU consumption tradeoffs; sticky sessions.',
        detailedAnswer: `1. Layer 4 Load Balancing (Transport Layer):
- Operates at the TCP/UDP packet level (IP address + Port).
- Does NOT inspect packet payloads (does not know whether traffic is HTTP, gRPC, or database wire protocol).
- Mechanism: Uses Network Address Translation (NAT) or Direct Server Return (DSR). Modifies source/dest IP and forwards packets directly to backend target.
- Advantages: Ultra-high throughput (millions of packets per second), minimal CPU usage, ultra-low sub-millisecond latency.
- Disadvantages: Cannot make smart routing decisions (cannot route based on URL path '/api/users' or cookies). Cannot perform SSL termination with URL inspection.
- Industry Examples: AWS Network Load Balancer (NLB), Linux Virtual Server (IPVS), HAProxy in TCP mode.

2. Layer 7 Load Balancing (Application Layer):
- Operates at the Application protocol level (HTTP/1.1, HTTP/2, WebSockets, gRPC).
- Terminates the TCP and TLS connection: The load balancer decrypts incoming TLS, reads the complete HTTP request (headers, path, cookies), and makes intelligent routing decisions.
- Capabilities:
  * Path-Based Routing: Route '/api/v1/checkout' to Checkout Microservice; route '/static/*' to S3 bucket.
  * Header/Cookie Inspection: Sticky sessions (session affinity), A/B testing routing.
  * Web Application Firewall (WAF): Rate limiting, DDoS defense, SQL injection filtering.
- Disadvantages: Higher CPU consumption (must terminate TLS and buffer HTTP bodies) and slightly higher latency (~1-5ms).
- Industry Examples: NGINX, AWS Application Load Balancer (ALB), Envoy Proxy, Cloudflare.

3. Two-Tier Production Pattern:
High-scale architectures deploy BOTH: An ultra-fast Layer 4 cluster (AWS NLB / Maglev) at the edge distributing raw TCP connections across a fleet of Layer 7 NGINX/Envoy pods that perform TLS termination and microservice routing!`,
        codeSnippet: {
          language: 'Nginx Config',
          code: `# NGINX Layer 7 Path-Based Upstream Routing
http {
    upstream auth_service {
        least_conn; # Route to backend with fewest active connections
        server 10.0.1.10:8080 weight=3;
        server 10.0.1.11:8080 weight=1;
    }

    upstream payment_service {
        server 10.0.2.10:9000;
        server 10.0.2.11:9000 backup;
    }

    server {
        listen 443 ssl http2;
        server_name api.interviewai.dev;

        # TLS Termination at L7
        ssl_certificate /etc/ssl/certs/cert.pem;
        ssl_certificate_key /etc/ssl/private/key.pem;

        location /api/v1/auth {
            proxy_pass http://auth_service;
        }

        location /api/v1/payments {
            proxy_pass http://payment_service;
        }
    }
}`
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Defining L4 (packet routing without payload inspection) vs L7 (connection termination with full HTTP parsing).',
            'Explaining the tradeoff between CPU latency (L4 wins) and routing intelligence (L7 wins).',
            'Highlighting the 2-tier architecture (L4 at edge feeding L7 proxies).'
          ],
          commonMistakes: [
            'Thinking an L4 load balancer can inspect HTTP headers or route based on URLs.'
          ],
          followUpQuestions: [
            'What is Direct Server Return (DSR) in Layer 4 load balancing and why does it maximize throughput?',
            'How do sticky sessions work at Layer 7 and what problems do they cause during autoscaling?'
          ]
        }
      },
      {
        id: 'net-12',
        title: 'TCP Flow Control (Sliding Window) vs TCP Congestion Control (Slow Start, Congestion Avoidance, Fast Retransmit)',
        category: 'Computer Networks',
        difficulty: 'Hard',
        companyTags: ['Google', 'Microsoft', 'Cisco', 'Akamai', 'Cloudflare'],
        questionPrompt: 'How does TCP differentiate between receiver buffer overflow (Flow Control) and intermediate network congestion (Congestion Control)? Explain the TCP Sliding Window, Advertised Window (rwnd), Congestion Window (cwnd), and AIMD.',
        conceptSummary: 'Receiver advertised window (rwnd) prevents receiver buffer overrun; Congestion window (cwnd) dynamically probes network bottleneck bandwidth. Slow Start exponential growth, ssthresh threshold, Congestion Avoidance additive increase, and Fast Recovery on 3 duplicate ACKs.',
        detailedAnswer: `1. Flow Control vs Congestion Control Distinction:
- Flow Control: Protects the RECEIVER. Prevents a fast sender from overwhelming a slow receiver whose application buffer is full. Handled via 'rwnd' (Advertised Receive Window).
- Congestion Control: Protects the NETWORK PIPES. Prevents all senders collectively from overflowing intermediate router buffers and switches. Handled via 'cwnd' (Congestion Window).
- The Invariant Rule: The sender can never transmit more than 'min(rwnd, cwnd)' unacknowledged bytes!

2. TCP Flow Control (Sliding Window):
- Receiver informs sender of its available buffer capacity in every TCP ACK header: 'rwnd = BufferSize - (BytesReceived - BytesReadByApp)'.
- If receiver buffer fills up, it advertises 'rwnd = 0' (Zero Window). Sender pauses transmission and sends periodic 1-byte Zero Window Probes to check when buffer frees up.

3. TCP Congestion Control (4 Classical Phases):
- Phase 1 - Slow Start:
  * cwnd starts at a small initial value (e.g. 10 MSS = Maximum Segment Size).
  * For every ACK received, cwnd increases by 1 MSS -> cwnd DOUBLES every Round Trip Time (RTT). Exponential growth!
- Phase 2 - Congestion Avoidance (Additive Increase):
  * When cwnd reaches the Slow Start Threshold ('ssthresh'), exponential growth ceases.
  * cwnd increases linearly by 1 MSS per RTT: Additive Increase.
- Phase 3 - Packet Loss Detection & Multiplicative Decrease (AIMD):
  * Scenario A - 3 Duplicate ACKs (Mild congestion): Indicates isolated packet loss, but subsequent packets arrived. Triggers Fast Retransmit (retransmits missing segment immediately without waiting for retransmission timer) and sets 'ssthresh = cwnd / 2', followed by Fast Recovery.
  * Scenario B - Retransmission Timeout (Severe congestion): Indicates complete network blackhole. Sets 'ssthresh = cwnd / 2' and drops 'cwnd = 1 MSS', restarting Slow Start from scratch!
- Modern Evolution: Modern cloud backbones use BBR (Bottleneck Bandwidth and RTT, created by Google), which models real pipe capacity instead of treating loss as congestion.`,
        visualDiagramAnimation: {
          title: 'TCP Congestion Control State Machine (Slow Start -> AIMD -> Fast Retransmit)',
          description: 'Step-by-step evolution of cwnd across exponential growth, linear avoidance, and packet loss recovery.',
          steps: [
            { step: 1, label: 'Slow Start (Exponential)', visualDesc: 'cwnd starts at 10 MSS. Doubles every RTT (10 -> 20 -> 40 MSS) to quickly probe available network capacity.', badge: '2^N Growth' },
            { step: 2, label: 'ssthresh Hit', visualDesc: 'cwnd reaches ssthresh (64 MSS). Switch from exponential to linear growth (Additive Increase: +1 MSS per RTT).', badge: 'Linear AIMD' },
            { step: 3, label: '3 Duplicate ACKs', visualDesc: 'Receiver detects missing segment #32; emits 3 duplicate ACKs. Sender identifies packet drop.', badge: 'Triple Dup ACK' },
            { step: 4, label: 'Fast Retransmit & Recovery', visualDesc: 'Sender re-sends segment #32 immediately without waiting for RTO timer. cwnd cut in half (Multiplicative Decrease).', badge: 'Fast Recovery' }
          ]
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Clear distinction: Flow Control is end-to-end (rwnd), Congestion Control is network-wide (cwnd).',
            'Explaining AIMD (Additive Increase, Multiplicative Decrease) and why it guarantees fairness among competing flows.',
            'Differentiating 3 Duplicate ACKs (Fast Retransmit) from RTO Timeout.'
          ],
          commonMistakes: [
            'Confusing flow control with congestion control.',
            'Assuming packet loss always causes cwnd to drop back to 1 MSS (only timeout resets to 1; 3 dup ACKs cuts to half).'
          ],
          followUpQuestions: [
            'How does Google BBR congestion control differ from loss-based TCP Cubic on high-bandwidth high-latency links?',
            'What is the Silly Window Syndrome and how does Clark algorithm or Nagle algorithm prevent it?'
          ]
        }
      },
      {
        id: 'net-13',
        title: 'Distributed Caching Strategies: Cache-Aside, Write-Through, Write-Back & Cache Stampede/Avalanche Prevention',
        category: 'Full-Stack System Design',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Uber', 'Twitter / X', 'Meta', 'Salesforce'],
        questionPrompt: 'Compare the 4 primary caching patterns: Cache-Aside, Read-Through, Write-Through, and Write-Back (Write-Behind). How do you protect a distributed cache from Cache Stampede (Thundering Herd), Cache Avalanche, and Cache Penetration?',
        conceptSummary: 'Data consistency tradeoffs, write latency reduction vs risk of data loss on crash, Bloom filters for non-existent keys, jittered TTLs for avalanche, and distributed mutexes/locks for stampede.',
        detailedAnswer: `1. Primary Caching Patterns:
- Cache-Aside (Lazy Loading):
  * Application directly orchestrates cache and DB. On read: Check Cache -> If hit, return -> If miss, read DB, write to Cache, return. On write: Write to DB, then invalidate (delete) Cache key.
  * Pros: Resilient to cache failure (DB is fallback); only requested data is cached.
  * Cons: Cache miss penalty on first access; potential transient stale data between DB write and cache eviction.
- Write-Through:
  * Application writes strictly to the cache layer; the cache synchronously writes to the database before acknowledging success.
  * Pros: High data consistency; read misses are rare.
  * Cons: High write latency (waits for two writes).
- Write-Back (Write-Behind):
  * Application writes to cache, which immediately responds OK. The cache asynchronously batches writes to disk DB every few seconds.
  * Pros: Incredible write performance and write absorbency (absorbs sudden write spikes).
  * Cons: Risk of permanent data loss if cache node crashes before flushing dirty writes to DB!

2. The 3 Deadly Caching Pitfalls & Solutions:
- 1. Cache Avalanche:
  * Disaster: Thousands of cached keys configured with identical TTL (e.g. 24 hours) expire simultaneously at 12:00 AM, causing massive wave of queries to crash the database.
  * Solution: Add uniform random jitter to TTL: 'TTL = base_ttl + random(0, 300) seconds'.
- 2. Cache Stampede (Thundering Herd):
  * Disaster: A high-traffic key (e.g. homepage banner) expires. 10,000 concurrent requests all experience a cache miss simultaneously and all 10,000 execute the expensive DB query!
  * Solution: Distributed Mutex Lock. When a cache miss occurs, only the ONE thread that successfully acquires 'SET lock:key token NX PX 5000' queries the DB and repopulates the cache. Other 9,999 threads sleep 50ms and re-check cache.
- 3. Cache Penetration:
  * Disaster: Attackers query non-existent IDs (e.g. id = -99999). Every request misses cache and hits DB directly.
  * Solution: Use a Bloom Filter at API gateway to reject non-existent keys in O(1) time, or store null objects in cache with short 60-second TTL ('SET key:non_existent "NULL" EX 60').`,
        codeSnippet: {
          language: 'TypeScript / Node.js',
          code: `// Cache-Aside with Distributed Mutex Lock (Anti-Stampede)
async function getProductWithMutex(productId: string): Promise<Product> {
    const cacheKey = 'product:' + productId;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const lockKey = 'lock:' + cacheKey;
    const acquired = await redis.set(lockKey, 'locked', 'NX', 'PX', 5000); // 5 sec lock

    if (acquired) {
        try {
            // Sole worker thread querying the database
            const product = await db.products.findById(productId);
            // Cache with jitter (1 hour + 0..5 min)
            const jitter = Math.floor(Math.random() * 300);
            await redis.set(cacheKey, JSON.stringify(product), 'EX', 3600 + jitter);
            return product;
        } finally {
            await redis.del(lockKey);
        }
    } else {
        // Other threads sleep 50ms and retry reading from warmed cache
        await new Promise((r) => setTimeout(r, 50));
        return getProductWithMutex(productId);
    }
}`
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Explaining why Cache-Aside deletes keys on write instead of updating them (prevents race conditions with concurrent writes).',
            'Concrete production solutions for Cache Avalanche (TTL jitter), Stampede (Mutex), and Penetration (Bloom filters).',
            'Understanding Write-Back data loss risk vs extreme write throughput.'
          ],
          commonMistakes: [
            'Proposing updating the cache on DB write in Cache-Aside (causes stale data if two writes interleave out of order).'
          ],
          followUpQuestions: [
            'How does Redis Sentinel vs Redis Cluster handle failover and high availability?',
            'What eviction policy would you configure in Redis for a read-heavy e-commerce catalog (allkeys-lru vs volatile-lru)?'
          ]
        }
      },
      {
        id: 'net-14',
        title: 'Distributed Transactions: Two-Phase Commit (2PC) vs SAGA Pattern (Choreography vs Orchestration)',
        category: 'Full-Stack System Design',
        difficulty: 'Hard',
        companyTags: ['Stripe', 'Amazon', 'PayPal', 'Uber', 'Airbnb'],
        questionPrompt: 'In a microservices architecture with independent databases per service, why is Two-Phase Commit (2PC) rarely used in high-scale cloud systems? How does the SAGA pattern achieve eventual consistency through compensating transactions?',
        conceptSummary: 'ACID distributed transactions vs BASE eventual consistency, 2PC blocking coordinator single-point-of-failure and lock holding, SAGA choreography (event-driven Kafka) vs orchestration (central orchestrator state machine), and compensating rollback transactions.',
        detailedAnswer: `1. The Distributed Transactions Problem:
In monolithic apps, an ACID transaction spans multiple tables in a single relational DB using 'BEGIN ... COMMIT'. In microservices, Order Service owns PostgreSQL and Payment Service owns MongoDB. How do you guarantee that if Payment fails, the Order is rolled back?

2. Two-Phase Commit (2PC) & Why It Fails at Scale:
- Phase 1 (Prepare Phase): Coordinator asks all microservices: "Can you commit?" Services acquire row locks and reply YES/NO.
- Phase 2 (Commit Phase): If all replied YES -> Coordinator broadcasts COMMIT. If any replied NO -> Coordinator broadcasts ROLLBACK.
- Critical Flaws:
  * Blocking Locks: Resources remain locked across unpredictable network round trips, drastically tanking throughput.
  * Coordinator SPOF: If coordinator crashes after Phase 1, participants remain blocked holding locks indefinitely.
  * Incompatible with modern NoSQL databases and external third-party APIs (e.g. Stripe API has no 2PC prepare phase!).

3. The SAGA Pattern (Eventual Consistency):
- A SAGA decomposes a distributed transaction into a sequence of LOCAL transactions across microservices.
- Each local transaction updates its own database and publishes an event/message.
- Compensating Transactions (Rollback): If Step 3 fails, the system triggers compensating transactions in reverse order (Step 2 rollback -> Step 1 rollback) to undo previous partial updates!
  * Example: Order Created -> Payment Deducted -> Inventory Out-of-Stock! Compensating transaction: Payment Refunded -> Order Cancelled.

4. SAGA Implementation Modes:
- Choreography (Event-Driven): Microservices listen to Kafka/RabbitMQ events and act independently without a central coordinator. Best for simple 2-3 step workflows.
- Orchestration (Command-Driven): A dedicated Orchestrator State Machine (e.g. Temporal, AWS Step Functions) sends explicit commands to participants and handles timeouts and retries. Best for complex enterprise checkout flows.`,
        visualDiagramAnimation: {
          title: 'SAGA Orchestration Flow with Compensating Transaction Rollback',
          description: 'Step-by-step lifecycle of payment failure and automated backward compensating rollbacks.',
          steps: [
            { step: 1, label: 'Order Initiated', visualDesc: 'Orchestrator commands Order Service -> Local DB creates Order (Status: PENDING).', badge: 'Order Pending' },
            { step: 2, label: 'Payment Reserved', visualDesc: 'Orchestrator commands Payment Service -> Successfully charges user credit card \$50.', badge: 'Payment Success' },
            { step: 3, label: 'Inventory Check Fails', visualDesc: 'Orchestrator commands Inventory Service -> Out of Stock error returned!', badge: 'Step Failure' },
            { step: 4, label: 'Compensating Refund', visualDesc: 'Orchestrator invokes Payment Service Compensating Action -> Full \$50 refund issued to user card.', badge: 'Compensate Undo' },
            { step: 5, label: 'Order Cancelled', visualDesc: 'Orchestrator marks Order as CANCELLED in Order DB. System reaches clean eventual consistency!', badge: 'Eventual Consistency' }
          ]
        },
        interviewerRubric: {
          whatInterviewersLookFor: [
            'Articulating why 2PC creates catastrophic blocking bottlenecks in distributed systems.',
            'Explaining how the SAGA pattern uses compensating transactions to guarantee eventual consistency.',
            'Contrasting Choreography (Kafka events) vs Orchestration (State machine) trade-offs.'
          ],
          commonMistakes: [
            'Confusing a compensating transaction with an automated database rollback (compensating action is explicit forward-undo logic like refunding credit card).'
          ],
          followUpQuestions: [
            'What happens if a compensating transaction itself fails? How do you ensure idempotency?',
            'What is the Outbox Pattern and why is it essential when publishing SAGA events to Kafka?'
          ]
        }
      }

    ]
  }
];
