import type { Location, Post, Service } from "@/lib/content";
import { site } from "@/lib/site";

/** JSON-LD builders. Rendered via the JsonLd component in server components. */

type Jsonable = Record<string, unknown>;

export function hvacBusinessSchema(): Jsonable {
  return {
    "@context": "https://schema.org",
    "@type": "HVACBusiness",
    "@id": `${site.url}/#business`,
    name: site.name,
    description: site.tagline,
    url: site.url,
    telephone: site.phone,
    email: site.email,
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.line,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.pincode,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: site.hoursSchema.opens,
      closes: site.hoursSchema.closes,
    },
    areaServed: { "@type": "City", name: "Chennai" },
  };
}

export function serviceSchema(service: Service): Jsonable {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.summary,
    serviceType: service.name,
    url: `${site.url}/services/${service.slug}`,
    provider: { "@id": `${site.url}/#business` },
    areaServed: { "@type": "City", name: "Chennai" },
  };
}

export function faqSchema(
  faqs: Array<{ question: string; answer: string }>,
): Jsonable {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function breadcrumbSchema(
  items: Array<{ name: string; path: string }>,
): Jsonable {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${site.url}${item.path}`,
    })),
  };
}

export function locationPageSchema(location: Location): Jsonable {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `AC Service in ${location.name}`,
    description: location.meta.description,
    url: `${site.url}/locations/${location.slug}`,
    provider: { "@id": `${site.url}/#business` },
    areaServed: { "@type": "Place", name: `${location.name}, Chennai` },
  };
}

export function blogPostingSchema(post: Post): Jsonable {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    url: `${site.url}/blog/${post.slug}`,
    author: { "@type": "Organization", name: site.name },
    publisher: { "@id": `${site.url}/#business` },
  };
}
