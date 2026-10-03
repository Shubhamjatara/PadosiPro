import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters"),

  mobileNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Mobile number must be 10 digits"),

  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters"),

  businessName: z
    .string()
    .trim()
    .min(2, "Business name must be at least 2 characters"),
})
  .partial()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one profile field must be provided",
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
