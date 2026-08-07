import type { Metadata } from "next";
import type { BookingOption } from "@/components/booking/booking-form";
import { BeforeAfter } from "@/components/sections/before-after";
import { Commercial } from "@/components/sections/commercial";
import { Coverage } from "@/components/sections/coverage";
import { EmergencyBanner } from "@/components/sections/emergency-banner";
import { Faq } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { ServicesGrid } from "@/components/sections/services-grid";
import { Testimonials } from "@/components/sections/testimonials";
import { TrustStrip } from "@/components/sections/trust-strip";
import { WhyAiram } from "@/components/sections/why-airam";
import { JsonLd } from "@/components/seo/json-ld";
import { homeFaqs } from "@/data/faqs";
import { getLocations, getServices } from "@/lib/content";
import { faqSchema } from "@/lib/schema";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "AC Repair & Service in Chennai — Same-Day Visits",
  description: `${site.tagline}. Transparent pricing, background-verified technicians, up to a 90-day warranty. Book in 30 seconds.`,
  alternates: { canonical: "/" },
};

export default function Home() {
  const services = getServices();
  const locations = getLocations();

  const bookingServices: BookingOption[] = services.map((s) => ({
    value: s.slug,
    label: s.name,
  }));
  const bookingAreas: BookingOption[] = locations.map((l) => ({
    value: l.name,
    label: l.name,
  }));

  return (
    <>
      <JsonLd data={faqSchema(homeFaqs)} />
      <Hero services={bookingServices} areas={bookingAreas} />
      <TrustStrip />
      <ServicesGrid services={services} />
      <HowItWorks />
      <Coverage locations={locations} />
      <BeforeAfter />
      <WhyAiram />
      <Commercial />
      <Testimonials />
      <Faq items={homeFaqs} />
      <EmergencyBanner />
    </>
  );
}
