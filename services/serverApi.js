// Server-side API utility for SSR
const API_BASE_URL = 'https://0vm9jauvgc.execute-api.us-east-1.amazonaws.com/stag/api';

// Server-side fetch utility
export async function serverFetch(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

// Country-specific data fetchers
export async function getHomeData() {
  return await serverFetch('/home/');
}

export async function getAboutData() {
  return await serverFetch('/about/');
}

export async function getProductsData() {
  return await serverFetch('/products/new-arrivals');
}

export async function getFeaturedProducts() {
  return await serverFetch('/products/featured');
}

export async function getCollectionData(collectionId) {
  return await serverFetch(`/collections/${collectionId}`);
}

export async function getProductDetails(productId) {
  return await serverFetch(`/products/${productId}`);
}

export async function getBlogData() {
  return await serverFetch('/blogs/');
}

export async function getBlogDetails(blogId) {
  return await serverFetch(`/blogs/${blogId}`);
}

export async function getFaqData() {
  return await serverFetch('/faq-country');
}

// Utility to get country-specific data from response
export function getCountrySpecificData(data, country = 'uae') {
  if (!data || !data.data) return null;
  
  const countryKey = country.toLowerCase();
  
  // For array responses, get the first item and extract country data
  if (Array.isArray(data.data) && data.data.length > 0) {
    return data.data[0][countryKey] || null;
  }
  
  // For object responses, extract country data directly
  if (data.data[countryKey]) {
    return data.data[countryKey];
  }
  
  return data.data;
}

// Utility to detect country from request headers (optional)
export function getCountryFromHeaders(headers) {
  // You can implement country detection logic here
  // For example, from CF-IPCountry header or Accept-Language
  const cfCountry = headers.get('CF-IPCountry');
  const acceptLanguage = headers.get('Accept-Language');
  
  // Map country codes to your supported countries
  const countryMap = {
    'AE': 'uae',
    'SA': 'ksa',
    'IN': 'india',
    'QA': 'qatar',
    'KW': 'kuwait',
  };
  
  return countryMap[cfCountry] || 'uae'; // default to UAE
} 