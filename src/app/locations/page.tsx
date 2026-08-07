import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { getLocations } from "@/lib/content";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "AC Service Areas in Chennai — 15 Localities Covered",
  description:
    "Airam AC Service covers 15 Chennai localities with a 60–90 minute reach — from Velachery and OMR to Anna Nagar and Porur. Find local pricing and reviews for your area.",
  alternates: { canonical: "/locations" },
};

export default function LocationsPage() {
  const locations = getLocations();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Service Areas", path: "/locations" },
        ])}
      />
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-20">
        <div className="hero-grid absolute inset-0" aria-hidden />
        <div className="wrap relative max-w-3xl">
          <p className="eyebrow">Service areas</p>
          <h1 className="h-display mt-6 text-ink-900">
            All over Chennai. <span className="text-gradient">60–90 minutes away.</span>
          </h1>
          <p className="sub mt-6">
            {locations.length} localities covered, zone-wise technician stationing, and
            the same transparent pricing everywhere.
          </p>
        </div>
      </section>

      <section className="pb-20 sm:pb-28">
        <div className="wrap">
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map((l) => (
              <StaggerItem key={l.slug}>
                <Link
                  href={`/locations/${l.slug}`}
                  className="card card-hover group flex h-full flex-col p-6"
                >
                  <span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                    <MapPin className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-ink-900">{l.name}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-500">
                    {l.tagline}
                  </p>
                  <p className="mt-4 text-sm font-bold text-brand-700">60–90 min reach</p>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
