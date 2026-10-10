interface Greeting {
  text: string;
  emoji: string;
}

// Lời chào theo giờ trong ngày: sáng (5–11) / chiều (12–17) / tối (còn lại).
export function getGreeting(hour: number): Greeting {
  if (hour >= 5 && hour < 12) return { text: "Good Morning", emoji: "🌅" };
  if (hour >= 12 && hour < 18) return { text: "Good Afternoon", emoji: "☀️" };

  return { text: "Good Evening", emoji: "🌙" };
}

// "HH:mm" khung 24h.
export function formatClock(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}
