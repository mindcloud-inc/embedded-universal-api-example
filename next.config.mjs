/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // No floating Next.js dev-tools badge over the demo UI.
  devIndicators: false,
  // Pin the tracing root to this folder so the build behaves the same whether
  // the example lives inside a larger repo or was copied out standalone.
  outputFileTracingRoot: import.meta.dirname
};

export default nextConfig;
