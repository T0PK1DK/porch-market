import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SAMPLE_VENDORS, vendorMatchesFilter } from "./market.ts";
import { scoreVendor, tokenize } from "./search.ts";

describe("token search", () => {
  it("splits a query into tokens and scores Miami Beach for beach miami", () => {
    assert.deepEqual(tokenize("beach miami"), ["beach", "miami"]);
    const beach = SAMPLE_VENDORS.find((vendor) => vendor.id === "bayfront-sourdough")!;
    const homestead = SAMPLE_VENDORS.find((vendor) => vendor.id === "keys-honey")!;
    assert.ok(scoreVendor(beach, "beach miami") > 0);
    assert.equal(scoreVendor(homestead, "beach miami"), 0);
    assert.equal(vendorMatchesFilter(beach, "All", "beach miami"), true);
    assert.equal(vendorMatchesFilter(homestead, "All", "beach miami"), false);
  });

  it("matches a product name even when the porch title does not", () => {
    const cookies = SAMPLE_VENDORS.find((vendor) => vendor.id === "porch-cookies")!;
    assert.equal(vendorMatchesFilter(cookies, "All", "shortbread"), true);
    assert.equal(vendorMatchesFilter(cookies, "Baked", "guava"), false);
  });
});
