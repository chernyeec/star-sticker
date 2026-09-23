import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Star Sticker",
    short_name: "Star Sticker",
    description: "Give and take away star stickers as rewards and consequences.",
    start_url: "/",
    display: "standalone",
    background_color: "#a9e6da",
    theme_color: "#3a56b0",
    icons: [
      { src: "/icon.gif", sizes: "96x96", type: "image/gif", purpose: "any" },
      { src: "/icon.gif", sizes: "96x96", type: "image/gif", purpose: "maskable" },
    ],
  };
}
