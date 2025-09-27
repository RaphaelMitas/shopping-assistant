"use client";

import type { Choice } from "@/lib/zod/thread";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "lucide-react/dynamic";
import { useCustomer } from "autumn-js/react";
import PaywallDialog from "@/components/autumn/paywall-dialog";

const ChoiceButton = ({
  choice,
  threadId,
}: {
  choice: Choice;
  threadId: string;
}) => {
  const sendMessageToAgent = useMutation(api.threads.sendMessageToAgent);
  const { check } = useCustomer();

  return (
    <Button
      className="flex h-full w-full cursor-pointer flex-col items-center gap-2 whitespace-normal"
      onClick={async () => {
        const { data, error } = check({
          featureId: "ai_tokens",
          dialog: PaywallDialog,
        });

        if (error) {
          console.error("Error checking ai tokens", error);
          return;
        }
        if (!data?.allowed) {
          return;
        }

        await sendMessageToAgent({ threadId, message: choice.label }).catch(
          (error) => {
            console.error("Error sending message to agent", error);
          },
        );
      }}
    >
      <DynamicIcon className="size-6" name={choice.icon} />
      <div className="text-sm">{choice.label}</div>
    </Button>
  );
};

const ChoiceButtons = ({
  question,
  choices,
  threadId,
}: {
  question: string;
  choices: Choice[];
  threadId: string;
}) => {
  return (
    <div className="flex flex-col gap-2">
      {question}
      <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
        {choices.map((choice) => (
          <ChoiceButton
            key={choice.label}
            choice={choice}
            threadId={threadId}
          />
        ))}
      </div>
    </div>
  );
};

export default ChoiceButtons;
