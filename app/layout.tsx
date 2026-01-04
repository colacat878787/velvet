import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SecurityGuard from '@/components/SecurityGuard';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Velvet',
  description: 'Anonymous Q&A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SecurityGuard />
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-[100px] opacity-40 animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-600 rounded-full blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
             <div className="absolute bottom-0 left-20 w-96 h-96 bg-pink-600 rounded-full blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>
        </div>
        {children}
      </body>
    </html>
  );
}