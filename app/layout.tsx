import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Свадебное приглашение",
  description: "Персональное электронное приглашение на свадьбу",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
