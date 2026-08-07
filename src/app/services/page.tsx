import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { getServices, type Service } from "@/lib/content";
import { ServiceIcon } from "@/lib/icons";
import { breadcrumbSchema } from "@/lib/schema";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "AC Services in Chennai — Repair, Installation, AMC & Commercial",
  description:
    "Every AC service Airam offers in Chennai: repair, gas filling, deep cleaning, installation, AMC plans and commercial VRV/VRF service — transparent pricing on every page.",
  alternates: { canonical: "/services" },
};

const categories: Array<{ key: Service["category"]; label: string; sub: string }> = [
  { key: "repair", label: "Repair & Diagnosis", sub: "Fix what's wrong, priced before we start" },
  { key: "installation", label: "Installation & Removal", sub: "Done to spec, first time" },
  { key: "maintenance", label: "Maintenance & AMC", sub: "Prevent the breakdown, not just fix it" },
  { key: "commercial", label: "Commercial & Large Systems", sub: "VRV, VRF and fleet contracts" },
];

export default function ServicesPage() {
  const services = getServices();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ])}
      />
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-20">
        <div className="hero-grid absolute inset-0" aria-hidden />
        <div className="wrap relative max-w-3xl">
          <p className="eyebrow">All services</p>
          <h1 className="h-display mt-6 text-ink-900">
            Every AC problem. <span className="text-gradient">One trusted team.</span>
          </h1>
          <p className="sub mt-6">
            {services.length} services across repair, installation, maintenance and
            commercial systems — every one priced upfront and backed in writing.
          </p>
        </div>
      </section>

      {categories.map((cat) => {
        const items = services.filter((s) => s.category === cat.key);
        if (items.length === 0) return null;
        return (
          <section key={cat.key} className="py-10 sm:py-14">
            <div className="wrap">
              <h2 className="h-section text-ink-900">{cat.label}</h2>
              <p className="sub mt-2">{cat.sub}</p>
              <Stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((s) => (
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
                      <h3 className="mt-4 text-lg font-bold text-ink-900">{s.name}</h3>
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
            </div>
          </section>
        );
      })}

      <section className="py-14 sm:py-20">
        <div className="wrap">
          <div className="card flex flex-col items-center gap-4 rounded-3xl p-10 text-center">
            <h2 className="text-2xl font-bold text-ink-900">
              Not sure which service you need?
            </h2>
            <p className="max-w-md text-ink-500">
              Call or WhatsApp {site.phone} and describe the problem — we&rsquo;ll tell
              you exactly what it needs before you book anything.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
