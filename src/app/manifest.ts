import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Star Sticker",
    short_name: "Star Sticker",
    description: "Give and take away star stickers as rewards and consequences.",
    start_url: "/",
    display: "standalone",
    background_color: "#81d4fa",
    theme_color: "#ffb300",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
