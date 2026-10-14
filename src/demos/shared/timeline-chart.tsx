export interface ChartSegment {
  lane: string;
  kind: string;
  start: number;
  end: number;
}
export interface ChartMarker {
  lane: string;
  kind: string;
  at: number;
}
export interface ChartEvent {
  at: number;
  text: string;
}

export interface KindStyle {
  className: string;
  label: string;
}

/**
 * Lanes of time-bounded segments, revealed up to the playhead `t`. Purely
 * presentational — the demo computes the timeline, this just draws it. The
 * text event log underneath carries the same information for screen readers
 * and for anyone who'd rather read than watch.
 */
export function TimelineChart({
  lanes,
  segments,
  markers,
  duration,
  t,
  styles,
  markerStyles,
  events,
}: {
  lanes: { id: string; label: string }[];
  segments: ChartSegment[];
  markers: ChartMarker[];
  duration: number;
  t: number;
  styles: Record<string, KindStyle>;
  markerStyles: Record<string, KindStyle>;
  events: ChartEvent[];
}) {
  const pct = (x: number) => `${(x / duration) * 100}%`;
  const visible = events.filter((e) => e.at <= t);
  const latest = visible.at(-1);

  return (
    <div>
      <div aria-hidden="true" className="space-y-1.5">
        {lanes.map((lane) => (
          <div key={lane.id} className="grid grid-cols-[6.5rem_1fr] items-center gap-3 sm:grid-cols-[8rem_1fr]">
            <span className="truncate text-xs text-ink-3">{lane.label}</span>
            <div className="relative mx-2 h-7 rounded-md bg-paper">
              {segments
                .filter((s) => s.lane === lane.id && s.start <= t)
                .map((s, i) => (
                  <div
                    key={i}
                    className={`absolute top-1 bottom-1 rounded ${styles[s.kind]?.className ?? "bg-ink-3"}`}
                    style={{ left: pct(s.start), width: pct(Math.min(s.end, t) - s.start) }}
                  />
                ))}
              {markers
                .filter((m) => m.lane === lane.id && m.at <= t)
                .map((m, i) => (
                  <span
                    key={i}
                    className={`num absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded px-1 text-[10px] leading-4 font-semibold ${markerStyles[m.kind]?.className ?? ""}`}
                    style={{ left: pct(m.at) }}
                  >
                    {markerStyles[m.kind]?.label ?? m.kind}
                  </span>
                ))}
            </div>
          </div>
        ))}
        <div className="grid grid-cols-[6.5rem_1fr] gap-3 sm:grid-cols-[8rem_1fr]">
          <span />
          <div className="relative mx-2 h-4">
            <div className="absolute inset-x-0 top-1.5 h-px bg-rule" />
            <div className="absolute top-0 h-4 w-px bg-accent" style={{ left: pct(t) }} />
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-3" aria-hidden="true">
        {Object.entries(styles).map(([kind, s]) => (
          <span key={kind} className="flex items-center gap-1.5">
            <span className={`inline-block h-2.5 w-4 rounded-sm ${s.className}`} />
            {s.label}
          </span>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-rule bg-paper px-3.5 py-3">
        <p className="num text-[10px] tracking-[0.16em] text-ink-3 uppercase">Event log</p>
        <ol
          tabIndex={0}
          aria-label="Event log"
          className="mt-1.5 max-h-28 space-y-0.5 overflow-y-auto font-mono text-xs text-ink-2"
        >
          {visible.length === 0 && <li className="text-ink-3">Press Play or Step to start.</li>}
          {visible.map((e, i) => (
            <li key={i} className={i === visible.length - 1 ? "text-ink" : undefined}>
              <span className="text-ink-3">t={e.at.toFixed(1)}</span> {e.text}
            </li>
          ))}
        </ol>
        <p className="sr-only" aria-live="polite">
          {latest ? latest.text : ""}
        </p>
      </div>
    </div>
  );
}
