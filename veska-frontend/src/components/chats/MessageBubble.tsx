import { MessageActions } from "@/components/chats/MessageActions";
import { formatDateTime } from "@/lib/formatters";
import type {
  ChatMessage,
  MessageFeedbackType,
  MessageSource,
} from "@/types/messages";

type MessageBubbleProps = {
  message: ChatMessage;
  isRegenerating?: boolean;
  actionsDisabled?: boolean;
  onSelectFeedback: (
    messageId: string,
    feedback: MessageFeedbackType,
  ) => void;
  onRegenerate: (messageId: string) => void;
  onViewCitation: (source: MessageSource) => void;
};

function getSourceCountLabel(sourcesCount: number) {
  return sourcesCount === 1 ? "1 cita" : `${sourcesCount} citas`;
}

function getUserBubbleClassName() {
  return "rounded-[18px] bg-[#EEF4FB] px-4 py-3 text-[#152436] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]";
}

export function MessageBubble({
  message,
  isRegenerating = false,
  actionsDisabled = false,
  onSelectFeedback,
  onRegenerate,
  onViewCitation,
}: MessageBubbleProps) {
  const isUserMessage = message.role === "user";
  const sources = message.sources ?? [];
  const sourcesCount = sources.length;

  if (message.role === "system") {
    return null;
  }

  return (
    <article
      className={`flex w-full ${
        isUserMessage ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`w-full max-w-[82%] ${
          isUserMessage ? "ml-auto" : "mr-auto max-w-[900px]"
        }`}
      >
        {!isUserMessage && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#7D8A99]">
            Veska
          </p>
        )}

        <div className={isUserMessage ? getUserBubbleClassName() : ""}>
          {isRegenerating ? (
            <div className="flex items-center gap-3 py-1">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#427AC6]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#427AC6] [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#427AC6] [animation-delay:300ms]" />
              </div>

              <p className="text-sm text-[#526173]">
                Veska está regenerando esta respuesta...
              </p>
            </div>
          ) : (
            <>
              <p
                className={`whitespace-pre-wrap text-[15px] leading-7 ${
                  isUserMessage
                    ? "text-[#152436]"
                    : "text-[#152436]"
                }`}
              >
                {message.content}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-xs text-[#7D8A99]">
                  {formatDateTime(message.created_at)}
                </p>

                {!isUserMessage && sourcesCount > 0 && (
                  <span className="rounded-full border border-[#E8EDF3] bg-[#F7F9FC] px-2.5 py-1 text-xs font-semibold text-[#526173]">
                    {getSourceCountLabel(sourcesCount)}
                  </span>
                )}

                {!isUserMessage && sourcesCount === 0 && (
                  <span className="text-xs text-[#7D8A99]">
                    Sin evidencia suficiente
                  </span>
                )}
              </div>

              {!isUserMessage && (
                <MessageActions
                  messageId={message.id}
                  sources={sources}
                  feedback={message.feedback}
                  disabled={actionsDisabled}
                  onSelectFeedback={onSelectFeedback}
                  onRegenerate={onRegenerate}
                  onViewCitation={onViewCitation}
                />
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
