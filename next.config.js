/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['framer-motion', 'react-intersection-observer'],

  compress: true,
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'torando-stagging.s3.amazonaws.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'd1ynvtqfnieipx.cloudfront.net',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'dvpfmafpu47o8.cloudfront.net',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'torando.s3.us-east-1.amazonaws.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'thprolink.com',   // 👈 added this line
        pathname: '**',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      module: false,
      path: false,
    };
    return config;
  },
}

module.exports = nextConfig;
