import type { PlatformSetupInitialAdminInput } from "@/types/platform-setup";

type InitialAdminSetupStepProps = {
  values: PlatformSetupInitialAdminInput;
  errors: Partial<Record<keyof PlatformSetupInitialAdminInput, string>>;
  onUpdate: (patch: Partial<PlatformSetupInitialAdminInput>) => void;
};

const accessProviderOptions: {
  value: PlatformSetupInitialAdminInput["access_provider"];
  label: string;
}[] = [
  { value: "microsoft", label: "Microsoft" },
  { value: "google", label: "Google" },
  { value: "local", label: "local" },
];

export function InitialAdminSetupStep({
  values,
  errors,
  onUpdate,
}: InitialAdminSetupStepProps) {
  return (
    <section className="space-y-5">
      <div className="grid gap-5">
        <div className="space-y-1">
          <h3 className="text-[22px] font-semibold tracking-tight text-[#152436]">
            Administrador inicial
          </h3>

          <p className="text-[14px] leading-6 text-[#526173]">
            Define quién administrará la empresa al terminar el setup.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2 sm:col-span-2">
            <span className="text-[14px] font-semibold text-[#152436]">
              Nombre completo *
            </span>

            <input
              type="text"
              value={values.full_name}
              onChange={(event) =>
                onUpdate({ full_name: event.target.value })
              }
              placeholder="Ej. Sofía Martínez"
              autoComplete="name"
              className="w-full rounded-xl border border-[#D9E1EA] bg-white px-4 py-3 text-[14px] text-[#152436] outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-2 focus:ring-[rgba(66,122,198,0.16)]"
            />

            {errors.full_name && (
              <p role="alert" className="text-sm text-red-700">
                {errors.full_name}
              </p>
            )}
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="text-[14px] font-semibold text-[#152436]">
              Email corporativo *
            </span>

            <input
              type="email"
              value={values.email}
              onChange={(event) => onUpdate({ email: event.target.value })}
              placeholder="nombre@empresa.cl"
              autoComplete="email"
              className="w-full rounded-xl border border-[#D9E1EA] bg-white px-4 py-3 text-[14px] text-[#152436] outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-2 focus:ring-[rgba(66,122,198,0.16)]"
            />

            {errors.email && (
              <p role="alert" className="text-sm text-red-700">
                {errors.email}
              </p>
            )}
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[14px] font-semibold text-[#152436]">
              Proveedor de acceso preferido *
            </span>

            <select
              value={values.access_provider}
              onChange={(event) =>
                onUpdate({
                  access_provider: event.target.value as PlatformSetupInitialAdminInput["access_provider"],
                })
              }
              className="h-11 w-full rounded-xl border border-[#D9E1EA] bg-white px-4 text-[14px] text-[#152436] outline-none transition focus:border-[#427AC6] focus:ring-2 focus:ring-[rgba(66,122,198,0.16)]"
            >
              {accessProviderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {errors.access_provider && (
              <p role="alert" className="text-sm text-red-700">
                {errors.access_provider}
              </p>
            )}
          </label>

          <div className="space-y-2">
            <span className="text-[14px] font-semibold text-[#152436]">
              Rol
            </span>

            <div className="rounded-xl border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-3 text-[14px] font-semibold text-[#152436]">
              company_admin
            </div>

            {errors.role && (
              <p role="alert" className="text-sm text-red-700">
                {errors.role}
              </p>
            )}
          </div>
        </div>

        <p className="rounded-2xl border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-3 text-[14px] leading-6 text-[#526173]">
          OAuth valida identidad. El backend futuro deberá comprobar usuario autorizado, membresía activa y tenant activo antes de permitir acceso.
        </p>
      </div>
    </section>
  );
}
