import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mystery TRPG – Scene Sync",
  description: "GM × Player real-time background synchronisation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-black text-gray-300 min-h-screen">{children}</body>
    </html>
  );
}
