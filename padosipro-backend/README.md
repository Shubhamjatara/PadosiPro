# PadosiPro Backend

A TypeScript and Express API for the PadosiPro onboarding flow: registration, email OTP verification, login, profile updates, task browsing, and task selection.

This repository contains the backend only. Mobile app source, APK/IPA builds, and mobile build instructions are not included.

## Technology

- Node.js, TypeScript, and Express 5
- PostgreSQL with Prisma ORM and the PostgreSQL driver adapter
- Zod for request and token-claim validation
- bcrypt for password and OTP hashing
- JSON Web Tokens through a shared `JwtService` instance
- Nodemailer for email delivery
- Node's built-in test runner with `tsx`

## Prerequisites

- Node.js 24 or later; the project has been checked with Node.js 24.18.0.
- npm, included with Node.js.
- A running PostgreSQL server and a database/user you control.
- Docker Desktop or Docker Engine, if using the PostgreSQL container below.
- Working email delivery configuration for registration and OTP verification; see [Email delivery](#email-delivery).

Run all commands below from the repository root. Use a local development database and test accounts.

## Local setup

### 1. Install dependencies

```sh
npm install
```

### 2. Configure the environment

Create a file named `.env` in the project root, next to `package.json`. If it
already exists, edit it and keep any values you have already configured. Fill
in these environment variables with your own values:

```dotenv
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/padosipro?schema=public"
JWT_SECRET=""
SMTP_USER="your-sender@gmail.com"
SMTP_PASS="your-gmail-app-password"
SMTP_FROM="your-sender@gmail.com"
PORT=3000
```

For `DATABASE_URL`, replace `YOUR_USER` and `YOUR_PASSWORD` with your PostgreSQL
credentials, and update the host, port, and database name if necessary. Use
URL-encoded credentials if they contain special characters.

Set `SMTP_USER` to your Gmail sender address and `SMTP_PASS` to its Gmail app
password. Set `SMTP_FROM` to the same sender address, or omit it to use
`SMTP_USER`. `PORT` is optional and defaults to `3000`.

If you do not already have a `JWT_SECRET`, generate one:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Paste the generated value into `JWT_SECRET`. Do not leave it empty.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection URL used by the application and Prisma CLI. |
| `JWT_SECRET` | Yes | Secret used to sign and verify authentication tokens. |
| `SMTP_USER` | Yes | Gmail account used by Nodemailer. |
| `SMTP_PASS` | Yes | Gmail app password for that account. |
| `SMTP_FROM` | No | Sender address; defaults to `SMTP_USER`. |
| `PORT` | No | HTTP port; defaults to `3000`. |

The application loads `.env` from the working directory and fails when a required variable is missing or blank. Process environment variables take precedence over `.env`. Keep the JWT secret stable across restarts; changing it invalidates existing tokens. `.env` is ignored by Git; do not commit or share its real credentials. The block above is the configuration template; no `.env.example` file is required for these setup steps.

### 3. Prepare the database

To run PostgreSQL locally with Docker, start Docker and run:

```sh
docker run --name padosipro-postgres -e POSTGRES_USER=padosipro -e POSTGRES_PASSWORD=local-dev-password -e POSTGRES_DB=padosipro -p 127.0.0.1:5432:5432 -v padosipro-postgres-data:/var/lib/postgresql/data -d postgres:16
```

This creates the database automatically and stores its data in a persistent
Docker volume. These example credentials are for local development. Set the
matching value in `.env` when using this container:

```dotenv
DATABASE_URL="postgresql://padosipro:local-dev-password@localhost:5432/padosipro?schema=public"
```

Check readiness before running migrations; repeat if PostgreSQL is still starting:

```sh
docker exec padosipro-postgres pg_isready -U padosipro -d padosipro
```

If port `5432` is already occupied, use `-p 127.0.0.1:5433:5432` in the run
command and change the URL's port to `5433`. The backend runs on your host
with `npm run dev`.

For later sessions, start or stop the existing container:

```sh
docker start padosipro-postgres
docker stop padosipro-postgres
```

Use `docker run` only for the initial container creation. Database initialization
variables apply when the volume is first created; changing them does not update
credentials in an existing database.

If you already have PostgreSQL installed, create the `padosipro` database using
your administration tool, or run this SQL as a user with permission to create
databases. Skip this SQL when using the Docker command above:

```sql
CREATE DATABASE padosipro;
```

Generate the Prisma client and apply the checked-in migrations:

```sh
npm run prisma:generate
npx prisma migrate deploy
```

For future schema development, `npm run prisma:migrate` runs Prisma's development migration command and may require shadow-database permissions.

### 4. Seed the task catalogue

On a fresh development database, run:

```sh
npx tsx src/script/seed.ts
```

The seed defines 24 tasks across six categories: Home Services, Cleaning, Repair & Maintenance, Beauty & Personal Care, Automotive, and Moving & Delivery.

**The seed deletes existing catalogue tasks before inserting new ones.** Use it on a fresh database; rerunning it can leave existing user selections pointing to deleted task IDs.

The current `npm run prisma:seed` script points to the empty `prisma/seed.ts` file. Use the explicit command above until that script is connected to the actual seed.

### 5. Start the API

```sh
npm run dev
```

The API listens on `http://localhost:3000` by default and reloads when source files change.

Check that the HTTP server responds:

```sh
curl http://localhost:3000/health
```

```json
{
  "success": true,
  "message": "PadosiPro API is running"
}
```

The health route checks the HTTP server only; it does not verify database or email availability.

## Email delivery

The implementation uses Nodemailer with Gmail in `src/services/email.service.ts`. Set `SMTP_USER` and `SMTP_PASS` in `.env` to your Gmail sender account and its app password. `SMTP_FROM` optionally sets the sender address and otherwise defaults to `SMTP_USER`. The transport still uses Nodemailer's `gmail` service preset; custom SMTP hosts and local mail catchers are not currently configured.

Registration, verification, and resend flows need working email delivery. Credentials are loaded through the shared environment configuration and are not embedded in source. Rotate any email credential that was previously exposed or committed before deploying or sharing the project.

## Build and run compiled code

After environment and database setup:

```sh
npm run build
npm start
```

TypeScript output is written to `dist/`; the entry point is `dist/src/app.js`. Start from the repository root so `.env` is found.

## API reference

Base URL: `http://localhost:3000/api/v1`.

Send JSON bodies with `Content-Type: application/json`. Protected routes use:

```http
Authorization: Bearer <token>
```

| Method | Path | Access | Input / behavior |
| --- | --- | --- | --- |
| POST | `/register` | Public | `email`, `password`, `confirmPassword`; returns a verification token. |
| POST | `/verify` | JWT | `otp`; verifies email and returns a verified-user token. |
| POST | `/resend-otp` | JWT | No body; sends another OTP subject to cooldown. |
| POST | `/login` | Public | `email`, `password`; returns a token for verified users. |
| GET | `/profile` | JWT | Returns the current user's profile. |
| PATCH | `/profile` | JWT | Updates supplied profile fields. |
| GET | `/tasks` | Public | Lists tasks; optional `search` and `category` query parameters. |
| GET | `/tasks/search` | Public | Requires `search`; accepts an optional `category`. |
| GET | `/tasks/categories` | Public | Returns tasks grouped by category. |
| GET | `/tasks/selection` | JWT + verified email | Returns selected tasks. |
| PUT | `/tasks/selection` | JWT + verified email | Replaces the selection with the supplied `taskIds`. |

`GET /health` is outside the `/api/v1` prefix and is public.

### Authentication flow

1. Register with matching passwords. Store the returned `data.token` for verification requests.
2. Read the emailed OTP and submit it as a six-digit string to `/verify` with that token.
3. Replace the verification token with the verified-user token returned by `/verify`.
4. Update the profile, browse tasks, and save the selection.
5. Returning users call `/login`. Unverified users receive HTTP 403 with `code: "VERIFY_OTP"`.

JWTs expire after 24 hours. The shared service signs tokens and verifies their signature, expiry, and claims. Claims require a positive integer `userId` and a boolean `is_verified`. There is no refresh-token or server-side logout endpoint; clients remove their saved token on logout.

### Validation rules

- **Registration:** valid email, a password of at least 8 characters and no more than 72 UTF-8 bytes, and a matching confirmation. Email whitespace is trimmed; password content is preserved.
- **Login:** valid email and a nonempty string password. Existing short passwords remain accepted for authentication.
- **OTP:** exactly six digits, sent as a string. Codes expire after 10 minutes, are single-use, and allow at most five incorrect attempts. The resend endpoint enforces a 30-second cooldown. Only OTP hashes are stored.
- **Profile:** a nonempty subset of `name`, `mobileNumber`, `address`, and `businessName`. Names require at least two characters, addresses at least five, and mobile numbers exactly ten digits without the `+91` prefix. Omitted fields remain unchanged. Business name may be omitted from a PATCH because partial updates are supported; profile-completion requirements are not enforced.
- **Task selection:** a nonempty array of unique positive integer IDs. Every ID must exist. An empty array cannot currently clear the selection.

Profile update example:

```json
{
  "name": "Demo User",
  "mobileNumber": "9999999999",
  "address": "123 Test Street",
  "businessName": "Demo Business"
}
```

Task selection example; replace the IDs with values returned by the catalogue:

```json
{
  "taskIds": [1, 2, 3]
}
```

### Task search

```sh
curl "http://localhost:3000/api/v1/tasks/search?search=clean&category=Cleaning"
```

Search matches substrings in task names or descriptions, case-insensitively. Category is a case-insensitive exact match. Both inputs are trimmed, and results are sorted by category then name. An empty category applies no category filter.

Missing or blank search text returns HTTP 400. No matches returns HTTP 200 with `data: []`. The general `/tasks` endpoint also supports searching but permits requests with no search term.

## Responses and errors

Controller success responses generally contain `success`, `message`, and `data`. Validation failures return HTTP 400 with field-level `errors`; body-level failures can also include `formErrors`.

```json
{
  "success": false,
  "message": "Invalid verification data",
  "errors": {
    "otp": ["OTP must be a six-digit string"]
  },
  "formErrors": []
}
```

| Status | Typical meaning |
| --- | --- |
| 200 / 201 | Successful request / registration. |
| 400 | Invalid request fields, invalid OTP, or invalid task selection. |
| 401 | Missing/invalid/expired token, invalid credentials, or unverified task access. |
| 403 | Login attempted before email verification. |
| 404 | User not found in profile lookup or OTP resend. |
| 409 | Registration with an already verified email. |
| 429 | OTP resend requested before cooldown ends. |
| 500 | Unexpected server, database, or email failure. |

Malformed JSON and unmatched routes currently use Express's default error handling and may return a different response format.

## Tests

```sh
npm test
```

The current suite contains 74 checks covering request validation, protected routes, JWT signing and verification, partial profile updates, and task search. Tests use dedicated test environment values and mocked database/service calls; they do not require PostgreSQL or send emails.

The suite does **not** yet exercise real OTP generation, expiry, attempt-limit persistence, or the actual login service's password/account rules. Those remain required additions for the assignment's engineering-quality section. Passing these tests does not establish full database or email integration coverage.

```sh
npm run build
```

Use the build command separately to check TypeScript compilation.

## Project structure

```text
prisma/
  schema.prisma            Database models
  migrations/              Checked-in SQL migrations
  seed.ts                  Empty placeholder; see actual seed below
src/
  app.ts                   Express application and route mounting
  config/Enviroment.ts      Required environment configuration
  controllers/             Request validation and HTTP responses
  services/                Authentication, OTP, email, profile, tasks, JWT
  middleware/              Token and email-verification checks
  validators/              Zod request and claim schemas
  routes/                  API route definitions
  db/                      Prisma client and connection check
  generated/prisma/        Generated Prisma client
  script/seed.ts           Task catalogue seed
tests/                     HTTP validation and JWT tests
```

## Client integration and remaining work

- Browser CORS currently allows `http://localhost:8081`. Adjust `src/app.ts` if the browser client uses another origin.
- On a physical device, configure the client with a reachable backend host address; `localhost` refers to that device. No mobile client is included here.
- First-login profile completion, persistent mobile authentication, native screens, and APK/IPA builds belong to the mobile deliverable and are not implemented in this repository.
- `DESIGN.md` is currently empty. The architecture and trade-off document still needs to be written.
- There is no Docker Compose setup or combined first-time setup command yet.
- The Prisma client module performs an import-time connection check and disconnect; this should be separated from normal application startup.
- OTP generation currently uses `Math.random()`. Cryptographically secure generation and concurrency checks for OTP consumption remain hardening work.
- Registering an existing unverified account generates another OTP without the resend endpoint's cooldown. The cooldown should be shared by both paths.
