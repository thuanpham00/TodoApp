/**
 * Format ước lượng phút thành chuỗi hiển thị thân thiện.
 * - null / <= 0 → rỗng
 * - < 60 phút → "≈ X phút"
 * - >= 60 phút → "≈ Xh" hoặc "≈ Xh Yp"
 */
export function formatEstimate(minutes: number | null): string {
  if (minutes === null || minutes <= 0) return "";
  if (minutes < 60) return `≈ ${minutes} phút`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `≈ ${h}h` : `≈ ${h}h ${m}p`;
}
