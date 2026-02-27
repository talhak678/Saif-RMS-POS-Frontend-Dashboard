"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  ChevronRight,
  Info,
  Loader2,
  Star,
} from "lucide-react";
import api from "@/services/api";

interface PlanPrice {
  id: string;
  plan: string;
  price: string;
  billingCycle: string;
  isActive: boolean;
  features: string[];
}

const PLAN_ORDER = ["FREE", "BASIC", "PREMIUM", "ENTERPRISE"];
const PLAN_BADGE: Record<string, string> = {
  FREE: "bg-gray-400/20 text-gray-600 dark:text-gray-400",
  BASIC: "bg-blue-400/20 text-blue-600 dark:text-blue-400",
  PREMIUM: "bg-brand-500/20 text-brand-600 dark:text-brand-400",
  ENTERPRISE: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
};

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // Multi-step: 1 = account info, 2 = choose plan, 3 = contact info, 4 = review, 5 = success
  const [step, setStep] = useState(1);

  // Step 1 – account form
  const [form, setForm] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
  });

  // Step 2 – plans
  const [plans, setPlans] = useState<PlanPrice[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanPrice | null>(null);

  // Step 3 – contact info
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [description, setDescription] = useState("");

  // Submission
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Move from step 1 → step 2 and pre-fill contact info
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fname || !form.lname || !form.email || !form.password) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!isChecked) {
      toast.error("Please agree to the Terms and Conditions");
      return;
    }

    // Pre-fill contact info from the account form
    setContactInfo({
      name: `${form.fname} ${form.lname}`,
      email: form.email,
      phone: "",
    });
    setDescription("");

    // Fetch plans and move to step 2
    fetchPlans();
    setStep(2);
  };

  const fetchPlans = async () => {
    setPlansLoading(true);
    try {
      const res = await api.get("/subscription-prices");
      if (res.data?.success) {
        const allPlans: PlanPrice[] = res.data.data || [];
        const sorted = allPlans
          .filter((p) => p.isActive)
          .sort(
            (a, b) => PLAN_ORDER.indexOf(a.plan) - PLAN_ORDER.indexOf(b.plan)
          );
        setPlans(sorted);
        if (sorted.length > 0) setSelectedPlan(sorted[0]);
      }
    } catch (error) {
      console.error("Failed to fetch plans", error);
      toast.error("Failed to load subscription plans");
    } finally {
      setPlansLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPlan) return;
    try {
      setSubmitting(true);
      const res = await api.post("/subscription-requests", {
        plan: selectedPlan.plan,
        billingCycle: selectedPlan.billingCycle,
        description: description || "New registration request",
        contactName: contactInfo.name,
        contactEmail: contactInfo.email,
        contactPhone: contactInfo.phone,
      });

      if (res.data?.success) {
        toast.success(
          "Subscription request submitted! Our team will contact you soon."
        );
        setStep(5);
      } else {
        toast.error(res.data?.message || "Failed to submit request");
      }
    } catch (error: any) {
      console.error("Submission error", error);
      toast.error(
        error.response?.data?.message || "An error occurred during submission"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Step indicator labels
  const stepLabels = [
    "Account",
    "Plan",
    "Contact",
    "Review",
  ];

  return (
    <div className="w-full max-w-[600px] p-6 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-2xl bg-white/50 dark:bg-gray-900/50 border border-white/20 dark:border-white/10 my-10">

      {/* Logo */}
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

      {/* Back to dashboard – only on step 1 */}
      {step === 1 && (
        <div className="w-full mx-auto mb-5">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon />
            Back to dashboard
          </Link>
        </div>
      )}

      {/* Step Indicator (steps 2-4) */}
      {step >= 2 && step <= 4 && (
        <div className="flex items-center justify-between mb-8">
          {stepLabels.map((label, i) => {
            const s = i + 1;
            const active = step === s + 1; // step 2 = Plan (index 1), etc.
            // map: label index 0→step1 (account done), 1→step2(plan), 2→step3(contact), 3→step4(review)
            const done = step > s + 1;
            const isCurrent = step === s + 1;
            return (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done || s === 0
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                          ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                      }`}
                  >
                    {done ? <CheckCircle2 size={16} /> : s + 1}
                  </div>
                  <span
                    className={`text-[10px] font-semibold ${isCurrent
                        ? "text-brand-600 dark:text-brand-400"
                        : "text-gray-400"
                      }`}
                  >
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 rounded ${step > s + 1
                        ? "bg-emerald-400"
                        : "bg-gray-200 dark:bg-gray-700"
                      }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* ───────────────────────────── STEP 1: Account Info ───────────────────────────── */}
      {step === 1 && (
        <div className="flex flex-col justify-center w-full mx-auto">
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your details to create an account and choose a plan!
            </p>
          </div>

          <form onSubmit={handleSignup}>
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <Label>
                    First Name<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="fname"
                    name="fname"
                    value={form.fname}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="sm:col-span-1">
                  <Label>
                    Last Name<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="lname"
                    name="lname"
                    value={form.lname}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <Label>
                  Email<span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Label>
                  Password<span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Enter your password"
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    type={showPassword ? "text" : "password"}
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

              <div className="flex items-center gap-3">
                <Checkbox
                  className="w-5 h-5 cursor-pointer"
                  checked={isChecked}
                  onChange={setIsChecked}
                />
                <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                  By creating an account means you agree to the{" "}
                  <span className="text-gray-800 dark:text-white/90 underline cursor-pointer">
                    Terms and Conditions,
                  </span>{" "}
                  and our{" "}
                  <span className="text-gray-800 dark:text-white underline cursor-pointer">
                    Privacy Policy
                  </span>
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 active:scale-[0.98]"
                >
                  Continue — Choose Plan <ChevronRight size={18} className="ml-2" />
                </button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-brand-500 font-bold hover:text-brand-600 dark:text-brand-400"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* ───────────────────────────── STEP 2: Choose Plan ───────────────────────────── */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
              Choose a Plan
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select the subscription plan that suits your restaurant.
            </p>
          </div>

          {plansLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p>No subscription plans found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {plans.map((plan) => {
                  const isSelected = selectedPlan?.id === plan.id;
                  return (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`group relative text-left rounded-2xl border-2 p-6 transition-all duration-300 ${isSelected
                          ? "border-brand-500 bg-brand-500/5 dark:bg-brand-500/10 shadow-xl shadow-brand-500/10 scale-[1.02]"
                          : "border-gray-200/50 dark:border-white/5 hover:border-brand-300 dark:hover:border-brand-500/50 hover:bg-white/40 dark:hover:bg-white/5"
                        }`}
                    >
                      <div
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg mb-4 ${PLAN_BADGE[plan.plan] || PLAN_BADGE.BASIC
                          }`}
                      >
                        {plan.plan === "ENTERPRISE" && (
                          <Star size={12} className="fill-current" />
                        )}
                        {plan.plan}
                      </div>
                      <div className="mb-4">
                        <span className="text-3xl font-black text-gray-900 dark:text-white">
                          ${plan.price}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium ml-1">
                          /{plan.billingCycle.toLowerCase()}
                        </span>
                      </div>
                      {plan.features?.length > 0 ? (
                        <ul className="space-y-2.5">
                          {plan.features.slice(0, 4).map((f, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-300"
                            >
                              <div className="shrink-0 w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <CheckCircle2 size={10} className="text-emerald-500" />
                              </div>
                              {f}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          Essential business tools
                        </p>
                      )}
                      {isSelected && (
                        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/40">
                          <CheckCircle2 size={14} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedPlan}
                  className="flex-[2] px-10 py-3.5 rounded-xl font-bold text-sm bg-brand-500 text-white flex items-center justify-center gap-2 transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/30 active:scale-95 disabled:opacity-50"
                >
                  Next Step <ChevronRight size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ───────────────────────────── STEP 3: Contact Info ───────────────────────────── */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
              Contact Information
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Provide your business contact details.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Full Name / Business Owner</Label>
              <Input
                placeholder="e.g. John Doe"
                value={contactInfo.name}
                onChange={(e) =>
                  setContactInfo({ ...contactInfo, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Business Email</Label>
              <Input
                placeholder="e.g. contact@restaurant.com"
                type="email"
                value={contactInfo.email}
                onChange={(e) =>
                  setContactInfo({ ...contactInfo, email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Contact Number</Label>
            <Input
              placeholder="e.g. +92 300 1234567"
              value={contactInfo.phone}
              onChange={(e) =>
                setContactInfo({ ...contactInfo, phone: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Business Details (Optional)</Label>
            <textarea
              className="w-full h-28 p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition-all"
              placeholder="Tell us a bit about your restaurant or any specific requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5 transition-all"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (!contactInfo.name || !contactInfo.email || !contactInfo.phone) {
                  toast.error("Please fill all required business contact fields");
                  return;
                }
                setStep(4);
              }}
              className="flex-[2] py-3.5 rounded-xl font-bold text-sm bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/20 active:scale-95 transition-all"
            >
              Review Request
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────────── STEP 4: Review ───────────────────────────── */}
      {step === 4 && selectedPlan && (
        <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
              Review Request
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Double-check your registration details before submitting.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200/50 dark:border-white/5 pb-3">
              <span className="text-xs font-bold text-gray-500 uppercase">
                Selected Plan
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-lg ${PLAN_BADGE[selectedPlan.plan] || PLAN_BADGE.BASIC
                  }`}
              >
                {selectedPlan.plan}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200/50 dark:border-white/5 pb-3">
              <span className="text-xs font-bold text-gray-500 uppercase">
                Billing
              </span>
              <span className="text-sm font-bold text-brand-600">
                ${selectedPlan.price} / {selectedPlan.billingCycle.toLowerCase()}
              </span>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase block">
                Contact Details
              </span>
              <div className="p-3.5 rounded-xl bg-white/50 dark:bg-black/20 text-sm space-y-1">
                <p className="font-bold text-gray-800 dark:text-white/90">
                  {contactInfo.name}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {contactInfo.email}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {contactInfo.phone}
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 flex gap-3">
            <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
              Our team will verify your business details. Approved requests
              typically receive access within 24 hours.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setStep(3)}
              disabled={submitting}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5 transition-all"
            >
              Edit
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-[2] py-3.5 rounded-xl font-bold text-sm bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center"
            >
              {submitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                "Confirm & Send Request"
              )}
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────────── STEP 5: Success ───────────────────────────── */}
      {step === 5 && (
        <div className="py-16 flex flex-col items-center text-center space-y-6 animate-in zoom-in duration-500">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-500/20">
            <CheckCircle2 size={56} />
          </div>
          <div className="space-y-2">
            <h4 className="text-3xl font-bold text-gray-800 dark:text-white">
              All Set!
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Your request has been sent for review. Check your email for status
              updates over the next 24 hours.
            </p>
          </div>
          <Link
            href="/signin"
            className="mt-6 px-12 py-3.5 rounded-xl font-bold text-sm bg-gray-800 dark:bg-white text-white dark:text-gray-900 transition-all hover:opacity-90 active:scale-95 shadow-xl"
          >
            Go to Sign In
          </Link>
        </div>
      )}
    </div>
  );
}
