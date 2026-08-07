import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, Phone, Star } from "lucide-react";
import { BookingForm, type BookingOption } from "@/components/booking/booking-form";
import { Faq } from "@/components/sections/faq";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLocation, getLocations, getService, getServices } from "@/lib/content";
import { ServiceIcon } from "@/lib/icons";
import { breadcrumbSchema, faqSchema, locationPageSchema } from "@/lib/schema";
import { site } from "@/lib/site";
import { waBooking } from "@/lib/whatsapp";

export function generateStaticParams() {
  return getLocations().map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) return {};
  return {
    title: { absolute: location.meta.title },
    description: location.meta.description,
    alternates: { canonical: `/locations/${location.slug}` },
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) notFound();

  const services: BookingOption[] = getServices().map((s) => ({
    value: s.slug,
    label: s.name,
  }));
  const areas: BookingOption[] = getLocations().map((l) => ({ value: l.name, label: l.name }));
  const popularServices = location.popularServices
    .map((slug) => getService(slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <>
      <JsonLd
        data={[
          locationPageSchema(location),
          faqSchema(location.faqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Service Areas", path: "/locations" },
            { name: location.name, path: `/locations/${location.slug}` },
          ]),
        ]}
      />

      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-20">
        <div className="hero-grid absolute inset-0" aria-hidden />
        <div className="wrap relative grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <Reveal>
              <p className="eyebrow">AC service in {location.name}</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="h-display mt-6 text-ink-900">{location.headline}</h1>
            </Reveal>
            {location.intro.map((p, i) => (
              <Reveal key={i} delay={0.16 + i * 0.06}>
                <p className="sub mt-6 max-w-xl">{p}</p>
              </Reveal>
            ))}
            <Reveal delay={0.32}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button href={site.phoneHref} variant="emergency" size="lg">
                  <Phone className="size-5" aria-hidden />
                  {site.phone}
                </Button>
                <Button
                  href={waBooking(undefined, location.name)}
                  external
                  variant="whatsapp"
                  size="lg"
                >
                  <MessageCircle className="size-5" aria-hidden />
                  WhatsApp now
                </Button>
              </div>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="mt-8 flex flex-wrap gap-2 border-t border-slate-200/80 pt-6">
                {location.neighbourhoods.map((n) => (
                  <Badge key={n} tone="slate">
                    {n}
                  </Badge>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2} y={32} className="relative">
            <div
              className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-brand-500/15 via-sky-400/15 to-teal-400/15 blur-xl"
              aria-hidden
            />
            <div className="glass relative rounded-3xl p-6 shadow-lift sm:p-8">
              <h2 className="text-xl font-bold text-ink-900">Book in {location.name}</h2>
              <p className="mt-1 text-sm text-ink-500">4 fields. We handle the rest on call.</p>
              <div className="mt-6">
                <BookingForm services={services} areas={areas} defaultArea={location.name} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-slate-50 py-14 sm:py-20">
        <div className="wrap">
          <h2 className="h-section text-ink-900">What {location.name} ACs deal with</h2>
          <Stagger className="mt-8 grid gap-5 sm:grid-cols-2">
            {location.challenges.map((c) => (
              <StaggerItem key={c.title}>
                <div className="card h-full p-6">
                  <h3 className="text-base font-bold text-ink-900">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{c.description}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {popularServices.length > 0 && (
        <section className="py-14 sm:py-20">
          <div className="wrap">
            <h2 className="h-section text-ink-900">Popular in {location.name}</h2>
            <Stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {popularServices.map((s) => (
                <StaggerItem key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="card card-hover group flex h-full items-center gap-3 p-5"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                      <ServiceIcon name={s.icon} className="size-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-ink-900">{s.name}</span>
                      <span className="block text-xs text-ink-400">{s.pricing[0]?.price}</span>
                    </span>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {location.testimonials.length > 0 && (
        <section className="bg-slate-50 py-14 sm:py-20">
          <div className="wrap">
            <h2 className="h-section text-ink-900">{location.name} customers say</h2>
            <Stagger className="mt-8 grid gap-5 sm:grid-cols-2">
              {location.testimonials.map((t) => (
                <StaggerItem key={t.name}>
                  <div className="card h-full p-6">
                    <div className="flex text-amber-400" aria-hidden>
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="size-4 fill-current" />
                      ))}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ink-700">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <p className="mt-4 text-sm font-bold text-ink-900">
                      {t.name} <span className="font-normal text-ink-400">· {t.area}</span>
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      <Faq items={location.faqs} title={`AC service in ${location.name} — FAQ`} />
    </>
  );
}
