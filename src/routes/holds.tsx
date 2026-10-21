import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Shell } from "@/components/shell";
import {
  isHoldOpen,
  isHoldReady,
  isHoldStale,
  isOwnedByThisDevice,
  loadHolds,
  loadVendors,
  removeHold,
  SAMPLE_VENDORS,
  setHoldStatus,
  vendorOffersOrderAhead,
  type Hold,
  type Vendor,
} from "@/lib/market";
import { relativeTime } from "@/lib/time";

export const Route = createFileRoute("/holds")({
  head: () => ({
    meta: [{ title: "Holds — Porch Market" }],
  }),
  component: HoldsPage,
});

function HoldsPage() {
  const [vendors, setVendors] = useState<Vendor[]>(SAMPLE_VENDORS);
  const [holds, setHolds] = useState<Hold[]>([]);

  useEffect(() => {
    setVendors(loadVendors());
    setHolds(loadHolds());
  }, []);

  const mine = useMemo(() => vendors.filter(isOwnedByThisDevice), [vendors]);
  const mineIds = useMemo(() => new Set(mine.map((vendor) => vendor.id)), [mine]);
  const kitchen = holds.filter((hold) => mineIds.has(hold.vendorId) && isHoldOpen(hold));
  const neighbor = holds.filter((hold) => !mineIds.has(hold.vendorId) && isHoldOpen(hold));
  const done = holds.filter((hold) => !isHoldOpen(hold));

  return (
    <Shell>
      <div className="max-w-2xl pt-4">
        <h1 className="font-display text-3xl text-ink">Hold board</h1>
        <p className="mt-2 text-sm text-muted">
          Names on boxes for this phone. A kitchen you opened here sees incoming tickets. Holds you
          placed on any porch stay listed until you cancel them or mark them picked up.
        </p>

        <section className="mt-6">
          <h2 className="font-display text-2xl text-ink">Kitchen tickets</h2>
          {kitchen.length === 0 ? (
            <p className="mt-2 rounded-2xl bg-foam px-4 py-3 text-sm text-ink">
              {mine.length === 0
                ? "Open a porch on this phone to see incoming holds."
                : "No open holds on your porches yet."}
            </p>
          ) : (
            <TicketList
              holds={kitchen}
              vendors={vendors}
              onReady={(id) => setHolds(setHoldStatus(id, "ready_for_pickup"))}
              onPicked={(id) => setHolds(setHoldStatus(id, "picked_up"))}
              onCancel={(id) => setHolds(removeHold(id))}
            />
          )}
        </section>

        <section className="mt-8">
          <h2 className="font-display text-2xl text-ink">Your holds</h2>
          {neighbor.length === 0 ? (
            <p className="mt-2 rounded-2xl bg-foam px-4 py-3 text-sm text-ink">
              Ask a porch to set something aside. It will show up here.
            </p>
          ) : (
            <TicketList holds={neighbor} vendors={vendors} onCancel={(id) => setHolds(removeHold(id))} />
          )}
        </section>

        {done.length > 0 ? (
          <section className="mt-8">
            <h2 className="font-display text-2xl text-ink">Already handled</h2>
            <ul className="mt-3 space-y-2">
              {done.map((hold) => (
                <li key={hold.id} className="rounded-2xl border border-line bg-card px-4 py-3 text-sm text-muted">
                  <span className="font-medium text-ink">{hold.productName}</span>
                  {" · "}
                  {hold.buyerName}
                  {" · "}
                  {hold.status === "picked_up" ? "picked up" : hold.status === "ready_for_pickup" ? "was ready" : hold.status}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </Shell>
  );
}

function TicketList({
  holds,
  vendors = [],
  onReady,
  onPicked,
  onCancel,
}: {
  holds: Hold[];
  vendors?: Vendor[];
  onReady?: (id: string) => void;
  onPicked?: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  return (
    <ol className="mt-3 space-y-2">
      {holds.map((hold) => {
        const vendor = vendors.find((item) => item.id === hold.vendorId);
        const canReady = onReady && vendorOffersOrderAhead(vendor) && hold.status === "open";
        return (
          <li key={hold.id} className="rounded-2xl border border-line bg-card p-4 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl text-ink">
                  {hold.qty > 1 ? `${hold.qty} × ` : ""}
                  {hold.productName}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {hold.buyerName}
                  {hold.note ? ` — ${hold.note}` : ""}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {hold.vendorName} · {relativeTime(hold.createdAt)}
                  {isHoldReady(hold) ? " · ready for pickup — pay in the shop" : ""}
                  {isHoldStale(hold) ? " · older than a week" : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/vendor/$id"
                  params={{ id: hold.vendorId }}
                  className="inline-flex min-h-11 items-center text-sm font-medium text-porch"
                >
                  Open porch
                </Link>
                {canReady ? (
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center text-sm font-medium text-porch"
                    onClick={() => onReady(hold.id)}
                  >
                    Ready for pickup
                  </button>
                ) : null}
                {onPicked ? (
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center text-sm font-medium text-ink"
                    onClick={() => onPicked(hold.id)}
                  >
                    Picked up
                  </button>
                ) : null}
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center text-sm font-medium text-mango"
                  onClick={() => onCancel(hold.id)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
