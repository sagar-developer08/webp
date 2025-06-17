import { Suspense } from 'react';
import Collection from './collection';
import { getCollectionData, getCountryFromHeaders } from "../../services/serverApi";
import { headers } from 'next/headers';

// Server-side data fetching
async function getCollectionPageData(searchParams) {
  try {
    // Get country from headers or default to UAE
    const headersList = headers();
    const detectedCountry = getCountryFromHeaders(headersList);
    
    // Get collection ID from search params
    const collectionId = searchParams.id;
    
    let collectionData = null;
    if (collectionId) {
      collectionData = await getCollectionData(collectionId);
    }

    return {
      collectionData: collectionData || { data: [] },
      collectionId,
      detectedCountry,
    };
  } catch (error) {
    console.error('Error fetching collection page data:', error);
    return {
      collectionData: { data: [] },
      collectionId: null,
      detectedCountry: 'uae',
    };
  }
}

export default async function Page({ searchParams }) {
  const pageData = await getCollectionPageData(searchParams);
  
  return (
    <Suspense fallback={<div className="w-full h-screen flex items-center justify-center bg-black text-white">Loading...</div>}>
      <Collection initialData={pageData} />
    </Suspense>
  );
}
