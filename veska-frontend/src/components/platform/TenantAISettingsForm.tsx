"use client";

import { useEffect, useState, type FormEvent } from "react";

import type { TenantAISettings } from "@/types/tenants";

type TenantAISettingsFormProps = {
  tenantName: string;
  initialSettings: TenantAISettings;
  onClose: () => void;
  onSave: (settings: TenantAISettings) => void;
};

function normalizeModelName(value: string) {
  return value.trim();
}

export function TenantAISettingsForm({
  tenantName,
  initialSettings,
  onClose,
  onSave,
}: TenantAISettingsFormProps) {
  const [provider, setProvider] = useState(initialSettings.provider);
  const [privacyTier, setPrivacyTier] = useState(
    initialSettings.privacy_tier,
  );
  const [modelName, setModelName] = useState(initialSettings.model_name);
  const [enabled, setEnabled] = useState(initialSettings.enabled);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedModelName = normalizeModelName(modelName);

    if (!normalizedModelName) {
      setErrorMessage("El modelo no puede quedar vacío.");
      return;
    }

    if (provider === "runpod") {
      onSave({
        provider,
        privacy_tier: "private",
        model_name: normalizedModelName,
        enabled,
      });
      return;
    }

    onSave({
      provider,
      privacy_tier: privacyTier,
      model_name: normalizedModelName,
      enabled,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-4 sm:items-center"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="platform-ai-settings-title"
        className="w-full max-w-2xl rounded-3xl border border-border bg-surface shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Configuración IA local
            </p>

            <h3
              id="platform-ai-settings-title"
              className="mt-1 text-lg font-semibold text-foreground"
            >
              Editar configuración IA
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              {tenantName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-surface-muted hover:text-foreground"
          >
            Cerrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">
                Proveedor
              </span>

              <select
                value={provider}
                onChange={(event) => {
                  const nextProvider = event.target.value as TenantAISettings["provider"];

                  setProvider(nextProvider);

                  if (nextProvider === "runpod") {
                    setPrivacyTier("private");
                  }
                }}
                className="w-full rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-brand"
              >
                <option value="openai">OpenAI API</option>
                <option value="runpod">Runpod privado</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">
                Privacy tier
              </span>

              <select
                value={privacyTier}
                onChange={(event) =>
                  setPrivacyTier(
                    event.target.value as TenantAISettings["privacy_tier"],
                  )
                }
                disabled={provider === "runpod"}
                className="w-full rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-brand disabled:cursor-not-allowed disabled:opacity-70"
              >
                <option value="standard">Estándar</option>
                <option value="private">Privado</option>
              </select>

              {provider === "runpod" && (
                <p className="text-xs text-muted-foreground">
                  Runpod exige privacidad privada, por eso se ajusta
                  automáticamente.
                </p>
              )}
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">
              Modelo
            </span>

            <input
              type="text"
              value={modelName}
              onChange={(event) => setModelName(event.target.value)}
              placeholder="gpt-4o-mini, llama-3.1-70b, etc."
              className="w-full rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-brand"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-border bg-surface-muted px-4 py-4">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => setEnabled(event.target.checked)}
              className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
            />

            <span>
              <span className="block text-sm font-medium text-foreground">
                Servicio habilitado
              </span>

              <span className="block text-xs text-muted-foreground">
                El tenant podrá usar este proveedor IA en el flujo local.
              </span>
            </span>
          </label>

          {errorMessage && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
