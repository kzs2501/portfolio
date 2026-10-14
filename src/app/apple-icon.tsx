import { ImageResponse } from "next/og";
import { ACCENT, PAPER } from "@/lib/design-tokens";

export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon: the same K monogram, as a full-bleed tile (iOS rounds it). */
export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: ACCENT }}>
      <svg
        width="180"
        height="180"
        viewBox="0 0 32 32"
        fill="none"
        stroke={PAPER.light}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11.5 8v16" />
        <path d="M21.5 8l-8.4 8.6" />
        <path d="M15.6 14.4l6.4 9.6" />
      </svg>
    </div>,
    size,
  );
}
