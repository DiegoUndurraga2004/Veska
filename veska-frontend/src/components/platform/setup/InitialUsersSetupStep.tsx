import { useRef, type ChangeEvent } from "react";

import {
  type PlatformSetupCsvPreview,
  type PlatformSetupInitialUser,
  type PlatformSetupInitialUserInput,
} from "@/types/platform-setup";
import {
  PLATFORM_SETUP_INITIAL_USERS_MAX_CSV_BYTES,
  PLATFORM_SETUP_INITIAL_USERS_MAX_CSV_ROWS,
} from "@/lib/platform-setup-csv";

type NoticeTone = "success" | "error" | "info";

type InitialUsersSetupStepProps = {
  manualValues: PlatformSetupInitialUserInput;
  manualErrors: Partial<Record<keyof PlatformSetupInitialUserInput, string>>;
  manualFeedback: string | null;
  manualFeedbackTone: NoticeTone | null;
  users: PlatformSetupInitialUser[];
  adminEmail: string;
  csvPreview: PlatformSetupCsvPreview | null;
  csvError: string | null;
  csvFeedback: string | null;
  csvFeedbackTone: NoticeTone | null;
  isCsvProcessing: boolean;
  onManualUpdate: (patch: Partial<PlatformSetupInitialUserInput>) => void;
  onManualAdd: () => void;
  onManualRemove: (id: string) => void;
  onCsvSelectFile: (file: File) => void;
  onCsvAddValidRows: () => void;
  onCsvClearPreview: () => void;
};

const roleOptions: {
  value: PlatformSetupInitialUserInput["role"];
  label: string;
  description: string;
}[] = [
  {
    value: "company_admin",
    label: "company_admin",
    description: "Admin de la empresa.",
  },
  {
    value: "company_user",
    label: "company_user",
    description: "Usuario estándar.",
  },
  {
    value: "read_only",
    label: "read_only",
    description: "Solo lectura.",
  },
];

const providerOptions: {
  value: PlatformSetupInitialUserInput["auth_provider"];
  label: string;
  description: string;
}[] = [
  {
    value: "microsoft",
    label: "microsoft",
    description: "Login principal recomendado.",
  },
  {
    value: "google",
    label: "google",
    description: "Alternativa OAuth.",
  },
  {
    value: "local",
    label: "local",
    description: "Fallback local simulado.",
  },
];

function noticeClasses(tone: NoticeTone) {
  switch (tone) {
    case "success":
      return "border-[#C9DDF7] bg-[#EEF4FB] text-[#152436]";
    case "error":
      return "border-red-200 bg-red-50 text-red-800";
    case "info":
      return "border-border bg-surface-muted text-muted-foreground";
  }
}

export function InitialUsersSetupStep({
  manualValues,
  manualErrors,
  manualFeedback,
  manualFeedbackTone,
  users,
  adminEmail,
  csvPreview,
  csvError,
  csvFeedback,
  csvFeedbackTone,
  isCsvProcessing,
  onManualUpdate,
  onManualAdd,
  onManualRemove,
  onCsvSelectFile,
  onCsvAddValidRows,
  onCsvClearPreview,
}: InitialUsersSetupStepProps) {
  const csvInputRef = useRef<HTMLInputElement | null>(null);

  function handleCsvButtonClick() {
    csvInputRef.current?.click();
  }

  function handleCsvFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      onCsvSelectFile(file);
    }

    event.target.value = "";
  }

  return (
    <section className="space-y-5 rounded-3xl border border-[#E8EDF3] bg-white p-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <article className="space-y-5 rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">
              Usuarios manuales
            </h3>

            <p className="text-sm leading-6 text-muted-foreground">
              Agrega usuarios locales sin enviar invitaciones reales. El email se normaliza en minúsculas y no se permite duplicar el del administrador inicial.
            </p>
          </div>

          <div className="grid gap-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">
                Nombre completo *
              </span>

              <input
                type="text"
                value={manualValues.name}
                onChange={(event) =>
                  onManualUpdate({ name: event.target.value })
                }
                placeholder="Ej. María Soto"
                autoComplete="name"
                className="w-full rounded-xl border border-[#D9E1EA] bg-white px-3 py-2.5 text-sm text-[#152436] outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-4 focus:ring-[#427AC6]/10"
              />

              {manualErrors.name && (
                <p role="alert" className="text-sm text-red-700">
                  {manualErrors.name}
                </p>
              )}
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">
                Email corporativo *
              </span>

              <input
                type="email"
                value={manualValues.email}
                onChange={(event) =>
                  onManualUpdate({ email: event.target.value })
                }
                onBlur={(event) =>
                  onManualUpdate({
                    email: event.target.value.trim().toLowerCase(),
                  })
                }
                placeholder="usuario@empresa.cl"
                autoComplete="email"
                className="w-full rounded-xl border border-[#D9E1EA] bg-white px-3 py-2.5 text-sm text-[#152436] outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-4 focus:ring-[#427AC6]/10"
              />

              {manualErrors.email && (
                <p role="alert" className="text-sm text-red-700">
                  {manualErrors.email}
                </p>
              )}
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">
                  Rol inicial *
                </span>

                <select
                  value={manualValues.role}
                  onChange={(event) =>
                    onManualUpdate({
                      role: event.target.value as PlatformSetupInitialUserInput["role"],
                    })
                  }
                  className="w-full rounded-xl border border-[#D9E1EA] bg-white px-3 py-2.5 text-sm text-[#152436] outline-none transition focus:border-[#427AC6] focus:ring-4 focus:ring-[#427AC6]/10"
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <p className="text-xs leading-5 text-muted-foreground">
                  {roleOptions.find((option) => option.value === manualValues.role)?.description}
                </p>

                {manualErrors.role && (
                  <p role="alert" className="text-sm text-red-700">
                    {manualErrors.role}
                  </p>
                )}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">
                  Proveedor de acceso preferido *
                </span>

                <select
                  value={manualValues.auth_provider}
                  onChange={(event) =>
                    onManualUpdate({
                      auth_provider: event.target.value as PlatformSetupInitialUserInput["auth_provider"],
                    })
                  }
                  className="w-full rounded-xl border border-[#D9E1EA] bg-white px-3 py-2.5 text-sm text-[#152436] outline-none transition focus:border-[#427AC6] focus:ring-4 focus:ring-[#427AC6]/10"
                >
                  {providerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <p className="text-xs leading-5 text-muted-foreground">
                  {providerOptions.find((option) => option.value === manualValues.auth_provider)?.description}
                </p>

                {manualErrors.auth_provider && (
                  <p role="alert" className="text-sm text-red-700">
                    {manualErrors.auth_provider}
                  </p>
                )}
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onManualAdd}
                className="rounded-xl bg-[#427AC6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#356AAE]"
              >
                Agregar usuario
              </button>

              <div className="rounded-xl border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-2.5 text-xs leading-5 text-[#526173]">
                El administrador inicial se agregará automáticamente al final del flujo y no aparece aquí.
              </div>
            </div>

            {manualFeedback && manualFeedbackTone && (
              <p
                role={manualFeedbackTone === "error" ? "alert" : undefined}
                className={`rounded-xl border px-4 py-3 text-sm leading-6 ${noticeClasses(manualFeedbackTone)}`}
              >
                {manualFeedback}
              </p>
            )}
          </div>
        </article>

        <article className="space-y-5 rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">
              Importación CSV simulada
            </h3>

            <p className="text-sm leading-6 text-muted-foreground">
              Sube un archivo .csv con columnas obligatorias <span className="font-semibold text-foreground">name</span>, <span className="font-semibold text-foreground">email</span>, <span className="font-semibold text-foreground">role</span> y <span className="font-semibold text-foreground">auth_provider</span>.
            </p>
          </div>

          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={handleCsvFileChange}
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleCsvButtonClick}
              disabled={isCsvProcessing}
              className="rounded-xl border border-[#D9E1EA] bg-white px-4 py-2.5 text-sm font-semibold text-[#152436] transition hover:bg-[#F7F9FC] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCsvProcessing ? "Procesando CSV..." : "Importar CSV"}
            </button>

            <button
              type="button"
              onClick={onCsvClearPreview}
              disabled={!csvPreview && !csvError}
              className="rounded-xl border border-[#D9E1EA] px-4 py-2.5 text-sm font-semibold text-[#152436] transition hover:bg-[#F7F9FC] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Limpiar preview
            </button>
          </div>

          <p className="rounded-xl border border-[#E8EDF3] bg-white px-4 py-3 text-xs leading-5 text-[#526173]">
            Límite local de desarrollo: hasta {PLATFORM_SETUP_INITIAL_USERS_MAX_CSV_ROWS} filas y {Math.floor(PLATFORM_SETUP_INITIAL_USERS_MAX_CSV_BYTES / (1024 * 1024))} MB. El backend futuro volverá a validar límites, tenant y permisos.
          </p>

          {csvError && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
              {csvError}
            </p>
          )}

          {csvFeedback && csvFeedbackTone && (
            <p
              role={csvFeedbackTone === "error" ? "alert" : undefined}
              className={`rounded-xl border px-4 py-3 text-sm leading-6 ${noticeClasses(csvFeedbackTone)}`}
            >
              {csvFeedback}
            </p>
          )}

          {csvPreview ? (
            <div className="space-y-4 rounded-2xl border border-[#E8EDF3] bg-white px-4 py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {csvPreview.file_name}
                  </h4>
                  <p className="text-xs leading-5 text-muted-foreground">
                    {csvPreview.total_rows} filas detectadas
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
                  <span className="rounded-full border border-[#C9DDF7] bg-[#EEF4FB] px-3 py-1 text-[#427AC6]">
                    Válidas: {csvPreview.valid_rows.length}
                  </span>
                  <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-700">
                    Con error: {csvPreview.invalid_rows.length}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <section className="space-y-3">
                  <h5 className="text-sm font-semibold text-foreground">
                    Filas válidas
                  </h5>

                  <div className="max-h-56 space-y-2 overflow-auto pr-1">
                    {csvPreview.valid_rows.length === 0 ? (
                      <p className="rounded-xl border border-[#E8EDF3] bg-[#F7F9FC] px-3 py-3 text-sm text-[#526173]">
                        No hay filas válidas en esta carga.
                      </p>
                    ) : (
                      csvPreview.valid_rows.map((row) => (
                        <div
                          key={row.id}
                          className="rounded-xl border border-[#C9DDF7] bg-[#EEF4FB] px-3 py-3 text-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-[#152436]">
                                {row.name}
                              </p>
                              <p className="text-[#526173]">
                                {row.email}
                              </p>
                            </div>

                            <span className="rounded-full border border-[#D9E1EA] bg-white px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[#427AC6]">
                              {row.source}
                            </span>
                          </div>

                          <p className="mt-2 text-xs leading-5 text-[#526173]">
                            {row.role} · {row.auth_provider}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <section className="space-y-3">
                  <h5 className="text-sm font-semibold text-foreground">
                    Filas con error
                  </h5>

                  <div className="max-h-56 space-y-2 overflow-auto pr-1">
                    {csvPreview.invalid_rows.length === 0 ? (
                      <p className="rounded-xl border border-[#E8EDF3] bg-[#F7F9FC] px-3 py-3 text-sm text-[#526173]">
                        No hay errores en esta carga.
                      </p>
                    ) : (
                      csvPreview.invalid_rows.map((row) => (
                        <div
                          key={row.row_number}
                          className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm"
                        >
                          <p className="font-semibold text-red-900">
                            Fila {row.row_number}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-red-800/80">
                            {row.raw.name || "(sin nombre)"} · {row.raw.email || "(sin email)"}
                          </p>

                          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-red-800">
                            {row.errors.map((error) => (
                              <li key={error}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onCsvAddValidRows}
                  disabled={csvPreview.valid_rows.length === 0 || isCsvProcessing}
                  className="rounded-xl bg-[#427AC6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#356AAE] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Agregar filas válidas
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#E8EDF3] bg-white px-4 py-6 text-sm leading-6 text-[#526173]">
              Aún no se cargó un CSV. El preview mostrará filas válidas, filas con error y el detalle de errores antes de agregar nada al listado local.
            </div>
          )}
        </article>
      </div>

      <article className="space-y-4 rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Usuarios iniciales preparados
            </h3>

            <p className="text-sm leading-6 text-muted-foreground">
              Revisión local de los usuarios adicionales antes del paso final. El administrador inicial se incorporará automáticamente al crear la empresa simulada.
            </p>
          </div>

          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Total local: {users.length}
          </p>
        </div>

        <div className="max-h-72 space-y-3 overflow-auto pr-1">
          {users.length === 0 ? (
            <p className="rounded-xl border border-[#E8EDF3] bg-white px-4 py-4 text-sm text-[#526173]">
              Todavía no hay usuarios adicionales preparados.
            </p>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="rounded-xl border border-[#E8EDF3] bg-white px-4 py-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {user.name}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {user.role} · {user.auth_provider} · origen {user.source}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onManualRemove(user.id)}
                    className="rounded-xl border border-[#D9E1EA] px-3 py-2 text-sm font-semibold text-[#152436] transition hover:bg-[#F7F9FC]"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <p className="rounded-xl border border-[#E8EDF3] bg-white px-4 py-3 text-xs leading-5 text-[#526173]">
          La validación frontend es solo un control de experiencia. El backend futuro deberá volver a comprobar límites, tenant y permisos.
        </p>

        <p className="text-xs leading-5 text-muted-foreground">
          Email del administrador inicial: {adminEmail || "sin definir todavía"}.
        </p>
      </article>
    </section>
  );
}
