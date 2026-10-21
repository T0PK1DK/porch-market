const DAY_INDEX: Record<string, number> = {
  sun: 0,
  sunday: 0,
  sundays: 0,
  mon: 1,
  monday: 1,
  mondays: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  tuesdays: 2,
  wed: 3,
  wednesday: 3,
  wednesdays: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  thursdays: 4,
  fri: 5,
  friday: 5,
  fridays: 5,
  sat: 6,
  saturday: 6,
  saturdays: 6,
};

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export type PickupWindow = {
  days: number[];
  startMinutes: number | null;
  endMinutes: number | null;
  raw: string;
};

function uniqueDays(days: number[]): number[] {
  return [...new Set(days)].filter((day) => day >= 0 && day <= 6).sort((a, b) => a - b);
}

function parseClock(raw: string, preferPm: boolean): number | null {
  const cleaned = raw.trim().toLowerCase().replace(/\s+/g, "");
  if (!cleaned) return null;
  if (cleaned === "noon" || cleaned === "midday") return 12 * 60;
  if (cleaned === "midnight") return 0;
  const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)?$/);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = match[2] ? Number(match[2]) : 0;
  if (!Number.isFinite(hour) || hour > 24 || minute > 59) return null;
  const mer = match[3];
  if (mer === "pm" && hour < 12) hour += 12;
  if (mer === "am" && hour === 12) hour = 0;
  if (!mer && preferPm && hour > 0 && hour < 12) hour += 12;
  if (hour === 24) hour = 0;
  return hour * 60 + minute;
}

function parseTimeRange(text: string): { startMinutes: number | null; endMinutes: number | null } {
  const after = text.match(/\bafter\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?|noon|midnight)\b/i);
  if (after) {
    return { startMinutes: parseClock(after[1], false), endMinutes: null };
  }

  const range = text.match(
    /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?|noon|midnight)\s*[–—-]\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?|noon|midnight)/i,
  );
  if (range) {
    const endHasMer = /am|pm|noon|midnight/i.test(range[2]);
    const startHasMer = /am|pm|noon|midnight/i.test(range[1]);
    const endMinutes = parseClock(range[2], /evening|night|pm/i.test(text));
    const startMinutes = parseClock(range[1], Boolean(endHasMer && /pm/i.test(range[2]) && !startHasMer));
    return { startMinutes, endMinutes };
  }

  const single = text.match(/\b(?:at|from)?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)|noon|midnight)\b/i);
  if (single) {
    const startMinutes = parseClock(single[1], false);
    return { startMinutes, endMinutes: startMinutes == null ? null : startMinutes + 120 };
  }

  if (/\bevenings?\b/i.test(text)) {
    return { startMinutes: 17 * 60, endMinutes: 21 * 60 };
  }

  return { startMinutes: null, endMinutes: null };
}

export function parsePickup(raw: string): PickupWindow {
  const text = raw.trim();
  const days: number[] = [];
  if (/\bweekends?\b/i.test(text)) days.push(0, 6);
  if (/\bweekdays?\b/i.test(text)) days.push(1, 2, 3, 4, 5);

  const tokens = text.toLowerCase().match(/[a-z]+/g) ?? [];
  for (const token of tokens) {
    const day = DAY_INDEX[token];
    if (day !== undefined) days.push(day);
  }

  const { startMinutes, endMinutes } = parseTimeRange(text);
  return {
    days: uniqueDays(days),
    startMinutes,
    endMinutes,
    raw: text,
  };
}

function minutesOnDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function isPickupDay(window: PickupWindow, date: Date): boolean {
  if (!window.days.length) return false;
  return window.days.includes(date.getDay());
}

export function isOpenNow(window: PickupWindow, now = new Date()): boolean {
  if (!isPickupDay(window, now)) return false;
  const clock = minutesOnDay(now);
  if (window.startMinutes != null && clock < window.startMinutes) return false;
  if (window.endMinutes != null && clock > window.endMinutes) return false;
  return true;
}

export function isOpenToday(raw: string, now = new Date()): boolean {
  return isPickupDay(parsePickup(raw), now);
}

export function formatClock(minutes: number): string {
  const wrapped = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hour24 = Math.floor(wrapped / 60);
  const minute = wrapped % 60;
  const mer = hour24 >= 12 ? "pm" : "am";
  const hour = hour24 % 12 || 12;
  return minute === 0 ? `${hour}${mer}` : `${hour}:${String(minute).padStart(2, "0")}${mer}`;
}

export function nextPickupLabel(raw: string, now = new Date()): string | null {
  const window = parsePickup(raw);
  if (!window.days.length) return null;

  if (isPickupDay(window, now)) {
    const clock = minutesOnDay(now);
    if (window.endMinutes != null && clock > window.endMinutes) {
      // fall through to the next listed day
    } else if (isOpenNow(window, now)) {
      return window.endMinutes != null ? `Open now until ${formatClock(window.endMinutes)}` : "Open now";
    } else if (window.startMinutes != null && clock < window.startMinutes) {
      return `Opens today at ${formatClock(window.startMinutes)}`;
    } else {
      return "Open today";
    }
  }

  for (let offset = 1; offset <= 7; offset += 1) {
    const day = (now.getDay() + offset) % 7;
    if (!window.days.includes(day)) continue;
    const label = offset === 1 ? "Tomorrow" : DAY_LABELS[day];
    if (window.startMinutes != null) return `${label} at ${formatClock(window.startMinutes)}`;
    return label;
  }
  return null;
}

export type PickupBadge = {
  kind: "now" | "today" | "next";
  label: string;
};

export function pickupBadge(raw: string, now = new Date()): PickupBadge | null {
  const window = parsePickup(raw);
  if (!window.days.length) return null;
  if (isOpenNow(window, now)) {
    return { kind: "now", label: nextPickupLabel(raw, now) ?? "Open now" };
  }
  if (isPickupDay(window, now) && (window.endMinutes == null || minutesOnDay(now) <= window.endMinutes)) {
    return { kind: "today", label: nextPickupLabel(raw, now) ?? "Open today" };
  }
  const next = nextPickupLabel(raw, now);
  return next ? { kind: "next", label: next } : null;
}
