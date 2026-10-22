import { Link } from "@tanstack/react-router";
import { Cover, PayMakerLinks } from "@/components/vendor-card";
import {
  cancelHoldPrompt,
  holdEstimate,
  holdStatusPhrase,
  holdTicketHeadline,
} from "@/lib/hold-ui";
import { isHoldStale, vendorOffersOrderAhead, type Hold, type PaymentLink, type Product, type Vendor } from "@/lib/market";
import { relativeTime } from "@/lib/time";

export function holdProduct(vendor: Vendor | undefined, hold: Hold): Product | undefined {
  return vendor?.products.find((item) => item.id === hold.productId);
}

export function ConfirmTicket({
  hold,
  pickup,
  orderAhead,
  payments,
  product,
  askingCancel,
  onAskCancel,
  onKeep,
  onCancel,
}: {
  hold: Hold;
  pickup: string;
  orderAhead: boolean;
  payments: PaymentLink[];
  product?: Product;
  askingCancel: boolean;
  onAskCancel: () => void;
  onKeep: () => void;
  onCancel: () => void;
}) {
  const estimate = product ? holdEstimate(product, hold.qty) : null;
  return (
    <div
      id={`hold-ticket-${hold.id}`}
      role="status"
      className="ticket mt-4 scroll-mt-24 px-4 py-3 text-ink"
    >
      <p className="font-display text-xl leading-snug">{holdTicketHeadline(pickup, orderAhead)}</p>
      <p className="mt-1 text-sm">
        Held for {hold.buyerName}
        {hold.qty > 1 ? ` · ${hold.qty} × ` : " · "}
        {hold.productName}
        {hold.note ? ` — ${hold.note}` : ""}.
      </p>
      {estimate ? <p className="mt-1 text-sm text-muted">{estimate.label}.</p> : null}
      <PayMakerLinks links={payments} compact />
      {askingCancel ? (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="text-sm text-ink">{cancelHoldPrompt()}</p>
          <button
            type="button"
            className="inline-flex min-h-11 items-center text-sm font-medium text-mango"
            onClick={onCancel}
          >
            Yes, let it go
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center text-sm font-medium text-ink"
            onClick={onKeep}
          >
            Keep the hold
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-porch hover:underline"
          onClick={onAskCancel}
        >
          Cancel this hold
        </button>
      )}
    </div>
  );
}

export function BoardTicket({
  hold,
  vendor,
  onReady,
  onPicked,
  onCancel,
  askingCancel,
  onAskCancel,
  onKeep,
}: {
  hold: Hold;
  vendor?: Vendor;
  onReady?: (id: string) => void;
  onPicked?: (id: string) => void;
  onCancel: (id: string) => void;
  askingCancel: boolean;
  onAskCancel: () => void;
  onKeep: () => void;
}) {
  const product = holdProduct(vendor, hold);
  const estimate = product ? holdEstimate(product, hold.qty) : null;
  const orderAhead = vendorOffersOrderAhead(vendor);
  const canReady = onReady && orderAhead && hold.status === "open";
  const phrase = holdStatusPhrase(hold, {
    stale: isHoldStale(hold),
    orderAhead,
  });

  return (
    <li className="ticket p-4 shadow-card">
      <div className="flex gap-3">
        {product ? (
          <div className="photo-frame w-16 shrink-0">
            <Cover src={product.image} alt="" width={96} height={96} className="aspect-square" />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl leading-tight text-ink">
            {hold.qty > 1 ? `${hold.qty} × ` : ""}
            {hold.productName}
          </p>
          <p className="mt-1 text-sm text-muted">
            {hold.buyerName}
            {hold.note ? ` — ${hold.note}` : ""}
          </p>
          {vendor ? (
            <p className="ready-note mt-1 text-sm text-ink">{holdTicketHeadline(vendor.pickup, orderAhead)}</p>
          ) : null}
          {estimate ? <p className="mt-1 text-sm text-muted">{estimate.label}</p> : null}
          <p className="mt-1 text-xs text-muted">
            {hold.vendorName} · {relativeTime(hold.createdAt)} · {phrase}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        <Link
          to="/vendor/$id"
          params={{ id: hold.vendorId }}
          className="inline-flex min-h-11 items-center text-sm font-medium text-porch"
        >
          Open porch
        </Link>
        {canReady ? (
          <button
            type="button"
            className="inline-flex min-h-11 items-center text-sm font-medium text-porch"
            onClick={() => onReady(hold.id)}
          >
            Mark ready
          </button>
        ) : null}
        {onPicked ? (
          <button
            type="button"
            className="inline-flex min-h-11 items-center text-sm font-medium text-ink"
            onClick={() => onPicked(hold.id)}
          >
            Picked up
          </button>
        ) : null}
        {askingCancel ? (
          <span className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-ink">{cancelHoldPrompt()}</span>
            <button
              type="button"
              className="inline-flex min-h-11 items-center text-sm font-medium text-mango"
              onClick={() => onCancel(hold.id)}
            >
              Yes, let it go
            </button>
            <button type="button" className="inline-flex min-h-11 items-center text-sm font-medium text-ink" onClick={onKeep}>
              Keep it
            </button>
          </span>
        ) : (
          <button
            type="button"
            className="inline-flex min-h-11 items-center text-sm font-medium text-mango"
            onClick={onAskCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </li>
  );
}
