import './globals.css';
import type { Metadata, Viewport } from 'next';
import Providers from '@/components/Providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { STORE_NAME } from '@/lib/config';

export const metadata: Metadata = {
  title: { default: STORE_NAME, template: `%s | ${STORE_NAME}` },
  description: `Shop online at ${STORE_NAME}. Pay by bank transfer and get your order delivered to your door.`,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
