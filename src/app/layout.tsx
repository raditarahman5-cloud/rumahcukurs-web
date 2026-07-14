import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rumah Cukurs",
  description: "sistem reservasi emo y2k.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased font-mono">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
