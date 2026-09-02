import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Navbar from "../../components/navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Interwest Mechanical Contractors | Industrial Piping, HVAC & Conveyance",
  description:
    "Class A mechanical contractor specializing in high-purity process piping, heavy industrial refrigeration, commercial air handling, and packaging line setting.",
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${inter.variable} font-sans antialiased bg-[#0b0f19] min-h-[100svh] text-slate-100 selection:bg-[#0088ff] selection:text-white flex flex-col justify-between w-full overflow-x-hidden overscroll-none relative`}
    >
      <Navbar />
      <main className="flex-1 w-full flex flex-col relative">{children}</main>
    </div>
  );
}