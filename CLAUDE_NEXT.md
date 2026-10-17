# Porch Market handoff

Phone-first market is in. Photos ship with the app. Holds persist. A maker can edit a porch this device created.

## Done

- Home is intro + search + chips + this-week food + porch cards. No tall poster.
- On ~390×844, food and the first porch cards are above the fold.
- `public/photos/*.webp` (each under 80KB) plus `CREDITS.md`. No runtime hotlinks.
- Vendor cards show two items with prices.
- Device owner id in `localStorage` (`porch-market-owner-v1`). Edit only on owned porches.
- Existing `porch-market-vendors-v1` listings migrate: Unsplash URLs → `/photos/…`, `custom-*` rows get this device’s owner id.
- Holds stay a name on a box, paid at the door, stored in `porch-market-holds-v1`.
- Store tests: `src/lib/market.test.ts` (edit, add/remove product, hold, migration).

## Verify

- `npx tsc --noEmit` — pass
- `node --experimental-strip-types --test src/lib/market.test.ts` — 14 pass
- `npm run build` — pass
- Phone QA (390×844): market, hold, create+edit — pass, no console errors
- `npm test` script-level suite still fails in this sandbox: missing `.grok/skills/og/**` (platform files, not this app). App `src/lib` tests all pass.

## Deploy

`vercel.json` is already here (`npm install --omit=dev`). Production is the existing TanStack Start → Vercel output (`.vercel/output`). No GitHub Actions in the repo. Connecting the GitHub repo to Vercel deploys `main` / this PR.

## Watch

- Unsplash photo IDs sometimes resolve to the wrong subject. Every still in `public/photos` was opened and checked; don’t re-download by ID blindly.
- Don’t add Stripe, accounts, maps, or image CDNs.
- Sample kitchens are not editable. Only rows with `ownerId` matching this device.
- Removing the last product is refused; keep at least one.

## Next (optional)

- Distinct photos for focaccia vs country loaf, and lime shortbread vs chocolate chip (currently close cousins).
- If listings should sync across phones, that needs accounts — out of scope on purpose.
