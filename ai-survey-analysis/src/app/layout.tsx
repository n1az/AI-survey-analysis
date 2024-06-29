import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ai Survey Analysis',
  description: 'Your app description',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Theme appearance="dark" accentColor="amber" grayColor="mauve">
          {children}
        </Theme>
      </body>
    </html>
  );
}
