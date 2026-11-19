import type { NextConfig } from "next";

// 舊版頁面已刪除（git tag legacy-before-cleanup），舊網址一律導回遊戲頁
const OLD_PATHS = [
  "/old-home", "/login", "/pricing", "/galaxy", "/planet", "/stage", "/practice",
  "/competition", "/universe", "/story", "/dev", "/admin",
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return OLD_PATHS.flatMap((p) => [
      { source: p, destination: "/play", permanent: false },
      { source: `${p}/:rest*`, destination: "/play", permanent: false },
    ]);
  },
};

export default nextConfig;
