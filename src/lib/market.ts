export const CATEGORIES = ["Farm", "Fresh", "Baked", "Hot meals", "Cold meals", "Meal prep"] as const;

export type Category = (typeof CATEGORIES)[number];

export const COMMUNITY_KITCHEN_OFFERS = ["Free", "Pay what you can", "Donation-backed"] as const;

export type CommunityKitchenOffer = (typeof COMMUNITY_KITCHEN_OFFERS)[number];

export const COMMUNITY_FILTER = "Community kitchen";

export type MarketFilter = Category | "All" | typeof COMMUNITY_FILTER;

export const CATEGORY_ALIASES: Record<string, Category> = {
  "Baked Goods": "Baked",
  "Honey & Preserves": "Fresh",
  "Produce & Eggs": "Farm",
  "Hot Sauce & Condiments": "Fresh",
  "Other Cottage Food": "Fresh",
  baked: "Baked",
  farm: "Farm",
  fresh: "Fresh",
  "hot meals": "Hot meals",
  "cold meals": "Cold meals",
  "meal prep": "Meal prep",
};

export type Product = {
  id: string;
  name: string;
  price: number;
  desc: string;
  image: string;
  category: Category;
  communityOffer?: CommunityKitchenOffer;
};

export type PaymentHandles = {
  cashApp?: string;
  venmo?: string;
  paypal?: string;
  zelle?: string;
};

export type PaymentLink = {
  kind: keyof PaymentHandles;
  label: string;
  value: string;
  href?: string;
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
  payments?: PaymentHandles;
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
export const FEED_KEY = "porch-market-feed-v1";

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
  hotMeal: "/photos/hot-meal.webp",
  rice: "/photos/rice.webp",
  salad: "/photos/salad.webp",
  mealPrep: "/photos/meal-prep.webp",
  stew: "/photos/stew.webp",
} as const;

export const PHOTO_SIZE: Record<string, { width: number; height: number }> = {
  [PHOTO.bread]: { width: 640, height: 426 },
  [PHOTO.sourdough]: { width: 640, height: 426 },
  [PHOTO.focaccia]: { width: 640, height: 426 },
  [PHOTO.honey]: { width: 640, height: 426 },
  [PHOTO.honeyJars]: { width: 640, height: 426 },
  [PHOTO.jam]: { width: 426, height: 640 },
  [PHOTO.cookies]: { width: 512, height: 640 },
  [PHOTO.chocolateChip]: { width: 512, height: 640 },
  [PHOTO.shortbread]: { width: 512, height: 640 },
  [PHOTO.eggsNest]: { width: 640, height: 426 },
  [PHOTO.eggs]: { width: 640, height: 426 },
  [PHOTO.mangoes]: { width: 480, height: 640 },
  [PHOTO.hotSauce]: { width: 800, height: 800 },
  [PHOTO.peppers]: { width: 800, height: 800 },
  [PHOTO.mojo]: { width: 480, height: 640 },
  [PHOTO.market]: { width: 640, height: 426 },
  [PHOTO.hotMeal]: { width: 640, height: 427 },
  [PHOTO.rice]: { width: 640, height: 426 },
  [PHOTO.salad]: { width: 640, height: 427 },
  [PHOTO.mealPrep]: { width: 640, height: 427 },
  [PHOTO.stew]: { width: 640, height: 427 },
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
  "photo-1547592166-23ac45744acd": PHOTO.hotMeal,
  "photo-1512058564366-18510be2db19": PHOTO.rice,
  "photo-1512621776951-a57141f2eefd": PHOTO.salad,
  "photo-1455619452474-d2be8b1e70cd": PHOTO.stew,
};

export const CATEGORY_COVER: Record<Category, string> = {
  Farm: PHOTO.eggsNest,
  Fresh: PHOTO.mangoes,
  Baked: PHOTO.bread,
  "Hot meals": PHOTO.hotMeal,
  "Cold meals": PHOTO.salad,
  "Meal prep": PHOTO.mealPrep,
};

export const SAMPLE_VENDORS: Vendor[] = [
  {
    id: "bayfront-sourdough",
    name: "Bayfront Sourdough",
    location: "Miami Beach, FL",
    category: "Baked",
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
        category: "Baked",
      },
      {
        id: "rosemary-focaccia",
        name: "Rosemary focaccia",
        price: 10,
        desc: "Olive oil, sea salt, same morning only.",
        image: PHOTO.focaccia,
        category: "Baked",
      },
    ],
  },
  {
    id: "keys-honey",
    name: "Keys Honey Co.",
    location: "Homestead, FL",
    category: "Fresh",
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
        category: "Fresh",
      },
      {
        id: "guava-jam",
        name: "Guava jam",
        price: 9,
        desc: "Small batch, less sugar than the grocery kind.",
        image: PHOTO.jam,
        category: "Fresh",
      },
    ],
  },
  {
    id: "porch-cookies",
    name: "Porch Cookie Drop",
    location: "Coral Gables, FL",
    category: "Baked",
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
        category: "Baked",
      },
      {
        id: "lime-shortbread",
        name: "Lime shortbread, half dozen",
        price: 9,
        desc: "Key lime zest, sandy crumb.",
        image: PHOTO.shortbread,
        category: "Baked",
      },
    ],
  },
  {
    id: "grove-yard-eggs",
    name: "Grove Yard Eggs",
    location: "Coconut Grove, FL",
    category: "Farm",
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
        category: "Farm",
      },
      {
        id: "mango-bag",
        name: "Mangoes, by the bag",
        price: 7,
        desc: "In season only. Ripe enough for tonight.",
        image: PHOTO.mangoes,
        category: "Farm",
      },
    ],
  },
  {
    id: "calle-heat",
    name: "Calle Heat",
    location: "Little Havana, FL",
    category: "Fresh",
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
        category: "Fresh",
      },
      {
        id: "mojo",
        name: "Sour orange mojo",
        price: 8,
        desc: "Garlic, cumin, enough acid for a whole pork shoulder.",
        image: PHOTO.mojo,
        category: "Fresh",
      },
    ],
  },
  {
    id: "little-haiti-table",
    name: "Little Haiti Table",
    location: "Little Haiti, FL",
    category: "Hot meals",
    bio: "A weeknight kitchen that keeps a few plates for whoever needs supper. Some trays are covered by neighbors. Come as you are — no questions at the door.",
    image: PHOTO.hotMeal,
    pickup: "Tuesdays and Thursdays, 5–7pm. Front stoop.",
    products: [
      {
        id: "porch-soup",
        name: "Tomato soup",
        price: 0,
        desc: "A cup at the door. Take one if you need it.",
        image: PHOTO.hotMeal,
        category: "Hot meals",
        communityOffer: "Free",
      },
      {
        id: "garden-bowl",
        name: "Garden bowl",
        price: 5,
        desc: "Greens and citrus. Give what feels right.",
        image: PHOTO.salad,
        category: "Cold meals",
        communityOffer: "Pay what you can",
      },
      {
        id: "sunday-trays",
        name: "Sunday trays, two days",
        price: 16,
        desc: "Vegetables and grains, packed for the week.",
        image: PHOTO.mealPrep,
        category: "Meal prep",
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

export function parsePrice(raw: string): number | null {
  const cleaned = raw.trim().replace(/^\s*\$\s*/, "").replace(/\s/g, "");
  if (!cleaned) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const amount = Number(cleaned);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100) / 100;
}

export function formatPriceInput(raw: string): string {
  const amount = parsePrice(raw);
  if (amount === null) return raw.trim();
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

export type FieldError = {
  field: string;
  message: string;
};

export type DraftProduct = {
  key: string;
  name: string;
  price: string;
  desc: string;
  category: Category;
  communityOffer?: CommunityKitchenOffer | "";
};

export type PaymentDraft = {
  cashApp: string;
  venmo: string;
  paypal: string;
  zelle: string;
};

export type PorchDraft = {
  name: string;
  location: string;
  pickup: string;
  bio: string;
  products: DraftProduct[];
  payments?: PaymentDraft;
};

export function isCommunityOffer(value: unknown): value is CommunityKitchenOffer {
  return COMMUNITY_KITCHEN_OFFERS.includes(value as CommunityKitchenOffer);
}

export function isCommunityProduct(product: Pick<Product, "communityOffer">): boolean {
  return isCommunityOffer(product.communityOffer);
}

export function vendorHasCommunityKitchen(vendor: Vendor): boolean {
  return vendor.products.some(isCommunityProduct);
}

export function priceLabel(product: Pick<Product, "price" | "communityOffer">): string {
  if (product.communityOffer === "Free") return "Free";
  if (product.communityOffer === "Pay what you can") return "Pay what you can";
  if (product.communityOffer === "Donation-backed") return product.price > 0 ? money(product.price) : "Covered";
  return money(product.price);
}

export function migrateCategory(value: unknown): Category {
  if (typeof value !== "string" || !value.trim()) return "Fresh";
  const trimmed = value.trim();
  if (CATEGORIES.includes(trimmed as Category)) return trimmed as Category;
  const aliased = CATEGORY_ALIASES[trimmed] ?? CATEGORY_ALIASES[trimmed.toLowerCase()];
  return aliased ?? "Fresh";
}

export function normalizeCashApp(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const tag = trimmed.replace(/^\$/, "");
  if (!/^[A-Za-z][A-Za-z0-9_-]{0,19}$/.test(tag)) return null;
  return `$${tag}`;
}

export function normalizeVenmo(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const name = trimmed
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?(account\.)?venmo\.com\//i, "")
    .split(/[/?#]/)[0];
  if (!/^[A-Za-z0-9_-]{5,30}$/.test(name)) return null;
  return name;
}

export function normalizePaypal(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const match = trimmed.match(
    /^(?:https?:\/\/)?(?:www\.)?(?:paypal\.me|paypal\.com\/paypalme)\/([A-Za-z0-9_-]{1,64})\/?$/i,
  );
  if (!match) return null;
  return `https://www.paypal.me/${match[1]}`;
}

export function normalizeZelle(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/https?:\/\//i.test(trimmed)) return null;
  if (trimmed.length < 2 || trimmed.length > 80) return null;
  return trimmed;
}

export function parsePaymentHandles(draft: PaymentDraft): { handles: PaymentHandles; errors: FieldError[] } {
  const errors: FieldError[] = [];
  const handles: PaymentHandles = {};

  const cashApp = normalizeCashApp(draft.cashApp);
  if (cashApp === null) errors.push({ field: "cashApp", message: "Cash App needs a $cashtag like $kitchen." });
  else if (cashApp) handles.cashApp = cashApp;

  const venmo = normalizeVenmo(draft.venmo);
  if (venmo === null) errors.push({ field: "venmo", message: "Venmo needs a username, 5–30 letters or numbers." });
  else if (venmo) handles.venmo = venmo;

  const paypal = normalizePaypal(draft.paypal);
  if (paypal === null) errors.push({ field: "paypal", message: "PayPal needs a paypal.me link you already have." });
  else if (paypal) handles.paypal = paypal;

  const zelle = normalizeZelle(draft.zelle);
  if (zelle === null) errors.push({ field: "zelle", message: "Zelle is a name, email, or phone — not a web link." });
  else if (zelle) handles.zelle = zelle;

  return { handles, errors };
}

export function paymentLinks(handles?: PaymentHandles): PaymentLink[] {
  if (!handles) return [];
  const links: PaymentLink[] = [];
  if (handles.cashApp) {
    links.push({
      kind: "cashApp",
      label: "Cash App",
      value: handles.cashApp,
      href: `https://cash.app/${handles.cashApp.replace(/^\$/, "")}`,
    });
  }
  if (handles.venmo) {
    links.push({
      kind: "venmo",
      label: "Venmo",
      value: `@${handles.venmo}`,
      href: `https://venmo.com/${handles.venmo}`,
    });
  }
  if (handles.paypal) {
    links.push({
      kind: "paypal",
      label: "PayPal",
      value: handles.paypal.replace(/^https?:\/\/(www\.)?/, ""),
      href: handles.paypal,
    });
  }
  if (handles.zelle) {
    links.push({ kind: "zelle", label: "Zelle", value: handles.zelle });
  }
  return links;
}

export function emptyPaymentDraft(): PaymentDraft {
  return { cashApp: "", venmo: "", paypal: "", zelle: "" };
}

export function paymentDraftFrom(handles?: PaymentHandles): PaymentDraft {
  return {
    cashApp: handles?.cashApp ?? "",
    venmo: handles?.venmo ?? "",
    paypal: handles?.paypal ?? "",
    zelle: handles?.zelle ?? "",
  };
}

export function validatePorchDraft(draft: PorchDraft): FieldError[] {
  const errors: FieldError[] = [];
  if (!draft.name.trim()) errors.push({ field: "name", message: "Give the kitchen a name." });
  if (!draft.location.trim()) errors.push({ field: "location", message: "Say where the porch is." });
  if (!draft.pickup.trim()) errors.push({ field: "pickup", message: "Add a pickup window." });
  if (!draft.bio.trim()) errors.push({ field: "bio", message: "Write a short bio." });

  const ready = draft.products.filter((p) => p.name.trim() || p.price.trim() || p.desc.trim());
  if (ready.length === 0) {
    errors.push({ field: "products", message: "Add at least one product." });
    return errors;
  }

  for (const product of ready) {
    if (!product.name.trim()) {
      errors.push({ field: `name:${product.key}`, message: "Every product needs a name." });
    }
    const offer = isCommunityOffer(product.communityOffer) ? product.communityOffer : undefined;
    const price = parsePrice(product.price);
    if (offer === "Free") {
      if (product.price.trim() && price === null) {
        errors.push({
          field: `price:${product.key}`,
          message: "Free plates can leave price blank, or use 0.",
        });
      }
    } else if (offer === "Pay what you can" || offer === "Donation-backed") {
      if (product.price.trim() && price === null) {
        errors.push({
          field: `price:${product.key}`,
          message: "Suggested amount should look like 5 or 8.50, or leave it blank.",
        });
      }
    } else if (price === null) {
      const label = product.name.trim() || "this product";
      errors.push({
        field: `price:${product.key}`,
        message: `Add a price like 12 or 8.50 for ${label}.`,
      });
    }
  }

  if (draft.payments) {
    errors.push(...parsePaymentHandles(draft.payments).errors);
  }
  return errors;
}

export function fromPrice(vendor: Vendor): number {
  if (!vendor.products.length) return 0;
  return Math.min(...vendor.products.map((p) => p.price));
}

export function photoSize(src: string): { width: number; height: number } {
  return PHOTO_SIZE[src] ?? { width: 640, height: 426 };
}

export function productForFilter(vendor: Vendor, filter: MarketFilter): Product | undefined {
  if (filter === COMMUNITY_FILTER) return vendor.products.find(isCommunityProduct);
  if (filter !== "All") {
    return vendor.products.find((product) => product.category === filter) ?? (vendor.category === filter ? vendor.products[0] : undefined);
  }
  return vendor.products[0];
}

export function vendorMatchesFilter(vendor: Vendor, filter: MarketFilter, query = ""): boolean {
  if (filter === COMMUNITY_FILTER && !vendorHasCommunityKitchen(vendor)) return false;
  if (filter !== "All" && filter !== COMMUNITY_FILTER) {
    const hasCategory =
      vendor.category === filter || vendor.products.some((product) => product.category === filter);
    if (!hasCategory) return false;
  }
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    vendor.name,
    vendor.location,
    vendor.category,
    vendor.bio,
    vendor.pickup,
    ...vendor.products.map((p) => `${p.name} ${p.desc} ${p.category} ${p.communityOffer ?? ""}`),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export function thisWeeksFood(vendors: Vendor[], filter: MarketFilter = "All"): WeekFood[] {
  return vendors.flatMap((vendor) => {
    const product = productForFilter(vendor, filter);
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

function asCommunityOffer(value: unknown): CommunityKitchenOffer | undefined {
  return isCommunityOffer(value) ? value : undefined;
}

function migratePayments(raw: unknown): PaymentHandles | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const draft = raw as Partial<PaymentDraft>;
  const { handles } = parsePaymentHandles({
    cashApp: typeof draft.cashApp === "string" ? draft.cashApp : "",
    venmo: typeof draft.venmo === "string" ? draft.venmo : "",
    paypal: typeof draft.paypal === "string" ? draft.paypal : "",
    zelle: typeof draft.zelle === "string" ? draft.zelle : "",
  });
  return paymentLinks(handles).length ? handles : undefined;
}

function paymentsEqual(a?: PaymentHandles, b?: PaymentHandles): boolean {
  return (a?.cashApp ?? "") === (b?.cashApp ?? "") &&
    (a?.venmo ?? "") === (b?.venmo ?? "") &&
    (a?.paypal ?? "") === (b?.paypal ?? "") &&
    (a?.zelle ?? "") === (b?.zelle ?? "");
}

function migrateProduct(raw: unknown, fallback: string, index: number, vendorCategory: Category): Product | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Partial<Product>;
  if (typeof p.name !== "string" || !p.name.trim()) return null;
  const price = typeof p.price === "number" && Number.isFinite(p.price) && p.price >= 0 ? p.price : 0;
  const category = p.category === undefined ? vendorCategory : migrateCategory(p.category);
  const communityOffer = asCommunityOffer(p.communityOffer);
  return {
    id: typeof p.id === "string" && p.id ? p.id : `p-${index}`,
    name: p.name.trim(),
    price,
    desc: typeof p.desc === "string" ? p.desc : "",
    image: localizeImage(typeof p.image === "string" ? p.image : "", CATEGORY_COVER[category] || fallback),
    category,
    ...(communityOffer ? { communityOffer } : {}),
  };
}

export function migrateVendor(raw: unknown, ownerId: string): { vendor: Vendor | null; changed: boolean } {
  if (!raw || typeof raw !== "object") return { vendor: null, changed: true };
  const v = raw as Partial<Vendor> & { products?: unknown };
  if (typeof v.id !== "string" || !v.id) return { vendor: null, changed: true };

  const category = migrateCategory(v.category);
  const fallback = CATEGORY_COVER[category];
  const image = localizeImage(typeof v.image === "string" ? v.image : "", fallback);
  const products = Array.isArray(v.products)
    ? v.products.flatMap((item, index) => {
        const product = migrateProduct(item, fallback, index, category);
        return product ? [product] : [];
      })
    : [];

  let owner: string | undefined = typeof v.ownerId === "string" && v.ownerId ? v.ownerId : undefined;
  if (!owner && v.id.startsWith("custom-") && ownerId) owner = ownerId;

  const payments = migratePayments(v.payments);

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
    ...(payments ? { payments } : {}),
  };

  const changed =
    vendor.image !== v.image ||
    vendor.ownerId !== v.ownerId ||
    vendor.category !== v.category ||
    !paymentsEqual(vendor.payments, v.payments) ||
    !Array.isArray(v.products) ||
    vendor.products.length !== v.products.length ||
    vendor.products.some((product, index) => {
      const prev = Array.isArray(v.products) ? (v.products[index] as Partial<Product> | undefined) : undefined;
      return (
        !prev ||
        product.image !== prev.image ||
        product.id !== prev.id ||
        product.category !== prev.category ||
        product.communityOffer !== prev.communityOffer
      );
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
  const category = migrateCategory(vendor.category);
  const fallback = CATEGORY_COVER[category];
  const payments = migratePayments(vendor.payments);
  return {
    ...vendor,
    category,
    image: localizeImage(vendor.image, fallback),
    payments,
    products: vendor.products.map((product) => ({
      ...product,
      category: migrateCategory(product.category || category),
      communityOffer: asCommunityOffer(product.communityOffer),
      image: localizeImage(product.image, CATEGORY_COVER[migrateCategory(product.category || category)]),
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

export type FeedPost = {
  id: string;
  vendorId: string;
  vendorName: string;
  text: string;
  image?: string;
  createdAt: string;
  example?: boolean;
};

export const EXAMPLE_FEED: FeedPost[] = [
  {
    id: "example-sourdough",
    vendorId: "bayfront-sourdough",
    vendorName: "Bayfront Sourdough",
    text: "Fresh sourdough at 4pm — still warm if you come early.",
    createdAt: "2026-10-16T16:00:00.000Z",
    example: true,
  },
  {
    id: "example-table",
    vendorId: "little-haiti-table",
    vendorName: "Little Haiti Table",
    text: "Soup on the stoop tonight. A few plates are already covered.",
    createdAt: "2026-10-16T17:00:00.000Z",
    example: true,
  },
  {
    id: "example-honey",
    vendorId: "keys-honey",
    vendorName: "Keys Honey Co.",
    text: "New guava jam on the shelf this Sunday.",
    createdAt: "2026-10-15T14:30:00.000Z",
    example: true,
  },
];

export function migrateFeedPost(raw: unknown): FeedPost | null {
  if (!raw || typeof raw !== "object") return null;
  const post = raw as Partial<FeedPost>;
  if (typeof post.id !== "string" || !post.id) return null;
  if (typeof post.vendorId !== "string" || !post.vendorId) return null;
  if (typeof post.text !== "string" || !post.text.trim()) return null;
  const image = typeof post.image === "string" && post.image.startsWith("data:image/") ? post.image : undefined;
  return {
    id: post.id,
    vendorId: post.vendorId,
    vendorName: typeof post.vendorName === "string" && post.vendorName.trim() ? post.vendorName.trim() : "Porch kitchen",
    text: post.text.trim().slice(0, 240),
    createdAt: typeof post.createdAt === "string" ? post.createdAt : new Date().toISOString(),
    ...(image ? { image } : {}),
    ...(post.example ? { example: true } : {}),
  };
}

export function loadFeed(): FeedPost[] {
  if (!canUseStorage()) return EXAMPLE_FEED;
  try {
    const raw = localStorage.getItem(FEED_KEY);
    if (!raw) return EXAMPLE_FEED;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return EXAMPLE_FEED;
    const posts = parsed.map(migrateFeedPost).filter((post): post is FeedPost => Boolean(post));
    return posts.length ? posts : EXAMPLE_FEED;
  } catch {
    return EXAMPLE_FEED;
  }
}

export function saveFeed(posts: FeedPost[]): void {
  if (!canUseStorage()) return;
  localStorage.setItem(FEED_KEY, JSON.stringify(posts));
}

export function addFeedPost(input: {
  vendorId: string;
  vendorName: string;
  text: string;
  image?: string;
}): FeedPost[] {
  const current = loadFeed();
  const vendor = loadVendors().find((item) => item.id === input.vendorId);
  if (!vendor || !isOwnedByThisDevice(vendor)) return current;
  const text = input.text.trim().slice(0, 240);
  if (!text) return current;
  const image =
    typeof input.image === "string" && input.image.startsWith("data:image/") ? input.image : undefined;
  const post: FeedPost = {
    id: `post-${Date.now().toString(36)}`,
    vendorId: vendor.id,
    vendorName: vendor.name,
    text,
    createdAt: new Date().toISOString(),
    ...(image ? { image } : {}),
  };
  const next = [post, ...current];
  saveFeed(next);
  return next;
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
