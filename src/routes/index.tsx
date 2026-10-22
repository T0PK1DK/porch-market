import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BlockMap } from "@/components/block-map";
import { LawNote } from "@/components/law-note";
import { Shell } from "@/components/shell";
import { EmptyNote } from "@/components/empty-note";
import { VendorCard, WeekFoodCard } from "@/components/vendor-card";
import { browseEmptyCopy } from "@/lib/hold-ui";
import {
  CATEGORIES,
  COMMUNITY_FILTER,
  isOwnedByThisDevice,
  loadHolds,
  loadSavedIds,
  loadVendors,
  rankVendors,
  SAMPLE_VENDORS,
  sortVendors,
  thisWeeksFood,
  toggleSaved,
  vendorMatchesFilter,
  type Hold,
  type MarketFilter,
  type Vendor,
} from "@/lib/market";
import { neighborhoodFromLocation } from "@/lib/neighborhoods";
import type { MarketSort } from "@/lib/search";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Porch Market — Free local storefronts" }],
  }),
  component: Home,
});

const STEPS = [
  {
    n: "01",
    title: "Open a porch",
    body: "Name the kitchen, say when to pick up, and list what’s coming off the stove.",
  },
  {
    n: "02",
    title: "Neighbors browse",
    body: "People nearby filter by farm, fresh, baked, a meal, or who’s open today.",
  },
  {
    n: "03",
    title: "They ask to hold",
    body: "A hold is a name on a box, paid at the door. Nothing is charged here.",
  },
];

function Home() {
  const [vendors, setVendors] = useState<Vendor[]>(SAMPLE_VENDORS);
  const [holds, setHolds] = useState<Hold[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<MarketFilter>("All");
  const [neighborhood, setNeighborhood] = useState<string | null>(null);
  const [sort, setSort] = useState<MarketSort>("neighborhood");

  useEffect(() => {
    setVendors(loadVendors());
    setHolds(loadHolds());
    setSavedIds(loadSavedIds());
  }, []);

  const extras = useMemo(() => ({ savedIds }), [savedIds]);

  const matched = useMemo(
    () => rankVendors(
      vendors.filter((vendor) => vendorMatchesFilter(vendor, category, query, extras)),
      query,
    ),
    [vendors, query, category, extras],
  );

  const neighborhoodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const vendor of matched) {
      const name = neighborhoodFromLocation(vendor.location);
      counts[name] = (counts[name] ?? 0) + 1;
    }
    return counts;
  }, [matched]);

  const shown = useMemo(() => {
    const located = neighborhood
      ? matched.filter((vendor) => neighborhoodFromLocation(vendor.location) === neighborhood)
      : matched;
    return sortVendors(located, sort);
  }, [matched, neighborhood, sort]);

  const weekly = useMemo(() => thisWeeksFood(shown, category === "Saved" || category === "Open today" ? "All" : category), [shown, category]);
  const filtering = query.trim().length > 0 || category !== "All" || neighborhood != null;

  function clearFilters() {
    setQuery("");
    setCategory("All");
    setNeighborhood(null);
  }

  const grouped = useMemo(() => {
    if (sort !== "neighborhood") return [{ name: "", items: shown }];
    const groups: { name: string; items: Vendor[] }[] = [];
    for (const vendor of shown) {
      const name = neighborhoodFromLocation(vendor.location);
      const last = groups[groups.length - 1];
      if (!last || last.name !== name) groups.push({ name, items: [vendor] });
      else last.items.push(vendor);
    }
    return groups;
  }, [shown, sort]);

  return (
    <Shell>
      <p className="site-intro pt-3 text-sm text-muted">
        Cottage kitchens on the block — browse, save a porch, then ask for a pickup hold.
      </p>

      <label className="mt-3 flex min-h-11 items-center gap-2 rounded-2xl border border-line bg-card px-3 shadow-card focus-within:border-porch">
        <Search className="size-5 shrink-0 text-muted" aria-hidden="true" />
        <span className="sr-only">Search porches</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search loaves, honey, a neighborhood…"
          className="w-full bg-transparent py-2.5 text-base text-ink outline-none placeholder:text-muted"
        />
        {query.trim() ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="inline-flex min-h-11 shrink-0 items-center text-sm font-medium text-ink"
          >
            Clear
          </button>
        ) : null}
      </label>

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-0.5" role="group" aria-label="Category">
        <FilterChip on={category === "All"} onClick={() => setCategory("All")}>
          All
        </FilterChip>
        <FilterChip on={category === "Open today"} onClick={() => setCategory("Open today")}>
          Open today
        </FilterChip>
        <FilterChip on={category === "Saved"} onClick={() => setCategory("Saved")}>
          Saved
        </FilterChip>
        {CATEGORIES.map((item) => (
          <FilterChip key={item} on={category === item} onClick={() => setCategory(item)}>
            {item}
          </FilterChip>
        ))}
        <FilterChip on={category === COMMUNITY_FILTER} onClick={() => setCategory(COMMUNITY_FILTER)}>
          {COMMUNITY_FILTER}
        </FilterChip>
      </div>

      {category !== "Saved" || shown.length > 0 ? (
        <div className="mt-3">
          <BlockMap active={neighborhood} counts={neighborhoodCounts} onSelect={setNeighborhood} />
          <p className="mt-2 text-sm text-muted">
            Neighborhood filter only — home pins stay approximate.{" "}
            <Link to="/map" className="font-medium text-porch hover:underline">
              Open the street map
            </Link>
          </p>
        </div>
      ) : null}

      {weekly.length > 0 && (
        <section className="mt-4" aria-labelledby="week-heading">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="week-heading" className="font-display text-xl text-ink">
              This week
            </h2>
            <p className="text-xs text-muted">Swipe for more</p>
          </div>
          <div className="no-scrollbar mt-2 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
            {weekly.map((item, index) => (
              <WeekFoodCard key={`${item.vendorId}-${item.product.id}`} item={item} lazy={index > 2} />
            ))}
          </div>
        </section>
      )}

      <section id="vendors" className="scroll-mt-20 pt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-xl text-ink">Porches</h2>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-muted">
              Sort
              <select
                className="min-h-11 rounded-full border border-line bg-card px-3 text-sm text-ink outline-none focus:border-porch"
                value={sort}
                onChange={(e) => setSort(e.target.value as MarketSort)}
              >
                <option value="neighborhood">Neighborhood</option>
                <option value="open">Open today first</option>
                <option value="name">Name</option>
              </select>
            </label>
            <p className="text-sm text-muted tabular-nums">
              {shown.length} {shown.length === 1 ? "porch" : "porches"}
            </p>
          </div>
        </div>

        {shown.length === 0 ? (
          <div>
            <EmptyNote
              copy={browseEmptyCopy({ query, category, neighborhood })}
              onAction={category === "Saved" ? () => setCategory("All") : undefined}
            />
            {filtering && category !== "Saved" ? (
              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium text-ink ring-1 ring-line hover:bg-foam"
                >
                  Clear filters
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-3 space-y-6">
            {grouped.map((group) => (
              <div key={group.name || "all"}>
                {group.name ? (
                  <h3 className="mb-2 font-display text-lg text-ink">{group.name}</h3>
                ) : null}
                <div className="grid gap-3 sm:grid-cols-2">
                  {group.items.map((vendor) => (
                    <VendorCard
                      key={vendor.id}
                      vendor={vendor}
                      owned={isOwnedByThisDevice(vendor)}
                      saved={savedIds.includes(vendor.id)}
                      holds={holds.filter((hold) => hold.vendorId === vendor.id)}
                      onToggleSaved={(id) => setSavedIds(toggleSaved(id))}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {category === "Saved" && shown.length === 0 ? null : (
      <section className="mt-12 grid gap-6 border-t border-line pt-8 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="font-display text-3xl text-ink">How a porch works</h2>
          <p className="mt-3 text-muted">
            Built for cottage food, not a full shop. Florida makers still need proper labels and a
            kitchen that meets state rules — this is a listing, not a license.
          </p>
        </div>
        <ol className="grid gap-4">
          {STEPS.map((step) => (
            <li key={step.n} className="grid grid-cols-[auto_1fr] gap-4">
              <span className="font-display text-xl text-mango tabular-nums">{step.n}</span>
              <div>
                <h3 className="font-display text-xl text-ink">{step.title}</h3>
                <p className="mt-1 text-sm text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      )}

      <div className="mt-8">
        <LawNote />
      </div>
    </Shell>
  );
}

function FilterChip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={
        "inline-flex min-h-11 shrink-0 items-center rounded-full px-3.5 text-sm font-medium " +
        (on ? "bg-porch text-paper" : "bg-foam text-ink hover:bg-line")
      }
    >
      {children}
    </button>
  );
}
