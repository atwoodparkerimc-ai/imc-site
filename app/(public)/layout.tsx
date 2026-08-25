import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Navbar from "../../components/navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IMC Industrial Portal",
  description: "Safety, Catalog, and Incentive Management Portal",
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${inter.variable} font-sans antialiased bg-[#0e1117] min-h-screen text-slate-100`}>
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

