export type TaskStatus = "backlog" | "todo" | "doing" | "done";

export type TaskScope = "week" | "month" | null;

export type TaskView = "board" | "calendar" | "timeline";

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string | null; // ISO "YYYY-MM-DD", null = không gắn ngày
  dueTime: string | null; // "HH:mm", null = không gắn giờ
  status: TaskStatus;
  important: boolean;
  scope: TaskScope;
  /** Ước lượng thời gian hoàn thành (phút), null = không ước lượng. */
  estimateMinutes: number | null;
  createdAt: string; // ISO datetime
  completedAt: string | null;
}
