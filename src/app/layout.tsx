import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TopUPApp — Apple Gift Cards',
  description: 'Подарочные карты Apple для Турции, США и Казахстана',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body style={{ background: '#000', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
