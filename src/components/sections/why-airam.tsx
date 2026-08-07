import { Check, X } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";

const rows = [
  {
    airam: "Price quoted before we open the unit — and it holds",
    others: "Price appears after the AC is in pieces",
  },
  {
    airam: "Background-verified technician in uniform, details shared ahead",
    others: "Unknown freelancer, no accountability",
  },
  {
    airam: "Leak test before any gas refill",
    others: "“Gas over, refill pannunga” — every single time",
  },
  {
    airam: "Up to 90-day warranty, printed on a GST invoice",
    others: "Verbal promise that expires at the gate",
  },
  {
    airam: "Old parts returned, new parts billed at printed MRP",
    others: "Mystery parts, mystery prices",
  },
  {
    airam: "Confirmed time slot with live updates",
    others: "“Evening varuvom” — then silence",
  },
];

export function WhyAiram() {
  return (
    <Section tone="gray" id="why-airam">
      <div className="wrap">
        <SectionHeading
          eyebrow="Why Airam"
          title="The difference is discipline"
          sub="Anyone can carry a gauge and a screwdriver. Very few run an AC service like a professional practice."
        />

        <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-3xl bg-brand-950 p-7 text-white shadow-lift sm:p-8">
              <p className="text-xs font-bold tracking-[0.16em] text-sky-300 uppercase">
                With Airam
              </p>
              <ul className="mt-6 space-y-4">
                {rows.map((r) => (
                  <li key={r.airam} className="flex gap-3">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-teal-400/20 text-teal-300">
                      <Check className="size-3.5" aria-hidden />
                    </span>
                    <span className="text-[15px] leading-relaxed text-slate-100">
                      {r.airam}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="h-full rounded-3xl border border-slate-200 bg-white p-7 sm:p-8">
              <p className="text-xs font-bold tracking-[0.16em] text-ink-400 uppercase">
                A typical local service
              </p>
              <ul className="mt-6 space-y-4">
                {rows.map((r) => (
                  <li key={r.others} className="flex gap-3">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-red-50 text-red-400">
                      <X className="size-3.5" aria-hidden />
                    </span>
                    <span className="text-[15px] leading-relaxed text-ink-500">
                      {r.others}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
