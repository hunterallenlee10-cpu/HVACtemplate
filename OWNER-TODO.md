# OWNER-TODO: confirm or replace before launch

Everything below is a placeholder or general guidance. Every value lives in **`content/site.ts`** unless noted.
Search the codebase for `OWNER-TODO` to find each one.

## Business details
- [ ] **Business name and brand.** "Northfield Heating & Air" is a placeholder brand (`config.businessName`, `shortName`).
- [ ] **Phone**: `(240) 555-0142` is a fake 555 number (`config.phone` **and** `config.phoneHref`).
- [ ] **Email**: `service@example.com` (`config.email`).
- [ ] **License number**: `MD HVACR #00000` (`config.licenseNumber`). It also appears in the FAQ answer.
- [ ] **Street address** for Google/JSON-LD (`config.address`). It isn't shown on the page, but search engines read it.
- [ ] **Hours**: `Mon–Sat 7am–7pm · 24/7 emergency line` (`config.hours`) and the machine-readable `openingHoursSpec`.
- [ ] **Year founded**: `2009` (`config.yearFounded`). It's in the hero eyebrow.
- [ ] **Service area towns** (`config.serviceArea`): add or remove towns; lat/lng drives the dot map.
- [ ] **Domain**: `northfieldheating.com` (`config.domain`), or set `NEXT_PUBLIC_SITE_URL` in Vercel.
- [ ] **Google reviews link** (`config.googleReviewsUrl`) to the real Google Business Profile.

## Prices and offers
- [ ] **Tune-up price**: "from $119" (`config.tuneupPrice`). It shows in the booking bar, filter CTA, SEO description and JSON-LD.
- [ ] **New-system installed ranges** (`systems.items[].stats`, the `money` stats):
  - Gas furnace $4,500–$9,500
  - Heat pump $7,000–$16,000
  - Ductless $3,500–$8,000 per zone
- [ ] **"Same-day service · no overtime fees"** claim (`bookingBar.line`). Only keep it if it's true every day.
- [ ] **Callback promise**: "we'll call you within one business hour" (`config.callbackHours`).

## Comfort Club membership (`plans`)
- [ ] Tier names, monthly prices ($14 / $22 / $34) and every perk are placeholders.
- [ ] Delete `plans.note` ("Plan prices and perks shown are placeholders…") once confirmed.

## FAQ answers to confirm (`faq.items`)
- [ ] Same-day service: "Call before noon…".
- [ ] Financing: "Yes, on new system installs, with approved credit". Confirm the lender and terms, or remove.
- [ ] Licensed and insured: confirm license number and insurance coverage.

## Reviews
- [ ] Replace the three **"[Replace with a real Google review]"** cards with real reviews (paste the exact wording, first name + town,
  with the customer's permission). Do **not** invent reviews. The cards are in `components/sections/Reviews.tsx`; add a
  `reviews.items` array to `content/site.ts` and map over it.

## Booking form delivery (Vercel → Project → Settings → Environment Variables)
- [ ] `BOOKING_WEBHOOK_URL`: your n8n webhook (receives JSON: `type, business, source, submittedAt, name, phone, email, zip, service, window, notes`).
- [ ] or `RESEND_API_KEY` + `BOOKING_TO_EMAIL` (+ `BOOKING_FROM_EMAIL` on a domain verified in Resend) as the fallback.
- Until one is set, the production form politely tells visitors to call instead.
- [ ] Turn on **Web Analytics** in the Vercel project (Project → Analytics) so the analytics script records visits.

## Facts used in copy (general industry guidance; keep or edit)
- Duct leakage: "20–30% of the air moving through the ducts is lost…": ENERGY STAR duct-sealing guidance.
- Furnace efficiency "up to 98% AFUE", lifespans (furnace 15–20 yrs, heat pump 10–15 yrs, mini-split 15–20 yrs): typical ranges.
- Filter intervals (1–3 months for 1-inch, 6–12 months for 4–5-inch media, monthly with pets/allergies): general guidance.
- "$5,000 rule" (age × repair quote): a common rule of thumb, labelled as such on the page.
- R-22: production and import ended in the US on Jan 1, 2020 (EPA), so systems installed before 2010 may need costly refrigerant.

## Optional upgrades
- [ ] Real photos of the team, trucks or a recent install (e.g. an "About" strip above the reviews).
- [ ] Swap the generated product renders for photos of the brands you actually install, with permission. Keep logos off unless you're an authorized dealer.
- [ ] A real logo, if the business has one. Replace `components/chrome/LogoMark.tsx` and `app/icon.svg`.
