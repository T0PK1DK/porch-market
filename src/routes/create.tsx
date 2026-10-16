import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { Shell } from "@/components/shell";
import { Cover } from "@/components/vendor-card";
import {
  addVendor,
  CATEGORIES,
  CATEGORY_COVER,
  money,
  resizeImage,
  safeImage,
  slugId,
  type Category,
  type Vendor,
} from "@/lib/market";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [{ title: "Open a porch — Porch Market" }],
  }),
  component: CreatePorch,
});

type DraftProduct = { key: string; name: string; price: string; desc: string };

const field =
  "mt-1.5 w-full rounded-xl border border-line bg-card px-3 py-3 text-base text-ink outline-none placeholder:text-muted focus:border-porch";

function CreatePorch() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<Category>("Baked Goods");
  const [bio, setBio] = useState("");
  const [pickup, setPickup] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [photo, setPhoto] = useState("");
  const [products, setProducts] = useState<DraftProduct[]>([
    { key: "p1", name: "", price: "", desc: "" },
  ]);
  const [errors, setErrors] = useState<string[]>([]);
  const [photoNote, setPhotoNote] = useState("");
  const [busy, setBusy] = useState(false);

  const cover = photo || safeImage(imageUrl, CATEGORY_COVER[category]);

  const preview: Vendor = {
    id: "preview",
    name: name.trim() || "Your kitchen",
    location: location.trim() || "Neighborhood",
    category,
    bio: bio.trim() || "A short note about what you make and when the porch is open.",
    image: cover,
    pickup: pickup.trim() || "Pickup window goes here.",
    products: products
      .filter((p) => p.name.trim())
      .map((p) => ({
        id: p.key,
        name: p.name.trim(),
        price: Number(p.price) || 0,
        desc: p.desc.trim() || "Available for local pickup.",
        image: cover,
      })),
  };

  async function onPhoto(file: File | undefined) {
    setPhotoNote("");
    if (!file) return;
    setBusy(true);
    try {
      const data = await resizeImage(file);
      if (data.length > 480_000) {
        setPhotoNote("That photo is still too big for this browser. Try a smaller one, or paste a link.");
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
    const nextErrors: string[] = [];
    if (!name.trim()) nextErrors.push("Give the kitchen a name.");
    if (!location.trim()) nextErrors.push("Say where the porch is.");
    if (!bio.trim()) nextErrors.push("Write a short bio.");
    if (!pickup.trim()) nextErrors.push("Add a pickup window.");
    const ready = products.filter((p) => p.name.trim() || p.price.trim() || p.desc.trim());
    if (ready.length === 0) nextErrors.push("Add at least one product.");
    for (const product of ready) {
      if (!product.name.trim()) nextErrors.push("Every product needs a name.");
      const price = Number(product.price);
      if (!product.price.trim() || Number.isNaN(price) || price < 0) {
        nextErrors.push(`Add a price for ${product.name.trim() || "each product"}.`);
      }
    }
    setErrors(nextErrors);
    if (nextErrors.length) return;

    const vendor: Vendor = {
      id: slugId(name),
      name: name.trim(),
      location: location.trim(),
      category,
      bio: bio.trim(),
      image: cover,
      pickup: pickup.trim(),
      products: ready.map((p) => ({
        id: p.key,
        name: p.name.trim(),
        price: Number(p.price),
        desc: p.desc.trim() || "Available for local pickup.",
        image: CATEGORY_COVER[category],
      })),
    };
    addVendor(vendor);
    navigate({ to: "/vendor/$id", params: { id: vendor.id } });
  }

  function updateProduct(key: string, patch: Partial<DraftProduct>) {
    setProducts((list) => list.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  return (
    <Shell>
      <div className="grid items-start gap-8 pt-8 md:grid-cols-[1.1fr_0.9fr] md:pt-12">
        <div>
          <p className="text-sm font-medium tracking-wide text-porch">Free · no account</p>
          <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">Open your porch</h1>
          <p className="mt-3 max-w-xl text-muted">
            This stays in the browser you’re using. Neighbors on another phone won’t see it until
            accounts exist — good enough to try the page, the products, and a pickup hold.
          </p>

          <form onSubmit={submit} className="mt-8" noValidate>
            {errors.length > 0 && (
              <div role="alert" className="mb-5 rounded-2xl border border-line bg-foam px-4 py-3 text-sm text-ink">
                <ul className="list-disc space-y-1 pl-4">
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <Field label="Kitchen name">
              <input
                className={field}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bayfront Sourdough"
                required
              />
            </Field>
            <Field label="Where’s the porch?">
              <input
                className={field}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Miami Beach, FL"
                required
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
            <Field label="Short bio">
              <textarea
                className={field}
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="What you make, and anything a neighbor should know."
                required
              />
            </Field>
            <Field label="Pickup">
              <input
                className={field}
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Saturdays, 9am–noon, front porch"
                required
              />
            </Field>
            <Field label="Cover photo">
              <input
                className={`${field} file:mr-3 file:rounded-full file:border-0 file:bg-foam file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink`}
                type="file"
                accept="image/*"
                onChange={(e) => onPhoto(e.target.files?.[0])}
              />
              <input
                className={field}
                type="url"
                inputMode="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Or paste an image link"
              />
              {photoNote && <p className="mt-2 text-sm text-mango">{photoNote}</p>}
              {busy && <p className="mt-2 text-sm text-muted">Sizing that photo…</p>}
            </Field>

            <div className="mt-8 border-t border-line pt-6">
              <h2 className="font-display text-2xl text-ink">What you’re selling</h2>
              <div className="mt-4 space-y-4">
                {products.map((product, index) => (
                  <div key={product.key} className="rounded-2xl border border-line bg-card p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-muted">Product {index + 1}</p>
                      {products.length > 1 && (
                        <button
                          type="button"
                          className="inline-flex min-h-11 items-center gap-1 text-sm text-muted hover:text-ink"
                          onClick={() => setProducts((list) => list.filter((item) => item.key !== product.key))}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          Remove
                        </button>
                      )}
                    </div>
                    <Field label="Name">
                      <input
                        className={field}
                        value={product.name}
                        onChange={(e) => updateProduct(product.key, { name: e.target.value })}
                        placeholder="Country sourdough"
                      />
                    </Field>
                    <Field label="Price (USD)">
                      <input
                        className={field}
                        inputMode="decimal"
                        value={product.price}
                        onChange={(e) => updateProduct(product.key, { price: e.target.value })}
                        placeholder="12"
                      />
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
                onClick={() =>
                  setProducts((list) => [
                    ...list,
                    { key: `p-${list.length}-${Date.now().toString(36)}`, name: "", price: "", desc: "" },
                  ])
                }
              >
                <Plus className="size-4" aria-hidden="true" />
                Add another product
              </button>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-8 inline-flex min-h-11 items-center rounded-full bg-porch px-6 text-sm font-medium text-paper hover:bg-porch-deep disabled:opacity-60"
            >
              Create free storefront
            </button>
          </form>
        </div>

        <aside className="md:sticky md:top-24">
          <p className="text-xs font-medium tracking-wide text-muted uppercase">Preview</p>
          <article className="mt-3 overflow-hidden rounded-2xl border border-line bg-card shadow-card">
            <Cover src={preview.image} alt="" className="aspect-[16/10]" />
            <div className="p-4">
              <p className="text-xs font-medium tracking-wide text-porch uppercase">{preview.category}</p>
              <h2 className="mt-1 font-display text-2xl text-ink">{preview.name}</h2>
              <p className="mt-1 text-sm text-muted">{preview.location}</p>
              <p className="mt-3 text-sm text-ink">{preview.bio}</p>
              <p className="mt-2 text-sm text-muted">{preview.pickup}</p>
              <ul className="mt-4 space-y-2 border-t border-line pt-3">
                {(preview.products.length ? preview.products : [{ id: "empty", name: "First product", price: 0, desc: "", image: "" }]).map(
                  (product) => (
                    <li key={product.id} className="flex items-baseline justify-between gap-3 text-sm">
                      <span>{product.name}</span>
                      <span className="font-medium text-mango tabular-nums">
                        {product.price > 0 ? money(product.price) : "—"}
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </article>
        </aside>
      </div>
    </Shell>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mt-4 block text-sm font-medium text-ink">
      {label}
      {children}
    </label>
  );
}
