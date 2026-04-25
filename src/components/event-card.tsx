"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { CategoryBadge } from "@/components/category-badge";
import type { EventPage, EventType, HistoryEvent } from "@/types";

const ACCENT_GRADIENTS = [
  "from-violet-600/30 via-indigo-900/20 to-slate-950/80",
  "from-blue-600/25 via-cyan-900/15 to-slate-950/80",
  "from-rose-600/25 via-pink-900/15 to-slate-950/80",
  "from-amber-600/25 via-orange-900/15 to-slate-950/80",
  "from-emerald-600/25 via-teal-900/15 to-slate-950/80",
  "from-fuchsia-600/25 via-purple-900/15 to-slate-950/80",
];

const SWIPE_DISTANCE_THRESHOLD = 0.18;
const SWIPE_VELOCITY_THRESHOLD = 0.45;
const DIRECTION_LOCK_THRESHOLD = 8;

interface EventCardProps {
  event: HistoryEvent;
  index: number;
  total: number;
  eventType: EventType;
  isVisible: boolean;
}

export function EventCard({
  event,
  index,
  total,
  eventType,
  isVisible,
}: EventCardProps) {
  const gradient = ACCENT_GRADIENTS[index % ACCENT_GRADIENTS.length];
  const pages = event.pages ?? [];
  const totalPages = 1 + pages.length;

  const containerRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const dragDir = useRef<"h" | "v" | null>(null);
  const dragXRef = useRef(0);
  const activePageRef = useRef(0);

  useEffect(() => {
    activePageRef.current = activePage;
  }, [activePage]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActivePage(0);
    activePageRef.current = 0;
    dragXRef.current = 0;
    setDragX(0);
  }, [event]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || totalPages <= 1) return;

    const isInteractiveTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false;
      return Boolean(target.closest("a, button"));
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (isInteractiveTarget(e.target)) return;

      dragStart.current = { x: e.clientX, y: e.clientY, time: Date.now() };
      dragDir.current = null;
      dragXRef.current = 0;
      setIsDragging(true);

      if (e.pointerType === "mouse") {
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          // setPointerCapture may fail in rare cases; safe to ignore
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragStart.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      if (!dragDir.current) {
        if (
          Math.abs(dx) > DIRECTION_LOCK_THRESHOLD &&
          Math.abs(dx) > Math.abs(dy)
        ) {
          dragDir.current = "h";
        } else if (Math.abs(dy) > DIRECTION_LOCK_THRESHOLD) {
          dragDir.current = "v";
          if (e.pointerType === "mouse") {
            dragStart.current = null;
            dragXRef.current = 0;
            setDragX(0);
            setIsDragging(false);
          }
        }
      }

      if (dragDir.current === "h") {
        if (e.pointerType === "mouse" && e.cancelable) {
          e.preventDefault();
        }
        const page = activePageRef.current;
        let clamped = dx;
        if (page === 0 && dx > 0) clamped = dx * 0.35;
        if (page === totalPages - 1 && dx < 0) clamped = dx * 0.35;
        dragXRef.current = clamped;
        setDragX(clamped);
      }
    };

    const onPointerEnd = (e: PointerEvent) => {
      const start = dragStart.current;
      const dx = dragXRef.current;
      const dir = dragDir.current;

      dragStart.current = null;
      dragDir.current = null;

      if (el.hasPointerCapture?.(e.pointerId)) {
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {
          // releasePointerCapture may fail; safe to ignore
        }
      }

      if (!start) {
        setIsDragging(false);
        return;
      }

      if (dir === "h") {
        const width = el.clientWidth || 1;
        const elapsed = Math.max(Date.now() - start.time, 1);
        const velocity = Math.abs(dx) / elapsed;
        const passDistance = Math.abs(dx) > width * SWIPE_DISTANCE_THRESHOLD;
        const passVelocity =
          velocity > SWIPE_VELOCITY_THRESHOLD && Math.abs(dx) > 12;

        if (passDistance || passVelocity) {
          setActivePage((p) => {
            if (dx < 0) return Math.min(p + 1, totalPages - 1);
            if (dx > 0) return Math.max(p - 1, 0);
            return p;
          });
        }
      }

      dragXRef.current = 0;
      setDragX(0);
      setIsDragging(false);
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerEnd);
    el.addEventListener("pointercancel", onPointerEnd);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerEnd);
      el.removeEventListener("pointercancel", onPointerEnd);
    };
  }, [totalPages]);

  const goToPage = useCallback(
    (i: number) => {
      setActivePage(Math.min(Math.max(i, 0), totalPages - 1));
    },
    [totalPages]
  );

  const trackTransform = `translate3d(calc(${-activePage * 100}% + ${dragX}px), 0, 0)`;

  return (
    <div
      ref={containerRef}
      className="snap-card relative w-full h-full flex-shrink-0 overflow-hidden select-none"
      style={{
        touchAction: "pan-y",
        cursor:
          totalPages > 1 ? (isDragging ? "grabbing" : "grab") : undefined,
      }}
    >
      <div className="absolute inset-0 bg-background" />
      <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,100,255,0.08),transparent_60%)]" />

      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Sticky header */}
      <div
        className={`absolute top-0 inset-x-0 z-30 px-6 sm:px-10 pt-8 sm:pt-12 pointer-events-none transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <div className="flex items-start justify-between pointer-events-auto">
          <CategoryBadge type={eventType} />
          <span className="text-[11px] font-mono text-white/30 tabular-nums tracking-wider">
            {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Pager track */}
      <div className="relative h-full w-full overflow-hidden">
        <div
          className="flex h-full w-full will-change-transform"
          style={{
            transform: trackTransform,
            transition: isDragging
              ? "none"
              : "transform 380ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <OverviewPage
            event={event}
            isVisible={isVisible && activePage === 0}
          />
          {pages.map((page, i) => (
            <WikiPage
              key={`${page.title}-${i}`}
              page={page}
              isVisible={isVisible && activePage === i + 1}
            />
          ))}
        </div>
      </div>

      {/* Page indicator */}
      {totalPages > 1 && (
        <div className="absolute bottom-6 sm:bottom-8 inset-x-0 z-30 flex justify-center items-center gap-1.5 px-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              aria-label={`Page ${i + 1} of ${totalPages}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === activePage
                  ? "w-7 bg-white/85"
                  : "w-1.5 bg-white/25 hover:bg-white/45"
              }`}
            />
          ))}
        </div>
      )}

      {/* Swipe hint */}
      {totalPages > 1 && activePage === 0 && !isDragging && (
        <SwipeHint />
      )}
    </div>
  );
}

function SwipeHint() {
  return (
    <div className="absolute bottom-16 sm:bottom-20 inset-x-0 z-30 flex justify-center pointer-events-none">
      <div className="swipe-hint inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-md px-3.5 py-1.5 shadow-lg shadow-black/20">
        <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-white/85">
          Swipe
        </span>
        <span className="swipe-hint-arrows flex items-center -space-x-1">
          <svg
            className="w-3.5 h-3.5 text-white/55"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
          <svg
            className="w-3.5 h-3.5 text-white/95"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </span>
      </div>
    </div>
  );
}

function OverviewPage({
  event,
  isVisible,
}: {
  event: HistoryEvent;
  isVisible: boolean;
}) {
  return (
    <div className="relative w-full h-full flex-shrink-0">
      <div className="h-full flex flex-col items-center justify-center text-center px-6 sm:px-10 pt-24 pb-24 sm:pt-28 sm:pb-28">
        <div
          className={`transition-all duration-700 delay-100 ${
            isVisible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-6 scale-95"
          }`}
        >
          <span className="text-[11px] uppercase tracking-[0.25em] text-white/30 font-semibold">
            {getCenturyLabel(event.year)}
          </span>
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-white/95 leading-none mt-1 mb-6">
            {event.year}
          </h1>
        </div>

        <p
          className={`w-full max-w-md text-center text-base sm:text-lg leading-relaxed text-white/70 transition-all duration-700 delay-200 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          {event.text}
        </p>
      </div>
    </div>
  );
}

function WikiPage({
  page,
  isVisible,
}: {
  page: EventPage;
  isVisible: boolean;
}) {
  return (
    <div className="relative w-full h-full flex-shrink-0">
      <div className="h-full flex flex-col items-center px-6 sm:px-10 pt-24 pb-24 sm:pt-28 sm:pb-28">
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col items-center min-h-0">
          {page.image && (
            <div
              className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border border-white/10 shadow-2xl shadow-black/40 mb-5 transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-4 scale-90"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={page.image}
                alt={page.title}
                loading="lazy"
                draggable={false}
                className="w-full h-full object-cover select-none"
              />
            </div>
          )}

          <h2
            className={`w-full text-center text-xl sm:text-2xl font-bold text-white/95 mb-3 leading-tight transition-all duration-700 delay-75 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            {page.title}
          </h2>

          {page.extract ? (
            <div
              className={`w-full flex-1 min-h-0 overflow-y-auto thin-scrollbar transition-all duration-700 delay-150 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <p className="text-center text-sm sm:text-[15px] leading-relaxed text-white/65 px-1">
                {page.extract}
              </p>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          <a
            href={page.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-5 py-2.5 text-xs font-medium text-white/65 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Read on Wikipedia
            <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </a>
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
