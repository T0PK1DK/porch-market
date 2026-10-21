import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { groupByNeighborhood, neighborhoodFromLocation, neighborhoodIdFromLocation } from "./neighborhoods.ts";

describe("neighborhoodFromLocation", () => {
  it("prefers the longest alias so Miami Beach is not Miami", () => {
    assert.equal(neighborhoodFromLocation("Miami Beach, FL"), "Miami Beach");
    assert.equal(neighborhoodFromLocation("South Beach"), "Miami Beach");
    assert.equal(neighborhoodFromLocation("Brickell, FL"), "Miami");
    assert.equal(neighborhoodFromLocation("Coconut Grove, FL"), "Coconut Grove");
    assert.equal(neighborhoodFromLocation("Little Havana, FL"), "Little Havana");
    assert.equal(neighborhoodFromLocation("Homestead, FL"), "Homestead");
    assert.equal(neighborhoodIdFromLocation("Coral Gables, FL"), "coral-gables");
  });

  it("falls back to the city before the comma", () => {
    assert.equal(neighborhoodFromLocation("Delray Beach, FL"), "Delray Beach");
    assert.equal(neighborhoodFromLocation("  "), "Nearby");
  });

  it("groups porches by the resolved neighborhood", () => {
    const groups = groupByNeighborhood([
      { location: "Miami Beach, FL", id: "a" },
      { location: "South Beach", id: "b" },
      { location: "Homestead, FL", id: "c" },
    ]);
    assert.deepEqual(
      groups.map((group) => [group.name, group.items.length]),
      [
        ["Homestead", 1],
        ["Miami Beach", 2],
      ],
    );
  });
});
