import { openai } from "@ai-sdk/openai";
import { components, internal } from "./_generated/api";
import {
  Agent,
  DeltaStreamer,
  listUIMessages,
  syncStreams,
  vStreamArgs,
} from "@convex-dev/agent";
import {
  query,
  action,
  type ActionCtx,
  mutation,
  type MutationCtx,
  type GenericCtx,
  internalAction,
} from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import { autumn } from "./autumn";
import { z } from "zod";
import { paginationOptsValidator } from "convex/server";

const agent = new Agent(components.agent, {
  name: "My Agent",
  languageModel: openai.chat("gpt-5-mini"),
  textEmbeddingModel: openai.textEmbedding("text-embedding-3-small"),
  instructions: "You are a weather forecaster.",
  maxSteps: 3,
});

async function authorizeThreadAccess(
  ctx: GenericCtx,
  { threadId }: { threadId: string },
) {
  const user = await authComponent.safeGetAuthUser(ctx);

  const thread = await agent.getThreadMetadata(ctx, { threadId });
  if (thread.userId !== user?._id) {
    throw new Error("You are not authorized to access this thread");
  }
}

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

export const sendMessageToAgent = mutation({
  args: { threadId: v.string(), message: v.string() },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const thread = await agent.getThreadMetadata(ctx, args);

    if (!user || thread.userId !== user?._id) {
      throw new Error("You are not authorized to access this thread");
    }

    const { messageId } = await agent.saveMessage(ctx, {
      threadId: args.threadId,
      prompt: args.message,
      // we're in a mutation, so skip embeddings for now. They'll be generated
      // lazily when streaming text.
      skipEmbeddings: true,
    });
    await ctx.scheduler.runAfter(0, internal.threads.sendMessageToAgentAsync, {
      threadId: args.threadId,
      promptMessageId: messageId,
      userId: user._id,
    });
  },
});

export const sendMessageToAgentAsync = internalAction({
  args: {
    promptMessageId: v.string(),
    threadId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, { promptMessageId, threadId, userId }) => {
    const scopedCtx = {
      ...ctx,
      // If your auth layer exposes a helper to fetch by ID, use that directly.
      // Otherwise, provide a helper the same way your authComponent expects.
      auth: {
        ...ctx.auth,
        // Optional: expose a getter that returns the "impersonated" identity
        getUserIdentity: async () => ({
          subject: userId,
          tokenIdentifier: userId,
          issuer: "convex",
        }),
      },
    };
    const { data, error } = await autumn.check(scopedCtx, {
      featureId: "ai_tokens",
    });
    if (error) {
      throw new Error(error.message);
    } else if (!data?.allowed) {
      throw new Error("Usage limit reached");
    }

    const { thread } = await agent.continueThread(scopedCtx, { threadId });
    await thread.updateMetadata({ title: "Shopping Assistant" });
    const result = await thread.streamText(
      { promptMessageId },
      {
        usageHandler: async (ctx, data) => {
          const totalTokens = data.usage.totalTokens;
          await autumn.track(ctx, {
            featureId: "ai_tokens",
            value: totalTokens ? Math.ceil(totalTokens / 1000) : undefined,
            properties: {
              threadId,
              functionName: "sendMessageToAgent",
            },
          });
        },
        saveStreamDeltas: true,
      },
    );

    // We need to make sure the stream finishes - by awaiting each chunk
    // or using this call to consume it all.
    await result.consumeStream();

    return { totalTokens: (await result.totalUsage).totalTokens };
  },
});

// export const sendMessageToAgent = action({
//   args: { threadId: v.string(), message: v.string() },
//   handler: sendMessageToAgentHandler,
// });

export const getThreadMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    await authorizeThreadAccess(ctx, args);

    const paginated = await listUIMessages(ctx, components.agent, args);

    const streams = await syncStreams(ctx, components.agent, args);

    return { ...paginated, streams };
  },
});

export const getThreadList = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
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
