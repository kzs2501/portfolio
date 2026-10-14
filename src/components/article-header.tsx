import { ViewTransition, type ReactNode } from "react";
import { Eyebrow } from "./eyebrow";

/**
 * The top of a case study, note or project: eyebrow, title, summary, then anything
 * the page adds (facts, links, contents). Pass `titleTransitionName` to let the title
 * morph from a matching element on the previous page.
 */
export function ArticleHeader({
  eyebrow,
  title,
  summary,
  titleTransitionName,
  children,
}: {
  eyebrow: ReactNode;
  title: string;
  summary: string;
  titleTransitionName?: string;
  children?: ReactNode;
}) {
  const heading = (
    <h1 className="mt-4 font-serif text-[2.4rem] leading-[1.05] tracking-tight text-balance sm:text-5xl">{title}</h1>
  );
  return (
    <header className="mt-10">
      <Eyebrow>{eyebrow}</Eyebrow>
      {titleTransitionName ? (
        <ViewTransition name={titleTransitionName} share="morph" default="none">
          {heading}
        </ViewTransition>
      ) : (
        heading
      )}
      <p className="mt-5 text-lg leading-relaxed text-pretty text-ink-2">{summary}</p>
      {children}
    </header>
  );
}
