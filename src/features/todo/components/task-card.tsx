import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Flame,
  Pencil,
  Trash2,
} from "lucide-react";
import IconButton from "../../../components/icon-button/icon-button";
import { cn } from "../../../utils/cn";
import {
  STATUS_CHIP_CLASS,
  TASK_STATUS_ORDER,
} from "../constants/kanban-columns";
import type { Task } from "../types/task";
import { formatDueBadge } from "../utils/task-date";

type MoveDirection = "prev" | "next";

interface TaskCardProps {
  task: Task;
  onMove: (id: string, direction: MoveDirection) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({
  task,
  onMove,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const statusIndex = TASK_STATUS_ORDER.indexOf(task.status);
  // User không được lùi về "Quá hạn" (backlog) – chỉ hệ thống mới set.
  const canMovePrev = statusIndex > 0 && task.status !== "todo";
  const canMoveNext = statusIndex < TASK_STATUS_ORDER.length - 1;

  return (
    <li className="rounded-xl bg-surface p-3 ring-1 ring-border-card">
      <div className="flex items-start gap-1.5">
        <p className="flex-1 text-sm font-medium text-foreground">{task.title}</p>
        {task.important && (
          <Flame className="h-4 w-4 shrink-0 fill-orange-500 text-orange-500" />
        )}
      </div>

      {task.description && (
        <p className="mt-1 text-xs leading-relaxed text-muted">
          {task.description}
        </p>
      )}

      <div className="mt-2 flex flex-wrap gap-1.5">
        {task.dueDate && (
          <span
            className={cn(
              "flex w-fit items-center gap-1 rounded-md px-2 py-1 text-xs font-medium",
              STATUS_CHIP_CLASS[task.status],
            )}
          >
            <CalendarClock className="h-3 w-3 shrink-0" />
            {formatDueBadge(task.dueDate)}
            {task.dueTime && ` · ${task.dueTime}`}
          </span>
        )}
        {task.scope && (
          <span className="flex w-fit items-center rounded-md bg-orange-100 px-2 py-1 text-xs font-medium text-orange-600">
            {task.scope === "week" ? "Tuần này" : "Tháng này"}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-end gap-0.5 border-t border-border-card pt-2">
        <IconButton icon={Pencil} label="Sửa task" onClick={() => onEdit(task)} />
        <IconButton
          icon={ChevronLeft}
          label="Chuyển sang cột trước"
          disabled={!canMovePrev}
          onClick={() => onMove(task.id, "prev")}
        />
        <IconButton
          icon={ChevronRight}
          label="Chuyển sang cột sau"
          disabled={!canMoveNext}
          onClick={() => onMove(task.id, "next")}
        />
        <IconButton
          icon={Trash2}
          label="Xoá task"
          className="hover:text-rose-500"
          onClick={() => onDelete(task.id)}
        />
      </div>
    </li>
  );
}
