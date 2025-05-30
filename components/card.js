"use client";
import { useState } from "react";
import Image from "next/image";
import PropTypes from "prop-types";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";
import { useWishlist } from "../context/WishlistContext";
import { useUser } from "../context/UserContext";

const Card = ({
  className = "",
  images,
  hoverImage,
  classic,
  name,
  icroundStar,
  price,
  originalPrice,
  dialColor,
  productId,
  _id,
}) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useUser();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [showActions, setShowActions] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart({
      productId: _id || productId,
      name,
      price,
      images: [images],
      quantity: 1,
    });
    toast.success(`${name} added to cart`);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    
    const product = {
      _id: _id || productId,
      name,
      price,
      imageLinks: { image1: images },
      watchDetails: { watchType: { en: classic } },
      classic,
      dialColor
    };

    if (isInWishlist(_id || productId)) {
      removeFromWishlist(_id || productId);
    } else {
      addToWishlist(product);
    }
  };

  const handleProductClick = () => {
    router.push(`/products-details?productId=${_id || productId}`);
  };

  return (
    <div
      onClick={handleProductClick}
      className={`card-container w-full rounded-lg bg-gray-100 shadow-md overflow-hidden flex flex-col items-start justify-start text-center text-xs font-h5-24 relative cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      style={{ 
        minHeight: '18rem',
        aspectRatio: '320/480',
        contain: 'layout style paint'
      }}
    >
      <div className="self-stretch relative h-[280px] mq750:h-[200px] mq450:h-[140px] overflow-hidden shrink-0">
        <div className="w-full h-full relative">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
          )}
          
          <Image
            className={`absolute h-full w-full top-0 right-0 bottom-0 left-0 max-w-full overflow-hidden max-h-full object-contain bg-white transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="eager"
            priority={true}
            width={300}
            height={300}
            alt={name || "Product Image"}
            src={imageError ? "/no-image.webp" : (showActions && hoverImage ? hoverImage : images || "/no-image.webp")}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
            sizes="(max-width: 450px) 140px, (max-width: 750px) 200px, 280px"
          />
        </div>
        
        {imageLoaded && (
          <div className="absolute top-[16px] right-[16px] rounded-full bg-gray-100 flex flex-row items-center justify-center py-1 px-3.5 text-white mq450:py-0.5 mq450:px-2 mq450:gap-[1rem]">
            <Image
              className="h-3 w-3 relative overflow-hidden shrink-0 mq450:h-2 mq450:w-2"
              loading="lazy"
              width={12}
              height={12}
              alt="Rating"
              src={icroundStar}
            />
            <div className="relative leading-[150%] text-black font-medium mq450:text-xs">4.0</div>
          </div>
        )}
      </div>
      
      <div className="w-full h-4 bg-white"></div>
      
      <div className="self-stretch flex h-[130px] mq750:h-[110px] mq450:h-[100px] flex-col items-start justify-start p-4 mq450:p-2 gap-1 text-left">
        <div className="self-stretch relative leading-[150%] font-medium text-gray-500 text-sm">
          {classic}
        </div>
        <div className="self-stretch relative text-base mq750:text-sm mq450:text-xs text-black leading-[150%] font-semibold cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis hover:underline"
          title={name && name.length > 200 ? name : undefined}
        >
          {name && name.length > 200 ? `${name.substring(0, 200)}...` : name}
        </div>
        <div className="self-stretch relative text-sm mq750:text-sm mq450:text-xs text-gray-700 leading-[150%]">
          {dialColor}
        </div>
        <div className="self-stretch relative text-lg mq750:text-base mq450:text-sm text-black leading-[150%] font-semibold mt-auto">
          {price}
        </div>
      </div>
      {showActions && (
        <div className="absolute inset-0 flex items-center justify-center gap-4 mq450:gap-1 mq450:flex-col">
          <button
            onClick={handleAddToCart}
            className="bg-black text-white py-2 px-6 mq750:px-4 mq450:px-2 mq450:py-1 rounded-full font-medium transition-colors z-10 text-sm mq450:text-[10px] cursor-pointer"
          >
            Add to Cart
          </button>
          <button
            onClick={handleWishlist}
            className={`p-3 mq450:p-1.5 rounded-full hover:bg-gray-200 transition-colors h-10 w-10 mq450:h-6 mq450:w-6 z-10 flex items-center justify-center cursor-pointer ${
              isInWishlist(_id || productId) ? 'text-red-500' : 'text-black bg-gray-200'
            }`}
            aria-label={isInWishlist(_id || productId) ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mq450:h-4 mq450:w-4"
              fill={isInWishlist(_id || productId) ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  className: PropTypes.string,
  images: PropTypes.string.isRequired,
  hoverImage: PropTypes.string,
  classic: PropTypes.string,
  name: PropTypes.string,
  icroundStar: PropTypes.string,
  price: PropTypes.number.isRequired,
  originalPrice: PropTypes.number,
  dialColor: PropTypes.string,
  productId: PropTypes.string,
  _id: PropTypes.string,
};

export default Card;