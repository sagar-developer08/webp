import OrdersPageComponent from "./orders-component";
import { getCountryFromHeaders } from "../../../services/serverApi";
import { headers } from 'next/headers';

// Server-side data fetching for orders page
async function getOrdersPageData() {
  try {
    // Get country from headers or default to UAE
    const headersList = headers();
    const detectedCountry = getCountryFromHeaders(headersList);
    
    return {
      detectedCountry,
    };
  } catch (error) {
    console.error('Error fetching orders page data:', error);
    return {
      detectedCountry: 'uae',
    };
  }
}

export default async function Page() {
  const pageData = await getOrdersPageData();
  
  return <OrdersPageComponent initialData={pageData} />;
}
