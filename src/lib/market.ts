export const CATEGORIES = [
  "Baked Goods",
  "Honey & Preserves",
  "Produce & Eggs",
  "Hot Sauce & Condiments",
  "Other Cottage Food",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Product = {
  id: string;
  name: string;
  price: number;
  desc: string;
  image: string;
};

export type Vendor = {
  id: string;
  name: string;
  location: string;
  category: Category;
  bio: string;
  image: string;
  pickup: string;
  products: Product[];
};

export type Hold = {
  id: string;
  vendorId: string;
  productId: string;
  productName: string;
  buyerName: string;
  note: string;
  createdAt: string;
};

const VENDORS_KEY = "porch-market-vendors-v1";
const HOLDS_KEY = "porch-market-holds-v1";

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const CATEGORY_COVER: Record<Category, string> = {
  "Baked Goods": img("photo-1509440159596-0249088772ff"),
  "Honey & Preserves": img("photo-1587049352846-4a222e784d38"),
  "Produce & Eggs": img("photo-1582722872445-44dc5f7e3c8f"),
  "Hot Sauce & Condiments": img("photo-1583119022894-919a68a3d0e3"),
  "Other Cottage Food": img("photo-1464226184884-fa280b210c07"),
};

export const SAMPLE_VENDORS: Vendor[] = [
  {
    id: "bayfront-sourdough",
    name: "Bayfront Sourdough",
    location: "Miami Beach, FL",
    category: "Baked Goods",
    bio: "Weekend loaves and focaccia from a home oven two blocks off the bay. The crumb is open, the crust is loud, and Saturday is the only day the porch is open.",
    image: img("photo-1509440159596-0249088772ff"),
    pickup: "Saturdays, 9am–noon. Porch pickup. Come by — no delivery.",
    products: [
      {
        id: "country-loaf",
        name: "Country sourdough",
        price: 12,
        desc: "Tangy everyday loaf. Feeds two or three.",
        image: img("photo-1549931319-a545dcf3bc73", 800),
      },
      {
        id: "rosemary-focaccia",
        name: "Rosemary focaccia",
        price: 10,
        desc: "Olive oil, sea salt, same morning only.",
        image: img("photo-1586444248902-2f64eddc13df", 800),
      },
    ],
  },
  {
    id: "keys-honey",
    name: "Keys Honey Co.",
    location: "Homestead, FL",
    category: "Honey & Preserves",
    bio: "Wildflower honey from hives south of town, plus a small jam shelf that follows the fruit. Jars are labeled, sealed, and ready for a local handoff.",
    image: img("photo-1558642452-9d2a7deb7f62"),
    pickup: "Sundays after 2pm in Homestead, or a Coral Gables drop-off if you ask ahead.",
    products: [
      {
        id: "wildflower-honey",
        name: "Wildflower honey, 12 oz",
        price: 14,
        desc: "Raw and unfiltered. Crystallizes when it feels like it.",
        image: img("photo-1587049352846-4a222e784d38", 800),
      },
      {
        id: "guava-jam",
        name: "Guava jam",
        price: 9,
        desc: "Small batch, less sugar than the grocery kind.",
        image: img("photo-1471943311424-646960669fbc", 800),
      },
    ],
  },
  {
    id: "porch-cookies",
    name: "Porch Cookie Drop",
    location: "Coral Gables, FL",
    category: "Baked Goods",
    bio: "One baker, two days, cookies that are supposed to bend before they break. Pre-order so the porch box has your name on it.",
    image: img("photo-1499636136210-6f4ee915583e"),
    pickup: "Friday and Saturday, 4–6pm. Pre-order holds go on the railing.",
    products: [
      {
        id: "choc-dozen",
        name: "Brown-butter chocolate chip, dozen",
        price: 16,
        desc: "Deep butter, big chips, edges just set.",
        image: img("photo-1558961363-fa8fdf82db35", 800),
      },
      {
        id: "lime-shortbread",
        name: "Lime shortbread, half dozen",
        price: 9,
        desc: "Key lime zest, sandy crumb.",
        image: img("photo-1590080875515-8a3a8dc5735e", 800),
      },
    ],
  },
  {
    id: "grove-yard-eggs",
    name: "Grove Yard Eggs",
    location: "Coconut Grove, FL",
    category: "Produce & Eggs",
    bio: "A small backyard flock and whatever the mango tree decides to do. Eggs are ungraded and unwashed until you ask — bring a carton back if you have one.",
    image: img("photo-1582722872445-44dc5f7e3c8f"),
    pickup: "Weekday evenings. Text from the gate and someone will step out.",
    products: [
      {
        id: "dozen-eggs",
        name: "Backyard eggs, dozen",
        price: 8,
        desc: "Mixed sizes. Yolks the color of a mango.",
        image: img("photo-1498654077810-12c21d4d6dc3", 800),
      },
      {
        id: "mango-bag",
        name: "Mangoes, by the bag",
        price: 7,
        desc: "In season only. Ripe enough for tonight.",
        image: img("photo-1553279768-865429fa0078", 800),
      },
    ],
  },
  {
    id: "calle-heat",
    name: "Calle Heat",
    location: "Little Havana, FL",
    category: "Hot Sauce & Condiments",
    bio: "Mango habanero and a mojo that actually tastes like sour orange, not bottled mystery. Bottled in a home kitchen on the same block where it’s sold.",
    image: img("photo-1583119022894-919a68a3d0e3"),
    pickup: "Thursdays, 5–7pm, front stoop. Cash or Venmo at the door.",
    products: [
      {
        id: "mango-habanero",
        name: "Mango habanero, 5 oz",
        price: 10,
        desc: "Sweet first, then it stays.",
        image: img("photo-1472476443507-c7a5948779aa", 800),
      },
      {
        id: "mojo",
        name: "Sour orange mojo",
        price: 8,
        desc: "Garlic, cumin, enough acid for a whole pork shoulder.",
        image: img("photo-1611080626919-7cf5a9dbab5b", 800),
      },
    ],
  },
];

export function money(amount: number): string {
  const hasCents = Math.round(amount * 100) % 100 !== 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function fromPrice(vendor: Vendor): number {
  return Math.min(...vendor.products.map((p) => p.price));
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadVendors(): Vendor[] {
  if (!canUseStorage()) return SAMPLE_VENDORS;
  try {
    const raw = localStorage.getItem(VENDORS_KEY);
    if (!raw) return SAMPLE_VENDORS;
    const parsed = JSON.parse(raw) as Vendor[];
    if (!Array.isArray(parsed) || parsed.length === 0) return SAMPLE_VENDORS;
    return parsed;
  } catch {
    return SAMPLE_VENDORS;
  }
}

export function saveVendors(vendors: Vendor[]): void {
  if (!canUseStorage()) return;
  const custom = vendors.some((v) => v.id.startsWith("custom-"));
  if (!custom) {
    localStorage.removeItem(VENDORS_KEY);
    return;
  }
  localStorage.setItem(VENDORS_KEY, JSON.stringify(vendors));
}

export function addVendor(vendor: Vendor): Vendor[] {
  const next = [vendor, ...loadVendors().filter((v) => v.id !== vendor.id)];
  saveVendors(next);
  return next;
}

export function removeVendor(id: string): Vendor[] {
  const next = loadVendors().filter((v) => v.id !== id);
  saveVendors(next);
  return next;
}

export function loadHolds(): Hold[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(HOLDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Hold[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHold(hold: Hold): Hold[] {
  const next = [hold, ...loadHolds()];
  if (canUseStorage()) localStorage.setItem(HOLDS_KEY, JSON.stringify(next));
  return next;
}

export function removeHold(id: string): Hold[] {
  const next = loadHolds().filter((h) => h.id !== id);
  if (canUseStorage()) localStorage.setItem(HOLDS_KEY, JSON.stringify(next));
  return next;
}

export function safeImage(url: string, fallback: string): string {
  const trimmed = url.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith("data:image/")) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") return parsed.toString();
  } catch {
    /* ignore */
  }
  return fallback;
}

export function slugId(name: string): string {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 36) || "porch";
  return `custom-${base}-${Date.now().toString(36)}`;
}

export function resizeImage(file: File, max = 1100, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, max / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Could not read that photo."));
        return;
      }
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read that photo."));
    };
    image.src = objectUrl;
  });
}
