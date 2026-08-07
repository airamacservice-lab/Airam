import { AlertTriangle, MessageCircle, Phone } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { waEmergency } from "@/lib/whatsapp";

export function EmergencyBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-orange-700 via-orange-700 to-amber-700 py-14">
      <div
        className="orb top-[-80px] right-[10%] size-72 bg-white/20"
        aria-hidden
      />
      <div className="wrap relative">
        <Reveal className="flex flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold tracking-wide text-white uppercase">
              <AlertTriangle className="size-3.5" aria-hidden />
              Emergency service
            </p>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              AC not cooling? Water on the wall?
            </h2>
            <p className="mt-3 text-lg text-orange-50">
              Don&rsquo;t sleep in the heat tonight. {site.emergencyNote} —
              a technician is one call away.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Button
              href={site.phoneHref}
              size="lg"
              className="border-0 bg-white !text-orange-700 shadow-lift hover:bg-orange-50"
              variant="secondary"
            >
              <Phone className="size-5" aria-hidden />
              {site.phone}
            </Button>
            <Button href={waEmergency()} external variant="whatsapp" size="lg">
              <MessageCircle className="size-5" aria-hidden />
              WhatsApp SOS
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
