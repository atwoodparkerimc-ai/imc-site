import type { Viewport } from "next";
import "./globals.css";

export const metadata = {
  title: "IMC | Industrial Medical Contracting",
  description: "Precision Infrastructure for Medicine",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0b0f19",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#26292b] text-[#f1f0e8]">
        {children}
      </body>
    </html>
  );
}