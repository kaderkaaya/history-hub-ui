"use client";

import type { EventType } from "@/types";

const CATEGORY_STYLES: Record<EventType, { bg: string; text: string; label: string }> = {
  events: { bg: "bg-violet-500/15 border-violet-500/25", text: "text-violet-300", label: "Historic Event" },
  births: { bg: "bg-emerald-500/15 border-emerald-500/25", text: "text-emerald-300", label: "Birth" },
  deaths: { bg: "bg-rose-500/15 border-rose-500/25", text: "text-rose-300", label: "Death" },
  holidays: { bg: "bg-amber-500/15 border-amber-500/25", text: "text-amber-300", label: "Holiday" },
  selected: { bg: "bg-cyan-500/15 border-cyan-500/25", text: "text-cyan-300", label: "Featured" },
  all: { bg: "bg-white/10 border-white/20", text: "text-white/80", label: "All" },
};

interface CategoryBadgeProps {
  type: EventType;
}

export function CategoryBadge({ type }: CategoryBadgeProps) {
  const style = CATEGORY_STYLES[type];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide uppercase backdrop-blur-md ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  );
}
