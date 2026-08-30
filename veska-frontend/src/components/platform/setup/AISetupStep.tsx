import type { PlatformSetupAIInput } from "@/types/platform-setup";

type AISetupStepProps = {
  values: PlatformSetupAIInput;
  errors: Partial<Record<keyof PlatformSetupAIInput, string>>;
  onUpdate: (patch: Partial<PlatformSetupAIInput>) => void;
};

const providerOptions: {
  value: PlatformSetupAIInput["provider"];
  label: string;
}[] = [
  { value: "openai", label: "OpenAI API" },
  { value: "runpod", label: "Runpod privado" },
];

const privacyOptions: {
  value: PlatformSetupAIInput["privacy_tier"];
  label: string;
}[] = [
  { value: "standard", label: "Estándar" },
  { value: "private", label: "Privado" },
];

export function AISetupStep({
  values,
  errors,
  onUpdate,
}: AISetupStepProps) {
  const isRunpod = values.provider === "runpod";

  return (
    <section className="space-y-5">
      <div className="grid gap-5">
        <div className="space-y-1">
          <h3 className="text-[22px] font-semibold tracking-tight text-[#152436]">
            Configuración IA
          </h3>

          <p className="text-[14px] leading-6 text-[#526173]">
            Elige proveedor, privacy tier, modelo y si el servicio quedará habilitado.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[14px] font-semibold text-[#152436]">
              Proveedor *
            </span>

            <select
              value={values.provider}
              onChange={(event) => {
                const provider = event.target.value as PlatformSetupAIInput["provider"];

                onUpdate({
                  provider,
                  privacy_tier: provider === "runpod" ? "private" : values.privacy_tier,
                });
              }}
              className="h-11 w-full rounded-xl border border-[#D9E1EA] bg-white px-4 text-[14px] text-[#152436] outline-none transition focus:border-[#427AC6] focus:ring-2 focus:ring-[rgba(66,122,198,0.16)]"
            >
              {providerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {errors.provider && (
              <p role="alert" className="text-sm text-red-700">
                {errors.provider}
              </p>
            )}
          </label>

          <label className="space-y-2">
            <span className="text-[14px] font-semibold text-[#152436]">
              Privacy tier *
            </span>

            <select
              value={values.privacy_tier}
              onChange={(event) =>
                onUpdate({
                  privacy_tier:
                    event.target.value as PlatformSetupAIInput["privacy_tier"],
                })
              }
              disabled={isRunpod}
              className="h-11 w-full rounded-xl border border-[#D9E1EA] bg-white px-4 text-[14px] text-[#152436] outline-none transition focus:border-[#427AC6] focus:ring-2 focus:ring-[rgba(66,122,198,0.16)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {privacyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {isRunpod ? (
              <p className="text-[13px] leading-6 text-[#526173]">
                Runpod fuerza privacidad privada, por eso el valor se ajusta automáticamente.
              </p>
            ) : (
              <p className="text-[13px] leading-6 text-[#526173]">
                OpenAI puede utilizar estándar en este setup local.
              </p>
            )}

            {errors.privacy_tier && (
              <p role="alert" className="text-sm text-red-700">
                {errors.privacy_tier}
              </p>
            )}
          </label>
        </div>

        <label className="space-y-2">
          <span className="text-[14px] font-semibold text-[#152436]">
            Modelo *
          </span>

          <input
            type="text"
            value={values.model_name}
            onChange={(event) => onUpdate({ model_name: event.target.value })}
            placeholder="gpt-4o-mini, llama-3.1-70b, etc."
            autoComplete="off"
            className="w-full rounded-xl border border-[#D9E1EA] bg-white px-4 py-3 text-[14px] text-[#152436] outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-2 focus:ring-[rgba(66,122,198,0.16)]"
          />

          {errors.model_name && (
            <p role="alert" className="text-sm text-red-700">
              {errors.model_name}
            </p>
          )}
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-4">
          <input
            type="checkbox"
            checked={values.enabled}
            onChange={(event) => onUpdate({ enabled: event.target.checked })}
            className="h-4 w-4 rounded border-[#D9E1EA] text-[#427AC6] focus:ring-[#427AC6]"
          />

          <span>
            <span className="block text-[14px] font-semibold text-[#152436]">
              Servicio habilitado
            </span>

            <span className="block text-[13px] leading-6 text-[#526173]">
              El tenant podrá activar esta configuración IA en el flujo local.
            </span>
          </span>
        </label>

        <p className="rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-3 text-[14px] leading-6 text-[#526173]">
          Las credenciales del proveedor se configurarán posteriormente en backend o secret manager.
        </p>
      </div>
    </section>
  );
}
