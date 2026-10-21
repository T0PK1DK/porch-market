import { neighborhoodFromLocation, neighborhoodIdFromLocation, NEIGHBORHOODS } from "./neighborhoods.ts";

export const PIN_KINDS = ["home", "mobile", "shop"] as const;

export type PinKind = (typeof PIN_KINDS)[number];

export type MapPin = {
  kind: PinKind;
  optedIn: boolean;
  exactLat?: number;
  exactLng?: number;
  /** Local calendar day YYYY-MM-DD. Mobile pins expire at the end of this day. */
  hereOn?: string;
  hereFrom?: string;
  hereUntil?: string;
  /** Shops: order-ahead pickup on top of holds. Default true for shops. */
  orderAhead?: boolean;
};

export type PinPrecision = "neighborhood" | "exact";

export type PublicMapPin = {
  vendorId: string;
  name: string;
  kind: PinKind;
  precision: PinPrecision;
  lat: number;
  lng: number;
  neighborhood: string;
  hereNow: boolean;
  hereLabel?: string;
  orderAhead: boolean;
};

export type MapPinDraft = {
  optedIn: boolean;
  kind: PinKind;
  exactLat: string;
  exactLng: string;
  hereOn: string;
  hereFrom: string;
  hereUntil: string;
  orderAhead: boolean;
};

export const OPENFREEMAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

export const SOUTH_FLORIDA = {
  center: [-80.22, 25.76] as [number, number],
  zoom: 10.4,
  minLat: 25.2,
  maxLat: 26.15,
  minLng: -80.72,
  maxLng: -80.05,
};

export const DEMO_MOBILE_ID = "biscayne-lunch-truck";

const HOUR = /^([01]\d|2[0-3]):[0-5]\d$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

export function isPinKind(value: unknown): value is PinKind {
  return PIN_KINDS.includes(value as PinKind);
}

export function emptyMapPinDraft(): MapPinDraft {
  return {
    optedIn: false,
    kind: "home",
    exactLat: "",
    exactLng: "",
    hereOn: localDateKey(new Date()),
    hereFrom: "11:00",
    hereUntil: "14:00",
    orderAhead: true,
  };
}

export function mapPinDraftFrom(pin?: MapPin, now = new Date()): MapPinDraft {
  const base = emptyMapPinDraft();
  if (!pin) return base;
  return {
    optedIn: pin.optedIn === true,
    kind: isPinKind(pin.kind) ? pin.kind : "home",
    exactLat: pin.exactLat != null ? String(pin.exactLat) : "",
    exactLng: pin.exactLng != null ? String(pin.exactLng) : "",
    hereOn: pin.hereOn && DAY.test(pin.hereOn) ? pin.hereOn : localDateKey(now),
    hereFrom: pin.hereFrom && HOUR.test(pin.hereFrom) ? pin.hereFrom : "11:00",
    hereUntil: pin.hereUntil && HOUR.test(pin.hereUntil) ? pin.hereUntil : "14:00",
    orderAhead: pin.orderAhead !== false,
  };
}

export function parseCoord(raw: unknown): number | undefined {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw !== "string") return undefined;
  const value = Number(raw.trim());
  return Number.isFinite(value) ? value : undefined;
}

export function inSouthFlorida(lat: number, lng: number): boolean {
  return lat >= SOUTH_FLORIDA.minLat && lat <= SOUTH_FLORIDA.maxLat && lng >= SOUTH_FLORIDA.minLng && lng <= SOUTH_FLORIDA.maxLng;
}

export function parseExactPoint(latRaw: unknown, lngRaw: unknown): { lat: number; lng: number } | undefined {
  const lat = parseCoord(latRaw);
  const lng = parseCoord(lngRaw);
  if (lat == null || lng == null) return undefined;
  if (!inSouthFlorida(lat, lng)) return undefined;
  return { lat: roundCoord(lat), lng: roundCoord(lng) };
}

export function roundCoord(value: number): number {
  return Math.round(value * 1e5) / 1e5;
}

export function parseHour(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const value = raw.trim();
  return HOUR.test(value) ? value : undefined;
}

export function parseDateKey(raw: unknown): string | undefined {
  if (typeof raw !== "string" || !DAY.test(raw.trim())) return undefined;
  const [year, month, day] = raw.trim().split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return undefined;
  return raw.trim();
}

export function localDateKey(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function endOfLocalDay(dateKey: string): Date {
  const parsed = parseDateKey(dateKey);
  if (!parsed) return new Date(0);
  const [year, month, day] = parsed.split("-").map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999);
}

export function isHereTodayLive(pin: Pick<MapPin, "kind" | "hereOn">, now = new Date()): boolean {
  if (pin.kind !== "mobile") return true;
  const day = parseDateKey(pin.hereOn);
  if (!day) return false;
  return now.getTime() <= endOfLocalDay(day).getTime();
}

export function isWithinHereWindow(pin: Pick<MapPin, "hereOn" | "hereFrom" | "hereUntil">, now = new Date()): boolean {
  const day = parseDateKey(pin.hereOn);
  if (!day || localDateKey(now) !== day) return false;
  const from = parseHour(pin.hereFrom) ?? "00:00";
  const until = parseHour(pin.hereUntil) ?? "23:59";
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= minutesFromHour(from) && minutes <= minutesFromHour(until);
}

function minutesFromHour(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function hereTodayLabel(pin: Pick<MapPin, "hereFrom" | "hereUntil" | "hereOn">, now = new Date()): string | undefined {
  const from = parseHour(pin.hereFrom);
  const until = parseHour(pin.hereUntil);
  if (isWithinHereWindow(pin, now)) {
    return until ? `Here now until ${formatHour(until)}` : "Here now";
  }
  if (from && until) return `Here today ${formatHour(from)}–${formatHour(until)}`;
  return "Here today";
}

export function formatHour(value: string): string {
  const [hours, minutes] = value.split(":").map(Number);
  const suffix = hours >= 12 ? "pm" : "am";
  const hour12 = hours % 12 || 12;
  return minutes === 0 ? `${hour12}${suffix}` : `${hour12}:${String(minutes).padStart(2, "0")}${suffix}`;
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Neighborhood-scale offset (~180–400m). Never street-accurate. */
export function fuzzedNeighborhoodPoint(vendorId: string, neighborhoodId: string): { lat: number; lng: number } | null {
  const place = NEIGHBORHOODS.find((item) => item.id === neighborhoodId);
  if (!place) return null;
  const hash = hashString(`${vendorId}:${neighborhoodId}`);
  const angle = ((hash % 360) * Math.PI) / 180;
  const meters = 180 + (hash % 220);
  const north = (meters * Math.cos(angle)) / 111_320;
  const east = (meters * Math.sin(angle)) / (111_320 * Math.cos((place.lat * Math.PI) / 180));
  return { lat: roundCoord(place.lat + north), lng: roundCoord(place.lng + east) };
}

export function pinKindLabel(kind: PinKind): string {
  if (kind === "mobile") return "Food truck / pop-up";
  if (kind === "shop") return "Shop / storefront";
  return "Home porch";
}

export function precisionLabel(precision: PinPrecision): string {
  return precision === "exact" ? "Exact pin they chose" : "Approximate neighborhood";
}

export function offersOrderAhead(pin?: MapPin): boolean {
  if (!pin?.optedIn) return false;
  if (pin.kind === "shop") return pin.orderAhead !== false;
  return pin.orderAhead === true;
}

export function sanitizeMapPin(draft: MapPinDraft | MapPin | undefined, now = new Date()): MapPin | undefined {
  if (!draft || !draft.optedIn) return undefined;
  const kind = isPinKind(draft.kind) ? draft.kind : "home";
  if (kind === "home") {
    return { kind: "home", optedIn: true };
  }

  const latRaw = "exactLat" in draft ? draft.exactLat : undefined;
  const lngRaw = "exactLng" in draft ? draft.exactLng : undefined;
  const exact = parseExactPoint(latRaw, lngRaw);

  if (kind === "mobile") {
    const hereOn = parseDateKey("hereOn" in draft ? draft.hereOn : undefined) ?? localDateKey(now);
    return {
      kind: "mobile",
      optedIn: true,
      ...(exact ? { exactLat: exact.lat, exactLng: exact.lng } : {}),
      hereOn,
      hereFrom: parseHour("hereFrom" in draft ? draft.hereFrom : undefined) ?? "11:00",
      hereUntil: parseHour("hereUntil" in draft ? draft.hereUntil : undefined) ?? "14:00",
    };
  }

  return {
    kind: "shop",
    optedIn: true,
    ...(exact ? { exactLat: exact.lat, exactLng: exact.lng } : {}),
    orderAhead: "orderAhead" in draft ? draft.orderAhead !== false : true,
  };
}

export function migrateMapPin(raw: unknown, now = new Date()): MapPin | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const pin = raw as Partial<MapPin>;
  if (pin.optedIn !== true || !isPinKind(pin.kind)) return undefined;
  return sanitizeMapPin(
    {
      optedIn: true,
      kind: pin.kind,
      exactLat: pin.exactLat != null ? String(pin.exactLat) : "",
      exactLng: pin.exactLng != null ? String(pin.exactLng) : "",
      hereOn: typeof pin.hereOn === "string" ? pin.hereOn : localDateKey(now),
      hereFrom: typeof pin.hereFrom === "string" ? pin.hereFrom : "11:00",
      hereUntil: typeof pin.hereUntil === "string" ? pin.hereUntil : "14:00",
      orderAhead: pin.orderAhead !== false,
    },
    now,
  );
}

export function mapPinsEqual(a?: MapPin, b?: MapPin): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

export function validateMapPinDraft(draft: MapPinDraft): { field: string; message: string }[] {
  if (!draft.optedIn) return [];
  if (draft.kind === "home") return [];
  if (!parseExactPoint(draft.exactLat, draft.exactLng)) {
    return [
      {
        field: "mapPin",
        message:
          draft.kind === "mobile"
            ? "Drop today’s spot on the map for this truck, or turn the pin off."
            : "Drop the shop pin on the map, or turn the pin off.",
      },
    ];
  }
  if (draft.kind === "mobile" && !parseDateKey(draft.hereOn)) {
    return [{ field: "hereOn", message: "Pick the day this truck is out." }];
  }
  return [];
}

export function refreshDemoMobilePin<T extends { id: string; mapPin?: MapPin }>(vendor: T, now = new Date()): T {
  if (vendor.id !== DEMO_MOBILE_ID || vendor.mapPin?.kind !== "mobile") return vendor;
  if (isHereTodayLive(vendor.mapPin, now) && vendor.mapPin.exactLat != null) return vendor;
  return {
    ...vendor,
    mapPin: {
      kind: "mobile",
      optedIn: true,
      exactLat: vendor.mapPin.exactLat ?? 25.784,
      exactLng: vendor.mapPin.exactLng ?? -80.1875,
      hereOn: localDateKey(now),
      hereFrom: vendor.mapPin.hereFrom ?? "11:00",
      hereUntil: vendor.mapPin.hereUntil ?? "14:00",
    },
  };
}

export function publicMapPin(
  vendor: { id: string; name: string; location: string; mapPin?: MapPin },
  now = new Date(),
): PublicMapPin | null {
  const pin = vendor.mapPin;
  if (!pin?.optedIn) return null;
  const neighborhood = neighborhoodFromLocation(vendor.location);

  if (pin.kind === "home") {
    const placeId = neighborhoodIdFromLocation(vendor.location);
    const point = placeId ? fuzzedNeighborhoodPoint(vendor.id, placeId) : null;
    if (!point) return null;
    return {
      vendorId: vendor.id,
      name: vendor.name,
      kind: "home",
      precision: "neighborhood",
      lat: point.lat,
      lng: point.lng,
      neighborhood,
      hereNow: false,
      orderAhead: false,
    };
  }

  if (pin.kind === "mobile") {
    if (!isHereTodayLive(pin, now)) return null;
    const exact = parseExactPoint(pin.exactLat, pin.exactLng);
    if (!exact) return null;
    return {
      vendorId: vendor.id,
      name: vendor.name,
      kind: "mobile",
      precision: "exact",
      lat: exact.lat,
      lng: exact.lng,
      neighborhood,
      hereNow: isWithinHereWindow(pin, now),
      hereLabel: hereTodayLabel(pin, now),
      orderAhead: pin.orderAhead === true,
    };
  }

  const exact = parseExactPoint(pin.exactLat, pin.exactLng);
  if (!exact) return null;
  return {
    vendorId: vendor.id,
    name: vendor.name,
    kind: "shop",
    precision: "exact",
    lat: exact.lat,
    lng: exact.lng,
    neighborhood,
    hereNow: false,
    orderAhead: pin.orderAhead !== false,
  };
}

export function publicMapPins(
  vendors: { id: string; name: string; location: string; mapPin?: MapPin }[],
  now = new Date(),
): PublicMapPin[] {
  return vendors
    .map((vendor) => publicMapPin(refreshDemoMobilePin(vendor, now), now))
    .filter((pin): pin is PublicMapPin => Boolean(pin));
}
