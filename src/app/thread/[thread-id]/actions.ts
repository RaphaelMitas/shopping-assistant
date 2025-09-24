"use server";

import { fetchAction, fetchQuery } from "convex/nextjs";
import { api } from "convex/_generated/api";
import { getToken } from "@/lib/auth-server";

export async function sendMessageToThread({
  threadId,
  message,
}: {
  threadId: string;
  message: string;
}) {
  const token = await getToken();
  return await fetchAction(
    api.threads.sendMessageToAgent,
    { threadId, message },
    { token },
  );
}

export async function getThreadMessages({ threadId }: { threadId: string }) {
  const token = await getToken();
  return await fetchQuery(
    api.threads.getThreadMessages,
    { threadId },
    { token },
  );
}
