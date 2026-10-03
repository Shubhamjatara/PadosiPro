require("./test-env.cjs");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const { after, before, beforeEach, mock, test } = require("node:test");
const express = require("express");

// Keep HTTP, validation, controller and service real; isolate database access.
const findMany = mock.fn(async () => []);
const dbPath = require.resolve("../src/db/PrismaClient.ts");
require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: { __esModule: true, default: { task: { findMany } } },
};
const taskRouter = require("../src/routes/task.routes.ts").default;

let server;
let baseUrl;

before(async () => {
  const app = express();
  app.use("/api", taskRouter);
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}/api/v1/tasks`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
      server.closeAllConnections();
    });
  }
});

beforeEach(() => {
  findMany.mock.resetCalls();
  findMany.mock.mockImplementation(async () => []);
});

test("public search returns tasks and passes trimmed, case-insensitive filters to Prisma", async () => {
  const tasks = [{ id: 1, name: "Cleaning", category: "Home", description: "House cleaning" }];
  findMany.mock.mockImplementation(async () => tasks);

  const response = await fetch(`${baseUrl}/search?search=%20CLEAN%20&category=%20Home%20`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    success: true,
    message: "Tasks fetched successfully",
    data: tasks,
  });
  assert.equal(findMany.mock.callCount(), 1);
  const query = findMany.mock.calls[0].arguments[0];
  assert.deepEqual(query.where, {
    OR: [
      { name: { contains: "CLEAN", mode: "insensitive" } },
      { description: { contains: "CLEAN", mode: "insensitive" } },
    ],
    category: { equals: "Home", mode: "insensitive" },
  });
  assert.deepEqual(query.orderBy, [{ category: "asc" }, { name: "asc" }]);
});

test("search without a category returns an empty array when nothing matches", async () => {
  const response = await fetch(`${baseUrl}/search?search=unmatched`);
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).data, []);
  assert.equal(findMany.mock.calls[0].arguments[0].where.category, undefined);
});

for (const [query, field] of [
  ["", "search"],
  ["?search=", "search"],
  ["?search=%20%20", "search"],
  ["?search=clean&search=repair", "search"],
  ["?search=clean&category=Home&category=Garden", "category"],
]) {
  test(`rejects invalid query ${query || "(missing search)"} before database access`, async () => {
    const response = await fetch(`${baseUrl}/search${query}`);
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.success, false);
    assert.equal(body.message, "Invalid query parameters");
    assert.ok(body.errors[field].length > 0);
    assert.equal(findMany.mock.callCount(), 0);
  });
}

test("database failures produce a generic 500 response", async (t) => {
  t.mock.method(console, "error", () => {});
  findMany.mock.mockImplementation(async () => {
    throw new Error("Private database details");
  });
  const response = await fetch(`${baseUrl}/search?search=clean`);
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), {
    success: false,
    message: "Internal server error",
  });
});

test("catalogue still permits browsing without a search term", async () => {
  const response = await fetch(baseUrl);
  assert.equal(response.status, 200);
  assert.deepEqual(findMany.mock.calls[0].arguments[0].where, {});
});
