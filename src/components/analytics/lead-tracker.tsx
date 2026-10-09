"use client";

import { useEffect } from "react";
import { rememberSource, trackLead } from "@/lib/track";

/** Quietly counts every Call, WhatsApp and Book tap across the site. */
export function LeadTracker() {
  useEffect(() => {
    rememberSource();
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (href.startsWith("tel:")) trackLead("Call tap");
      else if (href.includes("wa.me") || href.includes("whatsapp")) trackLead("WhatsApp tap");
      else if (href === "/book" || href.startsWith("/book?") || href.startsWith("/book#")) trackLead("Book button tap");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
