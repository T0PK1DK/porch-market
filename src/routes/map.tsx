import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { PinKindChip, PinPrecisionNote } from "@/components/pin-badge";
import { Shell } from "@/components/shell";
import { StreetMap } from "@/components/street-map";
import { Cover } from "@/components/vendor-card";
import { publicMapPins, type PublicMapPin } from "@/lib/geo";
import { loadVendors, SAMPLE_VENDORS, type Vendor } from "@/lib/market";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [{ title: "Map — Porch Market" }],
  }),
  component: MapPage,
});

type MapFilter = "all" | "home" | "mobile" | "shop" | "here";

export function MapPage() {
  const [vendors, setVendors] = useState<Vendor[]>(SAMPLE_VENDORS);
  const [filter, setFilter] = useState<MapFilter>("all");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setVendors(loadVendors());
  }, []);

  const pins = useMemo(() => publicMapPins(vendors), [vendors]);
  const shown = useMemo(() => {
    return pins.filter((pin) => {
      if (filter === "here") return pin.hereNow;
      if (filter === "all") return true;
      return pin.kind === filter;
    });
  }, [pins, filter]);

  const active = shown.find((pin) => pin.vendorId === activeId) ?? shown[0] ?? null;
  const vendor = active ? vendors.find((item) => item.id === active.vendorId) : undefined;

  return (
    <Shell>
      <div className="pt-4">
        <h1 className="font-display text-3xl text-ink">Street map</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Home porches sit in the neighborhood, not on a street. Trucks and shops that opted in can
          drop an exact pin. OpenStreetMap tiles — no paid map, no API key.
        </p>

        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto" role="group" aria-label="Pin type">
          <FilterChip on={filter === "all"} onClick={() => setFilter("all")}>
            All pins
          </FilterChip>
          <FilterChip on={filter === "home"} onClick={() => setFilter("home")}>
            Home porches
          </FilterChip>
          <FilterChip on={filter === "mobile"} onClick={() => setFilter("mobile")}>
            Trucks
          </FilterChip>
          <FilterChip on={filter === "shop"} onClick={() => setFilter("shop")}>
            Shops
          </FilterChip>
          <FilterChip on={filter === "here"} onClick={() => setFilter("here")}>
            Here now
          </FilterChip>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="h-[min(28rem,calc(100dvh-14rem))] overflow-hidden rounded-2xl border border-line bg-card shadow-card sm:h-[min(32rem,calc(100dvh-12rem))]">
            <StreetMap
              pins={shown}
              activeId={active?.vendorId}
              onSelect={setActiveId}
            />
          </div>
          <aside className="rounded-2xl border border-line bg-card p-4 shadow-card">
            {active && vendor ? (
              <SelectedPin pin={active} vendor={vendor} />
            ) : (
              <p className="text-sm text-muted">
                {pins.length === 0
                  ? "No one has opted into the map on this phone yet."
                  : "No pins match that filter. Try All pins."}
              </p>
            )}
            {shown.length > 1 ? (
              <ul className="mt-4 space-y-2 border-t border-line pt-3">
                {shown.map((pin) => (
                  <li key={pin.vendorId}>
                    <button
                      type="button"
                      onClick={() => setActiveId(pin.vendorId)}
                      className={
                        "flex w-full min-h-11 items-center justify-between gap-3 rounded-xl px-3 text-left text-sm " +
                        (pin.vendorId === active?.vendorId ? "bg-foam text-ink" : "text-ink hover:bg-foam")
                      }
                    >
                      <span className="truncate font-medium">{pin.name}</span>
                      <PinKindChip kind={pin.kind} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </aside>
        </div>
      </div>
    </Shell>
  );
}

function SelectedPin({ pin, vendor }: { pin: PublicMapPin; vendor: Vendor }) {
  return (
    <div>
      <Cover src={vendor.image} alt="" lazy={false} className="aspect-[16/10] rounded-xl" />
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <PinKindChip kind={pin.kind} />
        {pin.orderAhead ? (
          <span className="inline-flex items-center rounded-full bg-mango px-2.5 py-0.5 text-[11px] font-medium text-paper">
            Order ahead
          </span>
        ) : null}
      </div>
      <h2 className="mt-2 font-display text-2xl text-ink">{vendor.name}</h2>
      <p className="mt-1 text-sm text-muted">
        {pin.neighborhood}
        {pin.precision === "neighborhood" ? " · approximate" : ""}
      </p>
      <PinPrecisionNote pin={pin} />
      <p className="mt-2 text-sm text-ink">{vendor.pickup}</p>
      <Link
        to="/vendor/$id"
        params={{ id: vendor.id }}
        className="mt-4 inline-flex min-h-11 items-center rounded-full bg-porch px-4 text-sm font-medium text-paper hover:bg-porch-deep"
      >
        {pin.orderAhead ? "Order ahead" : "Visit porch"}
      </Link>
    </div>
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
