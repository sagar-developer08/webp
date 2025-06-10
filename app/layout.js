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
        
        {/* Apple Sign In SDK */}
        <script 
          type="text/javascript" 
          src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
          async
        ></script>
        <meta name="appleid-signin-client-id" content={process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || "your-apple-client-id"} />
        <meta name="appleid-signin-scope" content="name email" />
        <meta name="appleid-signin-redirect-uri" content={`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/auth/callback`} />
        <meta name="appleid-signin-state" content="apple-signin" />
        <meta name="appleid-signin-use-popup" content="true" />
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
