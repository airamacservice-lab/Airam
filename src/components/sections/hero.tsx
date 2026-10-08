import { MessageCircle, Phone, ShieldCheck, Star, Timer } from "lucide-react";
import { AcUnit } from "@/components/motion/ac-unit";
import { BookingForm, type BookingOption } from "@/components/booking/booking-form";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { waEmergency } from "@/lib/whatsapp";

export function Hero({
  services,
  areas,
}: {
  services: BookingOption[];
  areas: BookingOption[];
}) {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
      {/* Ambient background */}
      <div className="hero-grid absolute inset-0" aria-hidden />
      <div
        className="orb animate-float top-[-120px] left-[-80px] size-[420px] bg-brand-200/50"
        aria-hidden
      />
      <div
        className="orb animate-float-slow top-[30%] right-[-140px] size-[480px] bg-sky-200/50"
        aria-hidden
      />
      <div
        className="orb bottom-[-160px] left-[35%] size-[380px] bg-teal-100/60"
        aria-hidden
      />
      <AcUnit className="pointer-events-none absolute top-24 right-[-30px] hidden w-[380px] select-none opacity-80 sm:top-28 sm:block lg:top-32 lg:w-[480px] xl:right-[4%]" />

      <div className="wrap relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <Reveal>
            <p className="eyebrow">
              <Timer className="size-3.5" aria-hidden />
              Same-day AC service across Chennai
            </p>
          </Reveal>

          <Reveal delay={0.08} blur>
            <h1 className="h-display mt-6 text-ink-900">
              Cool air, back in{" "}
              <span className="text-gradient">hours.</span>
              <br />
              Not days.
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="sub mt-6 max-w-xl">
              AC stopped cooling? Dripping on the wall? A background-verified
              Airam technician reaches you in 60–90 minutes, quotes before
              opening a screw, and backs every repair with up to a 90-day
              written warranty.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href={site.phoneHref} variant="emergency" size="lg">
                <Phone className="size-5" aria-hidden />
                {site.phone}
              </Button>
              <Button href={waEmergency()} external variant="whatsapp" size="lg">
                <MessageCircle className="size-5" aria-hidden />
                WhatsApp now
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.32}>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <span className="flex items-center gap-1.5 font-semibold text-ink-900">
                <Star className="size-4 fill-current text-amber-400" aria-hidden />
                Background-verified technicians
              </span>
              <span className="flex items-center gap-1.5 text-ink-500">
                <ShieldCheck className="size-4 text-teal-600" aria-hidden />
                GST-registered family business
              </span>
            </div>
          </Reveal>

        </div>

        {/* Booking card */}
        <Reveal delay={0.2} y={32} className="relative">
          <div
            className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-brand-500/15 via-sky-400/15 to-teal-400/15 blur-xl"
            aria-hidden
          />
          <div className="glass relative rounded-3xl p-6 shadow-lift sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-ink-900">
                  Book in 30 seconds
                </h2>
                <p className="mt-1 text-sm text-ink-500">
                  4 fields. We handle the rest on call.
                </p>
              </div>
              <span className="hidden rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 sm:block">
                No advance payment
              </span>
            </div>
            <BookingForm services={services} areas={areas} />
          </div>
        </Reveal>
      </div>

      <div className="wrap relative">
      <Reveal delay={0.4}>
        <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-slate-200/80 pt-8 sm:grid-cols-3 lg:grid-cols-6">
          {[
            {
              value: site.stats.yearsHandsOn,
              suffix: "+",
              label: "Years hands-on",
            },
            {
              value: site.stats.unitsServiced,
              suffix: "+",
              label: "Units serviced",
            },
            {
              value: site.stats.localities,
              suffix: "",
              label: "Chennai areas",
            },
            {
              value: site.stats.sameDayPct,
              suffix: "%",
              label: "Same-day visits",
            },
            {
              value: 7,
              suffix: " days",
              label: "Open every week",
            },
          ].map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-3xl font-bold text-ink-900">
                <CountUp value={s.value} suffix={s.suffix} />
              </dd>
              <dd className="mt-1 text-sm text-ink-500">{s.label}</dd>
            </div>
          ))}
          <div>
            <dt className="sr-only">Sulekha rating</dt>
            <dd className="flex items-center gap-1.5 text-3xl font-bold text-ink-900">
              4.6
              <Star className="size-6 fill-current text-amber-400" aria-hidden />
            </dd>
            <dd className="mt-1 text-sm text-ink-500">
              <a
                href="https://www.sulekha.com/profile/p-gangaram-a-c-service-centre-velachery-chennai"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-slate-300 underline-offset-2 hover:text-brand-700"
              >
                300+ reviews on Sulekha
              </a>
              <span className="mt-0.5 block text-xs text-ink-400">
                P Gangaram A C, Velachery, since 1997
              </span>
            </dd>
          </div>
        </dl>
      </Reveal>
      </div>
    </section>
  );
}
