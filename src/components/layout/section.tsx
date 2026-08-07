import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

const tones = {
  white: "bg-white",
  gray: "bg-slate-50",
  dark: "bg-brand-950 text-white",
} as const;

export function Section({
  id,
  tone = "white",
  className,
  children,
}: {
  id?: string;
  tone?: keyof typeof tones;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn("relative py-20 sm:py-24 lg:py-28", tones[tone], className)}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
  dark = false,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  align?: "center" | "left";
  dark?: boolean;
}) {
  return (
    <Reveal
      className={cn(
        "mb-12 max-w-2xl sm:mb-16",
        align === "center" && "mx-auto text-center",
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "eyebrow mb-4",
            dark && "border-white/15 bg-white/10 text-sky-300",
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2 className={cn("h-section", dark ? "text-white" : "text-ink-900")}>
        {title}
      </h2>
      {sub && (
        <p className={cn("sub mt-4", dark && "text-slate-300")}>{sub}</p>
      )}
    </Reveal>
  );
}
