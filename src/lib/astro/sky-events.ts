export interface RetrogradePeriod {
  /** UTC instants of the two stations. */
  start: string;
  end: string;
  startLon: number;
  endLon: number;
}

export interface Lunation {
  type: "new" | "full";
  at: string;
  lon: number;
}
