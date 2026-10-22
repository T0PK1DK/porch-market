import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Shell } from "@/components/shell";
import { Cover } from "@/components/vendor-card";
import {
  addFeedPost,
  EXAMPLE_FEED,
  isOwnedByThisDevice,
  loadFeed,
  loadVendors,
  resizeImage,
  SAMPLE_VENDORS,
  type FeedPost,
  type Vendor,
} from "@/lib/market";
import { relativeTime } from "@/lib/time";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [{ title: "Feed — Porch Market" }],
  }),
  component: FeedPage,
});

function FeedPage() {
  const [vendors, setVendors] = useState<Vendor[]>(SAMPLE_VENDORS);
  const [posts, setPosts] = useState<FeedPost[]>(EXAMPLE_FEED);
  const [ready, setReady] = useState(false);
  const [vendorId, setVendorId] = useState("");
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState("");
  const [photoNote, setPhotoNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const nextVendors = loadVendors();
    setVendors(nextVendors);
    setPosts(loadFeed());
    const mine = nextVendors.find(isOwnedByThisDevice);
    if (mine) setVendorId(mine.id);
    setReady(true);
  }, []);

  const mine = useMemo(() => vendors.filter(isOwnedByThisDevice), [vendors]);

  async function onPhoto(file: File | undefined) {
    setPhotoNote("");
    if (!file) return;
    setBusy(true);
    try {
      const data = await resizeImage(file, 900, 0.7);
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
    const vendor = mine.find((item) => item.id === vendorId);
    if (!vendor) {
      setFormError("Open a porch on this phone before you post.");
      return;
    }
    if (!text.trim()) {
      setFormError("Write a short update first.");
      return;
    }
    const next = addFeedPost({
      vendorId: vendor.id,
      vendorName: vendor.name,
      text: text.trim(),
      image: photo || undefined,
    });
    setPosts(next);
    setText("");
    setPhoto("");
    setFormError("");
  }

  return (
    <Shell>
      <div className="max-w-xl pt-4">
        <h1 className="font-display text-3xl text-ink">Porch feed</h1>
        <p className="mt-2 text-sm text-muted">
          Short updates from kitchens on this phone. Nothing is shared across devices yet — example
          posts stay marked so they don’t look like live news.
        </p>

        {ready && mine.length > 0 ? (
          <form onSubmit={submit} className="mt-5 rounded-2xl border border-line bg-card p-4 shadow-card">
            <label className="block text-sm font-medium text-ink">
              Which porch?
              <select
                className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-3 text-base outline-none focus:border-porch"
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
              >
                {mine.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block text-sm font-medium text-ink">
              Update
              <textarea
                className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-3 text-base outline-none placeholder:text-muted focus:border-porch"
                rows={3}
                maxLength={240}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Fresh sourdough at 4pm"
              />
            </label>
            <p className="mt-1 text-xs text-muted">{text.trim().length}/240</p>
            <label className="mt-3 block text-sm font-medium text-ink">
              Photo (optional)
              <input
                className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-3 text-base file:mr-3 file:rounded-full file:border-0 file:bg-foam file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink"
                type="file"
                accept="image/*"
                onChange={(e) => onPhoto(e.target.files?.[0])}
              />
            </label>
            {photo ? (
              <Cover src={photo} alt="" lazy={false} className="mt-3 aspect-[16/10] rounded-xl" />
            ) : null}
            {photoNote ? <p className="mt-2 text-sm text-mango">{photoNote}</p> : null}
            {formError ? (
              <p role="alert" className="mt-2 text-sm text-mango">
                {formError}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={busy}
              className="mt-4 inline-flex min-h-11 items-center rounded-full bg-porch px-5 text-sm font-medium text-paper hover:bg-porch-deep disabled:opacity-60"
            >
              Post to this porch
            </button>
          </form>
        ) : (
          <p className="mt-5 rounded-2xl bg-foam px-4 py-3 text-sm text-ink">
            Open a porch on this phone to post an update. Until then, the examples below are just a
            preview.
          </p>
        )}

        <ol className="mt-6 space-y-3">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                to="/vendor/$id"
                params={{ id: post.vendorId }}
                className="block overflow-hidden rounded-2xl border border-line bg-card shadow-card"
              >
                {post.image ? (
                  <Cover src={post.image} alt="" lazy className="aspect-[16/10]" />
                ) : null}
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-xl text-ink">{post.vendorName}</p>
                    {post.example ? (
                      <span className="inline-flex items-center rounded-full bg-foam px-2 py-0.5 text-[11px] font-medium text-muted">
                        Example
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-porch">On this phone</span>
                    )}
                  </div>
                  <p className="mt-2 text-ink">{post.text}</p>
                  <p className="mt-2 text-xs text-muted">{relativeTime(post.createdAt)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </Shell>
  );
}
