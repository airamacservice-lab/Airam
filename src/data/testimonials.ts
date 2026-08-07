/**
 * ⚠️ Sample testimonials for layout and tone. REPLACE with real customer
 * reviews (with permission) before launch.
 */
export type Testimonial = {
  name: string;
  area: string;
  service: string;
  quote: string;
  rating: number;
};

export const testimonials: Testimonial[] = [
  {
    name: "Karthik R.",
    area: "Velachery",
    service: "AC not cooling",
    quote:
      "Booked at 9 AM, technician arrived before noon. He showed me the gas pressure reading on his gauge before and after — first time a service company has explained anything to me.",
    rating: 5,
  },
  {
    name: "Priya S.",
    area: "OMR, Thoraipakkam",
    service: "Deep cleaning",
    quote:
      "They laid a sheet under the unit, jet-washed the coils in a bag, and left the wall cleaner than they found it. The airflow difference was obvious the same evening.",
    rating: 5,
  },
  {
    name: "Mohammed F.",
    area: "Anna Nagar",
    service: "PCB repair",
    quote:
      "Two other shops told me to replace the board for ₹9,000. Airam repaired it for a third of that and it has run through the whole summer without an issue.",
    rating: 5,
  },
  {
    name: "Lakshmi N.",
    area: "Adyar",
    service: "AMC — 3 units",
    quote:
      "The reminder comes before I remember. Same technician each visit, digital invoice each time, and our bedroom AC has not had a single breakdown in two years.",
    rating: 5,
  },
  {
    name: "Suresh V.",
    area: "T. Nagar",
    service: "Showroom cassette AC",
    quote:
      "They serviced all four cassette units overnight, after closing hours. Not a minute of business lost during festival season — that is why we signed the AMC.",
    rating: 5,
  },
  {
    name: "Anitha K.",
    area: "Medavakkam",
    service: "Installation",
    quote:
      "They vacuumed the line before releasing gas and billed the copper per foot exactly as quoted on WhatsApp. No surprises, no rounding up. Rare honesty.",
    rating: 5,
  },
];
