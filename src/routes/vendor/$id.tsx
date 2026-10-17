import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Clock, MapPin, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { Cover } from "@/components/vendor-card";
import {
  isOwnedByThisDevice,
  loadHolds,
  loadVendors,
  money,
  removeHold,
  removeVendor,
  SAMPLE_VENDORS,
  saveHold,
  type Hold,
  type Vendor,
} from "@/lib/market";

export const Route = createFileRoute("/vendor/$id")({
  head: () => ({
    meta: [{ title: "Storefront — Porch Market" }],
  }),
  component: Storefront,
});

function Storefront() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>(SAMPLE_VENDORS);
  const [ready, setReady] = useState(false);
  const [holds, setHolds] = useState<Hold[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [buyerName, setBuyerName] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState("");
  const [lastHold, setLastHold] = useState<Hold | null>(null);
  const [canceledNote, setCanceledNote] = useState("");

  useEffect(() => {
    setVendors(loadVendors());
    setHolds(loadHolds().filter((hold) => hold.vendorId === id));
    setReady(true);
  }, [id]);

  const vendor = vendors.find((item) => item.id === id);
  const mine = isOwnedByThisDevice(vendor);

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

  function hold(productId: string, productName: string) {
    if (!buyerName.trim()) {
      setFormError("Leave your name so they know whose box it is.");
      return;
    }
    const placed: Hold = {
      id: `hold-${Date.now().toString(36)}`,
      vendorId: id,
      productId,
      productName,
      buyerName: buyerName.trim(),
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };
    const next = saveHold(placed);
    setHolds(next.filter((item) => item.vendorId === id));
    setLastHold(placed);
    setCanceledNote("");
    setActiveId(null);
    setNote("");
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
            <p className="text-xs font-medium tracking-wide text-porch uppercase">{vendor.category}</p>
            <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">{vendor.name}</h1>
            <p className="mt-3 flex items-center gap-1.5 text-muted">
              <MapPin className="size-4" aria-hidden="true" />
              {vendor.location}
            </p>
            <p className="mt-4 max-w-xl text-lg text-ink">{vendor.bio}</p>
          </div>
          <aside className="h-fit rounded-2xl border border-line bg-card p-4 shadow-card">
            <p className="flex items-start gap-2 text-sm text-ink">
              <Clock className="mt-0.5 size-4 shrink-0 text-porch" aria-hidden="true" />
              {vendor.pickup}
            </p>
            <p className="mt-3 text-sm text-muted">
              A hold is a name on a box. Pay at the door — nothing is charged here.
            </p>
            {mine && (
              <div className="mt-4 flex flex-col items-start gap-2">
                <Link
                  to="/create"
                  search={{ edit: vendor.id }}
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-porch"
                >
                  <Pencil className="size-4" aria-hidden="true" />
                  Edit this porch
                </Link>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-ink"
                  onClick={() => {
                    removeVendor(vendor.id);
                    navigate({ to: "/" });
                  }}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Remove this porch from this device
                </button>
              </div>
            )}
          </aside>
        </div>

        {lastHold && (
          <div
            role="status"
            className="mt-6 rounded-2xl border border-line bg-foam px-4 py-3 text-ink"
          >
            <p className="font-medium">Held for {lastHold.buyerName}</p>
            <p className="mt-1 text-sm">
              {lastHold.productName}
              {lastHold.note ? ` — ${lastHold.note}` : ""}. A name on a box — pay at the door.
            </p>
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

        <h2 className="mt-8 font-display text-3xl text-ink">Available now</h2>
        <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-card">
          {vendor.products.map((product, index) => {
            const open = activeId === product.id;
            const productHolds = holds.filter((holdItem) => holdItem.productId === product.id);
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
                      <p className="font-medium text-mango tabular-nums">{money(product.price)}</p>
                    </div>
                    <p className="mt-1 text-sm text-muted">{product.desc}</p>
                    <button
                      type="button"
                      className="mt-3 inline-flex min-h-11 items-center rounded-full bg-porch px-4 text-sm font-medium text-paper hover:bg-porch-deep"
                      aria-expanded={open}
                      onClick={() => {
                        setActiveId(open ? null : product.id);
                        setFormError("");
                      }}
                    >
                      {open ? "Close" : "Hold for pickup"}
                    </button>
                  </div>
                </div>

                {open && (
                  <form
                    className="mt-4 grid gap-3 rounded-xl bg-foam p-4 sm:grid-cols-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      hold(product.id, product.name);
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
                          {item.note ? ` — ${item.note}` : ""}
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
      </div>
    </Shell>
  );
}
