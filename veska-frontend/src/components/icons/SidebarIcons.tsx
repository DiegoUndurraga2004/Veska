import type { SVGProps } from "react";

type SidebarIconProps = SVGProps<SVGSVGElement>;

const baseStroke = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 1.8,
};

export function SidebarMarkIcon(props: SidebarIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        {...baseStroke}
        d="M6.5 7.5L12 17l5.5-9.5"
      />
    </svg>
  );
}

export function SidebarNewChatIcon(props: SidebarIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        {...baseStroke}
        d="M7 6.75h10A2.25 2.25 0 0 1 19.25 9v4A2.25 2.25 0 0 1 17 15.25H12.5l-4.25 3.25v-3.25H7A2.25 2.25 0 0 1 4.75 13v-4A2.25 2.25 0 0 1 7 6.75Z"
      />
      <path {...baseStroke} d="M12 9.5v4" />
      <path {...baseStroke} d="M10 11.5h4" />
    </svg>
  );
}

export function SidebarHomeIcon(props: SidebarIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        {...baseStroke}
        d="M4.75 10.25 12 5.5l7.25 4.75"
      />
      <path {...baseStroke} d="M6.75 9.5V18h10.5V9.5" />
      <path {...baseStroke} d="M10 18v-4h4v4" />
    </svg>
  );
}

export function SidebarChatsIcon(props: SidebarIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        {...baseStroke}
        d="M6.5 6.75h11A2.25 2.25 0 0 1 19.75 9v4A2.25 2.25 0 0 1 17.5 15.25H12l-4.5 3.25v-3.25H6.5A2.25 2.25 0 0 1 4.25 13v-4A2.25 2.25 0 0 1 6.5 6.75Z"
      />
      <path {...baseStroke} d="M8.5 10.5h7" />
      <path {...baseStroke} d="M8.5 13h4.5" />
    </svg>
  );
}

export function SidebarDocumentIcon(props: SidebarIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        {...baseStroke}
        d="M8 4.75h6.75L19.25 9v10.25H8A2.25 2.25 0 0 1 5.75 17V7A2.25 2.25 0 0 1 8 4.75Z"
      />
      <path {...baseStroke} d="M14.75 4.75V9h4.5" />
      <path {...baseStroke} d="M9.5 12.25h5" />
      <path {...baseStroke} d="M9.5 15h5" />
    </svg>
  );
}

export function SidebarUploadIcon(props: SidebarIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path {...baseStroke} d="M12 14V5.75" />
      <path {...baseStroke} d="m8.75 9.25 3.25-3.5 3.25 3.5" />
      <path {...baseStroke} d="M6.75 14.75v2.5H17.25v-2.5" />
    </svg>
  );
}

export function SidebarAdminIcon(props: SidebarIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path {...baseStroke} d="M6.75 18h10.5" />
      <path {...baseStroke} d="M8 18V9.25h8V18" />
      <path {...baseStroke} d="M10 9.25V6.75h4V9.25" />
      <path {...baseStroke} d="M10 12h.01" />
      <path {...baseStroke} d="M14 12h.01" />
    </svg>
  );
}

export function SidebarPlatformIcon(props: SidebarIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <rect {...baseStroke} x="5.75" y="5.75" width="5.5" height="5.5" rx="1.2" />
      <rect {...baseStroke} x="12.75" y="5.75" width="5.5" height="5.5" rx="1.2" />
      <rect {...baseStroke} x="5.75" y="12.75" width="5.5" height="5.5" rx="1.2" />
      <rect {...baseStroke} x="12.75" y="12.75" width="5.5" height="5.5" rx="1.2" />
    </svg>
  );
}

export function SidebarSpacesIcon(props: SidebarIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        {...baseStroke}
        d="M5.75 8.25A1.5 1.5 0 0 1 7.25 6.75h4.5l1.5 1.5h4.5A1.5 1.5 0 0 1 19.25 9.75v6.75A1.5 1.5 0 0 1 17.75 18H7.25a1.5 1.5 0 0 1-1.5-1.5V8.25Z"
      />
      <path {...baseStroke} d="M5.75 9.75h13.5" />
    </svg>
  );
}

export function SidebarReportIcon(props: SidebarIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path {...baseStroke} d="M7.75 5.75h8.5l-1.4 3 1.4 3h-8.5v6.5" />
      <path {...baseStroke} d="M7.75 18.25v-3" />
    </svg>
  );
}

export function SidebarChevronLeftIcon(props: SidebarIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path {...baseStroke} d="m14.5 6.75-5 5.25 5 5.25" />
    </svg>
  );
}

export function SidebarChevronRightIcon(props: SidebarIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path {...baseStroke} d="m9.5 6.75 5 5.25-5 5.25" />
    </svg>
  );
}

export function SidebarSendUpIcon(props: SidebarIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path {...baseStroke} d="M12 17V7.75" />
      <path {...baseStroke} d="M8.75 11 12 7.75 15.25 11" />
    </svg>
  );
}

export function SidebarHamburgerIcon(props: SidebarIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path {...baseStroke} d="M5.75 7h12.5" />
      <path {...baseStroke} d="M5.75 12h12.5" />
      <path {...baseStroke} d="M5.75 17h12.5" />
    </svg>
  );
}

export function SidebarCloseIcon(props: SidebarIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path {...baseStroke} d="m6.75 6.75 10.5 10.5" />
      <path {...baseStroke} d="m17.25 6.75-10.5 10.5" />
    </svg>
  );
}
