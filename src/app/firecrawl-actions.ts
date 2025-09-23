"use server";
import { getToken } from "@/lib/auth-server";
import { api } from "convex/_generated/api";
import { fetchAction } from "convex/nextjs";

export const searchWeb = async (query: string) => {
  const token = await getToken();
  return await fetchAction(api.firecrawl.search, { query }, { token });
};
