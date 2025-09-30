"use node";
import { Firecrawl } from "@mendable/firecrawl-js";
import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import {
  searchWebItemSchema,
  searchWebResultSchema,
} from "../src/lib/zod/thread";

const apiKey = process.env.FIRECRAWL_API_KEY!;

const firecrawl = new Firecrawl({ apiKey });

type FirecrawlResult = {
  web: {
    json?: {
      url?: string;
      title?: string;
      description?: string;
      screenshot?: string;
    };
  }[];
};

const searchWeb = async (query: string) => {
  const result = (await firecrawl.search(query, {
    limit: 3,
    sources: ["web"],
    scrapeOptions: {
      blockAds: true,
      formats: [
        "screenshot",
        {
          type: "json",
          schema: searchWebItemSchema,
        },
      ],
      timeout: 60000,
    },
  })) as unknown as FirecrawlResult;

  const resultParsed = searchWebResultSchema.safeParse(
    result.web?.map((item) => ({
      url: item.json?.url ?? "",
      title: item.json?.title ?? "",
      description: item.json?.description ?? "",
      screenshot: item.json?.screenshot ?? "",
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
      url: v.optional(v.string()),
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      screenshot: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    return await searchWeb(args.query);
  },
});
