"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import PropTypes from "prop-types";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";
import AnimateOnScroll from "../components/AnimateOnScroll";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const R = ({ className = "", product, relatedProducts, selectedCountry }) => {
  const router = useRouter();
  const { addToCart, isLoggedIn } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);

  useEffect(() => {
    // Set the current product's color as selected
    if (product?.watchDetails?.dialColor?.en) {
      setSelectedColor(product.watchDetails.dialColor.en);
    }
  }, [product]);

  // console.log("Product details:", product?.imageLinks?.image1);

  const handleAddToCart = () => {
    if (product) {
      // Cart item to be added
      const cartItem = {
        productId: product._id || product.id,
        name: product.name?.en || product.name || "",
        price: product.price,
        images: product.imageLinks ? Object.values(product.imageLinks) : [product.imageLinks?.image1],
        image: product.imageLinks?.image1,
        quantity: quantity,
      };

      // addToCart function in CartContext will handle login check
      addToCart(cartItem);
      toast.success("Added to cart successfully!");
    }
  };

  const handleBuyNow = () => {
    if (product) {
      // Check if user is logged in
      if (!isLoggedIn) {
        // Save product to local storage for adding after login
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "pendingCartItem",
            JSON.stringify({
              productId: product._id || product.id,
              name: product?.name?.en || product.name,
              price: product.price,
              images: product.images || [product.image],
              quantity: quantity,
            })
          );
        }

        // Redirect to login page
        toast.error("Please login to proceed with checkout");
        router.push("/login");
        return;
      }

      // If logged in, add to cart and navigate to cart page
      addToCart({
        productId: product._id || product.id,
        name: product.name?.en || product.name || "",
        price: product.price,
        images: product.imageLinks ? Object.values(product.imageLinks) : [product.imageLinks?.image1],
        image: product.imageLinks?.image1,
        quantity: quantity,
      });
      router.push("/cart");
    }
  };

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleColorSelect = (relatedProduct) => {
    // Navigate to the related product's detail page
    router.push(`/products-details?productId=${relatedProduct._id}`);
  };

  // console.log("Related products:", relatedProducts);
  const getCurrencySymbol = (selectedCountry) => {
    if (!selectedCountry) return '$';
    const countryUpper = selectedCountry.toUpperCase();
    switch (countryUpper) {
      case 'INDIA': return '₹';
      case 'UAE': return 'AED';
      case 'KSA': return 'SR';
      case 'KUWAIT': return 'KD';
      case 'QATAR': return 'QAR';
      default: return '$';
    }
  };

  const getCountryPrice = (priceObj) => {
    if (!priceObj || typeof priceObj !== 'object') return '';
    if (!selectedCountry) return Object.values(priceObj)[0] || '';

    const countryKey = selectedCountry.toLowerCase();
    return priceObj[countryKey] || Object.values(priceObj)[0] || '';
  };

  const productPrice = getCountryPrice(product?.price);
  const currencySymbol = getCurrencySymbol(selectedCountry);
  const displayPrice = productPrice ? `${currencySymbol} ${productPrice}` : '';

  return (
    <div
      className={`self-stretch flex flex-col items-start justify-start gap-4 text-left text-base text-[#000] font-H5-24 ${className}`}
    >
      <div className="self-stretch border-[rgba(0,0,0,0.08)] border-solid border-b-[1px] flex flex-col items-start justify-start !pt-0 !pb-3.5 !pl-0 !pr-0 gap-4">
        <div className="self-stretch flex flex-col items-start justify-start gap-4">
          <div className="self-stretch flex flex-col items-start justify-start gap-4">
            {product?.collection?.name && (
              <div className="w-[596px] relative leading-[150%] font-medium flex items-center">
                {product?.collection?.name}
              </div>
            )}
            <h1 className="!m-0 self-stretch relative text-21xl leading-[120%] font-medium font-[inherit] mq450:text-5xl mq450:leading-[29px] mq1050:text-13xl mq1050:leading-[38px]">
              {product?.name?.en}
            </h1>
            <div className="self-stretch flex flex-row items-center justify-start gap-3 mq750:flex-wrap">
              <Image
                className="w-24 relative h-4"
                width={96}
                height={16}
                alt=""
                src="/review.svg"
              />
              <div className="flex-1 relative leading-[150%] font-medium inline-block min-w-[111px]">
                SKU:{product?.sku?.en}
              </div>
            </div>
          </div>
          <div className="w-[701px] h-px relative border-[rgba(0,0,0,0.08)] border-solid border-t-[1px] box-border" />
          <div className="self-stretch flex flex-row items-center justify-center gap-2.5 text-5xl mq750:flex-wrap">
            <div className="flex-1 relative leading-[140%] inline-block min-w-[224px] mq450:text-[19px] mq450:leading-[27px]">
              {displayPrice}
            </div>
            <div className="flex-1 relative text-base leading-[150%] font-medium text-right inline-block min-w-[224px]">
              In Stock
            </div>
          </div>
        </div>
        <div className="self-stretch relative text-sm leading-[150%] font-medium">
          {/* {product?.features} */}
        </div>
      </div>
      <div className="flex flex-row items-center justify-start gap-5 text-center">
        <div className="relative text-lg font-medium text-left">Color:</div>

        {Array.isArray(relatedProducts) && relatedProducts.length > 0 ? (
          <div className="w-full">
            {/* Desktop view - show as slider only when more than 4 items */}
            <div className="hidden md:block">
              {relatedProducts.length > 4 ? (
                <Swiper
                  modules={[Navigation]}
                  spaceBetween={16}
                  slidesPerView={4.5}
                  navigation
                  className="color-swiper"
                >
                  {relatedProducts.map((relatedProduct) => {
                    const colorName = relatedProduct?.watchDetails?.dialColor?.en || "Default";
                    const colorImage = relatedProduct?.imageLinks?.image1 || "/default-color.png";
                    const isSelected = colorName === selectedColor;

                    return (
                      <SwiperSlide key={relatedProduct._id} className="!w-auto">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex flex-col items-center gap-1.5 px-1"
                          onClick={() => handleColorSelect(relatedProduct)}
                        >
                          <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${isSelected ? 'border-black' : 'border-[rgba(0,0,0,0.16)]'
                            }`}>
                            <img
                              src={colorImage}
                              alt={colorName}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/default-color.png";
                              }}
                            />
                          </div>
                          <div className={`text-sm font-medium ${isSelected ? 'text-black font-semibold' : 'text-gray-600'
                            }`}>
                            {colorName}
                          </div>
                        </motion.div>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              ) : (
                <div className="flex flex-row items-center gap-4">
                  {relatedProducts.map((relatedProduct) => {
                    const colorName = relatedProduct?.watchDetails?.dialColor?.en || "Default";
                    const colorImage = relatedProduct?.imageLinks?.image1 || "/default-color.png";
                    const isSelected = colorName === selectedColor;

                    return (
                      <motion.div
                        key={relatedProduct._id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex flex-col items-center gap-1.5"
                        onClick={() => handleColorSelect(relatedProduct)}
                      >
                        <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${isSelected ? 'border-black' : 'border-[rgba(0,0,0,0.16)]'
                          }`}>
                          <img
                            src={colorImage}
                            alt={colorName}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/default-color.png";
                            }}
                          />
                        </div>
                        <div className={`text-sm font-medium ${isSelected ? 'text-black font-semibold' : 'text-gray-600'
                          }`}>
                          {colorName}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile view - always show as slider with 3.2 visible items */}
            <div className="md:hidden w-full">
              <Swiper
                modules={[Navigation]}
                spaceBetween={12}
                slidesPerView={3.2}
                className="color-swiper-mobile w-full"
                freeMode={true}
              >
                {relatedProducts.map((relatedProduct) => {
                  const colorName = relatedProduct?.watchDetails?.dialColor?.en || "Default";
                  const colorImage = relatedProduct?.imageLinks?.image1 || "/default-color.png";
                  const isSelected = colorName === selectedColor;

                  return (
                    <SwiperSlide key={relatedProduct._id} className="!w-auto">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex flex-col items-center gap-1.5 px-1 min-w-[80px]"
                        onClick={() => handleColorSelect(relatedProduct)}
                      >
                        <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${isSelected ? 'border-black' : 'border-[rgba(0,0,0,0.16)]'
                          }`}>
                          <img
                            src={colorImage}
                            alt={colorName}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/default-color.png";
                            }}
                          />
                        </div>
                        <div className={`text-sm font-medium text-center ${isSelected ? 'text-black font-semibold' : 'text-gray-600'
                          }`}>
                          {colorName}
                        </div>
                      </motion.div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-black">
              <img
                src={product?.watchDetails?.dialColorImage || "/default-color.png"}
                alt={product?.watchDetails?.dialColor?.en || "Default"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-color.png";
                }}
              />
            </div>
            <div className="text-sm font-semibold text-black">
              {product?.watchDetails?.dialColor?.en || "Default"}
            </div>
          </div>
        )}
      </div>
      <div className="self-stretch flex flex-col items-start justify-start gap-4 text-sm">
        <div className="self-stretch flex flex-row items-center justify-start gap-4 mq750:flex-wrap">
          <div className="h-12 rounded-[100px] border-[rgba(0,0,0,0.08)] border-solid border-[1px] box-border overflow-hidden flex flex-row items-center justify-center gap-3">
            <Image
              className="h-12 w-[42.9px] relative overflow-hidden shrink-0 object-contain cursor-pointer"
              loading="lazy"
              width={43}
              height={48}
              alt=""
              src="/icroundminus@2x.webp"
              onClick={decreaseQuantity} // Added click handler
            />
            <div className="relative leading-[150%] font-medium">{quantity}</div> {/* Added dynamic quantity */}
            <Image
              className="h-12 w-[42.9px] relative overflow-hidden shrink-0 object-contain cursor-pointer"
              loading="lazy"
              width={43}
              height={48}
              alt=""
              src="/icroundplus@2x.webp"
              onClick={increaseQuantity} // Added click handler
            />
          </div>
          <div className="flex-1 rounded-[50px] border-[#000] border-solid border-[1px] box-border overflow-hidden flex flex-row items-center justify-center !pt-2.5 !pb-2.5 !pl-10 !pr-10 min-w-[92px] text-center text-base cursor-pointer"
            onClick={handleAddToCart}
          >
            <div className="relative leading-[150%] font-medium">
              Add To Cart
            </div>
          </div>
        </div>
        <div className="self-stretch flex flex-row items-center justify-start gap-4 text-center text-base text-[#fff] mq750:flex-wrap ">
          <div className="flex-1 rounded-[50px] bg-[#000] overflow-hidden flex flex-row items-center justify-center !pt-3 !pb-3 !pl-10 !pr-10 box-border min-w-[83px] cursor-pointer"
            onClick={handleBuyNow}
          >
            <div className="relative leading-[150%] font-medium">
              Buy It Now
            </div>
          </div>
          <Image
            className="h-12 w-12 relative rounded-[100px] overflow-hidden shrink-0 cursor-pointer"
            width={48}
            height={48}
            alt=""
            src="/wish-1.svg"
          />
        </div>
      </div>
    </div>
  );
};

R.propTypes = {
  className: PropTypes.string,
  product: PropTypes.object,
  relatedProducts: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default R;
