import {
  Building2,
  Factory,
  GraduationCap,
  MessageCircle,
  Stethoscope,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { waCommercial } from "@/lib/whatsapp";

const segments = [
  {
    icon: Building2,
    title: "Offices & IT",
    text: "Cassette, ductable and VRF fleets kept within SLA — with after-hours servicing so work never stops.",
  },
  {
    icon: Store,
    title: "Retail & Showrooms",
    text: "Walk-ins drop when cooling drops. Overnight maintenance windows keep the floor at 24°C through festival rush.",
  },
  {
    icon: GraduationCap,
    title: "Schools & Colleges",
    text: "Vacation-scheduled deep services, term-time breakdown priority, and child-safe, verified technicians.",
  },
  {
    icon: Stethoscope,
    title: "Clinics & Hospitals",
    text: "Hygiene-first servicing with anti-bacterial coil treatment and documented maintenance for compliance.",
  },
  {
    icon: UtensilsCrossed,
    title: "Restaurants & Cafés",
    text: "Grease-laden filters need double-frequency cleaning. We schedule around prep hours, not against them.",
  },
  {
    icon: Factory,
    title: "Industrial & Warehouses",
    text: "Package units and ductable systems audited quarterly — with load advice before summer peaks, not after.",
  },
];

export function Commercial() {
  return (
    <Section tone="dark" id="commercial">
      <div
        className="orb top-[-120px] right-[-100px] size-96 bg-brand-500/20"
        aria-hidden
      />
      <div className="wrap relative">
        <SectionHeading
          eyebrow="Commercial AC"
          title="Cooling that keeps your business open"
          dark
          sub="One partner for every unit on your premises — preventive schedules, SLA response, consolidated GST invoicing."
        />

        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {segments.map((s) => (
            <StaggerItem key={s.title}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors duration-300 hover:border-sky-400/40 hover:bg-white/10">
                <span className="grid size-11 place-items-center rounded-xl bg-sky-400/15 text-sky-300">
                  <s.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {s.text}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href={waCommercial()} external variant="whatsapp" size="lg">
            <MessageCircle className="size-5" aria-hidden />
            Get a commercial quote
          </Button>
          <Button
            href="/services/commercial-amc-contracts"
            variant="secondary"
            size="lg"
            className="border-white/20 bg-transparent !text-white hover:border-sky-300 hover:!text-sky-300"
          >
            Explore commercial AMC
          </Button>
        </Reveal>
      </div>
    </Section>
  );
}
