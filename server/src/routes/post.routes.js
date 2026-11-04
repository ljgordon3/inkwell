import { Router } from "express";
import { PostService } from "../services/post.service.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Exercise 1 (Lecture 15): STRIDE Denial of Service mitigation for
// GET /api/posts. Without an upper bound, a single request such as
// ?pageSize=1000000 asks the database for the entire posts table in one
// query. Oversized (or invalid) values are clamped to a safe range
// instead of being passed through.
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

function clampPageSize(raw) {
  const requested = Number.parseInt(raw, 10);
  if (!Number.isFinite(requested) || requested < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(requested, MAX_PAGE_SIZE);
}

// server/src/routes/post.routes.js — AFTER (hardened)
router.post("/posts", requireAuth, async (req, res, next) => {
  try {
    // Never trust client-supplied identity fields — derive
    // authorId from the authenticated request, not the request body.
    const post = await PostService.publish({
      ...req.body,
      authorId: req.user.id, // set by requireAuth middleware from the verified JWT
    });
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
});

router.get("/posts", async (req, res, next) => {
  try {
    const { page = 1, search } = req.query;
    const pageSize = clampPageSize(req.query.pageSize);
    const result = search
      ? await PostService.search({ query: search, page: Number(page), pageSize })
      : await PostService.listPublished({ page: Number(page), pageSize });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
