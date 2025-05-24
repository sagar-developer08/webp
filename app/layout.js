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
