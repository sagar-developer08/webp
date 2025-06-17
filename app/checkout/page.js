import Checkout from "./checkout";
import { getCountryFromHeaders } from "../../services/serverApi";
import { headers } from 'next/headers';

// Server-side data fetching for checkout page
async function getCheckoutPageData() {
  try {
    // Get country from headers or default to UAE
    const headersList = headers();
    const detectedCountry = getCountryFromHeaders(headersList);
    
    return {
      detectedCountry,
    };
  } catch (error) {
    console.error('Error fetching checkout page data:', error);
    return {
      detectedCountry: 'uae',
    };
  }
}

export default async function Page() {
    const pageData = await getCheckoutPageData();
    
    return <Checkout initialData={pageData} />;
}
