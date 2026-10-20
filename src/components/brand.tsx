import Link from "next/link";
import { GrassQMark } from "./grass-q";

// Change to "landscape" to restore the original logo everywhere.
export const logoStyle: "grass-q" | "landscape" = "grass-q";

export function BrandMark({ className = "" }: { className?: string }) {
  const Mark = logoStyle === "grass-q" ? GrassQMark : LandscapeMark;
  return <Mark className={className} />;
}
export function LandscapeMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="44"
      height="31"
      viewBox="0 0 44 31"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 25c7-9 14-9 22 0M14 24c9-15 18-14 28 0M2 30h40"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M28 9c0-4 3-7 7-7-1 4-3 7-7 7Zm0 0v10"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}
export function Brand({
  light = false,
  onClick,
}: {
  light?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href="/"
      aria-label="Quality Landscape & More home"
      onClick={onClick}
      className={`brand ${logoStyle === "grass-q" ? "brand-integrated" : ""} ${light ? "brand-light" : ""}`}
    >
      <BrandMark />
      <span>
        <strong>{logoStyle === "grass-q" ? "UALITY" : "QUALITY"}</strong>
        <small>LANDSCAPE & MORE</small>
      </span>
    </Link>
  );
}
