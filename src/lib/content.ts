import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

/**
 * Server-only content layer. JSON files in src/content are validated at the
 * boundary with Zod, so a malformed file fails the build — never the visitor.
 */

const faqSchema = z.object({ question: z.string(), answer: z.string() });
const titledSchema = z.object({ title: z.string(), description: z.string() });

export const serviceSchema = z.object({
  slug: z.string(),
  name: z.string(),
  shortName: z.string(),
  icon: z.string(),
  category: z.enum(["repair", "installation", "maintenance", "commercial"]),
  tagline: z.string(),
  headline: z.string(),
  summary: z.string(),
  highlights: z.array(z.string()).min(2),
  symptoms: z.array(titledSchema).min(3),
  pricing: z
    .array(z.object({ label: z.string(), price: z.string(), note: z.string() }))
    .min(2),
  inclusions: z.array(z.string()).min(4),
  benefits: z.array(titledSchema).min(3),
  process: z.array(titledSchema).min(3),
  faqs: z.array(faqSchema).min(3),
  related: z.array(z.string()).min(1),
  meta: z.object({ title: z.string(), description: z.string() }),
});

export const locationSchema = z.object({
  slug: z.string(),
  name: z.string(),
  tagline: z.string(),
  headline: z.string(),
  intro: z.array(z.string()).min(1),
  neighbourhoods: z.array(z.string()).min(4),
  challenges: z.array(titledSchema).min(2),
  popularServices: z.array(z.string()).min(3),
  testimonials: z
    .array(
      z.object({
        name: z.string(),
        area: z.string(),
        quote: z.string(),
        rating: z.number(),
      }),
    )
    .min(1),
  faqs: z.array(faqSchema).min(2),
  meta: z.object({ title: z.string(), description: z.string() }),
});

export const postSchema = z.object({
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  category: z.string(),
  readMinutes: z.number(),
  publishedAt: z.string(),
  sections: z
    .array(
      z.object({
        heading: z.string(),
        paragraphs: z.array(z.string()).min(1),
        bullets: z.array(z.string()).optional(),
      }),
    )
    .min(3),
  takeaways: z.array(z.string()).min(2),
  faqs: z.array(faqSchema).min(2),
  meta: z.object({ title: z.string(), description: z.string() }),
});

export type Service = z.infer<typeof serviceSchema>;
export type Location = z.infer<typeof locationSchema>;
export type Post = z.infer<typeof postSchema>;

/** Display order for services (grid + footer). Unknown slugs sort last. */
export const SERVICE_ORDER = [
  "split-ac-service",
  "window-ac-service",
  "cassette-ac-service",
  "ac-cooling-issues",
  "ac-gas-filling",
  "ac-deep-cleaning",
  "ac-water-leakage",
  "ac-installation",
  "ac-uninstallation",
  "ac-pcb-repair",
  "ac-compressor-repair",
  "amc-plans",
  "vrv-service",
  "vrf-service",
  "commercial-ac-service",
  "commercial-amc-contracts",
] as const;

export const LOCATION_ORDER = [
  "velachery",
  "omr",
  "ecr",
  "adyar",
  "anna-nagar",
  "tambaram",
  "perungudi",
  "guindy",
  "chromepet",
  "porur",
  "medavakkam",
  "sholinganallur",
  "t-nagar",
  "nungambakkam",
  "mylapore",
] as const;

const CONTENT_ROOT = path.join(process.cwd(), "src", "content");

function loadDir<T>(dir: string, schema: z.ZodType<T>): T[] {
  const full = path.join(CONTENT_ROOT, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(full, f), "utf8");
      const parsed = schema.safeParse(JSON.parse(raw));
      if (!parsed.success) {
        throw new Error(
          `Invalid content file ${dir}/${f}: ${parsed.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; ")}`,
        );
      }
      return parsed.data;
    });
}

function bySlugOrder(order: readonly string[]) {
  return (a: { slug: string }, b: { slug: string }) => {
    const ia = order.indexOf(a.slug);
    const ib = order.indexOf(b.slug);
    return (ia === -1 ? order.length : ia) - (ib === -1 ? order.length : ib);
  };
}

let servicesCache: Service[] | null = null;
let locationsCache: Location[] | null = null;
let postsCache: Post[] | null = null;

export function getServices(): Service[] {
  servicesCache ??= loadDir("services", serviceSchema).sort(
    bySlugOrder(SERVICE_ORDER),
  );
  return servicesCache;
}

export function getService(slug: string): Service | undefined {
  return getServices().find((s) => s.slug === slug);
}

export function getLocations(): Location[] {
  locationsCache ??= loadDir("locations", locationSchema).sort(
    bySlugOrder(LOCATION_ORDER),
  );
  return locationsCache;
}

export function getLocation(slug: string): Location | undefined {
  return getLocations().find((l) => l.slug === slug);
}

export function getPosts(): Post[] {
  postsCache ??= loadDir("blog", postSchema).sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
  return postsCache;
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((p) => p.slug === slug);
}
