import type { DietNote } from "@/lib/market";
import type { PickupBadge } from "@/lib/pickup";

export function PickupPill({ badge }: { badge: PickupBadge | null }) {
  if (!badge) return null;
  const tone =
    badge.kind === "now"
      ? "bg-porch text-paper"
      : badge.kind === "today"
        ? "bg-mango text-paper"
        : "bg-foam text-ink";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${tone}`}>
      {badge.label}
    </span>
  );
}

export function StockPill({ remaining }: { remaining: number | null }) {
  if (remaining == null) return null;
  if (remaining <= 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-foam px-2.5 py-0.5 text-[11px] font-medium text-muted">
        Spoken for this week
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-foam px-2.5 py-0.5 text-[11px] font-medium text-ink">
      {remaining} left this week
    </span>
  );
}

export function DietPills({ notes }: { notes?: DietNote[] }) {
  if (!notes?.length) return null;
  return (
    <ul className="mt-1.5 flex flex-wrap gap-1.5">
      {notes.map((note) => (
        <li
          key={note}
          className="inline-flex items-center rounded-full bg-paper px-2 py-0.5 text-[11px] text-muted ring-1 ring-line"
        >
          {note}
        </li>
      ))}
    </ul>
  );
}
