
"use client";

import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#e0e7ff] via-[#f3f4f6] to-[#fae8ff] dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <ThemeProvider>
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
