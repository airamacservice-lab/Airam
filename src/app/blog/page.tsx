import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { getPosts } from "@/lib/content";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "AC Care & Repair Guides — Airam Blog",
  description:
    "Practical AC troubleshooting, cost guides and maintenance tips for Chennai homes and businesses, from the technicians who do the work.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  const posts = getPosts();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ])}
      />
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-20">
        <div className="hero-grid absolute inset-0" aria-hidden />
        <div className="wrap relative max-w-3xl">
          <p className="eyebrow">Airam blog</p>
          <h1 className="h-display mt-6 text-ink-900">
            AC care, <span className="text-gradient">explained honestly.</span>
          </h1>
          <p className="sub mt-6">
            Troubleshooting, real Chennai pricing, and the maintenance habits that
            actually extend an AC&rsquo;s life — written by the people who fix them.
          </p>
        </div>
      </section>

      <section className="pb-20 sm:pb-28">
        <div className="wrap">
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <StaggerItem key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="card card-hover group flex h-full flex-col p-6"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Badge tone="brand">{p.category}</Badge>
                    <span className="flex items-center gap-1 text-xs text-ink-400">
                      <Clock className="size-3.5" aria-hidden />
                      {p.readMinutes} min read
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-ink-900">{p.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-500">
                    {p.excerpt}
                  </p>
                  <span className="mt-4 flex items-center gap-1.5 text-sm font-bold text-brand-700">
                    Read guide
                    <ArrowUpRight
                      className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden
                    />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
