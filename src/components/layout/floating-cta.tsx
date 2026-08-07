"use client";

import { CalendarCheck, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { site } from "@/lib/site";
import { waBooking } from "@/lib/whatsapp";

/** Persistent conversion layer: WhatsApp bubble + mobile action bar. */
export function FloatingCta() {
  return (
    <>
      {/* WhatsApp bubble — desktop & tablet */}
      <a
        href={waBooking()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="fixed right-5 bottom-24 z-40 hidden size-14 place-items-center rounded-full bg-[#0a6b5f] text-white shadow-[0_12px_36px_rgb(7_94_84/0.5)] transition-transform hover:scale-105 sm:bottom-8 sm:grid"
      >
        <MessageCircle className="size-6" aria-hidden />
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#0a6b5f] opacity-20" />
      </a>

      {/* Mobile sticky action bar */}
      <div className="glass fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/70 pb-[env(safe-area-inset-bottom)] sm:hidden">
        <div className="grid grid-cols-3 gap-2 px-3 py-2.5">
          <a
            href={site.phoneHref}
            className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-700 to-amber-700 text-sm font-bold text-white"
          >
            <Phone className="size-4" aria-hidden /> Call
          </a>
          <a
            href={waBooking()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#0a6b5f] text-sm font-bold text-white"
          >
            <MessageCircle className="size-4" aria-hidden /> WhatsApp
          </a>
          <Link
            href="/book"
            className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-sm font-bold text-white"
          >
            <CalendarCheck className="size-4" aria-hidden /> Book
          </Link>
        </div>
      </div>
    </>
  );
}
