import { Button } from "@/components/ui/button";
import { generateObjectSchema, type Choice } from "@/lib/zod/thread";
import { type UIMessage } from "@convex-dev/agent/react";
import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";
import { DynamicIcon } from "lucide-react/dynamic";
import ChoiceButtons from "./ChoiceButtons";
import WebResultCarousel from "./WebResultCarousel";

const parseMessage = (message: UIMessage) => {
  try {
    const { data, success } = generateObjectSchema.safeParse(
      JSON.parse(message.text),
    );
    return success
      ? {
          object: data.result,
          textMessage: null,
        }
      : {
          object: null,
          textMessage: message.text,
        };
  } catch {
    return { textMessage: message.text, object: null };
  }
};

const ParsedMessage = ({
  message,
  threadId,
}: {
  message: UIMessage;
  threadId: string;
}) => {
  const { object, textMessage } = parseMessage(message);

  if (object?.type === "choice") {
    return (
      <ChoiceButtons
        question={object.question}
        choices={object.choices}
        threadId={threadId}
      />
    );
  }

  if (object?.type === "searchWeb") {
    return <WebResultCarousel results={object.results} />;
  }

  return <div>{textMessage}</div>;
};

export default ParsedMessage;
