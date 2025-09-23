import { openai } from "@ai-sdk/openai";
import { choiceMessage, Message, textMessage } from "./schema";
import { generateObject } from "ai";
import { z } from "zod";
import { query } from "./_generated/server";
import { v } from "convex/values";
import { NoOp } from "convex-helpers/server/customFunctions";
import { zCustomQuery } from "convex-helpers/server/zod";

const zQuery = zCustomQuery(query, NoOp);

const gpt5mini = openai.chat("gpt-5-mini");

type MessageType = z.infer<typeof Message>;

const startSearch = z.object({
  type: z.literal("startShoppingSearch"),
  query: z.string(),
});

const AssistantMessage = z.union([textMessage, choiceMessage, startSearch]);

const generateMessageString = (message: MessageType) => {
  if (message.role === "user") {
    return `User: ${message.content.text}`;
  } else {
    if (message.content.type === "text") {
      return `Assistant: ${message.content.text}`;
    } else {
      return `Assistant: choices: ${message.content.choices.map((choice) => choice.label).join(", ")}`;
    }
  }
};

export const generateShoppingChat = async (messages: MessageType[]) => {
  const result = await generateObject({
    model: gpt5mini,
    schema: AssistantMessage,
    prompt: `You are a shopping assistant. You interact with the user until you have enough information to start a shopping search. Respond to the conversation below.\n${messages.map(generateMessageString).join("\n")}`,
  });
  return result;
};

export const startShoppingSearch = zQuery({
  args: {
    messages: z.array(Message),
  },
  handler: async (ctx, args) => {
    const userIdentity = await ctx.auth.getUserIdentity();
    if (!userIdentity) {
      throw new Error("User not authenticated");
    }
    const result = await generateShoppingChat(args.messages);
    return result;
  },
});
