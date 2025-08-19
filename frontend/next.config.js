/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.clerk.dev"],
  },
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
};

module.exports = nextConfig;
