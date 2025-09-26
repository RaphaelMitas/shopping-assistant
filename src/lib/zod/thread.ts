import z from "zod";
import { lucideIconNames } from "./lucideIcon";

export const generateObjectSchema = z.object({
  question: z.string(),
  choices: z.array(
    z.object({
      label: z.string(),
      icon: lucideIconNames.catch("sparkles"),
    }),
  ),
});

export type Choice = z.infer<typeof generateObjectSchema.shape.choices.element>;
