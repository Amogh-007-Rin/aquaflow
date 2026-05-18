import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Aquaflow",
  description: "Wastewater compliance intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#050d1a] text-[#e8f4ff]">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
