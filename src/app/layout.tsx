import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TopUPApp — Подарочные карты Apple',
  description: 'Покупай подарочные карты Apple для Турции, США и Казахстана',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-[var(--tg-theme-bg-color, #1c1c1e)] text-[var(--tg-theme-text-color, #ffffff)] min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
