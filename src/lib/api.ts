import type {
  EventsResponse,
  EventsListParams,
  EventsTodayParams,
} from "@/types";

const API_BASE =
  typeof window !== "undefined"
    ? "/api"
    : "https://history-hub-production.up.railway.app";

export async function fetchTodayEvents(
  params?: EventsTodayParams
): Promise<EventsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set("type", params.type);
  if (params?.language) searchParams.set("language", params.language);

  const qs = searchParams.toString();
  const url = `${API_BASE}/events/today${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export async function fetchEventsByDate(
  params: EventsListParams
): Promise<EventsResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("month", String(params.month));
  searchParams.set("day", String(params.day));
  if (params.type) searchParams.set("type", params.type);
  if (params.language) searchParams.set("language", params.language);

  const url = `${API_BASE}/events/list?${searchParams.toString()}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}
