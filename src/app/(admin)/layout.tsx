"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { ModulesProvider } from "@/services/modules.service";
import { AuthProvider } from "@/services/permission.service";
import { ProtectedRoute } from "@/services/protected-route";
import SplashService from "@/services/splash.service";
import React from "react";
import { Toaster } from "react-hot-toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[342px]"
      : "lg:ml-[102px]";

  return (
    <AuthProvider>
      <ProtectedRoute>
        <ModulesProvider>
          <SplashService>
            <Toaster position="top-right" />
            <div className="bg-[url('/images/authentication-images/background-3.png')] min-h-screen xl:flex w-full dark:bg-none  bg-cover bg-center bg-no-repeat">
              {/* Sidebar and Backdrop */}
              <AppSidebar />
              <Backdrop />
              {/* Main Content Area */}
              <div
                className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin} flex flex-col h-screen overflow-hidden pt-4`}
              >
                {/* Header Container */}
                <div className="flex-none">
                  <AppHeader />
                </div>

                {/* Page Content Container - Adjusted Padding to match header left spacing */}
                <div className="flex-1 px-4 lg:px-2 pt-2 pb-4 overflow-hidden">
                  {/* Internal Scrollable Glass Box */}
                  <div className="h-full bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl border border-white/20 dark:border-gray-800/30 rounded-[1.5rem] p-6 overflow-y-auto no-scrollbar shadow-2xl relative">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </SplashService>
        </ModulesProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
}
