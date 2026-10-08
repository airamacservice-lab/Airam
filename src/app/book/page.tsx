import type { Metadata } from "next";
import { ShieldCheck, Star } from "lucide-react";
import { BookingForm, type BookingOption } from "@/components/booking/booking-form";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { getLocations, getServices } from "@/lib/content";
import { breadcrumbSchema } from "@/lib/schema";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book AC Service — Same-Day Slots Across Chennai",
  description:
    "Book Airam AC Service in 30 seconds. No advance payment — we call back within 15 minutes to confirm your slot and price.",
  alternates: { canonical: "/book" },
};

export default function BookPage() {
  const services: BookingOption[] = getServices().map((s) => ({
    value: s.slug,
    label: s.name,
  }));
  const areas: BookingOption[] = getLocations().map((l) => ({ value: l.name, label: l.name }));

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Book a Service", path: "/book" },
        ])}
      />

      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-20">
        <div className="hero-grid absolute inset-0" aria-hidden />
        <div className="wrap relative grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <Reveal>
              <p className="eyebrow">Book a service</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="h-display mt-6 text-ink-900">
                Book in <span className="text-gradient">30 seconds.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="sub mt-6 max-w-md">
                Four fields, no advance payment. We call back within 15 minutes to
                confirm your slot, technician and price.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                <span className="flex items-center gap-1.5 font-semibold text-ink-900">
                  <Star className="size-4 fill-current text-amber-400" aria-hidden />
                  Background-verified technicians
                </span>
                <span className="flex items-center gap-1.5 text-ink-500">
                  <ShieldCheck className="size-4 text-teal-600" aria-hidden />
                  GST-registered family business
                </span>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2} y={32} className="relative">
            <div
              className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-brand-500/15 via-sky-400/15 to-teal-400/15 blur-xl"
              aria-hidden
            />
            <div className="glass relative rounded-3xl p-6 shadow-lift sm:p-8">
              <BookingForm services={services} areas={areas} />
            </div>
          </Reveal>
        </div>
      </section>

      <HowItWorks />
    </>
  );
}
