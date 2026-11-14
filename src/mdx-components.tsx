import type { MDXComponents } from "mdx/types";
import { Ledger } from "@/components/ledger";
import { Callout, Figure } from "@/components/prose";
import { Demo } from "@/components/demo";
import { AnchoredHeading } from "@/components/heading-anchor";
import { ProseLink } from "@/components/prose-link";

/** Components available in every .mdx file without an import. */
const components: MDXComponents = {
  Ledger,
  Callout,
  Figure,
  Demo,
  // Code blocks scroll sideways on small screens, so keyboard users must be able
  // to focus them to scroll (axe: scrollable-region-focusable).
  pre: (props) => <pre tabIndex={0} {...props} />,
  // Every section heading gets a copyable link (ids come from rehype-slug).
  h2: AnchoredHeading,
  // A link to another of the site's pages opens without a reload, like every other one.
  a: ProseLink,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
