"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { testimonials } from "@/data/testimonials";
import { cn } from "@/lib/utils";

export function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 4500, stopOnInteraction: true })],
  );
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs local dot-indicator state with Embla's initial scroll snap; Embla's own API only exists post-mount
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <Section tone="gray" id="reviews">
      <div className="wrap">
        <SectionHeading
          eyebrow="Reviews"
          title="What Chennai says after the visit"
          sub="Unfiltered words from homes and businesses we serve — the details they mention are the details we obsess over."
        />

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="-ml-5 flex">
            {testimonials.map((t) => (
              <div
                key={t.name + t.area}
                className="min-w-0 shrink-0 grow-0 basis-full pl-5 sm:basis-1/2 lg:basis-1/3"
              >
                <figure className="card flex h-full flex-col p-7">
                  <Quote className="size-7 text-brand-200" aria-hidden />
                  <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-700">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-ink-900">
                          {t.name}
                        </p>
                        <p className="text-xs text-ink-400">{t.area}</p>
                      </div>
                      <span
                        className="flex text-amber-400"
                        aria-label={`${t.rating} star rating`}
                      >
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="size-3.5 fill-current" aria-hidden />
                        ))}
                      </span>
                    </div>
                    <Badge tone="slate" className="mt-3">
                      {t.service}
                    </Badge>
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous review"
            className="grid size-10 cursor-pointer place-items-center rounded-full border border-slate-200 bg-white text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                aria-label={`Go to review ${i + 1}`}
                className={cn(
                  "h-2 cursor-pointer rounded-full transition-all",
                  selected === i ? "w-6 bg-brand-600" : "w-2 bg-slate-300",
                )}
              />
            ))}
          </div>
          <button
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next review"
            className="grid size-10 cursor-pointer place-items-center rounded-full border border-slate-200 bg-white text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      </div>
    </Section>
  );
}
