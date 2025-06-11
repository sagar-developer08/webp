"use client";
import Image from "next/image";
import BtnShop from "./btn-shop";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import Card from "./card";
import { useRouter } from "next/navigation";

const Offers = ({ className = "", country, selectedCountry }) => {
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active card index state
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          "https://0vm9jauvgc.execute-api.us-east-1.amazonaws.com/stag/api/products/featured"
        );
        if (!response.ok)
          throw new Error("Failed to fetch featured products");
        const data = await response.json();
        setFeaturedProducts(data.data || []);
      } catch (error) {
        console.error("Error fetching featured products:", error);
        setError("Failed to load featured products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleNavigate = (path) => {
    router.push(path);
  };

  const getCurrencySymbol = (country) => {
    if (!country) return "$";
    const countryUpper = country.toUpperCase();
    switch (countryUpper) {
      case "INDIA":
        return "₹";
      case "UAE":
        return "AED";
      case "KSA":
        return "SR";
      case "KUWAIT":
        return "KD";
      case "QATAR":
        return "QAR";
      default:
        return "$";
    }
  };

  const getCountryPrice = (priceObj) => {
    if (!priceObj || typeof priceObj !== "object") return "";
    if (!selectedCountry) return Object.values(priceObj)[0] || "";
    const countryKey = selectedCountry.toLowerCase();
    return priceObj[countryKey] || Object.values(priceObj)[0] || "";
  };

  const formatPrice = (priceObj) => {
    const currencySymbol = getCurrencySymbol(selectedCountry);
    const price = getCountryPrice(priceObj);
    return price ? `${currencySymbol} ${price}` : "";
  };

  // Overlap to the right, smooth transitions
  const renderOverlappingCards = () => {
    if (!featuredProducts.length) return null;

    const cardWidth = 320;
    const cardHeight = 480;
    const overlapOffset = 25; // px to overlap (controls how much right overlap)
    const visibleCount = 3; // number of cards to show at once

    return (
      <div
        className="relative"
        style={{
          width: `${cardWidth + overlapOffset * (visibleCount - 1)}px`,
          height: `${cardHeight + 72}px`, // add space for arrows below cards
          margin: "0 auto",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "flex-start",
          flexDirection: "column",
        }}
      >
        {/* Cards */}
        <div
          style={{
            width: "100%",
            height: `${cardHeight}px`,
            position: "relative",
          }}
        >
          {featuredProducts.map((product, idx) => {
            // Calculate the relative position from the active card
            let rel = idx - activeIndex;

            // Circular calculation for right side overlap
            if (rel < 0) rel += featuredProducts.length;

            let style = {
              position: "absolute",
              left: `${rel * overlapOffset}px`,
              bottom: 0,
              width: `${cardWidth}px`,
              height: `${cardHeight}px`,
              borderRadius: "18px",
              background: "transparent",
              transition:
                "left 0.5s cubic-bezier(.47,1.64,.41,.8), opacity 0.45s, transform 0.45s",
              zIndex: rel === 0 ? 10 : 10 - rel,
              opacity: rel === 0 ? 1 : rel < visibleCount ? 0.7 - 0.2 * rel : 0,
              transform:
                rel === 0
                  ? "scale(1)"
                  : rel < visibleCount
                    ? `scale(${1 - rel * 0.07}) translateY(${rel * 15}px)`
                    : "scale(0.93) translateY(40px)",
              pointerEvents: rel === 0 ? "auto" : "none",
              visibility: rel < visibleCount ? "visible" : "hidden",
            };

            return (
              <div key={product._id} style={style}>
                <Card
                  stock={product.stock}
                  productId={product._id}
                  images={product?.imageLinks?.image1 || "/default-watch.jpg"}
                  hoverImage={product?.imageLinks?.image2 || "/default-watch.jpg"}
                  classic={product.collection?.name || "Classic"}
                  name={product.name?.en}
                  icroundStar="/icroundstar-1.svg"
                  dialColor={product.watchDetails?.dialColor?.en || "Black"}
                  price={formatPrice(product.price)}
                />
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows - BELOW cards, no bg */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex justify-center z-20"
          style={{
            bottom: 0,
            width: "100%",
            background: "transparent",
            boxShadow: "none",
            marginTop: "16px",
          }}
        >
          <div className="flex gap-4">
            <button
              className="swiper-button-prev-offers cursor-pointer"
              aria-label="Previous"
              onClick={() =>
                setActiveIndex(
                  (prev) =>
                    (prev - 1 + featuredProducts.length) %
                    featuredProducts.length
                )
              }
              style={{
                background: "transparent",
                border: "none",
                borderRadius: "50%",
                boxShadow: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                position: "relative",
                zIndex: 30,
                padding: 0,
              }}
            >
              <Image
                width={24}
                height={24}
                src="/solararrowuplinear-5@1x.webp"
                alt="Previous"
                className="h-6 w-6 object-contain"
              />
            </button>
            <button
              className="swiper-button-next-offers cursor-pointer"
              aria-label="Next"
              onClick={() =>
                setActiveIndex(
                  (prev) => (prev + 1) % featuredProducts.length
                )
              }
              style={{
                background: "transparent",
                border: "none",
                borderRadius: "50%",
                boxShadow: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                position: "relative",
                zIndex: 30,
                padding: 0,
              }}
            >
              <Image
                width={24}
                height={24}
                src="/solararrowuplinear-5@2x.webp"
                alt="Next"
                className="h-6 w-6 object-contain"
              />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      className={`self-stretch overflow-hidden flex flex-col items-center justify-center pb-[30px] pt-[60px] px-[40px] gap-[40px] z-[7] text-left text-29xl text-white font-h5-24 mq1050:gap-[30px] ${className} mq450:px-[24px] mq450:py-[40px] mq450:gap-[24px]`}
    >
      <div className="w-[1360px] rounded-3xl flex flex-row items-end justify-end py-20 px-10 box-border gap-[60px] bg-[url('/exclusive_offers_just_a_tick_away.webp')] bg-cover bg-no-repeat bg-[top] mq450:w-full mq450:gap-[20px] mq450:p-4 mq1050:pt-[52px] mq1050:pb-[52px] mq1050:box-border relative">
        {/* Left Content Section */}
        <div className="flex-1 flex flex-col items-start justify-start gap-6 mq450:items-center mq450:text-center mq450:gap-4">
          <h1 className="m-0 w-[543px] relative text-[48px] leading-[120%] font-medium font-[inherit] flex items-center mq750:text-[29px] mq750:leading-[35px] mq1050:text-[38px] mq1050:leading-[46px] mq450:text-[24px] mq450:leading-[120%] mq450:w-auto">
            Exclusive Offers Just a Tick Away
          </h1>
          <div className="w-[543px] relative text-base leading-[150%] font-medium text-white/80 flex items-center mq450:w-auto">
            {country?.Exclusive_Offers_Just_a_Tick_Away}
          </div>
          <BtnShop
            contact_us="Shop Now"
            onClick={() => handleNavigate("/featured")}
          />
        </div>

        {/* Right Overlapping Cards Section */}
        <div className="h-[541px] w-[520px] relative text-center text-[10.8px] text-black mq450:hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full text-white">
              Loading featured products...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500">
              {error}
            </div>
          ) : featuredProducts.length > 0 ? (
            renderOverlappingCards()
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              No featured products available
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

Offers.propTypes = {
  className: PropTypes.string,
  country: PropTypes.object,
  selectedCountry: PropTypes.string,
};

export default Offers;