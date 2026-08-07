export type AmcPlan = {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
};

export const amcPlans: AmcPlan[] = [
  {
    name: "Essential Care",
    price: "₹1,199",
    cadence: "per unit / year",
    description: "The disciplined basics that double an AC's healthy years.",
    features: [
      "2 scheduled services a year",
      "Filter, coil and drain-line cleaning",
      "Priority booking window",
      "10% off all repairs",
      "Digital service history log",
    ],
    cta: "Start with Essential",
  },
  {
    name: "Comfort Plus",
    price: "₹1,999",
    cadence: "per unit / year",
    description: "Full-cover care — the plan most Chennai homes choose.",
    features: [
      "3 services a year, incl. 1 jet deep clean",
      "One gas top-up covered",
      "Minor parts replaced at no charge",
      "Same-day priority visits",
      "15% off all repairs",
      "Zero visit charges, all year",
    ],
    popular: true,
    cta: "Choose Comfort Plus",
  },
  {
    name: "Commercial Fleet",
    price: "Custom",
    cadence: "per fleet / year",
    description: "For offices, schools, clinics and retail that cannot go warm.",
    features: [
      "Quarterly preventive maintenance",
      "SLA-bound breakdown response",
      "Dedicated account manager",
      "Fleet health + consumption reports",
      "Consolidated GST invoicing",
    ],
    cta: "Get a fleet quote",
  },
];
