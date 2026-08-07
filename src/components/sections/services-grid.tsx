import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import type { Service } from "@/lib/content";
import { ServiceIcon } from "@/lib/icons";

export function ServicesGrid({
  services,
  count = 8,
}: {
  services: Service[];
  count?: number;
}) {
  const shown = services.slice(0, count);

  return (
    <Section id="services">
      <div className="wrap">
        <SectionHeading
          eyebrow="What we fix"
          title="Every AC problem. One trusted team."
          sub="From a quick filter service to a full VRF health audit — transparent pricing, genuine parts, warranty in writing."
        />

        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((s) => (
            <StaggerItem key={s.slug}>
              <Link
                href={`/services/${s.slug}`}
                className="card card-hover group flex h-full flex-col p-6"
              >
                <div className="flex items-start justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-sky-50 text-brand-600 transition-colors group-hover:from-brand-600 group-hover:to-sky-500 group-hover:text-white">
                    <ServiceIcon name={s.icon} className="size-6" />
                  </span>
                  <ArrowUpRight
                    className="size-5 text-ink-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600"
                    aria-hidden
                  />
                </div>
                <h3 className="mt-4 text-lg font-bold text-ink-900">
                  {s.name}
                </h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-500">
                  {s.tagline}
                </p>
                <p className="mt-4 text-sm font-bold text-brand-700">
                  {s.pricing[0]?.price}
                </p>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-10 text-center">
          <Button href="/services" variant="secondary" size="lg">
            View all {services.length} services
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </Section>
  );
}
