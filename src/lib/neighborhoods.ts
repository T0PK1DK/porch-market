export type Neighborhood = {
  id: string;
  name: string;
  aliases: string[];
  /** Stylized block-map position, 0–100. */
  x: number;
  y: number;
};

export const NEIGHBORHOODS: Neighborhood[] = [
  { id: "miami-beach", name: "Miami Beach", aliases: ["miami beach", "south beach", "mid-beach", "midbeach"], x: 86, y: 28 },
  { id: "little-haiti", name: "Little Haiti", aliases: ["little haiti", "lemon city"], x: 48, y: 22 },
  { id: "coconut-grove", name: "Coconut Grove", aliases: ["coconut grove", "the grove"], x: 42, y: 58 },
  { id: "coral-gables", name: "Coral Gables", aliases: ["coral gables", "gables"], x: 32, y: 72 },
  { id: "little-havana", name: "Little Havana", aliases: ["little havana", "calle ocho"], x: 38, y: 40 },
  { id: "homestead", name: "Homestead", aliases: ["homestead", "florida city", "redland"], x: 18, y: 88 },
  { id: "miami", name: "Miami", aliases: ["downtown miami", "brickell", "wynwood", "miami"], x: 58, y: 38 },
];

function words(value: string): string[] {
  return value.toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean);
}

function includesPhrase(hay: string, alias: string): boolean {
  const hayWords = words(hay);
  const aliasWords = words(alias);
  if (!aliasWords.length) return false;
  for (let i = 0; i <= hayWords.length - aliasWords.length; i += 1) {
    if (aliasWords.every((word, index) => hayWords[i + index] === word)) return true;
  }
  return false;
}

export function neighborhoodFromLocation(location: string): string {
  const hay = location.trim();
  if (!hay) return "Nearby";
  let best: { name: string; length: number } | null = null;
  for (const place of NEIGHBORHOODS) {
    for (const alias of place.aliases) {
      if (!includesPhrase(hay, alias)) continue;
      if (!best || alias.length > best.length) best = { name: place.name, length: alias.length };
    }
  }
  if (best) return best.name;
  const city = location.split(",")[0]?.trim();
  return city || "Nearby";
}

export function neighborhoodIdFromLocation(location: string): string | null {
  const name = neighborhoodFromLocation(location);
  return NEIGHBORHOODS.find((place) => place.name === name)?.id ?? null;
}

export function groupByNeighborhood<T extends { location: string }>(items: T[]): { name: string; items: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const name = neighborhoodFromLocation(item.location);
    const list = groups.get(name) ?? [];
    list.push(item);
    groups.set(name, list);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, groupItems]) => ({ name, items: groupItems }));
}
