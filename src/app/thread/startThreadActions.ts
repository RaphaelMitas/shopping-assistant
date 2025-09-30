"use server";

import { getToken } from "@/lib/auth-server";
import { api } from "convex/_generated/api";
import { fetchMutation } from "convex/nextjs";

export async function startThread() {
  const token = await getToken();
  if (!token) {
    return { notSignedIn: true };
  }

  return {
    threadId: await fetchMutation(api.threads.createThread, {}, { token }),
  };
}
