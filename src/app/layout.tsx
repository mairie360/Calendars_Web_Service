import type { Metadata } from "next";
import { readFrontUrlsFromEnv } from "@/lib/front-urls";
import { FrontUrlsProvider } from "@/lib/front-urls-provider";
import "./globals.css";
import "@mairie360/lib-components/dist/styles.css";
import "./app-overrides.css";

// Rendu à la demande obligatoire : une page prérendue au build ne porterait pas le
// nonce CSP propre à chaque requête, et ses scripts seraient bloqués.
export const dynamic = "force-dynamic";

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
        <main><FrontUrlsProvider urls={readFrontUrlsFromEnv()}>{children}</FrontUrlsProvider></main>
      </body>
    </html>
  );
}
