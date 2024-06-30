import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google'
import './globals.css'
 
const roboto = Roboto({
  weight: '400',
  subsets: ['latin'],
})

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
    <html lang="en" className={roboto.className}>
      <body>
        <Theme appearance="dark" accentColor="mint" grayColor="mauve">
          {children}
        </Theme>
      </body>
    </html>
  );
}
