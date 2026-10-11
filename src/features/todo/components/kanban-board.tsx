import { useMemo, useRef } from "react";
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

  const scrollerRef = useRef<HTMLDivElement>(null);

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
      {/* Mobile: xếp dọc từng cột (full-width). sm+: hàng ngang như cũ. */}
      <div
        ref={scrollerRef}
        className={cn(
          "scrollbar-clean flex min-h-0 flex-1 snap-x snap-mandatory scroll-smooth flex-col gap-2 overflow-x-hidden overflow-y-auto pb-2 sm:flex-row sm:gap-3 sm:overflow-x-auto sm:overflow-y-hidden",
        )}
      >
        {visibleColumns.map((column, index) => (
          <div
            key={column.key}
            className="min-h-[60vh] min-w-0 snap-center sm:min-h-0"
            style={{ flexBasis: 0, flexGrow: 1, flexShrink: 1 }}
            data-index={index}
          >
            <KanbanColumn
              column={column}
              tasks={tasksByStatus[column.key]}
              onMove={onMove}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>

    </div>
  );
}
