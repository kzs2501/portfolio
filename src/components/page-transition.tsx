import { ViewTransition, type ReactNode } from "react";

/**
 * Directional route animation. Links tagged `nav-forward` slide content in from
 * the right, `nav-back` from the left; untagged navigations don't animate.
 * Must wrap page content, not the layout: layouts persist across navigations.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const types = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" };
  return (
    <ViewTransition enter={types} exit={types} default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
