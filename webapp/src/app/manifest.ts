import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PlayMate — 아이에게 맞는 운동을 찾는 가장 빠른 길",
    short_name: "PlayMate",
    description: "체육시설·강사·클럽팀을 비교하고 후기를 확인하고 등록까지.",
    start_url: "/",
    // "standalone"이면 iOS Safari가 어느 페이지에서 홈 화면에 추가하든 항상 이 manifest의
    // start_url("/")로만 실행해서, 클래스/시설 상세 링크를 홈 화면에 추가해도 전부 홈으로
    // 연결되는 문제가 있었다. "browser"로 바꾸면 홈 화면 추가가 일반 북마크처럼 동작해서
    // 실제로 추가한 그 페이지 주소로 열린다(대신 풀스크린 앱 크롬은 포기).
    display: "browser",
    background_color: "#141414",
    theme_color: "#141414",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
