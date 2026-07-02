import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nutrioneapp.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NutriOne — Plataforma para Nutricionistas e Pacientes",
    template: "%s | NutriOne",
  },
  description:
    "NutriOne é a plataforma completa para nutricionistas gerenciarem pacientes, planos alimentares, avaliações físicas e consultas. Simplifique seu atendimento nutricional.",
  keywords: [
    "software para nutricionistas",
    "plataforma nutricionista",
    "gestão de pacientes nutrição",
    "plano alimentar online",
    "avaliação física nutricional",
    "sistema para clínica de nutrição",
    "nutricionista software",
    "acompanhamento nutricional",
    "agenda nutricionista",
    "prontuário nutricional",
  ],
  authors: [{ name: "NutriOne" }],
  creator: "NutriOne",
  publisher: "NutriOne",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "NutriOne",
    title: "NutriOne — Plataforma para Nutricionistas e Pacientes",
    description:
      "Gerencie pacientes, planos alimentares, avaliações físicas e consultas em um só lugar. A plataforma completa para nutricionistas modernos.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NutriOne — Plataforma para Nutricionistas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NutriOne — Plataforma para Nutricionistas e Pacientes",
    description:
      "Gerencie pacientes, planos alimentares, avaliações físicas e consultas em um só lugar.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
