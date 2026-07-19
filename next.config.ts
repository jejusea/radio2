import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: process.env.GITHUB_ACTIONS ? "/radio2" : "",
  assetPrefix: process.env.GITHUB_ACTIONS ? "/radio2/" : undefined,
};

export default nextConfig;
