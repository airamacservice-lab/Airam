import {
  BadgeCheck,
  FileText,
  HeartHandshake,
  ShieldCheck,
  Star,
  Wrench,
} from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { site } from "@/lib/site";

const items = [
  {
    icon: Star,
    title: `${site.rating.value} Google rating`,
    sub: `${site.rating.count}+ reviews`,
  },
  {
    icon: FileText,
    title: "GST registered",
    sub: "Digital invoice, every job",
  },
  {
    icon: Wrench,
    title: `${site.stats.yearsHandsOn}+ years hands-on`,
    sub: "Trained in the trade, not a call centre",
  },
  {
    icon: HeartHandshake,
    title: "Family business",
    sub: "Second-generation AC specialists",
  },
  {
    icon: BadgeCheck,
    title: "Verified technicians",
    sub: "Background-checked, in uniform",
  },
  {
    icon: ShieldCheck,
    title: "Up to 90-day warranty",
    sub: "In writing, on your invoice",
  },
];

export function TrustStrip() {
  return (
    <section className="border-y border-slate-100 bg-slate-50/70">
      <Stagger className="wrap grid grid-cols-2 gap-x-6 gap-y-8 py-10 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <StaggerItem key={item.title} className="flex flex-col items-center gap-2.5 text-center">
            <span className="grid size-11 place-items-center rounded-2xl border border-brand-100 bg-white text-brand-600 shadow-card">
              <item.icon className="size-5" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-bold text-ink-900">
                {item.title}
              </span>
              <span className="mt-0.5 block text-xs text-ink-500">
                {item.sub}
              </span>
            </span>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
