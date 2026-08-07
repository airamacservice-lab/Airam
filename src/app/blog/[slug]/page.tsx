import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MessageCircle, Phone } from "lucide-react";
import { Faq } from "@/components/sections/faq";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPost, getPosts } from "@/lib/content";
import { blogPostingSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";
import { site } from "@/lib/site";
import { waEmergency } from "@/lib/whatsapp";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.meta.title,
    description: post.meta.description,
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const publishedDate = new Date(post.publishedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <JsonLd
        data={[
          blogPostingSchema(post),
          faqSchema(post.faqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />

      <article className="pt-28 pb-16 sm:pt-36 sm:pb-20">
        <div className="wrap max-w-3xl">
          <Reveal>
            <div className="flex items-center gap-3">
              <Badge tone="brand">{post.category}</Badge>
              <span className="flex items-center gap-1 text-xs text-ink-400">
                <CalendarDays className="size-3.5" aria-hidden />
                {publishedDate}
              </span>
              <span className="flex items-center gap-1 text-xs text-ink-400">
                <Clock className="size-3.5" aria-hidden />
                {post.readMinutes} min read
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="h-display mt-6 text-ink-900">{post.title}</h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="sub mt-6">{post.excerpt}</p>
          </Reveal>

          <div className="mt-12 space-y-10">
            {post.sections.map((s) => (
              <Reveal key={s.heading}>
                <h2 className="h-section text-2xl text-ink-900">{s.heading}</h2>
                <div className="mt-4 space-y-4">
                  {s.paragraphs.map((p, i) => (
                    <p key={i} className="leading-relaxed text-ink-700">
                      {p}
                    </p>
                  ))}
                </div>
                {s.bullets && (
                  <ul className="mt-4 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-ink-700">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-12 rounded-3xl bg-brand-950 p-7 text-white sm:p-8">
              <h2 className="text-lg font-bold">Key takeaways</h2>
              <ul className="mt-4 space-y-3">
                {post.takeaways.map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-slate-100">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sky-300" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal>
            <div className="card mt-10 flex flex-col items-start gap-4 p-7 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-ink-900">Still not cooling?</h2>
                <p className="mt-1 text-sm text-ink-500">
                  A technician can be at your door in 60–90 minutes.
                </p>
              </div>
              <div className="flex shrink-0 gap-3">
                <Button href={site.phoneHref} variant="emergency" size="md">
                  <Phone className="size-4" aria-hidden />
                  Call now
                </Button>
                <Button href={waEmergency()} external variant="whatsapp" size="md">
                  <MessageCircle className="size-4" aria-hidden />
                  WhatsApp
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </article>

      <Faq items={post.faqs} title="Related questions" />
    </>
  );
}
