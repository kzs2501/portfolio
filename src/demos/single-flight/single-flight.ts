/**
 * Five requests leave with an expired access token. Each comes back 401 and
 * needs a fresh token before it can retry. The question is how many times we
 * call the refresh endpoint.
 *
 * - naive: every 401 starts its own refresh. With refresh-token rotation (each
 *   refresh token is single-use), the second refresh presents a token that was
 *   already spent — which is exactly what token theft looks like, so the server
 *   revokes the session and the user is logged out.
 * - single-flight: the first 401 starts the refresh and stores its promise;
 *   every later 401 awaits that same promise, then retries. One refresh, total.
 */
export type Mode = "naive" | "single-flight";

export type SegmentKind = "send" | "wait" | "refresh" | "refresh-rejected" | "retry";
export type MarkerKind = "401" | "ok" | "fail";

export interface Segment {
  lane: string;
  kind: SegmentKind;
  start: number;
  end: number;
}
export interface Marker {
  lane: string;
  kind: MarkerKind;
  at: number;
}

export interface Timeline {
  lanes: { id: string; label: string }[];
  segments: Segment[];
  markers: Marker[];
  duration: number;
  summary: { refreshCalls: number; succeeded: number; failed: number; isSessionRevoked: boolean };
}

const STAGGER = 0.5;
const NETWORK = 1.5;
const REFRESH = 3;
const RETRY = 1.5;

export function buildTimeline(mode: Mode, count = 5): Timeline {
  const segments: Segment[] = [];
  const markers: Marker[] = [];
  const lanes = [
    ...(mode === "single-flight" ? [{ id: "shared", label: "Shared refresh" }] : []),
    ...Array.from({ length: count }, (_, i) => ({ id: `req-${i}`, label: `Request ${i + 1}` })),
  ];

  let refreshCalls = 0;
  let succeeded = 0;
  let failed = 0;

  // The single in-flight refresh, if any: [start, end].
  let shared: { start: number; end: number } | null = null;

  for (let i = 0; i < count; i++) {
    const lane = `req-${i}`;
    const sentAt = i * STAGGER;
    const unauthorizedAt = sentAt + NETWORK;
    segments.push({ lane, kind: "send", start: sentAt, end: unauthorizedAt });
    markers.push({ lane, kind: "401", at: unauthorizedAt });

    if (mode === "single-flight") {
      if (!shared) {
        refreshCalls++;
        shared = { start: unauthorizedAt, end: unauthorizedAt + REFRESH };
        segments.push({ lane: "shared", kind: "refresh", start: shared.start, end: shared.end });
      }
      // Everyone (including the first) waits on the same promise, then retries.
      const retryAt = Math.max(unauthorizedAt, shared.end);
      if (retryAt > unauthorizedAt) segments.push({ lane, kind: "wait", start: unauthorizedAt, end: retryAt });
      segments.push({ lane, kind: "retry", start: retryAt, end: retryAt + RETRY });
      markers.push({ lane, kind: "ok", at: retryAt + RETRY });
      succeeded++;
    } else {
      refreshCalls++;
      const refreshEnd = unauthorizedAt + REFRESH;
      if (i === 0) {
        // The first refresh spends the refresh token and gets a new pair.
        segments.push({ lane, kind: "refresh", start: unauthorizedAt, end: refreshEnd });
        segments.push({ lane, kind: "retry", start: refreshEnd, end: refreshEnd + RETRY });
        markers.push({ lane, kind: "ok", at: refreshEnd + RETRY });
        succeeded++;
      } else {
        // Every later refresh replays the already-spent token → rejected.
        segments.push({ lane, kind: "refresh-rejected", start: unauthorizedAt, end: refreshEnd });
        markers.push({ lane, kind: "fail", at: refreshEnd });
        failed++;
      }
    }
  }

  const ends = [...segments.map((s) => s.end), ...markers.map((m) => m.at)];
  return {
    lanes,
    segments,
    markers,
    duration: Math.ceil(Math.max(...ends) + 0.5),
    summary: { refreshCalls, succeeded, failed, isSessionRevoked: mode === "naive" && failed > 0 },
  };
}
