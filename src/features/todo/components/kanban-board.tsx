import { useEffect, useMemo, useRef, useState } from "react";
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
  const [activeIndex, setActiveIndex] = useState(0);

  // Theo dõi cột đang "snap" trong viewport để hiển thị dot indicator.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    function update(): void {
      const children = Array.from(el!.children) as HTMLElement[];
      if (children.length === 0) return;
      const scrollLeft = el!.scrollLeft;
      const viewportCenter = scrollLeft + el!.clientWidth / 2;
      let closest = 0;
      let minDist = Number.POSITIVE_INFINITY;
      children.forEach((child, index) => {
        const center = child.offsetLeft + child.offsetWidth / 2;
        const dist = Math.abs(center - viewportCenter);
        if (dist < minDist) {
          minDist = dist;
          closest = index;
        }
      });
      setActiveIndex(closest);
    }

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [visibleColumns.length]);

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
            className="min-h-[60vh] min-w-0 snap-center sm:min-h-0 sm:min-w-72 md:min-w-80"
            style={{ flexBasis: 0, flexGrow: 1, flexShrink: 0 }}
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

      {/* Dot indicator — chỉ dùng khi các cột xếp ngang (sm trở lên) */}
      {visibleColumns.length > 1 && (
        <div
          className="hidden items-center justify-center gap-1.5 sm:flex"
          aria-hidden="true"
        >
          {visibleColumns.map((column, index) => (
            <span
              key={column.key}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === activeIndex
                  ? "w-5 bg-brand"
                  : "w-1.5 bg-muted-foreground/30",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
