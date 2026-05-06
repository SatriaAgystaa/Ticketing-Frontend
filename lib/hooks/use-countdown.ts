"use client";

import { useEffect, useState } from "react";

interface CountdownResult {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string;
}

/** Countdown timer to a target date */
export function useCountdown(targetDate: string | Date | null): CountdownResult {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    if (!targetDate) return;

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1_000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

function calculateTimeLeft(targetDate: string | Date | null): CountdownResult {
  if (!targetDate) {
    return { hours: 0, minutes: 0, seconds: 0, isExpired: true, formatted: "00:00" };
  }

  const diff = new Date(targetDate).getTime() - Date.now();

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isExpired: true, formatted: "00:00" };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const parts: string[] = [];
  if (hours > 0) parts.push(String(hours).padStart(2, "0"));
  parts.push(String(minutes).padStart(2, "0"));
  parts.push(String(seconds).padStart(2, "0"));

  return { hours, minutes, seconds, isExpired: false, formatted: parts.join(":") };
}
