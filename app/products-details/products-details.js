"use client";
import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { useCart } from "../../context/CartContext";
import Left from "../../components/left";
import R from "../../components/r";
import R1 from "../../components/r1";
import Description from "../../components/description";
import Video from "../../components/video";
import Soecification from "../../components/soecification";
import Testimonials from "../../components/testimonials";
import Card from "../../components/card";
import Footer from "../../components/footer";
import Navbar from "../../components/navbar";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useCountry } from "../../context/CountryContext";

function ProductDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [productId, setProductId] = useState("");
  const [product, setProduct] = useState(null);
  const { selectedCountry, updateCountry } = useCountry();
  const swiperRef = useRef(null);

  useEffect(() => {
    const productIdFromParams = searchParams.get("productId");

    if (productIdFromParams) {
      setProductId(productIdFromParams);
      axios.get(`https://0vm9jauvgc.execute-api.us-east-1.amazonaws.com/stag/api/products/${productIdFromParams}`)
        .then(response => {
          setProduct(response.data);
        })
        .catch(error => console.error("Error fetching product data:", error));
    }
  }, [searchParams]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      });
      alert("Product added to cart!");
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      });
      router.push("/cart");
    }
  };
  const handleCountrySelect = (country) => {
    updateCountry(country);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

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

  return (
    <div className="w-full relative bg-white overflow-hidden flex flex-col items-center justify-start pt-[13px] px-4 sm:px-6 md:px-8 lg:px-10 box-border leading-[normal] tracking-[normal] text-left text-xs text-[rgba(0,0,0,0.6)] font-h5-24">
      <Navbar
        logoSrc="/1623314804-bd8bf9c117ab50f7f842-1@2x.webp"
        search="/search.svg"
        account="/account.svg"
        sVG="/svg.svg"
        onCountrySelect={handleCountrySelect}
        navbarBackgroundColor={"black"}
      />

      {/* Breadcrumb section */}
      <div className="w-full max-w-[1360px] flex flex-row items-center justify-start py-4 box-border">
        <div className="relative leading-[150%] font-medium text-[10px] sm:text-xs">{`Home > Shop > AUTONOVA Automatic Watch`}</div>
      </div>

      {/* Product details section */}
      <section className="w-full max-w-[1360px] bg-[#fff] text-black overflow-hidden flex flex-col lg:flex-row items-center justify-center py-[25px] sm:py-[60px] px-0 box-border gap-[30px] sm:gap-[60px] text-lg text-[#000] font-h5-24">
        <Left product={product?.data?.product} />
        <div className="w-full lg:flex-1 flex flex-col items-center justify-center gap-6 min-w-0 lg:min-w-[455px]">
          <R product={product?.data?.product} relatedProducts={product?.data?.relatedProducts} selectedCountry={selectedCountry} />
          <R1 product={product?.data?.product} />
        </div>
      </section>

      {/* Description section */}
      <div className="w-full max-w-[1360px] px-0 sm:px-4">
        <Description description="Description" img="/img@2x.webp" product={product?.data?.product} />
      </div>

      {/* Video section */}
      <div className="w-full max-w-[1360px] px-0 sm:px-4">
        <Video />
      </div>

      {/* Specification section */}
      <div className="w-full max-w-[1360px] px-0 sm:px-4">
        <Soecification product={product?.data?.product} />
      </div>

      {/* Reviews section */}
      <div className="w-full max-w-[1360px] px-0 sm:px-4">
        <Testimonials Heading="Reviews" />
      </div>

      {/* Related Products section */}
      <section className="w-full max-w-[1360px] overflow-hidden flex flex-col items-center justify-start py-10 px-0 sm:px-4 gap-5 sm:gap-10 text-left text-29xl mq450:py-0 text-[#000] font-h5-24">
        <div className="w-full flex flex-row sm:flex-row items-center justify-between gap-4 mq450:gap-2 px-4 sm:px-0">
          <h1 className="m-0 w-full sm:flex-1 relative text-black text-[44px] leading-[120%] font-medium font-[inherit] mq450:text-[22px]">
            Related Products
          </h1>
          <div className="flex flex-row items-start justify-center gap-2 sm:gap-4">
            <button
              className="swiper-button-prev-custom focus:outline-none bg-transparent"
              onClick={() => swiperRef.current?.swiper.slidePrev()}
            >
              <Image
                className="h-8 w-8 sm:h-11 sm:w-11 relative overflow shrink-0 object-contain"
                loading="lazy"
                width={44}
                height={44}
                alt="Previous"
                src="/solararrowuplinear-2@2x.webp"
              />
            </button>
            <button
              className="swiper-button-next-custom focus:outline-none bg-transparent"
              onClick={() => swiperRef.current?.swiper.slideNext()}
            >
              <Image
                className="h-8 w-8 sm:h-11 sm:w-11 relative overflow shrink-0 object-contain"
                loading="lazy"
                width={44}
                height={44}
                alt="Next"
                src="/solararrowuplinear-1@2x.webp"
              />
            </button>
          </div>
        </div>
        <div className="w-full px-4">
          <Swiper
            ref={swiperRef}
            modules={[Navigation]}
            spaceBetween={10}
            slidesPerView={2}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 15
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 20
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 20
              },
              1280: {
                slidesPerView: 4,
                spaceBetween: 24
              }
            }}
          >
            {product?.data?.youMayAlsoLike?.map((product) => {
              const currencySymbol = getCurrencySymbol(selectedCountry);
              const productPrice = getCountryPrice(product.price);
              const displayPrice = productPrice ? `${currencySymbol} ${productPrice}` : '';

              return (
                <SwiperSlide key={product._id}>
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
      </section>

      <Footer
        footerAlignSelf="unset"
        footerWidth="100%"
        maskGroup="/mask-group@2x.webp"
        iconYoutube="/icon--youtube.svg"
        itemImg="/item--img.svg"
        itemImg1="/item--img-1.svg"
        itemImg2="/item--img-2.svg"
      />
    </div>
  );
}

const ProductsDetails = () => {
  return (
    <Suspense fallback={<div className="w-full h-screen flex items-center justify-center bg-black text-white">Loading...</div>}>
      <ProductDetailsContent />
    </Suspense>
  );
};

export default ProductsDetails;