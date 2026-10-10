import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { FloatingCta } from "@/components/layout/floating-cta";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { JsonLd } from "@/components/seo/json-ld";
import { LeadTracker } from "@/components/analytics/lead-tracker";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import { hvacBusinessSchema } from "@/lib/schema";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} | ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.tagline,
  openGraph: {
    title: site.name,
    description: site.tagline,
    url: site.url,
    siteName: site.name,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.tagline,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <JsonLd data={hvacBusinessSchema()} />
        <Navbar />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
        <FloatingCta />
        <LeadTracker />
        <Analytics />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-HN3YQ8GFPR" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-HN3YQ8GFPR');`}
        </Script>
      </body>
    </html>
  );
}
