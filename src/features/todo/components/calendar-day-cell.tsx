import { cn } from "../../../utils/cn";
import { STATUS_CHIP_CLASS } from "../constants/kanban-columns";
import type { Task } from "../types/task";
import type { CalendarCell } from "../../../utils/calendar-month";

interface CalendarDayCellProps {
  cell: CalendarCell;
  tasks: Task[];
  onSelect: (iso: string) => void;
}

const MAX_VISIBLE = 3;

export default function CalendarDayCell({
  cell,
  tasks,
  onSelect,
}: CalendarDayCellProps) {
  const visibleTasks = tasks.slice(0, MAX_VISIBLE);
  const hiddenCount = tasks.length - visibleTasks.length;

  return (
    <button
      type="button"
      onClick={() => onSelect(cell.iso)}
      title="Thêm task vào ngày này"
      className={cn(
        "flex h-full min-h-0 cursor-pointer flex-col gap-1 rounded-xl bg-background p-2 text-left ring-1 ring-border-card transition-shadow hover:ring-2 hover:ring-ring",
        !cell.isCurrentMonth && "opacity-40",
      )}
    >
      <span
        className={cn(
          "inline-flex h-6 w-6 items-center justify-center self-start rounded-full text-xs font-medium text-foreground",
          cell.isToday && "bg-brand text-white",
        )}
      >
        {cell.dayNumber}
      </span>

      <div className="flex flex-1 flex-col gap-1 overflow-hidden">
        {visibleTasks.map((task) => (
          <span
            key={task.id}
            title={task.title}
            className={cn(
              "truncate rounded px-1.5 py-0.5 text-[11px] font-medium",
              STATUS_CHIP_CLASS[task.status],
            )}
          >
            {task.dueTime && (
              <span className="font-semibold">{task.dueTime} </span>
            )}
            {task.title}
          </span>
        ))}

        {hiddenCount > 0 && (
          <span className="px-1 text-[11px] text-muted">+{hiddenCount} nữa</span>
        )}
      </div>
    </button>
  );
}
