import { Suspense } from 'react';
import Featured from "./featured";
import { getFeaturedProducts, getCountryFromHeaders } from "../../services/serverApi";
import { headers } from 'next/headers';

// Server-side data fetching
async function getFeaturedPageData() {
  try {
    // Get country from headers or default to UAE
    const headersList = headers();
    const detectedCountry = getCountryFromHeaders(headersList);
    
    // Fetch featured products data
    const featuredData = await getFeaturedProducts();

    return {
      featuredData: featuredData || { data: [] },
      detectedCountry,
    };
  } catch (error) {
    console.error('Error fetching featured page data:', error);
    return {
      featuredData: { data: [] },
      detectedCountry: 'uae',
    };
  }
}

export default async function Page() {
    const pageData = await getFeaturedPageData();
    
    return (
        <Suspense fallback={<div className="w-full h-screen flex items-center justify-center bg-black text-white">Loading...</div>}>
            <Featured initialData={pageData} />
        </Suspense>
    );
}
