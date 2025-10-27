/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this for ecommerce app integration
  // basePath: '/store', // or '/shop', '/ecommerce' - choose your preferred path
  
  // Your existing configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig