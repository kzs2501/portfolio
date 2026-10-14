import type { TocItem } from "@/lib/toc";
import { TocActive } from "./toc-active";

/** Static links (work without JS); TocActive layers the "you are here" state on top. */
function TocList({ items }: { items: TocItem[] }) {
  return (
    <ol className="space-y-0.5 text-sm">
      {items.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`} data-toc-id={item.id} className="toc-link block py-1 pl-3 text-ink-3 hover:text-ink">
            {item.title}
          </a>
        </li>
      ))}
    </ol>
  );
}

/** Sticky sidebar on wide screens. */
export function TocSidebar({ items }: { items: TocItem[] }) {
  return (
    <nav aria-label="Contents" className="sticky top-24">
      <p className="num mb-3 text-[11px] tracking-[0.18em] text-ink-3 uppercase">Contents</p>
      <TocList items={items} />
      <TocActive ids={items.map((i) => i.id)} />
    </nav>
  );
}

/** Collapsed "On this page" for narrower screens. */
export function TocInline({ items }: { items: TocItem[] }) {
  return (
    <details className="group mt-4 rounded-lg border border-rule px-5 py-3 xl:hidden">
      <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between text-sm text-ink-2 [&::-webkit-details-marker]:hidden">
        On this page
        <span aria-hidden="true" className="text-ink-3 transition-transform duration-200 group-open:rotate-45">
          +
        </span>
      </summary>
      <nav aria-label="On this page" className="mt-2 -ml-3 pb-1">
        <TocList items={items} />
      </nav>
    </details>
  );
}
