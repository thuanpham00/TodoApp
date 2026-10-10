import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import IconButton from "../../../components/icon-button/icon-button";
import { cn } from "../../../utils/cn";
import type { Task } from "../types/task";
import CalendarDayCell from "./calendar-day-cell";
import {
  getMonthLabel,
  getMonthMatrix,
  getNextMonth,
  getPreviousMonth,
  WEEKDAY_HEADERS,
} from "../../../utils/calendar-month";

interface CalendarViewProps {
  tasks: Task[];
  onSelectDay: (iso: string) => void;
}

function groupTasksByDate(tasks: Task[]): Record<string, Task[]> {
  const map: Record<string, Task[]> = {};

  for (const task of tasks) {
    if (!task.dueDate) continue;
    (map[task.dueDate] ??= []).push(task);
  }

  return map;
}

// Map số hàng tháng (4–6) sang class grid-rows của Tailwind.
const ROW_CLASS_BY_COUNT: Record<number, string> = {
  4: "grid-rows-4",
  5: "grid-rows-5",
  6: "grid-rows-6",
};

export default function CalendarView({
  tasks,
  onSelectDay,
}: CalendarViewProps) {
  const now = new Date();
  const [current, setCurrent] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });

  const cells = useMemo(
    () => getMonthMatrix(current.year, current.month),
    [current],
  );
  const tasksByDate = useMemo(() => groupTasksByDate(tasks), [tasks]);
  const rowCount = cells.length / 7;
  const gridRowsClass = ROW_CLASS_BY_COUNT[rowCount] ?? "grid-rows-5";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">
          {getMonthLabel(current.year, current.month)}
        </h3>
        <div className="flex items-center gap-1">
          <IconButton
            icon={ChevronLeft}
            label="Tháng trước"
            className="h-8 w-8 rounded-full"
            onClick={() =>
              setCurrent(getPreviousMonth(current.year, current.month))
            }
          />
          <IconButton
            icon={ChevronRight}
            label="Tháng sau"
            className="h-8 w-8 rounded-full"
            onClick={() =>
              setCurrent(getNextMonth(current.year, current.month))
            }
          />
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-2">
        {WEEKDAY_HEADERS.map((label) => (
          <span
            key={label}
            className="text-center text-xs font-medium text-muted"
          >
            {label}
          </span>
        ))}
      </div>

      <div
        className={cn(
          "grid min-h-0 flex-1 grid-cols-7 gap-2",
          gridRowsClass,
        )}
      >
        {cells.map((cell) => (
          <CalendarDayCell
            key={cell.iso}
            cell={cell}
            tasks={tasksByDate[cell.iso] ?? []}
            onSelect={onSelectDay}
          />
        ))}
      </div>
    </div>
  );
}
