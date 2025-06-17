import { Suspense } from 'react';
import ProductsDetails from "./products-details";
import { getProductDetails, getCountrySpecificData, getCountryFromHeaders } from "../../services/serverApi";
import { headers } from 'next/headers';

// Server-side data fetching for product details
async function getProductDetailsPageData(searchParams) {
  try {
    // Get country from headers or default to UAE
    const headersList = headers();
    const detectedCountry = getCountryFromHeaders(headersList);
    
    // Get product ID from search params
    const productId = searchParams.id;
    
    let productData = null;
    let countrySpecificData = null;
    
    if (productId) {
      // Fetch product details
      productData = await getProductDetails(productId);
      
      // Extract country-specific data if available
      if (productData) {
        countrySpecificData = getCountrySpecificData(productData, detectedCountry);
      }
    }

    return {
      productData: productData || { data: null },
      countryData: countrySpecificData,
      productId,
      detectedCountry,
    };
  } catch (error) {
    console.error('Error fetching product details page data:', error);
    return {
      productData: { data: null },
      countryData: null,
      productId: null,
      detectedCountry: 'uae',
    };
  }
}

export default async function Page({ searchParams }) {
  const pageData = await getProductDetailsPageData(searchParams);
  
  return (
    <Suspense fallback={<div className="w-full h-screen flex items-center justify-center bg-black text-white">Loading...</div>}>
      <ProductsDetails initialData={pageData} />
    </Suspense>
  );
}
