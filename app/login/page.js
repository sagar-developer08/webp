import Login from "./login";
import { getCountryFromHeaders } from "../../services/serverApi";
import { headers } from 'next/headers';

// Server-side data fetching for login page
async function getLoginPageData() {
  try {
    // Get country from headers or default to UAE
    const headersList = headers();
    const detectedCountry = getCountryFromHeaders(headersList);
    
    return {
      detectedCountry,
    };
  } catch (error) {
    console.error('Error fetching login page data:', error);
    return {
      detectedCountry: 'uae',
    };
  }
}

export default async function Page() {
  const pageData = await getLoginPageData();
  
  return <Login initialData={pageData} />;
}
