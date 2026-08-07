"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type AccordionItem = { question: string; answer: string };

export function Accordion({
  items,
  className,
}: {
  items: AccordionItem[];
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className={cn("divide-y divide-slate-100", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.question}>
            <button
              className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span
                className={cn(
                  "text-base font-semibold transition-colors sm:text-lg",
                  isOpen ? "text-brand-700" : "text-ink-900",
                )}
              >
                {item.question}
              </span>
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full border transition-all duration-300",
                  isOpen
                    ? "rotate-180 border-brand-200 bg-brand-50 text-brand-600"
                    : "border-slate-200 text-ink-400",
                )}
              >
                <ChevronDown className="size-4" />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pr-12 pb-5 leading-relaxed text-ink-500">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
