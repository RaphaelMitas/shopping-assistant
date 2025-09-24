"use node";
import { Firecrawl } from "@mendable/firecrawl-js";
import { action } from "./_generated/server";
import { v } from "convex/values";

const apiKey = process.env.FIRECRAWL_API_KEY!;

const firecrawl = new Firecrawl({ apiKey });

export const search = action({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await firecrawl.search(args.query, {
      limit: 3,
      scrapeOptions: { formats: ["markdown"] },
    });
    return result;
  },
});
