/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3-for-menu.s3.ap-northeast-1.amazonaws.com",
        pathname: "/next-s3-uploads/**",
      },
    ],
  },
};

export default nextConfig;
