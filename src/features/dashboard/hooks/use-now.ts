import { useEffect, useState } from "react";

// Đồng hồ cập nhật mỗi phút. Canh đúng đầu phút để nhảy số không bị lệch.
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let intervalId: number;

    const msToNextMinute = (60 - new Date().getSeconds()) * 1000;
    const timeoutId = window.setTimeout(() => {
      setNow(new Date());
      intervalId = window.setInterval(() => setNow(new Date()), 60_000);
    }, msToNextMinute);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

  return now;
}
