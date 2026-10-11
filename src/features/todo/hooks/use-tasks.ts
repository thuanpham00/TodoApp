import {
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
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

// --- Module-level singleton state ---------------------------------------
// Mọi component gọi useTasks() đều dùng chung state này, đảm bảo UI đồng bộ
// giữa các widget mà không cần context provider.

interface TasksStoreState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
}

let storeState: TasksStoreState = {
  tasks: [],
  isLoading: true,
  error: null,
};

const listeners = new Set<() => void>();
let initStarted = false;

function setStoreState(next: Partial<TasksStoreState>): void {
  storeState = { ...storeState, ...next };
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): TasksStoreState {
  return storeState;
}

function getServerSnapshot(): TasksStoreState {
  return storeState;
}

async function loadAll(): Promise<void> {
  try {
    const loaded = await fetchAllTasks();
    setStoreState({ tasks: migrateTasks(loaded), error: null, isLoading: false });
  } catch (err: unknown) {
    setStoreState({
      error: err instanceof Error ? err.message : "Không tải được tasks",
      isLoading: false,
    });
  }
}

function ensureInitialized(): void {
  if (initStarted) return;
  initStarted = true;
  void loadAll();
}

export function useTasks(): UseTasksResult {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // Trigger initial fetch ở lần đầu tiên hook được dùng (global guard bên trên
  // đảm bảo chỉ fetch 1 lần dù nhiều component mount).
  useEffect(() => {
    ensureInitialized();
  }, []);

  // Auto-backlog overdue: chạy 1 lần sau khi load xong, rồi lặp lại lúc nửa đêm.
  useEffect(() => {
    if (snapshot.isLoading) return;

    const runOverdue = async (): Promise<void> => {
      const current = getSnapshot().tasks;
      const updated = autoBacklogOverdueTasks(current);
      if (updated === current) return;

      setStoreState({ tasks: updated });
      await Promise.all(updated.map((task) => upsertTask(task)));
      // Refetch để đồng bộ với cloud sau khi ghi overdue.
      await loadAll();
    };

    void runOverdue();

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
      void runOverdue();
    }, ms);
    return () => window.clearTimeout(id);
  }, [snapshot.isLoading]);

  const tasksByStatus = useMemo(
    () => groupByStatus(snapshot.tasks),
    [snapshot.tasks],
  );

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

      setStoreState({ tasks: [newTask, ...storeState.tasks] });
      try {
        await upsertTask(newTask);
        // Refetch để chắc chắn UI khớp với cloud (id, timestamps, ...).
        await loadAll();
      } catch (err) {
        setStoreState({
          tasks: storeState.tasks.filter((t) => t.id !== newTask.id),
        });
        throw err;
      }
    },
    [],
  );

  const editTask = useCallback(
    async function editTask(
      id: string,
      {
        title,
        description,
        dueDate,
        dueTime,
        status,
        important,
        scope,
      }: EditTaskInput,
    ): Promise<void> {
      let nextTask: Task | null = null;
      const prevSnapshot = storeState.tasks;

      setStoreState({
        tasks: storeState.tasks.map((task) => {
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
      });

      if (!nextTask) return;

      try {
        await upsertTask(nextTask);
        await loadAll();
      } catch (err) {
        setStoreState({ tasks: prevSnapshot });
        throw err;
      }
    },
    [],
  );

  const moveTask = useCallback(
    async function moveTask(
      id: string,
      direction: MoveDirection,
    ): Promise<void> {
      const prevSnapshot = storeState.tasks;
      let nextTask: Task | null = null;

      setStoreState({
        tasks: storeState.tasks.map((task) => {
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
      });

      if (!nextTask) return;

      try {
        await upsertTask(nextTask);
        await loadAll();
      } catch (err) {
        setStoreState({ tasks: prevSnapshot });
        throw err;
      }
    },
    [],
  );

  const deleteTask = useCallback(
    async function deleteTask(id: string): Promise<void> {
      const prevSnapshot = storeState.tasks;
      setStoreState({
        tasks: storeState.tasks.filter((task) => task.id !== id),
      });
      try {
        await deleteTaskById(id);
        await loadAll();
      } catch (err) {
        setStoreState({ tasks: prevSnapshot });
        throw err;
      }
    },
    [],
  );

  return {
    tasks: snapshot.tasks,
    tasksByStatus,
    isLoading: snapshot.isLoading,
    error: snapshot.error,
    addTask,
    editTask,
    moveTask,
    deleteTask,
  };
}
