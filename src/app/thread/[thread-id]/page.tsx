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
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useUIMessages } from "@convex-dev/agent/react";
import ParsedMessage from "./ParsedMessage";
import { useCustomer } from "autumn-js/react";
import PaywallDialog from "@/components/autumn/paywall-dialog";

export default function ThreadChatPage() {
  const params = useParams<{ "thread-id": string }>();
  const threadId = params["thread-id"];
  const searchParams = useSearchParams();
  const messages = useUIMessages(
    api.threads.getThreadMessages,
    { threadId },
    { initialNumItems: 10, stream: true },
  );
  const [status, setStatus] = useState<ChatStatus>("ready");
  const router = useRouter();
  const didSendInitialRef = useRef(false);
  const initialQueryRef = useRef<string | null>(null);
  initialQueryRef.current ??= searchParams.get("q");
  const sendMessageToAgent = useMutation(api.threads.sendMessageToAgent);
  const { check } = useCustomer();
  const user = useQuery(api.users.getCurrentUser);

  const submitTextMessage = useCallback(
    (text: string) => {
      const { data, error } = check({
        featureId: "ai_tokens",
        dialog: PaywallDialog,
      });

      if (error) {
        setStatus("error");
        return;
      }
      if (!data?.allowed) {
        return;
      }
      setStatus("submitted");
      sendMessageToAgent({ threadId, message: text })
        .catch(() => {
          setStatus("error");
        })
        .finally(() => {
          setStatus("ready");
        });
    },
    [check, sendMessageToAgent, threadId],
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

  return (
    <div
      className={cn(
        "mx-auto flex h-full w-full max-w-3xl flex-col overflow-y-auto",
      )}
    >
      <Conversation>
        {messages?.results.reverse().length === 0 ? (
          <ConversationEmptyState
            title="No messages yet"
            description="Ask anything about what you want to buy."
          />
        ) : (
          <ConversationContent>
            <ConversationScrollButton />
            {messages.results
              ?.map((m, index) => (
                <Message key={`${m.id}-${index}`} from={m.role}>
                  <MessageAvatar
                    src={
                      m.role === "user"
                        ? (user?.image ?? "")
                        : "/favicons/favicon.svg"
                    }
                    name={
                      m.role === "user"
                        ? (user?.name ?? "You")
                        : "Shopping Assistant"
                    }
                  />
                  <MessageContent className="max-w-[75%]">
                    <ParsedMessage message={m} threadId={threadId} />
                  </MessageContent>
                </Message>
              ))
              .reverse()}
          </ConversationContent>
        )}
        <ConversationScrollButton />
      </Conversation>

      <div className="sticky bottom-0 z-10 mx-auto mb-1 w-full max-w-3xl rounded-2xl p-1 backdrop-blur-sm md:bottom-2">
        <PromptInput onSubmit={handleSubmit}>
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
              <PromptInputSubmit
                status={status}
                disabled={status !== "ready"}
              />
            </PromptInputToolbar>
          </PromptInputBody>
        </PromptInput>
      </div>
    </div>
  );
}
