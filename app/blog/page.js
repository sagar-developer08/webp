import Blog from "./blog";
import { getBlogData, getCountryFromHeaders } from "../../services/serverApi";
import { headers } from 'next/headers';

// Server-side data fetching
async function getBlogPageData() {
  try {
    // Get country from headers or default to UAE
    const headersList = headers();
    const detectedCountry = getCountryFromHeaders(headersList);
    
    // Fetch blog data
    const blogData = await getBlogData();

    return {
      blogData: blogData || { data: [] },
      detectedCountry,
    };
  } catch (error) {
    console.error('Error fetching blog page data:', error);
    return {
      blogData: { data: [] },
      detectedCountry: 'uae',
    };
  }
}

export default async function Page() {
  const pageData = await getBlogPageData();
  
  return <Blog initialData={pageData} />;
}
