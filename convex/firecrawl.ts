"use node";
import { Firecrawl } from "@mendable/firecrawl-js";
import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { searchWebSchema, type searchWebItemSchema } from "./tools";
import type z from "zod";

const apiKey = process.env.FIRECRAWL_API_KEY!;

const firecrawl = new Firecrawl({ apiKey });

type searchWebResult = z.infer<typeof searchWebSchema>;

type searchWebItem = z.infer<typeof searchWebItemSchema>;

const searchWeb = async (query: string) => {
  const result = await firecrawl.search(query, {
    limit: 3,
    sources: ["web"],
    scrapeOptions: {
      blockAds: true,
      formats: [
        {
          type: "json",
          schema: searchWebSchema,
        },
      ],
    },
  });

  const resultParsed = searchWebSchema.safeParse(
    result.web?.map((item) => ({
      url: typeof item === "object" && "url" in item ? (item.url ?? "") : "",
      title:
        typeof item === "object" && "title" in item ? (item.title ?? "") : "",
      description:
        typeof item === "object" && "description" in item
          ? (item.description ?? "")
          : "",
    })) ?? [],
  );

  console.log("result", result);

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
    }),
  ),
  handler: async (ctx, args) => {
    return await searchWeb(args.query);
  },
});
