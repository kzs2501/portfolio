import type { MDXComponents } from "mdx/types";
import { Ledger } from "@/components/ledger";
import { Callout, Figure } from "@/components/prose";

/** Components available in every .mdx file without an import. */
const components: MDXComponents = { Ledger, Callout, Figure };

export function useMDXComponents(): MDXComponents {
  return components;
}
