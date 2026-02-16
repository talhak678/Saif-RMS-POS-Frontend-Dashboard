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
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  return (
    <AuthProvider>
      <ProtectedRoute>
        <ModulesProvider>
          <SplashService>
            <div className="min-h-screen xl:flex w-full dark:bg-none bg-[url('https://plus.unsplash.com/premium_photo-1738619697183-fb5d92372576?q=80&w=1032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center bg-no-repeat">
              {/* Sidebar and Backdrop */}
              <AppSidebar />
              <Backdrop />
              {/* Main Content Area */}
              <div
                className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
              >
                {/* Header */}
                <AppHeader />
                {/* Page Content */}
                <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
              </div>
            </div>
          </SplashService>
        </ModulesProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
}
