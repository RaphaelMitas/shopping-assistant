import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { z } from "zod";

export const textMessage = z.object({
  type: z.literal("text"),
  text: z.string(),
});

export const choiceMessage = z.object({
  type: z.literal("choice"),
  choices: z.array(
    z.object({ label: z.string(), value: z.string(), icon: z.string() }),
  ),
});

const AssistantMessage = z.object({
  role: z.literal("assistant"),
  content: z.union([textMessage, choiceMessage]),
});

export const UserMessage = z.object({
  role: z.literal("user"),
  content: textMessage,
});

export const Message = z.union([AssistantMessage, UserMessage]);

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
