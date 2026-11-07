import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";
import { ACCENT, INK, INK_MUTED, INK_SOFT, PAPER, RULE } from "./design-tokens";
import { ogSize } from "./preview-image";

/** The page's faint drawing-board grid: the accent at 9%, as in globals.css. */
const GRID = `rgba(${[1, 3, 5].map((at) => Number.parseInt(ACCENT.slice(at, at + 2), 16)).join(", ")}, 0.09)`;

/**
 * The fonts, read once per build from og-fonts/ (static TTF, which the image renderer
 * needs; both under the SIL Open Font License).
 */
const fonts = Promise.all(
  [
    { file: "SchibstedGrotesk-Medium.ttf", name: "Schibsted Grotesk", weight: 500 },
    { file: "SchibstedGrotesk-ExtraBold.ttf", name: "Schibsted Grotesk", weight: 800 },
    { file: "MartianMono-Regular.ttf", name: "Martian Mono", weight: 400 },
  ].map(async ({ file, name, weight }) => ({
    name,
    weight: weight as 400 | 500 | 800,
    data: await readFile(join(process.cwd(), "src/lib/og-fonts", file)),
  })),
);

/** Shared link-preview card: a sheet of drawing paper, readable as a small thumbnail. */
export async function renderOg({ kicker, title }: { kicker: string; title: string }) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: PAPER.light,
        backgroundImage: `linear-gradient(${GRID} 1px, transparent 1px), linear-gradient(90deg, ${GRID} 1px, transparent 1px)`,
        backgroundSize: "30px 30px",
        color: INK,
        fontFamily: "Schibsted Grotesk",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 16,
          fontFamily: "Martian Mono",
          fontSize: 24,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: INK_MUTED,
        }}
      >
        <span style={{ color: ACCENT }}>→</span>
        <span>{kicker}</span>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: title.length > 40 ? 64 : 76,
          fontWeight: 800,
          lineHeight: 1.08,
          letterSpacing: -2,
          maxWidth: 1000,
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 28,
          fontWeight: 500,
          color: INK_SOFT,
          borderTop: `2px solid ${RULE}`,
          paddingTop: 28,
        }}
      >
        <span style={{ color: INK }}>{site.name}</span>
        <span>{site.role}</span>
      </div>
    </div>,
    { ...ogSize, fonts: await fonts },
  );
}
