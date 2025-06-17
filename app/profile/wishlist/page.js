import WishlistPageComponent from "./wishlist-component";
import { getCountryFromHeaders } from "../../../services/serverApi";
import { headers } from 'next/headers';

// Server-side data fetching for wishlist page
async function getWishlistPageData() {
  try {
    // Get country from headers or default to UAE
    const headersList = headers();
    const detectedCountry = getCountryFromHeaders(headersList);
    
    return {
      detectedCountry,
    };
  } catch (error) {
    console.error('Error fetching wishlist page data:', error);
    return {
      detectedCountry: 'uae',
    };
  }
}

export default async function Page() {
  const pageData = await getWishlistPageData();
  
  return <WishlistPageComponent initialData={pageData} />;
}