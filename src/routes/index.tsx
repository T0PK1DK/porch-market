import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Shell } from "@/components/shell";
import { Cover, VendorCard } from "@/components/vendor-card";
import { CATEGORIES, loadVendors, SAMPLE_VENDORS, type Category, type Vendor } from "@/lib/market";

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
    body: "Name the kitchen, say where you are, and list what is actually coming out of the oven.",
  },
  {
    n: "02",
    title: "Neighbors browse",
    body: "People nearby filter by bread, honey, eggs, heat — whatever they want this week.",
  },
  {
    n: "03",
    title: "They ask to hold",
    body: "A hold is a name on a box, not a checkout. You hand it off at pickup. No fee.",
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

  const featured = SAMPLE_VENDORS[0];

  return (
    <Shell>
      <section className="grid items-center gap-8 pt-8 pb-4 md:grid-cols-[1.15fr_0.85fr] md:pt-12 md:pb-8">
        <div>
          <span className="mb-5 block h-1 w-10 rounded-full bg-mango" aria-hidden="true" />
          <p className="text-sm font-medium tracking-wide text-porch">South Florida · cottage kitchens</p>
          <h1 className="mt-3 font-display text-4xl leading-[1.08] font-medium text-ink sm:text-5xl">
            Sell from the porch.
            <span className="mt-1 block text-porch">Get found on the block.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            Free pages for home bakers, honey makers, and cottage food kitchens. No monthly fee.
            Pickup only — neighbors come to you.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/create"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-porch px-5 text-sm font-medium text-paper hover:bg-porch-deep"
            >
              Open your porch
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a
              href="#vendors"
              className="inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium text-ink ring-1 ring-line hover:bg-foam"
            >
              Browse nearby
            </a>
          </div>
        </div>
        <Link
          to="/vendor/$id"
          params={{ id: featured.id }}
          className="group block overflow-hidden rounded-2xl border border-line bg-card shadow-card"
        >
          <Cover
            src={featured.image}
            alt="Country sourdough loaves on a linen cloth"
            className="aspect-[5/4] md:aspect-[4/5]"
          />
          <div className="flex items-end justify-between gap-3 p-4">
            <div>
              <p className="text-xs font-medium tracking-wide text-mango uppercase">On the block</p>
              <p className="font-display text-2xl text-ink">{featured.name}</p>
              <p className="text-sm text-muted">Saturday porch · Miami Beach</p>
            </div>
            <span className="text-sm font-medium text-porch group-hover:underline">Visit</span>
          </div>
        </Link>
      </section>

      <section id="vendors" className="scroll-mt-24 pt-6">
        <div className="rounded-2xl border border-line bg-card p-3 shadow-card sm:p-4">
          <label className="flex min-h-11 items-center gap-2 px-1">
            <Search className="size-5 shrink-0 text-muted" aria-hidden="true" />
            <span className="sr-only">Search porches</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search loaves, honey, a neighborhood…"
              className="w-full bg-transparent text-base text-ink outline-none placeholder:text-muted"
            />
          </label>
        </div>

        <div
          className="mt-4 flex gap-2 overflow-x-auto pb-1"
          role="group"
          aria-label="Category"
        >
          <FilterChip on={category === "All"} onClick={() => setCategory("All")}>
            All
          </FilterChip>
          {CATEGORIES.map((item) => (
            <FilterChip key={item} on={category === item} onClick={() => setCategory(item)}>
              {item}
            </FilterChip>
          ))}
        </div>

        <div className="mt-6 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-3xl text-ink">Vendors near you</h2>
          <p className="text-sm text-muted tabular-nums">
            {shown.length} {shown.length === 1 ? "porch" : "porches"}
          </p>
        </div>

        {shown.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-line bg-card px-5 py-10 text-center">
            <p className="font-display text-2xl text-ink">Nothing on the block matches.</p>
            <p className="mt-2 text-muted">Try another kitchen, or open yours.</p>
            <Link
              to="/create"
              className="mt-5 inline-flex min-h-11 items-center rounded-full bg-porch px-5 text-sm font-medium text-paper hover:bg-porch-deep"
            >
              Open a porch
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {shown.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-16 grid gap-8 border-t border-line pt-10 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="font-display text-3xl text-ink">How a porch works</h2>
          <p className="mt-3 text-muted">
            Built for cottage food, not a full shop. Florida makers still need proper labels and
            a kitchen that meets state rules — this is a listing, not a license.
          </p>
        </div>
        <ol className="grid gap-5">
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
        "shrink-0 rounded-full px-4 py-2.5 text-sm font-medium " +
        (on ? "bg-porch text-paper" : "bg-foam text-ink hover:bg-line")
      }
    >
      {children}
    </button>
  );
}
