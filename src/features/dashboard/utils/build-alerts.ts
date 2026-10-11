import { daysFromToday } from "../../../utils/date";
import { formatEstimate } from "../../todo/utils/format-estimate";
import type { Task, TaskScope } from "../../todo/types/task";

export type AlertTone = "overdue" | "today" | "soon" | "important" | "week" | "month";

export interface AlertItem {
  key: string;
  sourceId: string;
  message: string;
  tone: AlertTone;
  diff: number;
  time: string | null;
  dueDate: string | null;
  isImportant: boolean;
  scope: TaskScope;
}

const TODO_WINDOW_DAYS = 2;

function toneOf(diff: number): AlertTone {
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";

  return "soon";
}

// Ngày đã hiện ở nhãn inline trong AlertItem nên message chỉ giữ tiêu đề + giờ + ước lượng.
function todoMessage(
  title: string,
  time: string | null,
  estimate: number | null,
): string {
  const estimateText = formatEstimate(estimate);
  let message = title;
  if (time) message += ` · ${time}`;
  if (estimateText) message += ` (${estimateText})`;

  return message;
}

// Thứ tự: quá hạn → hôm nay → ngày mai → important/scope → ngày mốt (cuối cùng).
function sortKey(item: AlertItem): number {
  if (item.diff < 0) return 0;
  if (item.diff === 0) return 1;
  if (item.diff === 1) return 2;
  if (!isFinite(item.diff)) return 3;

  return 4;
}

export function buildImportantAlerts(tasks: Task[]): AlertItem[] {
  // Chỉ lấy task đánh dấu quan trọng và chưa hoàn thành.
  return tasks
    .filter((task) => task.important && task.status !== "done")
    .map<AlertItem>((task) => {
      if (!task.dueDate) {
        return {
          key: `todo-${task.id}`,
          sourceId: task.id,
          message: todoMessage(task.title, null, task.estimateMinutes),
          tone: "important",
          diff: Infinity,
          time: null,
          dueDate: null,
          isImportant: true,
          scope: task.scope,
        };
      }

      const diff = daysFromToday(task.dueDate);

      return {
        key: `todo-${task.id}`,
        sourceId: task.id,
        message: todoMessage(task.title, task.dueTime, task.estimateMinutes),
        tone: toneOf(diff),
        diff,
        time: task.dueTime,
        dueDate: task.dueDate,
        isImportant: true,
        scope: task.scope,
      };
    })
    .sort(
      (first, second) =>
        sortKey(first) - sortKey(second) ||
        (first.time ?? "99:99").localeCompare(second.time ?? "99:99"),
    );
}

export function buildAlerts(tasks: Task[]): AlertItem[] {
  const items: AlertItem[] = [];
  const includedTaskIds = new Set<string>();

  // Important tasks (any status except done) always appear
  for (const task of tasks) {
    if (task.status === "done" || !task.important) continue;

    includedTaskIds.add(task.id);

    if (!task.dueDate) {
      items.push({
        key: `todo-${task.id}`,
        sourceId: task.id,
        message: todoMessage(task.title, null, task.estimateMinutes),
        tone: "important",
        diff: Infinity,
        time: null,
        dueDate: null,
        isImportant: true,
        scope: task.scope,
      });
    } else {
      const diff = daysFromToday(task.dueDate);

      items.push({
        key: `todo-${task.id}`,
        sourceId: task.id,
        message: todoMessage(task.title, task.dueTime, task.estimateMinutes),
        tone: toneOf(diff),
        diff,
        time: task.dueTime,
        dueDate: task.dueDate,
        isImportant: true,
        scope: task.scope,
      });
    }
  }

  // Non-important tasks with upcoming due dates
  for (const task of tasks) {
    if (task.status === "done" || task.status === "backlog" || !task.dueDate)
      continue;
    if (includedTaskIds.has(task.id)) continue;

    const diff = daysFromToday(task.dueDate);
    if (diff > TODO_WINDOW_DAYS) continue;

    items.push({
      key: `todo-${task.id}`,
      sourceId: task.id,
      message: todoMessage(task.title, task.dueTime, task.estimateMinutes),
      tone: toneOf(diff),
      diff,
      time: task.dueTime,
      dueDate: task.dueDate,
      isImportant: false,
      scope: task.scope,
    });
  }

  // Scoped tasks (week/month) — not done, not already included
  for (const task of tasks) {
    if (task.status === "done" || !task.scope) continue;
    if (includedTaskIds.has(task.id)) continue;

    items.push({
      key: `todo-${task.id}`,
      sourceId: task.id,
      message: todoMessage(task.title, null, task.estimateMinutes),
      tone: task.scope,
      diff: Infinity,
      time: null,
      dueDate: null,
      isImportant: false,
      scope: task.scope,
    });
  }

  return items.sort(
    (first, second) =>
      sortKey(first) - sortKey(second) ||
      (first.time ?? "99:99").localeCompare(second.time ?? "99:99"),
  );
}
