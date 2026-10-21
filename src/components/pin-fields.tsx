import { PIN_KINDS, pinKindLabel, type MapPinDraft } from "@/lib/geo";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";
import { StreetMap } from "@/components/street-map";

const field =
  "mt-1.5 w-full rounded-xl border border-line bg-card px-3 py-3 text-base text-ink outline-none placeholder:text-muted focus:border-porch";

export function PinFields({
  draft,
  onChange,
  error,
}: {
  draft: MapPinDraft;
  onChange: (next: MapPinDraft) => void;
  error?: string;
}) {
  const pick =
    draft.exactLat && draft.exactLng
      ? { lat: Number(draft.exactLat), lng: Number(draft.exactLng) }
      : null;

  return (
    <fieldset className="mt-6 rounded-2xl border border-line bg-card p-4">
      <legend className="px-1 font-display text-2xl text-ink">Map pin (optional)</legend>
      <p className="mt-1 text-sm text-muted">
        Location is opt-in. Home porches stay in the neighborhood. Only a shop or a truck can drop an
        exact pin.
      </p>

      <label className="mt-4 flex min-h-11 items-center gap-3 text-sm font-medium text-ink">
        <input
          type="checkbox"
          checked={draft.optedIn}
          onChange={(event) => onChange({ ...draft, optedIn: event.target.checked })}
          className="size-4 accent-porch"
        />
        Show this kitchen on the street map
      </label>

      {draft.optedIn ? (
        <>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Pin type">
            {PIN_KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                aria-pressed={draft.kind === kind}
                className={
                  "inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium " +
                  (draft.kind === kind ? "bg-porch text-paper" : "bg-foam text-ink")
                }
                onClick={() => onChange({ ...draft, kind, orderAhead: kind === "shop" ? true : draft.orderAhead })}
              >
                {pinKindLabel(kind)}
              </button>
            ))}
          </div>

          {draft.kind === "home" ? (
            <p className="mt-3 text-sm text-ink">
              Your pin sits in the neighborhood, not on your street. We never store an exact home
              coordinate.
            </p>
          ) : (
            <>
              <p className="mt-3 text-sm text-ink">
                {draft.kind === "mobile"
                  ? "Drop today’s curb. The pin disappears at the end of that day."
                  : "Drop the shop. Neighbors can order ahead and pay at the counter."}
              </p>
              <div className="mt-3 h-64 overflow-hidden rounded-2xl border border-line">
                <StreetMap
                  pins={[]}
                  pick={Number.isFinite(pick?.lat) && Number.isFinite(pick?.lng) ? pick : null}
                  onPick={(point) =>
                    onChange({
                      ...draft,
                      exactLat: String(Math.round(point.lat * 1e5) / 1e5),
                      exactLng: String(Math.round(point.lng * 1e5) / 1e5),
                    })
                  }
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {NEIGHBORHOODS.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    className="inline-flex min-h-11 items-center rounded-full bg-foam px-3 text-sm text-ink"
                    onClick={() =>
                      onChange({
                        ...draft,
                        exactLat: String(place.lat),
                        exactLng: String(place.lng),
                      })
                    }
                  >
                    Near {place.name}
                  </button>
                ))}
              </div>
              {draft.kind === "mobile" ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <label className="text-sm font-medium text-ink">
                    Day out
                    <input
                      className={field}
                      type="date"
                      value={draft.hereOn}
                      onChange={(event) => onChange({ ...draft, hereOn: event.target.value })}
                    />
                  </label>
                  <label className="text-sm font-medium text-ink">
                    From
                    <input
                      className={field}
                      type="time"
                      value={draft.hereFrom}
                      onChange={(event) => onChange({ ...draft, hereFrom: event.target.value })}
                    />
                  </label>
                  <label className="text-sm font-medium text-ink">
                    Until
                    <input
                      className={field}
                      type="time"
                      value={draft.hereUntil}
                      onChange={(event) => onChange({ ...draft, hereUntil: event.target.value })}
                    />
                  </label>
                </div>
              ) : (
                <label className="mt-3 flex min-h-11 items-center gap-3 text-sm font-medium text-ink">
                  <input
                    type="checkbox"
                    checked={draft.orderAhead}
                    onChange={(event) => onChange({ ...draft, orderAhead: event.target.checked })}
                    className="size-4 accent-porch"
                  />
                  Neighbors can order ahead and pick up in the shop
                </label>
              )}
            </>
          )}
        </>
      ) : null}

      {error ? (
        <p className="mt-2 text-sm text-mango" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
