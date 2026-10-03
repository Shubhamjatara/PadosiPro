import { z } from "zod";

const emailSchema = z.string().trim().email("A valid email address is required");

export const registerSchema = z
  .object({
    email: emailSchema,
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      // bcrypt only uses the first 72 bytes, including multi-byte characters.
      .refine((value) => Buffer.byteLength(value, "utf8") <= 72, {
        message: "Password must not exceed 72 bytes",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  // Existing accounts may predate the registration password policy.
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  otp: z.string().regex(/^[0-9]{6}$/, "OTP must be a six-digit string"),
});

export const authClaimsSchema = z.object({
  userId: z.number().int().positive(),
  is_verified: z.boolean(),
});

export type AuthClaims = z.infer<typeof authClaimsSchema>;
