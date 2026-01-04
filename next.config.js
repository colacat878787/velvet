/** @type {import('next').NextConfig} */
const nextConfig = {
  // 允許讀取外部圖片 (例如 Dicebear 頭像)
  images: {
    domains: ['api.dicebear.com'], 
  },
};

module.exports = nextConfig;