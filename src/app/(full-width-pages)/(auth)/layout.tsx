
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
    <div className={`relative min-h-screen w-full ${!isSignUp ? "bg-gradient-to-br from-[#e0e7ff] via-[#f3f4f6] to-[#fae8ff]" : ""}`}>
      <ThemeProvider>
        {/* Only show image BG for signup */}
        {isSignUp && (
          <div className="fixed inset-0 z-0">
            <Image
              src="/images/authentication-images/SIgn Up BG.jpeg"
              alt="Auth Background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/30 dark:bg-black/60" />
          </div>
        )}

        {/* Ultra-minimal container with zero gap */}
        <div className="relative z-10 flex min-h-screen items-center justify-center p-1 lg:p-2 w-full">
          <div className="w-full h-full flex items-center justify-center">
            {children}
          </div>
        </div>

        <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </ThemeProvider>
    </div>
  );
}
