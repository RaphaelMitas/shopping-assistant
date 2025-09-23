import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { z } from "zod";

export const Message = z.object({
  role: z.union([z.literal("user"), z.literal("assistant")]),
  content: z.object({
    type: z.union([z.literal("text"), z.literal("choice")]),
    text: z.string(),
    choices: z.array(
      z.object({ label: z.string(), value: z.string(), icon: z.string() }),
    ),
  }),
});

export default defineSchema({
  shoppingChats: defineTable({
    userId: v.string(),
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.object({
          type: v.union(v.literal("text"), v.literal("choice")),
          text: v.string(),
          choices: v.array(
            v.object({
              label: v.string(),
              value: v.string(),
              icon: v.string(),
            }),
          ),
        }),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("userId", ["userId"]),
});
