import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import BackToTop from '@/components/BackToTop';

export const metadata: Metadata = {
  title: 'Rho 投研 Agent',
  description: '智能股票投资研究助手',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background-500 font-sans antialiased">
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
        <BackToTop />
      </body>
    </html>
  );
}
