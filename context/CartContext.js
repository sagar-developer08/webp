"use client";
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../services/axios';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useCountry } from './CountryContext';

const CartContext = createContext();
const API_URL = 'https://0vm9jauvgc.execute-api.us-east-1.amazonaws.com/stag';

// Map countries to their respective currencies
const countryCurrencyMap = {
  'india': 'INR',
  'uae': 'AED',
  'usa': 'USD',
  'uk': 'GBP',
  'ksa': 'SAR',
  'kuwait': 'KWD',
  'qatar': 'QAR'
  // Add more countries as needed
};

// Reverse map to get country from currency
const currencyToCountryMap = Object.entries(countryCurrencyMap).reduce((acc, [country, currency]) => {
  acc[currency.toUpperCase()] = country;
  return acc;
}, {});

// Get default currency from localStorage if available
const getInitialCurrency = () => {
  if (typeof window !== 'undefined') {
    const storedCountry = localStorage.getItem('selectedCountry');
    
    return countryCurrencyMap[storedCountry] || 'AED';
  }
  return 'AED';
};

function CartProvider({ children }) {
  const router = useRouter();
  const [currency, setCurrency] = useState(getInitialCurrency());
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);
  
  // Use refs to prevent excessive API calls
  const isRefreshing = useRef(false);
  const lastStoredCountry = useRef(typeof window !== 'undefined' ? localStorage.getItem('selectedCountry') : 'india');

  // This ensures we always have the latest country from localStorage
  const getLatestSelectedCountry = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedCountry') || 'india';
    }
    return 'india';
  }, []);

  // Check and update currency on component mount only
  useEffect(() => {
    // Force currency sync on mount
    if (typeof window !== 'undefined') {
      const storedCountry = localStorage.getItem('selectedCountry');
      const newCurrency = countryCurrencyMap[storedCountry] || 'AED';
      
      setCurrency(newCurrency);
      lastStoredCountry.current = storedCountry;
    }
  }, []);

  // Listen for custom countryChange event
  useEffect(() => {
    const handleCountryChange = (e) => {
      const newCountry = e.detail?.country || getLatestSelectedCountry();
      const newCurrency = countryCurrencyMap[newCountry] || 'AED';
      
      // Only update if changed to prevent re-renders
      if (newCurrency !== currency) {
        
        setCurrency(newCurrency);
        lastStoredCountry.current = newCountry;
        
        // Refresh cart data after currency changes (only if we're logged in)
        if (isLoggedIn && !isRefreshing.current) {
          refreshCart();
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('countryChange', handleCountryChange);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('countryChange', handleCountryChange);
      }
    };
  }, [currency, getLatestSelectedCountry, isLoggedIn]);

  // Poll for country changes (fallback, less frequent)
  useEffect(() => {
    const checkCountry = () => {
      if (typeof window !== 'undefined') {
        const storedCountry = localStorage.getItem('selectedCountry');
        
        // Only proceed if the country has actually changed
        if (storedCountry && storedCountry !== lastStoredCountry.current) {
          const newCurrency = countryCurrencyMap[storedCountry] || 'AED';
          
          setCurrency(newCurrency);
          lastStoredCountry.current = storedCountry;
          
          // Refresh cart data after currency changes (only if we're logged in)
          if (isLoggedIn && !isRefreshing.current) {
            refreshCart();
          }
        }
      }
    };

    // Check less frequently (once per second) to reduce overhead
    const interval = setInterval(checkCountry, 1000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);
  
  // Force refresh the cart when forceRefresh changes
  useEffect(() => {
    if (forceRefresh > 0 && !isRefreshing.current) {
      checkAuthAndFetchCart();
    }
  }, [forceRefresh]);

  // Get current currency - only check if needed to reduce overhead
  const getCurrency = useCallback(() => {
    // Use the current state value as the source of truth
    return currency;
  }, [currency]);

  // Get country from selected country or currency
  const getCountryFromCurrency = (currencyCode) => {
    return currencyToCountryMap[currencyCode.toUpperCase()] || 'india'; // Default to UAE if not found
  };

  // Get the country name for API requests
  const getCountry = () => {
    if (typeof window !== 'undefined') {
      // First try to get directly from localStorage
      const storedCountry = localStorage.getItem('selectedCountry');
      if (storedCountry) {
        return storedCountry;
      }
      // If not found, try to determine from current currency
      return getCountryFromCurrency(getCurrency());
    }
    return 'uae'; // Default to UAE if window is not available
  };

  // Fetch and process cart data from server
  const fetchAndProcessCart = useCallback(async () => {
    if (isRefreshing.current) return; // Prevent concurrent refreshes
    
    isRefreshing.current = true;
    try {
      const response = await axiosInstance.get(`/cart`);

      if (response.data?.success) {
        const apiCart = response.data.data;
        const mappedItems = apiCart.items.map(item => ({
          _id: item._id, // Map the cart item ID
          productId: item.product._id,
          name: item.product.name.en,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          currency: item.currency, // Make sure currency is included
        }));

        setCart(mappedItems);
        setItemCount(mappedItems.reduce((sum, item) => sum + item.quantity, 0));
        setCartTotal(apiCart.totalPrice || 0);
      } else {
        setCart([]);
        setItemCount(0);
        setCartTotal(0);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setCart([]);
      setItemCount(0);
      setCartTotal(0);
    } finally {
      setLoading(false);
      isRefreshing.current = false;
    }
  }, []);

  // Check auth and fetch cart - exposed for manual refresh
  const checkAuthAndFetchCart = useCallback(async () => {
    if (isRefreshing.current) return; // Prevent concurrent refreshes
    
    isRefreshing.current = true;
    try {
      setLoading(true);
      const authResponse = await axiosInstance.get(`/users/profile`);
      if (authResponse.data?.success) {
        setIsLoggedIn(true);
        await fetchAndProcessCart();
      } else {
        setIsLoggedIn(false);
        setCart([]);
        setItemCount(0);
        setCartTotal(0);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setIsLoggedIn(false);
      setCart([]);
      setItemCount(0);
      setCartTotal(0);
    } finally {
      setLoading(false);
      isRefreshing.current = false;
    }
  }, [fetchAndProcessCart]);

  // Modified useEffect to use the new function
  useEffect(() => {
    // Only fetch cart if we're not on the order success page
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/order-success')) {
      checkAuthAndFetchCart();
    }
  }, [checkAuthAndFetchCart]);

  // Add to cart
  const addToCart = async (product) => {
    if (!isLoggedIn) {
      toast.error('Please login to add items to cart');
      // Save current page URL for redirect after login
      if (typeof window !== 'undefined') {
        // Save product details for adding to cart after login
        
        localStorage.setItem("pendingCartItem", JSON.stringify(product));
        // Make sure we're saving the full URL including any query parameters
        const currentUrl = window.location.pathname + window.location.search;
        
        localStorage.setItem("redirectAfterLogin", currentUrl);
      }
      router.push('/login');
      return;
    }

    try {
      const currentCurrency = getCurrency();
      const currentCountry = getCountry();
      
      
      setLoading(true);
      const response = await axiosInstance.post(`/cart`, {
        productId: product.productId,
        quantity: product.quantity || 1,
        currency: currentCountry,
        // country: currentCountry
      });

      if (response.data?.success) {
        await fetchAndProcessCart();
        toast.success(`Added ${product.name} to cart`);
      } else {
        toast.error(response.data?.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error(error.response?.data?.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  // Remove from cart
  const removeFromCart = async (itemId) => {
    if (!isLoggedIn) {
      toast.error('Please login to manage your cart');
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.delete(`/cart/${itemId}`);

      if (response.data?.success) {
        await fetchAndProcessCart();
        toast.success('Item removed from cart');
      } else {
        toast.error(response.data?.message || 'Failed to remove item');
        setLoading(false);
      }
    } catch (error) {
      console.error('Remove item error:', error);
      toast.error(error.response?.data?.message || 'Failed to remove item');
      setLoading(false);
    }
  };

  // Update quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (!isLoggedIn) {
      toast.error('Please login to manage your cart');
      router.push('/login');
      return;
    }

    if (newQuantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    try {
      const currentCurrency = getCurrency();
      const currentCountry = getCountry();
      
      
      setLoading(true);
      const response = await axiosInstance.put(`/cart/${itemId}`, 
        { 
          quantity: newQuantity,
          currency: currentCurrency,
          country: currentCountry
        } // Pass the updated quantity, currency and country
      );

      if (response.data?.success) {
        await fetchAndProcessCart(); // Refresh the cart after updating
        toast.success('Quantity updated');
      } else {
        toast.error(response.data?.message || 'Failed to update quantity');
        setLoading(false);
      }
    } catch (error) {
      console.error('Update quantity error:', error);
      toast.error(error.response?.data?.message || 'Failed to update quantity');
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!isLoggedIn) {
      toast.error('Please login to manage your cart');
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.delete(`/cart`);

      if (response.data?.success) {
        setCart([]);
        setItemCount(0);
        setCartTotal(0);
        toast.success('Cart cleared successfully');
      } else {
        toast.error(response.data?.message || 'Failed to clear cart');
      }
    } catch (error) {
      console.error('Clear cart error:', error);
      toast.error(error.response?.data?.message || 'Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  // Create order from cart
  const createOrder = async (shippingAddress, paymentMethod) => {
    if (!isLoggedIn) {
      toast.error('Please login to place an order');
      router.push('/login');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      const currentCurrency = getCurrency();
      const currentCountry = getCountry();
      
      
      setOrderProcessing(true);
      setLoading(true);
      
      // Calculate prices
      const taxRate = 0.1; // 10% tax
      const taxPrice = cartTotal * taxRate;
      const shippingPrice = cartTotal > 5000 ? 0 : 500; // Free shipping over 5000
      const totalPrice = cartTotal + taxPrice + shippingPrice;
      
      // Format order items according to required structure
      const orderItems = cart.map(item => ({
        product: item.productId,
        name: item.name,
        image: item.images && item.images.length > 0 ? item.images[0] : '/no-image.webp',
        price: item.price,
        quantity: item.quantity
      }));
      
      // Create order using the cart items
      const response = await axiosInstance.post(
        `/orders`, 
        {
          orderItems,
          shippingAddress,
          paymentMethod,
          taxPrice,
          shippingPrice,
          totalPrice,
          currency: currentCurrency,
          country: currentCountry
        }
      );

      if (response.data?.success) {
        // Clear the cart after successful order
        await clearCart();
        toast.success('Order placed successfully!');
        return response.data.data; // Return order data
      } else {
        toast.error(response.data?.message || 'Failed to place order');
        throw new Error(response.data?.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Create order error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
      throw error;
    } finally {
      setOrderProcessing(false);
      setLoading(false);
    }
  };

  // Get cart items filtered by current currency - use cached calculations
  const getCartItemsByCurrency = useCallback(() => {
    const currentCurrency = getCurrency().toUpperCase();
    
    // Convert currency to country format used in API response
    const currencyToCountry = {
      'INR': 'INDIA',
      'AED': 'UAE',
      'SR': 'KSA',
      'SAR': 'KSA',
      'KD': 'KUWAIT',
      'KWD': 'KUWAIT',
      'QAR': 'QATAR',
      'USD': 'USA',
      'GBP': 'UK'
    };
    
    const countryFilter = currencyToCountry[currentCurrency] || 'UAE';
    
    const filteredItems = cart.filter(item => item.currency === countryFilter);
    return filteredItems;
  }, [cart, getCurrency]);

  // Get total price for current currency - use cached calculation 
  const getCurrentCurrencyTotal = useCallback(() => {
    const filteredItems = getCartItemsByCurrency();
    return filteredItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [getCartItemsByCurrency]);

  // Trigger a manual refresh of the cart data
  const refreshCart = useCallback(() => {
    if (!isRefreshing.current) {
      setForceRefresh(prev => prev + 1);
    }
  }, []);

  return (
    <CartContext.Provider value={{ 
      cart, 
      cartTotal, 
      itemCount,
      loading,
      isLoggedIn,
      orderProcessing,
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      createOrder,
      checkAuthAndFetchCart,
      getCurrency,
      getCountry,
      getCartItemsByCurrency,
      getCurrentCurrencyTotal,
      refreshCart,
      currency
    }}>
      {children}
    </CartContext.Provider>
  );
}

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export { CartProvider, useCart };