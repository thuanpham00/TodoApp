import { useCallback, useMemo, useState } from "react";
import WidgetCard from "../../../components/widget-card/widget-card";
import { groupByStatusForDate, useTasks } from "../hooks/use-tasks";
import type { Task, TaskStatus, TaskView } from "../types/task";
import CalendarView from "./calendar-view";
import DayTimeline from "./day-timeline";
import KanbanBoard from "./kanban-board";
import TaskFormModal from "./task-form-modal";
import TodoToolbar from "./todo-toolbar";

const HIDDEN_COLUMNS_KEY = "hiddenKanbanColumns";

function loadHiddenColumns(): Set<TaskStatus> {
  try {
    const stored = localStorage.getItem(HIDDEN_COLUMNS_KEY);
    if (stored) return new Set(JSON.parse(stored) as TaskStatus[]);
  } catch {}

  return new Set();
}

function getTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function TodoWidget() {
  const {
    tasks,
    isLoading,
    addTask,
    editTask,
    moveTask,
    deleteTask,
  } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [view, setView] = useState<TaskView>("board");
  const [hiddenColumns, setHiddenColumns] = useState<Set<TaskStatus>>(loadHiddenColumns);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayIso);

  // Tasks theo từng status đã lọc theo selectedDate dùng cho Board.
  // Cột "Quá hạn" hiển thị tất cả task backlog; các cột còn lại lọc theo dueDate.
  const tasksByStatus = useMemo(
    () => groupByStatusForDate(tasks, selectedDate),
    [tasks, selectedDate],
  );

  const openCreateModal = useCallback((initialDate: string | null): void => {
    setEditingTask(null);
    setModalDate(initialDate);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((task: Task): void => {
    setEditingTask(task);
    setModalDate(null);
    setIsModalOpen(true);
  }, []);

  const toggleColumn = useCallback((status: TaskStatus): void => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      try {
        localStorage.setItem(HIDDEN_COLUMNS_KEY, JSON.stringify([...next]));
      } catch {}

      return next;
    });
  }, []);

  const handleSelectDay = useCallback((iso: string): void => {
    setSelectedDate(iso);
    setView("board");
  }, []);

  const handleSubmit = useCallback(
    async (values: Parameters<typeof addTask>[0]): Promise<void> => {
      try {
        if (editingTask) {
          await editTask(editingTask.id, {
            ...values,
            status: values.status ?? "todo",
            important: values.important ?? false,
            scope: values.scope ?? null,
          });
        } else {
          // Ép status mặc định là "todo" khi tạo mới để task mới không rơi vào "backlog".
          await addTask({ ...values, status: values.status ?? "todo" });
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Lỗi khi lưu task:", err);
      }
    },
    [editingTask, editTask, addTask],
  );

  return (
    <WidgetCard
      title="Todo"
      icon={
        <img
          src="/icons/todo.png"
          alt=""
          width={20}
          height={20}
          className="h-5 w-5 object-contain"
        />
      }
      className="h-full flex-1"
      bodyClassName="flex min-h-0 flex-col"
      action={
        <TodoToolbar
          view={view}
          hiddenColumns={hiddenColumns}
          onViewChange={setView}
          onToggleColumn={toggleColumn}
          onAddClick={() => openCreateModal(selectedDate)}
        />
      }
    >
      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted">Đang tải…</p>
      ) : view === "board" ? (
        <KanbanBoard
          tasksByStatus={tasksByStatus}
          hiddenColumns={hiddenColumns}
          selectedDate={selectedDate}
          onToday={() => setSelectedDate(getTodayIso())}
          onMove={moveTask}
          onEdit={openEditModal}
          onDelete={deleteTask}
        />
      ) : view === "calendar" ? (
        <CalendarView tasks={tasks} onSelectDay={handleSelectDay} />
      ) : (
        <DayTimeline
          tasks={tasks}
          selectedDate={selectedDate}
          onEditTask={openEditModal}
        />
      )}

      <TaskFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleSubmit}
        initialDate={modalDate}
        task={editingTask}
      />
    </WidgetCard>
  );
}
