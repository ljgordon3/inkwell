// server/src/routes/post.routes.js
//
// Wires PostService's publish() and listPublished() to
// the API contract's POST /api/posts and GET /api/posts (Lecture 4).
// Same thin-route discipline as auth.routes.js: no business rules here.
import { Router } from "express";
import { PostService } from "../services/post.service.js";
import { TokenService } from "../services/token.service.js";
import { getTotalPostsPublished } from "../events/listeners/log-published-posts.listener.js";

const router = Router();

function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization ?? "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Missing or malformed Authorization header." },
    });
  }
  try {
    const payload = TokenService.verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    res.status(401).json({
      error: { code: "INVALID_TOKEN", message: "Invalid or expired access token." },
    });
  }
}

router.post("/posts", requireAuth, async (req, res) => {
  try {
    const { title, body, tagNames } = req.body;
    const post = await PostService.publish({ authorId: req.user.id, title, body, tagNames });
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({
      error: { code: err.code || "VALIDATION_ERROR", message: err.message },
    });
  }
});

router.get("/posts", async (req, res, next) => {
  try {
    const { search } = req.query;
    const page = Number(req.query.page) || 1;
    const result = search
      ? await PostService.search({ query: search, page })
      : await PostService.listPublished({ page });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/stats", (req, res) => {
  res.status(200).json({ totalPostsPublished: getTotalPostsPublished() });
});

export default router;
