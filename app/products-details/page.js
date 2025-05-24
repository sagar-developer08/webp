import { Suspense } from 'react';
import ProductsDetails from "./products-details";

export default function Page() {
  return (
    <Suspense fallback={<div className="w-full h-screen flex items-center justify-center bg-black text-white">Loading...</div>}>
      <ProductsDetails />
    </Suspense>
  );
}
