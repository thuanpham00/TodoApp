import { parseIsoDate, toDateOnly } from "../../../utils/date";

const SHORT_MONTH_LABELS = [
  "Th1",
  "Th2",
  "Th3",
  "Th4",
  "Th5",
  "Th6",
  "Th7",
  "Th8",
  "Th9",
  "Th10",
  "Th11",
  "Th12",
];

export function isOverdue(dueDate: string): boolean {
  return parseIsoDate(dueDate).getTime() < toDateOnly(new Date()).getTime();
}

// "14 Th6" — định dạng badge ngày trên card Kanban.
export function formatDueBadge(dueDate: string): string {
  const parsed = parseIsoDate(dueDate);
  const day = parsed.getDate();
  const month = SHORT_MONTH_LABELS[parsed.getMonth()];

  return `${day} ${month}`;
}
