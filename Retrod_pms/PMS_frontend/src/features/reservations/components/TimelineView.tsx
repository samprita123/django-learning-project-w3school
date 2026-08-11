import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardHeader, Button } from "@/components/ui/Primitives";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, Maximize2, Minimize2 } from "lucide-react";

interface Bar {
  id: string;
  room: string;
  start: number;
  span: number;
  label: string;
  source: string;
}

interface Room {
  num: string;
  type: string;
}

interface TimelineViewProps {
  days: string[];
  rooms: Room[];
  bars: Bar[];
  sourceColor: Record<string, string>;
  todayIndex?: number; // 0-based index of today within days; -1 if not visible
  onBarClick?: (bar: Bar) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  handlePrevMonth?: () => void;
  handleNextMonth?: () => void;
  timelineStartDate?: string;
}

export function TimelineView({ 
  days, 
  rooms, 
  bars, 
  sourceColor, 
  todayIndex = -1, 
  onBarClick,
  isFullscreen = false,
  onToggleFullscreen,
  handlePrevMonth,
  handleNextMonth,
  timelineStartDate
}: TimelineViewProps) {
  const [collapsedTypes, setCollapsedTypes] = useState<Record<string, boolean>>({});
  const [showLegend, setShowLegend] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      const container = scrollContainerRef.current;
      if (container && todayIndex >= 0) {
        const columnOffset = 200 + todayIndex * 60 + 30;
        const scrollTarget = columnOffset - container.clientWidth / 2;
        container.scrollLeft = scrollTarget;
      }
    }, 100);
  }, [todayIndex]);

  const groupedRooms = useMemo(() => {
    const groups: Record<string, Room[]> = {};
    rooms.forEach((r) => {
      if (!groups[r.type]) {
        groups[r.type] = [];
      }
      groups[r.type].push(r);
    });
    return groups;
  }, [rooms]);

  const toggleType = (type: string) => {
    setCollapsedTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  // A bar is "past" if its entire span is before today's index
  const isBarPast = (b: Bar) => {
    if (todayIndex < 0) return false;
    return b.start + b.span <= todayIndex;
  };

  return (
    <Card className={isFullscreen ? "border-0 shadow-none rounded-none w-full h-full min-h-screen" : ""}>
      <CardHeader 
        title={`${days.length}-day timeline`} 
        hint={`${days[0]} → ${days[days.length - 1]} 2026`} 
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={onToggleFullscreen}
              className="h-8 w-8 p-0 flex items-center justify-center cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        }
      />
      <div className="p-3 sm:p-4">
        <div className="space-y-2 md:hidden">
          {rooms.map((r) => {
            const rowBars = bars.filter((b) => b.room === r.num);
            return (
              <div key={r.num} className="rounded-md border border-border-subtle bg-surface p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-medium text-text-primary">Room {r.num}</div>
                    <div className="text-[11px] text-text-secondary">{r.type}</div>
                  </div>
                  <span className="text-[10px] text-text-secondary">{rowBars.length} stay(s)</span>
                </div>
                <div className="space-y-1.5">
                  {rowBars.length ? (
                    rowBars.map((b, i) => (
                      <Link
                        key={`${r.num}-${i}`}
                        to={"/reservations/" + (b.reservationId || b.id)}
                        className="block rounded px-2 py-1.5 text-[11px] font-medium text-white transition-opacity hover:opacity-90"
                        style={{
                          background: sourceColor[b.source],
                          opacity: isBarPast(b) ? 0.45 : 1,
                          filter: isBarPast(b) ? "grayscale(60%)" : "none",
                        }}
                      >
                        <div className="truncate">{b.label}</div>
                        <div className="text-[10px] opacity-80">
                          {days[Math.max(0, b.start)]} to {days[Math.min(days.length - 1, b.start + b.span - 1)]}{" "}
                          · {b.source}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-[11px] text-text-disabled">
                      No reservations in this range
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div ref={scrollContainerRef} className="table-scroll-shadow hidden overflow-x-auto md:block w-full max-w-full pb-3">
          <div className="relative" style={{ minWidth: `${200 + (days.length * 60)}px` }}>
            {/* Dynamic Time Tracker vertical indicator */}
            {todayIndex >= 0 && (
              <div
                className="absolute z-[1] top-0 bottom-0 w-[1.5px] bg-primary pointer-events-none"
                style={{
                  left: `calc(200px + (100% - 200px) * (${todayIndex + (new Date().getHours() * 60 + new Date().getMinutes()) / 1440} / ${days.length}))`
                }}
              >
                <div className="absolute top-0 -left-1 w-2.5 h-2.5 rounded-full bg-primary" />
              </div>
            )}
            {/* Header row */}
            <div
              className="grid border-b border-border-subtle bg-surface-2/50"
              style={{ gridTemplateColumns: `200px repeat(${days.length}, 1fr)` }}
            >
              <div className="label-uppercase px-4 py-2.5">Room</div>
              {days.map((d, i) => {
                const isToday = i === todayIndex;
                const isPast = todayIndex >= 0 && i < todayIndex;
                return (
                  <div
                    key={d}
                    title={isToday ? "Today" : undefined}
                    className={`border-l px-3 py-2.5 text-center relative ${
                      isToday
                        ? "border-l border-border-subtle bg-primary/10"
                        : isPast
                          ? "border-l border-border-subtle"
                          : "border-l border-border-subtle"
                    }`}
                  >
                    <div
                      className={`text-[10px] uppercase tracking-wider ${
                        isToday ? "text-primary font-bold" : isPast ? "text-text-disabled" : "text-text-disabled"
                      }`}
                    >
                      {d.split(" ")[1]}
                    </div>
                    <div
                      className={`text-[12px] font-semibold ${
                        isToday
                          ? "text-primary"
                          : isPast
                            ? "text-text-disabled"
                            : "text-text-primary"
                      }`}
                    >
                      {isToday ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-[11px] font-bold">
                          {d.split(" ")[0]}
                        </span>
                      ) : (
                        d.split(" ")[0]
                      )}
                    </div>
                    {rooms && rooms.length > 0 && (
                      <div className="mt-1 text-[10px] font-semibold text-text-secondary">
                        {Math.round((bars.filter(b => i >= b.start && i < b.start + b.span).length / rooms.length) * 100)}%
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {Object.entries(groupedRooms).map(([roomType, groupRooms]) => {
              const isCollapsed = !!collapsedTypes[roomType];
              return (
                <div key={roomType}>
                  {/* Room Type Header Row */}
                  <div
                    className="grid border-b border-border-subtle bg-surface-2/80 font-medium text-text-primary text-[12px] cursor-pointer hover:bg-surface-2 transition-colors select-none items-center"
                    style={{ gridTemplateColumns: `200px repeat(${days.length}, 1fr)` }}
                    onClick={() => toggleType(roomType)}
                  >
                    <div className="px-4 py-2 flex items-center gap-2">
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4 text-text-secondary" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-text-secondary" />
                      )}
                      <span>{roomType}</span>
                    </div>

                    {days.map((_, dayIndex) => {
                      const isToday = dayIndex === todayIndex;
                      const isPast = todayIndex >= 0 && dayIndex < todayIndex;
                      // Calculate available rooms for this type on this day
                      const total = groupRooms.length;
                      const booked = bars.filter((b) => {
                        const isRoomOfThisType = groupRooms.some((gr) => gr.num === b.room);
                        if (!isRoomOfThisType) return false;
                        // check if dayIndex is within [b.start, b.start + b.span - 1]
                        return dayIndex >= b.start && dayIndex < b.start + b.span;
                      }).length;
                      const available = Math.max(0, total - booked);

                      return (
                        <div
                          key={dayIndex}
                          className={`border-l border-border-subtle px-1 py-2 text-center flex items-center justify-center h-full ${
                            isToday ? "bg-primary/8" : isPast ? "bg-surface-2/30" : ""
                          }`}
                        >
                          <span
                            className={`relative z-10 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${
                              isPast
                                ? "bg-border-subtle text-text-disabled"
                                : available > 0
                                  ? "bg-success-subtle text-success"
                                  : "bg-error-subtle text-error"
                            }`}
                          >
                            {available}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Individual Rooms (Rendered only if not collapsed) */}
                  {!isCollapsed &&
                    groupRooms.map((r) => {
                      const rowBars = bars.filter((b) => b.room === r.num);
                      return (
                        <div
                          key={r.num}
                          className="relative grid border-b border-border-subtle hover:bg-surface-2/40"
                          style={{ gridTemplateColumns: `200px repeat(${days.length}, 1fr)` }}
                        >
                          <div className="px-4 py-3 bg-surface border-r border-border-subtle">
                            <div className="text-[13px] font-semibold text-text-primary">Room {r.num}</div>
                            <div className="text-[11px] text-text-secondary opacity-80">{r.type}</div>
                          </div>
                          {days.map((_, i) => {
                            const isToday = i === todayIndex;
                            const isPast = todayIndex >= 0 && i < todayIndex;
                            return (
                              <div
                                key={i}
                                className={`border-l border-border-subtle ${
                                  isToday
                                    ? "bg-primary/5"
                                    : isPast
                                      ? "bg-surface/40"
                                      : ""
                                }`}
                              />
                            );
                          })}
                          {rowBars.map((b, i) => {
                            const visualStart = Math.max(0, b.start);
                            const visualSpan = Math.max(0.5, b.span + Math.min(0, b.start));
                            const past = isBarPast(b);
                            const barStyle = {
                              left: `calc(200px + (100% - 200px) * ${visualStart / days.length} + 4px)`,
                              width: `calc((100% - 200px) * ${visualSpan / days.length} - 8px)`,
                              background: past
                                ? "var(--color-border)"
                                : sourceColor[b.source] || "var(--color-primary)",
                              opacity: past ? 0.6 : 1,
                              filter: past ? "grayscale(70%)" : "none",
                              color: past ? "var(--color-text-disabled)" : "white",
                            };

                            if (!b.reservationId) {
                              return (
                                <button
                                  key={i}
                                  onClick={() => onBarClick?.(b)}
                                  className="absolute z-10 top-1/2 flex h-8 -translate-y-1/2 items-center gap-2 truncate rounded-md px-2 text-[11px] text-white shadow-sm transition-all hover:opacity-90 text-left"
                                  style={barStyle}
                                >
                                  <span className="font-semibold truncate">{b.label}</span>
                                  <span className="opacity-75 truncate">{b.source}</span>
                                </button>
                              );
                            }

                            return (
                              <Link
                                key={i}
                                to={"/reservations/" + b.reservationId}
                                className="absolute z-10 top-1/2 flex h-8 -translate-y-1/2 items-center gap-2 truncate rounded-md px-2 text-[11px] text-white shadow-sm transition-all hover:opacity-90"
                                style={barStyle}
                              >
                                <span className="font-semibold truncate">{b.label}</span>
                                <span className="opacity-75 truncate">{b.source}</span>
                              </Link>
                            );
                          })}
                        </div>
                      );
                    })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
export default TimelineView;
