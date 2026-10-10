import { useMemo } from "react";
import { parseIsoDate, getTodayIso } from "../../../utils/date";
import { cn } from "../../../utils/cn";
import Button from "../../../components/button/button";
import { KANBAN_COLUMNS } from "../constants/kanban-columns";
import type { Task, TaskStatus } from "../types/task";
import KanbanColumn from "./kanban-column";

type MoveDirection = "prev" | "next";

interface KanbanBoardProps {
  tasksByStatus: Record<TaskStatus, Task[]>;
  hiddenColumns: Set<TaskStatus>;
  selectedDate: string;
  onToday: () => void;
  onMove: (id: string, direction: MoveDirection) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function KanbanBoard({
  tasksByStatus,
  hiddenColumns,
  selectedDate,
  onToday,
  onMove,
  onEdit,
  onDelete,
}: KanbanBoardProps) {
  const visibleColumns = KANBAN_COLUMNS.filter((column) => !hiddenColumns.has(column.key));

  const selectedDateObj = useMemo(() => parseIsoDate(selectedDate), [selectedDate]);
  const isToday = selectedDate === getTodayIso();

  // Định dạng hiển thị: dd/MM/yyyy
  const formattedDate = `${String(selectedDateObj.getDate()).padStart(2, "0")}/${String(selectedDateObj.getMonth() + 1).padStart(2, "0")}/${selectedDateObj.getFullYear()}`;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">
          {isToday ? "Hôm nay" : "Ngày"}: {formattedDate}
        </span>
        {!isToday && (
          <Button
            variant="ghost"
            className="rounded-full px-2.5 py-1 text-xs"
            onClick={onToday}
          >
            Về hôm nay
          </Button>
        )}
      </div>
      <div
        className={cn(
          "scrollbar-clean flex min-h-0 flex-1 gap-3 overflow-x-auto pb-2",
        )}
      >
        {visibleColumns.map((column) => (
          <KanbanColumn
            key={column.key}
            column={column}
            tasks={tasksByStatus[column.key]}
            onMove={onMove}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
