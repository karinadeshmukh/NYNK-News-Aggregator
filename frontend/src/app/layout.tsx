import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'nynk. – the multi-perspective news intelligence platform',
  description: 'Understand news through every media perspective, detect coverage blindspots, and explore transparent journalism with AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-cream-100 text-slate-900 min-h-screen flex flex-col antialiased selection:bg-pink-200 selection:text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
