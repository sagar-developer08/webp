"use client";
import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import Image from "next/image";
import PropTypes from "prop-types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import { logoutUser } from "../services/userService";
import { searchProducts } from "../services/productService";
import { useCountry } from '../context/CountryContext';
import CollectionsDropdown from "./collectionDropDown";

const Navbar = ({
  className = "",
  navbarMargin,
  navbarPosition,
  navbarTop,
  navbarRight,
  navbarLeft,
  navbarBackgroundColor,
  logoSrc,
  search,
  account,
  sVG,
  onLogoClick,
  onMenuItemsContainerClick,
  onMenuItemsContainerClick1,
  onMenuItemsContainerClick3,
}) => {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const accountDropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);
  const searchButtonRef = useRef(null);
  const { itemCount, clearCart } = useCart();
  const { user, clearUser } = useUser();
  const { selectedCountry, updateCountry } = useCountry();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch('https://0vm9jauvgc.execute-api.us-east-1.amazonaws.com/stag/api/categories/all');
        if (!response.ok) {
          throw new Error('Failed to fetch collections');
        }
        const data = await response.json();
        setCollections(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const handleProductClick = (collectionId) => {
    router.push(`/collection?id=${collectionId}`);
  };

  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    

    // Update country in context
    updateCountry(newCountry);

    // Directly update localStorage to ensure all components get the change
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCountry', newCountry);

      // Dispatch custom event for additional notification
      const event = new CustomEvent('countryChange', { detail: { country: newCountry } });
      window.dispatchEvent(event);

      

      // Remove the forced page reload - it's causing excessive API calls
      // The custom event and context update should be enough
    }
  };

  useEffect(() => {
    setIsBrowser(true);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  const navbarStyle = useMemo(() => {
    return {
      margin: navbarMargin,
      position: navbarPosition || "fixed",
      top: navbarTop || "0",
      right: navbarRight || "0",
      left: navbarLeft || "0",
      backgroundColor: scrolled ? "rgba(0, 0, 0, 0.9)" : navbarBackgroundColor || "black/80",
      zIndex: 9990,
      position: navbarPosition || "fixed",
      transition: "background-color 0.3s ease, transform 0.3s ease",
      transform: scrolled ? "translateY(0)" : "translateY(0)",
      boxShadow: scrolled ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
    };
  }, [
    navbarMargin,
    navbarPosition,
    navbarTop,
    navbarRight,
    navbarLeft,
    navbarBackgroundColor,
    scrolled
  ]);

  const handleHomeClick = useCallback(() => {
    router.push("/");
  }, [router]);

  const handleAboutUsClick = useCallback(() => {
    router.push("/about-us");
  }, [router]);

  const handleShopClick = useCallback(() => {
    router.push("/shop");
  }, [router]);

  const handleBlogClick = useCallback(() => {
    router.push("/blog");
  }, [router]);

  const handleContactClick = useCallback(() => {
    router.push("/contact");
  }, [router]);

  const handleCartClick = useCallback(() => {
    router.push("/cart");
  }, [router]);

  const handlewishlistClick = useCallback(() => {
    const token = localStorage.getItem('token'); // Get token inside the callback
    if (token) {
      router.push("/profile/wishlist");
      return;
    } else {
      // Save current page URL for redirect after login
      localStorage.setItem("redirectAfterLogin", window.location.pathname + window.location.search);
      router.push("/login");
    }
  }, [router]); // Remove token from dependency array since we're getting it fresh each time

  const handleProfileClick = useCallback(() => {
    setShowAccountDropdown(false);
    router.push("/profile");
  }, [router]);

  const handleLogout = useCallback(async () => {
    try {
      await logoutUser();
      clearUser();
      setShowAccountDropdown(false);
      clearCart(); // Clear the cart state on logout
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [clearUser, clearCart, router]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle search dropdown
      const searchIconClicked = event.target.closest('[aria-label="Search products"]');
      if (!searchIconClicked) {
        if (searchResultsRef.current && !searchResultsRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
          setShowSearch(false);
          setSearchResults([]);
        }
      }

      // Handle account dropdown
      const accountIconClicked = event.target.closest('[aria-label="Account menu"]');
      const accountDropdown = accountDropdownRef.current;

      if (!accountIconClicked && accountDropdown && !accountDropdown.contains(event.target)) {
        setShowAccountDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 3) {
        setIsSearching(true);
        try {
          
          const results = await searchProducts(searchQuery);
          

          if (results && Array.isArray(results)) {
            setSearchResults(results);
          } else {
            console.warn('Received non-array results:', results);
            setSearchResults([]);
          }
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const logoVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.05, transition: { duration: 0.2 } }
  };

  const menuVariants = {
    initial: { opacity: 0, y: -10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
        duration: 0.3
      }
    }
  };

  const menuItemVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 }
  };

  const iconVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        delay: 0.5
      }
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full h-20 overflow-hidden shrink-0 flex flex-row items-center justify-center py-[15px] px-4 md:px-10 box-border z-[50] text-center text-base text-[#fff] font-h5-24 navbar ${className}`}
      style={navbarStyle}
    >
      <div className="w-full max-w-[1360px] mx-auto flex items-center justify-between">
        <motion.div
          variants={logoVariants}
          initial="initial"
          animate="animate"
          className="flex items-center"
        >
          <Image
            className="h-[40px] md:h-[50px] w-[90px] md:w-[110.3px] relative object-cover cursor-pointer"
            loading="lazy"
            width={110}
            height={50}
            alt="Tornado Logo"
            src={logoSrc}
            onClick={onLogoClick || handleHomeClick}
          />
        </motion.div>

        {/* Mobile view icons */}
        {windowWidth < 768 && (
          <div className="md:hidden flex items-center space-x-4 ml-auto">
            {/* Search icon */}
            <div className="flex items-center justify-center">
              <button
                ref={searchButtonRef}
                className="bg-transparent border-0 p-0 cursor-pointer flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  
                  setShowSearch(!showSearch);
                  if (!showSearch) {
                    setSearchQuery('');
                    setSearchResults([]);
                  }
                }}
                aria-label="Search products"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Image
                    className="h-11 w-11 relative cursor-pointer"
                    loading="lazy"
                    width={44}
                    height={44}
                    alt="Search"
                    src={search}
                  />
                </motion.div>
              </button>
            </div>

            {/* Cart icon */}
            <div className="flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCartClick}
                className="relative cursor-pointer flex items-center justify-center"
              >
                {itemCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center z-10">
                    <div className="text-white text-xs font-semibold">
                      {itemCount}
                    </div>
                  </div>
                )}
                <Image
                  className="h-6 w-6 relative cursor-pointer"
                  loading="lazy"
                  width={24}
                  height={24}
                  alt="Cart"
                  src={sVG}
                />
              </motion.div>
            </div>

            {/* Toggle button */}
            <div className="flex items-center justify-center">
              <button
                className="p-1 focus:outline-none bg-black rounded-md flex items-center justify-center"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                aria-label="Toggle mobile menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {showMobileMenu ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        )}

        <motion.div
          className={`flex-1 ${windowWidth < 768 ? 'hidden' : 'flex'} flex-row items-center justify-center text-sm mx-auto`}
          variants={menuVariants}
          initial="initial"
          animate="animate"
          style={{ marginLeft: '100px', marginRight: '0px', maxWidth: '800px' }}
        >
          <motion.div
            className="flex flex-row items-center justify-center py-1.5 px-3 cursor-pointer hover:text-gray-300 transition-colors"
            onClick={onMenuItemsContainerClick || handleAboutUsClick}
            variants={menuItemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative leading-[150%] font-medium">About Us</div>
          </motion.div>

          <motion.div
            className="flex flex-row items-center justify-center py-1.5 px-3 cursor-pointer hover:text-gray-300 transition-colors"
            onClick={onMenuItemsContainerClick3 || handleShopClick}
            variants={menuItemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative leading-[150%] font-medium">Shop</div>
          </motion.div>

          <motion.div
            className="flex flex-row items-center justify-center py-1.5 px-3 cursor-pointer hover:text-gray-300 transition-colors"
            onClick={handleBlogClick}
            variants={menuItemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative leading-[150%] font-medium">Blog</div>
          </motion.div>

          <motion.div
            className="flex flex-row items-center justify-center py-1.5 px-3 gap-1 relative"
            variants={menuItemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={(e) => {
              const dropdown = document.getElementById('collection-dropdown');
              if (dropdown) {
                const rect = e.currentTarget.getBoundingClientRect();
                dropdown.style.left = `${rect.left}px`;
                dropdown.style.display = 'block';
                setTimeout(() => {
                  dropdown.style.opacity = '1';
                  dropdown.style.visibility = 'visible';
                }, 10);
              }
            }}
            onMouseLeave={() => {
              setTimeout(() => {
                const dropdown = document.getElementById('collection-dropdown');
                if (dropdown) {
                  dropdown.style.opacity = '0';
                  dropdown.style.visibility = 'hidden';
                  setTimeout(() => {
                    if (dropdown.style.visibility === 'hidden') {
                      dropdown.style.display = 'none';
                    }
                  }, 300);
                }
              }, 100);
            }}
            ref={(el) => {
              if (el && isBrowser) {
                el.setAttribute('data-menu', 'collection');
                const dropdown = document.getElementById('collection-dropdown');
                if (dropdown) {
                  const rect = el.getBoundingClientRect();
                  dropdown.style.left = `${rect.left}px`;
                  dropdown.style.top = `${rect.bottom + window.scrollY}px`;
                }
              }
            }}
          >
            <div className="relative leading-[150%] font-medium cursor-pointer">
              Collection
            </div>
          </motion.div>


          <div
            id="collection-dropdown"
            className="w-40 transition-all duration-200"
            style={{
              display: 'none',
              opacity: 0,
              visibility: 'hidden',
              top: '60px' // Adjust based on your navbar height
            }}
            onMouseEnter={(e) => {
              const dropdown = e.currentTarget;
              dropdown.style.display = 'block';
              dropdown.style.opacity = '1';
              dropdown.style.visibility = 'visible';
            }}
            onMouseLeave={(e) => {
              const dropdown = e.currentTarget;
              dropdown.style.opacity = '0';
              dropdown.style.visibility = 'hidden';
              setTimeout(() => {
                if (dropdown.style.visibility === 'hidden') {
                  dropdown.style.display = 'none';
                }
              }, 300);
            }}
          >
            {collections.map((collection) => (
              <a
                key={collection.id || collection._id || collection.name}
                onClick={() => handleProductClick(collection.id || collection._id || collection.name)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-gray-800 transition-colors"
              >
                {collection.image && (
                  <Image
                    src={collection.image}
                    alt={collection.name}
                    width={24}
                    height={24}
                    className="rounded-full object-cover"
                  />
                )}
                <span>{collection.name}</span>
              </a>
            ))}
          </div>
          <motion.div
            className="flex flex-row items-center justify-center py-1.5 px-3 cursor-pointer hover:text-gray-300 transition-colors"
            onClick={handleContactClick}
            variants={menuItemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative leading-[150%] font-medium">Contact-Us</div>
          </motion.div>
        </motion.div>

        {windowWidth >= 768 && (
          <>
            <motion.div
              className="flex flex-row items-center justify-center py-1.5 px-3 gap-1"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative w-full">
                <select
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  className="appearance-none w-full text-white bg-transparent font-medium pr-6 leading-[150%] outline-none cursor-pointer"
                >
                  <option className="text-black text-center px-4 py-2" value="">Select Country</option>
                  <option className="text-black text-center px-4 py-2" value="india">INR</option>
                  <option className="text-black text-center px-4 py-2" value="uae">AED</option>
                  <option className="text-black text-center px-4 py-2" value="ksa">SAR</option>
                  <option className="text-black text-center px-4 py-2" value="kuwait">KWD</option>
                  <option className="text-black text-center px-4 py-2" value="qatar">QAR</option>
                </select>
                <svg
                  className="absolute top-1/2 right-0 transform -translate-y-1/2 pointer-events-none"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </motion.div>
            <motion.div
              className="flex flex-row items-center justify-center py-1.5 px-3 gap-1"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative leading-[150%] font-medium">EN</div>
              <Image
                className="h-[18px] w-[18px] relative overflow-hidden shrink-0 object-contain"
                loading="lazy"
                width={18}
                height={18}
                alt=""
                src="/iconamoonarrowup2light@2x.webp"
              />
            </motion.div>
          </>
        )}

        {showMobileMenu && windowWidth < 768 && isBrowser && createPortal(
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999]" onClick={() => setShowMobileMenu(false)}>
            <div
              className="fixed top-0 right-0 h-full w-[280px] bg-black border-l border-gray-800/50 overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-5 border-b border-gray-800/50">
                <h2 className="text-lg font-semibold text-white">Menu</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full transition-colors focus:outline-none"
                  aria-label="Close menu"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-4 border-b border-gray-800/50">
                <div className="flex items-center justify-between space-x-4">
                  <select
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    className="flex-1 text-white bg-black rounded-lg px-3 py-3 pr-8 outline-none cursor-pointer border border-white transition-colors appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')] bg-no-repeat bg-[right_0.75rem_center]"
                  >
                    <option className="text-white bg-black" value="">Country</option>
                    <option className="text-white bg-black" value="india">INR</option>
                    <option className="text-white bg-black" value="uae">AED</option>
                    <option className="text-white bg-black" value="ksa">SAR</option>
                    <option className="text-white bg-black" value="kuwait">KWD</option>
                    <option className="text-white bg-black" value="qatar">QAR</option>
                  </select>
                  <div className="flex items-center gap-2 text-white bg-black rounded-lg px-4 py-2 border border-solid-1px border-white transition-colors">
                    <span>EN</span>
                    <Image
                      className="h-4 w-4 opacity-75"
                      loading="lazy"
                      width={16}
                      height={16}
                      alt=""
                      src="/iconamoonarrowup2light@2x.webp"
                    />
                  </div>
                </div>
              </div>

              <div className="py-4">
                <Link
                  href="/about-us"
                  className="block py-4 px-6 text-white no-underline hover:bg-gray-800 transition-colors border-b border-gray-800"
                  onClick={() => setShowMobileMenu(false)}
                >
                  About Us
                </Link>
                <Link
                  href="/shop"
                  className="block py-4 px-6 text-white no-underline hover:bg-gray-800 transition-colors border-b border-gray-800"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Shop
                </Link>
                <Link
                  href="/blog"
                  className="block py-4 px-6 text-white no-underline hover:bg-gray-800 transition-colors border-b border-gray-800"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Blog
                </Link>

                <div className="border-b border-gray-800">
                  <div
                    className="flex justify-between items-center py-4 px-6 text-white hover:bg-gray-800 cursor-pointer"
                    onClick={(e) => {
                      const collectionsList = document.getElementById('mobile-collections-list');
                      if (collectionsList) {
                        collectionsList.classList.toggle('hidden');
                      }
                    }}
                  >
                    <span>Collection</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  <div id="mobile-collections-list" className="hidden">
                    {collections.map((collection) => (
                      <div
                        key={collection.id || collection._id || collection.name}
                        className="py-3 px-10 text-sm text-gray-300 hover:text-white hover:bg-gray-800 cursor-pointer"
                        onClick={() => {
                          handleProductClick(collection.id || collection._id || collection.name);
                          setShowMobileMenu(false);
                        }}
                      >
                        {collection.name}
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/contact"
                  className="block py-4 px-6 text-white no-underline hover:bg-gray-800 transition-colors border-b border-gray-800"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Contact-Us
                </Link>

                <div className="mt-6">
                  {user ? (
                    <>
                      <Link
                        href="/profile"
                        className="block py-4 px-6 text-white no-underline hover:bg-gray-800 transition-colors border-b border-gray-800"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowMobileMenu(false);
                        }}
                        className="w-full text-left py-4 px-6 text-red-400 hover:bg-gray-800 transition-colors border-b border-gray-800"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block py-4 px-6 text-white no-underline hover:bg-gray-800 transition-colors border-b border-gray-800"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        className="block py-4 px-6 text-white no-underline hover:bg-gray-800 transition-colors border-b border-gray-800"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        <motion.div
          className="flex flex-row items-center justify-center text-left text-[13px] gap-1"
          variants={iconVariants}
          initial="initial"
          animate="animate"
        >
          {/* Desktop icons only */}
          {windowWidth >= 768 && (
            <>
              <div className="relative z-[9999]">
                <button
                  ref={searchButtonRef}
                  className="bg-transparent border-0 p-0 cursor-pointer flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    
                    setShowSearch(!showSearch);
                    if (!showSearch) {
                      setSearchQuery('');
                      setSearchResults([]);
                    }
                  }}
                  aria-label="Search products"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Image
                      className="h-11 w-11 relative cursor-pointer"
                      loading="lazy"
                      width={44}
                      height={44}
                      alt="Search"
                      src={search}
                    />
                  </motion.div>
                </button>
              </div>
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center bg-transparent border-none cursor-pointer p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    
                    setShowAccountDropdown(!showAccountDropdown);
                  }}
                  aria-label="Account menu"
                >
                  <Image
                    className="h-11 w-11 relative"
                    loading="lazy"
                    width={44}
                    height={44}
                    alt="Account"
                    src={account}
                  />
                </motion.button>
              </div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={handlewishlistClick}
              >
                <Image
                  className="h-11 w-11 relative"
                  loading="lazy"
                  width={44}
                  height={44}
                  alt="Wishlist"
                  src="/wish.svg"
                />
              </motion.div>
              <motion.div
                className="w-11 flex flex-col items-center justify-center pt-0 pb-[5px] pl-[11px] pr-[6.1px] box-border relative cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCartClick}
              >
                {itemCount > 0 && (
                  <div className="absolute top-0 right-0 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center z-10">
                    <div className="text-white text-xs font-semibold">
                      {itemCount}
                    </div>
                  </div>
                )}
                <Image
                  className="w-[22px] h-[22px] relative z-[1]"
                  loading="lazy"
                  width={22}
                  height={22}
                  alt="Cart"
                  src={sVG}
                />
              </motion.div>
            </>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showAccountDropdown && (
          <motion.div
            ref={accountDropdownRef}
            className="fixed top-20 right-10 w-52 bg-gray-900 rounded-md shadow-2xl py-2 text-white border border-gray-700"
            style={{ zIndex: 9999 }}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {user ? (
              <>
                <div className="px-4 py-2 border-b border-gray-700 mb-1">
                  <p className="text-sm font-medium text-gray-300">Signed in as</p>
                  <p className="text-sm font-bold truncate">{user.name}</p>
                </div>
                <Link
                  href="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setShowAccountDropdown(false);
                    handleProfileClick();
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </Link>
                <Link
                  href="/profile/orders"
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setShowAccountDropdown(false);
                    router.push("/profile/orders");
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Order History
                </Link>
                <Link
                  href="/profile/wishlist"
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setShowAccountDropdown(false);
                    router.push("/profile/wishlist");
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Wishlist
                </Link>
                <div className="border-t border-gray-700 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-800 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                  onClick={() => setShowAccountDropdown(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                  onClick={() => setShowAccountDropdown(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Register
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile search dropdown */}
      {isBrowser && showSearch && createPortal(
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[9999]"
          onClick={() => setShowSearch(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-20 right-4 w-[90%] max-w-xs mx-auto bg-black border border-gray-700 rounded-md shadow-lg"
            onClick={(e) => e.stopPropagation()}
            ref={searchResultsRef}
          >
            <div className="p-2">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
                autoFocus
              />
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-gray-400">
                  <svg className="animate-spin h-5 w-5 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                <div>
                  {searchResults.map((product, index) => {
                    const productId = product.id || product._id || `product-${index}`;
                    const productName = product.name?.en || (typeof product.name === 'string' ? product.name : '') || product.title?.en || (typeof product.title === 'string' ? product.title : '') || 'Product';
                    // const productPrice = product.price || product.cost || '';
                    const imageUrl = product.imageLinks?.image1 || product.image || product.imageUrl || product.img || product.thumbnail;

                    return (
                      <div
                        key={productId}
                        className="p-2 hover:bg-gray-800 cursor-pointer flex items-center border-t border-gray-700 first:border-t-0"
                        onClick={() => {
                          setShowSearch(false);
                          setSearchQuery('');
                          router.push(`/products-details?productId=${productId}`);
                        }}
                      >
                        {imageUrl && (
                          <div className="w-12 h-12 mr-3 flex-shrink-0 overflow-hidden rounded">
                            <Image
                              src={imageUrl}
                              alt={productName}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{productName}</p>
                          {/* <p className="text-xs text-gray-400 truncate">{productPrice}</p> */}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : searchQuery.trim().length >= 3 ? (
                <div className="p-4 text-center text-gray-400">
                  No products found
                </div>
              ) : searchQuery.trim().length > 0 ? (
                <div className="p-4 text-center text-gray-400">
                  Type at least 3 characters to search
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </motion.section>
  );
};

Navbar.propTypes = {
  className: PropTypes.string,
  logoSrc: PropTypes.string.isRequired,
  search: PropTypes.string.isRequired,
  account: PropTypes.string.isRequired,
  sVG: PropTypes.string.isRequired,

  /** Style props */
  navbarMargin: PropTypes.string,
  navbarPosition: PropTypes.string,
  navbarTop: PropTypes.string,
  navbarRight: PropTypes.string,
  navbarLeft: PropTypes.string,
  navbarBackgroundColor: PropTypes.string,

  /** Action props */
  onBd8bf9c117ab50f7f8421ImageClick: PropTypes.func,
  onMenuItemsContainerClick: PropTypes.func,
  onMenuItemsContainerClick1: PropTypes.func,
  onMenuItemsContainerClick3: PropTypes.func,
};

export default Navbar;
