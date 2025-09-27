import { generateObjectSchema } from "@/lib/zod/thread";
import { useSmoothText, type UIMessage } from "@convex-dev/agent/react";
import ChoiceButtons from "./ChoiceButtons";
import WebResultCarousel from "./WebResultCarousel";
import MessageReasoning from "./MessageReasoning";

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
  const [visibleText] = useSmoothText(textMessage ?? "", {
    // This tells the hook that it's ok to start streaming immediately.
    // If this was always passed as true, messages that are already done would
    // also stream in.
    // IF this was always passed as false (default), then the streaming message
    // wouldn't start streaming until the second chunk was received.
    startStreaming: message.status === "streaming",
  });

  if (object?.type === "choice") {
    return (
      <>
        <MessageReasoning message={message} />
        <ChoiceButtons
          question={object.question}
          choices={object.choices}
          threadId={threadId}
        />
      </>
    );
  }

  if (object?.type === "searchWeb") {
    return (
      <>
        <MessageReasoning message={message} />
        <WebResultCarousel results={object.results} />
      </>
    );
  }

  return (
    <>
      <MessageReasoning message={message} />
      <div>{visibleText}</div>
    </>
  );
};

export default ParsedMessage;
