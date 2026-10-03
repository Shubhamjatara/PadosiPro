import dotenv from "dotenv";

dotenv.config({ quiet: true });

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

class Environment {
  static readonly DATABASE_URL = requiredEnv("DATABASE_URL");
  static readonly JWT_SECRET = requiredEnv("JWT_SECRET");
  static readonly SMTP_USER = requiredEnv("SMTP_USER");
  static readonly SMTP_PASS = requiredEnv("SMTP_PASS");
  static readonly SMTP_FROM = process.env.SMTP_FROM?.trim() || Environment.SMTP_USER;
}

export default Environment;
