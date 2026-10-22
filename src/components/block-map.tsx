import { NEIGHBORHOODS } from "@/lib/neighborhoods";

export function BlockMap({
  active,
  counts,
  onSelect,
}: {
  active: string | null;
  counts: Record<string, number>;
  onSelect: (name: string | null) => void;
}) {
  return (
    <section className="rounded-2xl border border-line bg-card p-3 shadow-card" aria-label="Neighborhoods">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg text-ink">The block</h2>
        <p className="text-xs text-muted">Filter by neighborhood</p>
      </div>
      <svg viewBox="0 0 100 100" className="mt-2 h-44 w-full sm:h-auto sm:max-h-80 [@media(max-height:480px)]:h-24" role="img" aria-label="South Florida neighborhoods">
        <rect x="0" y="0" width="100" height="100" rx="8" fill="#efe7d6" />
        <path d="M78 8c8 6 14 16 16 28 2 14-4 26-14 36-6 6-8 14-6 22" fill="none" stroke="#c9d6cf" strokeWidth="6" />
        <path d="M8 70c10 4 22 8 34 6 12-2 20 6 28 14" fill="none" stroke="#d7c9b0" strokeWidth="5" />
        {NEIGHBORHOODS.map((place) => {
          const count = counts[place.name] ?? 0;
          const on = active === place.name;
          return (
            <g key={place.id}>
              <circle
                cx={place.x}
                cy={place.y}
                r={on ? 7.2 : 5.6}
                fill={on ? "#1e4630" : "#fffdf8"}
                stroke={on ? "#163626" : "#1e4630"}
                strokeWidth="1.4"
              />
              <text
                x={place.x}
                y={place.y + 1.2}
                textAnchor="middle"
                fontSize="4.2"
                fontWeight="600"
                fill={on ? "#f3eee4" : "#1e4630"}
              >
                {count}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          aria-pressed={active == null}
          onClick={() => onSelect(null)}
          className={
            "inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium " +
            (active == null ? "bg-porch text-paper" : "bg-foam text-ink hover:bg-line")
          }
        >
          All neighborhoods
        </button>
        {NEIGHBORHOODS.map((place) => {
          const count = counts[place.name] ?? 0;
          if (!count) return null;
          const on = active === place.name;
          return (
            <button
              key={place.id}
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(on ? null : place.name)}
              className={
                "inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium " +
                (on ? "bg-porch text-paper" : "bg-foam text-ink hover:bg-line")
              }
            >
              {place.name}
              <span className="ml-1.5 tabular-nums opacity-80">{count}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
