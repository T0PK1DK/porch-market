import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  endOfLocalDay,
  fuzzedNeighborhoodPoint,
  isHereTodayLive,
  isWithinHereWindow,
  localDateKey,
  migrateMapPin,
  offersOrderAhead,
  publicMapPin,
  refreshDemoMobilePin,
  sanitizeMapPin,
  validateMapPinDraft,
  DEMO_MOBILE_ID,
} from "./geo.ts";

const today = new Date(2026, 9, 21, 12, 0, 0);
const tonight = new Date(2026, 9, 21, 23, 59, 59, 999);
const tomorrow = new Date(2026, 9, 22, 0, 0, 1);

describe("home pins", () => {
  it("never publishes exact home coordinates, even if someone stored them", () => {
    const pin = sanitizeMapPin({
      optedIn: true,
      kind: "home",
      exactLat: "25.79071",
      exactLng: "-80.13001",
      hereOn: "2026-10-21",
      hereFrom: "09:00",
      hereUntil: "12:00",
      orderAhead: true,
    });
    assert.deepEqual(pin, { kind: "home", optedIn: true });
    assert.equal(pin?.exactLat, undefined);

    const published = publicMapPin({
      id: "bayfront-sourdough",
      name: "Bayfront Sourdough",
      location: "Miami Beach, FL",
      mapPin: { kind: "home", optedIn: true, exactLat: 25.79071, exactLng: -80.13001 },
    });
    assert.ok(published);
    assert.equal(published.precision, "neighborhood");
    assert.equal(published.kind, "home");
    const fuzzed = fuzzedNeighborhoodPoint("bayfront-sourdough", "miami-beach");
    assert.ok(fuzzed);
    assert.equal(published.lat, fuzzed.lat);
    assert.equal(published.lng, fuzzed.lng);
    assert.notEqual(published.lat, 25.79071);
  });

  it("stays off the map unless the seller opted in", () => {
    assert.equal(
      publicMapPin({
        id: "hidden",
        name: "Hidden",
        location: "Miami Beach, FL",
      }),
      null,
    );
    assert.equal(sanitizeMapPin({ ...validateBase(), optedIn: false }), undefined);
  });
});

describe("mobile here-today pins", () => {
  it("expires at the end of the local day, not at the window close", () => {
    const pin = {
      kind: "mobile" as const,
      optedIn: true,
      hereOn: "2026-10-21",
      hereFrom: "11:00",
      hereUntil: "14:00",
    };
    assert.equal(isHereTodayLive(pin, today), true);
    assert.equal(isHereTodayLive(pin, tonight), true);
    assert.equal(isHereTodayLive(pin, tomorrow), false);
    assert.equal(isWithinHereWindow(pin, today), true);
    assert.equal(isWithinHereWindow(pin, new Date(2026, 9, 21, 16, 0, 0)), false);
    assert.equal(endOfLocalDay("2026-10-21").getHours(), 23);
  });

  it("hides an expired truck even if exact coords remain stored", () => {
    const published = publicMapPin(
      {
        id: "truck",
        name: "Truck",
        location: "Miami, FL",
        mapPin: {
          kind: "mobile",
          optedIn: true,
          exactLat: 25.784,
          exactLng: -80.1875,
          hereOn: "2026-10-20",
          hereFrom: "11:00",
          hereUntil: "14:00",
        },
      },
      today,
    );
    assert.equal(published, null);
  });

  it("rolls the demo truck forward to today when yesterday expired", () => {
    const rolled = refreshDemoMobilePin(
      {
        id: DEMO_MOBILE_ID,
        mapPin: {
          kind: "mobile",
          optedIn: true,
          exactLat: 25.784,
          exactLng: -80.1875,
          hereOn: "2026-10-20",
          hereFrom: "11:00",
          hereUntil: "14:00",
        },
      },
      today,
    );
    assert.equal(rolled.mapPin?.hereOn, localDateKey(today));
    assert.ok(
      publicMapPin(
        { id: DEMO_MOBILE_ID, name: "Truck", location: "Miami, FL", mapPin: rolled.mapPin },
        today,
      ),
    );
  });
});

describe("shop pins and order-ahead", () => {
  it("publishes exact shop pins only after a valid South Florida drop", () => {
    const pin = sanitizeMapPin({
      optedIn: true,
      kind: "shop",
      exactLat: "25.7496",
      exactLng: "-80.257",
      hereOn: "",
      hereFrom: "",
      hereUntil: "",
      orderAhead: true,
    });
    assert.equal(pin?.kind, "shop");
    assert.equal(pin?.exactLat, 25.7496);
    assert.equal(offersOrderAhead(pin), true);

    const published = publicMapPin({
      id: "gables-pantry",
      name: "Gables Pantry",
      location: "Coral Gables, FL",
      mapPin: pin,
    });
    assert.ok(published);
    assert.equal(published.precision, "exact");
    assert.equal(published.orderAhead, true);
  });

  it("rejects a shop pin outside the area and a home pin that tried to be exact", () => {
    const errors = validateMapPinDraft({
      optedIn: true,
      kind: "shop",
      exactLat: "40.7",
      exactLng: "-74.0",
      hereOn: "",
      hereFrom: "",
      hereUntil: "",
      orderAhead: true,
    });
    assert.equal(errors[0]?.field, "mapPin");
    const stripped = migrateMapPin({
      kind: "home",
      optedIn: true,
      exactLat: 25.7,
      exactLng: -80.2,
    });
    assert.deepEqual(stripped, { kind: "home", optedIn: true });
  });
});

function validateBase() {
  return {
    optedIn: true,
    kind: "home" as const,
    exactLat: "",
    exactLng: "",
    hereOn: "2026-10-21",
    hereFrom: "11:00",
    hereUntil: "14:00",
    orderAhead: false,
  };
}
