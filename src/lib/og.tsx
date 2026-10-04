import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const ogSize = { width: 1200, height: 630 };

/** Shared link-preview card: ledger-style, readable as a small thumbnail. */
export function renderOg({ kicker, title }: { kicker: string; title: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#fbf9f5",
          color: "#2a2520",
          borderLeft: "14px solid #b8402c",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: "#7d746b" }}>
          {kicker}
        </div>
        <div style={{ display: "flex", fontSize: title.length > 40 ? 64 : 76, lineHeight: 1.08, letterSpacing: -1.5, maxWidth: 980 }}>
          {title}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: "#5a524a", borderTop: "2px dashed #b9b0a6", paddingTop: 28 }}>
          <span>{site.name}</span>
          <span>Senior Frontend Engineer</span>
        </div>
      </div>
    ),
    ogSize,
  );
}
