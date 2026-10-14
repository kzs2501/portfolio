/**
 * The shape every timeline demo draws: bars on lanes, and point-in-time markers. Each
 * demo narrows `kind` to its own vocabulary; the chart only needs a string.
 */
export interface TimelineSegment<Kind extends string = string> {
  lane: string;
  kind: Kind;
  start: number;
  end: number;
}

export interface TimelineMarker<Kind extends string = string> {
  lane: string;
  kind: Kind;
  at: number;
}
