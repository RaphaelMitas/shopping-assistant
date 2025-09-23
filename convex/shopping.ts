import { openai } from "@ai-sdk/openai";
import { components } from "./_generated/api";
import { Agent } from "@convex-dev/agent";
import {
  action,
  type ActionCtx,
  mutation,
  type MutationCtx,
} from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import { autumn } from "./autumn";

const agent = new Agent(components.agent, {
  name: "My Agent",
  languageModel: openai.chat("gpt-5-mini"),
  instructions: "You are a weather forecaster.",
  maxSteps: 3,
});

const createThreadHandler = async (ctx: MutationCtx | ActionCtx) => {
  const user = await authComponent.getAuthUser(ctx);
  if (!user) {
    throw new Error("User not found");
  }
  const data = await agent.createThread(ctx, {
    userId: user._id,
  });

  return data.threadId;
};

export const createThread = mutation({
  args: {},
  handler: createThreadHandler,
});

const sendMessageToAgentHandler = async (
  ctx: ActionCtx,
  { threadId, message }: { threadId: string; message: string },
) => {
  // const user = await authComponent.getAuthUser(ctx);
  const { thread } = await agent.continueThread(ctx, { threadId });
  // const threadMetadata = await thread.getMetadata();
  // if (threadMetadata.userId !== user._id) {
  //   throw new Error("User did not create this thread");
  // }
  const result = await thread.generateText({ prompt: message });
  const totalTokens = result.usage.totalTokens;

  await autumn.track(ctx, {
    featureId: "ai_tokens",
    value: totalTokens,
  });

  return result.text;
};

export const sendMessageToAgent = action({
  args: { threadId: v.string(), message: v.string() },
  handler: sendMessageToAgentHandler,
});

export const createThreadAndSendMessage = action({
  args: { message: v.string() },
  handler: async (ctx, { message }) => {
    const threadId = await createThreadHandler(ctx);
    const result = await sendMessageToAgentHandler(ctx, { threadId, message });
    return result;
  },
});
