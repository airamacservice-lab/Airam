import {
  CalendarCheck,
  PhoneCall,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

const steps = [
  {
    icon: CalendarCheck,
    title: "Book in 30 seconds",
    text: "Call, WhatsApp, or the form — name, number, area, problem. That's all we need to get moving.",
  },
  {
    icon: PhoneCall,
    title: "Slot confirmed",
    text: "We call back within 15 minutes with your time slot, the technician's name, and the visit price.",
  },
  {
    icon: Wrench,
    title: "Diagnose, quote, fix",
    text: "The fault is shown to you, the price approved by you — then the repair happens in the same visit whenever parts allow.",
  },
  {
    icon: ShieldCheck,
    title: "Warranty in writing",
    text: "Digital GST invoice with the warranty period printed on it. If the fault returns, so do we — free.",
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works">
      <div className="wrap">
        <SectionHeading
          eyebrow="How it works"
          title="From call to cool in four steps"
          sub="A process designed so you always know who is coming, when, and at what price."
        />

        <Stagger className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4" gap={0.14}>
          {/* Connecting line (desktop) */}
          <div
            className="absolute top-7 right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-brand-200 via-sky-300 to-teal-300 lg:block"
            aria-hidden
          />
          {steps.map((step, i) => (
            <StaggerItem key={step.title} className="relative">
              <div className="flex flex-col items-center text-center">
                <span className="relative z-10 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-sky-500 text-white shadow-glow">
                  <step.icon className="size-6" aria-hidden />
                </span>
                <span className="mt-4 text-xs font-bold tracking-widest text-brand-600">
                  STEP {i + 1}
                </span>
                <h3 className="mt-1.5 text-lg font-bold text-ink-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">
                  {step.text}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}
