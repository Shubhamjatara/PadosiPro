# PadosiPro — Design Notes

## Architecture

PadosiPro uses a React Native mobile app backed by a TypeScript and Express API, with PostgreSQL for persistence and Prisma for database access. The mobile app implements the requested registration, email verification, login, profile, task selection, home, and logout flows, including loading, empty, and error states.

The backend separates routes, controllers, services, validation schemas, and middleware. Controllers validate requests with Zod and return HTTP responses; services implement authentication, OTP handling, profiles, and task selection. Shared middleware verifies JWTs and restricts task selection to verified users. A single JWT service instance handles signing and verification, with a 24-hour expiry.

PostgreSQL stores users, hashed OTPs, the task catalogue, and user-task selections. Passwords and OTPs are hashed with bcrypt. Nodemailer sends verification emails through Gmail. Database, JWT, and email credentials are loaded from environment variables. The catalogue contains 24 tasks across six categories, with case-insensitive search and category filtering. Saving a selection replaces the previous selection inside a database transaction.

## Main Trade-offs

- **One backend and one database:** This keeps local setup and development straightforward. PostgreSQL currently handles both durable application data and short-lived OTP records, avoiding another infrastructure dependency.
- **PostgreSQL for OTPs:** Persistent records make expiry, attempt counts, and single-use status easy to inspect. However, expiry is checked by application code, and expired records need cleanup. Redis would better support short-lived verification state.
- **JWT authentication:** Tokens fit a mobile client and avoid a server-side session store. The current design has no refresh-token or revocation mechanism; logout removes the client token, while the token remains valid until expiry.
- **Simple catalogue queries:** Substring search is sufficient for a small seeded catalogue. Pagination and dedicated search indexing can be added if usage grows.
- **Isolated automated tests:** Mocked dependencies keep validation and JWT tests fast and independent of email or database availability. They do not prove the full OTP and login workflows against real infrastructure.

## What I Left Out

The requested user-facing features are implemented. The remaining work is mainly operational hardening: Redis-backed OTP storage, PgBouncer connection pooling, refresh-token rotation and revocation, broader abuse protection, and database-backed tests for OTP expiry, attempt limits, concurrent verification, and login rules. A complete containerized setup and automated deployment pipeline are also outside the current implementation.

## What I Would Do With Another Week

1. **Move OTP state to Redis.** Store only OTP hashes with a 10-minute TTL, enforce resend cooldowns with expiring keys, and make attempt counting and single-use consumption atomic. Keep user and task data in PostgreSQL. Use cryptographically secure OTP generation and test concurrent requests and Redis failures.
2. **Integrate PgBouncer.** Introduce connection pooling between the API and PostgreSQL, validate compatibility with Prisma's PostgreSQL adapter and transactions, and retain a direct database connection for migrations where needed. Load-test pool sizing and connection limits.
3. **Strengthen verification and operations.** Add integration tests for the complete authentication flow, apply shared throttling to registration and OTP resend, and add structured logs and dependency readiness checks. Finish a reproducible container setup and document deployment and recovery steps.
4. **Improve token refresh.** Add periodic token-refresh polling in the mobile app through a refresh-token endpoint, and shorten the access-token lifetime.
