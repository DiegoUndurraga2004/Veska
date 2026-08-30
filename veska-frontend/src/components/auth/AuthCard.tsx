import Link from "next/link";
import type { ReactNode } from "react";

import { VeskaLogo } from "@/components/brand/VeskaLogo";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function AuthCard({
  title,
  description,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <section
      className={`w-full rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8 ${
        className ?? "max-w-md"
      }`}
    >
      <div className="mb-7">
        <Link
          href="/login"
          className="inline-flex"
        >
          <VeskaLogo variant="full" className="h-auto w-[156px] object-contain" />
        </Link>

        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Workspace documental privado
        </p>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="mt-7">{children}</div>

      {footer && (
        <div className="mt-7 border-t border-border pt-5 text-sm text-muted-foreground">
          {footer}
        </div>
      )}
    </section>
  );
}
