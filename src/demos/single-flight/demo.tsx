"use client";

import { useMemo, useState } from "react";
import { DemoShell, PlayerControls, Segmented } from "../shared/controls";
import { TimelineChart, type ChartEvent } from "../shared/timeline-chart";
import { useTimelinePlayer } from "../shared/use-timeline-player";
import { buildTimeline, type Mode } from "./timeline";

const styles = {
  send: { className: "bg-ink-3/50", label: "Request in flight" },
  wait: { className: "bg-warn/35", label: "Waiting on shared refresh" },
  refresh: { className: "bg-accent/70", label: "Refresh call" },
  "refresh-rejected": { className: "bg-accent/25 ring-1 ring-accent ring-inset", label: "Refresh rejected" },
  retry: { className: "bg-ok/60", label: "Retry with new token" },
};
const markerStyles = {
  "401": { className: "bg-paper text-warn", label: "401" },
  ok: { className: "bg-paper text-ok", label: "200" },
  fail: { className: "bg-paper text-accent", label: "✕" },
};

export default function SingleFlightDemo() {
  const [mode, setMode] = useState<Mode>("single-flight");
  const timeline = useMemo(() => buildTimeline(mode, 5), [mode]);
  const player = useTimelinePlayer(timeline.duration);

  const events = useMemo<ChartEvent[]>(() => {
    const label = (lane: string) => timeline.lanes.find((l) => l.id === lane)?.label ?? lane;
    const list: ChartEvent[] = [];
    for (const s of timeline.segments) {
      if (s.kind === "send") list.push({ at: s.start, text: `${label(s.lane)} sent with the expired token` });
      if (s.kind === "refresh") list.push({ at: s.start, text: `${label(s.lane)} → POST /token/refresh` });
      if (s.kind === "refresh-rejected")
        list.push({ at: s.start, text: `${label(s.lane)} → POST /token/refresh (replays a spent token)` });
      if (s.kind === "wait") list.push({ at: s.start, text: `${label(s.lane)} awaits the refresh already in flight` });
      if (s.kind === "retry") list.push({ at: s.start, text: `${label(s.lane)} retries with the new token` });
    }
    for (const m of timeline.markers) {
      if (m.kind === "401") list.push({ at: m.at, text: `${label(m.lane)} ← 401 Unauthorized` });
      if (m.kind === "ok") list.push({ at: m.at, text: `${label(m.lane)} ← 200 OK` });
      if (m.kind === "fail") list.push({ at: m.at, text: `${label(m.lane)} ← refresh rejected: token reuse detected` });
    }
    return list.sort((a, b) => a.at - b.at);
  }, [timeline]);

  const { summary } = timeline;

  return (
    <DemoShell
      title="Single-flight token refresh"
      intro="Five requests leave with an expired access token and all come back 401. Compare starting a refresh for each one against sharing a single in-flight refresh."
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Segmented<Mode>
          label="Refresh strategy"
          value={mode}
          options={[
            { value: "naive", label: "Naive" },
            { value: "single-flight", label: "Single-flight" },
          ]}
          onChange={(m) => {
            setMode(m);
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

      <TimelineChart
        lanes={timeline.lanes}
        segments={timeline.segments}
        markers={timeline.markers}
        duration={timeline.duration}
        t={player.t}
        styles={styles}
        markerStyles={markerStyles}
        events={events}
      />

      <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
        {[
          ["Refresh calls", summary.refreshCalls],
          ["Succeeded", `${summary.succeeded} / 5`],
          ["Outcome", summary.sessionRevoked ? "Logged out" : "All good"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg border border-rule bg-paper px-3 py-2.5">
            <dt className="text-xs text-ink-3">{k}</dt>
            <dd
              className={`num mt-0.5 text-lg ${player.done ? (summary.sessionRevoked && k !== "Refresh calls" ? "text-accent" : "text-ink") : "text-ink-3"}`}
            >
              {player.done ? v : "—"}
            </dd>
          </div>
        ))}
      </dl>
    </DemoShell>
  );
}
