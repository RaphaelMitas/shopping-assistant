import type { Choice } from "@/lib/zod/thread";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "lucide-react/dynamic";

const ChoiceButton = ({
  choice,
  threadId,
}: {
  choice: Choice;
  threadId: string;
}) => {
  const sendMessageToAgent = useMutation(api.threads.sendMessageToAgent);

  return (
    <Button
      className="flex h-full w-full cursor-pointer flex-col items-center gap-2 whitespace-normal"
      onClick={() => sendMessageToAgent({ threadId, message: choice.label })}
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
