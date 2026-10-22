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
