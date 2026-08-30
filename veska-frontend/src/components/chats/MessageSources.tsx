import { SourceCard } from "@/components/chats/SourceCard";
import type { MessageSource } from "@/types/messages";

type MessageSourcesProps = {
  sources: MessageSource[];
};

function getSourcesLabel(sourcesCount: number) {
  if (sourcesCount === 1) {
    return "1 fuente";
  }

  return `${sourcesCount} fuentes`;
}

export function MessageSources({
  sources,
}: MessageSourcesProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <section className="mt-4 border-t border-border pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Fuentes verificables
          </p>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Revisa la evidencia antes de utilizar esta respuesta.
          </p>
        </div>

        <span className="rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          {getSourcesLabel(sources.length)}
        </span>
      </div>

      <div className="mt-3 space-y-3">
        {sources.map((source) => (
          <SourceCard
            key={source.id}
            source={source}
          />
        ))}
      </div>
    </section>
  );
}
