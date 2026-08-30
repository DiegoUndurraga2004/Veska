import type { PlatformSetupCompanyInput } from "@/types/platform-setup";

type CompanySetupStepProps = {
  values: PlatformSetupCompanyInput;
  errors: Partial<Record<keyof PlatformSetupCompanyInput, string>>;
  onUpdate: (patch: Partial<PlatformSetupCompanyInput>) => void;
};

const planOptions: {
  value: PlatformSetupCompanyInput["plan"];
  label: string;
}[] = [
  { value: "piloto", label: "Piloto" },
  { value: "estandar", label: "Estándar" },
  { value: "privado", label: "Privado" },
];

const statusOptions: {
  value: PlatformSetupCompanyInput["status"];
  label: string;
}[] = [
  { value: "trial", label: "trial" },
  { value: "inactive", label: "inactive" },
];

export function CompanySetupStep({
  values,
  errors,
  onUpdate,
}: CompanySetupStepProps) {
  return (
    <section className="space-y-5">
      <div className="grid gap-5">
        <div className="space-y-1">
          <h3 className="text-[22px] font-semibold tracking-tight text-[#152436]">
            Datos de empresa
          </h3>

          <p className="text-[14px] leading-6 text-[#526173]">
            Define el nombre, slug, plan y estado inicial de la empresa.
          </p>
        </div>

        <label className="space-y-2">
          <span className="text-[14px] font-semibold text-[#152436]">
            Nombre de empresa *
          </span>

          <input
            type="text"
            value={values.name}
            onChange={(event) => onUpdate({ name: event.target.value })}
            placeholder="Ej. Veska Sur"
            autoComplete="organization"
            className="w-full rounded-xl border border-[#D9E1EA] bg-white px-4 py-3 text-[14px] text-[#152436] outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-2 focus:ring-[rgba(66,122,198,0.16)]"
          />

          {errors.name && (
            <p role="alert" className="text-sm text-red-700">
              {errors.name}
            </p>
          )}
        </label>

        <label className="space-y-2">
          <span className="text-[14px] font-semibold text-[#152436]">
            Slug *
          </span>

          <input
            type="text"
            value={values.slug}
            onChange={(event) =>
              onUpdate({ slug: event.target.value.toLowerCase() })
            }
            onBlur={(event) =>
              onUpdate({
                slug: event.target.value.trim().toLowerCase(),
              })
            }
            placeholder="veska-sur"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-xl border border-[#D9E1EA] bg-white px-4 py-3 text-[14px] text-[#152436] outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-2 focus:ring-[rgba(66,122,198,0.16)]"
          />

          <p className="text-[13px] leading-6 text-[#526173]">
            Usa minúsculas, números y guiones. Se eliminarán los espacios exteriores.
          </p>

          {errors.slug && (
            <p role="alert" className="text-sm text-red-700">
              {errors.slug}
            </p>
          )}
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[14px] font-semibold text-[#152436]">
              Plan *
            </span>

            <select
              value={values.plan}
              onChange={(event) =>
                onUpdate({
                  plan: event.target.value as PlatformSetupCompanyInput["plan"],
                })
              }
              className="h-11 w-full rounded-xl border border-[#D9E1EA] bg-white px-4 text-[14px] text-[#152436] outline-none transition focus:border-[#427AC6] focus:ring-2 focus:ring-[rgba(66,122,198,0.16)]"
            >
              {planOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {errors.plan && (
              <p role="alert" className="text-sm text-red-700">
                {errors.plan}
              </p>
            )}
          </label>

          <label className="space-y-2">
            <span className="text-[14px] font-semibold text-[#152436]">
              Estado inicial *
            </span>

            <select
              value={values.status}
              onChange={(event) =>
                onUpdate({
                  status:
                    event.target.value as PlatformSetupCompanyInput["status"],
                })
              }
              className="h-11 w-full rounded-xl border border-[#D9E1EA] bg-white px-4 text-[14px] text-[#152436] outline-none transition focus:border-[#427AC6] focus:ring-2 focus:ring-[rgba(66,122,198,0.16)]"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {errors.status && (
              <p role="alert" className="text-sm text-red-700">
                {errors.status}
              </p>
            )}
          </label>
        </div>
      </div>
    </section>
  );
}
