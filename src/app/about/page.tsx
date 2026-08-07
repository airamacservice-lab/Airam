import type { Metadata } from "next";
import { HeartHandshake, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { TrustStrip } from "@/components/sections/trust-strip";
import { WhyAiram } from "@/components/sections/why-airam";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { breadcrumbSchema } from "@/lib/schema";
import { site } from "@/lib/site";
import { waBooking } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "About Airam AC Service — A Family-Run Chennai AC Company",
  description:
    "Airam AC Service is a second-generation, family-run AC repair and maintenance business in Chennai — background-verified technicians, transparent pricing, warranty in writing.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />

      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-20">
        <div className="hero-grid absolute inset-0" aria-hidden />
        <div className="wrap relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <Reveal>
              <p className="eyebrow">
                <HeartHandshake className="size-3.5" aria-hidden />
                Our story
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="h-display mt-6 text-ink-900">
                A trade run on <span className="text-gradient">trust,</span> not
                transactions.
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="sub mt-6 max-w-xl">{site.founder.story}</p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button href={site.phoneHref} variant="emergency" size="lg">
                  <Phone className="size-5" aria-hidden />
                  {site.phone}
                </Button>
                <Button href={waBooking()} external variant="whatsapp" size="lg">
                  <MessageCircle className="size-5" aria-hidden />
                  WhatsApp us
                </Button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2} y={32}>
            <div className="glass relative rounded-3xl p-8 shadow-lift">
              <ShieldCheck className="size-8 text-brand-600" aria-hidden />
              <dl className="mt-6 grid grid-cols-2 gap-6">
                {[
                  { value: site.stats.yearsHandsOn, suffix: "+", label: "Years hands-on" },
                  { value: site.stats.unitsServiced, suffix: "+", label: "Units serviced" },
                  { value: site.stats.localities, suffix: "", label: "Chennai areas" },
                  { value: site.stats.sameDayPct, suffix: "%", label: "Same-day visits" },
                ].map((s) => (
                  <div key={s.label}>
                    <dt className="sr-only">{s.label}</dt>
                    <dd className="text-3xl font-bold text-ink-900">
                      <CountUp value={s.value} suffix={s.suffix} />
                    </dd>
                    <dd className="mt-1 text-sm text-ink-500">{s.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      <TrustStrip />
      <WhyAiram />
    </>
  );
}
