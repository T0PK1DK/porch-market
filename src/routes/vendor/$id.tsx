import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Clock, Copy, MapPin, Pencil, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { LawNote } from "@/components/law-note";
import { Shell } from "@/components/shell";
import { DietPills, PickupPill, StockPill } from "@/components/status";
import { CommunityBadge, Cover, PayMakerLinks } from "@/components/vendor-card";
import {
  isHoldOpen,
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
          <Link to="/" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-porch">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to the market
          </Link>
        </div>
      </Shell>
    );
  }

  const porch = vendor;

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
  }

  function cancelHold(holdId: string) {
    const next = removeHold(holdId).filter((item) => item.vendorId === id);
    setHolds(next);
    if (lastHold?.id === holdId) {
      setCanceledNote(`Canceled the hold for ${lastHold.buyerName}.`);
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
          All vendors
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
            <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">{vendor.name}</h1>
            <p className="mt-3 flex items-center gap-1.5 text-muted">
              <MapPin className="size-4" aria-hidden="true" />
              {neighborhoodFromLocation(vendor.location)} · {vendor.location}
            </p>
            <p className="mt-4 max-w-xl text-lg text-ink">{vendor.bio}</p>
          </div>
          <aside className="h-fit rounded-2xl border border-line bg-card p-4 shadow-card">
            <p className="flex items-start gap-2 text-sm text-ink">
              <Clock className="mt-0.5 size-4 shrink-0 text-porch" aria-hidden="true" />
              {vendor.pickup}
            </p>
            {platesLeft != null ? (
              <p className="mt-3 text-sm text-ink">
                {platesLeft} {platesLeft === 1 ? "plate" : "plates"} the kitchen can still cover this week.
              </p>
            ) : null}
            <p className="mt-3 text-sm text-muted">
              A hold is a name on a box. Pay at pickup — nothing is charged here.
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

        {lastHold && (
          <div role="status" className="mt-6 rounded-2xl border border-line bg-foam px-4 py-3 text-ink">
            <p className="font-medium">Held for {lastHold.buyerName}</p>
            <p className="mt-1 text-sm">
              {lastHold.qty > 1 ? `${lastHold.qty} × ` : ""}
              {lastHold.productName}
              {lastHold.note ? ` — ${lastHold.note}` : ""}. A name on a box — pay at pickup.
            </p>
            <PayMakerLinks links={paymentLinks(vendor.payments)} compact />
            <button
              type="button"
              className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-porch hover:underline"
              onClick={() => cancelHold(lastHold.id)}
            >
              Cancel this hold
            </button>
          </div>
        )}
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
                    <p className="font-medium text-ink">
                      {item.qty > 1 ? `${item.qty} × ` : ""}
                      {item.productName}
                    </p>
                    <p className="text-sm text-muted">
                      {item.buyerName}
                      {item.note ? ` — ${item.note}` : ""} · {relativeTime(item.createdAt)}
                      {isHoldStale(item) ? " · older than a week" : ""}
                    </p>
                  </div>
                  <div className="flex gap-3">
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

        <h2 className="mt-8 font-display text-3xl text-ink">Available now</h2>
        <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-card">
          {vendor.products.map((product, index) => {
            const open = activeId === product.id;
            const productHolds = openHolds.filter((holdItem) => holdItem.productId === product.id);
            const left = remainingStock(product, openHolds);
            const soldOut = left === 0;
            return (
              <li key={product.id} className="p-4 sm:p-5">
                <div className="flex gap-4">
                  <Cover
                    src={product.image}
                    alt=""
                    width={160}
                    height={160}
                    lazy={index > 0}
                    className="size-20 shrink-0 rounded-xl sm:size-24"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-display text-xl text-ink">{product.name}</h3>
                      <p className="font-medium text-mango tabular-nums">{priceLabel(product)}</p>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <CommunityBadge offer={product.communityOffer} />
                      <StockPill remaining={left} />
                    </div>
                    <p className="mt-1 text-sm text-muted">{product.desc}</p>
                    {product.readyNote ? <p className="mt-1 text-sm text-ink">{product.readyNote}</p> : null}
                    <DietPills notes={product.dietNotes} />
                    <button
                      type="button"
                      className="mt-3 inline-flex min-h-11 items-center rounded-full bg-porch px-4 text-sm font-medium text-paper hover:bg-porch-deep disabled:opacity-50"
                      aria-expanded={open}
                      disabled={soldOut}
                      onClick={() => {
                        setActiveId(open ? null : product.id);
                        setFormError("");
                      }}
                    >
                      {soldOut ? "Spoken for this week" : open ? "Close" : "Hold for pickup"}
                    </button>
                  </div>
                </div>

                {open && (
                  <form
                    className="mt-4 grid gap-3 rounded-xl bg-foam p-4 sm:grid-cols-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      hold(product.id);
                    }}
                  >
                    <label className="text-sm font-medium text-ink">
                      Your name
                      <input
                        className="mt-1.5 w-full rounded-xl border border-line bg-card px-3 py-3 text-base outline-none focus:border-porch"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        placeholder="Alex"
                        autoComplete="name"
                        aria-invalid={Boolean(formError)}
                        required
                      />
                    </label>
                    <label className="text-sm font-medium text-ink">
                      How many
                      <input
                        className="mt-1.5 w-full rounded-xl border border-line bg-card px-3 py-3 text-base outline-none focus:border-porch"
                        type="number"
                        min={1}
                        max={left ?? 6}
                        value={qty}
                        onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                      />
                    </label>
                    <label className="text-sm font-medium text-ink sm:col-span-2">
                      Note for the kitchen
                      <input
                        className="mt-1.5 w-full rounded-xl border border-line bg-card px-3 py-3 text-base outline-none focus:border-porch"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Two loaves, sliced if you can"
                      />
                    </label>
                    {formError && (
                      <p role="alert" className="text-sm text-ink sm:col-span-2">
                        {formError}
                      </p>
                    )}
                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        className="inline-flex min-h-11 items-center rounded-full bg-mango px-5 text-sm font-medium text-paper hover:bg-mango-deep"
                      >
                        Ask them to set one aside
                      </button>
                    </div>
                  </form>
                )}

                {productHolds.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {productHolds.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start justify-between gap-3 rounded-xl bg-paper px-3 py-2 text-sm"
                      >
                        <span>
                          <span className="font-medium">{item.buyerName}</span>
                          {item.qty > 1 ? ` · ${item.qty}` : ""}
                          {item.note ? ` — ${item.note}` : ""}
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
