import AddressesPageComponent from "./addresses-component";
import { getCountryFromHeaders } from "../../../services/serverApi";
import { headers } from 'next/headers';

// Server-side data fetching for addresses page
async function getAddressesPageData() {
  try {
    // Get country from headers or default to UAE
    const headersList = headers();
    const detectedCountry = getCountryFromHeaders(headersList);
    
    return {
      detectedCountry,
    };
  } catch (error) {
    console.error('Error fetching addresses page data:', error);
    return {
      detectedCountry: 'uae',
    };
  }
}

export default async function Page() {
  const pageData = await getAddressesPageData();
  
  return <AddressesPageComponent initialData={pageData} />;
}
