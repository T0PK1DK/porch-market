import { pinKindLabel, precisionLabel, type PublicMapPin } from "@/lib/geo";
import type { MapPin } from "@/lib/geo";

export function PinKindChip({ kind }: { kind: PublicMapPin["kind"] | MapPin["kind"] }) {
  return (
    <span className="inline-flex items-center rounded-full bg-foam px-2.5 py-0.5 text-[11px] font-medium text-porch">
      {pinKindLabel(kind)}
    </span>
  );
}

export function PinPrecisionNote({ pin }: { pin: Pick<PublicMapPin, "precision" | "hereLabel"> }) {
  return (
    <p className="text-xs text-muted">
      {pin.hereLabel ? `${pin.hereLabel} · ` : ""}
      {precisionLabel(pin.precision)}
    </p>
  );
}
