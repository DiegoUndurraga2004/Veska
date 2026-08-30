"use client";

import { useEffect, useRef, useState } from "react";

import { ChatComposer } from "@/components/chats/ChatComposer";
import { ChatWindow } from "@/components/chats/ChatWindow";
import { MOCK_ASSISTANT_RESPONSE_DELAY_MS } from "@/config/chats";
import {
  createMockAssistantMessage,
  createMockUserMessage,
} from "@/mocks/chat-responses.mock";
import type { ChatScope } from "@/types/chats";
import type {
  ChatMessage,
  MessageFeedbackType,
} from "@/types/messages";

type ChatSessionProps = {
  scope: ChatScope;
  initialMessages: ChatMessage[];
  selectedDocumentIds?: string[];
  selectedSpaceIds?: string[];
  composerDisabled?: boolean;
  composerDisabledMessage?: string;
  composerInitialQuestion?: string;
};

export function ChatSession({
  scope,
  initialMessages,
  selectedDocumentIds = [],
  selectedSpaceIds = [],
  composerDisabled = false,
  composerDisabledMessage,
  composerInitialQuestion = "",
}: ChatSessionProps) {
  const [messages, setMessages] =
    useState<ChatMessage[]>(initialMessages);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [regeneratingMessageId, setRegeneratingMessageId] =
    useState<string | null>(null);

  const responseTimeoutRef =
    useRef<number | null>(null);
  const messagesEndRef =
    useRef<HTMLDivElement>(null);
  const hasSignaledConversationStartedRef = useRef(false);

  useEffect(() => {
    window.dispatchEvent(
      new Event(
        initialMessages.length > 0
          ? "veska:chat-started"
          : "veska:chat-empty",
      ),
    );

    hasSignaledConversationStartedRef.current =
      initialMessages.length > 0;

    return () => {
      if (responseTimeoutRef.current !== null) {
        window.clearTimeout(responseTimeoutRef.current);
      }
    };
  }, [initialMessages.length]);

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [isGenerating, messages]);

  function signalConversationStarted() {
    if (hasSignaledConversationStartedRef.current) {
      return;
    }

    hasSignaledConversationStartedRef.current = true;
    window.dispatchEvent(new Event("veska:chat-started"));
  }

  function submitQuestion(question: string) {
    if (isGenerating || composerDisabled) {
      return;
    }

    const userMessage = createMockUserMessage(question);

    if (messages.length === 0) {
      signalConversationStarted();
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
    ]);

    setIsGenerating(true);
    setRegeneratingMessageId(null);

    responseTimeoutRef.current = window.setTimeout(() => {
      const assistantMessage =
        createMockAssistantMessage(
          question,
          scope,
          selectedDocumentIds,
          selectedSpaceIds,
        );

      setMessages((currentMessages) => [
        ...currentMessages,
        assistantMessage,
      ]);

      setIsGenerating(false);
      responseTimeoutRef.current = null;
    }, MOCK_ASSISTANT_RESPONSE_DELAY_MS);
  }

  function selectFeedback(
    messageId: string,
    feedback: MessageFeedbackType,
  ) {
    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === messageId &&
        message.role === "assistant"
          ? {
              ...message,
              feedback,
            }
          : message,
      ),
    );
  }

  function findQuestionForAssistantMessage(
    messageId: string,
  ) {
    const assistantMessageIndex = messages.findIndex(
      (message) => message.id === messageId,
    );

    if (assistantMessageIndex < 0) {
      return null;
    }

    for (
      let index = assistantMessageIndex - 1;
      index >= 0;
      index -= 1
    ) {
      const message = messages[index];

      if (message.role === "user") {
        return message.content;
      }
    }

    return null;
  }

  function regenerateResponse(messageId: string) {
    if (isGenerating) {
      return;
    }

    const question =
      findQuestionForAssistantMessage(messageId);

    if (!question) {
      return;
    }

    setIsGenerating(true);
    setRegeneratingMessageId(messageId);

    responseTimeoutRef.current = window.setTimeout(() => {
      const regeneratedMessage =
        createMockAssistantMessage(
          question,
          scope,
          selectedDocumentIds,
          selectedSpaceIds,
        );

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId
            ? {
                ...regeneratedMessage,
                id: messageId,
              }
            : message,
        ),
      );

      setIsGenerating(false);
      setRegeneratingMessageId(null);
      responseTimeoutRef.current = null;
    }, MOCK_ASSISTANT_RESPONSE_DELAY_MS);
  }

  const resolvedComposerDisabled =
    isGenerating || composerDisabled;

  const resolvedComposerDisabledMessage =
    isGenerating
      ? "Espera mientras Veska genera una respuesta..."
      : composerDisabledMessage;

  return (
    <ChatWindow
      messages={messages}
      isGenerating={isGenerating}
      regeneratingMessageId={regeneratingMessageId}
      messagesEndRef={messagesEndRef}
      onSelectFeedback={selectFeedback}
      onRegenerate={regenerateResponse}
      composer={
        <ChatComposer
          disabled={resolvedComposerDisabled}
          disabledMessage={
            resolvedComposerDisabledMessage
          }
          initialQuestion={composerInitialQuestion}
          onSubmitQuestion={submitQuestion}
          placeholder="Pregunta sobre tus documentos..."
        />
      }
    />
  );
}
