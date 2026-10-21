import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { relativeTime } from "./time.ts";

describe("relativeTime", () => {
  it("uses minutes, hours, days, then a short date", () => {
    const now = Date.parse("2026-10-21T12:00:00.000Z");
    assert.match(relativeTime("2026-10-21T11:20:00.000Z", now), /minute/);
    assert.match(relativeTime("2026-10-21T08:00:00.000Z", now), /hour/);
    assert.match(relativeTime("2026-10-19T12:00:00.000Z", now), /day|yesterday/i);
    assert.match(relativeTime("2026-09-01T12:00:00.000Z", now), /Sep/);
    assert.equal(relativeTime("not-a-date", now), "");
  });
});
