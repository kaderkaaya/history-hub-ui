export interface EventPage {
  title: string;
  extract?: string;
  image?: string;
  url: string;
}

export interface HistoryEvent {
  year: number;
  text: string;
  pages?: EventPage[];
  /** @deprecated kept for backward compatibility */
  title?: string;
  /** @deprecated kept for backward compatibility */
  url?: string;
}

export interface EventsResponse {
  date: string;
  lang: string;
  type: string;
  cached: boolean;
  events: HistoryEvent[];
}

export type EventType =
  | "events"
  | "births"
  | "deaths"
  | "holidays"
  | "selected"
  | "all";

export type Language = "en" | "tr";

export interface EventsListParams {
  month: number;
  day: number;
  type?: EventType;
  language?: Language;
}

export interface EventsTodayParams {
  type?: EventType;
  language?: Language;
}
