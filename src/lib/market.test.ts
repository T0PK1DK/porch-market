import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  addFeedPost,
  addProduct,
  addVendor,
  CATEGORY_COVER,
  EXAMPLE_FEED,
  FEED_KEY,
  getDeviceOwnerId,
  HOLDS_KEY,
  isHoldStale,
  isOwnedByThisDevice,
  loadBuyerName,
  loadFeed,
  loadHolds,
  loadSavedIds,
  loadVendors,
  localizeImage,
  migrateCategory,
  migrateVendors,
  normalizeCashApp,
  normalizePaypal,
  normalizeVenmo,
  normalizeZelle,
  OWNER_KEY,
  parsePaymentHandles,
  paymentLinks,
  PHOTO,
  placeHold,
  remainingPlates,
  remainingStock,
  removeHold,
  removeProduct,
  removeVendor,
  SAMPLE_VENDORS,
  saveBuyerName,
  saveHold,
  saveVendors,
  setHoldStatus,
  thisWeeksFood,
  toggleSaved,
  updateVendor,
  validatePorchDraft,
  vendorHasCommunityKitchen,
  vendorMatchesFilter,
  formatPriceInput,
  parsePrice,
  VENDORS_KEY,
  type Vendor,
} from "./market.ts";

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  getItem(key: string) {
    return this.data.has(key) ? this.data.get(key)! : null;
  }
  key(index: number) {
    return [...this.data.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  setItem(key: string, value: string) {
    this.data.set(key, String(value));
  }
}

function installStorage() {
  const storage = new MemoryStorage();
  Object.defineProperty(globalThis, "window", { value: globalThis, configurable: true, writable: true });
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });
  return storage;
}

function customPorch(overrides: Partial<Vendor> = {}): Vendor {
  return {
    id: "custom-lime-loaf-old",
    name: "Lime Loaf",
    location: "Little Haiti, FL",
    category: "Baked",
    bio: "One loaf, Saturday only.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
    pickup: "Saturdays, 10am",
    products: [
      {
        id: "loaf",
        name: "Lime loaf",
        price: 11,
        desc: "Zest and sugar.",
        image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800",
        category: "Baked",
      },
    ],
    ...overrides,
  };
}

beforeEach(() => {
  installStorage();
});

describe("localizeImage", () => {
  it("keeps shipped photos and data URLs, maps old Unsplash links", () => {
    assert.equal(localizeImage("/photos/bread.webp", PHOTO.market), PHOTO.bread);
    assert.equal(localizeImage("data:image/jpeg;base64,abc", PHOTO.market), "data:image/jpeg;base64,abc");
    assert.equal(
      localizeImage(
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
        PHOTO.market,
      ),
      PHOTO.bread,
    );
    assert.equal(localizeImage("https://evil.example/hotlink.jpg", PHOTO.honey), PHOTO.honey);
    assert.equal(localizeImage("", PHOTO.eggs), PHOTO.eggs);
  });
});

describe("data migration", () => {
  it("rewrites hotlinked sample photos and claims custom porches for this device", () => {
    const owner = getDeviceOwnerId();
    const stored = [
      {
        ...SAMPLE_VENDORS[0],
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format",
        products: [
          {
            ...SAMPLE_VENDORS[0].products[0],
            image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73",
          },
          SAMPLE_VENDORS[0].products[1],
        ],
      },
      customPorch(),
    ];
    localStorage.setItem(VENDORS_KEY, JSON.stringify(stored));

    const vendors = loadVendors();
    const sample = vendors.find((v) => v.id === "bayfront-sourdough");
    const mine = vendors.find((v) => v.id === "custom-lime-loaf-old");

    assert.ok(sample);
    assert.equal(sample.image, PHOTO.bread);
    assert.equal(sample.products[0].image, PHOTO.sourdough);
    assert.equal(sample.ownerId, undefined);
    assert.equal(isOwnedByThisDevice(sample), false);

    assert.ok(mine);
    assert.equal(mine.ownerId, owner);
    assert.equal(mine.image, PHOTO.bread);
    assert.equal(mine.products[0].image, PHOTO.sourdough);
    assert.equal(isOwnedByThisDevice(mine), true);

    const persisted = JSON.parse(localStorage.getItem(VENDORS_KEY) ?? "[]") as Vendor[];
    assert.equal(persisted.find((v) => v.id === "custom-lime-loaf-old")?.ownerId, owner);
  });

  it("keeps an already-owned porch and a user-uploaded data URL", () => {
    localStorage.setItem(OWNER_KEY, "owner-keep");
    const porch = customPorch({
      ownerId: "owner-keep",
      image: "data:image/jpeg;base64,fff",
      products: [
        {
          id: "loaf",
          name: "Lime loaf",
          price: 11,
          desc: "Zest.",
          image: "data:image/jpeg;base64,aaa",
          category: "Baked",
        },
      ],
    });
    const { vendors, changed } = migrateVendors([porch], "owner-other");
    assert.equal(vendors[0].ownerId, "owner-keep");
    assert.equal(vendors[0].image, "data:image/jpeg;base64,fff");
    assert.equal(vendors[0].products[0].image, "data:image/jpeg;base64,aaa");
    assert.equal(changed, false);
  });

  it("returns sample kitchens when nothing is stored", () => {
    const vendors = loadVendors();
    assert.equal(vendors.length, SAMPLE_VENDORS.length);
    assert.ok(vendors.every((v) => v.image.startsWith("/photos/")));
    assert.ok(vendors.every((v) => !isOwnedByThisDevice(v)));
  });
});

describe("edit porch", () => {
  it("lets this device rename a porch and change pickup without losing products", () => {
    addVendor(customPorch({ image: PHOTO.bread, products: customPorch().products.map((p) => ({ ...p, image: PHOTO.sourdough })) }));
    const created = loadVendors().find((v) => v.id === "custom-lime-loaf-old");
    assert.ok(created);

    const next = updateVendor({
      ...created,
      name: "Lime Loaf Kitchen",
      pickup: "Sundays, 9–11am, side gate",
    });
    const updated = next.find((v) => v.id === created.id);
    assert.ok(updated);
    assert.equal(updated.name, "Lime Loaf Kitchen");
    assert.equal(updated.pickup, "Sundays, 9–11am, side gate");
    assert.equal(updated.products.length, 1);
    assert.equal(updated.products[0].name, "Lime loaf");
    assert.equal(updated.ownerId, created.ownerId);

    const reloaded = loadVendors().find((v) => v.id === created.id);
    assert.equal(reloaded?.name, "Lime Loaf Kitchen");
  });

  it("does not let this device edit a sample porch", () => {
    const sample = loadVendors()[0];
    const next = updateVendor({ ...sample, name: "Hijacked" });
    assert.equal(next.find((v) => v.id === sample.id)?.name, sample.name);
  });
});

describe("add and remove products", () => {
  it("adds a product to an owned porch and persists it", () => {
    addVendor(customPorch({ image: PHOTO.bread }));
    const next = addProduct("custom-lime-loaf-old", {
      id: "cookies",
      name: "Lime cookies",
      price: 8,
      desc: "Half dozen.",
      image: CATEGORY_COVER.Baked,
      category: "Baked",
    });
    const vendor = next.find((v) => v.id === "custom-lime-loaf-old");
    assert.ok(vendor);
    assert.equal(vendor.products.length, 2);
    assert.equal(vendor.products[1].name, "Lime cookies");
    assert.equal(loadVendors().find((v) => v.id === "custom-lime-loaf-old")?.products.length, 2);
  });

  it("removes a product but keeps the last one", () => {
    addVendor(
      customPorch({
        image: PHOTO.bread,
        products: [
          { id: "loaf", name: "Lime loaf", price: 11, desc: "", image: PHOTO.sourdough, category: "Baked" },
          { id: "cookies", name: "Lime cookies", price: 8, desc: "", image: PHOTO.cookies, category: "Baked" },
        ],
      }),
    );
    const afterRemove = removeProduct("custom-lime-loaf-old", "cookies");
    assert.deepEqual(
      afterRemove.find((v) => v.id === "custom-lime-loaf-old")?.products.map((p) => p.id),
      ["loaf"],
    );
    const refused = removeProduct("custom-lime-loaf-old", "loaf");
    assert.deepEqual(
      refused.find((v) => v.id === "custom-lime-loaf-old")?.products.map((p) => p.id),
      ["loaf"],
    );
  });

  it("ignores product edits on porches this device does not own", () => {
    const sampleId = SAMPLE_VENDORS[0].id;
    const before = loadVendors().find((v) => v.id === sampleId)!;
    addProduct(sampleId, {
      id: "extra",
      name: "Nope",
      price: 1,
      desc: "",
      image: PHOTO.bread,
      category: "Baked",
    });
    removeProduct(sampleId, before.products[0].id);
    const after = loadVendors().find((v) => v.id === sampleId)!;
    assert.equal(after.products.length, before.products.length);
    assert.ok(!after.products.some((p) => p.id === "extra"));
  });
});

describe("holds", () => {
  it("places a hold and persists it across reload", () => {
    saveHold({
      id: "hold-1",
      vendorId: "bayfront-sourdough",
      productId: "country-loaf",
      productName: "Country sourdough",
      buyerName: "Alex",
      note: "Sliced if you can",
      createdAt: "2026-10-16T12:00:00.000Z",
    });
    assert.equal(loadHolds().length, 1);
    assert.equal(loadHolds()[0].buyerName, "Alex");
    assert.equal(loadHolds()[0].status, "open");
    assert.equal(loadHolds()[0].qty, 1);
    assert.equal(JSON.parse(localStorage.getItem(HOLDS_KEY) ?? "[]")[0].productName, "Country sourdough");
  });

  it("keeps an older hold shape and can cancel it", () => {
    const old = {
      id: "hold-legacy",
      vendorId: "keys-honey",
      productId: "guava-jam",
      productName: "Guava jam",
      buyerName: "Sam",
      note: "",
      createdAt: "2026-01-02T00:00:00.000Z",
    };
    localStorage.setItem(HOLDS_KEY, JSON.stringify([old]));
    assert.equal(loadHolds()[0].id, "hold-legacy");
    assert.equal(loadHolds()[0].status, "open");
    assert.equal(loadHolds()[0].note, "");
    removeHold("hold-legacy");
    assert.deepEqual(loadHolds(), []);
  });
});

describe("ownership and weekly food", () => {
  it("only shows Edit for porches this device created", () => {
    addVendor(customPorch({ image: PHOTO.bread }));
    const mine = loadVendors().find((v) => v.id === "custom-lime-loaf-old");
    const sample = loadVendors().find((v) => v.id === "bayfront-sourdough");
    assert.equal(isOwnedByThisDevice(mine), true);
    assert.equal(isOwnedByThisDevice(sample), false);
    const leftover = removeVendor("bayfront-sourdough");
    assert.ok(leftover.some((v) => v.id === "bayfront-sourdough"));
    const gone = removeVendor("custom-lime-loaf-old");
    assert.ok(!gone.some((v) => v.id === "custom-lime-loaf-old"));
  });

  it("lists this week's food from each porch, up to two items", () => {
    const week = thisWeeksFood(SAMPLE_VENDORS);
    assert.ok(week.length >= SAMPLE_VENDORS.length);
    assert.ok(week.length <= SAMPLE_VENDORS.length * 2);
    assert.equal(week[0].vendorName, SAMPLE_VENDORS[0].name);
    assert.ok(week[0].neighborhood);
    assert.ok(SAMPLE_VENDORS[0].products.some((product) => product.id === week[0].product.id));
  });

  it("does not persist a vendors list that is only samples", () => {
    saveVendors(SAMPLE_VENDORS);
    assert.equal(localStorage.getItem(VENDORS_KEY), null);
  });
});

describe("price and porch form validation", () => {
  it("parses dollar amounts and rejects junk", () => {
    assert.equal(parsePrice("12"), 12);
    assert.equal(parsePrice("$8.50"), 8.5);
    assert.equal(parsePrice("  $ 4  "), 4);
    assert.equal(parsePrice("0"), 0);
    assert.equal(parsePrice(""), null);
    assert.equal(parsePrice("-3"), null);
    assert.equal(parsePrice("12.999"), null);
    assert.equal(parsePrice("twelve"), null);
    assert.equal(formatPriceInput("$8.5"), "8.50");
    assert.equal(formatPriceInput("12"), "12");
  });

  it("requires a kitchen name and pickup window", () => {
    const errors = validatePorchDraft({
      name: "  ",
      location: "Miami Beach, FL",
      pickup: "",
      bio: "Weekend loaves.",
      products: [{ key: "p1", name: "Loaf", price: "12", desc: "", category: "Baked" }],
    });
    assert.deepEqual(
      errors.map((e) => e.field),
      ["name", "pickup"],
    );
  });

  it("requires a parseable price on each listed product", () => {
    const errors = validatePorchDraft({
      name: "Lime Loaf",
      location: "Little Haiti, FL",
      pickup: "Saturdays",
      bio: "One loaf.",
      products: [
        { key: "p1", name: "Loaf", price: "$11", desc: "", category: "Baked" },
        { key: "p2", name: "Cookies", price: "free", desc: "", category: "Baked" },
      ],
    });
    assert.equal(errors.length, 1);
    assert.equal(errors[0].field, "price:p2");
    assert.match(errors[0].message, /8\.50/);
  });
});

describe("category migration", () => {
  it("maps old kitchen labels to the closest new category", () => {
    assert.equal(migrateCategory("Baked Goods"), "Baked");
    assert.equal(migrateCategory("Honey & Preserves"), "Fresh");
    assert.equal(migrateCategory("Produce & Eggs"), "Farm");
    assert.equal(migrateCategory("Hot Sauce & Condiments"), "Fresh");
    assert.equal(migrateCategory("Other Cottage Food"), "Fresh");
    assert.equal(migrateCategory("Hot meals"), "Hot meals");
    assert.equal(migrateCategory("unknown shelf"), "Fresh");
  });

  it("migrates stored porches and products without dropping them", () => {
    const stored = [
      {
        id: "custom-old-honey",
        name: "Jar Porch",
        location: "Homestead, FL",
        category: "Honey & Preserves",
        bio: "Jars.",
        image: PHOTO.honey,
        pickup: "Sundays",
        products: [
          { id: "honey", name: "Wildflower", price: 14, desc: "", image: PHOTO.honey },
          { id: "loaf", name: "Side loaf", price: 10, desc: "", image: PHOTO.bread, category: "Baked Goods" },
        ],
        ownerId: "owner-keep",
      },
    ];
    localStorage.setItem(OWNER_KEY, "owner-keep");
    const { vendors, changed } = migrateVendors(stored, "owner-keep");
    assert.equal(changed, true);
    assert.equal(vendors.length, 1);
    assert.equal(vendors[0].name, "Jar Porch");
    assert.equal(vendors[0].category, "Fresh");
    assert.equal(vendors[0].products.length, 2);
    assert.equal(vendors[0].products[0].category, "Fresh");
    assert.equal(vendors[0].products[1].category, "Baked");
    assert.equal(vendors[0].products[0].name, "Wildflower");
    assert.equal(vendors[0].ownerId, "owner-keep");
  });
});

describe("community kitchen flags", () => {
  it("keeps free, pay-what-you-can, and donation-backed marks", () => {
    const stored = [
      {
        id: "custom-table",
        name: "Block Table",
        location: "Little Haiti, FL",
        category: "Hot meals",
        bio: "Plates for the block.",
        image: PHOTO.hotMeal,
        pickup: "Evenings",
        ownerId: "owner-keep",
        products: [
          {
            id: "soup",
            name: "Soup",
            price: 0,
            desc: "",
            image: PHOTO.hotMeal,
            category: "Hot meals",
            communityOffer: "Free",
          },
        ],
      },
    ];
    const { vendors } = migrateVendors(stored, "owner-keep");
    assert.equal(vendors[0].products[0].communityOffer, "Free");
    assert.equal(vendorHasCommunityKitchen(vendors[0]), true);
    assert.equal(vendorMatchesFilter(vendors[0], "Community kitchen"), true);
    assert.equal(vendorMatchesFilter(SAMPLE_VENDORS[0], "Community kitchen"), false);
    assert.equal(vendorMatchesFilter(SAMPLE_VENDORS.find((v) => v.id === "little-haiti-table")!, "Community kitchen"), true);
  });

  it("lets a free plate skip a dollar price", () => {
    const errors = validatePorchDraft({
      name: "Block Table",
      location: "Little Haiti, FL",
      pickup: "Evenings",
      bio: "Plates for the block.",
      products: [
        {
          key: "soup",
          name: "Soup",
          price: "",
          desc: "A cup at the door.",
          category: "Hot meals",
          communityOffer: "Free",
        },
      ],
    });
    assert.deepEqual(errors, []);
  });

  it("drops an unknown community mark instead of inventing one", () => {
    const { vendors } = migrateVendors(
      [
        {
          id: "custom-plain",
          name: "Plain",
          location: "Miami, FL",
          category: "Baked",
          bio: "Loaves.",
          image: PHOTO.bread,
          pickup: "Saturdays",
          products: [
            {
              id: "loaf",
              name: "Loaf",
              price: 10,
              desc: "",
              image: PHOTO.bread,
              category: "Baked",
              communityOffer: "Half off",
            },
          ],
        },
      ],
      "owner-x",
    );
    assert.equal(vendors[0].products[0].communityOffer, undefined);
    assert.equal(vendorHasCommunityKitchen(vendors[0]), false);
  });
});

describe("payment handle validation", () => {
  it("accepts real handle shapes and rejects junk", () => {
    assert.equal(normalizeCashApp("$Kitchen"), "$Kitchen");
    assert.equal(normalizeCashApp("kitchen"), "$kitchen");
    assert.equal(normalizeCashApp(""), "");
    assert.equal(normalizeCashApp("$"), null);
    assert.equal(normalizeCashApp("1bad"), null);

    assert.equal(normalizeVenmo("@porchkitchen"), "porchkitchen");
    assert.equal(normalizeVenmo("https://venmo.com/porchkitchen"), "porchkitchen");
    assert.equal(normalizeVenmo("ab"), null);

    assert.equal(normalizePaypal("paypal.me/PorchKitchen"), "https://www.paypal.me/PorchKitchen");
    assert.equal(normalizePaypal("https://www.paypal.me/PorchKitchen"), "https://www.paypal.me/PorchKitchen");
    assert.equal(normalizePaypal("not-a-paypal-link"), null);

    assert.equal(normalizeZelle("Alex at 305-555-0142"), "Alex at 305-555-0142");
    assert.equal(normalizeZelle("https://zelle.example/pay"), null);
    assert.equal(normalizeZelle(""), "");
  });

  it("never invents handles that were not entered", () => {
    const parsed = parsePaymentHandles({ cashApp: "", venmo: "", paypal: "", zelle: "" });
    assert.deepEqual(parsed.handles, {});
    assert.deepEqual(parsed.errors, []);
    assert.deepEqual(paymentLinks(undefined), []);
    assert.deepEqual(paymentLinks({}), []);
  });

  it("keeps valid handles on a porch and drops invalid stored ones", () => {
    localStorage.setItem(OWNER_KEY, "owner-pay");
    addVendor({
      ...customPorch({ image: PHOTO.bread }),
      payments: {
        cashApp: "$LimeLoaf",
        venmo: "limeloaf",
        paypal: "paypal.me/LimeLoaf",
        zelle: "Lime Loaf porch",
      },
    });
    const mine = loadVendors().find((v) => v.id === "custom-lime-loaf-old");
    assert.deepEqual(mine?.payments, {
      cashApp: "$LimeLoaf",
      venmo: "limeloaf",
      paypal: "https://www.paypal.me/LimeLoaf",
      zelle: "Lime Loaf porch",
    });
    assert.equal(paymentLinks(mine?.payments).length, 4);

    const { vendors } = migrateVendors(
      [{ ...customPorch({ image: PHOTO.bread }), payments: { cashApp: "$$", venmo: "x", paypal: "venmo.com/nope" } }],
      "owner-pay",
    );
    assert.equal(vendors[0].payments, undefined);
  });
});

describe("feed storage", () => {
  it("seeds example posts on an empty device and marks them as examples", () => {
    const posts = loadFeed();
    assert.ok(posts.length >= 3);
    assert.ok(posts.every((post) => post.example === true));
    assert.ok(posts.some((post) => post.text.includes("Fresh sourdough")));
    assert.equal(localStorage.getItem(FEED_KEY), null);
    assert.equal(EXAMPLE_FEED[0].example, true);
  });

  it("stores a maker post on this device only after they own a porch", () => {
    const refused = addFeedPost({
      vendorId: "bayfront-sourdough",
      vendorName: "Bayfront Sourdough",
      text: "Should not land",
    });
    assert.ok(refused.every((post) => post.example));

    addVendor(customPorch({ image: PHOTO.bread }));
    const next = addFeedPost({
      vendorId: "custom-lime-loaf-old",
      vendorName: "Lime Loaf",
      text: "  Lime loaf at 4pm  ",
      image: "data:image/jpeg;base64,abc",
    });
    assert.equal(next[0].text, "Lime loaf at 4pm");
    assert.equal(next[0].vendorId, "custom-lime-loaf-old");
    assert.equal(next[0].example, undefined);
    assert.equal(next[0].image, "data:image/jpeg;base64,abc");
    assert.ok(next.some((post) => post.example));

    const persisted = JSON.parse(localStorage.getItem(FEED_KEY) ?? "[]");
    assert.equal(persisted[0].text, "Lime loaf at 4pm");
    assert.equal(loadFeed()[0].text, "Lime loaf at 4pm");
  });
});

describe("stock, plates, saved porches, and hold status", () => {
  it("counts remaining stock against open holds only", () => {
    const loaf = SAMPLE_VENDORS[0].products[0];
    assert.equal(remainingStock(loaf, []), 8);
    saveHold({
      id: "hold-stock",
      vendorId: "bayfront-sourdough",
      vendorName: "Bayfront Sourdough",
      productId: loaf.id,
      productName: loaf.name,
      buyerName: "Alex",
      note: "",
      createdAt: "2026-10-16T12:00:00.000Z",
      qty: 3,
      status: "open",
    });
    assert.equal(remainingStock(loaf, loadHolds()), 5);
    setHoldStatus("hold-stock", "picked_up");
    assert.equal(remainingStock(loaf, loadHolds()), 8);
  });

  it("refuses a hold that would oversell the weekly cap", () => {
    const vendor = SAMPLE_VENDORS[0];
    const product = { ...vendor.products[0], stock: 2 };
    const first = placeHold({ vendor, product, buyerName: "Alex", qty: 2 });
    assert.equal(first.error, undefined);
    assert.ok(first.hold);
    const second = placeHold({ vendor, product, buyerName: "Sam", qty: 1 });
    assert.equal(second.hold, null);
    assert.match(second.error, /spoken for|left/i);
  });

  it("tracks community plates for the week and marks a stale open hold", () => {
    const table = SAMPLE_VENDORS.find((vendor) => vendor.id === "little-haiti-table")!;
    assert.equal(remainingPlates(table, []), 12);
    const placed = placeHold({
      vendor: table,
      product: table.products[0],
      buyerName: "Sam",
      qty: 2,
    });
    assert.equal(remainingPlates(table, placed.holds), 10);
    const stale = {
      ...placed.hold!,
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    assert.equal(isHoldStale(stale, Date.parse("2026-10-21T00:00:00.000Z")), true);
    assert.equal(isHoldStale({ ...stale, status: "picked_up" }, Date.parse("2026-10-21T00:00:00.000Z")), false);
  });

  it("saves a porch and a buyer name on this device", () => {
    assert.deepEqual(loadSavedIds(), []);
    toggleSaved("bayfront-sourdough");
    assert.deepEqual(loadSavedIds(), ["bayfront-sourdough"]);
    assert.equal(vendorMatchesFilter(SAMPLE_VENDORS[0], "Saved", "", { savedIds: loadSavedIds() }), true);
    assert.equal(vendorMatchesFilter(SAMPLE_VENDORS[1], "Saved", "", { savedIds: loadSavedIds() }), false);
    toggleSaved("bayfront-sourdough");
    assert.deepEqual(loadSavedIds(), []);
    saveBuyerName("  Alex  ");
    assert.equal(loadBuyerName(), "Alex");
  });

  it("keeps diet notes and plate counts when a porch is stored", () => {
    localStorage.setItem(OWNER_KEY, "owner-keep");
    const stored = [
      {
        id: "custom-table",
        name: "Block Table",
        location: "Little Haiti, FL",
        category: "Hot meals",
        bio: "Plates.",
        image: PHOTO.hotMeal,
        pickup: "Evenings",
        ownerId: "owner-keep",
        platesThisWeek: 9,
        products: [
          {
            id: "soup",
            name: "Soup",
            price: 0,
            desc: "",
            image: PHOTO.hotMeal,
            category: "Hot meals",
            communityOffer: "Free",
            stock: 4,
            readyNote: "From 5pm",
            dietNotes: ["Vegan", "not-a-real-tag", "Vegetarian"],
          },
        ],
      },
    ];
    const { vendors, changed } = migrateVendors(stored, "owner-keep");
    assert.equal(changed, true);
    assert.equal(vendors[0].platesThisWeek, 9);
    assert.equal(vendors[0].products[0].stock, 4);
    assert.equal(vendors[0].products[0].readyNote, "From 5pm");
    assert.deepEqual(vendors[0].products[0].dietNotes, ["Vegetarian", "Vegan"]);
  });
});
