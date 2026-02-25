"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { Button } from "@/components/ui/button/Button";
import api from "@/services/api";

// 3 separate steps as per the API docs
type Step = "EMAIL" | "OTP" | "NEW_PASSWORD";

export default function ForgotPasswordForm() {
    const router = useRouter();

    const [step, setStep] = useState<Step>("EMAIL");

    // Step 1 – Email
    const [email, setEmail] = useState("");
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailError, setEmailError] = useState("");

    // Step 2 – OTP verify
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState("");
    const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

    // Step 3 – New password
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetError, setResetError] = useState("");

    // ──── STEP 1: Send OTP ────────────────────────────────────────────────────
    const handleSendOtp = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setEmailError("");
        if (!email) { setEmailError("Please enter your email address."); return; }
        try {
            setEmailLoading(true);
            const res = await api.post("/auth/forgot-password", { email });
            if (res.data?.success) {
                setStep("OTP");
                setOtp(["", "", "", "", "", ""]);
                setOtpError("");
            } else {
                setEmailError(res.data?.message || "Failed to send OTP. Try again.");
            }
        } catch (err: any) {
            setEmailError(err.response?.data?.message || "Failed to send OTP. Try again.");
        } finally {
            setEmailLoading(false);
        }
    };

    // ──── OTP INPUT HELPERS ───────────────────────────────────────────────────
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const updated = [...otp];
        updated[index] = value.slice(-1);
        setOtp(updated);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 6) { setOtp(pasted.split("")); otpRefs.current[5]?.focus(); }
        e.preventDefault();
    };

    // ──── STEP 2: Verify OTP ──────────────────────────────────────────────────
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setOtpError("");
        const otpCode = otp.join("");
        if (otpCode.length < 6) { setOtpError("Please enter the complete 6-digit OTP."); return; }
        try {
            setOtpLoading(true);
            const res = await api.post("/auth/verify-otp", { email, otp: otpCode });
            if (res.data?.success) {
                setStep("NEW_PASSWORD");
                setResetError("");
            } else {
                setOtpError(res.data?.message || "Invalid OTP. Please try again.");
            }
        } catch (err: any) {
            setOtpError(err.response?.data?.message || "Invalid or expired OTP.");
        } finally {
            setOtpLoading(false);
        }
    };

    // ──── STEP 3: Reset Password ──────────────────────────────────────────────
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetError("");
        if (!newPassword) { setResetError("Please enter a new password."); return; }
        if (newPassword.length < 6) { setResetError("Password must be at least 6 characters."); return; }
        if (newPassword !== confirmPassword) { setResetError("Passwords do not match."); return; }
        try {
            setResetLoading(true);
            const res = await api.post("/auth/reset-password", { email, newPassword });
            if (res.data?.success) {
                router.push("/signin");
            } else {
                setResetError(res.data?.message || "Failed to reset password.");
            }
        } catch (err: any) {
            setResetError(err.response?.data?.message || "Failed to reset password. Please try again.");
        } finally {
            setResetLoading(false);
        }
    };

    // Step indicator config
    const STEPS: Step[] = ["EMAIL", "OTP", "NEW_PASSWORD"];
    const currentIdx = STEPS.indexOf(step);

    return (
        <div className="w-full max-w-[480px] p-6 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-2xl bg-white/50 dark:bg-gray-900/50 border border-white/20 dark:border-white/10">

            {/* Logo */}
            <div className="flex justify-center mb-8">
                <Image src="/images/authentication-images/logo-black.png" alt="Logo" width={180} height={48} className="dark:hidden" />
                <Image src="/images/authentication-images/logo-white.png" alt="Logo" width={180} height={48} className="hidden dark:block" />
            </div>

            {/* Back link */}
            <div className="w-full mx-auto mb-5">
                {step === "OTP" ? (
                    <button
                        onClick={() => { setStep("EMAIL"); setOtp(["", "", "", "", "", ""]); setOtpError(""); }}
                        className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                        <ChevronLeftIcon /> Back
                    </button>
                ) : step === "NEW_PASSWORD" ? (
                    <button
                        onClick={() => { setStep("OTP"); setResetError(""); }}
                        className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                        <ChevronLeftIcon /> Back
                    </button>
                ) : (
                    <Link href="/signin" className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                        <ChevronLeftIcon /> Back to Sign In
                    </Link>
                )}
            </div>

            {/* ── STEP INDICATOR (3 bars) ─────────────────────── */}
            <div className="flex items-center gap-2 mb-7">
                {STEPS.map((s, i) => (
                    <div
                        key={s}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= currentIdx ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"
                            }`}
                    />
                ))}
            </div>

            {/* ═══════════════════════════════════════════════
          STEP 1 — Email
            ═══════════════════════════════════════════════ */}
            {step === "EMAIL" && (
                <form onSubmit={handleSendOtp}>
                    <div className="mb-6">
                        <h1 className="mb-1.5 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                            Forgot Password?
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enter your registered email and we&apos;ll send you a 6-digit OTP.
                        </p>
                    </div>
                    <div className="space-y-5">
                        {emailError && (
                            <div className="p-3 text-sm text-center text-red-600 bg-red-50 rounded-xl dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                                {emailError}
                            </div>
                        )}
                        <div>
                            <Label>Email <span className="text-error-500">*</span></Label>
                            <Input
                                type="email"
                                placeholder="info@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <Button className="w-full" size="sm" disabled={emailLoading}>
                            {emailLoading ? "Sending OTP..." : "Send OTP"}
                        </Button>
                    </div>
                </form>
            )}

            {/* ═══════════════════════════════════════════════
          STEP 2 — Verify OTP
            ═══════════════════════════════════════════════ */}
            {step === "OTP" && (
                <form onSubmit={handleVerifyOtp}>
                    <div className="mb-6">
                        <h1 className="mb-1.5 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                            Verify OTP
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enter the 6-digit code sent to{" "}
                            <span className="font-bold text-brand-500">{email}</span>
                        </p>
                    </div>
                    <div className="space-y-5">
                        {otpError && (
                            <div className="p-3 text-sm text-center text-red-600 bg-red-50 rounded-xl dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                                {otpError}
                            </div>
                        )}
                        {/* OTP digits */}
                        <div>
                            <Label className="mb-3 block">OTP Code</Label>
                            <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => { otpRefs.current[i] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        className="w-12 h-12 text-center text-xl font-black rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                                    />
                                ))}
                            </div>
                        </div>

                        <Button className="w-full" size="sm" disabled={otpLoading}>
                            {otpLoading ? "Verifying..." : "Verify OTP"}
                        </Button>

                        {/* Resend OTP */}
                        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                            Didn&apos;t receive the code?{" "}
                            <button
                                type="button"
                                onClick={() => handleSendOtp()}
                                disabled={emailLoading}
                                className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-semibold"
                            >
                                {emailLoading ? "Sending..." : "Resend OTP"}
                            </button>
                        </p>
                    </div>
                </form>
            )}

            {/* ═══════════════════════════════════════════════
          STEP 3 — New Password
            ═══════════════════════════════════════════════ */}
            {step === "NEW_PASSWORD" && (
                <form onSubmit={handleResetPassword}>
                    <div className="mb-6">
                        <h1 className="mb-1.5 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                            Set New Password
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            OTP verified! Now set your new password.
                        </p>
                    </div>
                    <div className="space-y-5">
                        {resetError && (
                            <div className="p-3 text-sm text-center text-red-600 bg-red-50 rounded-xl dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                                {resetError}
                            </div>
                        )}

                        {/* New password */}
                        <div>
                            <Label>New Password <span className="text-error-500">*</span></Label>
                            <div className="relative">
                                <Input
                                    type={showNew ? "text" : "password"}
                                    placeholder="Min. 6 characters"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <span
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                >
                                    {showNew ? <EyeIcon className="fill-gray-500 dark:fill-gray-400" /> : <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />}
                                </span>
                            </div>
                        </div>

                        {/* Confirm password */}
                        <div>
                            <Label>Confirm Password <span className="text-error-500">*</span></Label>
                            <div className="relative">
                                <Input
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <span
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                >
                                    {showConfirm ? <EyeIcon className="fill-gray-500 dark:fill-gray-400" /> : <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />}
                                </span>
                            </div>
                        </div>

                        <Button className="w-full" size="sm" disabled={resetLoading}>
                            {resetLoading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
