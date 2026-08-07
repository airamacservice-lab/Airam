import { site } from "@/lib/site";

/** Prefilled WhatsApp deep link. */
export function waLink(message: string): string {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function waBooking(service?: string, area?: string): string {
  const svc = service ? ` for *${service}*` : "";
  const loc = area ? ` in ${area}` : "";
  return waLink(
    `Hi Airam AC Service, I'd like to book a service${svc}${loc}. Please share the next available slot.`,
  );
}

export function waEmergency(): string {
  return waLink(
    "URGENT: My AC needs immediate attention. Please arrange the earliest possible visit.",
  );
}

export function waCommercial(): string {
  return waLink(
    "Hi, I'm enquiring about commercial AC service / AMC for our premises. Please share details and arrange a site visit.",
  );
}

export function waAmc(plan?: string): string {
  const p = plan ? ` (*${plan}* plan)` : "";
  return waLink(
    `Hi, I'd like to know more about your Annual Maintenance Contract${p} for my AC units.`,
  );
}

export function waQuote(service: string): string {
  return waLink(
    `Hi, I'd like a quote for *${service}*. Sharing my details — please call me back.`,
  );
}
