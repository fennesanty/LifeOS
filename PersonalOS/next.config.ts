import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // This project is deployed from a subfolder of a larger repo (other
  // unrelated projects live alongside it). Without this, Next.js's build
  // sometimes mis-infers the workspace root while walking up parent
  // directories, which can leak Node-only globals (__dirname) into the
  // Edge middleware bundle and crash it at runtime.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
