import { Link } from "@tanstack/react-router";
import { MapPin, Star } from "lucide-react";
import { useState } from "react";
import { PinKindChip } from "@/components/pin-badge";
import { DietPills, PickupPill, StockPill } from "@/components/status";
import {
  photoSize,
  priceLabel,
  remainingStock,
  vendorHasCommunityKitchen,
  vendorOffersOrderAhead,
  type CommunityKitchenOffer,
  type Hold,
  type PaymentLink,
  type Vendor,
  type WeekFood,
} from "@/lib/market";
import { neighborhoodFromLocation } from "@/lib/neighborhoods";
import { pickupBadge } from "@/lib/pickup";

export function CommunityBadge({ offer }: { offer?: CommunityKitchenOffer }) {
  if (!offer) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-foam px-2 py-0.5 text-[11px] font-medium text-porch">
      {offer}
    </span>
  );
}

export function PayMakerLinks({
  links,
  compact = false,
}: {
  links: PaymentLink[];
  compact?: boolean;
}) {
  if (!links.length) return null;
  return (
    <div className={compact ? "mt-2" : "mt-3"}>
      <p className="text-xs font-medium tracking-wide text-muted uppercase">Pay the maker directly</p>
      <ul className="mt-1.5 flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.kind}>
            {link.href ? (
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center rounded-full bg-foam px-3 text-sm font-medium text-ink hover:bg-line"
              >
                {link.label} {link.value}
              </a>
            ) : (
              <span className="inline-flex min-h-11 items-center rounded-full bg-foam px-3 text-sm text-ink">
                {link.label}: {link.value}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Cover({
  src,
  alt,
  className,
  width,
  height,
  lazy = true,
}: {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  lazy?: boolean;
}) {
  const [ok, setOk] = useState(true);
  const size = photoSize(src);
  const w = width ?? size.width;
  const h = height ?? size.height;
  const sized = className?.includes("aspect-") || className?.includes("size-");
  return (
    <div
      className={`overflow-hidden bg-foam ${className ?? ""}`}
      style={sized ? undefined : { aspectRatio: `${w} / ${h}` }}
    >
      {ok ? (
        <img
          src={src}
          alt={alt}
          width={w}
          height={h}
          loading={lazy ? "lazy" : "eager"}
          decoding="async"
          className="block h-full w-full object-cover"
          onError={() => setOk(false)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-display text-xl text-porch">
          Porch
        </div>
      )}
    </div>
  );
}

export function VendorCard({
  vendor,
  owned = false,
  saved = false,
  holds = [],
  onToggleSaved,
}: {
  vendor: Vendor;
  owned?: boolean;
  saved?: boolean;
  holds?: Hold[];
  onToggleSaved?: (id: string) => void;
}) {
  const items = vendor.products.slice(0, 2);
  const badge = pickupBadge(vendor.pickup);
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-card">
      <Link
        to="/vendor/$id"
        params={{ id: vendor.id }}
        className="group flex min-h-0 flex-1 gap-3 p-3"
      >
        <Cover
          src={vendor.image}
          alt=""
          width={144}
          height={144}
          className="size-[4.5rem] shrink-0 rounded-xl sm:size-24"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-[11px] font-medium tracking-wide text-porch uppercase">{vendor.category}</p>
            <PickupPill badge={badge} />
            {vendor.mapPin?.optedIn ? <PinKindChip kind={vendor.mapPin.kind} /> : null}
            {vendorOffersOrderAhead(vendor) ? (
              <span className="inline-flex items-center rounded-full bg-foam px-2 py-0.5 text-[11px] font-medium text-mango">
                Order ahead
              </span>
            ) : null}
          </div>
          <h3 className="font-display text-xl leading-tight text-ink">{vendor.name}</h3>
          {vendorHasCommunityKitchen(vendor) ? (
            <p className="mt-1">
              <span className="inline-flex items-center rounded-full bg-foam px-2 py-0.5 text-[11px] font-medium text-porch">
                Community kitchen
              </span>
            </p>
          ) : null}
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{neighborhoodFromLocation(vendor.location)}</span>
          </p>
          <ul className="mt-2 space-y-1">
            {items.map((product) => (
              <li key={product.id} className="flex items-baseline justify-between gap-2 text-sm">
                <span className="truncate text-ink">{product.name}</span>
                <span className="shrink-0 font-medium text-mango tabular-nums">{priceLabel(product)}</span>
              </li>
            ))}
          </ul>
          {items[0] ? <StockPill remaining={remainingStock(items[0], holds)} /> : null}
        </div>
      </Link>
      <div className="flex items-center justify-between gap-2 border-t border-line px-3">
        <Link
          to="/vendor/$id"
          params={{ id: vendor.id }}
          className="inline-flex min-h-11 items-center text-sm font-medium text-porch hover:underline"
        >
          Visit porch
        </Link>
        <div className="flex items-center gap-2">
          {owned ? (
            <Link
              to="/create"
              search={{ edit: vendor.id }}
              className="inline-flex min-h-11 items-center text-sm font-medium text-ink hover:underline"
            >
              Edit
            </Link>
          ) : null}
          {onToggleSaved ? (
            <button
              type="button"
              aria-pressed={saved}
              aria-label={saved ? "Remove from saved" : "Save this porch"}
              onClick={() => onToggleSaved(vendor.id)}
              className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-ink"
            >
              <Star className={`size-4 ${saved ? "fill-mango text-mango" : "text-muted"}`} aria-hidden="true" />
              {saved ? "Saved" : "Save"}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function WeekFoodCard({ item, lazy }: { item: WeekFood; lazy: boolean }) {
  return (
    <Link
      to="/vendor/$id"
      params={{ id: item.vendorId }}
      className="w-[8.5rem] shrink-0 snap-start sm:w-40"
    >
      <Cover
        src={item.product.image}
        alt=""
        width={200}
        height={200}
        lazy={lazy}
        className="aspect-square rounded-2xl border border-line bg-card shadow-card"
      />
      <p className="mt-2 truncate text-sm font-medium text-ink">{item.product.name}</p>
      <p className="flex items-baseline justify-between gap-2 text-xs">
        <span className="truncate text-muted">{item.vendorName}</span>
        <span className="shrink-0 font-medium text-mango tabular-nums">{priceLabel(item.product)}</span>
      </p>
      <DietPills notes={item.product.dietNotes} />
    </Link>
  );
}
