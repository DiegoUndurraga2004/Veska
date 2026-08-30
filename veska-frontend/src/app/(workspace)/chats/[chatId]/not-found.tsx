import Link from "next/link";

export default function ChatNotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
      <section className="w-full rounded-2xl border border-border bg-surface px-6 py-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Chat no encontrado
        </p>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
          No pudimos abrir esta conversación
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          El chat no existe, fue eliminado o no está disponible para tu
          usuario.
        </p>

        <Link
          href="/chats"
          className="mt-6 inline-flex rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
        >
          Volver al historial
        </Link>
      </section>
    </div>
  );
}
