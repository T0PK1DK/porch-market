import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Clock, Copy, MapPin, Pencil, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyNote } from "@/components/empty-note";
import { HoldForm } from "@/components/hold-form";
import { ConfirmTicket } from "@/components/hold-ticket";
import { LawNote } from "@/components/law-note";
import { PinKindChip, PinPrecisionNote } from "@/components/pin-badge";
import { Shell } from "@/components/shell";
import { StorefrontSkeleton } from "@/components/skeleton";
import { DietPills, OrderByPill, PickupPill, StockPill } from "@/components/status";
import { CommunityBadge, Cover, PayMakerLinks } from "@/components/vendor-card";
import { publicMapPin } from "@/lib/geo";
import {
  clampHoldQty,
  copyFailedNote,
  cutoffClosedNote,
  emptyShelfCopy,
  holdWatchDelayMs,
  missingPorchCopy,
  nextHoldFormState,
  productShelfHeading,
} from "@/lib/hold-ui";
import {
  bakeState,
  HOLDS_KEY,
  isHoldOpen,
  isHoldReady,
  isHoldStale,
  isOwnedByThisDevice,
  isSaved,
  loadBuyerName,
  loadHolds,
  loadSavedIds,
  loadVendors,
  paymentLinks,
  placeHold,
  priceLabel,
  remainingPlates,
  remainingStock,
  removeHold,
  removeVendor,
  SAMPLE_VENDORS,
  saveBuyerName,
  setHoldStatus,
  toggleSaved,
  vendorHasCommunityKitchen,
  vendorOffersOrderAhead,
  type Hold,
  type Vendor,
} from "@/lib/market";
import { neighborhoodFromLocation } from "@/lib/neighborhoods";
import { pickupBadge } from "@/lib/pickup";
import { relativeTime } from "@/lib/time";

export const Route = createFileRoute("/vendor/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Storefront — Porch Market` }, { name: "porch-id", content: params.id }],
  }),
  component: Storefront,
});

function Storefront() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>(SAMPLE_VENDORS);
  const [ready, setReady] = useState(false);
  const [holds, setHolds] = useState<Hold[]>([]);
  const [saved, setSaved] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [buyerName, setBuyerName] = useState("");
  const [note, setNote] = useState("");
  const [qty, setQty] = useState(1);
  const [formError, setFormError] = useState("");
  const [lastHold, setLastHold] = useState<Hold | null>(null);
  const [canceledNote, setCanceledNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [askingCancel, setAskingCancel] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState(0);
  const [watchNote, setWatchNote] = useState("");

  useEffect(() => {
    setVendors(loadVendors());
    const nextHolds = loadHolds().filter((hold) => hold.vendorId === id);
    setHolds(nextHolds);
    setSaved(isSaved(id, loadSavedIds()));
    setBuyerName(loadBuyerName());
    setReady(true);
  }, [id]);

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key && event.key !== HOLDS_KEY) return;
      setHolds(loadHolds().filter((hold) => hold.vendorId === id));
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [id]);

  const vendor = vendors.find((item) => item.id === id);
  const mine = isOwnedByThisDevice(vendor);
  const openHolds = holds.filter(isHoldOpen);
  const badge = vendor ? pickupBadge(vendor.pickup) : null;
  const platesLeft = vendor ? remainingPlates(vendor, openHolds) : null;
  const cutoff = vendor ? bakeState(vendor.orderBy, vendor.pickup) : null;

  useEffect(() => {
    if (!vendor) return;
    document.title = `${vendor.name} — Porch Market`;
  }, [vendor]);

  const nextDueAt = cutoff?.nextDue.getTime();
  useEffect(() => {
    if (!cutoff?.accepting || nextDueAt == null) return;
    const delay = holdWatchDelayMs(new Date(nextDueAt));
    if (delay == null || delay <= 0) return;
    const timer = window.setTimeout(() => setNowTick((n) => n + 1), delay);
    return () => window.clearTimeout(timer);
  }, [cutoff?.accepting, nextDueAt, nowTick]);

  useEffect(() => {
    if (!vendor || !activeId) return;
    const product = vendor.products.find((item) => item.id === activeId);
    if (!product) return;
    const left = remainingStock(
      product,
      holds.filter((holdItem) => holdItem.vendorId === id && isHoldOpen(holdItem)),
    );
    const next = nextHoldFormState({
      remaining: left,
      accepting: cutoff?.accepting ?? true,
      qty,
    });
    if (next.shouldClose) {
      setActiveId(null);
      setWatchNote("");
      setFormError(next.note ?? "");
      return;
    }
    if (next.qty !== qty) setQty(next.qty);
    if (next.note) setWatchNote(next.note);
  }, [vendor, activeId, holds, cutoff?.accepting, id, nowTick, qty]);

  if (!ready) {
    return (
      <Shell>
        <StorefrontSkeleton />
      </Shell>
    );
  }

  if (!vendor) {
    const missing = missingPorchCopy();
    return (
      <Shell>
        <div className="max-w-lg pt-16">
          <EmptyNote copy={missing} />
        </div>
      </Shell>
    );
  }

  const porch = vendor;
  const mapPin = publicMapPin(porch);
  const orderAhead = vendorOffersOrderAhead(porch);

  function hold(productId: string) {
    const product = porch.products.find((item) => item.id === productId);
    if (!product) return;
    const result = placeHold({ vendor: porch, product, buyerName, note, qty });
    setHolds(result.holds.filter((item) => item.vendorId === id));
    if (!result.hold) {
      setFormError(result.error);
      return;
    }
    saveBuyerName(buyerName);
    setLastHold(result.hold);
    setCanceledNote("");
    setActiveId(null);
    setNote("");
    setQty(1);
    setFormError("");
    setAskingCancel(null);
    window.requestAnimationFrame(() => {
      document.getElementById(`hold-ticket-${result.hold.id}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }

  function cancelHold(holdId: string) {
    const next = removeHold(holdId).filter((item) => item.vendorId === id);
    setHolds(next);
    if (lastHold?.id === holdId) {
      setCanceledNote(`Canceled the hold for ${lastHold.buyerName}.`);
      setLastHold(null);
    }
    setAskingCancel(null);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setCopyError("");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
      setCopyError(copyFailedNote());
    }
  }

  return (
    <Shell>
      <div className="pt-4">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All porches
        </Link>

        <Cover
          src={vendor.image}
          alt=""
          lazy={false}
          className="mt-1 aspect-[16/9] rounded-2xl sm:aspect-[2/1]"
        />

        <div className="mt-5 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-medium tracking-wide text-porch uppercase">{vendor.category}</p>
              <PickupPill badge={badge} />
            </div>
            {vendorHasCommunityKitchen(vendor) ? (
              <p className="mt-2">
                <span className="inline-flex items-center rounded-full bg-foam px-2.5 py-1 text-xs font-medium text-porch">
                  Community kitchen
                </span>
              </p>
            ) : null}
            <h1 className="mt-2 break-words font-display text-4xl text-ink sm:text-5xl">{vendor.name}</h1>
            <p className="mt-3 flex items-center gap-1.5 text-muted">
              <MapPin className="size-4" aria-hidden="true" />
              {neighborhoodFromLocation(vendor.location)} · {vendor.location}
            </p>
            {mapPin ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <PinKindChip kind={mapPin.kind} />
                <PinPrecisionNote pin={mapPin} />
                <Link to="/map" className="inline-flex min-h-11 items-center text-sm font-medium text-porch hover:underline">
                  See on the map
                </Link>
              </div>
            ) : null}
            <p className="mt-4 max-w-xl text-lg text-ink">{vendor.bio}</p>
          </div>
          <aside className="h-fit rounded-2xl border border-line bg-card p-4 shadow-card">
            <p className="flex items-start gap-2 text-sm text-ink">
              <Clock className="mt-0.5 size-4 shrink-0 text-porch" aria-hidden="true" />
              {vendor.pickup}
            </p>
            {cutoff ? (
              <div className="mt-3">
                <OrderByPill state={cutoff} />
                <p className="mt-1.5 text-sm text-muted">{cutoff.detail}</p>
              </div>
            ) : null}
            {platesLeft != null ? (
              <p className="mt-3 text-sm text-ink">
                {platesLeft} {platesLeft === 1 ? "plate" : "plates"} the kitchen can still cover this week.
              </p>
            ) : null}
            <p className="mt-3 text-sm text-muted">
              {orderAhead
                ? "Order ahead, then pay in the shop when the bag is ready. Nothing is charged here."
                : "A hold is a name on a box. Pay at pickup — nothing is charged here."}
            </p>
            {vendorHasCommunityKitchen(vendor) ? (
              <p className="mt-3 text-sm text-muted">
                Some plates here are free, pay what you can, or already covered by a neighbor.
              </p>
            ) : null}
            <PayMakerLinks links={paymentLinks(vendor.payments)} />
            <div className="mt-4 flex flex-col items-start gap-1">
              <button
                type="button"
                aria-pressed={saved}
                className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink"
                onClick={() => setSaved(toggleSaved(vendor.id).includes(vendor.id))}
              >
                <Star className={`size-4 ${saved ? "fill-mango text-mango" : "text-muted"}`} aria-hidden="true" />
                {saved ? "Saved on this phone" : "Save this porch"}
              </button>
              <button
                type="button"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink"
                onClick={copyLink}
              >
                <Copy className="size-4" aria-hidden="true" />
                {copied ? "Link copied" : "Copy porch link"}
              </button>
              {copyError ? (
                <p role="status" className="text-sm text-mango">
                  {copyError}
                </p>
              ) : null}
              {mine && (
                <>
                  <Link
                    to="/create"
                    search={{ edit: vendor.id }}
                    className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-porch"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                    Edit this porch
                  </Link>
                  {confirmRemove ? (
                    <div className="rounded-xl bg-foam px-3 py-2">
                      <p className="text-sm text-ink">Remove this porch from this device?</p>
                      <div className="mt-2 flex gap-3">
                        <button
                          type="button"
                          className="inline-flex min-h-11 items-center text-sm font-medium text-mango"
                          onClick={() => {
                            removeVendor(vendor.id);
                            navigate({ to: "/" });
                          }}
                        >
                          Yes, remove it
                        </button>
                        <button
                          type="button"
                          className="inline-flex min-h-11 items-center text-sm font-medium text-ink"
                          onClick={() => setConfirmRemove(false)}
                        >
                          Keep it
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-ink"
                      onClick={() => setConfirmRemove(true)}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Remove this porch from this device
                    </button>
                  )}
                </>
              )}
            </div>
          </aside>
        </div>

        {canceledNote && !lastHold && (
          <p role="status" className="mt-6 rounded-2xl bg-foam px-4 py-3 text-sm text-ink">
            {canceledNote}
          </p>
        )}

        {mine && openHolds.length > 0 ? (
          <section className="mt-8 rounded-2xl border border-line bg-card p-4 shadow-card">
            <h2 className="font-display text-2xl text-ink">Kitchen tickets</h2>
            <p className="mt-1 text-sm text-muted">Names on boxes for this porch. Mark picked up when they go out the door.</p>
            <ol className="mt-3 space-y-2">
              {openHolds.map((item) => (
                <li key={item.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-foam px-3 py-2">
                  <div>
                    <p className="break-words font-medium text-ink">
                      {item.qty > 1 ? `${item.qty} × ` : ""}
                      {item.productName}
                    </p>
                    <p className="break-words text-sm text-muted">
                      {item.buyerName}
                      {item.note ? ` — ${item.note}` : ""} · {relativeTime(item.createdAt)}
                      {isHoldReady(item) ? " · ready for pickup" : ""}
                      {isHoldStale(item) ? " · older than a week" : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {orderAhead && item.status === "open" ? (
                      <button
                        type="button"
                        className="inline-flex min-h-11 items-center text-sm font-medium text-porch"
                        onClick={() =>
                          setHolds(setHoldStatus(item.id, "ready_for_pickup").filter((holdItem) => holdItem.vendorId === id))
                        }
                      >
                        Ready for pickup
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center text-sm font-medium text-porch"
                      onClick={() => setHolds(setHoldStatus(item.id, "picked_up").filter((holdItem) => holdItem.vendorId === id))}
                    >
                      Picked up
                    </button>
                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center text-sm font-medium text-ink"
                      onClick={() => cancelHold(item.id)}
                    >
                      Cancel
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <h2 className="mt-8 font-display text-3xl text-ink">{productShelfHeading()}</h2>
        {cutoff && !cutoff.accepting ? (
          <p className="mt-2 rounded-2xl bg-foam px-4 py-3 text-sm text-ink">
            {cutoff.label}. {cutoffClosedNote(cutoff)}
          </p>
        ) : null}
        {formError && !activeId ? (
          <p role="status" className="mt-2 rounded-2xl bg-foam px-4 py-3 text-sm text-ink">
            {formError}
          </p>
        ) : null}
        {vendor.products.length === 0 ? <EmptyNote copy={emptyShelfCopy()} compact /> : null}
        <ul className="mt-4 grid gap-3">
          {vendor.products.map((product, index) => {
            const open = activeId === product.id;
            const productHolds = openHolds.filter((holdItem) => holdItem.productId === product.id);
            const left = remainingStock(product, openHolds);
            const soldOut = left === 0;
            const closed = cutoff != null && !cutoff.accepting;
            const justHeld = lastHold?.productId === product.id ? lastHold : null;
            return (
              <li key={product.id} className="rounded-2xl border border-line bg-card p-4 shadow-card sm:p-5">
                <div className="flex gap-4">
                  <div className="photo-frame w-20 shrink-0 self-start sm:w-24">
                    <Cover
                      src={product.image}
                      alt=""
                      width={160}
                      height={160}
                      lazy={index > 0}
                      className="aspect-square"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="min-w-0 line-clamp-2 break-words font-display text-xl leading-tight text-ink">
                        {product.name}
                      </h3>
                      <span className="price-tag shrink-0 text-sm">{priceLabel(product)}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <CommunityBadge offer={product.communityOffer} />
                      <StockPill remaining={left} />
                    </div>
                    {open ? null : (
                      <>
                        <p className="mt-1 text-sm text-muted">{product.desc}</p>
                        {product.readyNote ? <p className="ready-note mt-1 text-sm text-ink">{product.readyNote}</p> : null}
                        <DietPills notes={product.dietNotes} />
                      </>
                    )}
                    {soldOut ? (
                      <p className="mt-3 text-sm text-muted">Spoken for this week</p>
                    ) : closed ? (
                      <p className="mt-3 text-sm text-muted">{cutoffClosedNote(cutoff)}</p>
                    ) : open ? null : (
                      <button
                        type="button"
                        className="mt-3 inline-flex min-h-11 items-center rounded-full bg-porch px-4 text-sm font-medium text-paper hover:bg-porch-deep"
                        aria-expanded={false}
                        onClick={() => {
                          setActiveId(product.id);
                          setQty(clampHoldQty(1, left));
                          setFormError("");
                          setWatchNote("");
                        }}
                      >
                        {orderAhead ? "Order ahead" : "Hold for pickup"}
                      </button>
                    )}
                  </div>
                </div>

                {open ? (
                  <HoldForm
                    product={product}
                    remaining={left}
                    orderAhead={orderAhead}
                    buyerName={buyerName}
                    note={note}
                    qty={qty}
                    formError={formError}
                    watchNote={watchNote}
                    onBuyerName={setBuyerName}
                    onNote={setNote}
                    onQty={setQty}
                    onClose={() => {
                      setActiveId(null);
                      setFormError("");
                      setWatchNote("");
                    }}
                    onSubmit={() => hold(product.id)}
                  />
                ) : null}

                {justHeld ? (
                  <ConfirmTicket
                    hold={justHeld}
                    pickup={vendor.pickup}
                    orderAhead={orderAhead}
                    payments={paymentLinks(vendor.payments)}
                    product={product}
                    askingCancel={askingCancel === justHeld.id}
                    onAskCancel={() => setAskingCancel(justHeld.id)}
                    onKeep={() => setAskingCancel(null)}
                    onCancel={() => cancelHold(justHeld.id)}
                  />
                ) : null}

                {productHolds.filter((item) => item.id !== justHeld?.id).length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {productHolds
                      .filter((item) => item.id !== justHeld?.id)
                      .map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start justify-between gap-3 rounded-xl bg-paper px-3 py-2 text-sm"
                      >
                        <span className="min-w-0 break-words">
                          <span className="font-medium">{item.buyerName}</span>
                          {item.qty > 1 ? ` · ${item.qty}` : ""}
                          {item.note ? ` — ${item.note}` : ""}
                          {isHoldReady(item) ? " · ready for pickup" : ""}
                          {isHoldStale(item) ? " · older than a week" : ""}
                        </span>
                        <button
                          type="button"
                          className="inline-flex min-h-11 shrink-0 items-center text-sm font-medium text-porch hover:underline"
                          onClick={() => cancelHold(item.id)}
                        >
                          Cancel hold
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-8">
          <LawNote />
        </div>
      </div>
    </Shell>
  );
}
