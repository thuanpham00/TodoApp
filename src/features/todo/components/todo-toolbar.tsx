import { CalendarDays, Clock, Columns3, LayoutList, Plus } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Button from "../../../components/button/button";
import { cn } from "../../../utils/cn";
import { KANBAN_COLUMNS } from "../constants/kanban-columns";
import type { TaskStatus, TaskView } from "../types/task";

interface TodoToolbarProps {
  view: TaskView;
  hiddenColumns: Set<TaskStatus>;
  onViewChange: (view: TaskView) => void;
  onToggleColumn: (status: TaskStatus) => void;
  onAddClick: () => void;
}

interface ViewOption {
  key: TaskView;
  label: string;
  icon: typeof LayoutList;
}

const VIEW_OPTIONS: ViewOption[] = [
  { key: "timeline", label: "Lịch ngày", icon: Clock },
  { key: "board", label: "Board", icon: LayoutList },
  { key: "calendar", label: "Lịch tháng", icon: CalendarDays },
];

export default function TodoToolbar({
  view,
  hiddenColumns,
  onViewChange,
  onToggleColumn,
  onAddClick,
}: TodoToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hiddenCount = hiddenColumns.size;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded-lg bg-background p-0.5">
        {VIEW_OPTIONS.map((option) => {
          const isActive = view === option.key;
          const Icon = option.icon;

          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onViewChange(option.key)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                isActive && "bg-surface text-foreground shadow-sm",
                !isActive && "text-muted hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {option.label}
            </button>
          );
        })}
      </div>

      {view === "board" && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-input px-2.5 py-1.5 text-xs font-medium transition-colors hover:text-foreground",
                hiddenCount > 0 ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Columns3 className="h-3.5 w-3.5" />
              Cột
              {hiddenCount > 0 && (
                <span className="rounded-full bg-foreground px-1.5 py-0.5 text-[10px] text-background leading-none">
                  {KANBAN_COLUMNS.length - hiddenCount}/{KANBAN_COLUMNS.length}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-44 p-2">
            <p className="mb-2 px-1 text-xs font-semibold text-muted-foreground">
              Hiển thị cột
            </p>
            <ul className="flex flex-col gap-0.5">
              {KANBAN_COLUMNS.map((column) => {
                const isVisible = !hiddenColumns.has(column.key);

                return (
                  <li key={column.key}>
                    <button
                      type="button"
                      onClick={() => onToggleColumn(column.key)}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-background"
                    >
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          column.dotClassName,
                        )}
                      />
                      <span className={cn("flex-1 text-left", !isVisible && "text-muted-foreground line-through")}>
                        {column.label}
                      </span>
                      <span className={cn("h-4 w-4 rounded border-2 transition-colors", isVisible ? "border-foreground bg-foreground" : "border-input")} >
                        {isVisible && (
                          <svg viewBox="0 0 16 16" fill="none" className="h-full w-full text-background">
                            <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </PopoverContent>
        </Popover>
      )}

      <Button onClick={onAddClick} className="rounded-full px-3 py-1.5">
        <Plus className="h-4 w-4" />
        Thêm task
      </Button>
    </div>
  );
}
