import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  addProduct,
  addVendor,
  CATEGORY_COVER,
  getDeviceOwnerId,
  HOLDS_KEY,
  isOwnedByThisDevice,
  loadHolds,
  loadVendors,
  localizeImage,
  migrateVendors,
  OWNER_KEY,
  PHOTO,
  removeHold,
  removeProduct,
  removeVendor,
  SAMPLE_VENDORS,
  saveHold,
  saveVendors,
  thisWeeksFood,
  updateVendor,
  validatePorchDraft,
  formatPriceInput,
  parsePrice,
  VENDORS_KEY,
  type Hold,
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
    category: "Baked Goods",
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
      image: CATEGORY_COVER["Baked Goods"],
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
          { id: "loaf", name: "Lime loaf", price: 11, desc: "", image: PHOTO.sourdough },
          { id: "cookies", name: "Lime cookies", price: 8, desc: "", image: PHOTO.cookies },
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
    });
    removeProduct(sampleId, before.products[0].id);
    const after = loadVendors().find((v) => v.id === sampleId)!;
    assert.equal(after.products.length, before.products.length);
    assert.ok(!after.products.some((p) => p.id === "extra"));
  });
});

describe("holds", () => {
  it("places a hold and persists it across reload", () => {
    const hold: Hold = {
      id: "hold-1",
      vendorId: "bayfront-sourdough",
      productId: "country-loaf",
      productName: "Country sourdough",
      buyerName: "Alex",
      note: "Sliced if you can",
      createdAt: "2026-10-16T12:00:00.000Z",
    };
    saveHold(hold);
    assert.equal(loadHolds().length, 1);
    assert.equal(loadHolds()[0].buyerName, "Alex");
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

  it("lists one food item per porch for the weekly row", () => {
    const week = thisWeeksFood(SAMPLE_VENDORS);
    assert.equal(week.length, SAMPLE_VENDORS.length);
    assert.equal(week[0].product.id, SAMPLE_VENDORS[0].products[0].id);
    assert.equal(week[0].vendorName, SAMPLE_VENDORS[0].name);
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
      products: [{ key: "p1", name: "Loaf", price: "12", desc: "" }],
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
        { key: "p1", name: "Loaf", price: "$11", desc: "" },
        { key: "p2", name: "Cookies", price: "free", desc: "" },
      ],
    });
    assert.equal(errors.length, 1);
    assert.equal(errors[0].field, "price:p2");
    assert.match(errors[0].message, /8\.50/);
  });
});
