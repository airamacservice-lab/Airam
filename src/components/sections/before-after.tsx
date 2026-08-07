"use client";

import { useCallback, useRef, useState } from "react";
import { MoveHorizontal, Sparkles, Wind } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";

/**
 * Interactive before/after comparison. The two panels are stylised
 * illustrations — swap in real service photos (same slider works) when
 * available.
 */
export function BeforeAfter() {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(56);

  const move = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(94, Math.max(6, pct)));
  }, []);

  return (
    <Section id="results">
      <div className="wrap">
        <SectionHeading
          eyebrow="The Airam finish"
          title="See what a real deep clean does"
          sub="Drag the handle. This is the difference between a wipe-down and a pressure jet wash with coil chemical treatment."
        />

        <Reveal className="mx-auto max-w-4xl">
          <div
            ref={ref}
            className="relative h-80 cursor-ew-resize touch-none overflow-hidden rounded-3xl shadow-lift select-none sm:h-96"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              move(e.clientX);
            }}
            onPointerMove={(e) => e.buttons > 0 && move(e.clientX)}
            role="slider"
            aria-label="Before and after comparison"
            aria-valuenow={Math.round(pos)}
            aria-valuemin={0}
            aria-valuemax={100}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") setPos((p) => Math.max(6, p - 4));
              if (e.key === "ArrowRight") setPos((p) => Math.min(94, p + 4));
            }}
          >
            {/* AFTER layer (base) */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-teal-50">
              <CoilPattern clean />
              <div className="absolute bottom-5 left-5 rounded-xl bg-white/85 px-4 py-2.5 backdrop-blur">
                <p className="flex items-center gap-1.5 text-sm font-bold text-teal-700">
                  <Sparkles className="size-4" aria-hidden /> After — jet washed
                </p>
                <p className="text-xs text-ink-500">
                  Full airflow · 30–40% better cooling
                </p>
              </div>
            </div>

            {/* BEFORE layer (clipped) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-stone-300 via-stone-200 to-amber-100/70">
                <CoilPattern />
                <div className="absolute bottom-5 left-5 rounded-xl bg-white/85 px-4 py-2.5 backdrop-blur">
                  <p className="flex items-center gap-1.5 text-sm font-bold text-orange-700">
                    <Wind className="size-4" aria-hidden /> Before — choked coil
                  </p>
                  <p className="text-xs text-ink-500">
                    Dust + mould · weak, smelly air
                  </p>
                </div>
              </div>
            </div>

            {/* Handle */}
            <div
              className="absolute inset-y-0 z-10 w-1 -translate-x-1/2 bg-white shadow-[0_0_20px_rgb(0_0_0/0.25)]"
              style={{ left: `${pos}%` }}
            >
              <span className="absolute top-1/2 left-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-white bg-brand-600 text-white shadow-lift">
                <MoveHorizontal className="size-5" aria-hidden />
              </span>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-ink-400">
            Illustrative panels — replace with real before/after service photos
            in this same slider.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}

/** Stylised evaporator-coil fin pattern. */
function CoilPattern({ clean = false }: { clean?: boolean }) {
  return (
    <div className="absolute inset-x-10 top-8 bottom-24 sm:inset-x-20" aria-hidden>
      <div
        className={`h-full w-full rounded-2xl border ${
          clean ? "border-sky-200 bg-white/60" : "border-stone-400/40 bg-stone-100/40"
        }`}
        style={{
          backgroundImage: clean
            ? "repeating-linear-gradient(90deg, rgb(125 211 252 / 0.5) 0 2px, transparent 2px 10px)"
            : "repeating-linear-gradient(90deg, rgb(120 113 108 / 0.55) 0 2px, transparent 2px 10px), radial-gradient(circle at 30% 40%, rgb(87 83 78 / 0.35) 0 12%, transparent 40%), radial-gradient(circle at 70% 65%, rgb(120 96 60 / 0.4) 0 15%, transparent 45%)",
        }}
      />
    </div>
  );
}
