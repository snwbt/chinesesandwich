import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Our Wedding",
  description: "Wedding website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-stone-800 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
