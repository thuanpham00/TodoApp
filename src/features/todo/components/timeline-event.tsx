import { STATUS_CHIP_CLASS } from "../constants/kanban-columns";
import type { Task } from "../types/task";
import { formatEstimate } from "../utils/format-estimate";
import {
  HOUR_HEIGHT_PX,
  MIN_EVENT_HEIGHT_PX,
} from "../../../utils/time";
import type { LaidOutEvent } from "../utils/timeline-layout";
import { cn } from "../../../utils/cn";

interface TimelineEventProps {
  event: LaidOutEvent;
  onEdit: (task: Task) => void;
}

function minutesToPx(minutes: number): number {
  return (minutes / 60) * HOUR_HEIGHT_PX;
}

export default function TimelineEvent({ event, onEdit }: TimelineEventProps) {
  const { task, startMinutes, endMinutes, column, columnCount } = event;
  const duration = endMinutes - startMinutes;
  const top = minutesToPx(startMinutes);
  const height = Math.max(MIN_EVENT_HEIGHT_PX, minutesToPx(duration));
  const widthPercent = 100 / columnCount;
  const leftPercent = column * widthPercent;

  return (
    <button
      type="button"
      onClick={() => onEdit(task)}
      title={task.description ? `${task.title} — ${task.description}` : task.title}
      className={cn(
        "absolute overflow-hidden rounded-md border px-2 py-1.5 text-left text-xs transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        STATUS_CHIP_CLASS[task.status],
        task.status === "done" && "opacity-70",
      )}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        width: `calc(${widthPercent}% - 4px)`,
        left: `calc(${leftPercent}% + 2px)`,
      }}
    >
      <div className="flex items-center gap-1 truncate font-semibold">
        {task.dueTime && <span>{task.dueTime}</span>}
        <span className="truncate">{task.title}</span>
      </div>
      {height > 50 && task.description && (
        <p className="mt-0.5 truncate opacity-80">{task.description}</p>
      )}
      {height > 50 && task.estimateMinutes && (
        <p className="mt-0.5 opacity-70">{formatEstimate(task.estimateMinutes)}</p>
      )}
    </button>
  );
}
