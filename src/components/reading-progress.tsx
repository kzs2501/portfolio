/**
 * A 2px rule under the header that fills as you read. Entirely CSS
 * (`animation-timeline: scroll()`, see globals.css) — no JS, no scroll listener.
 */
export function ReadingProgress() {
  return <div className="reading-progress" aria-hidden="true" />;
}
