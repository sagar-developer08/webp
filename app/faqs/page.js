import { Suspense } from 'react';
import Faqs from "./faqs";
import { getFaqData, getCountrySpecificData, getCountryFromHeaders } from "../../services/serverApi";
import { headers } from 'next/headers';

// Server-side data fetching
async function getFaqPageData() {
  try {
    // Get country from headers or default to UAE
    const headersList = headers();
    const detectedCountry = getCountryFromHeaders(headersList);
    
    // Fetch FAQ data
    const faqData = await getFaqData();
    
    // Extract country-specific FAQ data
    const countryKey = (detectedCountry || "india").toLowerCase();
    const countryFaqs = faqData && faqData.data && faqData.data.length > 0 && faqData.data[0][countryKey] 
      ? faqData.data[0][countryKey].faqs 
      : [];

    return {
      faqData: faqData || { data: [] },
      countryFaqs,
      detectedCountry,
    };
  } catch (error) {
    console.error('Error fetching FAQ page data:', error);
    return {
      faqData: { data: [] },
      countryFaqs: [],
      detectedCountry: 'uae',
    };
  }
}

export default async function Page() {
    const pageData = await getFaqPageData();
    
    return (
        <Suspense fallback={<div className="w-full h-screen flex items-center justify-center bg-black text-white">Loading...</div>}>
            <Faqs initialData={pageData} />
        </Suspense>
    );
}
