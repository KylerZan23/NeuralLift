import './globals.css';
import type { ReactNode } from 'react';
import { Space_Grotesk, DM_Sans } from 'next/font/google';
import { ToastProvider, ToastViewport } from '@/components/ui/toast';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], display: 'swap', variable: '--font-space-grotesk' });
const dmSans = DM_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-dm-sans' });

export const metadata = {
  title: 'NeuralLift',
  description: 'Science-based lifting tailored to you'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable} antialiased`}>
      <body className="font-sans">
        <ToastProvider>
          {children}
          <ToastViewport />
        </ToastProvider>
      </body>
    </html>
  );
}

