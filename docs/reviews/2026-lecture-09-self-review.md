# Review: Tagging, Strategy Search, Observer Publish Event (Self-Review)

**Reviewer prep time:** ~20 minutes
**Defects found:** 9 (password hash exposed by public feed and search, all publish errors reported as 400, failing listener breaks publish, plus 6 minor issues)
**Outcome:** Changes required, fix the three major defects in a follow-up commit

**Findings (High, Medium):**

1. **High:** `findPublished` and `searchPublished` use `include: { author: true }`, so `GET /api/posts` returns each author's `passwordHash` and `email`. Select only `id` and `displayName`.
2. **Medium:** `POST /api/posts` maps every error to `400 VALIDATION_ERROR`, including database errors, and returns the raw Prisma message. Only `ValidationError` should become a 400.
3. **Medium:** `EventBus.emit` has no error isolation, so a throwing listener makes `publish()` fail after the post is already saved.

**Findings (Low):**

4. `GET /api/stats` reads a listener module directly instead of going through a Service.
5. `server/src/event-bus.js` and `server/src/services/substring-search.strategy.js` are unused duplicates (the second has a broken import path).
6. `findPublished` and `searchPublished` repeat the same pagination and `hasMore` logic.
7. Lecture 9 commits do not reference US-08 or US-09, one commit mixes unrelated changes, and `docs/BACKLOG.md` is not updated.
8. `NavBar.jsx` and `PostEditor.jsx` sit in `server/src/components/` but belong in `client/`.
9. Copy-paste formatting damage (hard-wrapped lines, lost indentation) in several files.

Checklist items not applicable: UX and accessibility (no client changes in Lecture 9).

See Lecture 10, Section 1.3 for the checklist used.
