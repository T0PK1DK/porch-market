# Handoff prompt

Copy everything below the line into a new Claude (or similar) session.

---

You are continuing **Porch Market**, a local cottage-food listing (not a game, not a processor, not a license).

Read first, in this order:

1. `README.md`
2. `docs/RESEARCH.md`
3. `docs/ROADMAP.md`
4. `src/lib/market.ts` and the tests next to it
5. `src/routes/index.tsx`, `src/routes/vendor/$id.tsx`, `src/routes/create.tsx`, `src/routes/feed.tsx`, `src/routes/holds.tsx`

## What is true today

- No accounts, no database, no Stripe, no paid maps, no image CDN.
- Vendors, holds, saved porches, buyer name, and the feed live in `localStorage` on this device.
- Sample South Florida kitchens ship with the app. Only porches this device created can be edited or deleted.
- Holds are a name on a box. Payment handles are optional and never invented. Pay at pickup.
- Pickup text is parsed into days/hours (`src/lib/pickup.ts`) for “Open today” / “Open now”.
- Products can have weekly `stock`, `dietNotes`, and a `readyNote`. Community kitchens can set `platesThisWeek`.
- Search is token-scored (`src/lib/search.ts`), not a single substring.
- Neighborhoods are resolved from location aliases (`src/lib/neighborhoods.ts`) and shown on a stylized block map — not street pins.
- The hold board (`/holds`) shows kitchen tickets for owned porches and holds this device placed.
- Open holds older than 7 days are marked stale in the UI; they stay open until canceled or marked picked up.
- Community kitchen copy stays dignified: no eligibility quiz, no public tally of who came hungry.

## Verify before you ship

- `npm test`
- `npm run typecheck`
- `npm run build`
- Phone ~390px: browse map + chips, save a porch, open a storefront, place a hold, see it on Holds, create/edit a porch with stock and diet notes, Feed timestamps.
- Confirm sample kitchens still have **no invented payment handles**.

## Hard constraints

- Do **not** deploy.
- Do **not** add accounts, Stripe, paid maps, or image APIs.
- Do **not** add PIN / passcode gates.
- Do **not** put personal names in public text (README, docs, UI, commits, PR).
- Do **not** hide or restyle platform branding.
- Do **not** copy code or assets from Homegrown, Hotplate, Olio, Roblox, or anyone else. Patterns only.
- Do **not** turn this into a 3D / Roblox-style game. It is a listing.
- Auth stays off. Do not import `authMiddleware` / `requireUserId`.
- Meals, eggs, and many sauces in the samples are **not** Florida cottage food — keep the law note and official links.

## Safe next steps (pick one)

1. A kitchen-only “this week’s bake day” cutoff (order-by time) still stored locally.
2. Expire stale “ready at 4pm” **feed** posts so the board does not lie — still local.
3. Distinct product photos on the create form (already have cover upload).
4. Cross-phone sync needs accounts — see `docs/ROADMAP.md`. Do not start that unless the ask names accounts.

If you change storage shapes, migrate in `src/lib/market.ts` and add a test. Prefer the more correct parse/search/stock math even if it is slower than a shortcut.
