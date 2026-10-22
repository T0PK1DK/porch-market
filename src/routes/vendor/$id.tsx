import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Copy,
  MapPin,
  Minus,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LawNote } from "@/components/law-note";
import { PinKindChip, PinPrecisionNote } from "@/components/pin-badge";
import { Shell } from "@/components/shell";
import { DietPills, OrderByPill, PickupPill, StockPill } from "@/components/status";
import { CommunityBadge, Cover, PayMakerLinks } from "@/components/vendor-card";
import { publicMapPin } from "@/lib/geo";
import {
  bakeState,
  isHoldOpen,
  isHoldReady,
  isHoldStale,
  isOwnedByThisDevice,
  isSaved,
  money,
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
  type Product,
  type Vendor,
} from "@/lib/market";
import { neighborhoodFromLocation } from "@/lib/neighborhoods";
import { pickupBadge } from "@/lib/pickup";
import { relativeTime } from "@/lib/time";

function estimateTotal(product: Product, qty: number): string | null {
  if (product.communityOffer && product.communityOffer !== "Donation-backed") return null;
  if (!(product.price > 0)) return null;
  return money(product.price * qty);
}

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
  const [canceledNote, setCanceledNote] = useState<{ productId: string; text: string } | null>(
    null,
  );
  const confirmRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    setVendors(loadVendors());
    const nextHolds = loadHolds().filter((hold) => hold.vendorId === id);
    setHolds(nextHolds);
    setSaved(isSaved(id, loadSavedIds()));
    setBuyerName(loadBuyerName());
    setReady(true);
  }, [id]);

  const vendor = vendors.find((item) => item.id === id);
  const mine = isOwnedByThisDevice(vendor);
  const openHolds = holds.filter(isHoldOpen);
  const badge = vendor ? pickupBadge(vendor.pickup) : null;
  const platesLeft = vendor ? remainingPlates(vendor, openHolds) : null;
  const cutoff = vendor ? bakeState(vendor.orderBy, vendor.pickup) : null;
  const closed = cutoff != null && !cutoff.accepting;

  useEffect(() => {
    if (!lastHold) return;
    confirmRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    confirmRef.current?.focus({ preventScroll: true });
  }, [lastHold]);

  useEffect(() => {
    if (!vendor) return;
    document.title = `${vendor.name} — Porch Market`;
  }, [vendor]);

  if (!vendor && !ready) {
    return (
      <Shell>
        <p className="pt-16 text-muted">Looking up this porch…</p>
      </Shell>
    );
  }

  if (!vendor) {
    return (
      <Shell>
        <div className="max-w-lg pt-16">
          <h1 className="font-display text-4xl text-ink">That porch isn’t here.</h1>
          <p className="mt-3 text-muted">
            It may live in another browser. Porches you create stay on the device that made them.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-porch"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to the market
          </Link>
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
    setCanceledNote(null);
    setActiveId(null);
    setNote("");
    setQty(1);
    setFormError("");
  }

  function cancelHold(holdId: string) {
    const next = removeHold(holdId).filter((item) => item.vendorId === id);
    setHolds(next);
    if (lastHold?.id === holdId) {
      setCanceledNote({
        productId: lastHold.productId,
        text: `Canceled — ${lastHold.buyerName}’s box is back on the table.`,
      });
      setLastHold(null);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
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
              <p className="text-xs font-medium tracking-wide text-porch uppercase">
                {vendor.category}
              </p>
              <PickupPill badge={badge} />
            </div>
            {vendorHasCommunityKitchen(vendor) ? (
              <p className="mt-2">
                <span className="inline-flex items-center rounded-full bg-foam px-2.5 py-1 text-xs font-medium text-porch">
                  Community kitchen
                </span>
              </p>
            ) : null}
            <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">{vendor.name}</h1>
            <p className="mt-3 flex items-center gap-1.5 text-muted">
              <MapPin className="size-4" aria-hidden="true" />
              {neighborhoodFromLocation(vendor.location)} · {vendor.location}
            </p>
            {mapPin ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <PinKindChip kind={mapPin.kind} />
                <PinPrecisionNote pin={mapPin} />
                <Link to="/map" className="text-sm font-medium text-porch hover:underline">
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
                {platesLeft} {platesLeft === 1 ? "plate" : "plates"} the kitchen can still cover
                this week.
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
                <Star
                  className={`size-4 ${saved ? "fill-mango text-mango" : "text-muted"}`}
                  aria-hidden="true"
                />
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

        {mine && openHolds.length > 0 ? (
          <section className="mt-8 rounded-2xl border border-line bg-card p-4 shadow-card">
            <h2 className="font-display text-2xl text-ink">Kitchen tickets</h2>
            <p className="mt-1 text-sm text-muted">
              Names on boxes for this porch. Mark picked up when they go out the door.
            </p>
            <ol className="mt-3 space-y-2">
              {openHolds.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-foam px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-ink">
                      {item.qty > 1 ? `${item.qty} × ` : ""}
                      {item.productName}
                    </p>
                    <p className="text-sm text-muted">
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
                          setHolds(
                            setHoldStatus(item.id, "ready_for_pickup").filter(
                              (holdItem) => holdItem.vendorId === id,
                            ),
                          )
                        }
                      >
                        Mark ready
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center text-sm font-medium text-porch"
                      onClick={() =>
                        setHolds(
                          setHoldStatus(item.id, "picked_up").filter(
                            (holdItem) => holdItem.vendorId === id,
                          ),
                        )
                      }
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

        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 className="font-display text-3xl text-ink">On the table this week</h2>
          {closed ? null : (
            <p className="hand text-lg text-porch">
              {orderAhead ? "order ahead, pay in the shop" : "hold now, pay at pickup"}
            </p>
          )}
        </div>
        {closed && cutoff ? (
          <p className="mt-3 rounded-2xl border border-dashed border-mango/40 bg-card px-4 py-3 text-sm text-ink">
            <span className="font-medium">This week’s bake is closed.</span> {cutoff.detail}
          </p>
        ) : null}
        {vendor.products.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-line bg-card px-5 py-8 text-center">
            <p className="font-display text-2xl text-ink">Nothing on the table yet.</p>
            <p className="mt-2 text-sm text-muted">
              {mine
                ? "Add what you’re making this week so neighbors can hold a box."
                : "Check back closer to pickup day."}
            </p>
          </div>
        ) : null}
        <ul className="mt-4 space-y-3">
          {vendor.products.map((product, index) => {
            const open = activeId === product.id;
            const productHolds = openHolds.filter((holdItem) => holdItem.productId === product.id);
            const left = remainingStock(product, openHolds);
            const soldOut = left === 0;
            const maxQty = Math.max(1, Math.min(left ?? 12, 12));
            const total = estimateTotal(product, qty);
            const confirmed = lastHold?.productId === product.id ? lastHold : null;
            return (
              <li
                key={product.id}
                className="rounded-2xl border border-line bg-card p-4 shadow-card sm:p-5"
              >
                <div className="flex gap-4">
                  <Cover
                    src={product.image}
                    alt=""
                    width={160}
                    height={160}
                    lazy={index > 0}
                    className={`size-20 shrink-0 rotate-[-1.5deg] rounded-xl ring-4 ring-paper shadow-sm sm:size-28 ${soldOut ? "grayscale-[60%]" : ""}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="min-w-0 font-display text-xl leading-tight text-ink">
                        {product.name}
                      </h3>
                      <p className="price-tag shrink-0">{priceLabel(product)}</p>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <CommunityBadge offer={product.communityOffer} />
                      <StockPill remaining={left} />
                    </div>
                    <p className="mt-1.5 text-sm text-muted">{product.desc}</p>
                    {product.readyNote ? (
                      <p className="hand mt-1 text-lg leading-snug text-porch">
                        {product.readyNote}
                      </p>
                    ) : null}
                    <DietPills notes={product.dietNotes} />
                    {soldOut ? (
                      <p className="mt-3 text-sm font-medium text-muted">
                        All spoken for this week{closed ? "." : " — check back after pickup."}
                      </p>
                    ) : closed ? (
                      <p className="mt-3 text-sm font-medium text-muted">
                        Holds reopen after this week’s pickup.
                      </p>
                    ) : open ? null : (
                      <button
                        type="button"
                        className="mt-3 inline-flex min-h-11 items-center rounded-full bg-porch px-5 text-sm font-medium text-paper hover:bg-porch-deep"
                        aria-expanded={false}
                        onClick={() => {
                          setActiveId(product.id);
                          setQty(1);
                          setFormError("");
                        }}
                      >
                        {orderAhead ? "Order ahead" : "Hold one for me"}
                      </button>
                    )}
                  </div>
                </div>

                {open && (
                  <form
                    className="pop-in mt-4 rounded-xl bg-foam p-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      hold(product.id);
                    }}
                  >
                    <p className="hand text-xl leading-none text-porch">
                      {orderAhead ? "Your pickup order" : "Put a name on the box"}
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                      <label className="text-sm font-medium text-ink">
                        Your name
                        <input
                          className="mt-1.5 w-full rounded-xl border border-line bg-card px-3 py-3 text-base outline-none focus:border-porch"
                          value={buyerName}
                          onChange={(e) => {
                            setBuyerName(e.target.value);
                            if (formError) setFormError("");
                          }}
                          placeholder="So the kitchen knows whose box"
                          autoComplete="name"
                          aria-invalid={Boolean(formError) && !buyerName.trim()}
                          autoFocus={!buyerName}
                        />
                      </label>
                      <div className="text-sm font-medium text-ink">
                        <span id={`qty-${product.id}`}>How many</span>
                        <div
                          className="mt-1.5 flex h-[3.125rem] items-center rounded-xl border border-line bg-card"
                          role="group"
                          aria-labelledby={`qty-${product.id}`}
                        >
                          <button
                            type="button"
                            className="grid h-full w-12 place-items-center text-ink disabled:text-line"
                            aria-label="One fewer"
                            disabled={qty <= 1}
                            onClick={() => setQty((value) => Math.max(1, value - 1))}
                          >
                            <Minus className="size-4" aria-hidden="true" />
                          </button>
                          <output
                            className="min-w-8 flex-1 text-center text-base tabular-nums"
                            aria-live="polite"
                          >
                            {qty}
                          </output>
                          <button
                            type="button"
                            className="grid h-full w-12 place-items-center text-ink disabled:text-line"
                            aria-label="One more"
                            disabled={qty >= maxQty}
                            onClick={() => setQty((value) => Math.min(maxQty, value + 1))}
                          >
                            <Plus className="size-4" aria-hidden="true" />
                          </button>
                        </div>
                        {left != null ? (
                          <p className="mt-1 text-xs font-normal text-muted">
                            {left} left this week
                          </p>
                        ) : null}
                      </div>
                      <label className="text-sm font-medium text-ink sm:col-span-2">
                        Note for the kitchen{" "}
                        <span className="font-normal text-muted">(optional)</span>
                        <input
                          className="mt-1.5 w-full rounded-xl border border-line bg-card px-3 py-3 text-base outline-none focus:border-porch"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Sliced if you can, running a little late…"
                        />
                      </label>
                    </div>
                    {formError && (
                      <p
                        role="alert"
                        className="mt-3 rounded-lg bg-card px-3 py-2 text-sm font-medium text-mango-deep"
                      >
                        {formError}
                      </p>
                    )}
                    <p className="mt-3 text-sm text-muted">
                      {total
                        ? `About ${total}, paid ${orderAhead ? "in the shop" : "at pickup"}. Nothing is charged here.`
                        : `Nothing is charged here — settle up ${orderAhead ? "in the shop" : "at pickup"}.`}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="submit"
                        className="inline-flex min-h-11 items-center rounded-full bg-mango px-5 text-sm font-medium text-paper hover:bg-mango-deep"
                      >
                        {orderAhead
                          ? "Place pickup order"
                          : qty > 1
                            ? `Hold ${qty} for me`
                            : "Hold it for me"}
                      </button>
                      <button
                        type="button"
                        className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium text-ink hover:bg-card"
                        onClick={() => {
                          setActiveId(null);
                          setFormError("");
                        }}
                      >
                        Never mind
                      </button>
                    </div>
                  </form>
                )}

                {confirmed && (
                  <div
                    ref={confirmRef}
                    role="status"
                    tabIndex={-1}
                    className="ticket pop-in mt-4 rounded-xl px-5 py-4 text-ink outline-none"
                  >
                    <p className="flex items-center gap-2 text-sm font-medium text-porch">
                      <Check className="size-4" aria-hidden="true" />
                      Thanks, {confirmed.buyerName} —{" "}
                      {orderAhead ? "your order is in" : "it’s set aside"}.
                    </p>
                    <p className="mt-3 text-[11px] font-medium tracking-wide text-muted uppercase">
                      Come by
                    </p>
                    <p className="font-display text-2xl leading-tight text-ink">{vendor.pickup}</p>
                    <p className="hand mt-2 text-xl leading-snug text-ink">
                      {confirmed.qty > 1 ? `${confirmed.qty} × ` : ""}
                      {confirmed.productName}
                      {confirmed.note ? ` — “${confirmed.note}”` : ""}
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      {orderAhead
                        ? "They’ll mark it ready — pay in the shop. Nothing was charged here."
                        : "Pay the maker at pickup. Nothing was charged here."}
                    </p>
                    <PayMakerLinks links={paymentLinks(vendor.payments)} compact />
                    <div className="mt-2 flex flex-wrap gap-x-4">
                      <Link
                        to="/holds"
                        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-porch hover:underline"
                      >
                        See your holds
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        className="inline-flex min-h-11 items-center text-sm font-medium text-muted hover:text-ink"
                        onClick={() => cancelHold(confirmed.id)}
                      >
                        Cancel this hold
                      </button>
                    </div>
                  </div>
                )}
                {canceledNote && canceledNote.productId === product.id && !confirmed && (
                  <p role="status" className="mt-4 rounded-xl bg-foam px-4 py-3 text-sm text-ink">
                    {canceledNote.text}
                  </p>
                )}

                {productHolds.filter((item) => item.id !== confirmed?.id).length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {productHolds
                      .filter((item) => item.id !== confirmed?.id)
                      .map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-3 rounded-xl bg-paper px-3 py-1 text-sm"
                        >
                          <span className="min-w-0">
                            <span className="text-muted">Held for </span>
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
                            Cancel
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
