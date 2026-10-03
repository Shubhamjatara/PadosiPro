require("./test-env.cjs");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const jwt = require("jsonwebtoken");
const jwtService = require("../src/services/jwt.service.ts").default;
const Environment = require("../src/config/Enviroment.ts").default;

for (const is_verified of [false, true]) {
  test(`shared JWT service signs and verifies claims (verified=${is_verified}) with 24-hour expiry`, () => {
    const claims = { userId: 42, is_verified };
    const token = jwtService.sign(claims);
    const decoded = jwt.verify(token, Environment.JWT_SECRET);
    assert.equal(decoded.exp - decoded.iat, 24 * 60 * 60);
    assert.deepEqual(jwtService.verify(token), claims);
    assert.deepEqual(claims, { userId: 42, is_verified });
  });
}

test("shared JWT service rejects malformed, expired, incorrectly signed and invalid-claim tokens", () => {
  const claims = { userId: 42, is_verified: true };
  for (const token of [
    "invalid-token",
    jwt.sign(claims, Environment.JWT_SECRET, { expiresIn: -1 }),
    jwt.sign(claims, "incorrect-test-secret"),
    jwt.sign({ userId: "42", is_verified: true }, Environment.JWT_SECRET),
  ]) {
    assert.throws(() => jwtService.verify(token));
  }
});
