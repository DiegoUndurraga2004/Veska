import Image from "next/image";

type VeskaLogoVariant = "full" | "mark";

type VeskaLogoProps = {
  variant: VeskaLogoVariant;
  className?: string;
  priority?: boolean;
};

const logoConfig: Record<
  VeskaLogoVariant,
  {
    src: string;
    width: number;
    height: number;
    defaultClassName: string;
  }
> = {
  full: {
    src: "/brand/LOGO_VESKA_COMPLETO.png",
    width: 2508,
    height: 627,
    defaultClassName: "h-auto w-[156px] object-contain",
  },
  mark: {
    src: "/brand/LOGO_SOLO_V.png",
    width: 1254,
    height: 1254,
    defaultClassName: "h-9 w-9 object-contain",
  },
};

export function VeskaLogo({
  variant,
  className,
  priority,
}: VeskaLogoProps) {
  const config = logoConfig[variant];

  return (
    <Image
      src={config.src}
      alt="Veska"
      width={config.width}
      height={config.height}
      priority={priority}
      className={className ?? config.defaultClassName}
    />
  );
}
