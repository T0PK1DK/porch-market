# Handoff prompt

Copy everything below the line into a new Claude (or similar) session.

---

You are continuing **Porch Market**, a local cottage-food listing (not a game, not a processor, not a license).

Read first, in this order:

1. `README.md`
2. `docs/RESEARCH.md`
3. `docs/ROADMAP.md`
4. `src/lib/market.ts`, `src/lib/geo.ts`, and the tests next to them
5. `src/routes/index.tsx`, `src/routes/map.tsx`, `src/routes/vendor/$id.tsx`, `src/routes/create.tsx`, `src/routes/feed.tsx`, `src/routes/holds.tsx`

## What is true today

- No accounts, no database, no Stripe, no paid maps, no image CDN, no API key for tiles.
- Vendors, holds, saved porches, buyer name, and the feed live in `localStorage` on this device.
- Sample South Florida kitchens ship with the app. Only porches this device created can be edited or deleted.
- Holds are a name on a box. Payment handles are optional and never invented. Pay at pickup or in the shop.
- Pickup text is parsed into days/hours (`src/lib/pickup.ts`) for “Open today” / “Open now”.
- Products can have weekly `stock`, `dietNotes`, and a `readyNote`. Community kitchens can set `platesThisWeek`.
- Kitchens can set `orderBy` (`{ weekday, minutes }`) so neighbors know the last time to ask for this week’s bake. Holds close after that cutoff and reopen after the listed pickup ends. See `src/lib/cutoff.ts`.
- Search is token-scored (`src/lib/search.ts`), not a single substring.
- Neighborhoods are resolved from location aliases (`src/lib/neighborhoods.ts`). The browse page still has a stylized block map for filtering.
- The street map (`/map`) uses **MapLibre GL** + **OpenFreeMap** (OpenStreetMap-based, no key). See `src/lib/geo.ts` and `src/components/street-map-canvas.tsx`.
- Map pins are **opt-in**. Home-seller pins are **always fuzzed to the neighborhood** — exact home coordinates are stripped on save/migrate and never published. Exact pins are only for opted-in **shops** and **food trucks**.
- Mobile “here today” pins auto-expire at **local end of that calendar day**. The sample truck (`biscayne-lunch-truck`) rolls forward on load so the demo stays live.
- Shops can offer **order-ahead pickup** on top of the existing holds system. New status: `ready_for_pickup`. `open` and `ready_for_pickup` both reserve stock. Pay in the shop — nothing is charged here.
- Every hold has `fulfillment: "pickup"`. That field is the hook for a later delivery mode. Do not add drivers now.
- The hold board (`/holds`) shows kitchen tickets for owned porches and holds this device placed, including ready-for-pickup.
- Open holds older than 7 days are marked stale in the UI; they stay open until canceled or marked picked up.
- Community kitchen copy stays dignified: no eligibility quiz, no public tally of who came hungry.

## Pin + hold data (do not invent a second system)

```ts
Vendor.mapPin?: {
  kind: "home" | "mobile" | "shop";
  optedIn: boolean;
  exactLat?: number;   // shop + mobile only; stripped for home
  exactLng?: number;
  hereOn?: string;     // YYYY-MM-DD, mobile only
  hereFrom?: string;   // HH:MM
  hereUntil?: string;
  orderAhead?: boolean; // shops default true
}

Hold.status: "open" | "ready_for_pickup" | "picked_up" | "canceled"
Hold.fulfillment: "pickup" // future: "delivery" — do not add yet
```

Public map points go through `publicMapPin()` / `publicMapPins()` so privacy rules cannot be bypassed by the UI.

## Phase 3 — Drivers / delivery (do not build)

A future driver role is **out of scope** until payments, insurance, and background checks exist. When that work is explicitly requested, extend — do not replace — the current model:

- `Hold.fulfillment` stays `"pickup"` until a licensed delivery mode ships.
- Future `Hold.delivery?: { driverId, dropoffApprox, quotedFee, acceptedAt }` — approximate dropoff only; never a raw home pin from a home seller.
- Future `Driver` record (not a user account in this app until accounts are on): `{ id, displayName, status: "applicant" | "cleared" | "paused", insuredUntil, backgroundCheckAt, vehicleNote }`.
- Clearing a driver requires **payments** (who pays the fee), **insurance** (stored expiry, not a PDF dump in localStorage), and **background checks** (a real vendor, not a checkbox).
- Do **not** add a driver map, routing, live GPS, or a “deliver this hold” button in this phase.
- Home pins stay neighborhood-fuzzed even if a driver exists later. Exact coordinates remain shop/truck only.

## Verify before you ship

- `npm test`
- `npm run typecheck`
- `npm run build`
- Phone ~390px: bottom nav, browse block map + chips, open `/map` and tap a pin, save a porch, open a storefront, place a hold, see it on Holds, mark a shop order ready, create/edit a porch with a pin type and an order-by cutoff, Feed timestamps.
- Confirm sample kitchens still have **no invented payment handles**.
- Confirm a home pin never shows a street-accurate coordinate.

## Hard constraints

- Do **not** deploy.
- Do **not** add accounts, Stripe, paid maps, Mapbox/Google keys, or image APIs.
- Do **not** add PIN / passcode gates.
- Do **not** put personal names in public text (README, docs, UI, commits, PR).
- Do **not** hide or restyle platform branding.
- Do **not** copy code or assets from Homegrown, Hotplate, Olio, Roblox, or anyone else. Patterns only.
- Do **not** turn this into a 3D / Roblox-style game. It is a listing.
- Auth stays off. Do not import `authMiddleware` / `requireUserId`.
- Meals, eggs, and many sauces in the samples are **not** Florida cottage food — keep the law note and official links.
- Do **not** build drivers, delivery dispatch, or live tracking.

## Safe next steps (pick one)

1. Expire stale “ready at 4pm” **feed** posts so the board does not lie — still local.
2. Distinct product photos on the create form (already have cover upload).
3. Let a truck owner nudge today’s pin without rewriting the whole porch — still local, still expires tonight.
4. Cross-phone sync needs accounts — see `docs/ROADMAP.md`. Do not start that unless the ask names accounts.

If you change storage shapes, migrate in `src/lib/market.ts` / `src/lib/geo.ts` and add a test. Prefer the more correct parse/search/stock/geo math even if it is slower than a shortcut.

---

## Pass — bake-day cutoff + mobile polish

Shipped on top of the map / order-ahead work. Still local-only. No deploy, no accounts, no paid maps, no passcodes, no personal names.

### Added

- Kitchen-only **order-by cutoff** (`Vendor.orderBy: { weekday, minutes }`) in `src/lib/cutoff.ts`.
- Makers type a day and time like `Friday 8pm` on Open / Edit a porch. Blank means holds stay open.
- Neighbors see “Order by Friday 8pm” on cards and the storefront. After the cutoff, holds are refused until pickup ends, then the next week’s window opens.
- Sample bakers: Bayfront Sourdough orders by Friday 8pm; Porch Cookie Drop orders by Thursday 8pm. Other samples stay unlimited.
- Phone chrome: bottom tab bar (Browse / Map / Feed / Holds / Open). The top header no longer wraps five links on a 390px screen. The block map is shorter on a phone so “This week” is visible without scrolling past a square map.
- Tightened porch cards so diet chips and pin/order-ahead badges do not stack the weekly row on a phone.
- Feed timestamps no longer repeat “Open this porch”. Hold form placeholder is “Name for the box”.

### Verify

- `npm test` (includes `src/lib/cutoff.test.ts`)
- `npm run typecheck`
- `npm run build`
- Phone ~390px: bottom nav, browse chips, a baker card showing the cutoff, storefront aside, Open a porch order-by field.
- Confirm sample kitchens still have **no invented payment handles**.

### Safe next steps (pick one)

1. Expire stale “ready at 4pm” **feed** posts so the board does not lie — still local.
2. Distinct product photos on the create form (already have cover upload).
3. Let a truck owner nudge today’s pin without rewriting the whole porch — still local, still expires tonight.
4. Cross-phone sync needs accounts — see `docs/ROADMAP.md`. Do not start that unless the ask names accounts.

---

## Pass — warm, handmade storefront polish

Visual and UX only. Order, hold, stock, and cutoff logic in `src/lib/` are unchanged.

- Kraft price tags (`.price-tag`), tilted photo frames, and a handwritten accent (Caveat, `.hand`) for ready notes and kitchen notes.
- Storefront items are separate cards titled “On the table this week”. The hold form has a − / + stepper capped at what is left (no browser validation bubble), an optional note, an estimated total paid at pickup, and a “Never mind” exit.
- The hold confirmation is a ticket shown under the item you held, scrolled into view, with the pickup window as the headline.
- `/holds` is now “Your holds”: neighbor holds first, with photo, total, note, and pickup window. Kitchen tickets show only on a phone that opened a porch. Cancel asks once before it removes a hold.
- After the cutoff, items show “Holds reopen after this week’s pickup” instead of a disabled button, and a single closed banner explains why.
- Empty states (no saved porches, no holds, no tickets) each have one line and one next step.
- Before/after phone screenshots: `docs/pr/porch-polish/`.
