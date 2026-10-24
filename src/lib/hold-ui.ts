import type { BakeState, Hold, Product } from "./market.ts";

/** Matches `placeHold` — the kitchen never takes more than a dozen on one ticket. */
export const HOLD_QTY_CAP = 12;

export type EmptyCopy = {
  title: string;
  body: string;
  action?: string;
  actionTo?: "/" | "/create";
};

export function clampHoldQty(requested: number, remaining: number | null): number {
  const cap = remaining == null ? HOLD_QTY_CAP : Math.min(HOLD_QTY_CAP, Math.max(0, remaining));
  if (cap <= 0) return 0;
  if (!Number.isFinite(requested) || !Number.isInteger(requested) || requested < 1) return 1;
  return Math.min(requested, cap);
}

export function stepHoldQty(current: number, delta: -1 | 1, remaining: number | null): number {
  const base = Number.isInteger(current) ? current : 1;
  return clampHoldQty(base + delta, remaining);
}

export function formatHoldMoney(amount: number): string {
  const hasCents = Math.round(amount * 100) % 100 !== 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function holdEstimate(
  product: Pick<Product, "price" | "communityOffer">,
  qty: number,
): { amount: number | null; label: string } {
  const count = Math.max(1, Number.isInteger(qty) && qty > 0 ? qty : 1);
  if (product.communityOffer === "Free") {
    return { amount: 0, label: "Free · pick up at the porch" };
  }
  if (product.communityOffer === "Pay what you can") {
    return { amount: null, label: "Pay what you can at pickup" };
  }
  if (product.communityOffer === "Donation-backed") {
    if (product.price > 0) {
      const amount = product.price * count;
      return { amount, label: `About ${formatHoldMoney(amount)} if you can · at pickup` };
    }
    return { amount: 0, label: "Already covered · pick up at the porch" };
  }
  const amount = product.price * count;
  return { amount, label: `About ${formatHoldMoney(amount)} · paid at pickup` };
}

export function holdNameError(): string {
  return "Leave your name so they know whose box it is.";
}

export function cancelHoldPrompt(): string {
  return "Let the kitchen have it back?";
}

export function productShelfHeading(): string {
  return "On the table this week";
}

export function holdTicketHeadline(pickup: string, orderAhead: boolean): string {
  const window = pickup.trim();
  if (window) return window;
  return orderAhead ? "Come by the shop when they mark it ready." : "Come by at the listed pickup.";
}

export function holdStatusPhrase(
  hold: Pick<Hold, "status">,
  opts: { stale?: boolean; orderAhead?: boolean } = {},
): string {
  if (hold.status === "ready_for_pickup") return "Ready for pickup · pay in the shop";
  if (hold.status === "picked_up") return "Picked up";
  if (hold.status === "canceled") return "Canceled";
  if (opts.stale) return "Older than a week";
  if (opts.orderAhead) return "Kitchen is still packing it";
  return "Name on a box";
}

export function cutoffClosedNote(state: Pick<BakeState, "accepting"> | null): string | null {
  if (!state || state.accepting) return null;
  return "Holds reopen after this week's pickup.";
}

export function savedEmptyCopy(): EmptyCopy {
  return {
    title: "No saved porches yet",
    body: "Tap Save on a kitchen you want to find again on this phone.",
    action: "Browse porches",
    actionTo: "/",
  };
}

export function holdsEmptyCopy(ownsPorch: boolean): { kitchen: EmptyCopy | null; yours: EmptyCopy } {
  return {
    kitchen: ownsPorch
      ? {
          title: "No tickets yet",
          body: "When a neighbor asks you to hold something, the ticket lands here.",
        }
      : null,
    yours: {
      title: "Nothing on hold",
      body: "Ask a porch to set something aside. It will show up here until you pick it up.",
      action: "Browse this week",
      actionTo: "/",
    },
  };
}

export function browseEmptyCopy(input: {
  query: string;
  category: string;
  neighborhood: string | null;
}): EmptyCopy {
  const query = input.query.trim();
  if (input.category === "Saved") return savedEmptyCopy();
  if (query && input.category !== "All") {
    return {
      title: "Nothing on the block matches",
      body: `No porches match “${query}” in ${input.category}.`,
    };
  }
  if (query) {
    return {
      title: "Nothing on the block matches",
      body: `No porches match “${query}”.`,
    };
  }
  if (input.category === "Open today") {
    return {
      title: "Nobody listed today",
      body: "No listed pickup window falls on today. Try All, or check tomorrow.",
    };
  }
  if (input.category === "Community kitchen") {
    return {
      title: "No community plates right now",
      body: "No community kitchen plates on this phone right now.",
    };
  }
  if (input.category !== "All") {
    return {
      title: "Nothing on the block matches",
      body: `No ${input.category.toLowerCase()} porches right now.`,
    };
  }
  if (input.neighborhood) {
    return {
      title: "Nothing on the block matches",
      body: `No porches in ${input.neighborhood} with these filters.`,
    };
  }
  return {
    title: "Nothing on the block matches",
    body: "Try another kitchen, or open yours.",
    action: "Open a porch",
    actionTo: "/create",
  };
}

export function missingPorchCopy(): EmptyCopy {
  return {
    title: "That porch isn’t here",
    body: "It may live in another browser. Porches you create stay on the device that made them.",
    action: "Back to the market",
    actionTo: "/",
  };
}

export type HoldFormGate = "open" | "sold_out" | "cutoff";

export function holdFormGate(input: { remaining: number | null; accepting: boolean }): HoldFormGate {
  if (!input.accepting) return "cutoff";
  if (input.remaining === 0) return "sold_out";
  return "open";
}

export function holdFormClosedCopy(gate: HoldFormGate): string | null {
  if (gate === "sold_out") return "That one just went. Spoken for this week.";
  if (gate === "cutoff") return "The order-by time just passed. Holds reopen after this week's pickup.";
  return null;
}

export function qtyDroppedNote(requested: number, remaining: number | null): string | null {
  if (remaining == null) return null;
  if (remaining <= 0) return holdFormClosedCopy("sold_out");
  if (requested > remaining) return `Only ${remaining} left this week. We dropped the count.`;
  return null;
}

export function nextHoldFormState(input: {
  remaining: number | null;
  accepting: boolean;
  qty: number;
}): { gate: HoldFormGate; qty: number; note: string | null; shouldClose: boolean } {
  const gate = holdFormGate(input);
  if (gate === "sold_out") {
    return { gate, qty: 0, note: holdFormClosedCopy(gate), shouldClose: true };
  }
  if (gate === "cutoff") {
    return { gate, qty: input.qty, note: holdFormClosedCopy(gate), shouldClose: true };
  }
  const qty = clampHoldQty(input.qty, input.remaining);
  return {
    gate,
    qty,
    note: qty !== input.qty ? qtyDroppedNote(input.qty, input.remaining) : null,
    shouldClose: false,
  };
}

/** How long to wait to re-check the bake window. Null means not soon enough to arm. */
export function holdWatchDelayMs(nextDue: Date, now = new Date()): number | null {
  const ms = nextDue.getTime() - now.getTime();
  if (!Number.isFinite(ms)) return null;
  if (ms <= 0) return 0;
  if (ms > 60 * 60 * 1000) return null;
  return ms + 40;
}

export function hasDisplayPhoto(src?: string | null): boolean {
  if (typeof src !== "string") return false;
  const value = src.trim();
  if (!value) return false;
  if (value === "none" || value === "null" || value === "undefined") return false;
  return true;
}

export function shortLabel(name: string, max = 48): string {
  const text = name.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(1, max - 1)).trimEnd()}…`;
}

export function copyFailedNote(): string {
  return "Couldn't copy. Select the address bar instead.";
}

export function emptyShelfCopy(): EmptyCopy {
  return {
    title: "Nothing on the table",
    body: "This porch has not listed a bake yet.",
  };
}

export function emptyFeedCopy(): EmptyCopy {
  return {
    title: "Quiet on this phone",
    body: "Open a porch to post an update. Example notes stay marked so they do not look live.",
    action: "Open a porch",
    actionTo: "/create",
  };
}
