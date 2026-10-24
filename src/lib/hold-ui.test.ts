import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  browseEmptyCopy,
  cancelHoldPrompt,
  clampHoldQty,
  copyFailedNote,
  cutoffClosedNote,
  emptyFeedCopy,
  emptyShelfCopy,
  formatHoldMoney,
  hasDisplayPhoto,
  holdEstimate,
  holdFormClosedCopy,
  holdFormGate,
  holdNameError,
  holdStatusPhrase,
  holdTicketHeadline,
  holdWatchDelayMs,
  holdsEmptyCopy,
  missingPorchCopy,
  nextHoldFormState,
  productShelfHeading,
  qtyDroppedNote,
  savedEmptyCopy,
  shortLabel,
  stepHoldQty,
} from "./hold-ui.ts";

describe("clampHoldQty", () => {
  it("keeps a requested count inside what is left, and never above a dozen", () => {
    assert.equal(clampHoldQty(2, 8), 2);
    assert.equal(clampHoldQty(40, 8), 8);
    assert.equal(clampHoldQty(40, null), 12);
    assert.equal(clampHoldQty(0, 8), 1);
    assert.equal(clampHoldQty(-3, 8), 1);
    assert.equal(clampHoldQty(1.5, 8), 1);
    assert.equal(clampHoldQty(Number.NaN, 8), 1);
    assert.equal(clampHoldQty(3, 0), 0);
    assert.equal(clampHoldQty(3, -2), 0);
  });
});

describe("stepHoldQty", () => {
  it("steps by one and stops at the remaining cap", () => {
    assert.equal(stepHoldQty(1, 1, 3), 2);
    assert.equal(stepHoldQty(3, 1, 3), 3);
    assert.equal(stepHoldQty(2, -1, 8), 1);
    assert.equal(stepHoldQty(1, -1, 8), 1);
    assert.equal(stepHoldQty(1, 1, 0), 0);
  });
});

describe("holdEstimate", () => {
  it("names a paid-at-pickup total without sounding like a charge", () => {
    assert.deepEqual(holdEstimate({ price: 12 }, 2), {
      amount: 24,
      label: "About $24 · paid at pickup",
    });
    assert.equal(holdEstimate({ price: 8.5 }, 1).label, "About $8.50 · paid at pickup");
    assert.deepEqual(holdEstimate({ price: 0, communityOffer: "Free" }, 3), {
      amount: 0,
      label: "Free · pick up at the porch",
    });
    assert.deepEqual(holdEstimate({ price: 0, communityOffer: "Pay what you can" }, 1), {
      amount: null,
      label: "Pay what you can at pickup",
    });
    assert.equal(
      holdEstimate({ price: 6, communityOffer: "Donation-backed" }, 2).label,
      "About $12 if you can · at pickup",
    );
    assert.equal(
      holdEstimate({ price: 0, communityOffer: "Donation-backed" }, 1).label,
      "Already covered · pick up at the porch",
    );
    assert.equal(formatHoldMoney(16), "$16");
  });
});

describe("hold copy", () => {
  it("keeps the kitchen message and a pickup-first ticket headline", () => {
    assert.equal(holdNameError(), "Leave your name so they know whose box it is.");
    assert.equal(cancelHoldPrompt(), "Let the kitchen have it back?");
    assert.equal(productShelfHeading(), "On the table this week");
    assert.equal(holdTicketHeadline("Saturdays, 9am–noon", false), "Saturdays, 9am–noon");
    assert.equal(holdTicketHeadline("  ", true), "Come by the shop when they mark it ready.");
    assert.equal(holdTicketHeadline("", false), "Come by at the listed pickup.");
    assert.equal(holdStatusPhrase({ status: "ready_for_pickup" }), "Ready for pickup · pay in the shop");
    assert.equal(holdStatusPhrase({ status: "open" }), "Name on a box");
    assert.equal(holdStatusPhrase({ status: "open" }, { stale: true }), "Older than a week");
    assert.equal(holdStatusPhrase({ status: "open" }, { orderAhead: true }), "Kitchen is still packing it");
    assert.equal(holdStatusPhrase({ status: "picked_up" }), "Picked up");
    assert.equal(cutoffClosedNote({ accepting: true }), null);
    assert.equal(cutoffClosedNote({ accepting: false }), "Holds reopen after this week's pickup.");
    assert.equal(cutoffClosedNote(null), null);
  });

  it("gives shoppers a next step, and only asks makers to open a porch when that is the ask", () => {
    const saved = savedEmptyCopy();
    assert.equal(saved.action, "Browse porches");
    assert.equal(saved.actionTo, "/");
    assert.doesNotMatch(saved.body, /open a porch/i);

    const noPorch = holdsEmptyCopy(false);
    assert.equal(noPorch.kitchen, null);
    assert.equal(noPorch.yours.action, "Browse this week");

    const withPorch = holdsEmptyCopy(true);
    assert.ok(withPorch.kitchen);
    assert.equal(withPorch.kitchen?.title, "No tickets yet");

    const missing = missingPorchCopy();
    assert.equal(missing.actionTo, "/");

    assert.equal(browseEmptyCopy({ query: "", category: "Saved", neighborhood: null }).action, "Browse porches");
    assert.match(
      browseEmptyCopy({ query: "lime", category: "Baked", neighborhood: null }).body,
      /lime.*Baked/,
    );
    assert.match(browseEmptyCopy({ query: "", category: "Open today", neighborhood: null }).body, /today/);
    assert.equal(browseEmptyCopy({ query: "", category: "All", neighborhood: null }).actionTo, "/create");
  });
});

describe("hold form watch", () => {
  it("closes the form when the last loaf goes or the cutoff hits", () => {
    assert.equal(holdFormGate({ remaining: 2, accepting: true }), "open");
    assert.equal(holdFormGate({ remaining: 0, accepting: true }), "sold_out");
    assert.equal(holdFormGate({ remaining: 3, accepting: false }), "cutoff");
    assert.equal(holdFormGate({ remaining: null, accepting: true }), "open");

    const gone = nextHoldFormState({ remaining: 0, accepting: true, qty: 2 });
    assert.equal(gone.shouldClose, true);
    assert.equal(gone.note, "That one just went. Spoken for this week.");

    const late = nextHoldFormState({ remaining: 4, accepting: false, qty: 1 });
    assert.equal(late.shouldClose, true);
    assert.match(late.note ?? "", /order-by time just passed/);
    assert.equal(holdFormClosedCopy("open"), null);

    const drop = nextHoldFormState({ remaining: 1, accepting: true, qty: 3 });
    assert.equal(drop.shouldClose, false);
    assert.equal(drop.qty, 1);
    assert.equal(drop.note, "Only 1 left this week. We dropped the count.");
    assert.equal(qtyDroppedNote(1, 1), null);
  });

  it("arms a short timer only when the cutoff is within the hour", () => {
    const now = new Date(2026, 9, 22, 19, 30);
    const soon = new Date(2026, 9, 22, 20, 0);
    const later = new Date(2026, 9, 23, 20, 0);
    const delay = holdWatchDelayMs(soon, now);
    assert.ok(delay != null && delay > 0 && delay < 31 * 60 * 1000);
    assert.equal(holdWatchDelayMs(later, now), null);
    assert.equal(holdWatchDelayMs(now, now), 0);
  });
});

describe("labels and photos", () => {
  it("clips a long name and treats a blank src as no photo", () => {
    assert.equal(shortLabel("  Lime  loaf  "), "Lime loaf");
    assert.equal(shortLabel("A".repeat(60), 12), `${"A".repeat(11)}…`);
    assert.equal(hasDisplayPhoto("/photos/bread.webp"), true);
    assert.equal(hasDisplayPhoto(""), false);
    assert.equal(hasDisplayPhoto("   "), false);
    assert.equal(hasDisplayPhoto("none"), false);
    assert.equal(hasDisplayPhoto(undefined), false);
    assert.equal(copyFailedNote().startsWith("Couldn't copy"), true);
    assert.equal(emptyShelfCopy().title, "Nothing on the table");
    assert.equal(emptyFeedCopy().actionTo, "/create");
  });
});
