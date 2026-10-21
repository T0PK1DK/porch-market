import { formatClock, parsePickup } from "./pickup.ts";

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

export type BakeCutoff = {
  weekday: number;
  minutes: number;
};

export type BakeState = {
  accepting: boolean;
  cutoff: BakeCutoff;
  nextDue: Date;
  reopenAt: Date;
  label: string;
  detail: string;
};

export function parseOrderBy(raw: string): BakeCutoff | null {
  const text = raw.trim();
  if (!text) return null;

  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  let weekday: number | null = null;
  for (const word of words) {
    if (DAY_INDEX[word] !== undefined) weekday = DAY_INDEX[word];
  }
  if (weekday == null) return null;

  let minutes: number | null = null;
  if (/\bmidnight\b/i.test(text)) minutes = 0;
  else if (/\bnoon\b/i.test(text)) minutes = 12 * 60;
  else {
    const match = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (!match) return null;
    let hour = Number(match[1]);
    const minute = match[2] ? Number(match[2]) : 0;
    if (!Number.isFinite(hour) || hour > 24 || minute > 59) return null;
    const mer = match[3]?.toLowerCase();
    if (mer === "pm" && hour < 12) hour += 12;
    if (mer === "am" && hour === 12) hour = 0;
    if (!mer && hour > 0 && hour < 12) hour += 12;
    if (hour === 24) hour = 0;
    minutes = hour * 60 + minute;
  }
  if (minutes == null || minutes < 0 || minutes > 23 * 60 + 59) return null;
  return { weekday, minutes };
}

export function formatOrderBy(cutoff: BakeCutoff): string {
  return `${DAY_LABELS[cutoff.weekday]} ${formatClock(cutoff.minutes)}`;
}

export function migrateOrderBy(raw: unknown): BakeCutoff | undefined {
  if (raw == null || raw === "") return undefined;
  if (typeof raw === "string") return parseOrderBy(raw) ?? undefined;
  if (typeof raw !== "object") return undefined;
  const value = raw as Partial<BakeCutoff>;
  if (!Number.isInteger(value.weekday) || value.weekday! < 0 || value.weekday! > 6) return undefined;
  if (!Number.isInteger(value.minutes) || value.minutes! < 0 || value.minutes! > 23 * 60 + 59) return undefined;
  return { weekday: value.weekday!, minutes: value.minutes! };
}

export function orderByEquals(a?: BakeCutoff, b?: BakeCutoff): boolean {
  return (a?.weekday ?? -1) === (b?.weekday ?? -1) && (a?.minutes ?? -1) === (b?.minutes ?? -1);
}

export function occurrenceOnWeek(cutoff: BakeCutoff, now: Date, weekOffset: number): Date {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  date.setDate(date.getDate() + (cutoff.weekday - date.getDay()) + weekOffset * 7);
  date.setHours(Math.floor(cutoff.minutes / 60), cutoff.minutes % 60, 0, 0);
  return date;
}

export function mostRecentCutoff(cutoff: BakeCutoff, now: Date): Date {
  const thisWeek = occurrenceOnWeek(cutoff, now, 0);
  return thisWeek.getTime() <= now.getTime() ? thisWeek : occurrenceOnWeek(cutoff, now, -1);
}

export function nextCutoffAt(cutoff: BakeCutoff, now: Date): Date {
  const thisWeek = occurrenceOnWeek(cutoff, now, 0);
  return thisWeek.getTime() > now.getTime() ? thisWeek : occurrenceOnWeek(cutoff, now, 1);
}

export function lastPickupEndAfter(pickup: string, after: Date): Date {
  const window = parsePickup(pickup);
  if (!window.days.length) {
    const end = new Date(after.getFullYear(), after.getMonth(), after.getDate(), 23, 59, 0, 0);
    return end.getTime() >= after.getTime() ? end : new Date(after.getTime() + 12 * 60 * 60 * 1000);
  }

  let last: Date | null = null;
  for (let offset = 0; offset < 7; offset += 1) {
    const day = new Date(after.getFullYear(), after.getMonth(), after.getDate() + offset);
    if (!window.days.includes(day.getDay())) continue;
    const endMin = window.endMinutes ?? 23 * 60 + 59;
    const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(endMin / 60), endMin % 60, 0, 0);
    if (end.getTime() < after.getTime()) continue;
    last = end;
  }
  return last ?? new Date(after.getTime() + 12 * 60 * 60 * 1000);
}

export function bakeState(
  orderBy: BakeCutoff | undefined,
  pickup: string,
  now = new Date(),
): BakeState | null {
  if (!orderBy) return null;
  const closedFrom = mostRecentCutoff(orderBy, now);
  const reopenAt = lastPickupEndAfter(pickup, closedFrom);
  const accepting = now.getTime() > reopenAt.getTime();
  const nextDue = nextCutoffAt(orderBy, now);
  const when = formatOrderBy(orderBy);
  return {
    accepting,
    cutoff: orderBy,
    nextDue,
    reopenAt,
    label: accepting ? `Order by ${when}` : "Too late for this week's bake",
    detail: accepting
      ? `Ask by ${when} for this week's bake.`
      : `The kitchen takes holds again after pickup. Next order-by is ${when}.`,
  };
}

export function isBakeAccepting(
  orderBy: BakeCutoff | undefined,
  pickup: string,
  now = new Date(),
): boolean {
  const state = bakeState(orderBy, pickup, now);
  return state ? state.accepting : true;
}

export function bakeHoldError(
  orderBy: BakeCutoff | undefined,
  pickup: string,
  now = new Date(),
): string | null {
  const state = bakeState(orderBy, pickup, now);
  if (!state || state.accepting) return null;
  return `Too late for this week's bake. Next order-by is ${formatOrderBy(orderBy!)}.`;
}
