import type { Task } from "../types/task";
import { timeStringToMinutes } from "../../../utils/time";

export interface TimedEvent {
  /** ID của task gốc. */
  taskId: string;
  /** Phút bắt đầu (0..1440). */
  startMinutes: number;
  /** Phút kết thúc (exclusive). Tối thiểu 30 phút để block đủ nhìn. */
  endMinutes: number;
  /** Task gốc để render chi tiết. */
  task: Task;
}

export interface AllDayEvent {
  taskId: string;
  task: Task;
}

export interface DayEvents {
  allDay: AllDayEvent[];
  timed: TimedEvent[];
}

/**
 * Lọc task theo 1 ngày iso, tách thành all-day (không có giờ) và timed (có giờ).
 * - Task không có dueDate: bỏ qua.
 * - Task có dueDate nhưng không có dueTime: all-day.
 * - Task có dueDate + dueTime: timed, duration mặc định 60 phút.
 */
export function buildDayEvents(tasks: Task[], isoDate: string): DayEvents {
  const allDay: AllDayEvent[] = [];
  const timed: TimedEvent[] = [];

  for (const task of tasks) {
    if (task.dueDate !== isoDate) continue;

    const start = timeStringToMinutes(task.dueTime);
    if (start === null) {
      allDay.push({ taskId: task.id, task });

      continue;
    }

    timed.push({
      taskId: task.id,
      startMinutes: start,
      endMinutes: Math.min(1440, start + 60), // mặc định 60 phút
      task,
    });
  }

  // Sắp xếp all-day theo thứ tự status → tiêu đề để ổn định giữa các lần render.
  allDay.sort((a, b) => {
    if (a.task.status !== b.task.status) {
      return a.task.status.localeCompare(b.task.status);
    }

    return a.task.title.localeCompare(b.task.title);
  });

  // Sắp xếp timed theo thời gian bắt đầu, rồi theo duration dài trước.
  timed.sort((a, b) => {
    if (a.startMinutes !== b.startMinutes) {
      return a.startMinutes - b.startMinutes;
    }

    const aDuration = a.endMinutes - a.startMinutes;
    const bDuration = b.endMinutes - b.startMinutes;

    return bDuration - aDuration;
  });

  return { allDay, timed };
}
