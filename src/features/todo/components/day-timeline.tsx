import { useMemo, useState, useEffect } from "react";
import { getTodayIso, parseIsoDate } from "../../../utils/date";
import { cn } from "../../../utils/cn";
import { format, isSameDay, startOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarClock } from "lucide-react";
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  HOUR_HEIGHT_PX,
  formatHourLabel,
} from "../../../utils/time";
import { STATUS_CHIP_CLASS } from "../constants/kanban-columns";
import type { Task } from "../types/task";
import { buildDayEvents } from "../utils/build-day-events";
import { layoutTimelineEvents } from "../utils/timeline-layout";
import TimelineEvent from "./timeline-event";

interface DayTimelineProps {
  tasks: Task[];
  selectedDate: string;
  onEditTask: (task: Task) => void;
}

function isTodayIso(iso: string): boolean {
  return iso === getTodayIso();
}

export default function DayTimeline({
  tasks,
  selectedDate,
  onEditTask,
}: DayTimelineProps) {
  // Lịch ngày cố định hôm nay: luôn lấy today iso.
  const todayIso = getTodayIso();
  const effectiveIso = isTodayIso(selectedDate) ? selectedDate : todayIso;

  const dayEvents = useMemo(
    () => buildDayEvents(tasks, effectiveIso),
    [tasks, effectiveIso],
  );

  const laidOut = useMemo(
    () => layoutTimelineEvents(dayEvents.timed),
    [dayEvents.timed],
  );

  // Đường "now line" chỉ hiển thị khi đang xem hôm nay.
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!isTodayIso(effectiveIso)) return;

    const interval = window.setInterval(() => setNow(new Date()), 60_000);

    return () => window.clearInterval(interval);
  }, [effectiveIso]);

  const showNowLine = isTodayIso(effectiveIso);
  const nowTop =
    ((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR_HEIGHT_PX;

  const selectedDateObj = useMemo(() => parseIsoDate(effectiveIso), [effectiveIso]);
  const isToday = isSameDay(selectedDateObj, startOfDay(new Date()));

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header ngày — cố định hôm nay, không có nút chuyển ngày */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-44 px-2 text-center text-sm font-semibold text-foreground">
          {format(selectedDateObj, "EEEE, dd 'Tháng' M", { locale: vi })}
        </div>
        {!isToday && (
          <span className="text-xs text-muted">Đang hiển thị hôm nay</span>
        )}
      </div>

      {/* All-day section */}
      {dayEvents.allDay.length > 0 && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5 rounded-lg bg-background p-2">
          <span className="text-xs font-medium text-muted">Cả ngày:</span>
          {dayEvents.allDay.map((event) => (
            <button
              key={event.taskId}
              type="button"
              onClick={() => onEditTask(event.task)}
              title={event.task.title}
              className={cn(
                "inline-flex max-w-48 items-center gap-1 truncate rounded-full px-2 py-0.5 text-xs font-medium",
                STATUS_CHIP_CLASS[event.task.status],
                event.task.status === "done" && "opacity-70 line-through",
              )}
            >
              {event.task.title}
            </button>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div className="scrollbar-clean relative min-h-0 flex-1 overflow-y-auto rounded-lg bg-background">
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: "56px 1fr",
          }}
        >
          {/* Cột label giờ */}
          <div className="relative">
            {Array.from(
              { length: DAY_END_HOUR - DAY_START_HOUR },
              (_, index) => (
                <div
                  key={index}
                  className="relative flex items-start justify-end pr-2 text-xs text-muted"
                  style={{ height: `${HOUR_HEIGHT_PX}px` }}
                >
                  <span className="-translate-y-1.5 bg-background px-1">
                    {formatHourLabel(DAY_START_HOUR + index)}
                  </span>
                </div>
              ),
            )}
          </div>

          {/* Cột sự kiện */}
          <div
            className="relative border-l border-border-card"
            style={{ height: `${(DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT_PX}px` }}
          >
            {/* Đường kẻ ngang mỗi giờ */}
            {Array.from(
              { length: DAY_END_HOUR - DAY_START_HOUR },
              (_, index) => (
                <div
                  key={index}
                  className="absolute left-0 right-0 border-t border-border-card/60"
                  style={{ top: `${index * HOUR_HEIGHT_PX}px` }}
                />
              ),
            )}

            {/* Now line */}
            {showNowLine && (
              <div
                className="pointer-events-none absolute left-0 right-0 z-10 flex items-center"
                style={{ top: `${nowTop}px` }}
              >
                <span className="-translate-x-1/2 -ml-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background" />
                <div className="h-0.5 flex-1 bg-red-500" />
              </div>
            )}

            {/* Empty hint */}
            {laidOut.length === 0 && dayEvents.allDay.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted opacity-60">
                <CalendarClock className="mr-2 h-4 w-4" />
                Chưa có task nào trong ngày này
              </div>
            )}

            {/* Events */}
            {laidOut.map((event) => (
              <TimelineEvent key={event.taskId} event={event} onEdit={onEditTask} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
