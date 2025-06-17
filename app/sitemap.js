export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://tornadowatches.com';
  
  // Static pages
  const staticPages = [
    '',
    '/about-us',
    '/shop',
    '/blog',
    '/contact',
    '/faqs',
    '/featured',
    '/login',
    '/register',
    '/cart',
    '/checkout',
    '/privacy-policy',
    '/term-of-use',
    '/shipping&delivery',
    '/profile',
    '/profile/addresses',
    '/profile/orders',
    '/profile/wishlist',
  ];

  const staticSitemapEntries = staticPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: page === '' ? 'daily' : 'weekly',
    priority: page === '' ? 1 : 0.8,
  }));

  // Dynamic pages - fetch collections and products
  let dynamicSitemapEntries = [];

  try {
    // Fetch collections
    const collectionsResponse = await fetch('https://0vm9jauvgc.execute-api.us-east-1.amazonaws.com/stag/api/categories/all');
    if (collectionsResponse.ok) {
      const collectionsData = await collectionsResponse.json();
      if (collectionsData.success && collectionsData.data) {
        const collectionEntries = collectionsData.data.map((collection) => ({
          url: `${baseUrl}/collection?id=${collection._id}`,
          lastModified: new Date(collection.updatedAt || collection.createdAt || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.7,
        }));
        dynamicSitemapEntries = [...dynamicSitemapEntries, ...collectionEntries];
      }
    }

    // Fetch products
    const productsResponse = await fetch('https://0vm9jauvgc.execute-api.us-east-1.amazonaws.com/stag/api/products/all?limit=1000');
    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      if (productsData.success && productsData.data) {
        const productEntries = productsData.data.map((product) => ({
          url: `${baseUrl}/products-details?productId=${product._id}`,
          lastModified: new Date(product.updatedAt || product.createdAt || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.6,
        }));
        dynamicSitemapEntries = [...dynamicSitemapEntries, ...productEntries];
      }
    }

    // Fetch movements/categories for movement pages
    const movementsResponse = await fetch('https://0vm9jauvgc.execute-api.us-east-1.amazonaws.com/stag/api/categories/all');
    if (movementsResponse.ok) {
      const movementsData = await movementsResponse.json();
      if (movementsData.success && movementsData.data) {
        const movementEntries = movementsData.data.map((movement) => ({
          url: `${baseUrl}/movement?id=${movement._id}`,
          lastModified: new Date(movement.updatedAt || movement.createdAt || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.7,
        }));
        dynamicSitemapEntries = [...dynamicSitemapEntries, ...movementEntries];
      }
    }

    // Fetch blog posts
    const blogsResponse = await fetch('https://0vm9jauvgc.execute-api.us-east-1.amazonaws.com/stag/api/blogs/all?limit=1000');
    if (blogsResponse.ok) {
      const blogsData = await blogsResponse.json();
      if (blogsData.success && blogsData.data) {
        const blogEntries = blogsData.data.map((blog) => ({
          url: `${baseUrl}/blog-details?id=${blog._id}`,
          lastModified: new Date(blog.updatedAt || blog.createdAt || Date.now()),
          changeFrequency: 'monthly',
          priority: 0.5,
        }));
        dynamicSitemapEntries = [...dynamicSitemapEntries, ...blogEntries];
      }
    }
  } catch (error) {
    console.error('Error generating dynamic sitemap entries:', error);
  }

  return [...staticSitemapEntries, ...dynamicSitemapEntries];
} 