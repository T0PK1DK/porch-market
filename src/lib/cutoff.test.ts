import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  bakeHoldError,
  bakeState,
  formatOrderBy,
  isBakeAccepting,
  lastPickupEndAfter,
  migrateOrderBy,
  parseOrderBy,
} from "./cutoff.ts";

function at(year: number, month: number, day: number, hour: number, minute = 0): Date {
  return new Date(year, month - 1, day, hour, minute);
}

const FRIDAY_8PM = { weekday: 5, minutes: 20 * 60 };
const THURSDAY_8PM = { weekday: 4, minutes: 20 * 60 };
const SATURDAY_PICKUP = "Saturdays, 9am–noon. Porch pickup.";
const FRI_SAT_PICKUP = "Friday and Saturday, 4–6pm. Pre-order holds go on the railing.";

describe("parseOrderBy", () => {
  it("reads a weekday and evening time", () => {
    assert.deepEqual(parseOrderBy("Friday 8pm"), FRIDAY_8PM);
    assert.deepEqual(parseOrderBy("Fridays at 8:00 pm"), FRIDAY_8PM);
    assert.deepEqual(parseOrderBy("Thu 8"), THURSDAY_8PM);
    assert.deepEqual(parseOrderBy("Sunday noon"), { weekday: 0, minutes: 12 * 60 });
    assert.equal(parseOrderBy(""), null);
    assert.equal(parseOrderBy("8pm"), null);
    assert.equal(parseOrderBy("Friday"), null);
    assert.equal(parseOrderBy("soon"), null);
  });

  it("formats back to a neighbor-facing label", () => {
    assert.equal(formatOrderBy(FRIDAY_8PM), "Friday 8pm");
    assert.equal(formatOrderBy({ weekday: 6, minutes: 16 * 60 + 30 }), "Saturday 4:30pm");
  });

  it("migrates a stored object or a typed string and drops junk", () => {
    assert.deepEqual(migrateOrderBy("Friday 8pm"), FRIDAY_8PM);
    assert.deepEqual(migrateOrderBy(FRIDAY_8PM), FRIDAY_8PM);
    assert.equal(migrateOrderBy({ weekday: 9, minutes: 80 }), undefined);
    assert.equal(migrateOrderBy("nope"), undefined);
    assert.equal(migrateOrderBy(""), undefined);
  });
});

describe("bake-day window", () => {
  it("keeps holds open before Friday 8pm and closes through Saturday pickup", () => {
    const thursday = at(2026, 10, 22, 16);
    const fridayMorning = at(2026, 10, 23, 10);
    const fridayCutoff = at(2026, 10, 23, 20);
    const fridayNight = at(2026, 10, 23, 21);
    const saturdayMorning = at(2026, 10, 24, 10);
    const saturdayAfter = at(2026, 10, 24, 13);

    assert.equal(thursday.getDay(), 4);
    assert.equal(fridayCutoff.getDay(), 5);
    assert.equal(saturdayMorning.getDay(), 6);

    assert.equal(isBakeAccepting(FRIDAY_8PM, SATURDAY_PICKUP, thursday), true);
    assert.equal(isBakeAccepting(FRIDAY_8PM, SATURDAY_PICKUP, fridayMorning), true);
    assert.equal(isBakeAccepting(FRIDAY_8PM, SATURDAY_PICKUP, fridayCutoff), false);
    assert.equal(isBakeAccepting(FRIDAY_8PM, SATURDAY_PICKUP, fridayNight), false);
    assert.equal(isBakeAccepting(FRIDAY_8PM, SATURDAY_PICKUP, saturdayMorning), false);
    assert.equal(isBakeAccepting(FRIDAY_8PM, SATURDAY_PICKUP, saturdayAfter), true);

    assert.match(bakeState(FRIDAY_8PM, SATURDAY_PICKUP, fridayMorning)?.label ?? "", /Order by Friday 8pm/);
    assert.match(bakeState(FRIDAY_8PM, SATURDAY_PICKUP, fridayNight)?.label ?? "", /Too late/);
    assert.match(bakeHoldError(FRIDAY_8PM, SATURDAY_PICKUP, fridayNight) ?? "", /Next order-by is Friday 8pm/);
    assert.equal(bakeHoldError(FRIDAY_8PM, SATURDAY_PICKUP, thursday), null);
  });

  it("closes a two-day cookie drop from Thursday night through Saturday evening", () => {
    const thursdayEvening = at(2026, 10, 22, 19);
    const thursdayNight = at(2026, 10, 22, 21);
    const saturdayDuring = at(2026, 10, 24, 17);
    const saturdayDone = at(2026, 10, 24, 19);

    assert.equal(isBakeAccepting(THURSDAY_8PM, FRI_SAT_PICKUP, thursdayEvening), true);
    assert.equal(isBakeAccepting(THURSDAY_8PM, FRI_SAT_PICKUP, thursdayNight), false);
    assert.equal(isBakeAccepting(THURSDAY_8PM, FRI_SAT_PICKUP, saturdayDuring), false);
    assert.equal(isBakeAccepting(THURSDAY_8PM, FRI_SAT_PICKUP, saturdayDone), true);
  });

  it("uses the end of the cutoff day when pickup days cannot be parsed", () => {
    const fridayNight = at(2026, 10, 23, 21);
    const saturdayMorning = at(2026, 10, 24, 8);
    const end = lastPickupEndAfter("Come by when you can", at(2026, 10, 23, 20));
    assert.equal(end.getHours(), 23);
    assert.equal(end.getMinutes(), 59);
    assert.equal(isBakeAccepting(FRIDAY_8PM, "Come by when you can", fridayNight), false);
    assert.equal(isBakeAccepting(FRIDAY_8PM, "Come by when you can", saturdayMorning), true);
  });

  it("treats a missing cutoff as always accepting", () => {
    assert.equal(isBakeAccepting(undefined, SATURDAY_PICKUP, at(2026, 10, 23, 21)), true);
    assert.equal(bakeState(undefined, SATURDAY_PICKUP), null);
  });
});
