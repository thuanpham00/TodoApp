import { daysFromToday, parseIsoDate } from "../../../utils/date";

const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

// Nhãn ngày ngắn đứng trước nội dung alert: Quá hạn / Hôm nay / Ngày mai / T4, 22/7.
export function formatAlertDate(iso: string): string {
  const diff = daysFromToday(iso);

  if (diff < 0) return "Quá hạn";
  if (diff === 0) return "Hôm nay";
  if (diff === 1) return "Ngày mai";

  const date = parseIsoDate(iso);

  return `${WEEKDAY_LABELS[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1}`;
}
