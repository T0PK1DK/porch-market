import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Clock, Package } from "lucide-react";
import { Shell } from "@/components/shell";
import { Cover } from "@/components/vendor-card";
import {
  isHoldOpen,
  isHoldReady,
  isHoldStale,
  isOwnedByThisDevice,
  loadHolds,
  loadVendors,
  money,
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
    meta: [{ title: "Your holds — Porch Market" }],
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
        <h1 className="font-display text-3xl text-ink">Your holds</h1>
        <p className="mt-2 text-sm text-muted">
          Boxes you’ve asked a kitchen to set aside from this phone. Nothing is charged here — you
          pay the maker when you pick up.
        </p>

        <section className="mt-5" aria-label="Holds you placed">
          {neighbor.length === 0 ? (
            <EmptyBox
              title="No boxes set aside yet."
              body="Find a porch you like and tap “Hold one for me”. It’ll wait here with the pickup time."
              cta={{ to: "/", label: "Browse porches" }}
            />
          ) : (
            <>
              <p className="hand text-xl text-porch">
                {neighbor.length} {neighbor.length === 1 ? "box" : "boxes"} waiting on you
              </p>
              <TicketList
                holds={neighbor}
                vendors={vendors}
                onCancel={(id) => setHolds(removeHold(id))}
              />
            </>
          )}
        </section>

        {mine.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-display text-2xl text-ink">Kitchen tickets</h2>
            <p className="mt-1 text-sm text-muted">
              Neighbors asking your porch to set something aside. Mark them picked up when they go
              out the door.
            </p>
            {kitchen.length === 0 ? (
              <EmptyBox
                title="No tickets yet."
                body="When a neighbor holds something from your porch, it shows up here."
              />
            ) : (
              <TicketList
                holds={kitchen}
                vendors={vendors}
                kitchen
                onReady={(id) => setHolds(setHoldStatus(id, "ready_for_pickup"))}
                onPicked={(id) => setHolds(setHoldStatus(id, "picked_up"))}
                onCancel={(id) => setHolds(removeHold(id))}
              />
            )}
          </section>
        ) : null}

        {done.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-display text-2xl text-ink">Already picked up</h2>
            <ul className="mt-3 space-y-2">
              {done.map((hold) => (
                <li
                  key={hold.id}
                  className="rounded-2xl border border-line bg-card px-4 py-3 text-sm text-muted"
                >
                  <span className="font-medium text-ink">
                    {hold.qty > 1 ? `${hold.qty} × ` : ""}
                    {hold.productName}
                  </span>
                  {" · "}
                  {hold.vendorName}
                  {" · "}
                  {hold.status === "picked_up"
                    ? "picked up"
                    : hold.status === "canceled"
                      ? "canceled"
                      : hold.status}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {mine.length === 0 ? (
          <p className="mt-10 text-sm text-muted">
            Selling from your kitchen?{" "}
            <Link to="/create" search={{}} className="font-medium text-porch hover:underline">
              Open a porch
            </Link>{" "}
            and neighbors’ holds will land here as tickets.
          </p>
        ) : null}
      </div>
    </Shell>
  );
}

function EmptyBox({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: { to: "/"; label: string };
}) {
  return (
    <div className="mt-3 rounded-2xl border border-dashed border-line bg-card px-5 py-7 text-center">
      <Package className="mx-auto size-8 text-kraft-deep/60" strokeWidth={1.5} aria-hidden="true" />
      <p className="mt-2 font-display text-xl text-ink">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{body}</p>
      {cta ? (
        <Link
          to={cta.to}
          className="mt-4 inline-flex min-h-11 items-center rounded-full bg-porch px-5 text-sm font-medium text-paper hover:bg-porch-deep"
        >
          {cta.label}
        </Link>
      ) : null}
    </div>
  );
}

function TicketList({
  holds,
  vendors = [],
  kitchen = false,
  onReady,
  onPicked,
  onCancel,
}: {
  holds: Hold[];
  vendors?: Vendor[];
  kitchen?: boolean;
  onReady?: (id: string) => void;
  onPicked?: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState<string | null>(null);
  return (
    <ol className="mt-3 space-y-3">
      {holds.map((hold) => {
        const vendor = vendors.find((item) => item.id === hold.vendorId);
        const product = vendor?.products.find((item) => item.id === hold.productId);
        const orderAhead = vendorOffersOrderAhead(vendor);
        const canReady = onReady && orderAhead && hold.status === "open";
        const total =
          product && !product.communityOffer && product.price > 0
            ? money(product.price * hold.qty)
            : null;
        return (
          <li key={hold.id} className="ticket rounded-2xl px-4 py-4 sm:px-5">
            <div className="flex gap-3">
              {product ? (
                <Cover
                  src={product.image}
                  alt=""
                  width={128}
                  height={128}
                  className="size-16 shrink-0 rotate-[-2deg] rounded-lg ring-4 ring-paper shadow-sm"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-display text-xl leading-tight text-ink">
                    {hold.qty > 1 ? `${hold.qty} × ` : ""}
                    {hold.productName}
                  </p>
                  {total ? <span className="price-tag price-tag-sm">{total}</span> : null}
                </div>
                <p className="mt-0.5 text-sm text-muted">
                  {kitchen ? (
                    <>
                      For <span className="font-medium text-ink">{hold.buyerName}</span>
                    </>
                  ) : (
                    <Link
                      to="/vendor/$id"
                      params={{ id: hold.vendorId }}
                      className="font-medium text-porch hover:underline"
                    >
                      {hold.vendorName}
                    </Link>
                  )}
                  {" · held "}
                  {relativeTime(hold.createdAt)}
                </p>
                {hold.note ? (
                  <p className="hand mt-1 text-lg leading-snug text-ink">“{hold.note}”</p>
                ) : null}
                {isHoldReady(hold) || isHoldStale(hold) ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {isHoldReady(hold) ? (
                      <span className="inline-flex items-center rounded-full bg-porch px-2.5 py-0.5 text-[11px] font-medium text-paper">
                        Ready for pickup — pay in the shop
                      </span>
                    ) : null}
                    {isHoldStale(hold) ? (
                      <span className="inline-flex items-center rounded-full bg-foam px-2.5 py-0.5 text-[11px] font-medium text-muted">
                        Older than a week
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
            {!kitchen && vendor ? (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-foam px-3 py-2">
                <Clock className="mt-1 size-4 shrink-0 text-porch" aria-hidden="true" />
                <div>
                  <p className="text-[11px] font-medium tracking-wide text-muted uppercase">
                    Come by
                  </p>
                  <p className="font-display text-lg leading-snug text-ink">{vendor.pickup}</p>
                </div>
              </div>
            ) : null}
            {confirming === hold.id ? (
              <div className="mt-3 flex flex-wrap items-center gap-x-3 rounded-xl bg-foam px-3 py-1">
                <p className="text-sm text-ink">
                  {kitchen ? "Cancel this ticket?" : "Let the kitchen have it back?"}
                </p>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center text-sm font-medium text-mango-deep"
                  onClick={() => {
                    setConfirming(null);
                    onCancel(hold.id);
                  }}
                >
                  Yes, cancel
                </button>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center text-sm font-medium text-ink"
                  onClick={() => setConfirming(null)}
                >
                  Keep it
                </button>
              </div>
            ) : (
              <div className="mt-2 flex flex-wrap items-center gap-x-4 border-t border-dashed border-line pt-1">
                {canReady ? (
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center text-sm font-medium text-porch"
                    onClick={() => onReady(hold.id)}
                  >
                    Mark ready
                  </button>
                ) : null}
                {onPicked ? (
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center text-sm font-medium text-porch"
                    onClick={() => onPicked(hold.id)}
                  >
                    Picked up
                  </button>
                ) : null}
                {kitchen ? (
                  <Link
                    to="/vendor/$id"
                    params={{ id: hold.vendorId }}
                    className="inline-flex min-h-11 items-center text-sm font-medium text-ink"
                  >
                    Open porch
                  </Link>
                ) : null}
                <button
                  type="button"
                  className="ml-auto inline-flex min-h-11 items-center text-sm font-medium text-muted hover:text-ink"
                  onClick={() => setConfirming(hold.id)}
                >
                  {kitchen ? "Cancel ticket" : "Cancel hold"}
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
