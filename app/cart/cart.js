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
        "https://0vm9jauvgc.execute-api.us-east-1.amazonaws.com/stag/api/coupons/validate",
        {
          code: couponCode,
          cartTotal: filteredTotal,
          userId: user?._id,
        },
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
        name: item.name,
        image: item.image
          ? item.image.startsWith("http")
            ? item.image
            : item.image.startsWith("/")
              ? item.image
              : `/${item.image}`
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
        currency: currentCurrency
      };

      if (shippingAddress && shippingAddress.address) {
        orderPayload.shippingAddress = {
          address: shippingAddress.address,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
        };
      }

      const response = await axiosInstance.post("/orders", orderPayload);
      const cartId = response.data?.strablCheckout?.data?.data?.cartId;

      if (cartId) {
        toast.success("Order placed successfully! Redirecting to payment...");
        const strablCheckoutUrl = `https://sandbox.checkout.strabl.io/?token=${cartId}`;
        window.open(strablCheckoutUrl, "_blank");
        await clearCart();
        setDiscount(0);
        setCouponDetails(null);
        setCouponCode("");
        router.push("/order-success");
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

  return (
    <div className="w-full relative bg-[#fff] overflow-hidden flex flex-col items-center justify-center min-h-screen leading-[normal] tracking-[normal]">
      <div className="flex-1 w-full flex flex-col items-center justify-center">
        <PageBanner title="Cart" breadcrumb="Home > Cart" />
      </div>


      <section className="self-stretch overflow-hidden flex flex-col items-center justify-center py-0 px-0 z-[10] text-center text-29xl text-[#fff] font-h5-24 mq1050:gap-[30px] mq450:px-4 max-w-[1360px] mx-auto w-full">
        <Main1
          cart={cart}
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