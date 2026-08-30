import Link from "next/link";

type OAuthProviderButton = {
  href: string;
  label: string;
  badge: string;
};

const oauthButtons: OAuthProviderButton[] = [
  {
    href: "/auth/callback?provider=microsoft&status=authorized",
    label: "Continuar con Microsoft",
    badge: "M",
  },
  {
    href: "/auth/callback?provider=google&status=authorized",
    label: "Continuar con Google",
    badge: "G",
  },
];

export function OAuthButtons() {
  return (
    <div className="space-y-3">
      {oauthButtons.map((button) => (
        <Link
          key={button.label}
          href={button.href}
          className="group flex h-[50px] w-full items-center gap-3.5 rounded-lg border border-border bg-white px-4 text-left text-[15px] font-medium text-foreground transition hover:bg-[#F7F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427AC6]/15 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface-muted text-[15px] font-semibold text-foreground"
          >
            {button.badge}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-medium leading-5">
              {button.label}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
