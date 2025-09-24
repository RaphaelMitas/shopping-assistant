"use server";

import { searchWeb } from "@/app/firecrawl-actions";
import { getToken } from "@/lib/auth-server";
import { api } from "convex/_generated/api";
import { fetchAction, fetchMutation } from "convex/nextjs";

export async function startThread(query: string) {
  //   const token = await getToken();
  //   const result = await fetchAction(
  //     api.shopping.createThreadAndSendMessage,
  //     { message: query },
  //     { token },
  //   );
  //   return result;
}
