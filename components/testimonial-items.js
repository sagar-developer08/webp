"use client";
import { useMemo } from "react";
import Image from "next/image";
import PropTypes from "prop-types";

const TestimonialItems = ({
  className = "",
  testimonialItemsBackgroundImage,
  author = "",
  quote = "",
}) => {
  const testimonialItemsStyle = useMemo(() => {
    return {
      backgroundImage: testimonialItemsBackgroundImage,
    };
  }, [testimonialItemsBackgroundImage]);

  return (
    <div
      className={`h-[400px] flex-1 rounded-2xl overflow-hidden flex flex-col items-start justify-end py-6 pl-6 pr-5 box-border gap-4 bg-cover bg-no-repeat bg-[top] text-left text-base text-[#fff] font-h5-24 transition-transform duration-300 relative ${className}`}
      style={testimonialItemsStyle}
    >
      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
      
      <div className="flex flex-row items-start justify-start gap-1 z-10">
        <Image
          className="h-5 w-5 relative overflow-hidden shrink-0"
          width={20}
          height={20}
          alt="Star rating"
          src="/icroundstar-1.svg"
        />
        <Image
          className="h-5 w-5 relative overflow-hidden shrink-0"
          width={20}
          height={20}
          alt="Star rating"
          src="/icroundstar-1.svg"
        />
        <Image
          className="h-5 w-5 relative overflow-hidden shrink-0"
          width={20}
          height={20}
          alt="Star rating"
          src="/icroundstar-1.svg"
        />
        <Image
          className="h-5 w-5 relative overflow-hidden shrink-0"
          width={20}
          height={20}
          alt="Star rating"
          src="/icroundstar-1.svg"
        />
        <Image
          className="h-5 w-5 relative overflow-hidden shrink-0"
          width={20}
          height={20}
          alt="Star rating"
          src="/icroundstar-1.svg"
        />
      </div>
      <div className="w-full max-w-[274px] relative leading-[150%] font-medium transition-transform duration-300 z-10">
        "{quote}"
      </div>
      <h2 className="m-0 self-stretch relative text-xl leading-[140%] font-semibold font-[inherit] mq750:text-[19px] mq750:leading-[27px] transition-transform duration-300 z-10">
        {author}
      </h2>
    </div>
  );
};

TestimonialItems.propTypes = {
  className: PropTypes.string,
  testimonialItemsBackgroundImage: PropTypes.string,
  author: PropTypes.string,
  quote: PropTypes.string,
};

export default TestimonialItems;