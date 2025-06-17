import AboutUs from "./about-us";
import { getAboutData, getCountrySpecificData, getCountryFromHeaders } from "../../services/serverApi";
import { headers } from 'next/headers';

// Server-side data fetching
async function getAboutPageData() {
  try {
    // Get country from headers or default to UAE
    const headersList = headers();
    const detectedCountry = getCountryFromHeaders(headersList);
    
    // Fetch about data
    const aboutData = await getAboutData();
    
    // Extract country-specific data
    const countrySpecificData = aboutData ? getCountrySpecificData(aboutData, detectedCountry) : null;

    return {
      aboutData: aboutData || { data: [] },
      countryData: countrySpecificData,
      detectedCountry,
    };
  } catch (error) {
    console.error('Error fetching about page data:', error);
    return {
      aboutData: { data: [] },
      countryData: null,
      detectedCountry: 'uae',
    };
  }
}

export default async function Page() {
  const pageData = await getAboutPageData();
  
  return <AboutUs initialData={pageData} />;
}
