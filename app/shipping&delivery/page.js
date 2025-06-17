import Shippinganddelivery from "./shippinganddelivery";
import { getCountryFromHeaders } from "../../services/serverApi";
import { headers } from 'next/headers';

// Server-side data fetching for shipping and delivery page
async function getShippingPageData() {
  try {
    // Get country from headers or default to UAE
    const headersList = headers();
    const detectedCountry = getCountryFromHeaders(headersList);
    
    return {
      detectedCountry,
    };
  } catch (error) {
    console.error('Error fetching shipping page data:', error);
    return {
      detectedCountry: 'uae',
    };
  }
}

export default async function Page() {
    const pageData = await getShippingPageData();
    
    return <Shippinganddelivery initialData={pageData} />;
}
