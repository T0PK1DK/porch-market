const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function relativeTime(iso: string, now = Date.now()): string {
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return "";
  const delta = then - now;
  const abs = Math.abs(delta);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (abs < 45 * MINUTE) {
    const minutes = Math.round(delta / MINUTE) || (delta < 0 ? -1 : 1);
    return rtf.format(minutes, "minute");
  }
  if (abs < 36 * HOUR) {
    return rtf.format(Math.round(delta / HOUR), "hour");
  }
  if (abs < 21 * DAY) {
    return rtf.format(Math.round(delta / DAY), "day");
  }
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(then);
}
