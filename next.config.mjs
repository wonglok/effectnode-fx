/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/dev/:path*/",
          // destination: `${process.env.NEXT_PUBLIC_BASE_URL}/dev/:path*/`,
          destination: `/api/hello`,
        },
      ];
    } else {
      return [];
    }
  },
  trailingSlash: true,
};

if (process.env.NODE_ENV === "development") {
  async function Run() {
    //
    //
  }
  Run();
}
export default nextConfig;
