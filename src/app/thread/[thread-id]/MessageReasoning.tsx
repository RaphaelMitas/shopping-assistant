"use client";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai-elements/reasoning";
import type { UIMessage } from "@convex-dev/agent/react";
import { useSmoothText } from "@convex-dev/agent/react";
import { useState } from "react";

const MessageReasoning = ({ message }: { message: UIMessage }) => {
  const [open, setOpen] = useState(message.status === "streaming");
  const [reasoningText] = useSmoothText(
    message.parts
      .filter(
        (p) => p.type === "reasoning" || p.type === "tool-objectCreatorTool",
      )
      .map((p) => {
        if (p.type === "reasoning") {
          return p.text;
        }
        if (p.type === "tool-objectCreatorTool") {
          return "\n\nCrafting interactive elements...";
        }
        return "";
      })
      .join("\n") ?? "",
    {
      startStreaming: message.status === "streaming",
    },
  );

  if (message.role !== "assistant") {
    return null;
  }

  return (
    <Reasoning className="w-full" isStreaming={false} open={open}>
      <ReasoningTrigger onClick={() => setOpen(!open)} />
      <ReasoningContent>{reasoningText}</ReasoningContent>
    </Reasoning>
  );
};

export default MessageReasoning;
