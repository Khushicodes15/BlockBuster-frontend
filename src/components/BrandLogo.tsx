import Image from "next/image";

/**
 * Bengaluru Traffic Police emblem.
 * To use the official raster, drop it in `public/btp-logo.png` and change
 * `src` below to `/btp-logo.png` — nothing else needs to change.
 */
export function BrandLogo({ size = 42, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/btp-logo.svg"
      alt="Bengaluru Traffic Police"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
