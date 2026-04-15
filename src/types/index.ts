export interface HistoryEvent {
  year: number;
  text: string;
  title: string;
  url: string;
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
