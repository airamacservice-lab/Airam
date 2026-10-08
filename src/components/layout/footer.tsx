import Link from "next/link";
import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { getLocations, getServices } from "@/lib/content";
import { site } from "@/lib/site";
import { waBooking } from "@/lib/whatsapp";

export function Footer() {
  const services = getServices().slice(0, 8);
  const locations = getLocations().slice(0, 8);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-100 bg-slate-50 pb-28 sm:pb-10">
      <div className="wrap grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- plain img: fixed-size logo, no need for the optimizer pipeline */}
            <img src="/logo-blue.png" alt={site.name} className="size-20 rounded-2xl object-contain shadow-sm" />
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-ink-500">
            A family-run AC company built on a simple idea: fix it properly,
            price it honestly, and stand behind the work. Serving homes and
            businesses across Chennai.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700">
              <ShieldCheck className="size-3.5 text-teal-600" aria-hidden />
              GST Registered
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700">
              <ShieldCheck className="size-3.5 text-teal-600" aria-hidden />
              Verified Technicians
            </span>
          </div>
          <p className="mt-3 text-xs text-ink-400">GSTIN: {site.gstin}</p>
        </div>

        <nav aria-label="Services">
          <h3 className="text-sm font-bold tracking-wide text-ink-900 uppercase">
            Services
          </h3>
          <ul className="mt-4 space-y-2.5">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="text-sm text-ink-500 transition-colors hover:text-brand-700"
                >
                  {s.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/services"
                className="text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                All services →
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Service areas">
          <h3 className="text-sm font-bold tracking-wide text-ink-900 uppercase">
            Service Areas
          </h3>
          <ul className="mt-4 space-y-2.5">
            {locations.map((l) => (
              <li key={l.slug}>
                <Link
                  href={`/locations/${l.slug}`}
                  className="text-sm text-ink-500 transition-colors hover:text-brand-700"
                >
                  AC Service in {l.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/locations"
                className="text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                All areas →
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-bold tracking-wide text-ink-900 uppercase">
            Reach Us
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-ink-500">
            <li>
              <a
                href={site.phoneHref}
                className="flex items-center gap-2.5 font-semibold text-ink-900 hover:text-brand-700"
              >
                <Phone className="size-4 text-brand-600" aria-hidden />
                {site.phone}
              </a>
            </li>
            <li>
              <a
                href={waBooking()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-brand-700"
              >
                <MessageCircle className="size-4 text-[#0a6b5f]" aria-hidden />
                WhatsApp us
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 text-brand-600" aria-hidden />
              {site.email}
            </li>
            <li className="flex items-center gap-2.5">
              <Clock className="size-4 text-brand-600" aria-hidden />
              {site.hours}
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
              {site.address.line}, {site.address.locality},{" "}
              {site.address.city} – {site.address.pincode}
            </li>
          </ul>
          <p className="mt-4 rounded-xl border border-orange-100 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700">
            {site.emergencyNote} — call for urgent breakdowns
          </p>
        </div>
      </div>

      <div className="wrap flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-ink-400 sm:flex-row">
        <p>
          © {year} {site.name}. All rights reserved.
        </p>
        <div className="flex gap-5">
          <Link href="/about" className="hover:text-brand-700">
            About
          </Link>
          <Link href="/blog" className="hover:text-brand-700">
            Blog
          </Link>
          <Link href="/book" className="hover:text-brand-700">
            Book a Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
