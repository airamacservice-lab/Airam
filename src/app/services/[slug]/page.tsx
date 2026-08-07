import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, MessageCircle, Phone } from "lucide-react";
import { BookingForm, type BookingOption } from "@/components/booking/booking-form";
import { Faq } from "@/components/sections/faq";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLocations, getService, getServices } from "@/lib/content";
import { ServiceIcon } from "@/lib/icons";
import { breadcrumbSchema, faqSchema, serviceSchema } from "@/lib/schema";
import { site } from "@/lib/site";
import { waQuote } from "@/lib/whatsapp";

export function generateStaticParams() {
  return getServices().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: { absolute: service.meta.title },
    description: service.meta.description,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const locations = getLocations();
  const areas: BookingOption[] = locations.map((l) => ({ value: l.name, label: l.name }));
  const services: BookingOption[] = getServices().map((s) => ({
    value: s.slug,
    label: s.name,
  }));
  const related = service.related
    .map((slug) => getService(slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <>
      <JsonLd
        data={[
          serviceSchema(service),
          faqSchema(service.faqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: service.name, path: `/services/${service.slug}` },
          ]),
        ]}
      />

      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-20">
        <div className="hero-grid absolute inset-0" aria-hidden />
        <div className="wrap relative grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <Reveal className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-sky-500 text-white shadow-glow">
                <ServiceIcon name={service.icon} className="size-5" />
              </span>
              <Badge tone="brand">{service.category}</Badge>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="h-display mt-6 text-ink-900">{service.headline}</h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="sub mt-6 max-w-xl">{service.summary}</p>
            </Reveal>
            <Reveal delay={0.24}>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {service.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-sm font-semibold text-ink-900">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal-600" aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.32}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button href={site.phoneHref} variant="emergency" size="lg">
                  <Phone className="size-5" aria-hidden />
                  {site.phone}
                </Button>
                <Button href={waQuote(service.name)} external variant="whatsapp" size="lg">
                  <MessageCircle className="size-5" aria-hidden />
                  Get a quote on WhatsApp
                </Button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2} y={32} className="relative">
            <div
              className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-brand-500/15 via-sky-400/15 to-teal-400/15 blur-xl"
              aria-hidden
            />
            <div className="glass relative rounded-3xl p-6 shadow-lift sm:p-8">
              <h2 className="text-xl font-bold text-ink-900">Book {service.shortName}</h2>
              <p className="mt-1 text-sm text-ink-500">4 fields. We handle the rest on call.</p>
              <div className="mt-6">
                <BookingForm services={services} areas={areas} defaultService={service.slug} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="wrap">
          <h2 className="h-section text-ink-900">Signs you need this service</h2>
          <Stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {service.symptoms.map((s) => (
              <StaggerItem key={s.title}>
                <div className="card h-full p-6">
                  <h3 className="text-base font-bold text-ink-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{s.description}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-slate-50 py-14 sm:py-20">
        <div className="wrap">
          <h2 className="h-section text-ink-900">Transparent pricing</h2>
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {service.pricing.map((p, i) => (
              <div
                key={p.label}
                className={`flex flex-col gap-1 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 ${
                  i > 0 ? "border-t border-slate-100" : ""
                }`}
              >
                <div>
                  <p className="font-bold text-ink-900">{p.label}</p>
                  <p className="mt-0.5 text-sm text-ink-500">{p.note}</p>
                </div>
                <p className="shrink-0 text-lg font-bold text-brand-700">{p.price}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {service.inclusions.map((inc) => (
              <div key={inc} className="flex items-start gap-2.5 text-sm text-ink-700">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal-600" aria-hidden />
                {inc}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="wrap">
          <h2 className="h-section text-ink-900">Why it&rsquo;s worth doing properly</h2>
          <Stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {service.benefits.map((b) => (
              <StaggerItem key={b.title}>
                <div className="card h-full p-6">
                  <h3 className="text-base font-bold text-ink-900">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{b.description}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-brand-950 py-14 sm:py-20">
        <div className="wrap">
          <h2 className="h-section text-white">How the visit goes</h2>
          <Stagger className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" gap={0.1}>
            {service.process.map((step, i) => (
              <StaggerItem key={step.title}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6">
                  <span className="text-xs font-bold tracking-widest text-sky-300">
                    STEP {i + 1}
                  </span>
                  <h3 className="mt-2 text-base font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {step.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <Faq items={service.faqs} title={`${service.shortName} — frequently asked`} />

      {related.length > 0 && (
        <section className="py-14 sm:py-20">
          <div className="wrap">
            <h2 className="h-section text-ink-900">Related services</h2>
            <Stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <StaggerItem key={r.slug}>
                  <Link
                    href={`/services/${r.slug}`}
                    className="card card-hover group flex h-full items-center justify-between gap-3 p-5"
                  >
                    <span className="text-sm font-bold text-ink-900">{r.name}</span>
                    <ArrowRight
                      className="size-4 shrink-0 text-ink-400 transition-all group-hover:translate-x-0.5 group-hover:text-brand-600"
                      aria-hidden
                    />
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}
    </>
  );
}
