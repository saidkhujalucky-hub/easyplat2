import type { Metadata } from "next";
import "./globals.css";
import "./details.css";
import { LanguageProvider } from "./I18n";

export const metadata: Metadata = {
  title: "Easy Plast — упаковка под ваш размер",
  description: "Полиэтиленовая упаковка для воды, печенья, брокколи и ковров. Выберите размер, цвет и толщину. Оформите заявку с доставкой.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased"><LanguageProvider>{children}</LanguageProvider></body>
    </html>
  );
}
