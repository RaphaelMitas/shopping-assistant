import { openai } from "@ai-sdk/openai";
import { components, internal } from "./_generated/api";
import {
  Agent,
  getFile,
  listUIMessages,
  storeFile,
  syncStreams,
  vStreamArgs,
} from "@convex-dev/agent";
import {
  query,
  mutation,
  type MutationCtx,
  type GenericCtx,
  internalAction,
  action,
} from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import { paginationOptsValidator } from "convex/server";
import { autumn } from "./autumn";
import { objectCreatorTool, firecrawlSearchWebTool } from "./tools";
import { rawRequestResponseHandler } from "./debugging/rawRequestResponseHandler";
import { type UserModelMessage } from "ai";

export const agent = new Agent(components.agent, {
  usageHandler: async (ctx, data) => {
    const totalTokens = data.usage.totalTokens;
    await autumn.track(ctx, {
      featureId: "ai_tokens",
      value: totalTokens ? Math.ceil(totalTokens / 1000) : undefined,
      properties: {
        threadId: data.threadId,
        type: "agent-gpt-5",
      },
    });
  },
  rawRequestResponseHandler,
  name: "Shopping Assistant Agent",
  languageModel: openai("gpt-5"),
  textEmbeddingModel: openai.textEmbedding("text-embedding-3-small"),
  providerOptions: {
    openai: {
      reasoningSummary: "auto", // 'auto' for condensed or 'detailed' for comprehensive
    },
  },
  instructions: `
    You are a **shopping assistant**.  
    Your goal is to help the user find the right product.

    1. **Conversation flow**  
      - First, ask the user for details about what they want to buy.  
      - Always ask *only one question at a time*.  
      - Keep answers short and clear, like in a quiz.  
      - Use the 'icon' field in choices to display an icon along with each label.  
      - If the user's request is unclear, ask a clarifying question.  

    2. **Using tools**  
      - Once you have enough information, you **MUST CALL** the 'firecrawlSearchWebTool' function to find products. Use it only once per prompt.
      - This tool returns a list of websites.  
      - Prefer using this tool over guessing — if you're not sure, ask one clarifying question before calling it.  

    3. **Returning results**  
      - BEFORE you return any results to the user, you **MUST CALL** the 'objectCreatorTool'.  
      - The 'objectCreatorTool' must create an object in this exact format:

    ---

    ### Object format

    The top-level object must always look like this:

    {
      "result": { ... }
    }

    The "result" can be one of two types:

    #### Option 1: Choice
    When you are asking the user a question with multiple options, use:

    {
      "result": {
        "type": "choice",
        "question": "A question to ask the user",
        "choices": [
          {
            "label": "Text label describing a choice",
            "icon": "Example: sparkles"
          },
          {
            "label": "Another choice",
            "icon": "anotherIcon"
          }
        ]
      }
    }

    - 'type' must be 'choice'.  
    - 'question' is the string you asked.  
    - 'choices' is an array of options, each with a 'label' and 'icon'.

    ---

    #### Option 2: Search Web
    When you have enough details and already called 'firecrawlSearchWebTool', use:

    {
      "result": {
        "type": "searchWeb",
        "results": [
          {
            "url": "https://example.com",
            "title": "Title of the product page",
            "description": "Short description of the item",
            "screenshot": "URL to screenshot"
          }
        ]
      }
    }

    - 'type' must be 'searchWeb'.  
    - 'results' is an array of items from the tool.  
    - Each item requires 'url', 'title', 'description', and 'screenshot'.

    ---

    4. **Final output**  
      - Always return the **stringified version of the object**.  
      - Do not include anything else outside the object.  
  `,
  tools: { firecrawlSearchWebTool, objectCreatorTool },
  maxSteps: 6,
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
  args: {
    threadId: v.string(),
    message: v.string(),
    fileIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const thread = await agent.getThreadMetadata(ctx, args);

    if (!user || thread.userId !== user?._id) {
      throw new Error("You are not authorized to access this thread");
    }
    const tasks = args.fileIds?.map(async (fileId) => {
      return await getFile(ctx, components.agent, fileId);
    });
    const fileParts = tasks ? await Promise.all(tasks) : undefined;

    const message: UserModelMessage = {
      role: "user",
      content: [
        ...(fileParts?.map((filePart) => filePart.filePart) ?? []),
        { type: "text", text: args.message },
      ],
    };

    const { messageId } = await agent.saveMessage(ctx, {
      threadId: args.threadId,
      // prompt: args.message,
      message,
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

export const uploadFile = action({
  args: {
    filename: v.string(),
    mimeType: v.string(),
    bytes: v.bytes(),
    sha256: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    if (!user) {
      throw new Error("User not found");
    }
    // Note: we're using storeFile which will store the file in file storage
    // or re-use an existing file with the same hash and track references.
    const {
      file: { fileId, url },
    } = await storeFile(
      ctx,
      components.agent,
      new Blob([args.bytes], { type: args.mimeType }),
      {
        filename: args.filename,
        sha256: args.sha256,
      },
    );
    return { fileId, url };
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

    await thread.streamText(
      {
        promptMessageId,
      },
      {
        contextOptions: { excludeToolMessages: false },
        saveStreamDeltas: true,
      },
    );
  },
});

// export const sendMessageToAgent = action({
//   args: { threadId: v.string(), message: v.string() },
//   handler: sendMessageToAgentHandler,
// });

export const isThreadAvailable = query({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    try {
      await authorizeThreadAccess(ctx, args);
    } catch {
      return false;
    }
    return true;
  },
});

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
