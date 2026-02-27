import { supabase } from './supabase';

/**
 * Imports products from WooCommerce to Supabase
 * @param {string} siteUrl - The URL to your WordPress/WooCommerce site
 * @param {string} consumerKey - WooCommerce API Consumer Key
 * @param {string} consumerSecret - WooCommerce API Consumer Secret
 */
export const importWooCommerceProducts = async (siteUrl, consumerKey, consumerSecret) => {
  try {
    console.log('Starting WooCommerce to Supabase migration...');
    
    // Fetch all products from WooCommerce
    const products = await fetchAllWooCommerceProducts(siteUrl, consumerKey, consumerSecret);
    console.log(`Found ${products.length} products to migrate`);
    
    // Transform and insert each product into Supabase
    const results = [];
    for (const wcProduct of products) {
      try {
        const transformedProduct = transformWooCommerceToSupabase(wcProduct);
        
        // Insert or update the product in Supabase
        const { data, error } = await supabase
          .from('services')
          .upsert(transformedProduct, { onConflict: ['name', 'location'] }); // Avoid duplicates
        
        if (error) {
          console.error(`Error importing product "${wcProduct.name}":`, error);
          results.push({ success: false, product: wcProduct.name, error: error.message });
        } else {
          console.log(`Successfully imported product: "${wcProduct.name}"`);
          results.push({ success: true, product: wcProduct.name, id: data?.[0]?.id });
        }
      } catch (transformError) {
        console.error(`Error transforming product "${wcProduct.name}":`, transformError);
        results.push({ success: false, product: wcProduct.name, error: transformError.message });
      }
    }
    
    console.log(`Migration completed. ${results.filter(r => r.success).length} successful, ${results.filter(r => !r.success).length} failed.`);
    return results;
  } catch (error) {
    console.error('Error during WooCommerce migration:', error);
    throw error;
  }
};

/**
 * Fetches all products from WooCommerce API
 */
const fetchAllWooCommerceProducts = async (siteUrl, consumerKey, consumerSecret) => {
  let allProducts = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${siteUrl}/wp-json/wc/v3/products?consumer_key=${consumerKey}&consumer_secret=${consumerSecret}&page=${page}&per_page=100`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch products from WooCommerce: ${response.status} ${response.statusText}`);
    }
    
    const products = await response.json();
    allProducts = [...allProducts, ...products];
    
    // Check if there are more pages
    hasMore = products.length === 100; // WooCommerce returns max 100 per page
    page++;
    
    // Small delay to be respectful to the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return allProducts;
};

/**
 * Transforms a WooCommerce product to the format expected by Supabase
 */
const transformWooCommerceToSupabase = (wcProduct) => {
  // Extract price information
  const basePrice = parseFloat(wcProduct.regular_price) || parseFloat(wcProduct.price) || 0;
  
  // Extract images
  const images = wcProduct.images?.map(img => img.src) || [];
  
  // Extract description or short description
  const description = wcProduct.description || wcProduct.short_description || '';
  
  // Determine category based on WooCommerce product types/categories
  let category = 'products'; // default
  if (wcProduct.categories && wcProduct.categories.length > 0) {
    // Map common WooCommerce categories to your app's categories
    const wcCategorySlugs = wcProduct.categories.map(cat => cat.slug);
    
    if (wcCategorySlugs.some(slug => 
      ['hotel', 'accommodation', 'rooms', 'stays'].includes(slug.toLowerCase())
    )) {
      category = 'hotels';
    } else if (wcCategorySlugs.some(slug => 
      ['activity', 'excursion', 'tour'].includes(slug.toLowerCase())
    )) {
      category = 'activities';
    } else if (wcCategorySlugs.some(slug => 
      ['cruise', 'boat'].includes(slug.toLowerCase())
    )) {
      category = 'cruises';
    } else if (wcCategorySlugs.some(slug => 
      ['package', 'deal'].includes(slug.toLowerCase())
    )) {
      category = 'packages';
    } else if (wcCategorySlugs.some(slug => 
      ['transfer', 'transport'].includes(slug.toLowerCase())
    )) {
      category = 'transfers';
    } else if (wcCategorySlugs.some(slug => 
      ['guest-house', 'lodging'].includes(slug.toLowerCase())
    )) {
      category = 'Guest Houses';
    }
  }
  
  // Map WooCommerce product to your services schema
  return {
    id: wcProduct.id,
    name: wcProduct.name,
    description: description,
    category: category,
    location: wcProduct.meta_data?.find(meta => meta.key === '_location')?.value || '',
    pricing: {
      basePrice: basePrice,
      currency: 'MUR', // Assuming Mauritian Rupees based on your UI
      salePrice: wcProduct.sale_price ? parseFloat(wcProduct.sale_price) : null,
      taxStatus: wcProduct.tax_status,
    },
    images: images,
    // Features from attributes or short description
    features: extractFeatures(wcProduct),
    // Inclusions and exclusions could come from product description or custom fields
    inclusions: [],
    exclusions: [],
    highlights: [],
    // Map WooCommerce status to your active status
    is_active: wcProduct.status === 'publish',
    // Additional WooCommerce-specific fields
    wc_product_id: wcProduct.id,
    permalink: wcProduct.permalink,
    sku: wcProduct.sku,
    stock_quantity: wcProduct.stock_quantity,
    // Created and updated dates
    created_at: wcProduct.date_created,
    updated_at: wcProduct.date_modified,
  };
};

/**
 * Extracts features from WooCommerce product attributes
 */
const extractFeatures = (wcProduct) => {
  const features = [];
  
  // Add dimensions if available
  if (wcProduct.dimensions?.length && wcProduct.dimensions.width && wcProduct.dimensions.height) {
    features.push(`${wcProduct.dimensions.length}×${wcProduct.dimensions.width}×${wcProduct.dimensions.height} cm`);
  }
  
  // Add weight if available
  if (wcProduct.weight) {
    features.push(`Weight: ${wcProduct.weight} kg`);
  }
  
  // Add attributes as features
  if (wcProduct.attributes && wcProduct.attributes.length > 0) {
    wcProduct.attributes.forEach(attr => {
      if (attr.options && Array.isArray(attr.options)) {
        attr.options.forEach(option => {
          features.push(option);
        });
      }
    });
  }
  
  return features;
};

/**
 * Get WooCommerce API credentials from environment variables
 */
export const getWooCommerceCredentials = () => {
  return {
    siteUrl: import.meta.env.VITE_WOOCOMMERCE_SITE_URL,
    consumerKey: import.meta.env.VITE_WOOCOMMERCE_CONSUMER_KEY,
    consumerSecret: import.meta.env.VITE_WOOCOMMERCE_CONSUMER_SECRET,
  };
};