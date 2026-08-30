"use client";

import type { ReactNode } from "react";

import type { MessageSource, MessageFeedbackType } from "@/types/messages";

import {
  ChatCitationIcon,
  ChatHelpfulIcon,
  ChatProblemIcon,
  ChatRegenerateIcon,
} from "@/components/icons/ChatIcons";

type MessageActionsProps = {
  messageId: string;
  sources: MessageSource[];
  feedback?: MessageFeedbackType | null;
  disabled?: boolean;
  onSelectFeedback: (
    messageId: string,
    feedback: MessageFeedbackType,
  ) => void;
  onRegenerate: (messageId: string) => void;
  onViewCitation: (source: MessageSource) => void;
};

type ActionButtonProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: ReactNode;
};

function ActionButton({
  label,
  selected = false,
  disabled = false,
  onClick,
  icon,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 ${
        selected
          ? "border-[#D8E6F8] bg-[#EEF4FB] text-[#427AC6]"
          : "border-transparent bg-transparent text-[#7D8A99] hover:bg-[#F1F4F7] hover:text-[#427AC6]"
      }`}
    >
      {icon}
    </button>
  );
}

export function MessageActions({
  messageId,
  sources,
  feedback,
  disabled = false,
  onSelectFeedback,
  onRegenerate,
  onViewCitation,
}: MessageActionsProps) {
  const primarySource = sources[0] ?? null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <ActionButton
        label="Regenerar respuesta"
        disabled={disabled}
        onClick={() => onRegenerate(messageId)}
        icon={<ChatRegenerateIcon className="h-[18px] w-[18px]" />}
      />

      <ActionButton
        label="Útil"
        selected={feedback === "helpful"}
        disabled={disabled}
        onClick={() => onSelectFeedback(messageId, "helpful")}
        icon={<ChatHelpfulIcon className="h-[18px] w-[18px]" />}
      />

      <ActionButton
        label="Reportar problema"
        selected={feedback === "problematic"}
        disabled={disabled}
        onClick={() => onSelectFeedback(messageId, "problematic")}
        icon={<ChatProblemIcon className="h-[18px] w-[18px]" />}
      />

      {primarySource && (
        <ActionButton
          label="Ver cita"
          disabled={disabled}
          onClick={() => onViewCitation(primarySource)}
          icon={<ChatCitationIcon className="h-[18px] w-[18px]" />}
        />
      )}
    </div>
  );
}
