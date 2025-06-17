import Shop from "./shop";
import { getCountryFromHeaders } from "../../services/serverApi";
import { headers } from 'next/headers';

// Server-side data fetching for shop page
async function getShopPageData() {
  try {
    // Get country from headers or default to UAE
    const headersList = headers();
    const detectedCountry = getCountryFromHeaders(headersList);
    
    // Define country-specific data (matching your existing logic)
    const countryData = {
      india: {
        title: "Shop Tornado Men's Watches in India – Elegant & Premium Timepieces",
        description:
          "Tornado brings you a curated selection of men's branded watches in India. From the iconic Lumina to the exclusive Limited Edition, find watches that define elegance and precision. Shop our collections like Celestia, Spectra, and more for timeless style.",
      },
      ksa: {
        title: "Shop Tornado Watches for Men in Saudi Arabia – Timeless Luxury Awaits",
        description:
          "Tornado offers luxury watches for Saudi Arabia's finest taste. From the sophisticated Xenith to the bold Steller X, our collections like Cosmic, Autonova, and more blend craftsmanship with modern design. Elevate your style with luxury timepieces.",
      },
      uae: {
        title: "Shop Men's Watches Online, Our Premium Watch Collection",
        description:
          "Discover a diverse collection of luxury timepieces at Tornado, from the sleek Xenith to the timeless Classic. Explore our stunning collections like Aurora, Cosmic, and Lumina, each blending tradition with innovation. Find your perfect luxury watch in Dubai today.",
      },
      qatar: {
        title: "Shop Men's Watches in Qatar – Tornado's Curated Collection Awaits Online",
        description:
          "Tornado offers premium watches in Qatar that merge classic elegance with modern flair. Browse the Aurora, Spectra, and Celestia collections, designed to offer precision and style. Find the perfect luxury watch to match your lifestyle.",
      },
      kuwait: {
        title: "Shop Men's Watches Online – Explore Tornado's Premium Watch Collection in Kuwait",
        description:
          "Tornado brings you luxury watches in Kuwait, combining traditional craftsmanship with contemporary designs. Explore collections such as Autonova, Steller X, and Classic, crafted for those who appreciate luxury and sophistication.",
      },
    };

    return {
      detectedCountry,
      countryTitle: countryData[detectedCountry]?.title || "Shop Tornado Men's Watches",
      countryDescription: countryData[detectedCountry]?.description || "Tornado brings you a curated selection of luxury men's watches worldwide...",
    };
  } catch (error) {
    console.error('Error fetching shop page data:', error);
    return {
      detectedCountry: 'uae',
      countryTitle: "Shop Tornado Men's Watches",
      countryDescription: "Tornado brings you a curated selection of luxury men's watches worldwide...",
    };
  }
}

export default async function Page() {
  const pageData = await getShopPageData();
  
  return <Shop initialData={pageData} />;
}
