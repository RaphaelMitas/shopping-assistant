import { openai } from "@ai-sdk/openai";
import { Message } from "./schema";
import { generateObject } from "ai";
import type { z } from "zod";

const gpt5mini = openai.chat("gpt-5-mini");

type MessageType = z.infer<typeof Message>;

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
    schema: Message,
    prompt: `You are a shopping assistant. Respond to the conversation below.\n${messages.map(generateMessageString).join("\n")}`,
  });
  return result;
};
