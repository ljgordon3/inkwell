// server/src/routes/__tests__/auth.integration.test.js
//
// Workshop 13, Exercise 1: registration and login tested together through
// real HTTP requests, real Services, real Repositories, and the isolated
// test database — no mocks. Registration creates the account that login
// then has to find, so this checks that the two halves agree on how a
// password is stored and verified (US-01 + US-02).

import request from "supertest";
import { app } from "../../app.js";
import { prisma } from "../../db/client.js";
import { resetDatabase } from "../../test-utils/fixtures.js";

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

test("a user can log in with the credentials they just registered (US-01, US-02 validation)", async () => {
  // Arrange + Act: register a real user
  const credentials = { email: "alice@example.com", password: "correcthorse" };
  const registerRes = await request(app)
    .post("/api/auth/register")
    .send({ ...credentials, displayName: "Alice" });

  expect(registerRes.status).toBe(201);

  // Act: log in with the same email and password
  const loginRes = await request(app).post("/api/auth/login").send(credentials);

  // Assert: login succeeds as the same account and issues usable tokens
  expect(loginRes.status).toBe(200);
  expect(loginRes.body.user.id).toBe(registerRes.body.user.id);
  expect(loginRes.body.user.email).toBe("alice@example.com");
  expect(typeof loginRes.body.accessToken).toBe("string");
  expect(loginRes.body.accessToken.length).toBeGreaterThan(0);
  expect(typeof loginRes.body.refreshToken).toBe("string");
  expect(loginRes.body.refreshToken.length).toBeGreaterThan(0);
});
