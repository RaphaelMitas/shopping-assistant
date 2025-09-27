import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import { internal } from "./_generated/api";
import {
  generateObjectSchema,
  searchWebResultSchema,
} from "../src/lib/zod/thread";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { autumn } from "./autumn";
import { MINUTE, RateLimiter, SECOND } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

export const firecrawlRateLimiter = new RateLimiter(components.rateLimiter, {
  sendMessage: {
    kind: "fixed window",
    period: 10 * SECOND,
    rate: 1,
    capacity: 1,
  },
  globalSendMessage: {
    kind: "fixed window",
    period: MINUTE,
    rate: 5,
    capacity: 2,
  },
});

export const firecrawlSearchWebTool = createTool({
  description:
    "This is the Firecrawl search web tool. Search the web for information. Return the results in the searchWebResultSchema.",
  args: z.object({
    query: z.string().describe("The query to search for the shopping item"),
  }),
  handler: async (ctx, args, _options) => {
    let rateLimitData = await firecrawlRateLimiter.check(ctx, "sendMessage");
    let retries = 0;

    while (rateLimitData.retryAfter && retries < 3) {
      retries++;
      console.log("Rate limit reached. Retrying in 10 seconds");
      await new Promise((resolve) =>
        setTimeout(resolve, rateLimitData.retryAfter ?? 0 * 1000),
      );
      rateLimitData = await firecrawlRateLimiter.check(ctx, "sendMessage");
    }

    if (!rateLimitData.ok && retries >= 3) {
      throw new Error("Usage limit reached");
    }

    const { data, error } = await autumn.check(ctx, {
      featureId: "ai_tokens",
    });
    if (error) {
      throw new Error(error.message);
    } else if (!data?.allowed) {
      throw new Error("Usage limit reached");
    }
    console.log("Searching the web for information");
    const result = await ctx.runAction(internal.firecrawl.searchWebAction, {
      query: args.query,
    });

    await autumn.track(ctx, {
      featureId: "ai_tokens",
      value: result.length * 5,
      properties: {
        type: "searchWebTool",
      },
    });

    const validatedResult = searchWebResultSchema.parse(result);

    return validatedResult;
  },
});

export const objectCreatorTool = createTool({
  description:
    "This is the object creator tool. Creates a validated object based on a query in a stringified format.",
  args: z.object({
    query: z.string().describe("The query to create the object schema"),
  }),
  handler: async (ctx, args, _options) => {
    console.log("Creating object schema");
    const response = await generateObject({
      model: openai.chat("gpt-5-mini"),
      system: `You are an expert in zod. You are given a query and need to convert it to a zod object.
                Return the object schema in the generateObjectSchema format.
                If something is not passed, like an icon, use a fitting icon.`,
      messages: [{ role: "user", content: args.query }],
      schema: generateObjectSchema,
    });

    await autumn.track(ctx, {
      featureId: "ai_tokens",
      value: response.usage?.totalTokens
        ? Math.ceil(response.usage.totalTokens / 100)
        : undefined,
      properties: {
        type: "objectCreatorTool",
      },
    });

    const validatedResponse = generateObjectSchema.safeParse(response.object);
    if (!validatedResponse.success) {
      throw new Error(
        `ERROR validating object from objectCreator tool: ${validatedResponse.error.message} - ${JSON.stringify(response.object)}`,
      );
    }
    return JSON.stringify(validatedResponse.data);
  },
});
