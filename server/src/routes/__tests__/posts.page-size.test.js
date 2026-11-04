// server/src/routes/__tests__/posts.page-size.test.js
//
// Workshop 15, Exercise 1: STRIDE-derived Denial of Service mitigation on
// GET /api/posts. An oversized pageSize must be clamped to MAX_PAGE_SIZE,
// never passed straight through to the database.

import request from "supertest";
import { app } from "../../app.js";
import { prisma } from "../../db/client.js";
import { MAX_PAGE_SIZE } from "../post.routes.js";
import { resetDatabase, createTestUser } from "../../test-utils/fixtures.js";

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

test("an oversized pageSize is clamped to MAX_PAGE_SIZE (DoS mitigation)", async () => {
  // Arrange: one more published post than a single page may ever return
  const author = await createTestUser();
  await prisma.post.createMany({
    data: Array.from({ length: MAX_PAGE_SIZE + 1 }, (_, i) => ({
      authorId: author.id,
      title: `Post ${i}`,
      body: "Body",
      status: "PUBLISHED",
      publishedAt: new Date(),
    })),
  });

  // Act: ask for far more rows than allowed
  const res = await request(app).get("/api/posts?page=1&pageSize=1000000");

  // Assert: the request is served, but capped at the maximum page size
  expect(res.status).toBe(200);
  expect(res.body.posts).toHaveLength(MAX_PAGE_SIZE);
  expect(res.body.hasMore).toBe(true);
});

test("a normal pageSize is honored as requested", async () => {
  const author = await createTestUser();
  await prisma.post.createMany({
    data: Array.from({ length: 5 }, (_, i) => ({
      authorId: author.id,
      title: `Post ${i}`,
      body: "Body",
      status: "PUBLISHED",
      publishedAt: new Date(),
    })),
  });

  const res = await request(app).get("/api/posts?page=1&pageSize=3");

  expect(res.status).toBe(200);
  expect(res.body.posts).toHaveLength(3);
  expect(res.body.hasMore).toBe(true);
});
