import Link from "next/link";

import type { ChatScope } from "@/types/chats";

type ChatContextPanelProps = {
  scope: ChatScope;
  selectedSpacesCount: number;
  selectedDocumentsCount: number;
  isNewChat?: boolean;
};

function getScopeDescription(
  scope: ChatScope,
  selectedSpacesCount: number,
  selectedDocumentsCount: number,
) {
  if (scope === "all_accessible_spaces") {
    return "Todos tus espacios accesibles";
  }

  if (scope === "selected_spaces") {
    return `${selectedSpacesCount} ${
      selectedSpacesCount === 1
        ? "espacio seleccionado"
        : "espacios seleccionados"
    }`;
  }

  return `${selectedDocumentsCount} ${
    selectedDocumentsCount === 1
      ? "documento seleccionado"
      : "documentos seleccionados"
  }`;
}

export function ChatContextPanel({
  scope,
  selectedSpacesCount,
  selectedDocumentsCount,
  isNewChat = false,
}: ChatContextPanelProps) {
  return (
    <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="border-b border-border bg-surface-muted px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">
            Contexto de consulta
          </h2>

          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            Define qué documentos puede utilizar Veska como evidencia.
          </p>
        </div>

        <dl className="space-y-4 px-5 py-5">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Alcance
            </dt>

            <dd className="mt-2 text-sm font-semibold text-foreground">
              {getScopeDescription(
                scope,
                selectedSpacesCount,
                selectedDocumentsCount,
              )}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Modo inicial
            </dt>

            <dd className="mt-2 text-sm font-semibold text-foreground">
              Pregunta libre
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Fuentes
            </dt>

            <dd className="mt-2 text-sm leading-6 text-muted-foreground">
              Las respuestas deben mostrar evidencia verificable antes
              de utilizarse para tomar decisiones.
            </dd>
          </div>
        </dl>

        {isNewChat && (
          <div className="border-t border-border bg-surface-muted px-5 py-4">
            <p className="text-xs leading-5 text-muted-foreground">
              Los nuevos chats comienzan consultando automáticamente
              todos tus espacios accesibles.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-surface px-5 py-5">
        <h2 className="text-base font-semibold text-foreground">
          Biblioteca documental
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Revisa archivos disponibles, estados de procesamiento y
          documentos listos para consultar.
        </p>

        <Link
          href="/documents"
          className="mt-4 inline-flex rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
        >
          Ver biblioteca
        </Link>
      </section>
    </aside>
  );
}
