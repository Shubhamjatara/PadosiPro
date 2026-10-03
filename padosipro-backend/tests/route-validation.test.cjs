require("./test-env.cjs");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const { after, before, beforeEach, mock, test } = require("node:test");
const express = require("express");
const jwt = require("jsonwebtoken");

function replaceModule(path, value) {
  const filename = require.resolve(path);
  require.cache[filename] = {
    id: filename, filename, loaded: true,
    exports: { __esModule: true, default: value },
  };
}

// Never connect to a database or send mail during validation checks.
const auth = {
  register: mock.fn(async () => ({ userId: 1 })),
  login: mock.fn(async () => ({ token: "login-token", is_verified: true })),
  verifyEmail: mock.fn(async () => ({ userId: 1, emailVerified: true })),
};
const otp = {
  checkResendCooldown: mock.fn(async () => {}),
  resendOtp: mock.fn(async () => ({ userId: 1 })),
};
const db = {
  user: {
    update: mock.fn(async ({ data }) => ({ id: 1, ...data })),
    findUnique: mock.fn(async () => ({ id: 1, name: "Existing user" })),
  },
  task: { findMany: mock.fn(async () => []) },
  userTask: { findMany: mock.fn(async () => []) },
};
replaceModule("../src/services/auth.service.ts", auth);
replaceModule("../src/services/otp.service.ts", otp);
replaceModule("../src/db/PrismaClient.ts", db);

const routers = [
  require("../src/routes/auth.routes.ts").default,
  require("../src/routes/profile.routes.ts").default,
  require("../src/routes/task.routes.ts").default,
];
const Environment = require("../src/config/Enviroment.ts").default;
const calls = [...Object.values(auth), ...Object.values(otp),
  ...Object.values(db.user), ...Object.values(db.task), ...Object.values(db.userTask)];
const tokenFor = (claims, options = {}) => jwt.sign(claims, Environment.JWT_SECRET, options);
const verified = tokenFor({ userId: 1, is_verified: true }, { expiresIn: "1h" });
const unverified = tokenFor({ userId: 1, is_verified: false }, { expiresIn: "1h" });
let server;
let baseUrl;

before(async () => {
  const app = express();
  app.use(express.json());
  for (const router of routers) app.use("/api", router);
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`;
});
after(async () => {
  if (server) await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  });
});
beforeEach(() => calls.forEach((fn) => fn.mock.resetCalls()));

async function request(method, path, body, token) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token !== undefined) headers.Authorization = `Bearer ${token}`;
  return fetch(`${baseUrl}${path}`, {
    method, headers, body: body === undefined ? undefined : JSON.stringify(body),
  });
}
function assertNoServiceCalls() {
  for (const fn of calls) assert.equal(fn.mock.callCount(), 0);
}

const registration = { email: "user@example.com", password: "password123", confirmPassword: "password123" };
const invalidInputs = [
  ["POST", "/register", undefined],
  ["POST", "/register", []],
  ["POST", "/register", { ...registration, email: 123 }],
  ["POST", "/register", { ...registration, email: "invalid" }],
  ["POST", "/register", { ...registration, password: 123, confirmPassword: 123 }],
  ["POST", "/register", { ...registration, password: "short", confirmPassword: "short" }],
  ["POST", "/register", { ...registration, password: "a".repeat(73), confirmPassword: "a".repeat(73) }],
  ["POST", "/register", { ...registration, password: "é".repeat(37), confirmPassword: "é".repeat(37) }],
  ["POST", "/register", { ...registration, confirmPassword: "different" }],
  ["POST", "/login", undefined],
  ["POST", "/login", { email: "invalid", password: "password123" }],
  ["POST", "/login", { email: [], password: "password123" }],
  ["POST", "/login", { email: registration.email, password: {} }],
  ["POST", "/login", { email: registration.email, password: "" }],
  ["POST", "/verify", undefined],
  ["POST", "/verify", { otp: 123456 }],
  ["POST", "/verify", { otp: "12345" }],
  ["POST", "/verify", { otp: "1234567" }],
  ["POST", "/verify", { otp: "abcdef" }],
  ["PATCH", "/profile", undefined],
  ["PATCH", "/profile", {}],
  ["PATCH", "/profile", { unsupported: "value" }],
  ["PATCH", "/profile", { name: " " }],
  ["PATCH", "/profile", { name: null }],
  ["PATCH", "/profile", { mobileNumber: "123" }],
  ["PATCH", "/profile", { address: "a" }],
  ["PATCH", "/profile", { businessName: false }],
  ["PUT", "/tasks/selection", undefined],
  ["PUT", "/tasks/selection", { taskIds: [] }],
  ["PUT", "/tasks/selection", { taskIds: [1, 1] }],
  ["PUT", "/tasks/selection", { taskIds: [0] }],
  ["PUT", "/tasks/selection", { taskIds: [-1] }],
  ["PUT", "/tasks/selection", { taskIds: [1.5] }],
  ["PUT", "/tasks/selection", { taskIds: ["1"] }],
];
for (const [index, [method, path, body]] of invalidInputs.entries()) {
  test(`${method} ${path} rejects invalid input #${index + 1} before service access`, async () => {
    const response = await request(method, path, body, verified);
    assert.equal(response.status, 400);
    const result = await response.json();
    assert.equal(result.success, false);
    assert.ok(Object.keys(result.errors).length || result.formErrors?.length);
    assertNoServiceCalls();
  });
}

test("registration trims email and preserves password whitespace", async () => {
  const password = " password123 ";
  const response = await request("POST", "/register", {
    email: " user@example.com ", password, confirmPassword: password,
  });
  assert.equal(response.status, 201);
  assert.deepEqual(auth.register.mock.calls[0].arguments, ["user@example.com", password]);
});
test("registration accepts a password at the 72-byte boundary", async () => {
  const password = "é".repeat(36);
  assert.equal((await request("POST", "/register", { ...registration, password, confirmPassword: password })).status, 201);
});
test("login accepts legacy short passwords without modifying them", async () => {
  assert.equal((await request("POST", "/login", { email: " user@example.com ", password: "old" })).status, 200);
  assert.deepEqual(auth.login.mock.calls[0].arguments, ["user@example.com", "old"]);
});
test("verification accepts a six-digit string and an unverified token", async () => {
  assert.equal((await request("POST", "/verify", { otp: "012345" }, unverified)).status, 200);
  assert.deepEqual(auth.verifyEmail.mock.calls[0].arguments, ["012345", 1]);
});
test("partial profile update writes only the supplied allowed field", async () => {
  assert.equal((await request("PATCH", "/profile", { name: "  Updated name  ", emailVerified: true }, verified)).status, 200);
  const query = db.user.update.mock.calls[0].arguments[0];
  assert.deepEqual(query.where, { id: 1 });
  assert.deepEqual(query.data, { name: "Updated name" });
});

const protectedRoutes = [
  ["POST", "/verify"], ["POST", "/resend-otp"],
  ["GET", "/profile"], ["PATCH", "/profile"],
  ["GET", "/tasks/selection"], ["PUT", "/tasks/selection"],
];
for (const [method, path] of protectedRoutes) {
  test(`${method} ${path} requires authentication`, async () => {
    assert.equal((await request(method, path)).status, 401);
    assertNoServiceCalls();
  });
  test(`${method} ${path} rejects signed tokens with invalid claims`, async () => {
    const token = tokenFor({ userId: "1", is_verified: "false" });
    assert.equal((await request(method, path, undefined, token)).status, 401);
    assertNoServiceCalls();
  });
}
for (const claims of [
  {}, { userId: 1 }, { userId: 0, is_verified: true },
  { userId: -1, is_verified: true }, { userId: 1.5, is_verified: true },
  { userId: 1, is_verified: "true" },
]) {
  test(`rejects invalid claim payload ${JSON.stringify(claims)}`, async () => {
    assert.equal((await request("GET", "/profile", undefined, tokenFor(claims))).status, 401);
    assertNoServiceCalls();
  });
}
test("expired tokens, invalid signatures and extra header parts are rejected", async () => {
  for (const token of [
    tokenFor({ userId: 1, is_verified: true }, { expiresIn: -1 }),
    jwt.sign({ userId: 1, is_verified: true }, "incorrect-test-secret"),
    `${verified} extra`,
  ]) {
    assert.equal((await request("GET", "/profile", undefined, token)).status, 401);
  }
  assertNoServiceCalls();
});
for (const method of ["GET", "PUT"]) {
  test(`${method} task selection rejects unverified users`, async () => {
    assert.equal((await request(method, "/tasks/selection", undefined, unverified)).status, 401);
    assertNoServiceCalls();
  });
}
test("authenticated reads and OTP resend remain available", async () => {
  assert.equal((await request("GET", "/profile", undefined, verified)).status, 200);
  assert.equal((await request("GET", "/tasks/selection", undefined, verified)).status, 200);
  assert.equal((await request("POST", "/resend-otp", undefined, unverified)).status, 200);
  assert.deepEqual(otp.checkResendCooldown.mock.calls[0].arguments, [1]);
  assert.deepEqual(otp.resendOtp.mock.calls[0].arguments, [1]);
});
test("public catalogue and categories remain accessible", async () => {
  for (const path of ["/tasks", "/tasks/categories"]) {
    assert.equal((await request("GET", path)).status, 200);
  }
});
