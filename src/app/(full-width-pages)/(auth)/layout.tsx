
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
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#f0f4ff] via-[#f8fafc] to-[#f0f4ff] dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <ThemeProvider>
        {/* Fill the entire viewport */}
        <div className="relative z-10 w-full min-h-screen flex items-center justify-center">
            {children}
        </div>

        <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </ThemeProvider>
    </div>
  );
}
