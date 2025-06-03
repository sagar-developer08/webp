"use client";
import Card from "./card";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const Bestsellers = ({ className = "", country, selectedCountry }) => {
  const [products, setProducts] = useState({ data: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`https://0vm9jauvgc.execute-api.us-east-1.amazonaws.com/stag/api/products/best-sellers`);
      console.log(response.data, "Products data from API");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <section
      className={`self-stretch overflow-hidden flex flex-col items-center justify-start py-[60px] px-[40px] gap-[60px] z-[2] text-left text-37xl text-black font-h5-24 mq1050:gap-[30px] mq1050:pt-[39px] mq1050:pb-[39px] mq1050:box-border mq450:px-[24px] mq450:gap-[24px] mq450:py-[40px] ${className}`}
    >
      <div className="w-[1360px] flex flex-row items-start justify-between gap-[60px] mq450:gap-[30px] max-w-full mq750:flex-col mq450:item-center mq450:justify-center">
        <h2 className="m-0 relative text-[48px] leading-[120%] font-semibold font-[inherit] mq450:text-center mq750:text-[34px] mq750:leading-[40px] mq1050:text-[45px] mq1050:leading-[54px] mq450:text-[24px] mq450:leading-[120%]">
          {country?.best_Seller_title && (
            <>
              {country.best_Seller_title.split(' ').slice(0, 5).join(' ')}
              <br className="mq450:hidden" />
              {country.best_Seller_title.split(' ').slice(5).join(' ')}
            </>
          )}
        </h2>
        <div className="flex-1 relative text-base mq450:text-center leading-[150%] font-medium text-black mq750:w-full">
          {country?.best_Seller}
        </div>
      </div>

      <div className="w-[1360px] max-w-full">
        {loading ? (
          <div className="text-white">Loading products...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : products.data.length > 0 ? (
          <div className="relative flex justify-center items-center">
            <Swiper
              modules={[Navigation]}
              navigation={{
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
              }}
              spaceBetween={24}
              slidesPerView={4}
              breakpoints={{
                0: {
                  slidesPerView: 2,
                  spaceBetween: 10
                },
                640: {
                  slidesPerView: 2,
                  spaceBetween: 15
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 20
                },
                1360: {
                  slidesPerView: 4,
                  spaceBetween: 24
                }
              }}
              style={{
                "--swiper-navigation-color": "#fff",
                "--swiper-pagination-color": "#fff",
                width: "100%"
              }}
              className="!p-[2px] flex justify-center items-center"
            >
              {products.data.map((product) => {
                const currencySymbol = getCurrencySymbol(selectedCountry);
                const productPrice = getCountryPrice(product.price);
                const displayPrice = productPrice ? `${currencySymbol} ${productPrice}` : '';

                return (
                  <SwiperSlide key={product._id} className="flex justify-center">
                    <Card
                      productId={product._id}
                      images={product?.imageLinks?.image1 || "/default-watch.jpg"}
                      hoverImage={product?.imageLinks?.image2 || "/default-watch.jpg"}
                      classic={product.watchDetails?.watchType?.en || "Classic"}
                      name={product.name?.en}
                      icroundStar="/icroundstar-1.svg"
                      dialColor={product.watchDetails?.dialColor?.en || "Black"}
                      price={displayPrice}
                    />
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        ) : (
          <div className="text-white">No Bestseller found</div>
        )}
      </div>
    </section>
  );
};

Bestsellers.propTypes = {
  className: PropTypes.string,
};

export default Bestsellers;