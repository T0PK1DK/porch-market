import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Shell } from "@/components/shell";
import { VendorCard, WeekFoodCard } from "@/components/vendor-card";
import {
  CATEGORIES,
  isOwnedByThisDevice,
  loadVendors,
  SAMPLE_VENDORS,
  thisWeeksFood,
  type Category,
  type Vendor,
} from "@/lib/market";

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
    body: "People nearby filter by bread, honey, eggs, heat — whatever they want this week.",
  },
  {
    n: "03",
    title: "They ask to hold",
    body: "A hold is a name on a box, paid at the door. Nothing is charged here.",
  },
];

function Home() {
  const [vendors, setVendors] = useState<Vendor[]>(SAMPLE_VENDORS);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");

  useEffect(() => {
    setVendors(loadVendors());
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vendors.filter((vendor) => {
      if (category !== "All" && vendor.category !== category) return false;
      if (!q) return true;
      const haystack = [
        vendor.name,
        vendor.location,
        vendor.category,
        vendor.bio,
        vendor.pickup,
        ...vendor.products.map((p) => `${p.name} ${p.desc}`),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [vendors, query, category]);

  const weekly = useMemo(() => thisWeeksFood(shown), [shown]);
  const filtering = query.trim().length > 0 || category !== "All";

  function clearFilters() {
    setQuery("");
    setCategory("All");
  }

  return (
    <Shell>
      <p className="pt-3 text-sm text-muted">
        Cottage kitchens on the block — browse, then ask for a pickup hold.
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
        {CATEGORIES.map((item) => (
          <FilterChip key={item} on={category === item} onClick={() => setCategory(item)}>
            {item}
          </FilterChip>
        ))}
      </div>

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
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-xl text-ink">Porches</h2>
          <p className="text-sm text-muted tabular-nums">
            {shown.length} {shown.length === 1 ? "porch" : "porches"}
          </p>
        </div>

        {shown.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-line bg-card px-5 py-8 text-center">
            <p className="font-display text-2xl text-ink">Nothing on the block matches.</p>
            <p className="mt-2 text-sm text-muted">
              {query.trim() && category !== "All"
                ? `No porches match “${query.trim()}” in ${category}.`
                : query.trim()
                  ? `No porches match “${query.trim()}”.`
                  : category !== "All"
                    ? `No ${category.toLowerCase()} porches right now.`
                    : "Try another kitchen, or open yours."}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {filtering ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium text-ink ring-1 ring-line hover:bg-foam"
                >
                  Clear filters
                </button>
              ) : null}
              <Link
                to="/create"
                search={{}}
                className="inline-flex min-h-11 items-center rounded-full bg-porch px-5 text-sm font-medium text-paper hover:bg-porch-deep"
              >
                Open a porch
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {shown.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} owned={isOwnedByThisDevice(vendor)} />
            ))}
          </div>
        )}
      </section>

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
