import { z } from "zod";

export const taskQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
});

export const taskSearchQuerySchema = taskQuerySchema.extend({
  search: z.string().trim().min(1, "Search term is required"),
});

export const selectedTasksSchema = z.object({
  taskIds: z
    .array(
      z.number().int().positive()
    )
    .min(1, "At least one task must be selected")
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Task IDs must be unique",
    }),
});
