import type { SVGProps } from "react";

type UploadIconProps = SVGProps<SVGSVGElement>;

const baseStroke = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 1.8,
};

export function UploadTrayIcon(props: UploadIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path {...baseStroke} d="M12 4.75v8.5" />
      <path {...baseStroke} d="m8.75 8.5 3.25-3.75L15.25 8.5" />
      <path {...baseStroke} d="M6.75 14.25v2.25h10.5v-2.25" />
      <path {...baseStroke} d="M8.5 12.5h7" />
    </svg>
  );
}
