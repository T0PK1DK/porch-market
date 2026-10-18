# Porch Market handoff

Phone-first market is in. Overnight polish is on a follow-up PR: empty filters, hold confirm/cancel, form validation, tap targets, and photo layout shift.

## Done

- Home is intro + search + chips + this-week food + porch cards. No tall poster.
- Photos ship in `public/photos/` (WebP, under 80KB) with `CREDITS.md`. No runtime hotlinks.
- Device-owned porches can be edited. Holds are a name on a box, paid at the door.
- Empty search/chip results hide the weekly row and offer **Clear filters**.
- After a hold: a clear “Held for …” card with **Cancel this hold**. Inline cancel is a 44px target.
- Create/edit validate name, pickup, and prices (`$12`, `8.50`). `$12` used to fail.
- Covers reserve their box (`aspect-ratio` / fixed size, `img` is `block`) so photos don’t shove the list.
- Store tests: `src/lib/market.test.ts` (edit, products, hold, migration, price/form validation).

## Verify

- `npx tsc --noEmit` — pass
- `node --experimental-strip-types --test src/lib/market.test.ts` — 17 pass
- `npm run build` — pass
- Phone QA ~375–430px: empty Other Cottage Food chip, hold + cancel, create validation
- Platform `scripts/**/*.test.mjs` still expects `.grok/skills/og/**` (not in this repo)

## Deploy

`vercel.json` (`npm install --omit=dev`). TanStack Start → Vercel (`.vercel/output`). No GitHub Actions. Connecting the GitHub repo to Vercel deploys `main`.

## Watch

- Don’t add Stripe, accounts, maps, or image CDNs.
- Sample kitchens are not editable. Only `ownerId` matching this device.
- Don’t re-download Unsplash IDs blindly — some resolve to the wrong subject.
- Removing the last product is refused.

## Next (optional)

- Distinct photos for focaccia vs country loaf, and lime shortbread vs chocolate chip.
- Cross-phone sync would need accounts — out of scope on purpose.
