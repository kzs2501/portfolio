"use client";

import { useMemo, useState } from "react";
import { DemoShell, PlayerControls, Segmented } from "../shared/controls";
import { TimelineChart, type ChartEvent } from "../shared/timeline-chart";
import { useTimelinePlayer } from "../shared/use-timeline-player";
import { buildRace, resultsFor } from "./race";

const lanes = [
  { id: "keys", label: "Keystrokes" },
  { id: "debounce", label: "Debounce" },
  { id: "req-BT", label: 'Request "BT"' },
  { id: "req-BTC", label: 'Request "BTC"' },
];

const styles = {
  debounce: { className: "bg-ink-3/40", label: "Debounce timer" },
  cancelled: { className: "bg-ink-3/15", label: "Timer reset by next key" },
  request: { className: "bg-accent/50", label: "Request in flight" },
};
const markerStyles = {
  key: { className: "bg-paper text-ink", label: "⌨" },
  fresh: { className: "bg-paper text-ok", label: "✓" },
  stale: { className: "bg-paper text-accent", label: "stale" },
  dropped: { className: "bg-paper text-ink-3", label: "ignored" },
};

export default function RaceTimelineDemo() {
  const [guard, setGuard] = useState<"off" | "on">("off");
  const race = useMemo(() => buildRace(guard === "on"), [guard]);
  const player = useTimelinePlayer(race.duration, 1.6);
  const { input, screen } = race.screenAt(player.t);

  const events = useMemo<ChartEvent[]>(() => {
    const list: ChartEvent[] = [];
    for (const m of race.markers) {
      if (m.kind === "key") list.push({ at: m.at, text: `keystroke → input shows "${race.screenAt(m.at).input}"` });
    }
    for (const r of race.requests) {
      list.push({ at: r.sentAt, text: `debounce settles → fetch("${r.query}")` });
      const marker = race.markers.find((m) => m.lane === `req-${r.query}`)!;
      const outcome =
        marker.kind === "dropped"
          ? "superseded by a newer query, ignored"
          : marker.kind === "stale"
            ? "arrives late and overwrites newer results"
            : "rendered";
      list.push({ at: r.returnsAt, text: `"${r.query}" responds → ${outcome}` });
    }
    return list.sort((a, b) => a.at - b.at);
  }, [race]);

  const results = screen.kind === "results" ? resultsFor(screen.query) : [];

  return (
    <DemoShell
      title="Debounce vs. the race"
      intro={`Debounce is on the whole time. Type "BT", pause, type "C": the slow "BT" request comes back after the fast "BTC" one. Watch what the user sees with and without a guard.`}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="Stale-response guard"
          value={guard}
          options={[
            { value: "off", label: "No guard" },
            { value: "on", label: "With guard" },
          ]}
          onChange={(g) => {
            setGuard(g);
            player.reset();
          }}
        />
        <PlayerControls
          playing={player.playing}
          done={player.done}
          onPlay={player.play}
          onPause={player.pause}
          onStep={player.step}
          onReset={player.reset}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_15rem]">
        <TimelineChart
          lanes={lanes}
          segments={race.segments}
          markers={race.markers}
          duration={race.duration}
          t={player.t}
          styles={styles}
          markerStyles={markerStyles}
          events={events}
        />

        <div>
          <p className="num mb-2 text-[10px] tracking-[0.16em] text-ink-3 uppercase">What the user sees</p>
          <div className="rounded-lg border border-rule bg-paper p-3">
            <div className="rounded-md border border-rule px-3 py-2 font-mono text-sm">
              {input || <span className="text-ink-3">Search pairs…</span>}
              <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-ink" aria-hidden="true" />
            </div>
            <div className="mt-2 min-h-[7.5rem] text-sm">
              {screen.kind === "idle" && <p className="px-1 py-2 text-ink-3">Nothing yet.</p>}
              {screen.kind === "loading" && <p className="px-1 py-2 text-ink-3">Searching “{screen.query}”…</p>}
              {screen.kind === "results" && (
                <>
                  <ul className="space-y-0.5">
                    {results.map((r) => (
                      <li key={r} className="rounded px-2 py-1 font-mono text-xs">
                        {r}
                      </li>
                    ))}
                  </ul>
                  {screen.stale && (
                    <p role="alert" className="mt-2 rounded bg-accent-soft px-2 py-1.5 text-xs text-ink">
                      Stale: results for “{screen.query}” under a search for “{input}”.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DemoShell>
  );
}
