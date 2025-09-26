import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import { autumn } from "./autumn";
import { internal } from "./_generated/api";
import { searchWebResultSchema } from "../src/lib/zod/thread";

export const firecrawlSearchWebTool = createTool({
  description:
    "This is the Firecrawl search web tool. Search the web for information. Return the results in the searchWebResultSchema.",
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
    })) as unknown as typeof searchWebResultSchema;
    const validatedResult = searchWebResultSchema.parse(result);

    await autumn.track(ctx, {
      featureId: "ai_tokens",
      value: validatedResult.length * 5,
      properties: {
        type: "searchWebTool",
      },
    });
    return JSON.stringify(validatedResult);
  },
});
