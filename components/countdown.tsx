"use client";

import { useEffect, useState } from "react";

type Parts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getParts(date: string): Parts {
  const diff = Math.max(0, new Date(date).getTime() - Date.now());
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  return { days, hours, minutes, seconds };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function Countdown({ date }: { date: string }) {
  const [parts, setParts] = useState(() => getParts(date));

  useEffect(() => {
    const timer = window.setInterval(() => setParts(getParts(date)), 1000);
    return () => window.clearInterval(timer);
  }, [date]);

  return (
    <div className="countdown" aria-label="До свадьбы осталось">
      <div className="count-cell">
        <strong>{pad(parts.days)}</strong>
        <span>дней</span>
      </div>
      <div className="count-cell">
        <strong>{pad(parts.hours)}</strong>
        <span>часов</span>
      </div>
      <div className="count-cell">
        <strong>{pad(parts.minutes)}</strong>
        <span>минут</span>
      </div>
      <div className="count-cell">
        <strong>{pad(parts.seconds)}</strong>
        <span>секунд</span>
      </div>
    </div>
  );
}
