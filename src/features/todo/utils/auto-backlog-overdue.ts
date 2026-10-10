import { daysFromToday } from "../../../utils/date";
import type { Task } from "../types/task";

/**
 * Quy tắc hiện tại: chỉ task có status "todo" / "doing" mà đã quá hạn
 * (`dueDate < today`) mới bị dời về "backlog". Done/backlog giữ nguyên.
 * Bỏ qua scope.
 */
export function autoBacklogOverdueTasks(tasks: Task[]): Task[] {
  let changed = false;
  const next = tasks.map((task) => {
    if (task.status !== "todo" && task.status !== "doing") return task;
    if (task.dueDate === null) return task;
    if (daysFromToday(task.dueDate) >= 0) return task;

    changed = true;
    return { ...task, status: "backlog" as const };
  });

  return changed ? next : tasks;
}
