Inkwell Test Cases

Each test in server/src/services/__tests__/ names the row it implements.

AuthService.register() (Lecture 12, Section 1.2)
#	Technique	Input	Expected Outcome
1	Black-box (equivalence: valid input)	Valid email, displayName, 8+ char password	User created, tokens returned
2	Black-box (equivalence: invalid partition)	Already-registered email	EmailAlreadyRegisteredError
3	Black-box (boundary)	Password of exactly 7 characters	WeakPasswordError
4	Black-box (boundary)	Password of exactly 8 characters	Succeeds (boundary is inclusive)
5	White-box (branch: missing field)	Empty email	ValidationError
6	White-box (branch: repository failure)	UserRepository.create throws (simulating a race-condition duplicate)	EmailAlreadyRegisteredError, not a leaked raw error
PostService.search() (Lecture 9, Workshop 12 Exercise 1)
#	Technique	Input	Expected Outcome
1	Black-box (equivalence: valid input, matches exist)	Query "modularity", no paging arguments	The strategy's { posts, hasMore } result is returned unchanged
2	Black-box (equivalence: valid input, no matches)	Query that matches no published post	{ posts: [], hasMore: false }, no error
3	Black-box (boundary: first page)	No page or pageSize given	Search runs with page 1 and 10 results per page
4	Black-box (equivalence: explicit paging)	page: 3, pageSize: 5	Search runs with exactly page 3 and 5 results per page
5	Black-box (boundary: more pages exist)	Strategy reports hasMore: true	Result has hasMore: true
6	White-box (branch: strategy failure)	The search strategy rejects (e.g. database unavailable)	search() rejects with the same error, not an empty result
7	White-box (Strategy seam)	Any valid query	The strategy is called once and PostRepository is never called directly by PostService

Rows 6 and 7 are white-box tests because the requirements never mention them. We know they are needed only because we read PostService.search(): it has no try/catch, so a failure must reach the caller, and it reaches the data layer only through searchStrategy, which is what makes the Strategy pattern swappable.

Not covered: a blank query. PostService.search() does no validation of its own (the route falls back to the normal feed when search is empty), so a test would only pin down behavior we have not decided on yet.
