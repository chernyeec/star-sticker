import type { Metadata, Viewport } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistration from "./ServiceWorkerRegistration";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Star Sticker",
  description: "Give and take away star stickers as rewards and consequences.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Star Sticker",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffb300",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={fredoka.variable}>
      <body>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
