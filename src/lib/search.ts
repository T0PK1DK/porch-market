import { neighborhoodFromLocation } from "./neighborhoods.ts";

export type SearchableProduct = {
  name: string;
  desc: string;
  category: string;
  communityOffer?: string;
  dietNotes?: string[];
  readyNote?: string;
};

export type SearchableVendor = {
  name: string;
  location: string;
  category: string;
  bio: string;
  pickup: string;
  products: SearchableProduct[];
};

export function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length > 1 || /^\d+$/.test(token));
}

function fieldScore(haystack: string, token: string, weight: number): number {
  const hay = haystack.toLowerCase();
  if (!hay) return 0;
  if (hay === token) return weight * 2;
  const parts = hay.split(/[^a-z0-9]+/g);
  if (parts.includes(token)) return weight;
  if (parts.some((part) => part.startsWith(token))) return weight * 0.85;
  if (hay.includes(token)) return weight * 0.55;
  return 0;
}

export function scoreVendor(vendor: SearchableVendor, query: string): number {
  const tokens = tokenize(query);
  if (!tokens.length) return 1;

  const fields: Array<[string, number]> = [
    [vendor.name, 5],
    [vendor.location, 3.2],
    [neighborhoodFromLocation(vendor.location), 3.2],
    [vendor.category, 2.2],
    [vendor.bio, 1.1],
    [vendor.pickup, 1.1],
    ...vendor.products.flatMap((product): Array<[string, number]> => [
      [product.name, 4.2],
      [product.desc, 1.4],
      [product.category, 2],
      [product.communityOffer ?? "", 1.6],
      [(product.dietNotes ?? []).join(" "), 1.8],
      [product.readyNote ?? "", 1.2],
    ]),
  ];

  let total = 0;
  for (const token of tokens) {
    let best = 0;
    for (const [text, weight] of fields) {
      best = Math.max(best, fieldScore(text, token, weight));
    }
    if (best === 0) return 0;
    total += best;
  }
  return total;
}

export function vendorMatchesQuery(vendor: SearchableVendor, query: string): boolean {
  if (!query.trim()) return true;
  return scoreVendor(vendor, query) > 0;
}

export type MarketSort = "neighborhood" | "open" | "name";
