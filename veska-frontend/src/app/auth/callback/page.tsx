import { OAuthCallbackState } from "@/components/auth/OAuthCallbackState";

type OAuthCallbackPageProps = {
  searchParams: Promise<{
    provider?: string | string[];
    status?: string | string[];
  }>;
};

type OAuthProvider = "microsoft" | "google";
type OAuthCallbackStatus =
  | "authorized"
  | "no_company"
  | "pending"
  | "inactive"
  | "oauth_error";

function getOAuthProvider(
  provider: string | string[] | undefined,
): OAuthProvider {
  const resolvedProvider = Array.isArray(provider) ? provider[0] : provider;

  if (resolvedProvider === "google") {
    return "google";
  }

  return "microsoft";
}

function getOAuthCallbackStatus(
  status: string | string[] | undefined,
): OAuthCallbackStatus {
  const resolvedStatus = Array.isArray(status) ? status[0] : status;

  if (resolvedStatus === "authorized") {
    return "authorized";
  }

  if (resolvedStatus === "no_company") {
    return "no_company";
  }

  if (resolvedStatus === "pending") {
    return "pending";
  }

  if (resolvedStatus === "inactive") {
    return "inactive";
  }

  return "oauth_error";
}

export default async function OAuthCallbackPage({
  searchParams,
}: OAuthCallbackPageProps) {
  const { provider, status } = await searchParams;

  const resolvedProvider = getOAuthProvider(provider);
  const resolvedStatus = getOAuthCallbackStatus(status);

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background">
      <OAuthCallbackState
        provider={resolvedProvider}
        status={resolvedStatus}
      />
    </main>
  );
}
