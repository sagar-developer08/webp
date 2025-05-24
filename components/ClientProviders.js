"use client";

import { CartProvider } from '../context/CartContext';
import { UserProvider } from '../context/UserContext';
import { AnimatePresence } from "framer-motion";

export default function ClientProviders({ children }) {
  return (
    <UserProvider>
      <CartProvider>
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </CartProvider>
    </UserProvider>
  );
}