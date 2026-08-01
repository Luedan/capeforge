import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b0f0d", color: "#f0cd75", border: "3px solid #d2a648", borderRadius: 16, fontSize: 25, fontFamily: "serif", fontWeight: 700 }}>CF</div>,
    size,
  );
}
