"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Sparkles,
  Calendar as CalendarIcon,
  ChevronUp,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { EVENT_TYPES, LANGUAGES } from "@/lib/constants";
import type { EventType, Language } from "@/types";

type ViewMode = "today" | "browse";

interface FloatingControlsProps {
  mode: ViewMode;
  onModeChange: (m: ViewMode) => void;
  eventType: EventType;
  onEventTypeChange: (t: EventType) => void;
  language: Language;
  onLanguageChange: (l: Language) => void;
  date: Date;
  onDateChange: (d: Date) => void;
  formattedDate: string;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function getCalendarDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  let startDay = first.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const days: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function FloatingControls({
  mode,
  onModeChange,
  eventType,
  onEventTypeChange,
  language,
  onLanguageChange,
  date,
  onDateChange,
  formattedDate,
}: FloatingControlsProps) {
  const [expanded, setExpanded] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewMonth, setViewMonth] = useState(date.getMonth());
  const [viewYear, setViewYear] = useState(date.getFullYear());
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setViewMonth(date.getMonth());
    setViewYear(date.getFullYear());
  }, [date]);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setExpanded(false);
        setShowCalendar(false);
      }
    }
    if (expanded) {
      document.addEventListener("mousedown", close);
      return () => document.removeEventListener("mousedown", close);
    }
  }, [expanded]);

  const activeType = EVENT_TYPES.find((t) => t.value === eventType);
  const activeLang = LANGUAGES.find((l) => l.value === language);
  const today = useMemo(() => new Date(), []);
  const calendarDays = useMemo(() => getCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);

  function shiftDate(days: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    onDateChange(next);
  }

  function shiftMonth(dir: number) {
    let m = viewMonth + dir;
    let y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setViewMonth(m);
    setViewYear(y);
  }

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="absolute bottom-5 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-sm" ref={panelRef}>

        {/* Collapsed pill */}
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="mx-auto flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-2xl px-5 py-3 shadow-lg shadow-black/20 transition-all duration-300 hover:bg-white/[0.07] hover:shadow-xl active:scale-[0.98]"
          >
            <span className="text-[13px] font-medium text-white/70">
              {formattedDate}
            </span>
            <div className="h-3.5 w-px bg-white/[0.08]" />
            <span className="text-[13px] font-medium text-white/40">
              {activeType?.label}
            </span>
            <div className="h-3.5 w-px bg-white/[0.08]" />
            <span className="text-[13px] font-semibold text-white/50">
              {activeLang?.code}
            </span>
            <SlidersHorizontal className="w-3.5 h-3.5 text-white/25 ml-1" />
          </button>
        )}

        {/* Expanded panel */}
        {expanded && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/30 animate-in fade-in slide-in-from-bottom-3 duration-250">

            {/* Row 1: Mode + Language */}
            <div className="flex items-center gap-2 px-4 pt-4 pb-3">
              <div className="inline-flex rounded-lg bg-white/[0.04] p-[3px]">
                <button
                  onClick={() => { onModeChange("today"); setShowCalendar(false); }}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-[6px] text-[12px] font-semibold tracking-wide transition-all duration-200 ${
                    mode === "today"
                      ? "bg-white/[0.12] text-white shadow-sm"
                      : "text-white/35 hover:text-white/60"
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  Today
                </button>
                <button
                  onClick={() => onModeChange("browse")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-[6px] text-[12px] font-semibold tracking-wide transition-all duration-200 ${
                    mode === "browse"
                      ? "bg-white/[0.12] text-white shadow-sm"
                      : "text-white/35 hover:text-white/60"
                  }`}
                >
                  <CalendarIcon className="w-3 h-3" />
                  Browse
                </button>
              </div>

              <div className="ml-auto inline-flex rounded-lg bg-white/[0.04] p-[3px]">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => onLanguageChange(lang.value)}
                    className={`rounded-md px-3 py-[6px] text-[12px] font-semibold tracking-wider transition-all duration-200 ${
                      language === lang.value
                        ? "bg-white/[0.12] text-white"
                        : "text-white/30 hover:text-white/55"
                    }`}
                  >
                    {lang.code}
                  </button>
                ))}
              </div>
            </div>

            {/* Browse mode: date selector */}
            {mode === "browse" && (
              <>
                <div className="mx-4 h-px bg-white/[0.04]" />

                {/* Quick date bar */}
                <div className="flex items-center gap-2 px-4 py-3">
                  <button
                    onClick={() => shiftDate(-1)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold transition-all duration-200 ${
                      showCalendar
                        ? "bg-white/[0.10] text-white"
                        : "bg-white/[0.04] text-white/60 hover:bg-white/[0.07] hover:text-white/80"
                    }`}
                  >
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {date.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "long",
                      day: "numeric",
                    })}
                  </button>

                  <button
                    onClick={() => shiftDate(1)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Custom inline calendar */}
                {showCalendar && (
                  <div className="px-4 pb-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="rounded-xl bg-white/[0.03] p-3">
                      {/* Month nav */}
                      <div className="flex items-center justify-between mb-3">
                        <button
                          onClick={() => shiftMonth(-1)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[13px] font-semibold text-white/70">
                          {monthLabel}
                        </span>
                        <button
                          onClick={() => shiftMonth(1)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Weekday headers */}
                      <div className="grid grid-cols-7 mb-1">
                        {WEEKDAYS.map((wd) => (
                          <div
                            key={wd}
                            className="text-center text-[11px] font-medium text-white/25 py-1"
                          >
                            {wd}
                          </div>
                        ))}
                      </div>

                      {/* Day grid */}
                      <div className="grid grid-cols-7">
                        {calendarDays.map((day, i) => {
                          if (!day) {
                            return <div key={`empty-${i}`} className="aspect-square" />;
                          }
                          const isSelected = isSameDay(day, date);
                          const isToday = isSameDay(day, today);

                          return (
                            <button
                              key={day.toISOString()}
                              onClick={() => {
                                onDateChange(day);
                                setShowCalendar(false);
                              }}
                              className={`aspect-square flex items-center justify-center rounded-lg text-[12px] font-medium transition-all duration-150 ${
                                isSelected
                                  ? "bg-white text-black font-bold"
                                  : isToday
                                    ? "text-white/90 bg-white/[0.08]"
                                    : "text-white/45 hover:text-white/80 hover:bg-white/[0.06]"
                              }`}
                            >
                              {day.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Separator */}
            <div className="mx-4 h-px bg-white/[0.04]" />

            {/* Event type chips */}
            <div className="flex items-center gap-1.5 px-4 py-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {EVENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => onEventTypeChange(type.value)}
                  className={`flex-shrink-0 rounded-lg px-3.5 py-[7px] text-[12px] font-semibold tracking-wide transition-all duration-200 ${
                    eventType === type.value
                      ? "bg-white text-black"
                      : "text-white/35 hover:text-white/65 hover:bg-white/[0.05]"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Collapse handle */}
            <button
              onClick={() => { setExpanded(false); setShowCalendar(false); }}
              className="w-full flex justify-center py-2 border-t border-white/[0.03] hover:bg-white/[0.03] transition-colors"
            >
              <ChevronUp className="w-4 h-4 text-white/20" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
