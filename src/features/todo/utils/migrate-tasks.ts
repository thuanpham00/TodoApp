import type { Task, TaskScope, TaskStatus } from "../types/task";

interface LegacyTaskShape {
  id?: string;
  title?: string;
  description?: string;
  dueDate?: string | null;
  dueTime?: string | null;
  isDone?: boolean;
  status?: TaskStatus;
  createdAt?: string;
  completedAt?: string | null;
}

// Task cũ chỉ có `isDone` (không có `status`/`description`). Chuẩn hoá về model
// mới khi load để tránh mất dữ liệu người dùng đang lưu.
export function migrateTasks(loaded: Task[]): Task[] {
  return loaded.map((task) => {
    const legacy = task as unknown as LegacyTaskShape;

    const knownTask = task as unknown as { important?: boolean; scope?: TaskScope };

    if (legacy.status) {
      return {
        ...task,
        description: legacy.description ?? "",
        dueTime: legacy.dueTime ?? null,
        important: knownTask.important ?? false,
        scope: knownTask.scope ?? null,
      };
    }

    const status: TaskStatus = legacy.isDone ? "done" : "todo";

    return {
      id: legacy.id ?? crypto.randomUUID(),
      title: legacy.title ?? "",
      description: legacy.description ?? "",
      dueDate: legacy.dueDate ?? null,
      dueTime: legacy.dueTime ?? null,
      status,
      important: false,
      scope: null,
      createdAt: legacy.createdAt ?? new Date().toISOString(),
      completedAt: legacy.completedAt ?? null,
    };
  });
}
