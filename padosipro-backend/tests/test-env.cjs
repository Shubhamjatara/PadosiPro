// Isolate tests from local credentials; database access is mocked.
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/padosipro_test";
process.env.JWT_SECRET = "test-only-jwt-secret-not-for-deployment";
process.env.SMTP_USER = "sender@example.test";
process.env.SMTP_PASS = "test-only-mail-password";
process.env.SMTP_FROM = "sender@example.test";
