export function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getTodayIso(): string {
  return formatIsoDate(new Date());
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

export function toDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, date.getDate());
}

export function addYears(date: Date, amount: number): Date {
  return new Date(date.getFullYear() + amount, date.getMonth(), date.getDate());
}

// Số ngày từ hôm nay tới ngày iso (dương = tương lai, âm = quá khứ).
export function daysFromToday(iso: string): number {
  const today = toDateOnly(new Date()).getTime();
  const target = parseIsoDate(iso).getTime();

  return Math.round((target - today) / 86_400_000);
}
