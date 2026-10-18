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

Live test link: https://porch.testdasite.com (Cloudflare Worker `porch-market`, fallback https://porch-market.t0pk1dk.workers.dev — check the exact workers.dev subdomain in the dashboard if it differs).

Cloudflare (current):

```
npm ci
npm run build:cf        # NITRO_PRESET=cloudflare-module -> .output/
CLOUDFLARE_ACCOUNT_ID=<King main account> npx node@22 $(which wrangler) deploy --config .output/server/wrangler.json
```

- Worker name and compat date are pinned in `vite.config.ts` (nitro `cloudflare.wrangler.name`, `compatibilityDate`). Keep the compat date at or below what the local wrangler/workerd supports, or `wrangler dev` refuses to start.
- Custom domain `porch.testdasite.com` is a Workers custom domain on the testdasite.com zone. Do not touch other testdasite.com subdomains (Leon's sweetd/sprain, Nard's projects).
- Tests need Node 22 for the glob: `npx node@22 --test 'scripts/**/*.test.mjs'`.
- No Cloudflare auto-deploy yet: redeploy by hand after merging to main.

Vercel (still works): `vercel.json` (`npm install --omit=dev`); plain `npm run build` keeps the Vercel preset.

## Watch

- Do not add Stripe, accounts, maps, or image CDNs.
- Do not invent payment handles on sample kitchens.
- Sample porches are not editable. Feed posts only from a porch this device owns.
- Community kitchen is a badge, not a donation network.

## Next (optional)

- Distinct photos for focaccia vs country loaf if King still wants that.
- A kitchen-only “plates we can cover this week” count, still local.
- Cross-phone sync needs accounts — see `docs/ROADMAP.md`.
