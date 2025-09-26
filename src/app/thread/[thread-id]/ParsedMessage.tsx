import { Button } from "@/components/ui/button";
import { generateObjectSchema, type Choice } from "@/lib/zod/thread";
import { type UIMessage } from "@convex-dev/agent/react";
import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";
import { DynamicIcon } from "lucide-react/dynamic";

const parseMessage = (message: UIMessage) => {
  try {
    const choiceMessage = generateObjectSchema.safeParse(
      JSON.parse(message.text),
    );
    return choiceMessage.success
      ? {
          choiceMessage: choiceMessage.data,
          textMessage: null,
        }
      : {
          choiceMessage: null,
          textMessage: message.text,
        };
  } catch {
    return { textMessage: message.text, choiceMessage: null };
  }
};

const ParsedMessage = ({
  message,
  threadId,
}: {
  message: UIMessage;
  threadId: string;
}) => {
  const { choiceMessage, textMessage } = parseMessage(message);

  if (textMessage !== null) {
    return <div>{textMessage}</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {choiceMessage.question}
      <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
        {choiceMessage.choices.map((choice) => (
          <ChoiceCard key={choice.label} choice={choice} threadId={threadId} />
        ))}
      </div>
    </div>
  );
};

export default ParsedMessage;

const ChoiceCard = ({
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
      {/* <Card className="bg-primary-foreground group/choice-card hover:bg-primary flex cursor-pointer flex-col items-center gap-2 p-4"> */}
      <DynamicIcon className="size-6" name={choice.icon} />
      <div className="text-sm">{choice.label}</div>
      {/* </Card> */}
    </Button>
  );
};
