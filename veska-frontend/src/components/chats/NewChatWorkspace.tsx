"use client";

import { useEffect, useRef, useState } from "react";

import { ChatSession } from "@/components/chats/ChatSession";
import {
  consumePendingNewChatReset,
  NEW_CHAT_DRAFT_STORAGE_KEY,
  NEW_CHAT_RESET_EVENT,
} from "@/components/chats/new-chat-session";
import {
  createMockAssistantMessage,
  createMockUserMessage,
} from "@/mocks/chat-responses.mock";
import type { ChatMessage } from "@/types/messages";

function consumeNewChatDraft() {
  const draft = window.sessionStorage.getItem(
    NEW_CHAT_DRAFT_STORAGE_KEY,
  );

  if (!draft) {
    return [];
  }

  window.sessionStorage.removeItem(NEW_CHAT_DRAFT_STORAGE_KEY);

  const normalizedDraft = draft.trim();

  if (!normalizedDraft) {
    return [];
  }

  return [
    createMockUserMessage(normalizedDraft),
    createMockAssistantMessage(
      normalizedDraft,
      "all_accessible_spaces",
      [],
      [],
    ),
  ];
}

export function NewChatWorkspace() {
  const hasConsumedDraftRef = useRef(false);
  const resetSequenceRef = useRef(0);
  const [resetVersion, setResetVersion] = useState(0);
  const [initialMessages, setInitialMessages] = useState<
    ChatMessage[]
  >([]);

  useEffect(() => {
    function resetConversation() {
      resetSequenceRef.current += 1;
      setInitialMessages([]);
      setResetVersion((currentVersion) => currentVersion + 1);
    }

    function handleResetRequest() {
      window.sessionStorage.removeItem(
        NEW_CHAT_DRAFT_STORAGE_KEY,
      );
      resetConversation();
    }

    window.addEventListener(
      NEW_CHAT_RESET_EVENT,
      handleResetRequest,
    );

    if (hasConsumedDraftRef.current) {
      return () => {
        window.removeEventListener(
          NEW_CHAT_RESET_EVENT,
          handleResetRequest,
        );
      };
    }

    hasConsumedDraftRef.current = true;

    if (consumePendingNewChatReset()) {
      resetConversation();

      return () => {
        window.removeEventListener(
          NEW_CHAT_RESET_EVENT,
          handleResetRequest,
        );
      };
    }

    const draftMessages = consumeNewChatDraft();

    if (draftMessages.length > 0) {
      const scheduledResetSequence =
        resetSequenceRef.current;

      window.queueMicrotask(() => {
        if (
          scheduledResetSequence !==
          resetSequenceRef.current
        ) {
          return;
        }

        setInitialMessages(draftMessages);
      });
    }

    return () => {
      window.removeEventListener(
        NEW_CHAT_RESET_EVENT,
        handleResetRequest,
      );
    };
  }, []);

  return (
    <ChatSession
      key={`${resetVersion}-${initialMessages.length > 0 ? "draft" : "empty"}`}
      scope="all_accessible_spaces"
      initialMessages={initialMessages}
      selectedDocumentIds={[]}
      selectedSpaceIds={[]}
      composerInitialQuestion=""
    />
  );
}
