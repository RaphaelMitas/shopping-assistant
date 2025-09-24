"use client";
import { StartChat } from "@/components/ai-elements/start-chat";
import { useCallback } from "react";

export default function StartThread() {
  const onSubmit = useCallback(async (query: string) => {
    console.log("Customer wants to buy:", query);
  }, []);

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
