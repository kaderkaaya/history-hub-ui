import type { EventType, Language } from "@/types";

export const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "events", label: "Events" },
  { value: "births", label: "Births" },
  { value: "deaths", label: "Deaths" },
  { value: "holidays", label: "Holidays" },
  { value: "selected", label: "Featured" },
  { value: "all", label: "All" },
];

export const LANGUAGES: { value: Language; label: string; code: string }[] = [
  { value: "en", label: "English", code: "EN" },
  { value: "tr", label: "Türkçe", code: "TR" },
];
