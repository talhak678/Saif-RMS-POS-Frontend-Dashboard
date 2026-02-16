
"use client";

import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSignUp = pathname?.includes("signup");

  return (
    <div className="relative min-h-screen w-full">
      <ThemeProvider>
        {/* Full-screen background image */}
        <div className="fixed inset-0 z-0">
          <Image
            src={
              isSignUp
                ? "/images/authentication-images/SIgn Up BG.jpeg"
                : "/images/authentication-images/Login BG.jpeg"
            }
            alt="Auth Background"
            fill
            className="object-cover"
            priority
          />
          {/* Subtle overlay to enhance form readability */}
          <div className="absolute inset-0 bg-black/30 dark:bg-black/60" />
        </div>

        {/* Centered form container */}
        <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
          {children}
        </div>

        <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </ThemeProvider>
    </div>
  );
}
