import Image from "next/image";
import PropTypes from "prop-types";

const R1 = ({ className = "", product }) => {

  const handleSocialIcons = (path) => {
    window.open(path, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={`self-stretch flex flex-row items-start justify-between !pt-4 !pb-4 !pl-0 !pr-0 gap-0 text-left text-base text-[#000] font-H5-24 mq750:flex-wrap ${className}`}
    >
      <div className="flex flex-row items-center justify-start gap-2">
        <Image
          className="w-[18px] relative h-[18px] overflow-hidden shrink-0"
          width={18}
          height={18}
          alt=""
          src="/materialsymbolsinfooutlinerounded.svg"
        />
        <div className="relative leading-[150%] font-medium">
          Ask a question
        </div>
      </div>
      <div className="flex flex-row items-center justify-start gap-2">
        <Image
          className="w-[18px] relative h-[18px] overflow-hidden shrink-0"
          width={18}
          height={18}
          alt=""
          src="/solarboxlinear.svg"
        />
        <div className="relative leading-[150%] font-medium">
          Delivery Return
        </div>
      </div>
      <div className="flex flex-row items-center justify-start gap-[7px]">
        <Image
          className="w-[18px] relative rounded-[100px] h-[18px] overflow-hidden shrink-0"
          width={18}
          height={18}
          alt=""
          src="/hugeiconstick02.svg"
        />
        <div className="relative leading-[150%] font-medium">
          1 Year Warranty
        </div>
      </div>
      <div className="flex flex-row items-center justify-start gap-[7px]">
        <div className="relative leading-[150%] font-medium">Share:</div>
        <div className="flex flex-row items-center justify-start gap-4">
          <Image
            className="w-[18px] relative h-[18px] object-cover"
            width={18}
            height={18}
            alt=""
            src="/symbolpng@2x.webp"
            onClick={() =>
              handleSocialIcons(
                "https://www.instagram.com/tornado.watches/"
              )
            }
          />
          <Image
            className="h-[18px] w-[18px] relative object-cover"
            width={18}
            height={18}
            alt=""
            src="/symbolpng-1@2x.webp"
            onClick={() =>
              handleSocialIcons(
                "https://www.facebook.com/people/Tornado-World/61556313113779/"
              )
            }
          />
          <Image
            className="w-[18px] relative h-[18px] object-cover"
            width={18}
            height={18}
            alt=""
            src="/x-logopng@2x.webp"
            onClick={() =>
              handleSocialIcons(
                "https://x.com/tornadowatches"
              )
            }
          />
          <Image
            className="h-[18px] w-[18px] relative object-cover"
            width={18}
            height={18}
            alt=""
            src="/symbolpng-2@2x.webp"
            onClick={() => handleSocialIcons("https://api.whatsapp.com/send/?phone=971505057445&text=Hi&type=phone_number&app_absent=0")}
          />
        </div>
      </div>
    </div>
  );
};

R1.propTypes = {
  className: PropTypes.string,
};

export default R1;
