import Term from "./term";
import { getCountryFromHeaders } from "../../services/serverApi";
import { headers } from 'next/headers';

// Server-side data fetching for terms page
async function getTermsPageData() {
  try {
    // Get country from headers or default to UAE
    const headersList = headers();
    const detectedCountry = getCountryFromHeaders(headersList);
    
    return {
      detectedCountry,
    };
  } catch (error) {
    console.error('Error fetching terms page data:', error);
    return {
      detectedCountry: 'uae',
    };
  }
}

export default async function Page() {
    const pageData = await getTermsPageData();
    
    return <Term initialData={pageData} />;
}
