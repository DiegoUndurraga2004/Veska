"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { formatNumber } from "@/lib/formatters";
import { mockWorkspaceSession } from "@/mocks/session.mock";
import {
  mockPlatformMetrics,
  mockPlatformTenants,
  platformTenantProviderLabels,
  platformTenantPrivacyLabels,
  platformTenantStatusLabels,
} from "@/mocks/platform-admin.mock";
import type {
  PlatformTenantListItem,
  PlatformTenantStatus,
} from "@/types/platform";
import type { TenantAISettings } from "@/types/tenants";

import { TenantAISettingsForm } from "./TenantAISettingsForm";

type PlatformSection = "companies" | "usage" | "operations";

type FeedbackState =
  | {
      tone: "success" | "error" | "info";
      message: string;
    }
  | null;

const platformSections: {
  value: PlatformSection;
  label: string;
}[] = [
  {
    value: "companies",
    label: "Empresas",
  },
  {
    value: "usage",
    label: "Uso y consumo",
  },
  {
    value: "operations",
    label: "Estado operativo",
  },
];

function normalizeValue(value: string) {
  return value.trim().toLowerCase();
}

function formatStorageGb(value: number) {
  return `${value.toLocaleString("es-CL", {
    maximumFractionDigits: 1,
  })} GB`;
}

function buildTenantSearchKey(tenant: PlatformTenantListItem) {
  return [
    tenant.name,
    tenant.slug,
    tenant.plan.name,
    platformTenantStatusLabels[tenant.status],
    platformTenantProviderLabels[tenant.ai_settings.provider],
    platformTenantPrivacyLabels[tenant.ai_settings.privacy_tier],
  ]
    .join(" ")
    .toLowerCase();
}

function getCompanyUsageSummary(tenant: PlatformTenantListItem) {
  return [
    `${formatNumber(tenant.users_count)} usuarios`,
    `${formatNumber(tenant.documents_count)} documentos`,
    formatStorageGb(tenant.storage_used_gb),
    `${formatNumber(tenant.monthly_queries)} consultas`,
    `${formatNumber(tenant.recent_errors)} errores`,
  ].join(" · ");
}

function getOperationalSummary(tenant: PlatformTenantListItem) {
  const pendingJobs = Math.max(
    0,
    tenant.error_documents_count + (tenant.status === "trial" ? 1 : 0),
  );

  return `${formatNumber(tenant.recent_errors)} errores recientes · ${formatNumber(pendingJobs)} trabajos pendientes`;
}

export function PlatformAdminPanel() {
  const [activePlatformSection, setActivePlatformSection] =
    useState<PlatformSection>("companies");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    PlatformTenantStatus | "all"
  >("all");
  const [providerFilter, setProviderFilter] = useState<
    "all" | PlatformTenantListItem["ai_settings"]["provider"]
  >("all");
  const [privacyFilter, setPrivacyFilter] = useState<
    "all" | PlatformTenantListItem["ai_settings"]["privacy_tier"]
  >("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null,
  );
  const [isSettingsEditorOpen, setIsSettingsEditorOpen] =
    useState(false);
  const [settingsEditorVersion, setSettingsEditorVersion] =
    useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [tenants, setTenants] = useState(mockPlatformTenants);

  const isPlatformAdmin =
    mockWorkspaceSession.user.role === "platform_admin";

  const filteredCompanies = useMemo(() => {
    const normalizedQuery = normalizeValue(searchQuery);

    return tenants.filter((tenant) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        buildTenantSearchKey(tenant).includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "all" || tenant.status === statusFilter;
      const matchesProvider =
        providerFilter === "all" ||
        tenant.ai_settings.provider === providerFilter;
      const matchesPrivacy =
        privacyFilter === "all" ||
        tenant.ai_settings.privacy_tier === privacyFilter;

      return (
        matchesQuery &&
        matchesStatus &&
        matchesProvider &&
        matchesPrivacy
      );
    });
  }, [privacyFilter, providerFilter, searchQuery, statusFilter, tenants]);

  const selectedCompany = useMemo(
    () =>
      selectedCompanyId
        ? filteredCompanies.find(
            (company) => company.id === selectedCompanyId,
          ) ?? null
        : null,
    [filteredCompanies, selectedCompanyId],
  );

  const activeSectionIndex = platformSections.findIndex(
    (section) => section.value === activePlatformSection,
  );

  function clearFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setProviderFilter("all");
    setPrivacyFilter("all");
  }

  function openSettingsEditor() {
    if (!selectedCompany) {
      return;
    }

    setFeedback(null);
    setSettingsEditorVersion((currentVersion) => currentVersion + 1);
    setIsSettingsEditorOpen(true);
  }

  function handleSaveSettings(settings: TenantAISettings) {
    if (!selectedCompany) {
      return;
    }

    setTenants((currentTenants) =>
      currentTenants.map((tenant) =>
        tenant.id === selectedCompany.id
          ? {
              ...tenant,
              ai_settings: settings,
            }
          : tenant,
      ),
    );

    setFeedback({
      tone: "success",
      message: "La configuración IA se actualizó localmente en esta sesión.",
    });
    setIsSettingsEditorOpen(false);
  }

  function renderMetricBox() {
    return (
      <section className="rounded-[16px] border border-[#E8EDF3] bg-white px-5 py-6 shadow-[0_1px_2px_rgba(21,36,54,0.04)] sm:px-7 sm:py-7">
        <dl className="grid gap-0 md:grid-cols-3 xl:grid-cols-6">
          {mockPlatformMetrics.map((metric, index) => (
            <div
              key={metric.label}
              className={`min-w-0 px-4 py-4 md:px-5 md:py-5 ${
                index === 0
                  ? "border-l-0"
                  : "border-t border-[#E8EDF3] md:border-t-0 md:border-l"
              }`}
            >
              <dt className="text-[12px] font-medium leading-5 text-[#7D8A99]">
                {metric.label}
              </dt>

              <dd className="mt-2 text-[26px] font-semibold leading-[1.05] tracking-tight text-[#152436]">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    );
  }

  function renderCompaniesSection() {
    const hasSelection = Boolean(selectedCompany);

    return (
      <section
        className={`grid gap-6 ${
          hasSelection
            ? "xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.95fr)]"
            : ""
        }`}
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-[22px] font-semibold leading-[1.2] tracking-tight text-[#152436]">
                Empresas cliente
              </h2>

              <p className="mt-2 max-w-3xl text-[15px] leading-6 text-[#526173]">
                Busca y revisa empresas activas dentro de Veska.
              </p>
            </div>

            <Link
              href="/platform/setup/new"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#427AC6] px-4 text-sm font-semibold text-white transition hover:bg-[#356AAE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Nueva empresa
            </Link>
          </div>

          <p className="text-[14px] leading-6 text-[#526173]">
            Selecciona una empresa para revisar su configuración operativa.
          </p>

          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
            <label className="min-w-0 flex-1 lg:min-w-[280px]">
              <span className="sr-only">Buscar empresa</span>

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar empresa..."
                aria-label="Buscar empresa"
                className="w-full border-0 border-b border-[#D9E1EA] bg-transparent px-0 py-2.5 text-[15px] text-[#152436] outline-none transition placeholder:text-[#7D8A99] focus:border-[#427AC6] focus:ring-0"
              />
            </label>

            <label className="lg:w-[170px]">
              <span className="sr-only">Estado</span>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as PlatformTenantStatus | "all",
                  )
                }
                aria-label="Estado"
                className="h-11 w-full rounded-xl border border-[#D9E1EA] bg-white px-3 text-[14px] text-[#152436] outline-none transition focus:border-[#427AC6] focus:ring-2 focus:ring-[rgba(66,122,198,0.12)]"
              >
                <option value="all">Todos</option>
                <option value="active">Activa</option>
                <option value="trial">Piloto</option>
                <option value="inactive">Inactiva</option>
                <option value="suspended">Suspendida</option>
              </select>
            </label>

            <label className="lg:w-[180px]">
              <span className="sr-only">Provider IA</span>

              <select
                value={providerFilter}
                onChange={(event) =>
                  setProviderFilter(
                    event.target.value as
                      | "all"
                      | PlatformTenantListItem["ai_settings"]["provider"],
                  )
                }
                aria-label="Provider IA"
                className="h-11 w-full rounded-xl border border-[#D9E1EA] bg-white px-3 text-[14px] text-[#152436] outline-none transition focus:border-[#427AC6] focus:ring-2 focus:ring-[rgba(66,122,198,0.12)]"
              >
                <option value="all">Todos</option>
                <option value="openai">OpenAI API</option>
                <option value="runpod">Runpod privado</option>
              </select>
            </label>

            <label className="lg:w-[180px]">
              <span className="sr-only">Privacy tier</span>

              <select
                value={privacyFilter}
                onChange={(event) =>
                  setPrivacyFilter(
                    event.target.value as
                      | "all"
                      | PlatformTenantListItem["ai_settings"]["privacy_tier"],
                  )
                }
                aria-label="Privacy tier"
                className="h-11 w-full rounded-xl border border-[#D9E1EA] bg-white px-3 text-[14px] text-[#152436] outline-none transition focus:border-[#427AC6] focus:ring-2 focus:ring-[rgba(66,122,198,0.12)]"
              >
                <option value="all">Todos</option>
                <option value="standard">Estándar</option>
                <option value="private">Privado</option>
              </select>
            </label>

            <button
              type="button"
              onClick={clearFilters}
              className={`h-11 shrink-0 text-left text-[14px] font-semibold transition lg:self-end ${
                searchQuery === "" &&
                statusFilter === "all" &&
                providerFilter === "all" &&
                privacyFilter === "all"
                  ? "cursor-default text-[#7D8A99]"
                  : "text-[#427AC6] hover:text-[#356AAE]"
              }`}
            >
              Limpiar filtros
            </button>
          </div>

          <p className="text-[13px] leading-5 text-[#7D8A99]">
            {filteredCompanies.length} empresas visibles
          </p>

          <div className="space-y-3">
            {filteredCompanies.length === 0 ? (
              <div className="rounded-[16px] border border-[#E8EDF3] bg-white px-5 py-6">
                <p className="text-[15px] font-semibold text-[#152436]">
                  Sin coincidencias
                </p>

                <p className="mt-2 text-[14px] leading-6 text-[#526173]">
                  Ajusta la búsqueda o limpia los filtros para ver las empresas
                  disponibles.
                </p>
              </div>
            ) : (
              filteredCompanies.map((company) => {
                const isSelected = company.id === selectedCompany?.id;

                return (
                  <button
                    key={company.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedCompanyId(company.id)}
                    className={`w-full rounded-[16px] border px-5 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                      isSelected
                        ? "border-[#427AC6] bg-[#F7F9FC]"
                        : "border-[#E8EDF3] bg-white hover:border-[#D9E1EA] hover:bg-[#F7F9FC]"
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[16px] font-semibold text-[#152436]">
                            {company.name}
                          </h3>

                          <span className="rounded-full border border-[#E8EDF3] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#526173]">
                            {company.slug}
                          </span>

                          <span className="rounded-full border border-[#E8EDF3] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#526173]">
                            {platformTenantStatusLabels[company.status]}
                          </span>
                        </div>

                        <p className="text-[14px] leading-6 text-[#526173]">
                          {company.plan.name} ·{" "}
                          {
                            platformTenantProviderLabels[
                              company.ai_settings.provider
                            ]
                          }{" "}
                          ·{" "}
                          {
                            platformTenantPrivacyLabels[
                              company.ai_settings.privacy_tier
                            ]
                          }
                        </p>
                      </div>

                      <div className="text-[14px] leading-6 text-[#526173] lg:text-right">
                        <p>{getCompanyUsageSummary(company)}</p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {selectedCompany ? (
          <aside className="space-y-4">
            <div className="rounded-[16px] border border-[#E8EDF3] bg-white px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 border-b border-[#E8EDF3] pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#7D8A99]">
                    Empresa seleccionada
                  </p>

                  <h3 className="mt-2 text-[22px] font-semibold leading-[1.2] tracking-tight text-[#152436]">
                    {selectedCompany.name}
                  </h3>

                  <p className="mt-2 text-[14px] leading-6 text-[#526173]">
                    {selectedCompany.plan.name} ·{" "}
                    {platformTenantStatusLabels[selectedCompany.status]}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCompanyId(null)}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-[#D9E1EA] bg-white px-4 text-sm font-semibold text-[#427AC6] transition hover:border-[#C9D4E0] hover:text-[#356AAE]"
                  >
                    Cerrar detalle
                  </button>

                  <button
                    type="button"
                    onClick={openSettingsEditor}
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-[#427AC6] px-4 text-sm font-semibold text-white transition hover:bg-[#356AAE]"
                  >
                    Editar configuración IA
                  </button>
                </div>
              </div>

              {feedback && (
                <p className="mt-4 rounded-[12px] border border-[#E8EDF3] bg-[#F7F9FC] px-4 py-3 text-[14px] leading-6 text-[#526173]">
                  {feedback.message}
                </p>
              )}

              <div className="mt-5 space-y-5">
                <section>
                  <h4 className="text-[15px] font-semibold text-[#152436]">
                    Configuración IA no sensible
                  </h4>

                  <dl className="mt-3 divide-y divide-[#E8EDF3] rounded-[14px] border border-[#E8EDF3] bg-white">
                    {(
                      [
                        [
                          "Proveedor IA",
                          platformTenantProviderLabels[
                            selectedCompany.ai_settings.provider
                          ],
                        ],
                        ["Modelo", selectedCompany.ai_settings.model_name],
                        [
                          "Privacy tier",
                          platformTenantPrivacyLabels[
                            selectedCompany.ai_settings.privacy_tier
                          ],
                        ],
                        [
                          "Servicio habilitado",
                          selectedCompany.ai_settings.enabled ? "Sí" : "No",
                        ],
                      ] as const
                    ).map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-start justify-between gap-6 px-4 py-3"
                      >
                        <dt className="text-[14px] font-medium leading-6 text-[#526173]">
                          {label}
                        </dt>
                        <dd className="text-right text-[14px] font-semibold leading-6 text-[#152436]">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>

                <section>
                  <h4 className="text-[15px] font-semibold text-[#152436]">
                    Límites principales
                  </h4>

                  <dl className="mt-3 divide-y divide-[#E8EDF3] rounded-[14px] border border-[#E8EDF3] bg-white">
                    {(
                      [
                        ["max_users", "Máx. usuarios"],
                        ["max_documents", "Máx. documentos"],
                        ["max_storage_gb", "Máx. storage"],
                        ["max_requests_month", "Máx. requests mes"],
                        ["max_file_size_mb", "Máx. tamaño archivo"],
                        [
                          "max_bulk_import_files",
                          "Máx. archivos importación",
                        ],
                        [
                          "max_bulk_import_total_size_mb",
                          "Máx. tamaño importación",
                        ],
                      ] as const
                    ).map(([key, label]) => (
                      <div
                        key={key}
                        className="flex items-start justify-between gap-6 px-4 py-3"
                      >
                        <dt className="text-[14px] font-medium leading-6 text-[#526173]">
                          {label}
                        </dt>
                        <dd className="text-right text-[14px] font-semibold leading-6 text-[#152436]">
                          {formatNumber(selectedCompany.limits[key])}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>

                <section>
                  <h4 className="text-[15px] font-semibold text-[#152436]">
                    Detalle operacional simple
                  </h4>

                  <dl className="mt-3 divide-y divide-[#E8EDF3] rounded-[14px] border border-[#E8EDF3] bg-white">
                    {(
                      [
                        [
                          "Usuarios activos",
                          formatNumber(selectedCompany.active_users_count),
                        ],
                        [
                          "Documentos procesados",
                          formatNumber(
                            selectedCompany.ready_documents_count +
                              selectedCompany.error_documents_count,
                          ),
                        ],
                        [
                          "Storage usado",
                          formatStorageGb(selectedCompany.storage_used_gb),
                        ],
                        [
                          "Consultas del mes",
                          formatNumber(selectedCompany.monthly_queries),
                        ],
                        [
                          "Errores recientes",
                          formatNumber(selectedCompany.recent_errors),
                        ],
                        [
                          "Uso resumido",
                          getOperationalSummary(selectedCompany),
                        ],
                      ] as const
                    ).map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-start justify-between gap-6 px-4 py-3"
                      >
                        <dt className="text-[14px] font-medium leading-6 text-[#526173]">
                          {label}
                        </dt>
                        <dd className="text-right text-[14px] font-semibold leading-6 text-[#152436]">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              </div>
            </div>
          </aside>
        ) : (
          <div className="hidden xl:block">
            <div className="rounded-[16px] border border-[#E8EDF3] bg-white px-5 py-6">
              <p className="text-[15px] font-semibold text-[#152436]">
                Sin empresa seleccionada
              </p>

              <p className="mt-2 text-[14px] leading-6 text-[#526173]">
                La lista ocupa todo el ancho hasta que seleccionas una empresa.
              </p>
            </div>
          </div>
        )}
      </section>
    );
  }

  function renderUsageSection() {
    return (
      <section className="space-y-5">
        <div>
          <h2 className="text-[22px] font-semibold leading-[1.2] tracking-tight text-[#152436]">
            Uso y consumo
          </h2>

          <p className="mt-2 max-w-3xl text-[15px] leading-6 text-[#526173]">
            Revisa el uso simulado de documentos, consultas y almacenamiento
            por empresa.
          </p>
        </div>

        <div className="rounded-[16px] border border-[#E8EDF3] bg-white">
          <div className="grid gap-4 border-b border-[#E8EDF3] px-5 py-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#7D8A99] md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.7fr)]">
            <span>Empresa</span>
            <span className="hidden md:block">Uso principal</span>
            <span className="hidden md:block">Proveedor y privacidad</span>
          </div>

          <div className="divide-y divide-[#E8EDF3]">
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.7fr)] md:items-center"
              >
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-[#152436]">
                    {tenant.name}
                  </p>

                  <p className="mt-1 text-[14px] leading-6 text-[#526173]">
                    {tenant.plan.name} · {tenant.slug}
                  </p>
                </div>

                <div className="text-[14px] leading-6 text-[#526173]">
                  {formatNumber(tenant.documents_count)} documentos ·{" "}
                  {formatStorageGb(tenant.storage_used_gb)}
                </div>

                <div className="text-[14px] leading-6 text-[#526173]">
                  {
                    platformTenantProviderLabels[
                      tenant.ai_settings.provider
                    ]
                  }{" "}
                  ·{" "}
                  {
                    platformTenantPrivacyLabels[
                      tenant.ai_settings.privacy_tier
                    ]
                  }{" "}
                  · {formatNumber(tenant.monthly_queries)} consultas
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function renderOperationsSection() {
    return (
      <section className="space-y-5">
        <div>
          <h2 className="text-[22px] font-semibold leading-[1.2] tracking-tight text-[#152436]">
            Estado operativo
          </h2>

          <p className="mt-2 max-w-3xl text-[15px] leading-6 text-[#526173]">
            Revisa alertas, errores recientes y trabajos de procesamiento
            simulados.
          </p>
        </div>

        <div className="rounded-[16px] border border-[#E8EDF3] bg-white">
          <div className="grid gap-4 border-b border-[#E8EDF3] px-5 py-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#7D8A99] md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]">
            <span>Empresa</span>
            <span className="hidden md:block">Incidencias</span>
            <span className="hidden md:block">Trabajo pendiente</span>
          </div>

          <div className="divide-y divide-[#E8EDF3]">
            {tenants.map((tenant) => {
              const pendingJobs = Math.max(
                0,
                tenant.error_documents_count +
                  (tenant.status === "trial" ? 1 : 0),
              );

              return (
                <div
                  key={tenant.id}
                  className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] md:items-center"
                >
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-[#152436]">
                      {tenant.name}
                    </p>

                    <p className="mt-1 text-[14px] leading-6 text-[#526173]">
                      {platformTenantStatusLabels[tenant.status]} ·{" "}
                      {tenant.slug}
                    </p>
                  </div>

                  <div className="text-[14px] leading-6 text-[#526173]">
                    {formatNumber(tenant.recent_errors)} errores recientes ·{" "}
                    {formatNumber(tenant.error_documents_count)} documentos en
                    revisión
                  </div>

                  <div className="text-[14px] leading-6 text-[#526173]">
                    {formatNumber(pendingJobs)} trabajos pendientes ·{" "}
                    {formatNumber(tenant.active_users_count)} usuarios activos
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  if (!isPlatformAdmin) {
    return (
      <main className="mx-auto max-w-7xl space-y-8">
        <section className="space-y-3">
          <h1 className="text-[32px] font-semibold tracking-tight text-[#152436]">
            Panel Veska
          </h1>

          <p className="max-w-3xl text-[15px] leading-6 text-[#526173]">
            Supervisa empresas, uso general y estado operativo de la
            plataforma.
          </p>
        </section>

        <section className="rounded-[16px] border border-[#E8EDF3] bg-white px-6 py-7">
          <p className="text-[15px] font-semibold text-[#152436]">
            Acceso no autorizado
          </p>

          <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#526173]">
            Esta vista está reservada para platform_admin.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 pb-8">
      <section className="space-y-3">
        <h1 className="text-[32px] font-semibold tracking-tight text-[#152436]">
          Panel Veska
        </h1>

        <p className="max-w-3xl text-[15px] leading-6 text-[#526173]">
          Supervisa empresas, uso general y estado operativo de la plataforma.
        </p>
      </section>

      {renderMetricBox()}

      <section className="border-b border-[#E8EDF3]">
        <div
          role="tablist"
          aria-label="Secciones de plataforma"
          className="grid grid-cols-3"
        >
          {platformSections.map((section) => {
            const isActive = activePlatformSection === section.value;

            return (
              <button
                key={section.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActivePlatformSection(section.value)}
                className={`px-2 pb-4 pt-1 text-[15px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:text-[16px] ${
                  isActive
                    ? "text-[#152436]"
                    : "text-[#526173] hover:text-[#152436]"
                }`}
              >
                {section.label}
              </button>
            );
          })}
        </div>

        <div className="relative h-[2px] overflow-hidden bg-[#E8EDF3]">
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 h-[2px] w-1/3 rounded-full bg-[#427AC6] transition-transform duration-200 ease-out"
            style={{
              transform: `translateX(${Math.max(activeSectionIndex, 0) * 100}%)`,
            }}
          />
        </div>
      </section>

      <div className="transition-all duration-200 ease-out">
        {activePlatformSection === "companies"
          ? renderCompaniesSection()
          : activePlatformSection === "usage"
            ? renderUsageSection()
            : renderOperationsSection()}
      </div>

      {isSettingsEditorOpen && selectedCompany && (
        <TenantAISettingsForm
          key={`${selectedCompany.id}-${settingsEditorVersion}`}
          tenantName={selectedCompany.name}
          initialSettings={selectedCompany.ai_settings}
          onClose={() => setIsSettingsEditorOpen(false)}
          onSave={handleSaveSettings}
        />
      )}
    </main>
  );
}
