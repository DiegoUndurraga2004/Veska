export type LoginAccessState =
  | "invalid-credentials"
  | "pending"
  | "inactive"
  | "oauth_error";

type LoginAccessNoticeProps = {
  state: LoginAccessState | null;
};

const notices: Record<
  LoginAccessState,
  {
    title: string;
    description: string;
  }
> = {
  "invalid-credentials": {
    title: "Credenciales incorrectas",
    description:
      "Revisa tu correo y contraseña. Si el problema continúa, intenta recuperar tu contraseña.",
  },
  pending: {
    title: "Tu cuenta aún no está activa",
    description:
      "Revisa tu correo para completar la activación o contacta al administrador de tu empresa.",
  },
  inactive: {
    title: "Tu cuenta está desactivada",
    description:
      "Contacta al administrador de tu empresa si crees que se trata de un error.",
  },
  oauth_error: {
    title: "No pudimos completar el inicio de sesión",
    description:
      "Ocurrió un problema al validar tu identidad. Intenta nuevamente.",
  },
};

export function LoginAccessNotice({
  state,
}: LoginAccessNoticeProps) {
  if (!state) {
    return null;
  }

  const notice = notices[state];

  return (
    <div
      role="alert"
      aria-live="polite"
      className="rounded-lg border border-border bg-[#F7F9FC] px-4 py-4"
    >
      <p className="text-[15px] font-semibold text-foreground">
        {notice.title}
      </p>

      <p className="mt-2 text-[14px] leading-6 text-muted-foreground">
        {notice.description}
      </p>
    </div>
  );
}
