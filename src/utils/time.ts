import { formatIsoDate, parseIsoDate } from "./date";

// =====================================================
// Time helpers — phục vụ Day Timeline view của Todo.
// Mọi tính toán dùng local time (giống phần còn lại).
// =====================================================

export const HOUR_HEIGHT_PX = 56; // mỗi giờ cao 56px
export const MIN_EVENT_HEIGHT_PX = 28;
export const DAY_START_HOUR = 0;
export const DAY_END_HOUR = 24; // timeline hiển thị đến hết 23h

export interface DayBounds {
  /** Tổng chiều cao pixel của timeline (24 giờ). */
  totalHeight: number;
}

/** Trả về tổng chiều cao của timeline dựa trên HOUR_HEIGHT_PX. */
export function getTimelineHeight(): number {
  return (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT_PX;
}

/** Trả về {hour, minute} từ chuỗi "HH:mm", hoặc null nếu không hợp lệ. */
export function parseTime(time: string | null): { hour: number; minute: number } | null {
  if (!time) return null;
  const parts = time.split(":");
  if (parts.length !== 2) return null;
  const hour = Number(parts[0]);
  const minute = Number(parts[1]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  return { hour, minute };
}

/** Tính số phút kể từ 00:00 (vd: 09:30 → 570). */
export function timeToMinutes(time: { hour: number; minute: number }): number {
  return time.hour * 60 + time.minute;
}

/** Tính số phút kể từ 00:00 từ chuỗi "HH:mm". Trả về null nếu không hợp lệ. */
export function timeStringToMinutes(time: string | null): number | null {
  const parsed = parseTime(time);

  return parsed ? timeToMinutes(parsed) : null;
}

/** Định dạng nhãn giờ đứng đầu mỗi dòng (vd: 09:00, 14:00). */
export function formatHourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

/** Trả về Date mới kết hợp ngày iso + giờ "HH:mm". */
export function combineDateAndTime(iso: string, time: string | null): Date {
  const base = parseIsoDate(iso);
  const parsed = parseTime(time);

  if (!parsed) return base;

  return new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    parsed.hour,
    parsed.minute,
  );
}

/** Trả về ISO YYYY-MM-DD của hôm nay (local). Re-export cho tiện dùng. */
export function getTodayIsoDate(): string {
  return formatIsoDate(new Date());
}

/** Trả về chuỗi "HH:mm" từ Date (local). */
export function formatTimeOfDate(date: Date): string {
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${hour}:${minute}`;
}
