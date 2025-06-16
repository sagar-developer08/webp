"use client";
import { useCallback, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { useUser } from "../../context/UserContext";
import { useCountry } from "../../context/CountryContext";
import Footer from "../../components/footer";
import Navbar from "../../components/navbar";
import AnimateOnScroll from "../../components/AnimateOnScroll";
import PageBanner from "../../components/page-banner";
import { toast } from "react-hot-toast";
import axiosInstance from "../../services/axios";
import Main1 from "../../components/main1";
import { load } from "@cashfreepayments/cashfree-js";

const Cart = () => {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartTotal,
    clearCart,
    createOrder,
    loading,
    orderProcessing,
    shippingAddress,
    getCartItemsByCurrency,
    getCurrentCurrencyTotal,
    getCurrency,
    currency
  } = useCart();

  const { selectedCountry } = useCountry();
  const { user, loading: userLoading } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Strabl");
  const [couponCode, setCouponCode] = useState("");
  const [isCouponInputVisible, setIsCouponInputVisible] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [couponDetails, setCouponDetails] = useState(null);
  const [filteredCart, setFilteredCart] = useState([]);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [isTapPaymentLoading, setIsTapPaymentLoading] = useState(false);

  // Function to update filtered cart data - memoized to prevent rerenders
  const updateFilteredCart = useCallback(() => {
    if (cart && cart.length > 0) {
      const items = getCartItemsByCurrency();
      setFilteredCart(items);
      setFilteredTotal(getCurrentCurrencyTotal());
    } else {
      setFilteredCart([]);
      setFilteredTotal(0);
    }
  }, [cart, getCartItemsByCurrency, getCurrentCurrencyTotal]);

  // Force cart refresh when component mounts to ensure guest cart is loaded
  useEffect(() => {
    // Add a small delay to ensure CartContext has finished initializing
    const timer = setTimeout(() => {
      updateFilteredCart();
    }, 100);

    return () => clearTimeout(timer);
  }, [updateFilteredCart]);

  // Update filtered cart when cart or currency changes
  useEffect(() => {
    updateFilteredCart();
  }, [cart, currency, updateFilteredCart]);

  // Listen for currency changes via custom event
  useEffect(() => {
    const handleCountryChange = () => {
      updateFilteredCart();
    };

    window.addEventListener('countryChange', handleCountryChange);
    return () => {
      window.removeEventListener('countryChange', handleCountryChange);
    };
  }, [updateFilteredCart]);

  useEffect(() => {
    if (!orderProcessing) {
      setIsSubmitting(false);
    }
  }, [orderProcessing]);

  // Calculate totals based on filtered items - memoized
  const totals = useMemo(() => {
    const subtotal = filteredTotal;
    const discountedSubtotal = Math.max(0, subtotal - discount);
    const tax = (discountedSubtotal * 0.1).toFixed(2);
    const shipping = discountedSubtotal > 5000 ? 0 : 500;
    const total = (parseFloat(discountedSubtotal) + parseFloat(tax) + parseFloat(shipping)).toFixed(2);

    return {
      subtotal,
      discountedSubtotal,
      tax,
      shipping,
      total
    };
  }, [filteredTotal, discount]);

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      await clearCart();
      setDiscount(0);
      setCouponDetails(null);
      setCouponCode("");
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (window.confirm("Remove this item from cart?")) {
      await removeFromCart(itemId);
      if (cart.length === 1) {
        setDiscount(0);
        setCouponDetails(null);
        setCouponCode("");
      }
    }
  };

  const handleWishlistRemoveItem = async (itemId) => {
    await removeFromCart(itemId);
    if (cart.length === 1) {
      setDiscount(0);
      setCouponDetails(null);
      setCouponCode("");
    }
  };

  const onBd8bf9c117ab50f7f8421ImageClick = useCallback(() => {
    router.push("/");
  }, [router]);

  const onMenuItemsContainerClick = useCallback(() => {
    router.push("/about-us");
  }, [router]);

  const onMenuItemsContainerClick1 = useCallback(() => {
    router.push("/shop");
  }, [router]);

  const handleContinueShopping = () => {
    router.push("/shop");
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      const response = await axiosInstance.post(
        "http://localhost:8080/api/coupons/validate",
        {
          code: couponCode,
          cartTotal: filteredTotal,
          userId: user?._id,
        }
      );
      if (response.data.success) {
        setDiscount(response.data.data.discountAmount);
        setCouponDetails(response.data.data.coupon);
        toast.success("Coupon applied successfully!");
      } else {
        setDiscount(0);
        setCouponDetails(null);
        toast.error(response.data.message || "Invalid coupon code.");
      }
    } catch (error) {
      console.error("Coupon validation error:", error);
      setDiscount(0);
      setCouponDetails(null);
      toast.error(error.response?.data?.message || "Failed to validate coupon.");
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Require login only when placing an order
      if (!user) {
        toast.error("Please login to place an order");
        localStorage.setItem("redirectAfterLogin", "/cart");
        router.push("/login");
        setIsSubmitting(false);
        return;
      }

      const currentCurrency = getCurrency();

      const orderItems = filteredCart.map((item) => ({
        product: item.productId,
        name: item.name?.en || item.name || "",
        image: item.images
          ? item.images.startsWith("http")
            ? item.images
            : item.images.startsWith("/")
              ? item.images
              : `/${item.images}`
          : "/no-image.webp",
        price: item.price,
        quantity: item.quantity,
      }));

      if (orderItems.length === 0) {
        toast.error(`No items available for ${currentCurrency} currency`);
        setIsSubmitting(false);
        return;
      }

      const orderPayload = {
        orderItems,
        paymentMethod: paymentMethod,
        coupon: couponDetails ? {
          code: couponDetails.code,
          discountAmount: discount,
          couponId: couponDetails._id
        } : null,
        subtotal: totals.subtotal,
        discount: discount,
        tax: totals.tax,
        shipping: totals.shipping,
        total: totals.total,
        currency: currentCurrency,
        shippingAddress: {
          address: "123 Main St",
          city: "New York",
          postalCode: "10001",
          country: selectedCountry || "uae"
        }
      };

      const response = await axiosInstance.post("/orders", orderPayload);

      // Get cartId from the nested response structure
      const cartId = response.data?.strablCheckout?.data?.data?.cartId;

      if (cartId) {
        toast.success("Order placed successfully! Redirecting to payment...");
        // Redirect to the Strabl checkout page using the cartId
        window.location.href = `https://sandbox.checkout.strabl.io/?token=${cartId}`;
        // Optionally clear cart and reset state after redirect if needed
        await clearCart();
        setDiscount(0);
        setCouponDetails(null);
        setCouponCode("");
        // router.push("/order-success"); // Remove this, as redirect is handled above
      } else {
        console.error("No cartId found in response:", response.data);
        toast.error("Could not process payment. Please try again.");
      }
    } catch (error) {
      console.error("Order placement error:", error);
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cashfree payment handler for logged-in users
  const handleCashfreePay = async () => {
    setIsSubmitting(true);
    try {
      const order_id = `order_${Date.now()}`;
      const customer_id = `cust_${Date.now()}`;
      const order_amount = Number(totals.total);

      const requestBody = {
        order_id,
        order_amount,
        // order_currency,
        customer_details: {
          customer_id,
          customer_email: user?.email,
          customer_phone: user?.phoneNumber || "8689912326"
        }
      };
      const response = await fetch("http://localhost:8080/api/cashfree/create-order", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      if (data.success && data.data?.payment_session_id) {
        toast.success("Cashfree order created!");
        const cashfree = await load({ mode: "sandbox" });
        cashfree.checkout({
          paymentSessionId: data.data.payment_session_id,
          redirectTarget: "_blank"
        });
      } else {
        toast.error(data.message || "Cashfree payment failed");
      }
    } catch (err) {
      toast.error("Cashfree payment failed");
      console.error("Payment error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTapPay = async () => {
    if (filteredCart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsTapPaymentLoading(true);
    try {
      // Get actual cart ID from the first cart item or create one if needed
      let cartId = cart
      console.log(cartId, "cartId")
      
      // If no cart ID exists, create cart by adding first item
      if (!cartId && filteredCart.length > 0) {
        const firstItem = filteredCart[0];
        const cartResponse = await fetch('http://localhost:8080/api/guest/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: firstItem._id || firstItem.productId,
            quantity: firstItem.quantity,
            currency: currency || "UAE"
          })
        });

        if (cartResponse.ok) {
          const cartResult = await cartResponse.json();
          cartId = cartResult.cartId || cartResult.data?._id || cartResult.data?.cartId;
        }
      }

      // If still no cart ID, throw error
      if (!cartId) {
        throw new Error('Unable to get or create cart ID');
      }

      // Generate unique transaction reference
      const transactionRef = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const orderRef = `ORD-${new Date().getFullYear()}-${Date.now()}`;

      // Helper function to get country code for phone
      const getCountryCode = (country) => {
        const countryCodes = {
          'UAE': '971',
          'KSA': '966', 
          'KUWAIT': '965',
          'QATAR': '974',
          'USA': '1',
          'UK': '44'
        };
        return countryCodes[country?.toUpperCase()] || '971';
      };

      // Helper function to get display currency
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

      const tapPayload = {
        amount: parseFloat(totals.total),
        currency: getDisplayCurrency(currency),
        cartId: cartId,
        customerId: user?.id || user?._id || `customer_${Date.now()}`,
        description: "Payment for Tornado Watch Order",
        customer: {
          first_name: user?.firstName || user?.name?.split(' ')[0] || "Customer",
          last_name: user?.lastName || user?.name?.split(' ').slice(1).join(' ') || "User",
          email: user?.email || "customer@example.com",
          phone: {
            country_code: getCountryCode(selectedCountry),
            number: user?.phone || user?.phoneNumber || "501234567"
          }
        },
        source: {
          id: "src_all"
        },
        save_card: false,
        threeDSecure: true,
        receipt: {
          email: true,
          sms: false
        },
        metadata: {
          product_type: "watch",
          order_number: orderRef,
          cart_items: filteredCart.map(item => ({
            id: item._id || item.productId,
            name: item.name,
            quantity: item.quantity,
            price: typeof item.price === 'string' ? 
              parseFloat(item.price.match(/([\d,.]+)/)?.[1]?.replace(/,/g, '') || '0') : 
              item.price
          }))
        },
        reference: {
          transaction: transactionRef,
          order: orderRef
        }
      };

      console.log('Tap Payment Payload:', tapPayload);

      const response = await fetch('http://localhost:8080/api/tap/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tapPayload)
      });

      const result = await response.json();
      console.log('Tap Payment Response:', result);

      if (response.ok && result.success) {
        // Handle successful payment initiation
        if (result.redirect_url || result.transaction_url) {
          const paymentUrl = result.redirect_url || result.transaction_url;
          toast.success("Tap payment initiated successfully! Redirecting to payment...");
          // Redirect to payment page
          window.open(paymentUrl, "_blank");
          
          // Clear discount and coupon after successful payment initiation
          setDiscount(0);
          setCouponDetails(null);
          setCouponCode("");
        } else {
          toast.success("Payment initiated successfully");
        }
      } else {
        toast.error(result.message || "Payment initiation failed");
      }
    } catch (error) {
      console.error('Tap payment error:', error);
      toast.error("Payment service unavailable. Please try again.");
    } finally {
      setIsTapPaymentLoading(false);
    }
  };

  // Only show Cashfree for India
  const isCashfreeAvailable = (selectedCountry && selectedCountry.toLowerCase() === "india");

  return (
    <div className="w-full relative bg-[#fff] overflow-hidden flex flex-col items-center justify-center min-h-screen leading-[normal] tracking-[normal]">
      <div className="flex-1 w-full flex flex-col items-center justify-center">
        <PageBanner title="Cart" breadcrumb="Home > Cart" />
      </div>

      <section className="self-stretch overflow-hidden flex flex-col items-center justify-center py-0 px-0 z-[10] text-center text-29xl text-[#fff] font-h5-24 mq1050:gap-[30px] mq450:px-4 max-w-[1360px] mx-auto w-full">
        <Main1
          cart={cart}
          wishlistFromcart={handleWishlistRemoveItem}
          removeFromCart={handleRemoveItem}
          updateQuantity={updateQuantity}
          cartTotal={cartTotal}
          clearCart={handleClearCart}
          handleApplyCoupon={handleApplyCoupon}
          couponCode={couponCode}
          setCouponCode={setCouponCode}
          setDiscount={setDiscount}
          setCouponDetails={setCouponDetails}
          discount={discount}
          totals={totals}
          handlePlaceOrder={handlePlaceOrder}
          isSubmitting={isSubmitting}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          handleContinueShopping={handleContinueShopping}
          isCouponInputVisible={isCouponInputVisible}
          setIsCouponInputVisible={setIsCouponInputVisible}
          handleCashfreePay={handleCashfreePay}
          isCashfreeAvailable={isCashfreeAvailable}
          handleTapPay={handleTapPay}
          isTapPaymentLoading={isTapPaymentLoading}
        />
      </section>
      <Footer
        footerAlignSelf="stretch"
        footerWidth="unset"
        maskGroup="/mask-group@2x.webp"
        iconYoutube="/icon--youtube3.svg"
        itemImg="/item--img4.svg"
        itemImg1="/item--img-14.svg"
        itemImg2="/item--img-24.svg"
      />
      <Navbar
        logoSrc="/1623314804-bd8bf9c117ab50f7f842-1@2x.webp"
        search="/search1.svg"
        account="/account1.svg"
        sVG="/svg1.svg"
        navbarBackgroundColor={"transparent"}
      />
    </div>
  );
};

export default Cart;