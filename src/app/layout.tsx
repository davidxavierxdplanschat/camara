import type { Metadata } from "next";
import { branding } from "@/config/branding";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(branding.siteUrl),
  title: {
    default: `${branding.name} — Transparência parlamentar`,
    template: `%s | ${branding.name}`,
  },
  description: branding.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: branding.name,
    title: branding.name,
    description: branding.description,
    url: "/",
  },
  twitter: {
    card: "summary",
    title: branding.name,
    description: branding.description,
  },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        <SiteHeader />
        <main id="conteudo" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
