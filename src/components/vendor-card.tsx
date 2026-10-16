import { Link } from "@tanstack/react-router";
import { Clock, MapPin } from "lucide-react";
import { fromPrice, money, type Vendor } from "@/lib/market";
import { useState } from "react";

export function Cover({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [ok, setOk] = useState(true);
  return (
    <div className={`overflow-hidden bg-foam ${className ?? ""}`}>
      {ok ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setOk(false)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-display text-2xl text-porch">
          Porch
        </div>
      )}
    </div>
  );
}

export function VendorCard({ vendor }: { vendor: Vendor }) {
  const start = fromPrice(vendor);
  return (
    <Link
      to="/vendor/$id"
      params={{ id: vendor.id }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-card transition-transform duration-200 hover:-translate-y-0.5"
    >
      <Cover src={vendor.image} alt="" className="aspect-[16/10]" />
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium tracking-wide text-porch uppercase">{vendor.category}</p>
        <h3 className="mt-1 font-display text-2xl leading-tight text-ink">{vendor.name}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          {vendor.location}
        </p>
        <p className="mt-1 flex items-start gap-1.5 text-sm text-muted">
          <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span className="line-clamp-2">{vendor.pickup}</span>
        </p>
        <p className="mt-3 line-clamp-2 text-sm text-ink">{vendor.bio}</p>
        <p className="mt-4 flex items-baseline justify-between gap-3 text-sm">
          <span className="font-medium text-mango tabular-nums">From {money(start)}</span>
          <span className="font-medium text-porch group-hover:underline">Visit porch</span>
        </p>
      </div>
    </Link>
  );
}
