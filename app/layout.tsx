import './globals.css';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { ToastProvider, ToastViewport } from '@/components/ui/toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'NeuralLift',
  description: 'Science-based lifting tailored to you'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <ToastProvider>
          {children}
          <ToastViewport />
        </ToastProvider>
      </body>
    </html>
  );
}

