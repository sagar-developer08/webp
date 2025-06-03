"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Navbar from "../../components/navbar";
import Content from "../../components/content";
import Form from "../../components/form";
import Blogs from "../../components/blogs";
import Footer from "../../components/footer";

const BlogDetails = () => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://0vm9jauvgc.execute-api.us-east-1.amazonaws.com/stag/api/blogs/${id}`);
      setBlog(response.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBlog();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="w-full relative [background:linear-gradient(#000,_#000),_#fff] text-white overflow-hidden flex flex-col items-center justify-center h-screen">
        <div>Loading blog...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full relative [background:linear-gradient(#000,_#000),_#fff] text-white overflow-hidden flex flex-col items-center justify-center h-screen">
        <div>Error loading blog: {error}</div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="w-full relative bg-[#fff] text-black overflow-hidden flex flex-col items-center justify-center h-screen">
        <div>Blog not found</div>
      </div>
    );
  }

  return (
    <div className="w-full relative bg-[#fff] text-black overflow-hidden flex flex-col items-start justify-start leading-[normal] tracking-[normal] text-center text-xs font-h5-24">
      <header className="mb-8">
        <Navbar
          logoSrc="/1623314804-bd8bf9c117ab50f7f842-1@2x.webp"
          search="/search3.svg"
          account="/account3.svg"
          sVG="/svg2.svg"
          navbarBackgroundColor={"rgba(0, 0, 0, 0.5)"}
        />
      </header>

      <section className="self-stretch flex flex-col items-center justify-start py-10 sm:py-20 px-4 sm:px-10 box-border gap-8 sm:gap-10 max-w-full text-left text-5xl text-black">
        <div className="w-full max-w-[1360px] flex flex-col items-start justify-start gap-4 sm:gap-6 px-4 sm:px-0">
          <h1 className="m-0 self-stretch relative text-4xl sm:text-6xl md:text-8xl lg:text-10xl leading-[140%] font-semibold font-inherit mt-5 sm:mt-0">
            {blog.title}
          </h1>
          <div className="self-stretch relative text-sm sm:text-base leading-[150%] font-medium text-black">
            Published on {new Date(blog.publishedAt).toLocaleDateString()}
          </div>
        </div>

        <div className="w-full max-w-[1360px] h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] relative rounded-2xl overflow-hidden mx-auto">
          <Image
            src={blog.featuredImage || "/cat2@3x.webp"}
            alt={blog.title}
            fill
            className="object-cover object-center"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1360px"
            priority
          />
        </div>
        
        <div className="w-full max-w-[1360px] flex flex-col items-start justify-start gap-6 sm:gap-10 px-4 sm:px-0 text-base text-black">
          <div className="self-stretch relative leading-[150%] font-medium text-sm sm:text-base">
            {blog.content.description}
          </div>

          {blog.content.sections.map((section, index) => (
            <div key={index} className="self-stretch flex flex-col items-start justify-start gap-3 sm:gap-4">
              <h3 className="m-0 relative text-lg sm:text-xl leading-[140%] font-semibold font-inherit text-black">
                {section.title}
              </h3>
              <div className="self-stretch relative leading-[150%] font-medium text-sm sm:text-base">
                {section.body}
              </div>
            </div>
          ))}
          
          <h2 className="m-0 self-stretch relative text-4xl sm:text-6xl md:text-8xl lg:text-10xl leading-[140%] font-semibold font-inherit">
            {blog.content.conclusion_title || "Conclusion"}
          </h2>
          <div className="self-stretch relative leading-[150%] font-medium text-sm sm:text-base">
            {blog.content.conclusion}
          </div>
        </div>
      </section>
      <Form />
      <Blogs
        relatedBlogs="Related Blogs"
        solararrowUpLinear="/solararrowuplinear1@2x.webp"
        solararrowUpLinear1="/solararrowuplinear-11@2x.webp"
        category="AUTOMATIC"
        category1="ANALOG"
        category2="DIGITAL"
        category3="VINTAGE"
      />
      <Footer
        footerAlignSelf="stretch"
        footerWidth="unset"
        maskGroup="/mask-group@2x.webp"
        iconYoutube="/icon--youtube3.svg"
        itemImg="/item--img4.svg"
        itemImg1="/item--img-14.svg"
        itemImg2="/item--img-24.svg"
      />
    </div>
  );
};

export default BlogDetails;