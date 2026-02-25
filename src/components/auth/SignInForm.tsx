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


  // const isSuperAdmin = process.env.NEXT_PUBLIC_IS_SUPER_ADMIN_ONLY === 'true';


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
        const tokenKey = authService.getTokenKey();
        authService.setEncryptedCookie(tokenKey, res.data.data.token);

        console.log("Login successful:", res.data);
        router.push("/");
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
    <div className="w-full max-w-[550px] p-6 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-2xl bg-white/50 dark:bg-gray-900/50 border border-white/20 dark:border-white/10">
      <div className="flex justify-center mb-8">
        <Image
          src="/images/authentication-images/logo-black.png"
          alt="Logo"
          width={180}
          height={48}
          className="dark:hidden"
        />
        <Image
          src="/images/authentication-images/logo-white.png"
          alt="Logo"
          width={180}
          height={48}
          className="hidden dark:block"
        />
      </div>
      <div className="w-full mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center w-full mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            {/* 5. Connected Form */}
            <form onSubmit={handleLogin}>
              <div className="space-y-6">

                {/* Error Message Display */}
                {error && (
                  <div className="p-3 text-sm text-center text-red-500 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">
                    {error}
                  </div>
                )}

                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="info@gmail.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {/* <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div> */}
                  <Link
                    href="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>
                  <Button className="w-full" size="sm" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
                Don&apos;t have an account? {""}
                <Link
                  href="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}