export function PorchCardSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-card p-3 shadow-card" aria-hidden="true">
      <div className="flex gap-3">
        <div className="skeleton size-20 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2 pt-1">
          <div className="skeleton h-3 w-16 rounded-full" />
          <div className="skeleton h-5 w-3/4 rounded-full" />
          <div className="skeleton h-3 w-1/2 rounded-full" />
          <div className="skeleton h-3 w-2/3 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function StorefrontSkeleton() {
  return (
    <div className="min-h-[70vh] pt-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Looking up this porch</span>
      <div className="skeleton h-4 w-24 rounded-full" />
      <div className="skeleton mt-3 aspect-[16/9] rounded-2xl" />
      <div className="mt-5 space-y-3">
        <div className="skeleton h-4 w-20 rounded-full" />
        <div className="skeleton h-10 w-2/3 rounded-full" />
        <div className="skeleton h-4 w-40 rounded-full" />
        <div className="skeleton h-20 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function TicketSkeleton() {
  return (
    <div className="rounded-2xl border border-dashed border-stitch bg-card p-4" aria-hidden="true">
      <div className="flex gap-3">
        <div className="skeleton size-16 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="skeleton h-5 w-2/3 rounded-full" />
          <div className="skeleton h-3 w-1/2 rounded-full" />
          <div className="skeleton h-3 w-3/4 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function WeekRowSkeleton() {
  return (
    <div className="flex gap-3" aria-hidden="true">
      {[0, 1, 2].map((key) => (
        <div key={key} className="w-[8.75rem] shrink-0">
          <div className="skeleton aspect-square rounded-xl" />
          <div className="skeleton mt-2 h-4 w-4/5 rounded-full" />
          <div className="skeleton mt-1 h-3 w-1/2 rounded-full" />
        </div>
      ))}
    </div>
  );
}
