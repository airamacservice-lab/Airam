import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tones = {
  brand: "border-brand-100 bg-brand-50 text-brand-700",
  teal: "border-teal-100 bg-teal-50 text-teal-700",
  orange: "border-orange-100 bg-orange-50 text-orange-700",
  slate: "border-slate-200 bg-slate-50 text-ink-700",
} as const;

export function Badge({
  tone = "brand",
  className,
  children,
}: {
  tone?: keyof typeof tones;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
