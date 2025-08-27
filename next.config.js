/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  // Use default server rendering in dev to avoid export/runtime issues
  ...(isProd
    ? { output: 'export', images: { unoptimized: true }, trailingSlash: true }
    : {}),
};

module.exports = nextConfig;