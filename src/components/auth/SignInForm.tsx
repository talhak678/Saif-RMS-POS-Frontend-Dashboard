"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { Button } from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation"; // 1. Import Router
import api from "@/services/api"; // 2. Import your API instance
import { AuthServiceInstance } from "@/services/auth.service";
import Router from "next/navigation";
export default function SignInForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // 3. States for inputs and loading/error
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const isSuperAdmin = process.env.NEXT_PUBLIC_IS_SUPER_ADMIN_ONLY === 'true';


  // 4. Handle Login Function
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear previous errors

    try {
      // API Call using your axios instance
      const res = await api.post("/auth/login", {
        email: email,
        password: password,
      });

      // Assuming your API returns success, redirect to dashboard

      if (res.data.success) {
        // Save token using AuthService (which handles encryption and cookies)
        const authService = AuthServiceInstance();
        const token = res.data.data.token;
        const decoded = authService.decryptToken(token);
        const userRole = decoded.role;

        // Check for role mismatch based on URL type
        if (isSuperAdmin && userRole !== 'SUPER_ADMIN') {
          setError("This login page is for Super Admins only.");
          setLoading(false);
          return;
        }

        if (!isSuperAdmin && userRole === 'SUPER_ADMIN') {
          setError("Super Admins cannot sign in through this portal.");
          setLoading(false);
          return;
        }

        const tokenKey = authService.getTokenKey();
        authService.setEncryptedCookie(tokenKey, token);

        console.log("Login successful:", res.data);
        window.location.replace("/");
        // Using location replace to ensure clean state and bypass router issues
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      // Set error message based on API response or default message
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full gap-0 items-stretch h-screen ">
      
      {/* Left side: Image Box - Stretched to fill */}
      <div className="relative hidden lg:block lg:w-[62%] h-[900px] rounded-3xl overflow-hidden shadow-2xl">
        <Image
          src="/images/authentication-images/image.png"
          alt="Sign In Illustration"
          fill
          className="object-cover"
          priority
        />
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Right side: Form Container */}
      <div className="flex items-center justify-center w-full lg:w-[38%] p-6 sm:p-8">
        {/* Form Card - Balanced & Balanced */}
        <div className="w-full max-w-[460px] p-8 sm:p-10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/40 dark:border-white/10">
          <div className="flex justify-center mb-8">
            <Image
              src="/images/authentication-images/logo-black.png"
              alt="Logo"
              width={160}
              height={42}
              className="dark:hidden"
            />
            <Image
              src="/images/authentication-images/logo-white.png"
              alt="Logo"
              width={160}
              height={42}
              className="hidden dark:block"
            />
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Enter your email and password to sign in!
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 text-sm font-medium text-center text-red-600 bg-red-50 rounded-xl border border-red-100 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <Label className="mb-1.5 ml-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="admin@example.com"
                type="email"
                className="h-11 rounded-xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Label className="mb-1.5 ml-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                type="password"
                placeholder="••••••••••"
                className="h-11 rounded-xl"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end">
              <Link
                href="/reset-password"
                className="text-sm font-bold text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Forgot password?
              </Link>
            </div>

            <Button className="w-full h-11 text-sm font-bold rounded-xl" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {!isSuperAdmin && (
            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-400">
                Don&apos;t have an account? {" "}
                <Link
                  href="/signup"
                  className="text-brand-600 hover:text-brand-700 dark:text-brand-400 font-bold"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
