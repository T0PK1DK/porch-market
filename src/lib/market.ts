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
  ownerId?: string;
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

export type WeekFood = {
  vendorId: string;
  vendorName: string;
  location: string;
  product: Product;
};

export const VENDORS_KEY = "porch-market-vendors-v1";
export const HOLDS_KEY = "porch-market-holds-v1";
export const OWNER_KEY = "porch-market-owner-v1";

export const PHOTO = {
  bread: "/photos/bread.webp",
  sourdough: "/photos/sourdough.webp",
  focaccia: "/photos/focaccia.webp",
  honey: "/photos/honey.webp",
  honeyJars: "/photos/honey-jars.webp",
  jam: "/photos/jam.webp",
  cookies: "/photos/cookies.webp",
  chocolateChip: "/photos/chocolate-chip.webp",
  shortbread: "/photos/shortbread.webp",
  eggsNest: "/photos/eggs-nest.webp",
  eggs: "/photos/eggs.webp",
  mangoes: "/photos/mangoes.webp",
  hotSauce: "/photos/hot-sauce.webp",
  peppers: "/photos/peppers.webp",
  mojo: "/photos/mojo.webp",
  market: "/photos/market.webp",
} as const;

export const PHOTO_SIZE: Record<string, { width: number; height: number }> = {
  [PHOTO.bread]: { width: 640, height: 426 },
  [PHOTO.sourdough]: { width: 640, height: 426 },
  [PHOTO.focaccia]: { width: 640, height: 426 },
  [PHOTO.honey]: { width: 720, height: 720 },
  [PHOTO.honeyJars]: { width: 640, height: 426 },
  [PHOTO.jam]: { width: 426, height: 640 },
  [PHOTO.cookies]: { width: 512, height: 640 },
  [PHOTO.chocolateChip]: { width: 512, height: 640 },
  [PHOTO.shortbread]: { width: 720, height: 720 },
  [PHOTO.eggsNest]: { width: 640, height: 426 },
  [PHOTO.eggs]: { width: 640, height: 426 },
  [PHOTO.mangoes]: { width: 640, height: 480 },
  [PHOTO.hotSauce]: { width: 800, height: 800 },
  [PHOTO.peppers]: { width: 640, height: 426 },
  [PHOTO.mojo]: { width: 480, height: 640 },
  [PHOTO.market]: { width: 640, height: 426 },
};

const UNSPLASH_TO_LOCAL: Record<string, string> = {
  "photo-1509440159596-0249088772ff": PHOTO.bread,
  "photo-1549931319-a545dcf3bc73": PHOTO.sourdough,
  "photo-1586444248902-2f64eddc13df": PHOTO.focaccia,
  "photo-1587049352846-4a222e784d38": PHOTO.honey,
  "photo-1558642452-9d2a7deb7f62": PHOTO.honeyJars,
  "photo-1471943311424-646960669fbc": PHOTO.jam,
  "photo-1499636136210-6f4ee915583e": PHOTO.cookies,
  "photo-1558961363-fa8fdf82db35": PHOTO.chocolateChip,
  "photo-1590080875515-8a3a8dc5735e": PHOTO.shortbread,
  "photo-1582722872445-44dc5f7e3c8f": PHOTO.eggsNest,
  "photo-1498654077810-12c21d4d6dc3": PHOTO.eggs,
  "photo-1553279768-865429fa0078": PHOTO.mangoes,
  "photo-1583119022894-919a68a3d0e3": PHOTO.hotSauce,
  "photo-1472476443507-c7a5948779aa": PHOTO.peppers,
  "photo-1611080626919-7cf5a9dbab5b": PHOTO.mojo,
  "photo-1464226184884-fa280b210c07": PHOTO.market,
};

export const CATEGORY_COVER: Record<Category, string> = {
  "Baked Goods": PHOTO.bread,
  "Honey & Preserves": PHOTO.honey,
  "Produce & Eggs": PHOTO.eggsNest,
  "Hot Sauce & Condiments": PHOTO.hotSauce,
  "Other Cottage Food": PHOTO.market,
};

export const SAMPLE_VENDORS: Vendor[] = [
  {
    id: "bayfront-sourdough",
    name: "Bayfront Sourdough",
    location: "Miami Beach, FL",
    category: "Baked Goods",
    bio: "Weekend loaves and focaccia from a home oven two blocks off the bay. The crumb is open, the crust is loud, and Saturday is the only day the porch is open.",
    image: PHOTO.bread,
    pickup: "Saturdays, 9am–noon. Porch pickup. Come by — no delivery.",
    products: [
      {
        id: "country-loaf",
        name: "Country sourdough",
        price: 12,
        desc: "Tangy everyday loaf. Feeds two or three.",
        image: PHOTO.sourdough,
      },
      {
        id: "rosemary-focaccia",
        name: "Rosemary focaccia",
        price: 10,
        desc: "Olive oil, sea salt, same morning only.",
        image: PHOTO.focaccia,
      },
    ],
  },
  {
    id: "keys-honey",
    name: "Keys Honey Co.",
    location: "Homestead, FL",
    category: "Honey & Preserves",
    bio: "Wildflower honey from hives south of town, plus a small jam shelf that follows the fruit. Jars are labeled, sealed, and ready for a local handoff.",
    image: PHOTO.honeyJars,
    pickup: "Sundays after 2pm in Homestead, or a Coral Gables drop-off if you ask ahead.",
    products: [
      {
        id: "wildflower-honey",
        name: "Wildflower honey, 12 oz",
        price: 14,
        desc: "Raw and unfiltered. Crystallizes when it feels like it.",
        image: PHOTO.honey,
      },
      {
        id: "guava-jam",
        name: "Guava jam",
        price: 9,
        desc: "Small batch, less sugar than the grocery kind.",
        image: PHOTO.jam,
      },
    ],
  },
  {
    id: "porch-cookies",
    name: "Porch Cookie Drop",
    location: "Coral Gables, FL",
    category: "Baked Goods",
    bio: "One baker, two days, cookies that are supposed to bend before they break. Pre-order so the porch box has your name on it.",
    image: PHOTO.cookies,
    pickup: "Friday and Saturday, 4–6pm. Pre-order holds go on the railing.",
    products: [
      {
        id: "choc-dozen",
        name: "Brown-butter chocolate chip, dozen",
        price: 16,
        desc: "Deep butter, big chips, edges just set.",
        image: PHOTO.chocolateChip,
      },
      {
        id: "lime-shortbread",
        name: "Lime shortbread, half dozen",
        price: 9,
        desc: "Key lime zest, sandy crumb.",
        image: PHOTO.shortbread,
      },
    ],
  },
  {
    id: "grove-yard-eggs",
    name: "Grove Yard Eggs",
    location: "Coconut Grove, FL",
    category: "Produce & Eggs",
    bio: "A small backyard flock and whatever the mango tree decides to do. Eggs are ungraded and unwashed until you ask — bring a carton back if you have one.",
    image: PHOTO.eggsNest,
    pickup: "Weekday evenings. Text from the gate and someone will step out.",
    products: [
      {
        id: "dozen-eggs",
        name: "Backyard eggs, dozen",
        price: 8,
        desc: "Mixed sizes. Yolks the color of a mango.",
        image: PHOTO.eggs,
      },
      {
        id: "mango-bag",
        name: "Mangoes, by the bag",
        price: 7,
        desc: "In season only. Ripe enough for tonight.",
        image: PHOTO.mangoes,
      },
    ],
  },
  {
    id: "calle-heat",
    name: "Calle Heat",
    location: "Little Havana, FL",
    category: "Hot Sauce & Condiments",
    bio: "Mango habanero and a mojo that actually tastes like sour orange, not bottled mystery. Bottled in a home kitchen on the same block where it’s sold.",
    image: PHOTO.hotSauce,
    pickup: "Thursdays, 5–7pm, front stoop. Cash or Venmo at the door.",
    products: [
      {
        id: "mango-habanero",
        name: "Mango habanero, 5 oz",
        price: 10,
        desc: "Sweet first, then it stays.",
        image: PHOTO.peppers,
      },
      {
        id: "mojo",
        name: "Sour orange mojo",
        price: 8,
        desc: "Garlic, cumin, enough acid for a whole pork shoulder.",
        image: PHOTO.mojo,
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
  if (!vendor.products.length) return 0;
  return Math.min(...vendor.products.map((p) => p.price));
}

export function photoSize(src: string): { width: number; height: number } {
  return PHOTO_SIZE[src] ?? { width: 640, height: 426 };
}

export function thisWeeksFood(vendors: Vendor[]): WeekFood[] {
  return vendors.flatMap((vendor) => {
    const product = vendor.products[0];
    if (!product) return [];
    return [
      {
        vendorId: vendor.id,
        vendorName: vendor.name,
        location: vendor.location,
        product,
      },
    ];
  });
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getDeviceOwnerId(): string {
  if (!canUseStorage()) return "";
  const existing = localStorage.getItem(OWNER_KEY);
  if (existing) return existing;
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? `owner-${crypto.randomUUID()}`
      : `owner-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  localStorage.setItem(OWNER_KEY, id);
  return id;
}

export function isOwnedByThisDevice(vendor: Vendor | undefined | null): boolean {
  if (!vendor) return false;
  const ownerId = getDeviceOwnerId();
  return Boolean(ownerId) && vendor.ownerId === ownerId;
}

export function isLocalPhoto(url: string): boolean {
  return url.startsWith("/photos/") && !url.includes("..") && !url.includes("//");
}

export function localizeImage(url: string, fallback: string): string {
  const trimmed = url.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith("data:image/")) return trimmed;
  if (isLocalPhoto(trimmed)) return trimmed;
  const unsplash = trimmed.match(/photo-[\w-]+/);
  if (unsplash && UNSPLASH_TO_LOCAL[unsplash[0]]) return UNSPLASH_TO_LOCAL[unsplash[0]];
  return fallback;
}

export function safeImage(url: string, fallback: string): string {
  return localizeImage(url, fallback);
}

function asCategory(value: unknown): Category {
  return CATEGORIES.includes(value as Category) ? (value as Category) : "Other Cottage Food";
}

function migrateProduct(raw: unknown, fallback: string, index: number): Product | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Partial<Product>;
  if (typeof p.name !== "string" || !p.name.trim()) return null;
  const price = typeof p.price === "number" && Number.isFinite(p.price) && p.price >= 0 ? p.price : 0;
  return {
    id: typeof p.id === "string" && p.id ? p.id : `p-${index}`,
    name: p.name.trim(),
    price,
    desc: typeof p.desc === "string" ? p.desc : "",
    image: localizeImage(typeof p.image === "string" ? p.image : "", fallback),
  };
}

export function migrateVendor(raw: unknown, ownerId: string): { vendor: Vendor | null; changed: boolean } {
  if (!raw || typeof raw !== "object") return { vendor: null, changed: true };
  const v = raw as Partial<Vendor> & { products?: unknown };
  if (typeof v.id !== "string" || !v.id) return { vendor: null, changed: true };

  const category = asCategory(v.category);
  const fallback = CATEGORY_COVER[category];
  const image = localizeImage(typeof v.image === "string" ? v.image : "", fallback);
  const products = Array.isArray(v.products)
    ? v.products.flatMap((item, index) => {
        const product = migrateProduct(item, fallback, index);
        return product ? [product] : [];
      })
    : [];

  let owner: string | undefined = typeof v.ownerId === "string" && v.ownerId ? v.ownerId : undefined;
  if (!owner && v.id.startsWith("custom-") && ownerId) owner = ownerId;

  const vendor: Vendor = {
    id: v.id,
    name: typeof v.name === "string" && v.name.trim() ? v.name.trim() : "Porch kitchen",
    location: typeof v.location === "string" ? v.location : "",
    category,
    bio: typeof v.bio === "string" ? v.bio : "",
    image,
    pickup: typeof v.pickup === "string" ? v.pickup : "",
    products,
    ownerId: owner,
  };

  const changed =
    vendor.image !== v.image ||
    vendor.ownerId !== v.ownerId ||
    vendor.category !== v.category ||
    !Array.isArray(v.products) ||
    vendor.products.length !== v.products.length ||
    vendor.products.some((product, index) => {
      const prev = Array.isArray(v.products) ? (v.products[index] as Partial<Product> | undefined) : undefined;
      return !prev || product.image !== prev.image || product.id !== prev.id;
    });

  return { vendor, changed };
}

export function migrateVendors(input: unknown, ownerId: string): { vendors: Vendor[]; changed: boolean } {
  if (!Array.isArray(input) || input.length === 0) {
    return { vendors: SAMPLE_VENDORS, changed: false };
  }
  let changed = false;
  const vendors: Vendor[] = [];
  for (const raw of input) {
    const result = migrateVendor(raw, ownerId);
    if (result.changed) changed = true;
    if (result.vendor) vendors.push(result.vendor);
  }
  return { vendors: vendors.length ? vendors : SAMPLE_VENDORS, changed };
}

export function loadVendors(): Vendor[] {
  if (!canUseStorage()) return SAMPLE_VENDORS;
  try {
    const raw = localStorage.getItem(VENDORS_KEY);
    if (!raw) return SAMPLE_VENDORS;
    const parsed = JSON.parse(raw) as unknown;
    const { vendors, changed } = migrateVendors(parsed, getDeviceOwnerId());
    if (changed) saveVendors(vendors);
    return vendors;
  } catch {
    return SAMPLE_VENDORS;
  }
}

export function saveVendors(vendors: Vendor[]): void {
  if (!canUseStorage()) return;
  const persist = vendors.some((v) => v.ownerId || v.id.startsWith("custom-"));
  if (!persist) {
    localStorage.removeItem(VENDORS_KEY);
    return;
  }
  localStorage.setItem(VENDORS_KEY, JSON.stringify(vendors));
}

function localizeVendor(vendor: Vendor): Vendor {
  const fallback = CATEGORY_COVER[vendor.category];
  return {
    ...vendor,
    image: localizeImage(vendor.image, fallback),
    products: vendor.products.map((product) => ({
      ...product,
      image: localizeImage(product.image, fallback),
    })),
  };
}

export function addVendor(vendor: Vendor): Vendor[] {
  const ownerId = getDeviceOwnerId();
  const owned = localizeVendor({ ...vendor, ownerId: ownerId || vendor.ownerId });
  const next = [owned, ...loadVendors().filter((v) => v.id !== owned.id)];
  saveVendors(next);
  return next;
}

export function updateVendor(vendor: Vendor): Vendor[] {
  const current = loadVendors();
  const existing = current.find((v) => v.id === vendor.id);
  if (!existing || !isOwnedByThisDevice(existing)) return current;
  const nextVendor = localizeVendor({ ...vendor, id: existing.id, ownerId: existing.ownerId });
  const next = current.map((v) => (v.id === vendor.id ? nextVendor : v));
  saveVendors(next);
  return next;
}

export function addProduct(vendorId: string, product: Product): Vendor[] {
  const current = loadVendors();
  const vendor = current.find((v) => v.id === vendorId);
  if (!vendor || !isOwnedByThisDevice(vendor)) return current;
  const id = product.id.trim() || `p-${Date.now().toString(36)}`;
  if (vendor.products.some((item) => item.id === id)) return current;
  return updateVendor({
    ...vendor,
    products: [...vendor.products, { ...product, id }],
  });
}

export function removeProduct(vendorId: string, productId: string): Vendor[] {
  const current = loadVendors();
  const vendor = current.find((v) => v.id === vendorId);
  if (!vendor || !isOwnedByThisDevice(vendor)) return current;
  if (vendor.products.length <= 1) return current;
  return updateVendor({
    ...vendor,
    products: vendor.products.filter((item) => item.id !== productId),
  });
}

export function removeVendor(id: string): Vendor[] {
  const current = loadVendors();
  const vendor = current.find((v) => v.id === id);
  if (!vendor || !isOwnedByThisDevice(vendor)) return current;
  const next = current.filter((v) => v.id !== id);
  saveVendors(next);
  return next;
}

export function loadHolds(): Hold[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(HOLDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isHold);
  } catch {
    return [];
  }
}

function isHold(value: unknown): value is Hold {
  if (!value || typeof value !== "object") return false;
  const hold = value as Hold;
  return (
    typeof hold.id === "string" &&
    typeof hold.vendorId === "string" &&
    typeof hold.productId === "string" &&
    typeof hold.productName === "string" &&
    typeof hold.buyerName === "string" &&
    typeof hold.createdAt === "string"
  );
}

export function saveHold(hold: Hold): Hold[] {
  const next = [hold, ...loadHolds().filter((item) => item.id !== hold.id)];
  if (canUseStorage()) localStorage.setItem(HOLDS_KEY, JSON.stringify(next));
  return next;
}

export function removeHold(id: string): Hold[] {
  const next = loadHolds().filter((h) => h.id !== id);
  if (canUseStorage()) localStorage.setItem(HOLDS_KEY, JSON.stringify(next));
  return next;
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
