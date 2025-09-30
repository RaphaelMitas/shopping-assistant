"use node";
import { Firecrawl } from "@mendable/firecrawl-js";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { searchWebResultSchema } from "../src/lib/zod/thread";

const apiKey = process.env.FIRECRAWL_API_KEY!;

const firecrawl = new Firecrawl({ apiKey });

const searchWeb = async (query: string) => {
  const result = await firecrawl.search(query, {
    limit: 3,
    sources: ["web"],
    scrapeOptions: {
      blockAds: true,
      formats: [
        "screenshot",
        {
          type: "json",
          schema: searchWebResultSchema,
        },
      ],
      fastMode: true,
      timeout: 60000,
    },
  });

  const resultParsed = searchWebResultSchema.safeParse(
    result.web?.map((item) => ({
      url: typeof item === "object" && "url" in item ? (item.url ?? "") : "",
      title:
        typeof item === "object" && "title" in item ? (item.title ?? "") : "",
      description:
        typeof item === "object" && "description" in item
          ? (item.description ?? "")
          : "",
      screenshot:
        typeof item === "object" && "screenshot" in item
          ? (item.screenshot ?? "")
          : "",
    })) ?? [],
  );

  return resultParsed.success ? resultParsed.data : [];
};

export const searchWebAction = internalAction({
  args: {
    query: v.string(),
  },
  returns: v.array(
    v.object({
      url: v.string(),
      title: v.string(),
      description: v.string(),
      screenshot: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    return await searchWeb(args.query);
  },
});
