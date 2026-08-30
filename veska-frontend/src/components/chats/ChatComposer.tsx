"use client";

import {
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { SidebarSendUpIcon } from "@/components/icons/SidebarIcons";
import { MAX_CHAT_MESSAGE_LENGTH } from "@/config/chats";

type ChatComposerProps = {
  disabled?: boolean;
  disabledMessage?: string;
  onSubmitQuestion: (question: string) => void;
  initialQuestion?: string;
  placeholder?: string;
  compact?: boolean;
  submitLabel?: string;
  autoFocus?: boolean;
};

export function ChatComposer({
  disabled = false,
  disabledMessage,
  onSubmitQuestion,
  initialQuestion = "",
  placeholder,
  compact = false,
  submitLabel,
  autoFocus = false,
}: ChatComposerProps) {
  const [question, setQuestion] = useState(
    initialQuestion.slice(0, MAX_CHAT_MESSAGE_LENGTH),
  );

  const normalizedQuestion = question.trim();

  const canSubmit =
    normalizedQuestion.length > 0 &&
    normalizedQuestion.length <= MAX_CHAT_MESSAGE_LENGTH &&
    !disabled;

  function submitQuestion() {
    if (!canSubmit) {
      return;
    }

    onSubmitQuestion(normalizedQuestion);
    setQuestion("");
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    submitQuestion();
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      submitQuestion();
    }
  }

  const shellClassName = compact
    ? "flex min-h-[60px] items-center gap-3 rounded-[20px] border border-[#D9E1EA] bg-white px-4 shadow-[0_1px_2px_rgba(21,36,54,0.04)] transition focus-within:border-[#427AC6] focus-within:ring-2 focus-within:ring-[#EAF2FC]"
    : "flex min-h-[62px] items-center gap-3 rounded-[22px] border border-[#D9E1EA] bg-white px-4 shadow-[0_1px_2px_rgba(21,36,54,0.04)] transition focus-within:border-[#427AC6] focus-within:ring-2 focus-within:ring-[#EAF2FC]";

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label
        htmlFor="chat-question"
        className="sr-only"
      >
        Escribe una pregunta
      </label>

      <div className={shellClassName}>
        <textarea
          id="chat-question"
          value={question}
          onChange={(event) =>
            setQuestion(event.target.value)
          }
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={MAX_CHAT_MESSAGE_LENGTH}
          autoFocus={autoFocus}
          disabled={disabled}
          placeholder={
            disabled
              ? disabledMessage ??
                "Espera mientras Veska genera una respuesta..."
              : placeholder ??
                "Pregunta sobre tus documentos..."
          }
          className="min-h-[24px] flex-1 resize-none border-0 bg-transparent py-4 text-[15px] leading-6 text-[#152436] outline-none placeholder:text-[#7D8A99] focus:ring-0 disabled:cursor-not-allowed disabled:opacity-70"
        />

        <button
          type="submit"
          disabled={!canSubmit}
          aria-label={submitLabel ?? "Enviar pregunta"}
          title={submitLabel ?? "Enviar pregunta"}
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#427AC6] p-0 leading-none text-white transition hover:bg-[#356AAE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SidebarSendUpIcon className="block h-5 w-5 flex-shrink-0" />
        </button>
      </div>
    </form>
  );
}
