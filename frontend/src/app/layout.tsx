import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ShopBD — Production E-Commerce Platform',
    template: '%s | ShopBD',
  },
  description:
    'Reliable, premium online shopping platform in Bangladesh. Fast home delivery, cash on delivery, and secure bKash & Nagad payments.',
  keywords: ['e-commerce', 'bangladesh', 'online shopping', 'dhaka', 'cash on delivery', 'bKash'],
  authors: [{ name: 'ShopBD Engineering' }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_BD',
    url: 'https://shopbd.local',
    siteName: 'ShopBD',
    title: 'ShopBD — Production E-Commerce Platform',
    description: 'Fast home delivery & trusted online shopping across Bangladesh.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white dark:bg-slate-950 dark:text-slate-50"
      >
        {/* Skip to Content Link for Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
