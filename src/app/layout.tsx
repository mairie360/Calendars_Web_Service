import type { Metadata } from "next";
import "./globals.css";
import "@mairie360/lib-components/dist/styles.css";
import "./app-overrides.css";

export const metadata: Metadata = {
  title: "Calendrier | Mairie360",
  description: "Module calendrier de Mairie360.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <meta name="apple-mobile-web-app-title" content="Mairie360" />
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
