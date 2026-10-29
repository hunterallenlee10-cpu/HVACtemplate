/**
 * Every string, price, stat and label on the site lives here.
 * To re-skin for another HVAC client, edit this file first (see README "Re-skin").
 * Values marked OWNER-TODO are placeholders the business owner must confirm.
 */

export const config = {
  businessName: "Northfield Heating & Air", // placeholder brand
  shortName: "Northfield",
  wordmarkSub: "HEATING & AIR",
  cityState: "Frederick, MD",
  city: "Frederick",
  region: "MD",
  serviceArea: [
    { name: "Frederick", lat: 39.414, lng: -77.41, hq: true },
    { name: "Urbana", lat: 39.326, lng: -77.351 },
    { name: "Middletown", lat: 39.443, lng: -77.545 },
    { name: "Walkersville", lat: 39.486, lng: -77.352 },
    { name: "Thurmont", lat: 39.624, lng: -77.411 },
    { name: "Mount Airy", lat: 39.376, lng: -77.155 },
    { name: "Myersville", lat: 39.505, lng: -77.566 },
    { name: "Brunswick", lat: 39.314, lng: -77.628 },
  ],
  phone: "(240) 555-0142", // OWNER-TODO
  phoneHref: "tel:+12405550142",
  email: "service@example.com", // OWNER-TODO
  licenseNumber: "MD HVACR #00000", // OWNER-TODO
  yearFounded: "2009",
  hours: "Mon–Sat 7am–7pm · 24/7 emergency line", // OWNER-TODO
  openingHoursSpec: ["Mo-Sa 07:00-19:00"],
  tuneupPrice: 119, // OWNER-TODO
  membershipName: "Comfort Club",
  domain: "northfieldheating.com",
  address: {
    // OWNER-TODO: real street address (used in JSON-LD only)
    street: "123 Placeholder St",
    locality: "Frederick",
    region: "MD",
    postalCode: "21701",
    country: "US",
  },
  priceRange: "$$",
  googleReviewsUrl: "https://www.google.com/maps", // OWNER-TODO: link to the Google Business Profile
  callbackHours: 1, // "we'll call you within one business hour"
} as const;

export const nav = {
  links: [
    { label: "Comfort check", href: "#comfort-check" },
    { label: "Tune-ups", href: "#tune-ups" },
    { label: "New systems", href: "#new-systems" },
    { label: "Fix or replace", href: "#fix-or-replace" },
    { label: "Plans", href: "#plans" },
  ],
  cta: { label: "Book a visit", href: "#book" },
  callLabel: "Call",
  menuLabel: "Menu",
  closeLabel: "Close",
  skipLink: "Skip to content",
};

export const bookingBar = {
  line: "SAME-DAY SERVICE · NO OVERTIME FEES",
  price: `Tune-ups from $${config.tuneupPrice}`,
  cta: "Book a visit",
  call: "Call",
  book: "Book",
};

export const preloader = { from: 32, to: 70, label: "WARMING UP" };

export const seo = {
  title: `${config.businessName} | Heating & AC Repair in ${config.cityState}`,
  description: `Furnace and heat pump repair, tune-ups from $${config.tuneupPrice} and new system installs in ${config.city} and nearby towns. Same-day service, no overtime fees. Call ${config.phone}.`,
  ogAlt: `${config.businessName}: heating and air in ${config.cityState}`,
  ogHeadline: "Go where the heat goes.",
};

/* ----------------------------- STORY ----------------------------- */

export type StoryCopy = {
  eyebrow?: string;
  chip?: string;
  heading: string;
  /** word in the heading to color ember (max one) */
  accent?: string;
  body?: string;
  stat?: { from: number; to: number; suffix: string; label: string };
  footnote?: string;
  cta?: { label: string; href: string };
};

export const hero = {
  eyebrow: `${config.cityState} · HEATING & AIR SINCE ${config.yearFounded}`,
  heading: "Go where the heat goes.",
  accent: "heat",
  sub: "Scroll through the vent, down the ducts and into the furnace to see what's really warming your home, and what's stealing the heat.",
  primary: { label: "Start the tour", href: "#story-ch1" },
  secondary: { label: "Book a tune-up", href: "#book" },
  scrollCue: "Scroll",
  posterAlt: "A white colonial house on a frosty winter morning",
};

export const story: Record<string, StoryCopy> = {
  ch1: {
    chip: "6:48 AM · THERMOSTAT SET TO 70°",
    heading: "Set to 70. Feels like 61.",
    accent: "61.",
    body: "The number on the wall says one thing. Your feet on the floor say another. Let's go find the missing heat.",
  },
  ch2: {
    eyebrow: "SUPPLY REGISTER",
    heading: "Start where the air comes out.",
    body: "Every room's comfort comes through a grille most people never look at twice.",
  },
  ch3: {
    eyebrow: "DUCTWORK",
    heading: "The leak you'll never see.",
    accent: "leak",
    stat: { from: 0, to: 30, suffix: "%", label: "of airflow can escape before it reaches you" },
    body: "In a typical house, 20–30% of the air moving through the ducts is lost to leaks, holes and loose connections. We test, seal and balance them.",
    footnote: "Source: ENERGY STAR, duct sealing guidance.",
  },
  ch4: {
    eyebrow: "BURNER CHECK",
    heading: "Steady and blue is what you want.",
    accent: "blue",
    body: "Clean blue flames mean fuel is burning completely. Yellow or flickering flames can point to dirty burners or a combustion problem. That calls for a tune-up and a carbon monoxide check.",
  },
  ch5: {
    chip: "4:15 PM · SET TO 70° · FEELS LIKE 70°",
    heading: "Now 70 actually feels like 70.",
    accent: "feels",
    body: "Same house, same thermostat. Sealed ducts, balanced airflow and a clean burn made the difference.",
    cta: { label: "Book a tune-up", href: "#book" },
  },
  ch6: {
    eyebrow: "OUTDOOR UNIT",
    heading: "Meet the half that lives outside.",
    accent: "outside.",
    body: "Your heat pump or AC sits in the weather all year: leaves, pollen, ice and summer storms. Here's everything we check.",
  },
  ch7: {
    eyebrow: "TUNE-UP · 21 POINTS",
    heading: "Nothing gets skipped.",
    accent: "Nothing",
    body: "We go through the whole unit part by part, and only recommend the fixes that actually matter.",
  },
};

export const xray = {
  checklistTitle: "TUNE-UP CHECKLIST",
  total: 21,
  /** first 8 are shown in the panel; the counter runs to `total` */
  checklist: [
    "Clean condenser coil",
    "Check refrigerant charge",
    "Test capacitor + contactor",
    "Measure motor amp draw",
    "Tighten electrical connections",
    "Flush condensate drain",
    "Inspect heat exchanger",
    "Test CO + safety controls",
    "Inspect blower wheel",
    "Check air filter",
    "Lubricate moving parts",
    "Calibrate thermostat",
    "Inspect flue and venting",
    "Test ignition system",
    "Check gas pressure",
    "Measure temperature split",
    "Inspect duct connections",
    "Check static pressure",
    "Inspect fan blade",
    "Test defrost controls",
    "Clear debris around the unit",
  ],
  callouts: [
    { id: "fan", label: "FAN MOTOR", text: "Amp draw, bearings, blade balance" },
    { id: "coil", label: "CONDENSER COIL", text: "Cleaned, checked for leaks" },
    { id: "compressor", label: "COMPRESSOR", text: "Refrigerant charge and pressures" },
    { id: "board", label: "CONTROL BOARD", text: "Wiring and connections" },
    { id: "cap", label: "CAPACITOR + CONTACTOR", text: "Tested under load" },
  ],
};

/* ----------------------------- TOOLS ----------------------------- */

export const thermostat = {
  id: "comfort-check",
  eyebrow: "TRY IT",
  heading: "Dial it in.",
  sub: "Drag the dial. It's the same room before and after a tuned, balanced system.",
  dialLabel: "HEAT · SET TO",
  min: 60,
  max: 74,
  initial: 61,
  captions: [
    { max: 63, text: "Cold floors, frosty glass. Something's off." },
    { max: 67, text: "Getting there, but there's still a draft by the windows." },
    { max: 74, text: "Even, steady warmth in every corner. That's what 70 should feel like." },
  ],
  below: "If some rooms never catch up, the culprit is usually how air moves through the house, not the box on the wall.",
  cta: { label: "Fix my cold rooms", href: "#book" },
  ariaLabel: "Thermostat set temperature",
  imgAlt: {
    cold: "The living room on a cold morning with frost on the windows",
    mid: "The same living room, frost fading",
    warm: "The same living room, warm and sunlit",
  },
  decrease: "Lower temperature",
  increase: "Raise temperature",
};

export const filter = {
  id: "tune-ups",
  eyebrow: "60-SECOND CHECK",
  heading: "How old is your filter?",
  body: "A clogged filter starves the system of air. That means longer run times, cold rooms at the end of the line and a blower working overtime. Drag to compare.",
  stats: [
    { value: "1–3 mo", label: "1-inch filters" },
    { value: "6–12 mo", label: "4–5-inch media filters" },
    { value: "Monthly", label: "Homes with pets or allergies" },
  ],
  footnote: "General guidance; follow your filter's rating.",
  tagBefore: "3 MONTHS, NEVER CHANGED",
  tagAfter: "NEW",
  sliderLabel: "Compare dirty and clean filter",
  altBefore: "A dirty pleated air filter clogged with dust and pet hair",
  altAfter: "The same air filter, brand new and clean",
  cta: { label: `Book a tune-up from $${config.tuneupPrice}`, href: "#book" },
};

export type SystemKey = "furnace" | "heatpump" | "ductless";
export type SystemStat = { label: string; text?: string; prefix?: string; value?: number; value2?: number; suffix?: string; money?: boolean };
export type SystemItem = { key: SystemKey; tab: string; name: string; bestFor: string; description: string; stats: SystemStat[]; img: string; alt: string; cta: string };
export const systems: { id: string; eyebrow: string; heading: string; footnote: string; items: SystemItem[] } = {
  id: "new-systems",
  eyebrow: "NEW SYSTEMS",
  heading: "Pick your next system.",
  footnote: "Ballpark ranges for this area; your quote comes after a free in-home visit.",
  items: [
    {
      key: "furnace",
      tab: "Gas furnace",
      name: "Gas furnace",
      bestFor: "BEST FOR HOMES WITH NATURAL GAS",
      description: "Best for homes with natural gas and existing ductwork. Strong, fast heat on the coldest mornings.",
      stats: [
        { prefix: "up to ", value: 98, suffix: "%", label: "AFUE efficiency" },
        { value: 15, value2: 20, suffix: " yr", label: "Typical lifespan" },
        { prefix: "$", value: 4500, value2: 9500, label: "Installed range", money: true }, // OWNER-TODO
      ],
      img: "/img/products/furnace",
      alt: "A modern high-efficiency gas furnace",
      cta: "Get a free gas furnace quote",
    },
    {
      key: "heatpump",
      tab: "Heat pump",
      name: "Heat pump",
      bestFor: "BEST FOR ALL-ELECTRIC HOMES",
      description: "Best for all-electric homes and mild-to-cold climates. It heats and cools in one unit.",
      stats: [
        { text: "SEER2 / HSPF2", label: "High-efficiency ratings" },
        { value: 10, value2: 15, suffix: " yr", label: "Typical lifespan" },
        { prefix: "$", value: 7000, value2: 16000, label: "Installed range", money: true }, // OWNER-TODO
      ],
      img: "/img/products/heatpump",
      alt: "A modern outdoor heat pump unit",
      cta: "Get a free heat pump quote",
    },
    {
      key: "ductless",
      tab: "Ductless mini-split",
      name: "Ductless mini-split",
      bestFor: "BEST FOR ROOMS THE DUCTS DON'T REACH",
      description: "Best for additions, finished attics, garages and rooms the ducts don't reach.",
      stats: [
        { text: "Room by room", label: "Zoning" },
        { value: 15, value2: 20, suffix: " yr", label: "Typical lifespan" },
        { prefix: "$", value: 3500, value2: 8000, label: "Installed range, per zone", money: true }, // OWNER-TODO
      ],
      img: "/img/products/ductless",
      alt: "A white ductless mini-split head unit above its outdoor condenser",
      cta: "Get a free mini-split quote",
    },
  ],
};

export const repairCalc = {
  id: "fix-or-replace",
  eyebrow: "THE $5,000 RULE",
  heading: "Is it worth fixing?",
  sub: "A rule of thumb many techs use: multiply the system's age by the repair quote. Over $5,000, replacing usually wins. Try yours.",
  systemLabel: "System",
  systemOptions: ["Furnace", "Heat pump", "Central AC"] as const,
  ageLabel: "Age",
  ageMin: 1,
  ageMax: 25,
  ageInitial: 12,
  quoteLabel: "Repair quote",
  quoteMin: 100,
  quoteMax: 5000,
  quoteStep: 50,
  quoteInitial: 650,
  symptomsLabel: "Anything else going on?",
  symptoms: ["Bills keep climbing", "Some rooms never warm up", "New noises", "Repaired in the last 2 yrs", "Short cycling"],
  threshold: 5000,
  closeLow: 3500,
  verdicts: {
    repair: { lead: "Our take:", word: "Repair it", text: "The numbers favor a repair. Fix it and keep an eye on it." },
    close: { lead: "Our take:", word: "It's a toss-up", text: "It's close. A second opinion on the quote and the system's condition will settle it." },
    replace: { lead: "Our take:", word: "Replace it", text: "You're likely to keep paying for repairs. A new system usually wins from here." },
  },
  overLine: "over the",
  underLine: "under the",
  lineSuffix: "line.",
  symptomsNote: "symptoms checked",
  r22Note: "Systems installed before 2010 may use R-22 refrigerant, which is no longer produced, so refrigerant repairs on them get expensive fast.",
  cta: { label: "Get a free second opinion", href: "#book" },
  fine: "A rule of thumb, not a quote.",
  meterCold: "REPAIR",
  meterHot: "REPLACE",
};

/* --------------------------- SECTIONS --------------------------- */

export const plans = {
  id: "plans",
  eyebrow: config.membershipName.toUpperCase(),
  heading: `Join the ${config.membershipName}.`,
  sub: "Two tune-ups a year, first in line when it's 10° outside, and better prices on anything we fix.",
  note: "Plan prices and perks shown are placeholders until confirmed.", // OWNER-TODO: delete once confirmed
  tiers: [
    {
      name: "Essential",
      price: 14, // OWNER-TODO
      period: "/mo",
      blurb: "One system, covered twice a year.",
      perks: ["Spring AC + fall heating tune-up", "Priority scheduling", "10% off repairs"],
      cta: "Join Essential",
    },
    {
      name: "Plus",
      price: 22, // OWNER-TODO
      period: "/mo",
      blurb: "The one most homes pick.",
      featured: true,
      perks: ["Everything in Essential", "No overtime or weekend fees", "15% off repairs", "Filter swap at every visit"],
      cta: "Join Plus",
    },
    {
      name: "Total",
      price: 34, // OWNER-TODO
      period: "/mo",
      blurb: "Two systems, nothing to think about.",
      perks: ["Everything in Plus", "Covers up to 2 systems", "20% off repairs", "Diagnostic fee waived"],
      cta: "Join Total",
    },
  ],
};

export const reviews = {
  eyebrow: "REVIEWS",
  heading: "What neighbors say.",
  placeholder: "[Replace with a real Google review]",
  placeholderMeta: "Customer name · Town",
  count: 3,
  link: "See all reviews on Google",
};

export const serviceArea = {
  eyebrow: "SERVICE AREA",
  heading: `Serving ${config.city} and nearby.`,
  body: "If you're within about 25 minutes of downtown Frederick, we're already in your neighborhood most days.",
  mapLabel: `Map of towns served around ${config.city}`,
};

export const faq = {
  eyebrow: "FAQ",
  heading: "Straight answers.",
  items: [
    {
      q: "How often do I need a tune-up?",
      a: "Once a year for each system is the standard advice: your furnace in the fall and your AC in the spring. Heat pumps work year-round, so they do best with a visit every spring and fall.",
    },
    {
      q: "Do you offer same-day service?",
      a: "Most weekdays, yes. Call before noon and we can usually get a technician to you the same day. Our emergency line is open 24/7 for no-heat and no-cooling calls.", // OWNER-TODO
    },
    {
      q: "What does a tune-up include?",
      a: "A 21-point check of the whole system: we clean the condenser coil, check refrigerant charge, test capacitors, contactors and motors, tighten electrical connections, flush the condensate drain, inspect the heat exchanger and test carbon monoxide and safety controls. You get a written report and we only recommend fixes that matter.",
    },
    {
      q: "Should I repair or replace my system?",
      a: "Start with the $5,000 rule: the system's age times the repair quote. Under $5,000, a repair usually makes sense. Over it, replacing tends to win, especially if bills are climbing or the system uses R-22 refrigerant. We'll give you an honest read either way.",
    },
    {
      q: "Do you offer financing?",
      a: "Yes, on new system installs, with approved credit. Ask us for current terms when we quote.", // OWNER-TODO
    },
    {
      q: "Are you licensed and insured?",
      a: `Yes. We hold Maryland HVACR license ${config.licenseNumber} and carry full liability and workers' compensation insurance. We're happy to show proof before any work starts.`, // OWNER-TODO
    },
  ],
};

export const booking = {
  id: "book",
  eyebrow: "BOOK A VISIT",
  heading: "Let's get your house to 70.",
  accent: "70.",
  sub: `Tell us what's going on and we'll call you within ${config.callbackHours === 1 ? "one business hour" : `${config.callbackHours} business hours`} to set a time.`,
  fields: {
    name: "Name",
    phone: "Phone",
    email: "Email",
    zip: "ZIP",
    service: "What do you need?",
    window: "Preferred time",
    notes: "Anything we should know?",
    notesPlaceholder: "Upstairs bedrooms never warm up, furnace is about 14 years old…",
  },
  services: ["Tune-up", "Repair", "New system quote", "Not sure"],
  windows: ["First available", "Morning (8–12)", "Afternoon (12–4)", "Evening (4–7)"],
  submit: "Request my visit",
  sending: "Sending…",
  success: `Got it, we'll call you within ${config.callbackHours === 1 ? "one business hour" : `${config.callbackHours} business hours`}.`,
  successSub: "Need us sooner? Call",
  error: "Something went wrong sending that. Please try again or call us.",
  privacy: "We only use your details to schedule your visit.",
  orCall: "Rather talk now?",
};

export const footer = {
  tagline: "Heating, cooling and honest advice for Frederick County homes.",
  quickLinks: [
    { label: "Comfort check", href: "#comfort-check" },
    { label: "Filter check", href: "#tune-ups" },
    { label: "New systems", href: "#new-systems" },
    { label: "Fix or replace", href: "#fix-or-replace" },
    { label: config.membershipName, href: "#plans" },
    { label: "FAQ", href: "#faq" },
    { label: "Book a visit", href: "#book" },
  ],
  labels: { call: "Call", email: "Email", hours: "Hours", license: "License", area: "Service area", links: "Explore" },
};
