# Porch Market handoff

Stacked feature pass on PR #2 (`cursor/porch-market-phone-polish-9af7`). Still no backend, accounts, Stripe, paid maps, or image APIs.

## Done

- Category chips are Farm, Fresh, Baked, Hot meals, Cold meals, Meal prep. Makers pick a category on each product. Old labels migrate (Baked Goods → Baked, produce → Farm, honey/sauce → Fresh).
- Community kitchen: an item can be Free, Pay what you can, or Donation-backed. Gentle badge + a Community kitchen chip. Copy stays dignified.
- Makers can add their own Cash App, Venmo, PayPal.me, or Zelle note. Shown on the porch and after a hold as “pay the maker directly.” Holds stay paid at pickup. Handles are validated and never invented.
- Feed tab: short porch updates, optional photo resized on this device, example posts marked Example. Tap a post to open the porch. Posts are local only.
- `docs/ROADMAP.md` for a later shared feed, real payments, and meal kitchens.
- New bundled photos for meals + prep in `public/photos/` with credits.

## Verify

- `npx tsc --noEmit`
- `node --experimental-strip-types --test src/lib/market.test.ts` — category migration, community flags, payment handles, feed storage
- `npm run build`
- Phone ~390px: market chips, a porch with handles (create one — samples have none), Feed tab

## Deploy

`vercel.json` (`npm install --omit=dev`). Connecting the GitHub repo to Vercel deploys `main`. This branch is stacked on #2 — do not merge onto `main` until #2 is in.

## Watch

- Do not add Stripe, accounts, maps, or image CDNs.
- Do not invent payment handles on sample kitchens.
- Sample porches are not editable. Feed posts only from a porch this device owns.
- Community kitchen is a badge, not a donation network.

## Next (optional)

- Distinct photos for focaccia vs country loaf if King still wants that.
- A kitchen-only “plates we can cover this week” count, still local.
- Cross-phone sync needs accounts — see `docs/ROADMAP.md`.
