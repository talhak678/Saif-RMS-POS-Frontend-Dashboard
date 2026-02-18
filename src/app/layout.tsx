import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';

import { Metadata } from "next";

import { Toaster } from 'sonner'


export const metadata: Metadata = {
  title: "PlatterOS - Modern POS & Restaurant Management System",
  description: "Advanced Restaurant Management System with Analytics, Inventory, and POS features.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
};

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
          <Toaster richColors={true} position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
