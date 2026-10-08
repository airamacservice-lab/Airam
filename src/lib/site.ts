/**
 * Single source of truth for business facts.
 * ⚠️ Values marked REPLACE must be updated with real business details before launch.
 */
export const site = {
  name: "Airam AC Service",
  shortName: "Airam",
  tagline: "Chennai's premium AC service, repair and maintenance company",
  url: "https://airamacservice.in", // REPLACE with the live domain

  phone: "+91 63815 49788",
  phoneHref: "tel:+916381549788",
  whatsappNumber: "916381549788",
  email: "hello@airamacservice.in", // REPLACE

  gstin: "33XXXXX0000X1Z5", // REPLACE with the real GSTIN

  address: {
    line: "Velachery Main Road", // REPLACE
    locality: "Velachery",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600042", // REPLACE
  },

  hours: "Mon–Sun · 8:00 AM – 9:00 PM",
  hoursSchema: { opens: "08:00", closes: "21:00" },
  emergencyNote: "Emergency visits till 11 PM",

  // Shown in the trust strip and schema. REPLACE with live Google Business
  // profile figures once connected — do not ship sample numbers.
  rating: { value: 4.9, count: 260 },

  stats: {
    yearsHandsOn: 12, // REPLACE — founder's total years incl. father's business
    unitsServiced: 8000, // REPLACE
    localities: 15,
    sameDayPct: 92, // REPLACE
  },

  founder: {
    story:
      "Airam began long before it had a name — on service calls with my father, hauling gauges and copper coil through Chennai summers. Years of fixing every brand and every fault taught me one thing: this trade runs on trust, not transactions.",
  },

  geo: { latitude: 12.9791, longitude: 80.2212 }, // REPLACE with office coordinates
} as const;

export type Site = typeof site;
