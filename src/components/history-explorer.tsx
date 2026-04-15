"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  AlertTriangle,
  RotateCcw,
  Calendar as CalendarIcon,
} from "lucide-react";
import { FeedContainer } from "@/components/feed-container";
import { FloatingControls } from "@/components/floating-controls";
import { fetchTodayEvents, fetchEventsByDate } from "@/lib/api";
import type { EventType, Language, EventsResponse } from "@/types";

type ViewMode = "today" | "browse";

export function HistoryExplorer() {
  const [mode, setMode] = useState<ViewMode>("today");
  const [eventType, setEventType] = useState<EventType>("events");
  const [language, setLanguage] = useState<Language>("en");
  const [date, setDate] = useState<Date>(new Date());
  const [data, setData] = useState<EventsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let result: EventsResponse;
      if (mode === "today") {
        result = await fetchTodayEvents({ type: eventType, language });
      } else {
        result = await fetchEventsByDate({
          month: date.getMonth() + 1,
          day: date.getDate(),
          type: eventType,
          language,
        });
      }
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [mode, eventType, language, date]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const events = data?.events ?? [];

  const today = new Date();
  const formattedDate =
    mode === "today"
      ? today.toLocaleDateString("en-US", { month: "long", day: "numeric" })
      : date.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  return (
    <div className="h-full w-full relative overflow-hidden">
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={loadEvents} />
      ) : events.length === 0 ? (
        <EmptyState />
      ) : (
        <FeedContainer events={events} eventType={eventType} />
      )}

      {/* Floating date indicator */}
      {!loading && !error && events.length > 0 && (
        <div className="absolute top-4 inset-x-0 z-30 flex justify-center pointer-events-none">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-black/40 backdrop-blur-xl px-4 py-1.5">
            <CalendarIcon className="w-3 h-3 text-white/40" />
            <span className="text-xs font-semibold text-white/60 tracking-wide">
              {formattedDate}
            </span>
          </div>
        </div>
      )}

      {/* Floating controls */}
      <FloatingControls
        mode={mode}
        onModeChange={setMode}
        eventType={eventType}
        onEventTypeChange={setEventType}
        language={language}
        onLanguageChange={setLanguage}
        date={date}
        onDateChange={setDate}
        formattedDate={formattedDate}
      />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-5">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-3xl scale-[3]" />
        <div className="relative w-16 h-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-white/60 animate-spin" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-white/70">Loading stories</p>
        <p className="text-xs text-white/30">Discovering history...</p>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-5 px-6">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-red-500/15 blur-3xl scale-[3]" />
        <div className="relative w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
      </div>
      <div className="text-center space-y-1.5 max-w-xs">
        <p className="font-semibold text-white/80">Something went wrong</p>
        <p className="text-sm text-white/40 leading-relaxed">{error}</p>
      </div>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-5 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Try Again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 px-6">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
        <CalendarIcon className="w-7 h-7 text-white/30" />
      </div>
      <div className="text-center space-y-1.5">
        <p className="font-semibold text-white/80">No events found</p>
        <p className="text-sm text-white/40">
          Try a different date or category
        </p>
      </div>
    </div>
  );
}
