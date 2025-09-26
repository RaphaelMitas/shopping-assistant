import z from "zod";
import { lucideIconNames } from "./lucideIcon";

/**
 * Choice schema
 */
export const choiceSchema = z.object({
  type: z.literal("choice"),
  question: z.string(),
  choices: z.array(
    z.object({
      label: z.string(),
      icon: lucideIconNames.catch("sparkles"),
    }),
  ),
});

export type Choice = z.infer<typeof choiceSchema.shape.choices.element>;

/**
 * Search web schema
 */
export const searchWebItemSchema = z.object({
  url: z.string(),
  title: z.string(),
  description: z.string(),
  screenshot: z.string(),
});

export type SearchWebItem = z.infer<typeof searchWebItemSchema>;

export const searchWebResultSchema = z.array(searchWebItemSchema);

export type SearchWebResult = z.infer<typeof searchWebResultSchema>;

export const searchWebSchema = z.object({
  type: z.literal("searchWeb"),
  results: searchWebResultSchema,
});

/**
 * Generate object schema
 */
export const generateObjectSchema = z.object({
  result: z.union([choiceSchema, searchWebSchema]),
});
