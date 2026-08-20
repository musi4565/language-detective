import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";

let server;
let base;

before(async () => {
  server = app.listen(0);
  await new Promise((r) => server.once("listening", r));
  base = `http://localhost:${server.address().port}`;
});

after(async () => {
  server.close();
  await prisma.$disconnect();
});

async function api(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(base + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

const uniqueEmail = () => `test_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;

test("health endpoint responds", async () => {
  const { status, data } = await api("/api/health");
  assert.equal(status, 200);
  assert.equal(data.success, true);
});

test("register creates a user and returns token", async () => {
  const { status, data } = await api("/api/auth/register", {
    method: "POST",
    body: {
      name: "Test Person",
      email: uniqueEmail(),
      password: "secret123",
      nativeLanguage: "Uzbek",
      learningLanguage: "English",
    },
  });
  assert.equal(status, 201);
  assert.ok(data.data.token);
  assert.equal(data.data.user.name, "Test Person");
  assert.equal(data.data.user.role, "USER");
});

test("register rejects duplicate email", async () => {
  const email = uniqueEmail();
  const body = { name: "A", email, password: "secret123" };
  await api("/api/auth/register", { method: "POST", body });
  const { status } = await api("/api/auth/register", { method: "POST", body });
  assert.equal(status, 409);
});

test("register validates password length", async () => {
  const { status } = await api("/api/auth/register", {
    method: "POST",
    body: { name: "A", email: uniqueEmail(), password: "123" },
  });
  assert.equal(status, 400);
});

test("login succeeds with correct credentials", async () => {
  const email = uniqueEmail();
  await api("/api/auth/register", {
    method: "POST",
    body: { name: "B", email, password: "secret123" },
  });
  const { status, data } = await api("/api/auth/login", {
    method: "POST",
    body: { email, password: "secret123" },
  });
  assert.equal(status, 200);
  assert.ok(data.data.token);
});

test("login fails with wrong password", async () => {
  const { status } = await api("/api/auth/login", {
    method: "POST",
    body: { email: "nobody@example.com", password: "wrong" },
  });
  assert.equal(status, 401);
});

test("protected route requires token", async () => {
  const { status } = await api("/api/auth/me");
  assert.equal(status, 401);
});

test("protected route works with token", async () => {
  const email = uniqueEmail();
  const reg = await api("/api/auth/register", {
    method: "POST",
    body: { name: "C", email, password: "secret123" },
  });
  const { status, data } = await api("/api/auth/me", { token: reg.data.data.token });
  assert.equal(status, 200);
  assert.equal(data.data.user.email, email);
});

test("rejects invalid token", async () => {
  const { status } = await api("/api/auth/me", { token: "not-a-valid-token" });
  assert.equal(status, 401);
});

test("writing analysis returns 503 when AI not configured", async () => {
  const email = uniqueEmail();
  const reg = await api("/api/auth/register", {
    method: "POST",
    body: { name: "D", email, password: "secret123" },
  });
  const { status } = await api("/api/writing/analyze", {
    method: "POST",
    token: reg.data.data.token,
    body: { text: "Yesterday I go to school." },
  });
  assert.equal(status, 503);
});

test("writing analysis validates short text", async () => {
  const email = uniqueEmail();
  const reg = await api("/api/auth/register", {
    method: "POST",
    body: { name: "E", email, password: "secret123" },
  });
  const { status } = await api("/api/writing/analyze", {
    method: "POST",
    token: reg.data.data.token,
    body: { text: "hi" },
  });
  assert.equal(status, 400);
});

test("mistakes list is empty for fresh user", async () => {
  const email = uniqueEmail();
  const reg = await api("/api/auth/register", {
    method: "POST",
    body: { name: "F", email, password: "secret123" },
  });
  const { status, data } = await api("/api/mistakes", { token: reg.data.data.token });
  assert.equal(status, 200);
  assert.equal(data.data.total, 0);
});

test("practice generation requires AI and returns 503 without it", async () => {
  const email = uniqueEmail();
  const reg = await api("/api/auth/register", {
    method: "POST",
    body: { name: "G", email, password: "secret123" },
  });
  const { status } = await api("/api/practice", { token: reg.data.data.token });
  assert.equal(status, 503);
});

test("admin route blocked for normal user", async () => {
  const email = uniqueEmail();
  const reg = await api("/api/auth/register", {
    method: "POST",
    body: { name: "H", email, password: "secret123" },
  });
  const { status } = await api("/api/admin/users", { token: reg.data.data.token });
  assert.equal(status, 403);
});

test("users cannot see other users' data (no mistakes exposed)", async () => {
  const a = await api("/api/auth/register", {
    method: "POST",
    body: { name: "UserA", email: uniqueEmail(), password: "secret123" },
  });
  const b = await api("/api/auth/register", {
    method: "POST",
    body: { name: "UserB", email: uniqueEmail(), password: "secret123" },
  });
  const { status, data } = await api("/api/mistakes", { token: b.data.data.token });
  assert.equal(status, 200);
  assert.equal(data.data.total, 0);
});