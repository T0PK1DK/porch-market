import { useEffect, useRef } from "react";
import { holdEstimate, stepHoldQty } from "@/lib/hold-ui";
import type { Product } from "@/lib/market";

export function HoldForm({
  product,
  remaining,
  orderAhead,
  buyerName,
  note,
  qty,
  formError,
  onBuyerName,
  onNote,
  onQty,
  onClose,
  onSubmit,
}: {
  product: Product;
  remaining: number | null;
  orderAhead: boolean;
  buyerName: string;
  note: string;
  qty: number;
  formError: string;
  onBuyerName: (value: string) => void;
  onNote: (value: string) => void;
  onQty: (value: number) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const estimate = holdEstimate(product, qty);
  const max = remaining ?? 12;

  useEffect(() => {
    formRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, []);

  return (
    <form
      ref={formRef}
      className="ticket mt-4 grid scroll-mt-24 gap-3 p-4 sm:grid-cols-2 [@media(max-height:480px)]:grid-cols-1"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <label className="text-sm font-medium text-ink">
        Name for the box
        <input
          className="mt-1.5 w-full rounded-xl border border-line bg-card px-3 py-3 text-base outline-none focus:border-porch"
          value={buyerName}
          onChange={(e) => onBuyerName(e.target.value)}
          placeholder="What the kitchen should write"
          autoComplete="name"
          aria-invalid={Boolean(formError)}
        />
      </label>
      <div className="text-sm font-medium text-ink">
        How many
        <div className="qty-stepper mt-1.5 min-h-12 w-full justify-between px-1 sm:w-auto sm:justify-start">
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full text-lg text-ink hover:bg-foam disabled:opacity-40"
            aria-label="Fewer"
            disabled={qty <= 1}
            onClick={() => onQty(stepHoldQty(qty, -1, remaining))}
          >
            −
          </button>
          <span className="min-w-8 text-center text-base tabular-nums" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full text-lg text-ink hover:bg-foam disabled:opacity-40"
            aria-label="More"
            disabled={qty >= max}
            onClick={() => onQty(stepHoldQty(qty, 1, remaining))}
          >
            +
          </button>
        </div>
      </div>
      <label className="text-sm font-medium text-ink sm:col-span-2">
        Note for the kitchen <span className="font-normal text-muted">(optional)</span>
        <input
          className="mt-1.5 w-full rounded-xl border border-line bg-card px-3 py-3 text-base outline-none focus:border-porch"
          value={note}
          onChange={(e) => onNote(e.target.value)}
          placeholder="Two loaves, sliced if you can"
        />
      </label>
      <p className="text-sm text-muted sm:col-span-2">{estimate.label}. Nothing is charged here.</p>
      {formError ? (
        <p role="alert" className="text-sm text-mango sm:col-span-2">
          {formError}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
        <button
          type="submit"
          className="inline-flex min-h-11 items-center rounded-full bg-mango px-5 text-sm font-medium text-paper hover:bg-mango-deep"
        >
          {orderAhead ? "Place pickup order" : "Ask them to set one aside"}
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium text-ink hover:bg-foam"
          onClick={onClose}
        >
          Never mind
        </button>
      </div>
    </form>
  );
}
