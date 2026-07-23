import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          fontSize: 105,
          fontWeight: 800,
          color: "#0d3f63",
          fontFamily: "sans-serif",
        }}
      >
        P<span style={{ color: "#ff6b35" }}>.</span>
      </div>
    ),
    { ...size }
  );
}
