import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { Accordion, type AccordionItem } from "@/components/ui/accordion";

export function Faq({
  items,
  eyebrow = "FAQ",
  title = "Questions, answered",
  sub = "Everything customers ask before booking a first visit.",
}: {
  items: AccordionItem[];
  eyebrow?: string;
  title?: string;
  sub?: string;
}) {
  return (
    <Section tone="gray" id="faq">
      <div className="wrap">
        <SectionHeading eyebrow={eyebrow} title={title} sub={sub} />
        <Reveal className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white px-6 sm:px-8">
          <Accordion items={items} />
        </Reveal>
      </div>
    </Section>
  );
}
