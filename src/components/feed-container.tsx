"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { EventCard } from "@/components/event-card";
import type { HistoryEvent, EventType } from "@/types";

interface FeedContainerProps {
  events: HistoryEvent[];
  eventType: EventType;
}

export function FeedContainer({ events, eventType }: FeedContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / el.clientHeight);
    setActiveIndex(Math.min(idx, events.length - 1));
  }, [events.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setActiveIndex(0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [events]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = scrollRef.current;
      if (!el) return;
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        const next = Math.min(activeIndex + 1, events.length - 1);
        el.scrollTo({ top: next * el.clientHeight, behavior: "smooth" });
      }
      if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        const prev = Math.max(activeIndex - 1, 0);
        el.scrollTo({ top: prev * el.clientHeight, behavior: "smooth" });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, events.length]);

  return (
    <div className="relative h-full">
      {/* Story progress bars */}
      <div className="absolute top-0 inset-x-0 z-30 flex gap-1 px-3 pt-2">
        {events.length <= 30 &&
          events.map((_, i) => (
            <div key={i} className="flex-1 h-[2px] rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-white/70 transition-all duration-500 ease-out"
                style={{ width: i < activeIndex ? "100%" : i === activeIndex ? "100%" : "0%" }}
              />
            </div>
          ))}
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="snap-feed h-full overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {events.map((event, i) => (
          <div key={`${event.year}-${event.title}-${i}`} className="h-full w-full">
            <EventCard
              event={event}
              index={i}
              total={events.length}
              eventType={eventType}
              isVisible={Math.abs(i - activeIndex) <= 1}
            />
          </div>
        ))}
      </div>

      {/* Floating counter - only for large sets */}
      {events.length > 30 && (
        <div className="absolute top-3 right-4 z-30">
          <span className="text-[11px] font-mono text-white/40 tabular-nums bg-black/30 backdrop-blur-md rounded-full px-3 py-1 border border-white/5">
            {activeIndex + 1} / {events.length}
          </span>
        </div>
      )}

      {/* Scroll hint */}
      {activeIndex === 0 && events.length > 1 && (
        <div className="absolute bottom-6 inset-x-0 flex justify-center z-20 pointer-events-none animate-bounce">
          <div className="flex flex-col items-center gap-1">
            <svg className="w-5 h-5 text-white/25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
            <span className="text-[10px] text-white/20 font-medium">Scroll</span>
          </div>
        </div>
      )}
    </div>
  );
}
