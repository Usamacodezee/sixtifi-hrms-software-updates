import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AnnouncementProvider } from '@/lib/announcement-store';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Helix HRMS — Updates & Announcements',
  description:
    'Enterprise HRMS software updates and announcements portal for providers and employees.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AnnouncementProvider>{children}</AnnouncementProvider>
      </body>
    </html>
  );
}
