import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Shell } from "@/components/shell";
import {
  addVendor,
  CATEGORIES,
  CATEGORY_COVER,
  COMMUNITY_KITCHEN_OFFERS,
  emptyPaymentDraft,
  formatPriceInput,
  isCommunityOffer,
  isOwnedByThisDevice,
  loadVendors,
  parsePaymentHandles,
  parsePrice,
  paymentDraftFrom,
  paymentLinks,
  priceLabel,
  resizeImage,
  safeImage,
  slugId,
  updateVendor,
  validatePorchDraft,
  type Category,
  type CommunityKitchenOffer,
  type DraftProduct,
  type FieldError,
  type PaymentDraft,
  type Vendor,
} from "@/lib/market";
import { CommunityBadge, Cover, PayMakerLinks } from "@/components/vendor-card";

type CreateSearch = {
  edit?: string;
};

export const Route = createFileRoute("/create")({
  validateSearch: (search: Record<string, unknown>): CreateSearch => ({
    edit: typeof search.edit === "string" ? search.edit : undefined,
  }),
  head: ({ match }) => ({
    meta: [
      {
        title: match.search.edit ? "Edit your porch — Porch Market" : "Open a porch — Porch Market",
      },
    ],
  }),
  component: CreatePorch,
});

function blankProduct(category: Category): DraftProduct {
  return { key: `p-${Date.now().toString(36)}`, name: "", price: "", desc: "", category };
}

const field =
  "mt-1.5 w-full rounded-xl border border-line bg-card px-3 py-3 text-base text-ink outline-none placeholder:text-muted focus:border-porch";

function CreatePorch() {
  const navigate = useNavigate();
  const { edit } = Route.useSearch();
  const [ready, setReady] = useState(!edit);
  const [denied, setDenied] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<Category>("Baked");
  const [payments, setPayments] = useState<PaymentDraft>(emptyPaymentDraft());
  const [bio, setBio] = useState("");
  const [pickup, setPickup] = useState("");
  const [photo, setPhoto] = useState("");
  const [existingImage, setExistingImage] = useState("");
  const [existingId, setExistingId] = useState<string | null>(null);
  const [products, setProducts] = useState<DraftProduct[]>([
    { key: "p1", name: "", price: "", desc: "", category: "Baked" },
  ]);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [photoNote, setPhotoNote] = useState("");
  const [busy, setBusy] = useState(false);

  function errorFor(field: string): string | undefined {
    return errors.find((item) => item.field === field)?.message;
  }

  useEffect(() => {
    if (!edit) {
      setReady(true);
      setDenied(false);
      return;
    }
    const vendor = loadVendors().find((item) => item.id === edit);
    if (!vendor || !isOwnedByThisDevice(vendor)) {
      setDenied(true);
      setReady(true);
      return;
    }
    setExistingId(vendor.id);
    setName(vendor.name);
    setLocation(vendor.location);
    setCategory(vendor.category);
    setBio(vendor.bio);
    setPickup(vendor.pickup);
    setExistingImage(vendor.image);
    setPhoto("");
    setPayments(paymentDraftFrom(vendor.payments));
    setProducts(
      vendor.products.length
        ? vendor.products.map((product) => ({
            key: product.id,
            name: product.name,
            price: product.communityOffer === "Free" && product.price === 0 ? "" : String(product.price),
            desc: product.desc,
            category: product.category,
            communityOffer: product.communityOffer ?? "",
          }))
        : [{ key: "p1", name: "", price: "", desc: "", category: vendor.category }],
    );
    setDenied(false);
    setReady(true);
  }, [edit]);

  const cover = photo || safeImage(existingImage, CATEGORY_COVER[category]);
  const editing = Boolean(edit && existingId && !denied);

  const preview: Vendor = {
    id: existingId ?? "preview",
    name: name.trim() || "Your kitchen",
    location: location.trim() || "Neighborhood",
    category,
    bio: bio.trim() || "A short note about what you make and when the porch is open.",
    image: cover,
    pickup: pickup.trim() || "Pickup window goes here.",
    products: products
      .filter((p) => p.name.trim())
      .map((p) => {
        const offer = isCommunityOffer(p.communityOffer) ? p.communityOffer : undefined;
        return {
          id: p.key,
          name: p.name.trim(),
          price: offer === "Free" ? 0 : (parsePrice(p.price) ?? 0),
          desc: p.desc.trim() || "Available for local pickup.",
          image: CATEGORY_COVER[p.category],
          category: p.category,
          ...(offer ? { communityOffer: offer } : {}),
        };
      }),
    payments: parsePaymentHandles(payments).handles,
  };

  async function onPhoto(file: File | undefined) {
    setPhotoNote("");
    if (!file) return;
    setBusy(true);
    try {
      const data = await resizeImage(file);
      if (data.length > 480_000) {
        setPhotoNote("That photo is still too big for this browser. Try a smaller one.");
        setPhoto("");
        return;
      }
      setPhoto(data);
    } catch {
      setPhotoNote("Could not read that photo.");
    } finally {
      setBusy(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validatePorchDraft({ name, location, pickup, bio, products, payments });
    setErrors(nextErrors);
    if (nextErrors.length) return;

    const readyProducts = products.filter((p) => p.name.trim() || p.price.trim() || p.desc.trim());
    const existing = editing ? loadVendors().find((item) => item.id === existingId) : undefined;
    const { handles } = parsePaymentHandles(payments);
    const vendor: Vendor = {
      id: existing?.id ?? slugId(name),
      name: name.trim(),
      location: location.trim(),
      category,
      bio: bio.trim(),
      image: cover,
      pickup: pickup.trim(),
      ownerId: existing?.ownerId,
      payments: handles,
      products: readyProducts.map((p) => {
        const prior = existing?.products.find((item) => item.id === p.key);
        const offer = isCommunityOffer(p.communityOffer) ? p.communityOffer : undefined;
        return {
          id: p.key,
          name: p.name.trim(),
          price: offer === "Free" ? 0 : (parsePrice(p.price) ?? 0),
          desc: p.desc.trim() || "Available for local pickup.",
          image: prior?.image || CATEGORY_COVER[p.category],
          category: p.category,
          ...(offer ? { communityOffer: offer } : {}),
        };
      }),
    };

    if (editing) updateVendor(vendor);
    else addVendor(vendor);
    navigate({ to: "/vendor/$id", params: { id: vendor.id } });
  }

  function updateProduct(key: string, patch: Partial<DraftProduct>) {
    setProducts((list) => list.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  if (!ready) {
    return (
      <Shell>
        <p className="pt-16 text-muted">Opening your porch…</p>
      </Shell>
    );
  }

  if (denied) {
    return (
      <Shell>
        <div className="max-w-lg pt-12">
          <h1 className="font-display text-4xl text-ink">This porch isn’t yours to edit.</h1>
          <p className="mt-3 text-muted">
            Edit stays on the device that opened the listing. You can still browse, or start a new
            porch here.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/" className="inline-flex min-h-11 items-center text-sm font-medium text-porch">
              Back to the market
            </Link>
            <Link
              to="/create"
              search={{}}
              className="inline-flex min-h-11 items-center rounded-full bg-porch px-4 text-sm font-medium text-paper"
            >
              Open a new porch
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="grid items-start gap-8 pt-6 md:grid-cols-[1.1fr_0.9fr] md:pt-10">
        <div>
          <p className="text-sm font-medium tracking-wide text-porch">
            {editing ? "This device · your listing" : "Free · no account"}
          </p>
          <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
            {editing ? "Edit your porch" : "Open your porch"}
          </h1>
          <p className="mt-3 max-w-xl text-muted">
            {editing
              ? "Change the name, pickup notes, or what’s for sale. Neighbors on this phone keep the same porch."
              : "This stays in the browser you’re using. Add what you bake, then neighbors can ask you to hold a box."}
          </p>

          <form onSubmit={submit} className="mt-8" noValidate>
            {errors.length > 0 && (
              <div role="alert" className="mb-5 rounded-2xl border border-line bg-foam px-4 py-3 text-sm text-ink">
                <p className="font-medium">A few things to fix before this porch can save.</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  {errors.map((error) => (
                    <li key={error.field}>{error.message}</li>
                  ))}
                </ul>
              </div>
            )}

            <Field label="Kitchen name" error={errorFor("name")}>
              <input
                className={field}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bayfront Sourdough"
                aria-invalid={Boolean(errorFor("name"))}
              />
            </Field>
            <Field label="Where’s the porch?" error={errorFor("location")}>
              <input
                className={field}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Miami Beach, FL"
                aria-invalid={Boolean(errorFor("location"))}
              />
            </Field>
            <Field label="Category">
              <select
                className={field}
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                {CATEGORIES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>
            <Field label="Short bio" error={errorFor("bio")}>
              <textarea
                className={field}
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="What you make, and anything a neighbor should know."
                aria-invalid={Boolean(errorFor("bio"))}
              />
            </Field>
            <Field label="Pickup" error={errorFor("pickup")}>
              <input
                className={field}
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Saturdays, 9am–noon, front porch"
                aria-invalid={Boolean(errorFor("pickup"))}
              />
            </Field>
            <Field label="Cover photo (optional)">
              <input
                className={`${field} file:mr-3 file:rounded-full file:border-0 file:bg-foam file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink`}
                type="file"
                accept="image/*"
                onChange={(e) => onPhoto(e.target.files?.[0])}
              />
              <p className="mt-1.5 text-xs text-muted">
                Stored on this device. Skip it and we’ll use a kitchen photo that ships with the app.
              </p>
              {photoNote && <p className="mt-2 text-sm text-mango">{photoNote}</p>}
              {busy && <p className="mt-2 text-sm text-muted">Sizing that photo…</p>}
            </Field>

            <div className="mt-8 border-t border-line pt-6">
              <h2 className="font-display text-2xl text-ink">What you’re selling</h2>
              {errorFor("products") ? (
                <p className="mt-2 text-sm text-mango" role="alert">
                  {errorFor("products")}
                </p>
              ) : null}
              <div className="mt-4 space-y-4">
                {products.map((product, index) => (
                  <div key={product.key} className="rounded-2xl border border-line bg-card p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-muted">Product {index + 1}</p>
                      {products.length > 1 && (
                        <button
                          type="button"
                          className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-ink hover:underline"
                          onClick={() => setProducts((list) => list.filter((item) => item.key !== product.key))}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          Remove
                        </button>
                      )}
                    </div>
                    <Field label="Name" error={errorFor(`name:${product.key}`)}>
                      <input
                        className={field}
                        value={product.name}
                        onChange={(e) => updateProduct(product.key, { name: e.target.value })}
                        placeholder="Country sourdough"
                        aria-invalid={Boolean(errorFor(`name:${product.key}`))}
                      />
                    </Field>
                    <Field label="Price (USD)" error={errorFor(`price:${product.key}`)}>
                      <input
                        className={field}
                        inputMode="decimal"
                        value={product.price}
                        onChange={(e) => updateProduct(product.key, { price: e.target.value })}
                        onBlur={() =>
                          updateProduct(product.key, { price: formatPriceInput(product.price) })
                        }
                        placeholder="12"
                        aria-invalid={Boolean(errorFor(`price:${product.key}`))}
                      />
                    </Field>
                    <Field label="Category">
                      <select
                        className={field}
                        value={product.category}
                        onChange={(e) =>
                          updateProduct(product.key, { category: e.target.value as Category })
                        }
                      >
                        {CATEGORIES.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="How neighbors pay for this">
                      <select
                        className={field}
                        value={product.communityOffer ?? ""}
                        onChange={(e) =>
                          updateProduct(product.key, {
                            communityOffer: e.target.value as CommunityKitchenOffer | "",
                          })
                        }
                      >
                        <option value="">Regular price at pickup</option>
                        {COMMUNITY_KITCHEN_OFFERS.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1.5 text-xs font-normal text-muted">
                        Free, pay what you can, or donation-backed plates show up under Community kitchen.
                      </p>
                    </Field>
                    <Field label="Description">
                      <textarea
                        className={field}
                        rows={2}
                        value={product.desc}
                        onChange={(e) => updateProduct(product.key, { desc: e.target.value })}
                        placeholder="Feeds two or three. Saturday only."
                      />
                    </Field>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-porch ring-1 ring-line hover:bg-foam"
                onClick={() => setProducts((list) => [...list, blankProduct(category)])}
              >
                <Plus className="size-4" aria-hidden="true" />
                Add another product
              </button>
            </div>

            <div className="mt-8 border-t border-line pt-6">
              <h2 className="font-display text-2xl text-ink">Pay the maker directly</h2>
              <p className="mt-2 text-sm text-muted">
                Optional. Holds are still paid at pickup. Add only handles you already use — we won’t invent any.
              </p>
              <Field label="Cash App $cashtag" error={errorFor("cashApp")}>
                <input
                  className={field}
                  value={payments.cashApp}
                  onChange={(e) => setPayments((prev) => ({ ...prev, cashApp: e.target.value }))}
                  placeholder="$yourcashtag"
                  autoCapitalize="off"
                  autoCorrect="off"
                  aria-invalid={Boolean(errorFor("cashApp"))}
                />
              </Field>
              <Field label="Venmo username" error={errorFor("venmo")}>
                <input
                  className={field}
                  value={payments.venmo}
                  onChange={(e) => setPayments((prev) => ({ ...prev, venmo: e.target.value }))}
                  placeholder="yourname"
                  autoCapitalize="off"
                  autoCorrect="off"
                  aria-invalid={Boolean(errorFor("venmo"))}
                />
              </Field>
              <Field label="PayPal.me link" error={errorFor("paypal")}>
                <input
                  className={field}
                  value={payments.paypal}
                  onChange={(e) => setPayments((prev) => ({ ...prev, paypal: e.target.value }))}
                  placeholder="paypal.me/yourname"
                  autoCapitalize="off"
                  autoCorrect="off"
                  aria-invalid={Boolean(errorFor("paypal"))}
                />
              </Field>
              <Field label="Zelle note" error={errorFor("zelle")}>
                <input
                  className={field}
                  value={payments.zelle}
                  onChange={(e) => setPayments((prev) => ({ ...prev, zelle: e.target.value }))}
                  placeholder="Name, email, or phone they already use"
                  aria-invalid={Boolean(errorFor("zelle"))}
                />
              </Field>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-8 inline-flex min-h-11 items-center rounded-full bg-porch px-6 text-sm font-medium text-paper hover:bg-porch-deep disabled:opacity-60"
            >
              {editing ? "Save changes" : "Create free storefront"}
            </button>
          </form>
        </div>

        <aside className="md:sticky md:top-24">
          <p className="text-xs font-medium tracking-wide text-muted uppercase">Preview</p>
          <article className="mt-3 overflow-hidden rounded-2xl border border-line bg-card shadow-card">
            <Cover src={preview.image} alt="" lazy={false} className="aspect-[16/10]" />
            <div className="p-4">
              <p className="text-xs font-medium tracking-wide text-porch uppercase">{preview.category}</p>
              <h2 className="mt-1 font-display text-2xl text-ink">{preview.name}</h2>
              <p className="mt-1 text-sm text-muted">{preview.location}</p>
              <p className="mt-3 text-sm text-ink">{preview.bio}</p>
              <p className="mt-2 text-sm text-muted">{preview.pickup}</p>
              <PayMakerLinks links={paymentLinks(preview.payments)} compact />
              <ul className="mt-4 space-y-2 border-t border-line pt-3">
                {(preview.products.length
                  ? preview.products
                  : [{ id: "empty", name: "First product", price: 0, desc: "", image: "", category }]
                ).map((product) => (
                  <li key={product.id} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate">{product.name}</span>
                      <CommunityBadge offer={product.communityOffer} />
                    </span>
                    <span className="shrink-0 font-medium text-mango tabular-nums">
                      {priceLabel(product)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </aside>
      </div>
    </Shell>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="mt-4 block text-sm font-medium text-ink">
      {label}
      {children}
      {error ? (
        <p className="mt-1.5 text-sm font-normal text-mango" role="alert">
          {error}
        </p>
      ) : null}
    </label>
  );
}
