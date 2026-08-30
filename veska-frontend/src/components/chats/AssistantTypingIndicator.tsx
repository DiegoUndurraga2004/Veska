export function AssistantTypingIndicator() {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex gap-1.5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#427AC6]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#427AC6] [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#427AC6] [animation-delay:300ms]" />
      </div>

      <p className="text-sm text-[#526173]">
        Veska está buscando evidencia en tus documentos...
      </p>
    </div>
  );
}
