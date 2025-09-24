import { openai } from "@ai-sdk/openai";
import { components } from "./_generated/api";
import { Agent } from "@convex-dev/agent";
import {
  query,
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

const createThreadHandler = async (ctx: MutationCtx) => {
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
  const { data, error } = await autumn.check(ctx, {
    featureId: "ai_tokens",
  });
  if (error) {
    throw new Error(error.message);
  } else if (!data?.allowed) {
    throw new Error("Usage limit reached");
  }
  const { thread } = await agent.continueThread(ctx, { threadId });
  await thread.updateMetadata({ title: "Shopping Assistant" });
  const result = await thread.generateText(
    { prompt: message },
    {
      usageHandler: async (ctx, data) => {
        const totalTokens = data.usage.totalTokens;
        await autumn.track(ctx, {
          featureId: "ai_tokens",
          value: totalTokens ? Math.ceil(totalTokens / 100) : undefined,
          properties: {
            threadId,
            functionName: "sendMessageToAgent",
          },
        });
      },
    },
  );

  return result.text;
};

export const sendMessageToAgent = action({
  args: { threadId: v.string(), message: v.string() },
  handler: sendMessageToAgentHandler,
});

export const getThreadMessages = query({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }) => {
    const threadOrError = await agent
      .getThreadMetadata(ctx, { threadId })
      .catch((error) => {
        return error instanceof Error ? error.message : "Unknown error";
      });
    if (typeof threadOrError === "string") {
      return { error: threadOrError };
    }
    const data = await agent.listMessages(ctx, {
      threadId,
      paginationOpts: { numItems: 10, cursor: null },
    });
    return data.page;
  },
});

export const getThreadList = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    const threads = await ctx.runQuery(
      components.agent.threads.listThreadsByUserId,
      { userId: user?._id, paginationOpts: { numItems: 10, cursor: null } },
    );
    return threads.page;
  },
});

export const deleteThread = mutation({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }) => {
    await agent.deleteThreadAsync(ctx, { threadId });
    return { success: true };
  },
});
