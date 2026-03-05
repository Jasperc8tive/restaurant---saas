import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_RESTAURANT_NAME ?? "Restaurant",
  description: "Scan to order",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased bg-gray-50 min-h-screen`}>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
