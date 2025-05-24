import { ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import "./global.css";
import { CartProvider } from "../context/CartContext";
import { CountryProvider } from "../context/CountryContext";
import CustomCursor from "../components/CustomCursor";
import ClientProviders from "../components/ClientProviders";

export const metadata = {
  title: "Tornado",
  description: "Luxury watches for the discerning customer",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical Inter fonts */}
        <link
          rel="preload"
          href="/fonts/web/Inter-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/web/Inter-Medium.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/web/Inter-SemiBold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/web/Inter-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <ClientProviders>
          <CountryProvider>
            {children}
          </CountryProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
