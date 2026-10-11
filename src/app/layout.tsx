import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { profile } from "@/data/profile";
import { SITE, SITE_URL } from "@/data/site";
import { ThemeProvider } from "@/context/ThemeContext";

import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // Required so that relative URLs in openGraph/twitter resolve to absolute
  // ones. Supplied by NEXT_PUBLIC_SITE_URL, falling back to localhost.
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE.title,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: profile.name }],
  creator: profile.name,
  keywords: [
    "Ayush Ahire",
    "Full Stack Developer",
    "Next.js",
    "TypeScript",
    "React",
    "Tailwind CSS",
    "AI Integration",
    "Portfolio",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    locale: SITE.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#08080a" },
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * Applies the stored theme before first paint.
 *
 * The provider can't do this: it resolves the theme in an effect, which runs
 * after the browser has already painted the light palette — a visible flash on
 * every load for anyone who chose dark. This runs synchronously during parse,
 * so the correct palette is in place for the very first frame. Kept inline to
 * avoid a render-blocking request; `defaultOnBlocked` silences the
 * preload-scan warning Next raises for inline scripts.
 */
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}var d=t==="dark";document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",d?"#08080a":"#fafafa");}catch(e){}})()`;

/**
 * Root layout.
 *
 * All visible content renders on the server, so the page is crawlable and
 * meaningful before any JavaScript executes. `lang` is set for screen-reader
 * pronunciation and `data-scroll-behavior` restores smooth scrolling, which
 * Next.js 16 no longer applies by default.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The theme script rewrites `class` on this element after hydration, so
    // React's check of the server markup has to be skipped here.
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeScript }}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: must run
          // before paint; a static import would defeat its purpose.
          suppressHydrationWarning
        />
      </head>
      <body className="flex min-h-full flex-col">
        {/* Skip link: the first focusable element, so keyboard users can bypass
            the navbar straight to the content. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:rounded-lg focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-background"
        >
          Skip to content
        </a>

        {/*
          Wraps the navbar too: the theme toggle lives there, and the context
          would throw for any consumer rendered outside the provider.
        */}
        <ThemeProvider>
          <Navbar />

          <div id="main-content" className="flex-1">
            {children}
          </div>

          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}