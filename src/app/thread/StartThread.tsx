"use client";
import { StartChat } from "@/components/ai-elements/start-chat";

import { Suspense, useCallback, useEffect } from "react";
import { startThread } from "./startThreadActions";
import { useRouter, useSearchParams } from "next/navigation";

export default function StartThread() {
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
        <Suspense>
          <StartChatForm />
        </Suspense>
      </div>
    </div>
  );
}

const StartChatForm = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  const router = useRouter();
  const onSubmit = useCallback(
    async (query: string) => {
      const { notSignedIn, threadId } = await startThread();
      if (notSignedIn) {
        router.push(
          `/login?redirect_to=/thread?q=${encodeURIComponent(query)}`,
        );
        return;
      }
      router.push(`/thread/${threadId}?q=${encodeURIComponent(query)}`);
    },
    [router],
  );

  useEffect(() => {
    if (query) {
      onSubmit(query).catch(() => {
        console.error("Failed to start thread");
      });
    }
  }, [query, onSubmit]);

  return <StartChat onSubmit={onSubmit} />;
};
