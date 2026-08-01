import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  ),
  title: {
    default: "CapeForge — Tu ruta a la Completionist Cape",
    template: "%s · CapeForge",
  },
  description: "Organiza y completa los requisitos de tus capas de RuneScape 3 junto a tu comunidad.",
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "CapeForge",
    title: "CapeForge — Tu ruta hacia la Completionist Cape",
    description: "Organiza tus requisitos, marca cada victoria y conquista las capas más exigentes de RuneScape 3.",
    images: [{ url: "/og.png", width: 1743, height: 909, alt: "CapeForge, tu ruta hacia la Completionist Cape" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CapeForge — Tu ruta hacia la Completionist Cape",
    description: "Tu mapa personal para conquistar las capas de RuneScape 3.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
