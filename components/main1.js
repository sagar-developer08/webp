import Image from "next/image";
import PropTypes from "prop-types";
import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { useCountry } from "../context/CountryContext";
import { useRouter } from "next/navigation";

const Main1 = ({
  className = "",
  cart,
  removeFromCart,
  updateQuantity,
  cartTotal,
  clearCart,
  handleApplyCoupon,
  couponCode,
  setCouponCode,
  discount,
  totals,
  handlePlaceOrder,
  isSubmitting,
  setDiscount,
  setCouponDetails,
  paymentMethod,
  setPaymentMethod,
  handleContinueShopping
}) => {
  const [isCouponInputVisible, setIsCouponInputVisible] = useState(false);
  const { getCartItemsByCurrency, getCurrentCurrencyTotal, getCurrency, currency } = useCart();
  const { selectedCountry } = useCountry();
  const [filteredCart, setFilteredCart] = useState([]);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const router = useRouter();

  // Use memoized function to prevent excessive calculations
  const updateFilteredCart = useCallback(() => {
    const items = getCartItemsByCurrency();
    setFilteredCart(items);

    // Calculate total from filtered items
    const calculatedTotal = items.reduce((sum, item) => {
      let priceValue = item.price;
      let priceNum = 0;

      // Handle price whether it's string ("AED 590") or number
      if (typeof priceValue === "string") {
        const match = priceValue.match(/([\d,.]+)/);
        priceNum = match ? parseFloat(match[1].replace(/,/g, "")) : 0;
      } else if (typeof priceValue === "number") {
        priceNum = priceValue;
      }

      return sum + (priceNum * item.quantity);
    }, 0);

    setFilteredTotal(calculatedTotal);
  }, [getCartItemsByCurrency]);

  // Only update filtered cart when cart or currency changes
  useEffect(() => {
    updateFilteredCart();
  }, [cart, currency, updateFilteredCart]);

  // Listen for currency changes via the custom event
  useEffect(() => {
    const handleCountryChange = () => {
      updateFilteredCart();
    };

    window.addEventListener('countryChange', handleCountryChange);
    return () => {
      window.removeEventListener('countryChange', handleCountryChange);
    };
  }, [updateFilteredCart]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      toast.error("Quantity cannot be less than 1");
      return;
    }
    await updateQuantity(itemId, newQuantity);
  };

  const toggleCouponInput = () => {
    setIsCouponInputVisible(!isCouponInputVisible);
  };

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    handleApplyCoupon();
  };

  // Calculate totals based on filtered items - memoize for performance
  const filteredTotals = useMemo(() => {
    // Calculate subtotal from filtered cart items
    const subtotal = filteredCart.reduce((sum, item) => {
      let priceValue = item.price;
      let priceNum = 0;

      if (typeof priceValue === "string") {
        const match = priceValue.match(/([\d,.]+)/);
        priceNum = match ? parseFloat(match[1].replace(/,/g, "")) : 0;
      } else if (typeof priceValue === "number") {
        priceNum = priceValue;
      }

      return sum + (priceNum * item.quantity);
    }, 0);

    const discountedSubtotal = Math.max(0, subtotal - (Number(discount) || 0));
    const tax = +(discountedSubtotal * 0.1).toFixed(2);
    const shipping = discountedSubtotal > 5000 ? 0 : 500;
    const total = +(discountedSubtotal + tax + shipping).toFixed(2);

    return {
      subtotal,
      discountedSubtotal,
      tax,
      shipping,
      total
    };
  }, [filteredCart, discount]);

  const getDisplayCurrency = (currency) => {
    if (!currency) return "AED";
    const val = currency.toUpperCase();
    if (val === "UAE") return "AED";
    if (val === "INDIA") return "INR";
    if (val === "KSA") return "SAR";
    if (val === "KUWAIT") return "KWD";
    if (val === "QATAR") return "QAR";
    if (val === "INR" || val === "AED" || val === "SAR" || val === "KWD" || val === "QAR" || val === "USD" || val === "GBP") return val;
    if (val === "USA") return "USD";
    if (val === "UK") return "GBP";
    return "AED";
  };

  const handleNavigate = (path) => {
    router.push(path);
  };

  return (
    <section
      className={`self-stretch overflow-hidden flex flex-col items-center justify-center py-[60px] px-0 box-border max-w-[1360px] z-[2] text-left text-sm text-[#000] font-h5-24 mq750:pt-[39px] mq750:pb-[39px] mq750:box-border ${className}`}
    >
      {filteredCart.length === 0 ? (
        <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-6 py-10 text-center">
          <h2 className="text-2xl font-medium">Your cart is empty</h2>
          <button
            onClick={handleContinueShopping}
            className="rounded-[100px] bg-[#000] text-white px-6 py-3 font-medium hover:bg-[#333] transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="self-stretch flex flex-row items-start justify-center gap-10 max-w-full lg:flex-wrap mq750:gap-5 mq450:flex-col">
          <div className="flex-1 flex flex-col gap-4 max-w-full mq750:min-w-full">
            {filteredCart.map((item) => {
              const displayCurrency = getDisplayCurrency(item.currency || currency);
              // Use a unique key: prefer _id, fallback to productId
              const itemKey = item._id || item.productId;
              return (
                <div
                  key={itemKey}
                  className="rounded-2xl bg-[#f7f7f7] flex flex-col items-start justify-center max-w-full"
                >
                  <div className="self-stretch flex flex-row items-start justify-center py-0 pl-0 pr-6 box-border gap-6 max-w-full mq1050:flex-wrap">
                    <Image
                      className="h-[188px] w-[188px] relative overflow-hidden shrink-0 object-contain bg-[#f7f7f7]"
                      loading="lazy"
                      width={188}
                      height={188}
                      alt={item.name}
                      src={
                        item.image
                          ? item.image.startsWith("http")
                            ? item.image
                            : item.image.startsWith("/")
                              ? item.image
                              : `/${item.image}`
                          : "/no-image.webp"
                      }
                    />
                    <div className="flex flex-col items-center justify-center pt-6 px-0 pb-0 box-border max-w-full">
                      <div className="w-[584px] flex flex-col items-start justify-start gap-3 max-w-full">
                        <div className="self-stretch flex flex-col items-start justify-start gap-2">
                          <div className="self-stretch flex flex-row items-start justify-between text-[rgba(0,0,0,0.8)]">
                            <div className="self-stretch flex-1 relative leading-[150%] font-medium flex items-center">
                              {item?.collection?.name || 'Product'}
                            </div>
                          </div>
                          <div className="self-stretch relative text-lg leading-[150%] font-medium">
                            {item.name}
                          </div>
                          <div className="self-stretch flex flex-row items-center justify-center text-base">
                            <div className="flex-1 relative leading-[150%] font-medium">
                              {(() => {
                                let priceValue = item.price;
                                let priceNum = 0;
                                if (typeof priceValue === "string") {
                                  const match = priceValue.match(/([\d,.]+)/);
                                  priceNum = match ? parseFloat(match[1].replace(/,/g, "")) : 0;
                                } else if (typeof priceValue === "number") {
                                  priceNum = priceValue;
                                }
                                return `${displayCurrency} ${priceNum.toFixed(2)}`;
                              })()}
                            </div>
                          </div>
                        </div>
                        <div className="self-stretch h-10 flex flex-row items-end justify-start py-0 pl-0 pr-[5px] box-border gap-3 max-w-full text-center font-p5-121 mq750:h-auto mq750:flex-wrap mq450:items-center">
                          <div className="w-[106px] rounded-[100px] border-[rgba(0,0,0,0.16)] border-solid border-[1px] box-border overflow-hidden shrink-0 flex flex-row items-center justify-center mq450:flex-1 mq450:max-w-[120px]">
                            <button
                              className="h-10 w-10 flex items-center justify-center"
                              onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Image
                                className="h-6 w-6 relative overflow-hidden shrink-0 object-contain"
                                loading="lazy"
                                width={24}
                                height={24}
                                alt="Decrease quantity"
                                src="/icroundminus1@2x.webp"
                              />
                            </button>
                            <div className="flex-1 relative leading-[150%] font-medium">
                              {item.quantity}
                            </div>
                            <button
                              className="h-10 w-10 flex items-center justify-center"
                              onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            >
                              <Image
                                className="h-6 w-6 relative overflow-hidden shrink-0 object-contain"
                                loading="lazy"
                                width={24}
                                height={24}
                                alt="Increase quantity"
                                src="/icroundplus1@2x.webp"
                              />
                            </button>
                          </div>
                          <div className="w-[395px] flex flex-col items-start justify-start max-w-full mq450:w-auto mq450:flex-1">
                            <button className="w-10 h-10 flex items-center justify-center mq450:mx-2">
                              <Image
                                className="w-10 h-10 relative"
                                loading="lazy"
                                width={24}
                                height={24}
                                alt="Add to wishlist"
                                src="/wish2.svg"
                              />
                            </button>
                          </div>
                          <div className="flex flex-col items-start justify-end pt-0 px-0 pb-[9px] text-left text-[rgba(0,0,0,0.4)] font-h5-24 mq450:flex-1 mq450:items-end mq450:pb-0">
                            <button
                              // Remove by correct id: use _id if present, else productId
                              onClick={() => removeFromCart(item._id || item.productId)}
                              className="w-[54px] relative [text-decoration:underline] leading-[150%] font-medium inline-block hover:text-[#000]"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="w-[500px] rounded-2xl border-[rgba(0,0,0,0.16)] border-solid border-[1px] box-border flex flex-col items-end justify-start py-[20px] px-6 gap-4 max-w-full text-base mq750:pt-5 mq750:pb-5 mq750:box-border mq750:min-w-full mq750:mx-4  mq450:w-[300px] mq450:ml-[-17px] mq450:rounded-[0px] mq450:border-0"
          >
            <div
              className="self-stretch rounded-[100px] overflow-x-auto flex flex-row items-center justify-start py-3.5 gap-3 cursor-pointer mq450:flex-col"
              onClick={toggleCouponInput}
            >
              <div className="w-full flex items-center gap-4">
                <form onSubmit={handleCouponSubmit} className="w-full flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 border-[rgba(0,0,0,0.16)] border-solid border-[1px] px-[15px] py-3.5 rounded-[100px]"
                    required
                    disabled={discount > 0}
                  />
                  {discount > 0 ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setCouponCode('');
                        setDiscount(0);
                        setCouponDetails(null);
                      }}
                      className="px-[15px] py-3.5 rounded-[100px] bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-[15px] py-3.5 rounded-[100px] bg-black text-white font-medium hover:bg-[#333] transition-colors"
                    >
                      Apply
                    </button>
                  )}
                </form>
              </div>
            </div>

            <div className="self-stretch flex flex-col items-start justify-start gap-6 text-xl">
              <div className="self-stretch relative text-[20px] leading-[150%] font-semibold">
                Order Summary
              </div>
              <div className="self-stretch flex flex-col items-start justify-start gap-3 text-base text-[rgba(0,0,0,0.8)]">
                <div className="self-stretch flex flex-row items-start justify-between">
                  <div className="relative leading-[150%]">Subtotal</div>
                  <div className="relative leading-[150%] font-medium text-[#000]">
                    {getDisplayCurrency(currency)} {filteredTotals.subtotal.toFixed(2)}
                  </div>
                </div>
                {discount > 0 && (
                  <div className="self-stretch flex flex-row items-start justify-between text-green-600">
                    <div className="relative leading-[150%]">Discount</div>
                    <div className="relative leading-[150%] font-medium">
                      -{getDisplayCurrency(currency)} {Number(discount).toFixed(2)}
                    </div>
                  </div>
                )}
                <div className="self-stretch flex flex-row items-start justify-between">
                  <div className="relative leading-[150%]">Tax</div>
                  <div className="relative leading-[150%] font-medium text-[#000]">
                    {getDisplayCurrency(currency)} {filteredTotals.tax.toFixed(2)}
                  </div>
                </div>
                <div className="self-stretch flex flex-row items-start justify-between">
                  <div className="relative leading-[150%]">Shipping</div>
                  <div className="relative leading-[150%] font-medium text-[#000]">
                    {filteredTotals.shipping === 0 ? "Free" : `${getDisplayCurrency(currency)} ${filteredTotals.shipping.toFixed(2)}`}
                  </div>
                </div>
                <div className="self-stretch flex flex-row items-start justify-between text-xl text-[#000]">
                  <div className="relative leading-[150%] font-semibold">
                    Total
                  </div>
                  <div className="relative leading-[150%] font-semibold">
                    {getDisplayCurrency(currency)} {filteredTotals.total.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Show Place Order button only if logged in */}
            {useCart().isLoggedIn && (
              <button
                className={`self-stretch rounded-[100px] bg-[#000] h-[52px] flex flex-row items-center justify-center py-[13px] px-6 box-border text-[#fff] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#333] cursor-pointer'} transition-colors`}
                onClick={handlePlaceOrder}
                disabled={isSubmitting || filteredCart.length === 0}
              >
                {isSubmitting ? "Processing..." : "Place Order"}
              </button>
            )}
            {!useCart().isLoggedIn && (
              <button
                className="self-stretch rounded-[100px] bg-[#000] h-[52px] flex flex-row items-center justify-center py-[13px] px-6 box-border text-[#fff] hover:bg-[#333] transition-colors"
                onClick={() => handleNavigate("/checkout")}
              >
                Continue as Guest
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

Main1.propTypes = {
  className: PropTypes.string,
  cart: PropTypes.array.isRequired,
  removeFromCart: PropTypes.func.isRequired,
  updateQuantity: PropTypes.func.isRequired,
  cartTotal: PropTypes.number.isRequired,
  clearCart: PropTypes.func.isRequired,
  handleApplyCoupon: PropTypes.func.isRequired,
  couponCode: PropTypes.string.isRequired,
  setCouponCode: PropTypes.func.isRequired,
  discount: PropTypes.number.isRequired,
  totals: PropTypes.object.isRequired,
  handlePlaceOrder: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  paymentMethod: PropTypes.string.isRequired,
  setPaymentMethod: PropTypes.func.isRequired,
  handleContinueShopping: PropTypes.func.isRequired
};

export default Main1;