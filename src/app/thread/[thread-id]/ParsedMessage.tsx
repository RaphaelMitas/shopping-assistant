import { generateObjectSchema } from "@/lib/zod/thread";
import { useSmoothText, type UIMessage } from "@convex-dev/agent/react";
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
  const [smoothTextMessage] = useSmoothText(textMessage ?? "");

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

  return <div>{smoothTextMessage}</div>;
};

export default ParsedMessage;
