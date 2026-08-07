import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "emergency" | "whatsapp";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-glow hover:from-brand-700 hover:to-brand-600 active:scale-[0.98]",
  secondary:
    "border border-slate-200 bg-white text-ink-900 shadow-card hover:border-brand-300 hover:text-brand-700 active:scale-[0.98]",
  ghost: "text-brand-700 hover:bg-brand-50",
  emergency:
    "bg-gradient-to-r from-orange-700 to-amber-700 text-white shadow-[0_12px_32px_rgb(194_65_12/0.35)] hover:from-orange-800 hover:to-amber-800 active:scale-[0.98]",
  whatsapp:
    "bg-[#0a6b5f] text-white shadow-[0_12px_32px_rgb(7_94_84/0.4)] hover:bg-[#075e54] active:scale-[0.98]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-7 text-base gap-2.5",
};

const base =
  "inline-flex items-center justify-center rounded-xl font-semibold whitespace-nowrap transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 cursor-pointer select-none";

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  href?: string;
  external?: boolean;
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<"button">, "className" | "children">;

export function Button({
  variant = "primary",
  size = "md",
  href,
  external,
  children,
  className,
  ...rest
}: ButtonProps) {
  const cls = cn(base, variants[variant], sizes[size], className);

  if (href) {
    // tel:, wa.me and other external targets use a plain anchor;
    // internal paths get Link prefetching.
    if (external || !href.startsWith("/")) {
      return (
        <a
          href={href}
          className={cls}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
