import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Supabase Storage(class-images, facility-covers 등)에서 서빙되는 이미지를
    // next/image로 최적화(리사이즈/압축/lazy-loading)하기 위해 허용 도메인으로 등록.
    // 프로젝트 ref 서브도메인이 환경별로 달라질 수 있어 *.supabase.co로 넓게 허용.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
      // 강사 프로필 사진 시드 데이터가 pravatar.cc 플레이스홀더를 사용 중 (supabase/seed.sql).
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
