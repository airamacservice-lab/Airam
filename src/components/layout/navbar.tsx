"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, MessageCircle, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { waBooking } from "@/lib/whatsapp";

const links = [
  { href: "/services", label: "Services" },
  { href: "/locations", label: "Service Areas" },
  { href: "/services/amc-plans", label: "AMC" },
  { href: "/services/commercial-ac-service", label: "Commercial" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open
          ? "glass shadow-card"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="wrap flex h-16 items-center justify-between gap-4 lg:h-18">
        <Link
          href="/"
          className="flex items-center"
          onClick={() => setOpen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- plain img: fixed-size logo, no need for the optimizer pipeline */}
          <img
            src="/logo-mark.png"
            alt=""
            aria-hidden
            className="size-10 rounded-xl object-contain shadow-sm sm:size-11"
          />
          <span className="ml-2.5 flex flex-col leading-none">
            <span className="text-lg font-extrabold tracking-[0.12em] text-[#0b2f7a] sm:text-xl">
              AIRAM
            </span>
            <span className="mt-1 text-[10px] font-semibold tracking-[0.28em] text-[#1d6fe0] sm:text-[11px]">
              AC SERVICE
            </span>
            <span className="sr-only">{site.name}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href={site.phoneHref}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink-900 transition-colors hover:text-brand-700"
          >
            <span className="grid size-8 place-items-center rounded-full bg-brand-50 text-brand-600">
              <Phone className="size-4" aria-hidden />
            </span>
            <span className="hidden xl:inline">{site.phone}</span>
          </a>
          <Button
            href={waBooking()}
            external
            variant="whatsapp"
            size="sm"
            className="px-3"
          >
            <MessageCircle className="size-4" aria-hidden />
            <span className="hidden xl:inline">WhatsApp</span>
          </Button>
          <Button href="/book" size="sm">
            Book Service
          </Button>
        </div>

        <button
          className="grid size-10 cursor-pointer place-items-center rounded-xl border border-slate-200 text-ink-900 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-slate-100 md:hidden"
            aria-label="Mobile"
          >
            <div className="wrap flex flex-col gap-1 py-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-base font-medium text-ink-900 hover:bg-brand-50"
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button href={site.phoneHref} variant="secondary" size="md">
                  <Phone className="size-4" aria-hidden /> Call now
                </Button>
                <Button href="/book" size="md">
                  Book Service
                </Button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
