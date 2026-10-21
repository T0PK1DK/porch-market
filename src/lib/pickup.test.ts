import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatClock, isOpenNow, isOpenToday, nextPickupLabel, parsePickup, pickupBadge } from "./pickup.ts";

function at(year: number, month: number, day: number, hour: number, minute = 0): Date {
  return new Date(year, month - 1, day, hour, minute);
}

describe("parsePickup", () => {
  it("reads Saturday morning windows with an en dash", () => {
    const window = parsePickup("Saturdays, 9am–noon. Porch pickup. Come by — no delivery.");
    assert.deepEqual(window.days, [6]);
    assert.equal(window.startMinutes, 9 * 60);
    assert.equal(window.endMinutes, 12 * 60);
  });

  it("reads Friday and Saturday evening ranges without a leading meridian", () => {
    const window = parsePickup("Friday and Saturday, 4–6pm. Pre-order holds go on the railing.");
    assert.deepEqual(window.days, [5, 6]);
    assert.equal(window.startMinutes, 16 * 60);
    assert.equal(window.endMinutes, 18 * 60);
  });

  it("treats weekday evenings as Monday–Friday late afternoon", () => {
    const window = parsePickup("Weekday evenings. Text from the gate and someone will step out.");
    assert.deepEqual(window.days, [1, 2, 3, 4, 5]);
    assert.equal(window.startMinutes, 17 * 60);
    assert.equal(window.endMinutes, 21 * 60);
  });

  it("keeps Sunday after 2pm as an open-ended start", () => {
    const window = parsePickup("Sundays after 2pm in Homestead, or a Coral Gables drop-off if you ask ahead.");
    assert.deepEqual(window.days, [0]);
    assert.equal(window.startMinutes, 14 * 60);
    assert.equal(window.endMinutes, null);
  });
});

describe("open and next labels", () => {
  it("knows when a Thursday stoop is open", () => {
    const raw = "Thursdays, 5–7pm, front stoop. Cash or Venmo at the door.";
    const thursdayOpen = at(2026, 10, 22, 17, 30);
    const thursdayMorning = at(2026, 10, 22, 10);
    const friday = at(2026, 10, 23, 12);
    assert.equal(thursdayOpen.getDay(), 4);
    assert.equal(isOpenToday(raw, thursdayOpen), true);
    assert.equal(isOpenNow(parsePickup(raw), thursdayOpen), true);
    assert.equal(isOpenNow(parsePickup(raw), thursdayMorning), false);
    assert.match(nextPickupLabel(raw, thursdayMorning) ?? "", /today at 5pm/i);
    assert.match(nextPickupLabel(raw, friday) ?? "", /Thursday at 5pm/);
    assert.equal(pickupBadge(raw, thursdayOpen)?.kind, "now");
  });

  it("formats clocks without forcing minutes on the hour", () => {
    assert.equal(formatClock(9 * 60), "9am");
    assert.equal(formatClock(12 * 60), "12pm");
    assert.equal(formatClock(16 * 60 + 30), "4:30pm");
  });
});
