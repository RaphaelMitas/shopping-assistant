"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatStatus } from "ai";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputSubmit,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
} from "@/components/ai-elements/prompt-input";
import { cn } from "@/lib/utils";
import { useAction, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import {
  redirect,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

export default function ThreadChatPage() {
  const params = useParams<{ "thread-id": string }>();
  const threadId = params["thread-id"];
  const searchParams = useSearchParams();
  const messages = useQuery(api.threads.getThreadMessages, { threadId });
  const [status, setStatus] = useState<ChatStatus | undefined>(undefined);
  const router = useRouter();
  const didSendInitialRef = useRef(false);
  const initialQueryRef = useRef<string | null>(null);
  initialQueryRef.current ??= searchParams.get("q");
  const sendMessageToAgent = useAction(api.threads.sendMessageToAgent);

  const submitTextMessage = useCallback(
    (text: string) => {
      setStatus("submitted");
      sendMessageToAgent({ threadId, message: text })
        .catch(() => {
          setStatus("error");
        })
        .finally(() => {
          setStatus("ready");
        });
    },
    [sendMessageToAgent, threadId],
  );

  const handleSubmit = useCallback(
    (message: { text?: string }, event: React.FormEvent<HTMLFormElement>) => {
      const text = (message.text ?? "").trim();
      if (!text) return;

      event.currentTarget.reset();
      submitTextMessage(text);
    },
    [submitTextMessage],
  );

  useEffect(() => {
    if (didSendInitialRef.current) return;
    const query = (initialQueryRef.current ?? "").trim();
    if (!query) return;

    didSendInitialRef.current = true;

    router.replace(`/thread/${threadId}`);
    submitTextMessage(query);
  }, [router, threadId, submitTextMessage]);

  if (messages && "error" in messages) {
    redirect("/thread");
  }

  return (
    <div className={cn("flex h-full w-full flex-col")}>
      <Conversation className="bg-background">
        {messages?.length === 0 ? (
          <ConversationEmptyState
            title="No messages yet"
            description="Ask anything about what you want to buy."
          />
        ) : (
          <ConversationContent>
            {messages
              ?.map((m, index) => (
                <Message
                  key={`${m.id}-${index}`}
                  from={index % 2 === 1 ? "user" : "assistant"}
                >
                  <MessageAvatar src="" name={index % 2 === 1 ? "You" : "AI"} />
                  <MessageContent>
                    {index % 2 === 1 ? (
                      <Response>{m.text}</Response>
                    ) : (
                      <div className="whitespace-pre-wrap">{m.text}</div>
                    )}
                  </MessageContent>
                </Message>
              ))
              .reverse()}
          </ConversationContent>
        )}
        <ConversationScrollButton />
      </Conversation>

      <div className="sticky bottom-0 z-10 mx-auto w-full max-w-3xl p-4">
        <PromptInput
          onSubmit={handleSubmit}
          className="bg-card border-border border"
        >
          <PromptInputAttachments>
            {(file) => <PromptInputAttachment data={file} />}
          </PromptInputAttachments>

          <PromptInputBody>
            <PromptInputTextarea placeholder="Type your message…" />
            <PromptInputToolbar>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
              </PromptInputTools>
              <PromptInputSubmit status={status} />
            </PromptInputToolbar>
          </PromptInputBody>
        </PromptInput>
      </div>
    </div>
  );
}
