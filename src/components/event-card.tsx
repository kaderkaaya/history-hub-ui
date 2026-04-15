"use client";

import { ArrowUpRight, ExternalLink } from "lucide-react";
import { CategoryBadge } from "@/components/category-badge";
import type { HistoryEvent, EventType } from "@/types";

const ACCENT_GRADIENTS = [
  "from-violet-600/30 via-indigo-900/20 to-slate-950/80",
  "from-blue-600/25 via-cyan-900/15 to-slate-950/80",
  "from-rose-600/25 via-pink-900/15 to-slate-950/80",
  "from-amber-600/25 via-orange-900/15 to-slate-950/80",
  "from-emerald-600/25 via-teal-900/15 to-slate-950/80",
  "from-fuchsia-600/25 via-purple-900/15 to-slate-950/80",
];

interface EventCardProps {
  event: HistoryEvent;
  index: number;
  total: number;
  eventType: EventType;
  isVisible: boolean;
}

export function EventCard({ event, index, total, eventType, isVisible }: EventCardProps) {
  const gradient = ACCENT_GRADIENTS[index % ACCENT_GRADIENTS.length];

  return (
    <div className="snap-card relative w-full h-full flex-shrink-0 overflow-hidden">
      {/* Layered background */}
      <div className="absolute inset-0 bg-background" />
      <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,100,255,0.08),transparent_60%)]" />

      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between px-6 sm:px-10 pt-8 sm:pt-12 pb-24 sm:pb-28">
        {/* Top: Category + Counter */}
        <div
          className={`flex items-start justify-between transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <CategoryBadge type={eventType} />
          <span className="text-[11px] font-mono text-white/30 tabular-nums tracking-wider">
            {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
          </span>
        </div>

        {/* Center: Year + Text */}
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xl mx-auto py-6">
          <div
            className={`transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-95"
            }`}
          >
            <span className="text-[11px] uppercase tracking-[0.25em] text-white/30 font-semibold">
              {getCenturyLabel(event.year)}
            </span>
            <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-white/95 leading-none mt-1 mb-6">
              {event.year}
            </h1>
          </div>

          {event.title && (
            <h2
              className={`text-lg sm:text-xl font-bold text-white/90 mb-4 transition-all duration-700 delay-200 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              {event.title}
            </h2>
          )}

          <p
            className={`text-sm sm:text-base leading-relaxed text-white/55 max-w-md transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {event.text}
          </p>
        </div>

        {/* Bottom: Wiki link */}
        <div
          className={`flex items-center justify-center transition-all duration-700 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {event.url ? (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-5 py-2.5 text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Read on Wikipedia
              <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </a>
          ) : (
            <div className="h-10" />
          )}
        </div>
      </div>
    </div>
  );
}

function getCenturyLabel(year: number): string {
  if (year < 0) return `${Math.abs(year)} BC`;
  const century = Math.ceil(year / 100);
  const suffix =
    century === 1 ? "st" : century === 2 ? "nd" : century === 3 ? "rd" : "th";
  return `${century}${suffix} century`;
}
