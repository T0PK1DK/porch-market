import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { EmptyNote } from "@/components/empty-note";
import { BoardTicket } from "@/components/hold-ticket";
import { Shell } from "@/components/shell";
import { TicketSkeleton } from "@/components/skeleton";
import { holdsEmptyCopy } from "@/lib/hold-ui";
import {
  isHoldOpen,
  isOwnedByThisDevice,
  loadHolds,
  loadVendors,
  removeHold,
  SAMPLE_VENDORS,
  setHoldStatus,
  type Hold,
  type Vendor,
} from "@/lib/market";

export const Route = createFileRoute("/holds")({
  head: () => ({
    meta: [{ title: "Holds — Porch Market" }],
  }),
  component: HoldsPage,
});

function HoldsPage() {
  const [vendors, setVendors] = useState<Vendor[]>(SAMPLE_VENDORS);
  const [holds, setHolds] = useState<Hold[]>([]);
  const [askingCancel, setAskingCancel] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setVendors(loadVendors());
    setHolds(loadHolds());
    setReady(true);
  }, []);

  const mine = useMemo(() => vendors.filter(isOwnedByThisDevice), [vendors]);
  const mineIds = useMemo(() => new Set(mine.map((vendor) => vendor.id)), [mine]);
  const kitchen = holds.filter((hold) => mineIds.has(hold.vendorId) && isHoldOpen(hold));
  const neighbor = holds.filter((hold) => !mineIds.has(hold.vendorId) && isHoldOpen(hold));
  const done = holds.filter((hold) => !isHoldOpen(hold));
  const empty = holdsEmptyCopy(mine.length > 0);

  return (
    <Shell>
      <div className="max-w-2xl pt-4">
        <h1 className="font-display text-3xl text-ink">Hold board</h1>
        <p className="mt-2 text-sm text-muted">
          Names on boxes for this phone. Holds you placed stay here until you pick them up or let
          the kitchen have them back.
        </p>

        <section className="mt-6">
          <h2 className="font-display text-2xl text-ink">Your holds</h2>
          {!ready ? (
            <div className="mt-3" aria-busy="true">
              <TicketSkeleton />
            </div>
          ) : neighbor.length === 0 ? (
            <EmptyNote copy={empty.yours} compact />
          ) : (
            <TicketList
              holds={neighbor}
              vendors={vendors}
              askingCancel={askingCancel}
              onAskCancel={setAskingCancel}
              onCancel={(id) => {
                setHolds(removeHold(id));
                setAskingCancel(null);
              }}
            />
          )}
        </section>

        {ready && mine.length > 0 ? (
          <section className="mt-8">
            <h2 className="font-display text-2xl text-ink">Kitchen tickets</h2>
            {kitchen.length === 0 ? (
              empty.kitchen ? <EmptyNote copy={empty.kitchen} compact /> : null
            ) : (
              <TicketList
                holds={kitchen}
                vendors={vendors}
                askingCancel={askingCancel}
                onAskCancel={setAskingCancel}
                onReady={(id) => setHolds(setHoldStatus(id, "ready_for_pickup"))}
                onPicked={(id) => setHolds(setHoldStatus(id, "picked_up"))}
                onCancel={(id) => {
                  setHolds(removeHold(id));
                  setAskingCancel(null);
                }}
              />
            )}
          </section>
        ) : ready ? (
          <p className="mt-8 text-sm text-muted">
            Baking this week?{" "}
            <Link to="/create" search={{}} className="font-medium text-porch hover:underline">
              Open a porch
            </Link>{" "}
            to see incoming tickets.
          </p>
        ) : null}

        {done.length > 0 ? (
          <section className="mt-8">
            <h2 className="font-display text-2xl text-ink">Already handled</h2>
            <ul className="mt-3 space-y-2">
              {done.map((hold) => (
                <li key={hold.id} className="break-words rounded-2xl border border-line bg-card px-4 py-3 text-sm text-muted">
                  <span className="font-medium text-ink">{hold.productName}</span>
                  {" · "}
                  {hold.buyerName}
                  {" · "}
                  {hold.status === "picked_up" ? "picked up" : hold.status === "ready_for_pickup" ? "was ready" : "canceled"}
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
  askingCancel,
  onAskCancel,
  onReady,
  onPicked,
  onCancel,
}: {
  holds: Hold[];
  vendors?: Vendor[];
  askingCancel: string | null;
  onAskCancel: (id: string | null) => void;
  onReady?: (id: string) => void;
  onPicked?: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  return (
    <ol className="mt-3 space-y-3">
      {holds.map((hold) => {
        const vendor = vendors.find((item) => item.id === hold.vendorId);
        return (
          <BoardTicket
            key={hold.id}
            hold={hold}
            vendor={vendor}
            onReady={onReady}
            onPicked={onPicked}
            onCancel={onCancel}
            askingCancel={askingCancel === hold.id}
            onAskCancel={() => onAskCancel(hold.id)}
            onKeep={() => onAskCancel(null)}
          />
        );
      })}
    </ol>
  );
}
