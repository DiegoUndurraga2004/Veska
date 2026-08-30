import type { CompanyAdminMetric } from "@/mocks/company-admin.mock";

type CompanyAdminMetricsProps = {
  metrics: CompanyAdminMetric[];
};

export function CompanyAdminMetrics({
  metrics,
}: CompanyAdminMetricsProps) {
  return (
    <div className="grid gap-y-8 sm:grid-cols-2 xl:grid-cols-5 xl:gap-y-0">
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className={`flex flex-col items-center justify-center px-4 py-2 text-center ${
            index > 0 ? "border-l border-[#E8EDF3]" : ""
          }`}
        >
          <p className="text-[30px] font-semibold tracking-tight text-[#152436] sm:text-[34px]">
            {metric.value}
          </p>

          <p className="mt-2 text-[14px] font-medium leading-5 text-[#526173]">
            {metric.label}
          </p>
        </div>
      ))}
    </div>
  );
}
