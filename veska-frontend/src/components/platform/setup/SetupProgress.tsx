type SetupProgressProps = {
  currentStep: number;
  totalSteps: number;
  title: string;
  stepLabels: string[];
};

export function SetupProgress({
  currentStep,
  totalSteps,
  title,
  stepLabels,
}: SetupProgressProps) {
  const activeStepIndex = Math.min(
    Math.max(currentStep - 1, 0),
    Math.max(stepLabels.length - 1, 0),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7D8A99]">
            Paso {currentStep} de {totalSteps}
          </p>

          <h2 className="mt-1 text-[22px] font-semibold tracking-tight text-[#152436] sm:text-[24px]">
            {title}
          </h2>
        </div>
      </div>

      <div className="border-b border-[#E8EDF3]">
        <div
          role="tablist"
          aria-label="Progreso del setup"
          className="grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-5"
        >
          {stepLabels.map((stepLabel, index) => {
            const isActive = index === activeStepIndex;
            const isCompleted = index < activeStepIndex;

            return (
              <div
                key={stepLabel}
                className="flex min-w-0 items-center gap-3 pb-4"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold transition ${
                    isActive
                      ? "border-[#427AC6] bg-[#427AC6] text-white"
                      : isCompleted
                        ? "border-[#427AC6] bg-[#EEF4FB] text-[#427AC6]"
                        : "border-[#D9E1EA] bg-white text-[#7D8A99]"
                  }`}
                >
                  {index + 1}
                </span>

                <div className="min-w-0">
                  <p
                    className={`truncate text-[14px] font-medium transition ${
                      isActive ? "text-[#152436]" : "text-[#526173]"
                    }`}
                    title={stepLabel}
                  >
                    {stepLabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-[#E8EDF3]">
        <div
          className="h-full rounded-full bg-[#427AC6] transition-all"
          style={{
            width: `${(currentStep / totalSteps) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
