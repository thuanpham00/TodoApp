import { addDays, formatIsoDate, getTodayIso } from "./date";

export const WEEKDAY_HEADERS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export interface CalendarCell {
  iso: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

// Sinh lưới tháng (tuần bắt đầu từ Thứ 2), gồm ngày tràn của tháng kề để đủ ô.
export function getMonthMatrix(year: number, month: number): CalendarCell[] {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // Mon = 0 … Sun = 6
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const gridStart = addDays(firstOfMonth, -startOffset);
  const todayIso = getTodayIso();

  return Array.from({ length: totalCells }, (_, index) => {
    const date = addDays(gridStart, index);

    return {
      iso: formatIsoDate(date),
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: formatIsoDate(date) === todayIso,
    };
  });
}

export function getMonthLabel(year: number, month: number): string {
  return `Tháng ${month + 1} ${year}`;
}

export function getPreviousMonth(year: number, month: number) {
  return month === 0
    ? { year: year - 1, month: 11 }
    : { year, month: month - 1 };
}

export function getNextMonth(year: number, month: number) {
  return month === 11
    ? { year: year + 1, month: 0 }
    : { year, month: month + 1 };
}
