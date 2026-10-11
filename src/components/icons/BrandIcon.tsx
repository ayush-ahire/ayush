import { BRAND_PATHS, type BrandPlatform } from "./brand";

/**
 * Renders one of the bundled brand glyphs.
 *
 * `aria-hidden` because every use sits inside a link or button that already
 * carries the platform name in its accessible name — announcing the SVG too
 * would just repeat it.
 */
export function BrandIcon({
  platform,
  className,
}: {
  platform: BrandPlatform;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={BRAND_PATHS[platform]} />
    </svg>
  );
}