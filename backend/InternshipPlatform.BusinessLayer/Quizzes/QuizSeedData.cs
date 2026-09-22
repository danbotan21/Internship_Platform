using System.Text.Json;
using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Enums;

namespace InternshipPlatform.BusinessLayer.Quizzes;

public static class QuizSeedData
{
    private static readonly JsonSerializerOptions _jsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public static List<Quiz> GetDefaultQuizzes()
    {
        var now = DateTime.UtcNow;
        var list = new List<Quiz>();

        var quiz0 = new Quiz
        {
            Id = Guid.NewGuid(),
            Slug = "data-structures-algorithms",
            Title = "Data Structures & Algorithms",
            Description = "Arrays, trees, sorting, complexity",
            Category = "Computer Science",
            QuestionCount = 8,
            DurationMinutes = 20,
            PassingScore = 70,
            Difficulty = QuizDifficulty.HARD,
            IsCustom = false,
            CreatedAt = now.AddDays(-60),
            Questions = new List<QuizQuestion>()
        };
        quiz0.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz0.Id,
            NumberLabel = "Q01",
            Category = "DATA STRUCTURES",
            QuestionText = "Which data structure guarantees O(1) average-case lookup by key?",
            Hint = "Consider how hashing computes an index directly from a key rather than traversing nodes.",
            CorrectOptionId = "b",
            OrderIndex = 1,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"Binary Search Tree\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"Hash Map\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"Sorted Array\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"Linked List\"}]"
        });
        quiz0.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz0.Id,
            NumberLabel = "Q02",
            Category = "SORTING",
            QuestionText = "What is the time complexity of QuickSort in the average case?",
            Hint = "The partition step runs in linear time at each recursive depth of log(n) on average.",
            CorrectOptionId = "b",
            OrderIndex = 2,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"O(n²)\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"O(n log n)\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"O(log n)\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"O(n)\"}]"
        });
        quiz0.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz0.Id,
            NumberLabel = "Q03",
            Category = "TREES",
            QuestionText = "Which tree traversal algorithm processes nodes in sorted ascending order in a Binary Search Tree?",
            Hint = "It visits the left child first, then the current node, then the right child.",
            CorrectOptionId = "c",
            OrderIndex = 3,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"Pre-order Traversal\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"Post-order Traversal\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"In-order Traversal\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"Breadth-First Traversal\"}]"
        });
        quiz0.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz0.Id,
            NumberLabel = "Q04",
            Category = "COMPLEXITY",
            QuestionText = "What is the worst-case space complexity of recursive Depth-First Search (DFS) on a graph with V vertices?",
            Hint = "In a degenerate chain graph, the call stack will contain every visited vertex simultaneously.",
            CorrectOptionId = "b",
            OrderIndex = 4,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"O(1)\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"O(V)\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"O(V²)\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"O(log V)\"}]"
        });
        quiz0.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz0.Id,
            NumberLabel = "Q05",
            Category = "ALGORITHMS",
            QuestionText = "Which algorithmic paradigm is Dijkstra's shortest path algorithm based on?",
            Hint = "It selects the local optimal choice with the minimal tentative distance at each step.",
            CorrectOptionId = "a",
            OrderIndex = 5,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"Greedy\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"Dynamic Programming\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"Divide and Conquer\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"Backtracking\"}]"
        });
        quiz0.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz0.Id,
            NumberLabel = "Q06",
            Category = "HEAPS",
            QuestionText = "What is the time complexity to extract the minimum element from a Min-Heap containing n elements?",
            Hint = "Removing the root requires swapping with the last leaf and bubbling down (heapify).",
            CorrectOptionId = "b",
            OrderIndex = 6,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"O(1)\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"O(log n)\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"O(n)\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"O(n log n)\"}]"
        });
        quiz0.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz0.Id,
            NumberLabel = "Q07",
            Category = "DATA STRUCTURES",
            QuestionText = "Which fundamental data structure is naturally utilized to evaluate arithmetic expressions in Postfix (Reverse Polish) notation?",
            Hint = "Operands are pushed onto this LIFO structure and popped when operators appear.",
            CorrectOptionId = "c",
            OrderIndex = 7,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"Queue\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"Priority Queue\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"Stack\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"Double-ended Queue\"}]"
        });
        quiz0.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz0.Id,
            NumberLabel = "Q08",
            Category = "DYNAMIC PROGRAMMING",
            QuestionText = "Which two key properties must a problem exhibit to be effectively solved using Dynamic Programming?",
            Hint = "One allows subproblems to be combined; the other means identical subproblems are solved repeatedly.",
            CorrectOptionId = "a",
            OrderIndex = 8,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"Optimal substructure and overlapping subproblems\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"Greedy choice property and disjoint subsets\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"Independent subproblems and balanced branching\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"Linear search order and memoized recursion without base cases\"}]"
        });
        list.Add(quiz0);

        var quiz1 = new Quiz
        {
            Id = Guid.NewGuid(),
            Slug = "react-frontend",
            Title = "React & Frontend",
            Description = "Hooks, state, rendering, patterns",
            Category = "Frontend",
            QuestionCount = 8,
            DurationMinutes = 15,
            PassingScore = 75,
            Difficulty = QuizDifficulty.MEDIUM,
            IsCustom = false,
            CreatedAt = now.AddDays(-55),
            Questions = new List<QuizQuestion>()
        };
        quiz1.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz1.Id,
            NumberLabel = "Q01",
            Category = "HOOKS",
            QuestionText = "Which hook should be used to perform side effects after DOM mutations are painted to the screen?",
            Hint = "Unlike useLayoutEffect, this hook fires asynchronously after the render commit.",
            CorrectOptionId = "a",
            OrderIndex = 1,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"useEffect\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"useLayoutEffect\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"useMemo\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"useCallback\"}]"
        });
        quiz1.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz1.Id,
            NumberLabel = "Q02",
            Category = "STATE",
            QuestionText = "When updating state based on previous state in React, what is the recommended practice?",
            Hint = "Pass a functional updater argument instead of a direct value.",
            CorrectOptionId = "b",
            OrderIndex = 2,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"Mutate the state variable directly\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"Pass a callback function to the state setter\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"Call forceUpdate() immediately after setState\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"Store the state in a global window variable\"}]"
        });
        quiz1.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz1.Id,
            NumberLabel = "Q03",
            Category = "RECONCILIATION",
            QuestionText = "Why is using array index as a key in dynamic lists generally discouraged in React?",
            Hint = "Reordering, adding, or removing items can cause state corruption in child components.",
            CorrectOptionId = "c",
            OrderIndex = 3,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"Keys must always be alphanumeric strings without numbers\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"It prevents the list from rendering more than 100 elements\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"It can cause unintended component state retention when items are reordered\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"Indices are strictly rejected by the JSX compiler\"}]"
        });
        quiz1.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz1.Id,
            NumberLabel = "Q04",
            Category = "OPTIMIZATION",
            QuestionText = "What is the primary difference between useCallback and useMemo in React?",
            Hint = "One caches a function reference; the other caches the computed return value.",
            CorrectOptionId = "b",
            OrderIndex = 4,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"useCallback executes on every render; useMemo does not\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"useCallback memoizes a function definition; useMemo memoizes a computed value\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"useMemo is deprecated in favor of useEffect\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"useCallback can only be used in class components\"}]"
        });
        quiz1.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz1.Id,
            NumberLabel = "Q05",
            Category = "CONTEXT",
            QuestionText = "What happens to consumers of a React Context when the Provider value changes?",
            Hint = "Every component subscribed to the context will re-render unless prevented by splitting or memoization.",
            CorrectOptionId = "a",
            OrderIndex = 5,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"All consumer components re-render regardless of React.memo\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"Only the direct children of the Provider re-render\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"Only consumers that explicitly call useContext(force) re-render\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"React automatically cancels the previous render tree\"}]"
        });
        quiz1.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz1.Id,
            NumberLabel = "Q06",
            Category = "VIRTUAL DOM",
            QuestionText = "What is the main goal of the Virtual DOM reconciliation algorithm in modern web applications?",
            Hint = "It minimizes costly real DOM manipulations by computing minimal diffs.",
            CorrectOptionId = "b",
            OrderIndex = 6,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"To completely replace browser HTML parsers\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"To batch updates and minimize expensive direct manipulations of the real DOM\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"To store application data persistently on the client machine\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"To compile JSX directly into WebAssembly binary\"}]"
        });
        quiz1.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz1.Id,
            NumberLabel = "Q07",
            Category = "CONCURRENCY",
            QuestionText = "Which React hook allows you to mark a state transition as non-urgent to keep the interface responsive?",
            Hint = "Introduced in React 18 for concurrent rendering transitions.",
            CorrectOptionId = "c",
            OrderIndex = 7,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"useDeferredValue\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"useId\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"useTransition\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"useImperativeHandle\"}]"
        });
        quiz1.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz1.Id,
            NumberLabel = "Q08",
            Category = "LIFECYCLE",
            QuestionText = "Why does React in StrictMode invoke component render functions and effects twice in development?",
            Hint = "It ensures side effects are pure and cleanup logic is properly implemented.",
            CorrectOptionId = "b",
            OrderIndex = 8,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"To measure browser rendering performance under heavy load\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"To detect unintended side-effects and verify correct effect cleanup functions\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"Because of a known Vite hot-module reload mechanism\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"To warm up the browser JIT compiler for React fiber nodes\"}]"
        });
        list.Add(quiz1);

        var quiz2 = new Quiz
        {
            Id = Guid.NewGuid(),
            Slug = "rest-apis-http",
            Title = "REST APIs & HTTP",
            Description = "Methods, status codes, auth, design",
            Category = "Backend",
            QuestionCount = 8,
            DurationMinutes = 15,
            PassingScore = 70,
            Difficulty = QuizDifficulty.MEDIUM,
            IsCustom = false,
            CreatedAt = now.AddDays(-50),
            Questions = new List<QuizQuestion>()
        };
        quiz2.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz2.Id,
            NumberLabel = "Q01",
            Category = "HTTP METHODS",
            QuestionText = "Which HTTP method is intended to apply partial modifications to an existing resource?",
            Hint = "PUT replaces the entire resource, whereas this method updates only specified fields.",
            CorrectOptionId = "c",
            OrderIndex = 1,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"POST\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"PUT\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"PATCH\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"OPTIONS\"}]"
        });
        quiz2.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz2.Id,
            NumberLabel = "Q02",
            Category = "STATUS CODES",
            QuestionText = "What is the key semantic distinction between HTTP status code 401 and 403?",
            Hint = "401 indicates missing or invalid credentials; 403 indicates authenticated user lacks authorization.",
            CorrectOptionId = "a",
            OrderIndex = 2,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"401 means Unauthorized (unauthenticated); 403 means Forbidden (unauthorized)\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"401 is a server error; 403 is a client error\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"401 is returned when a resource does not exist; 403 when it is deleted\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"They are identical and interchangeable per RFC 7231\"}]"
        });
        quiz2.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz2.Id,
            NumberLabel = "Q03",
            Category = "IDEMPOTENCY",
            QuestionText = "Which of the following HTTP methods is NOT idempotent by standard definition?",
            Hint = "Multiple identical requests should produce the same state, except for this creation method.",
            CorrectOptionId = "b",
            OrderIndex = 3,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"PUT\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"POST\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"GET\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"DELETE\"}]"
        });
        quiz2.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz2.Id,
            NumberLabel = "Q04",
            Category = "CORS",
            QuestionText = "Which HTTP method is dispatched by browsers during a CORS preflight check?",
            Hint = "The browser queries the server to check which origins and headers are permitted.",
            CorrectOptionId = "d",
            OrderIndex = 4,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"HEAD\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"TRACE\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"CONNECT\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"OPTIONS\"}]"
        });
        quiz2.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz2.Id,
            NumberLabel = "Q05",
            Category = "CACHING",
            QuestionText = "What is the difference between Cache-Control: no-cache and Cache-Control: no-store?",
            Hint = "One requires revalidation with the origin server before serving; the other forbids caching anywhere.",
            CorrectOptionId = "a",
            OrderIndex = 5,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"no-cache must revalidate before reuse; no-store prohibits storing any response copy\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"no-cache is for proxies; no-store is for browsers\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"no-cache deletes cached entries; no-store caches only headers\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"Both behave identically in HTTP/2 and HTTP/3\"}]"
        });
        quiz2.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz2.Id,
            NumberLabel = "Q06",
            Category = "AUTHENTICATION",
            QuestionText = "What are the three dot-separated components that compose a JSON Web Token (JWT)?",
            Hint = "Base64Url-encoded header, payload, and cryptographic signature.",
            CorrectOptionId = "c",
            OrderIndex = 6,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"Origin, Token, Timestamp\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"Issuer, Audience, Secret\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"Header, Payload, Signature\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"Algorithm, Subject, Expiration\"}]"
        });
        quiz2.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz2.Id,
            NumberLabel = "Q07",
            Category = "CONTENT NEGOTIATION",
            QuestionText = "Which HTTP header does a client send to inform the server of desired response media types?",
            Hint = "Used when requesting application/json, text/html, or image/webp.",
            CorrectOptionId = "b",
            OrderIndex = 7,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"Content-Type\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"Accept\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"Accept-Encoding\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"Origin\"}]"
        });
        quiz2.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz2.Id,
            NumberLabel = "Q08",
            Category = "STATUS CODES",
            QuestionText = "Which HTTP status code should be returned when a client exceeds the allowed rate limit of an API?",
            Hint = "Standard RFC 6585 response for rate-limiting.",
            CorrectOptionId = "d",
            OrderIndex = 8,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"503 Service Unavailable\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"408 Request Timeout\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"400 Bad Request\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"429 Too Many Requests\"}]"
        });
        list.Add(quiz2);

        var quiz3 = new Quiz
        {
            Id = Guid.NewGuid(),
            Slug = "sql-databases",
            Title = "SQL & Databases",
            Description = "Queries, joins, indexes, transactions",
            Category = "Database",
            QuestionCount = 8,
            DurationMinutes = 20,
            PassingScore = 70,
            Difficulty = QuizDifficulty.MEDIUM,
            IsCustom = false,
            CreatedAt = now.AddDays(-45),
            Questions = new List<QuizQuestion>()
        };
        quiz3.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz3.Id,
            NumberLabel = "Q01",
            Category = "INDEXING",
            QuestionText = "Which data structure is most commonly used by relational database management systems for B-tree indexes?",
            Hint = "It allows balanced, logarithmic time operations for lookups, range scans, and insertions.",
            CorrectOptionId = "a",
            OrderIndex = 1,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"B+ Tree\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"Red-Black Tree\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"Hash Table\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"Skip List\"}]"
        });
        quiz3.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz3.Id,
            NumberLabel = "Q02",
            Category = "TRANSACTIONS",
            QuestionText = "In relational database transactions, what does the \"I\" in ACID stand for?",
            Hint = "Ensures that concurrent transactions execute without interfering with each other.",
            CorrectOptionId = "c",
            OrderIndex = 2,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"Idempotency\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"Indexing\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"Isolation\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"Integrity\"}]"
        });
        quiz3.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz3.Id,
            NumberLabel = "Q03",
            Category = "JOINS",
            QuestionText = "What is the primary operational difference between an INNER JOIN and a LEFT JOIN in SQL?",
            Hint = "LEFT JOIN keeps all records from the left table even if there is no match in the right table.",
            CorrectOptionId = "b",
            OrderIndex = 3,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"INNER JOIN returns only rows from the left table\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"LEFT JOIN returns all rows from the left table, with NULLs for unmatched right rows\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"LEFT JOIN is strictly faster than INNER JOIN\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"INNER JOIN automatically filters out duplicate primary keys\"}]"
        });
        quiz3.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz3.Id,
            NumberLabel = "Q04",
            Category = "NORMALIZATION",
            QuestionText = "To satisfy Third Normal Form (3NF), a relation must already be in 2NF and have what property?",
            Hint = "Non-prime attributes must not depend on other non-prime attributes.",
            CorrectOptionId = "c",
            OrderIndex = 4,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"No multi-valued attributes\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"At least one foreign key per table\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"No transitive functional dependencies on the primary key\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"All column data types must be strings or integers\"}]"
        });
        quiz3.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz3.Id,
            NumberLabel = "Q05",
            Category = "AGGREGATION",
            QuestionText = "In a SQL query with aggregation, what is the syntactic rule regarding WHERE versus HAVING?",
            Hint = "WHERE filters rows before aggregation; HAVING filters aggregated groups.",
            CorrectOptionId = "a",
            OrderIndex = 5,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"WHERE filters rows before GROUP BY; HAVING filters groups after aggregation\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"HAVING can only be used with primary keys\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"WHERE is only used for numerical values; HAVING for strings\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"WHERE and HAVING cannot appear in the same SELECT statement\"}]"
        });
        quiz3.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz3.Id,
            NumberLabel = "Q06",
            Category = "ISOLATION",
            QuestionText = "Which transaction isolation level prevents dirty reads, non-repeatable reads, AND phantom reads?",
            Hint = "The highest isolation level supported by SQL engines.",
            CorrectOptionId = "d",
            OrderIndex = 6,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"Read Uncommitted\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"Read Committed\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"Repeatable Read\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"Serializable\"}]"
        });
        quiz3.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz3.Id,
            NumberLabel = "Q07",
            Category = "CONSTRAINTS",
            QuestionText = "What happens when a parent row is deleted if its foreign key has ON DELETE CASCADE defined?",
            Hint = "The deletion propagates automatically to dependent child records.",
            CorrectOptionId = "b",
            OrderIndex = 7,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"The deletion is rejected with a foreign key constraint violation\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"All associated child records in the referencing table are automatically deleted\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"The child foreign key columns are set to NULL\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"The parent row is flagged as archived rather than removed\"}]"
        });
        quiz3.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz3.Id,
            NumberLabel = "Q08",
            Category = "OPTIMIZATION",
            QuestionText = "Which SQL command displays the planned execution path, index usage, and cost estimates for a query?",
            Hint = "Frequently used by database administrators to diagnose slow queries.",
            CorrectOptionId = "c",
            OrderIndex = 8,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"ANALYZE TABLE\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"PROFILE QUERY\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"EXPLAIN\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"INDEX SCAN\"}]"
        });
        list.Add(quiz3);

        var quiz4 = new Quiz
        {
            Id = Guid.NewGuid(),
            Slug = "git-version-control",
            Title = "Git & Version Control",
            Description = "Branching, merging, workflows",
            Category = "DevOps",
            QuestionCount = 8,
            DurationMinutes = 10,
            PassingScore = 80,
            Difficulty = QuizDifficulty.EASY,
            IsCustom = false,
            CreatedAt = now.AddDays(-40),
            Questions = new List<QuizQuestion>()
        };
        quiz4.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz4.Id,
            NumberLabel = "Q01",
            Category = "BRANCHING",
            QuestionText = "Which command creates and immediately switches to a new branch named \"feature\"?",
            Hint = "Use checkout with -b or switch with -c.",
            CorrectOptionId = "a",
            OrderIndex = 1,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"git checkout -b feature\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"git branch feature --switch\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"git merge -b feature\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"git branch -new feature\"}]"
        });
        quiz4.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz4.Id,
            NumberLabel = "Q02",
            Category = "HISTORY",
            QuestionText = "What is the fundamental difference in Git history between \"git merge\" and \"git rebase\"?",
            Hint = "Rebase rewrites commit history onto a new base, while merge creates a dedicated merge commit.",
            CorrectOptionId = "b",
            OrderIndex = 2,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"merge deletes previous commits; rebase keeps both\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"rebase applies commits on top of another branch creating a linear history; merge preserves true chronological branch graphs\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"merge works only with remote branches; rebase only local\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"rebase cannot result in merge conflicts\"}]"
        });
        quiz4.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz4.Id,
            NumberLabel = "Q03",
            Category = "CONCEPTS",
            QuestionText = "What does the state \"detached HEAD\" mean in Git?",
            Hint = "HEAD is pointing directly to a commit hash rather than a named branch reference.",
            CorrectOptionId = "c",
            OrderIndex = 3,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"The local repository was disconnected from origin\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"The master branch was deleted accidentally\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"HEAD points directly to a specific commit instead of a named branch\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"A merge conflict corrupted the index file\"}]"
        });
        quiz4.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz4.Id,
            NumberLabel = "Q04",
            Category = "STASHING",
            QuestionText = "What is the difference between \"git stash pop\" and \"git stash apply\"?",
            Hint = "One removes the stashed changes from the stash list; the other leaves them in the list.",
            CorrectOptionId = "a",
            OrderIndex = 4,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"pop applies the latest stash and deletes it from stash list; apply restores changes while keeping the stash\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"apply commits the changes directly; pop stages them\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"pop discards uncommitted changes permanently\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"apply works only on untracked files\"}]"
        });
        quiz4.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz4.Id,
            NumberLabel = "Q05",
            Category = "RESET",
            QuestionText = "Which git reset flag moves the HEAD pointer while leaving the working directory and staged index untouched?",
            Hint = "It resets the commit history without losing staged or unstaged modifications.",
            CorrectOptionId = "b",
            OrderIndex = 5,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"--hard\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"--soft\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"--mixed\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"--merge\"}]"
        });
        quiz4.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz4.Id,
            NumberLabel = "Q06",
            Category = "WORKFLOWS",
            QuestionText = "Which Git command allows you to selectively apply an individual existing commit from one branch to another branch?",
            Hint = "Commonly used to backport a bug fix to a release branch.",
            CorrectOptionId = "d",
            OrderIndex = 6,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"git pull --pick\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"git clone --commit\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"git patch --apply\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"git cherry-pick\"}]"
        });
        quiz4.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz4.Id,
            NumberLabel = "Q07",
            Category = "CONFLICTS",
            QuestionText = "In a Git conflict marker, what separates your current changes from incoming branch changes?",
            Hint = "Surrounded by <<<<<<< and >>>>>>>.",
            CorrectOptionId = "c",
            OrderIndex = 7,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"-------\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"*******\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"=======\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"#######\"}]"
        });
        quiz4.Questions.Add(new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quiz4.Id,
            NumberLabel = "Q08",
            Category = "COLLABORATION",
            QuestionText = "Why is \"git revert\" preferred over \"git reset --hard\" for undoing commits that have already been pushed to a shared remote branch?",
            Hint = "It appends a new inverse commit rather than rewriting shared historical commits.",
            CorrectOptionId = "b",
            OrderIndex = 8,
            OptionsJson = "[{\"id\":\"a\",\"label\":\"A\",\"text\":\"revert runs faster across large repositories\"},{\"id\":\"b\",\"label\":\"B\",\"text\":\"revert safely creates a new commit that inverts the changes without rewriting commit history for other collaborators\"},{\"id\":\"c\",\"label\":\"C\",\"text\":\"reset --hard requires administrative credentials on GitHub\"},{\"id\":\"d\",\"label\":\"D\",\"text\":\"revert automatically tests the code before committing\"}]"
        });
        list.Add(quiz4);
        return list;
    }

    public static List<QuizAttempt> GetSeedAttempts(Dictionary<string, Guid> slugToQuizId)
    {
        var now = DateTime.UtcNow;
        var attempts = new List<QuizAttempt>();

        void Add(string slug, string name, string email, int score, int total, int pct, int pass, string status, int timeSec, bool flagged, string reason, int cohortWeek, int minutesAgo)
        {
            if (!slugToQuizId.TryGetValue(slug, out var quizId)) return;
            attempts.Add(new QuizAttempt
            {
                Id = Guid.NewGuid(),
                QuizId = quizId,
                UserName = name,
                UserEmail = email,
                Score = score,
                TotalQuestions = total,
                Percentage = pct,
                PassingScore = pass,
                Status = status,
                TimeSpentSeconds = timeSec,
                IsFlagged = flagged,
                FlagReason = flagged ? reason : null,
                CohortWeek = cohortWeek,
                CompletedAt = now.AddMinutes(-minutesAgo)
            });
        }

        Add("data-structures-algorithms", "Daniel Botan", "danbotan71@gmail.com", 9, 10, 91, 70, "PASSED", 1122, false, null, 8, 25);
        Add("react-frontend", "Daniel Chigaianu", "dan.chigaianu@gmail.com", 8, 10, 88, 70, "PASSED", 1160, false, null, 8, 45);
        Add("react-frontend", "Daniel Chitanu", "dk7999357@gmail.com", 8, 10, 74, 70, "PASSED", 1331, false, null, 8, 95);
        Add("data-structures-algorithms", "Gicu Caraman", "caramangicu25@gmail.com", 6, 10, 63, 70, "BORDERLINE", 1530, false, null, 8, 180);
        Add("sql-databases", "Mihail Goncearov", "forprogramm11@gmail.com", 8, 10, 82, 70, "PASSED", 1065, false, null, 8, 270);
        Add("sql-databases", "Sergiu Negara", "negara.sergiu2@gmail.com", 4, 10, 41, 70, "FAILED", 1798, true, "Screen share disconnected before final submission", 7, 360);
        Add("react-frontend", "Valeriu Bulgaru", "valeri.bulgaru06@gmail.com", 7, 10, 70, 70, "PASSED", 1250, false, null, 7, 1680);
        Add("react-frontend", "Veaceslav Nagorneac", "slavik@internflow.dev", 7, 10, 72, 70, "PASSED", 1320, false, null, 6, 3120);
        Add("sql-databases", "Valeriu Bulgaru", "valeri.bulgaru06@gmail.com", 6, 10, 65, 70, "BORDERLINE", 1410, false, null, 5, 7200);
        Add("data-structures-algorithms", "Daniel Botan", "danbotan71@gmail.com", 6, 10, 62, 70, "BORDERLINE", 1600, false, null, 4, 10800);
        Add("react-frontend", "Gicu Caraman", "caramangicu25@gmail.com", 6, 10, 58, 70, "FAILED", 1480, false, null, 3, 15000);
        Add("sql-databases", "Sergiu Negara", "negara.sergiu2@gmail.com", 5, 10, 53, 70, "FAILED", 1650, false, null, 2, 19200);
        Add("data-structures-algorithms", "Veaceslav Nagorneac", "slavik@internflow.dev", 5, 10, 48, 70, "FAILED", 1710, false, null, 1, 24000);

        return attempts;
    }
}
