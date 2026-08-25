import "./globals.css";

export const metadata = {
  title: "IMC | Industrial Medical Contracting",
  description: "Precision Infrastructure for Medicine",
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