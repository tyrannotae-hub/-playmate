import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PlayMate — 아이에게 맞는 운동을 찾는 가장 빠른 길",
    short_name: "PlayMate",
    description: "체육시설·강사·클럽팀을 비교하고 후기를 확인하고 등록까지.",
    start_url: "/",
    display: "standalone",
    background_color: "#141414",
    theme_color: "#141414",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
