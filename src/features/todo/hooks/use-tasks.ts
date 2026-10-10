import { useCallback, useEffect, useMemo, useState } from "react";
import { TASK_STATUS_ORDER } from "../constants/kanban-columns";
import type { Task, TaskScope, TaskStatus } from "../types/task";
import { autoBacklogOverdueTasks } from "../utils/auto-backlog-overdue";
import { migrateTasks } from "../utils/migrate-tasks";
import {
  deleteTaskById,
  fetchAllTasks,
  upsertTask,
} from "@/services/tasks-service";

type MoveDirection = "prev" | "next";

interface AddTaskInput {
  title: string;
  description: string;
  dueDate: string | null;
  dueTime: string | null;
  status?: TaskStatus;
  important?: boolean;
  scope?: TaskScope;
}

interface EditTaskInput {
  title: string;
  description: string;
  dueDate: string | null;
  dueTime: string | null;
  status: TaskStatus;
  important: boolean;
  scope: TaskScope;
}

type TasksByStatus = Record<TaskStatus, Task[]>;

interface UseTasksResult {
  tasks: Task[];
  tasksByStatus: TasksByStatus;
  isLoading: boolean;
  error: string | null;
  addTask: (input: AddTaskInput) => Promise<void>;
  editTask: (id: string, input: EditTaskInput) => Promise<void>;
  moveTask: (id: string, direction: MoveDirection) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

function groupByStatus(tasks: Task[]): TasksByStatus {
  const grouped: TasksByStatus = {
    backlog: [],
    todo: [],
    doing: [],
    done: [],
  };

  for (const task of tasks) {
    grouped[task.status].push(task);
  }

  for (const key of Object.keys(grouped) as TaskStatus[]) {
    grouped[key].sort((a, b) => {
      const aTime = a.dueTime ?? "99:99";
      const bTime = b.dueTime ?? "99:99";
      if (aTime < bTime) return -1;
      if (aTime > bTime) return 1;
      if (a.important !== b.important) return a.important ? -1 : 1;
      if (a.createdAt < b.createdAt) return -1;
      if (a.createdAt > b.createdAt) return 1;
      return 0;
    });
  }

  return grouped;
}

export function filterTasksByDate(tasks: Task[], isoDate: string): Task[] {
  return tasks.filter((task) => {
    if (task.status === "backlog") return true;
    return task.dueDate === isoDate;
  });
}

export function groupByStatusForDate(tasks: Task[], isoDate: string): TasksByStatus {
  return groupByStatus(filterTasksByDate(tasks, isoDate));
}

function getAdjacentStatus(
  status: TaskStatus,
  direction: MoveDirection,
): TaskStatus | null {
  const currentIndex = TASK_STATUS_ORDER.indexOf(status);
  const nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;

  if (nextIndex < 0 || nextIndex >= TASK_STATUS_ORDER.length) return null;

  return TASK_STATUS_ORDER[nextIndex];
}

export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tasksByStatus = useMemo(() => groupByStatus(tasks), [tasks]);

  useEffect(() => {
    let isMounted = true;

    fetchAllTasks()
      .then((loaded) => {
        if (!isMounted) return;
        setTasks(migrateTasks(loaded));
        setError(null);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Không tải được tasks");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-backlog overdue: chạy trên state local, rồi đồng bộ cloud.
  const persistOverdue = useCallback(
    async function persistOverdue(): Promise<void> {
      const updated = autoBacklogOverdueTasks(tasks);
      if (updated === tasks) return;

      setTasks(updated);
      await Promise.all(updated.map((task) => upsertTask(task)));
    },
    [tasks],
  );

  useEffect(() => {
    if (isLoading) return;

    persistOverdue();

    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      5,
      0,
    );
    const ms = nextMidnight.getTime() - now.getTime();
    const id = window.setTimeout(() => {
      void persistOverdue();
    }, ms);
    return () => window.clearTimeout(id);
  }, [isLoading, persistOverdue]);

  const addTask = useCallback(
    async function addTask({
      title,
      description,
      dueDate,
      dueTime,
      status = "todo",
      important = false,
      scope = null,
    }: AddTaskInput): Promise<void> {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description.trim(),
        dueDate,
        dueTime: dueDate ? dueTime : null,
        status,
        important,
        scope,
        createdAt: new Date().toISOString(),
        completedAt: status === "done" ? new Date().toISOString() : null,
      };

      setTasks((prev) => [newTask, ...prev]);
      try {
        await upsertTask(newTask);
      } catch (err) {
        setTasks((prev) => prev.filter((t) => t.id !== newTask.id));
        throw err;
      }
    },
    [],
  );

  const editTask = useCallback(
    async function editTask(
      id: string,
      { title, description, dueDate, dueTime, status, important, scope }: EditTaskInput,
    ): Promise<void> {
      let nextTask: Task | null = null;
      const prevSnapshot = tasks;

      setTasks((prev) =>
        prev.map((task) => {
          if (task.id !== id) return task;
          nextTask = {
            ...task,
            title: title.trim(),
            description: description.trim(),
            dueDate,
            dueTime: dueDate ? dueTime : null,
            status,
            important,
            scope,
            completedAt:
              status === "done"
                ? (task.completedAt ?? new Date().toISOString())
                : null,
          };
          return nextTask;
        }),
      );

      if (!nextTask) return;

      try {
        await upsertTask(nextTask);
      } catch (err) {
        setTasks(prevSnapshot);
        throw err;
      }
    },
    [tasks],
  );

  const moveTask = useCallback(
    async function moveTask(id: string, direction: MoveDirection): Promise<void> {
      const prevSnapshot = tasks;
      let nextTask: Task | null = null;

      setTasks((prev) =>
        prev.map((task) => {
          if (task.id !== id) return task;
          const nextStatus = getAdjacentStatus(task.status, direction);
          if (!nextStatus) return task;
          nextTask = {
            ...task,
            status: nextStatus,
            completedAt: nextStatus === "done" ? new Date().toISOString() : null,
          };
          return nextTask;
        }),
      );

      if (!nextTask) return;

      try {
        await upsertTask(nextTask);
      } catch (err) {
        setTasks(prevSnapshot);
        throw err;
      }
    },
    [tasks],
  );

  const deleteTask = useCallback(
    async function deleteTask(id: string): Promise<void> {
      const prevSnapshot = tasks;
      setTasks((prev) => prev.filter((task) => task.id !== id));
      try {
        await deleteTaskById(id);
      } catch (err) {
        setTasks(prevSnapshot);
        throw err;
      }
    },
    [tasks],
  );

  return {
    tasks,
    tasksByStatus,
    isLoading,
    error,
    addTask,
    editTask,
    moveTask,
    deleteTask,
  };
}
