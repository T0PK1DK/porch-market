import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { money, photoSize, type Vendor, type WeekFood } from "@/lib/market";

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
  return (
    <div className={`overflow-hidden bg-foam ${className ?? ""}`}>
      {ok ? (
        <img
          src={src}
          alt={alt}
          width={w}
          height={h}
          loading={lazy ? "lazy" : "eager"}
          decoding="async"
          className="h-full w-full object-cover"
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

export function VendorCard({ vendor, owned = false }: { vendor: Vendor; owned?: boolean }) {
  const items = vendor.products.slice(0, 2);
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
          <p className="text-[11px] font-medium tracking-wide text-porch uppercase">{vendor.category}</p>
          <h3 className="font-display text-xl leading-tight text-ink">{vendor.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{vendor.location}</span>
          </p>
          <ul className="mt-2 space-y-1">
            {items.map((product) => (
              <li key={product.id} className="flex items-baseline justify-between gap-2 text-sm">
                <span className="truncate text-ink">{product.name}</span>
                <span className="shrink-0 font-medium text-mango tabular-nums">{money(product.price)}</span>
              </li>
            ))}
          </ul>
        </div>
      </Link>
      <div className="flex items-center justify-between gap-2 border-t border-line px-3 py-2">
        <Link
          to="/vendor/$id"
          params={{ id: vendor.id }}
          className="text-sm font-medium text-porch hover:underline"
        >
          Visit porch
        </Link>
        {owned ? (
          <Link
            to="/create"
            search={{ edit: vendor.id }}
            className="text-sm font-medium text-muted hover:text-ink"
          >
            Edit
          </Link>
        ) : null}
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
        <span className="shrink-0 font-medium text-mango tabular-nums">{money(item.product.price)}</span>
      </p>
    </Link>
  );
}
