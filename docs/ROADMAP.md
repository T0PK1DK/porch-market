# Porch Market later

This app is still a listing on one phone. Holds are a name on a box. Nothing is charged here.

## What is true today

- Porches, holds, saved lists, payment handles, and the feed live in the browser on this device.
- Categories are Farm, Fresh, Baked, Hot meals, Cold meals, and Meal prep. Makers pick them on each product.
- Community kitchen is a mark on an item: Free, Pay what you can, or Donation-backed. A kitchen can also set how many plates they can cover this week. It is not a kitchen network yet.
- Payment handles are the maker’s own Cash App, Venmo, PayPal.me, or Zelle note. Porch Market does not take money.
- The feed is local. Seeded posts are marked Example so they are not mistaken for a live city-wide board.
- Pickup windows are read from the kitchen’s own sentence. Neighborhoods are named places on a stylized block map, plus an opt-in street map (MapLibre / OpenFreeMap). Home pins are neighborhood-fuzzed. Truck pins expire tonight.
- Shops can mark a hold `ready_for_pickup`. Pay stays in the shop. Delivery drivers are phase 3 only — payments, insurance, background checks (`docs/HANDOFF.md`). Do not build them yet.

## A real shared feed

Neighbors on other phones cannot see a post from this device. A shared feed needs:

- A backend that stores posts, photos, and which porch they belong to
- Accounts, so a maker can post from more than one phone and so a porch cannot be impersonated
- Moderation: report, hide, and take down spam or unsafe food claims
- Photo storage that is not a data URL in localStorage
- A way to expire stale “ready at 4pm” notes so the feed does not lie

## Real payments

Direct handles are a stopgap. People can still forget, type the wrong $cashtag, or pay the wrong person. Real payments need:

- Accounts for makers and, later, for neighbors
- A licensed processor if Porch Market ever touches the money (Stripe or similar). That is a product and legal decision, not a weekend add-on
- Payouts to the maker, refunds, and a record of what was held
- Clear copy that a hold is not a charge until someone chooses that
- Tax and cottage-food rules stay with the maker. Software does not replace a permit

Until that exists, keep “pay at pickup” as the default and only show handles the maker typed.

## Meal kitchens and donations

Community kitchen today is a badge, a filter, and an optional plate count. A longer plan — meals for people who need them, including people without housing, at a lower price or free from donations — needs more than a flag:

- Accounts for kitchens and for people who give
- A ledger of donated plates vs plates taken, without turning anyone into a case file
- Moderation and safety: food handling, hours, and a real address or pickup window
- Donation collection (processor + payouts) if money is pooled, or a partner kitchen if money never hits this app
- Dignity in the product: no eligibility quiz in public, no labels on people, no public tally of who came hungry
- Local partners and rules. This is not only software

A next software step, still without a processor, could be a bake-day cutoff time. A next human step is a partner and a real pickup table.

## What not to bolt on early

- Stripe, paid maps, or paid image APIs just to demo
- Accounts that lock the current local porches
- A public donation wall that exposes who received food
- PIN or passcode gates
- 3D scenes; this is a listing
- Driver dispatch, live GPS, or delivery fees
- Paid map keys (Mapbox, Google)

Build the shared piece when neighbors on different phones should see the same porch, the same feed, or the same kitchen table.
