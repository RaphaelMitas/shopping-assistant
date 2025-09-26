import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import { autumn } from "./autumn";
import { internal } from "./_generated/api";

export const searchWebItemSchema = z.object({
  url: z.string(),
  title: z.string(),
  description: z.string(),
});

export const searchWebSchema = z.array(searchWebItemSchema);

export const searchWebTool = createTool({
  description: "Search for ideas in the database",
  providerOptions: {},
  args: z.object({ query: z.string().describe("The query to search for") }),
  handler: async (ctx, args, _options) => {
    const { data, error } = await autumn.check(ctx, {
      featureId: "ai_tokens",
    });
    if (error) {
      throw new Error(error.message);
    } else if (!data?.allowed) {
      throw new Error("Usage limit reached");
    }
    console.log("Searching the web for information");

    const result = (await ctx.runAction(internal.firecrawl.searchWebAction, {
      query: args.query,
    })) as unknown as typeof searchWebSchema;
    const validatedResult = searchWebSchema.parse(result);

    await autumn.track(ctx, {
      featureId: "ai_tokens",
      value: validatedResult.length + 5,
      properties: {
        type: "searchWebTool",
      },
    });
    return JSON.stringify(validatedResult);
  },
});
