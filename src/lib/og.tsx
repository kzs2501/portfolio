import { ImageResponse } from "next/og";
import { site } from "@/content/site";
import { ACCENT, INK, INK_MUTED, INK_SOFT, PAPER, RULE } from "./design-tokens";

export const ogSize = { width: 1200, height: 630 };

/** Shared link-preview card: ledger-style, readable as a small thumbnail. */
export function renderOg({ kicker, title }: { kicker: string; title: string }) {
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
        color: INK,
        borderLeft: `14px solid ${ACCENT}`,
      }}
    >
      <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: INK_MUTED }}>
        {kicker}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: title.length > 40 ? 64 : 76,
          lineHeight: 1.08,
          letterSpacing: -1.5,
          maxWidth: 980,
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 28,
          color: INK_SOFT,
          borderTop: `2px dashed ${RULE}`,
          paddingTop: 28,
        }}
      >
        <span>{site.name}</span>
        <span>{site.role}</span>
      </div>
    </div>,
    ogSize,
  );
}
