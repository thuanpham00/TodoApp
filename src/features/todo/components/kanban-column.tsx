import { cn } from "../../../utils/cn";
import type { KanbanColumn as KanbanColumnConfig } from "../constants/kanban-columns";
import type { Task } from "../types/task";
import TaskCard from "./task-card";

type MoveDirection = "prev" | "next";

interface KanbanColumnProps {
  column: KanbanColumnConfig;
  tasks: Task[];
  onMove: (id: string, direction: MoveDirection) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function KanbanColumn({
  column,
  tasks,
  onMove,
  onEdit,
  onDelete,
}: KanbanColumnProps) {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col rounded-xl bg-background p-2 sm:p-2.5 sm:min-h-0">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", column.dotClassName)} />
          <span className="text-sm font-semibold text-foreground">
            {column.label}
          </span>
        </div>
        <span className="text-xs font-medium text-muted">{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <p className="px-1 py-4 text-center text-xs text-muted opacity-60">
          Trống
        </p>
      ) : (
        <ul className="scrollbar-clean flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-0.5">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onMove={onMove}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
