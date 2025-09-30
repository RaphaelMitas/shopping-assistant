"use client";
import { StartChat } from "@/components/ai-elements/start-chat";

import { useCallback } from "react";
import { startThread } from "./startThreadActions";
import { useRouter } from "next/navigation";

export default function StartThread() {
  const router = useRouter();

  const onSubmit = useCallback(
    async (query: string) => {
      const { notSignedIn, threadId } = await startThread();
      if (notSignedIn) {
        return;
      }
      router.push(`/thread/${threadId}?q=${encodeURIComponent(query)}`);
    },
    [router],
  );

  return (
    <div className="flex h-full items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            What do you want to buy?
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Describe the product you’re looking for.
          </p>
        </div>
        <StartChat onSubmit={onSubmit} />
      </div>
    </div>
  );
}
