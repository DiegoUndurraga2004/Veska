import type { SVGProps } from "react";

type ChatIconProps = SVGProps<SVGSVGElement>;

const baseStroke = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 1.8,
};

export function ChatRegenerateIcon(props: ChatIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path {...baseStroke} d="M5.75 12a6.25 6.25 0 0 1 10.67-4.42" />
      <path {...baseStroke} d="M16.5 4.75v3.25h-3.25" />
      <path {...baseStroke} d="M18.25 12a6.25 6.25 0 0 1-10.67 4.42" />
      <path {...baseStroke} d="M7.5 19.25V16h3.25" />
    </svg>
  );
}

export function ChatHelpfulIcon(props: ChatIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path {...baseStroke} d="M9.75 10.75V19" />
      <path
        {...baseStroke}
        d="M9.75 18.75h6.25a1.5 1.5 0 0 0 1.5-1.5v-2.25a1.5 1.5 0 0 0-1.5-1.5h-1.85l.38-3.05a1.35 1.35 0 0 0-1.34-1.55h-.18l-1.1 2.1a2 2 0 0 1-1.77 1.05H9.75"
      />
      <path {...baseStroke} d="M6.75 10.75h2.25V19H6.75z" />
    </svg>
  );
}

export function ChatProblemIcon(props: ChatIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path {...baseStroke} d="M12 8.25v4.5" />
      <path {...baseStroke} d="M12 16.75h.01" />
      <path
        {...baseStroke}
        d="M12 5.75 18.5 18H5.5L12 5.75Z"
      />
    </svg>
  );
}

export function ChatCitationIcon(props: ChatIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        {...baseStroke}
        d="M7 7.25h10A2.25 2.25 0 0 1 19.25 9.5v5A2.25 2.25 0 0 1 17 16.75H12l-4.25 3v-3H7A2.25 2.25 0 0 1 4.75 14.5v-5A2.25 2.25 0 0 1 7 7.25Z"
      />
      <path {...baseStroke} d="M9.5 10.75h5" />
      <path {...baseStroke} d="M9.5 13.25h3.5" />
    </svg>
  );
}

export function ChatPanelOpenIcon(props: ChatIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path {...baseStroke} d="m14.5 6.75-5 5.25 5 5.25" />
    </svg>
  );
}

export function ChatPanelCloseIcon(props: ChatIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path {...baseStroke} d="m9.5 6.75 5 5.25-5 5.25" />
    </svg>
  );
}
