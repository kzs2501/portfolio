import { renderOg, ogSize } from "@/lib/og";

export const dynamic = "force-static";
export const size = ogSize;
export const contentType = "image/png";
export const alt = "Kshitiz Sonakiya — Senior Frontend Engineer";

export default function Image() {
  return renderOg({
    kicker: "Portfolio",
    title: "Payments, multi-step checkout, and the tests that keep them safe.",
  });
}
