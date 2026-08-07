import Link from "next/link";
import { MapPin, Navigation } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import type { Location } from "@/lib/content";

/** Decorative pin positions for the stylised coverage panel. */
const pins = [
  { x: 52, y: 22, delay: "0s" },
  { x: 68, y: 38, delay: "0.6s" },
  { x: 44, y: 46, delay: "1.2s" },
  { x: 60, y: 62, delay: "0.3s" },
  { x: 34, y: 68, delay: "0.9s" },
  { x: 74, y: 78, delay: "1.5s" },
];

export function Coverage({ locations }: { locations: Location[] }) {
  return (
    <Section tone="gray" id="coverage">
      <div className="wrap">
        <SectionHeading
          eyebrow="Coverage"
          title="All over Chennai. 60–90 minutes away."
          sub="From the coast to the IT corridor — pick your area to see local pricing, reach times and reviews."
        />

        <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Stylised zone panel */}
          <Reveal className="relative hidden overflow-hidden rounded-3xl bg-brand-950 p-8 lg:block">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgb(96 150 250 / 0.35) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
              aria-hidden
            />
            {pins.map((p) => (
              <span
                key={`${p.x}-${p.y}`}
                className="absolute"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                aria-hidden
              >
                <span
                  className="absolute inline-flex size-8 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-sky-400/30"
                  style={{ animationDelay: p.delay, animationDuration: "2.4s" }}
                />
                <span className="absolute grid size-4 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-sky-400">
                  <span className="size-1.5 rounded-full bg-white" />
                </span>
              </span>
            ))}
            <div className="relative">
              <Navigation className="size-8 text-sky-300" aria-hidden />
              <h3 className="mt-4 text-2xl font-bold text-white">
                Chennai service zones
              </h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-300">
                South, Central, West and the coastal stretch — technicians are
                stationed zone-wise, which is how the 60–90 minute reach holds
                even in peak summer.
              </p>
              <dl className="mt-8 grid grid-cols-3 gap-4 text-center">
                {[
                  ["15", "areas"],
                  ["4", "zones"],
                  ["7 days", "a week"],
                ].map(([v, l]) => (
                  <div
                    key={l}
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4"
                  >
                    <dd className="text-xl font-bold text-white">{v}</dd>
                    <dd className="mt-0.5 text-xs text-slate-400">{l}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>

          {/* Clickable locality cards */}
          <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3" gap={0.05}>
            {locations.map((l) => (
              <StaggerItem key={l.slug}>
                <Link
                  href={`/locations/${l.slug}`}
                  className="card card-hover group flex h-full items-center gap-3 p-4"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                    <MapPin className="size-4" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-ink-900">
                      {l.name}
                    </span>
                    <span className="block text-xs text-ink-400">
                      60–90 min reach
                    </span>
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </Section>
  );
}
