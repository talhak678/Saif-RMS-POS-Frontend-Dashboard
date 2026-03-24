import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Script from 'next/script';

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
      <head>
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '890903417279147');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=890903417279147&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
          <Toaster richColors={true} position="top-center" toastOptions={{ style: { zIndex: 999999 } }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
