"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, ChevronRight, Info, Loader2, Star } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button/Button";
import { toast } from "sonner";
import api from "@/services/api";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

interface PlanPrice {
    id: string;
    plan: string;
    price: string;
    billingCycle: string;
    isActive: boolean;
    features: string[];
}

interface SubscriptionRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialContact?: {
        name: string;
        email: string;
        phone: string;
        description: string;
    };
}

const PLAN_ORDER = ["FREE", "BASIC", "PREMIUM", "ENTERPRISE"];
const PLAN_BADGE: Record<string, string> = {
    FREE: "bg-gray-400/20 text-gray-600 dark:text-gray-400",
    BASIC: "bg-blue-400/20 text-blue-600 dark:text-blue-400",
    PREMIUM: "bg-brand-500/20 text-brand-600 dark:text-brand-400",
    ENTERPRISE: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
};

const SubscriptionRequestModal = ({ isOpen, onClose, initialContact }: SubscriptionRequestModalProps) => {
    const [loading, setLoading] = useState(false);
    const [plansLoading, setPlansLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [plans, setPlans] = useState<PlanPrice[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<PlanPrice | null>(null);
    const [description, setDescription] = useState("");

    const [contactInfo, setContactInfo] = useState({
        name: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        if (isOpen && initialContact) {
            setContactInfo({
                name: initialContact.name || "",
                email: initialContact.email || "",
                phone: initialContact.phone || "",
            });
            setDescription("");
        }
    }, [initialContact, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const fetchPlans = async () => {
            setPlansLoading(true);
            try {
                const res = await api.get("/subscription-prices");
                if (res.data?.success) {
                    const allPlans: PlanPrice[] = res.data.data || [];
                    const sorted = allPlans
                        .filter((p) => p.isActive)
                        .sort((a, b) => PLAN_ORDER.indexOf(a.plan) - PLAN_ORDER.indexOf(b.plan));
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
        fetchPlans();
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!selectedPlan) return;
        try {
            setLoading(true);
            const res = await api.post("/subscription-requests", {
                plan: selectedPlan.plan,
                billingCycle: selectedPlan.billingCycle,
                description: description || "New registration request",
                contactName: contactInfo.name,
                contactEmail: contactInfo.email,
                contactPhone: contactInfo.phone,
            });

            if (res.data?.success) {
                toast.success("Subscription request submitted! Our team will contact you soon.");
                setStep(4);
            } else {
                toast.error(res.data?.message || "Failed to submit request");
            }
        } catch (error: any) {
            console.error("Submission error", error);
            toast.error(error.response?.data?.message || "An error occurred during submission");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        setStep(1);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            className="max-w-2xl p-0 overflow-hidden rounded-3xl z-[9999] backdrop-blur-2xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-white/10"
        >
            <div className="relative">
                {/* Modal Header */}
                <div className="px-8 py-8 border-b border-gray-200/20 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                            {step === 4 ? "Request Sent!" : step === 3 ? "Review Request" : step === 2 ? "Contact Data" : "Choose Plan"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {step === 1 ? "Select a subscription plan for your restaurant" : step === 2 ? "Provide business contact information" : step === 3 ? "Double check your registration details" : ""}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2.5 hover:bg-gray-200/50 dark:hover:bg-white/5 rounded-xl transition-colors"
                    >
                        <X size={22} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">

                    {/* STEP 1: Choose Plan */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                                                    <div className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg mb-4 ${PLAN_BADGE[plan.plan] || PLAN_BADGE.BASIC}`}>
                                                        {plan.plan === "ENTERPRISE" && <Star size={12} className="fill-current" />}
                                                        {plan.plan}
                                                    </div>
                                                    <div className="mb-4">
                                                        <span className="text-3xl font-black text-gray-900 dark:text-white">${plan.price}</span>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium ml-1">/{plan.billingCycle.toLowerCase()}</span>
                                                    </div>
                                                    {plan.features?.length > 0 ? (
                                                        <ul className="space-y-2.5">
                                                            {plan.features.slice(0, 4).map((f, i) => (
                                                                <li key={i} className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-300">
                                                                    <div className="shrink-0 w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                                        <CheckCircle2 size={10} className="text-emerald-500" />
                                                                    </div>
                                                                    {f}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-sm text-gray-400 italic">Essential business tools</p>
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
                                    <div className="flex justify-end pt-5">
                                        <button
                                            onClick={() => setStep(2)}
                                            disabled={!selectedPlan}
                                            className="px-10 py-3.5 rounded-xl font-bold text-sm bg-brand-500 text-white flex items-center gap-2 transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/30 active:scale-95 disabled:opacity-50"
                                        >
                                            Next Step <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* STEP 2: Contact Info */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Full Name / Business Owner</Label>
                                    <Input
                                        placeholder="e.g. John Doe"
                                        value={contactInfo.name}
                                        onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Business Email</Label>
                                    <Input
                                        placeholder="e.g. contact@restaurant.com"
                                        type="email"
                                        value={contactInfo.email}
                                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Contact Number</Label>
                                <Input
                                    placeholder="e.g. +92 300 1234567"
                                    value={contactInfo.phone}
                                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
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
                            <div className="flex items-center gap-4 pt-4">
                                <button
                                    onClick={() => setStep(1)}
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
                                        setStep(3);
                                    }}
                                    className="flex-[2] py-3.5 rounded-xl font-bold text-sm bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/20 active:scale-95 transition-all"
                                >
                                    Review Request
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Review */}
                    {step === 3 && selectedPlan && (
                        <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-6 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 space-y-4">
                                <div className="flex justify-between items-center border-b border-gray-200/50 dark:border-white/5 pb-3">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Selected Plan</span>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-lg ${PLAN_BADGE[selectedPlan.plan] || PLAN_BADGE.BASIC}`}>{selectedPlan.plan}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-200/50 dark:border-white/5 pb-3">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Billing</span>
                                    <span className="text-sm font-bold text-brand-600">${selectedPlan.price} / {selectedPlan.billingCycle.toLowerCase()}</span>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase block">Contact Details</span>
                                    <div className="p-3.5 rounded-xl bg-white/50 dark:bg-black/20 text-sm space-y-1">
                                        <p className="font-bold text-gray-800 dark:text-white/90">{contactInfo.name}</p>
                                        <p className="text-gray-600 dark:text-gray-400">{contactInfo.email}</p>
                                        <p className="text-gray-600 dark:text-gray-400">{contactInfo.phone}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-5 py-4 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 flex gap-3">
                                <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                                    Our team will verify your business details. Approved requests typically receive access within 24 hours.
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setStep(2)}
                                    disabled={loading}
                                    className="flex-1 py-3.5 rounded-xl font-bold text-sm border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5 transition-all"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex-[2] py-3.5 rounded-xl font-bold text-sm bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center"
                                >
                                    {loading ? <Loader2 size={20} className="animate-spin" /> : "Confirm & Send Request"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Success */}
                    {step === 4 && (
                        <div className="py-16 flex flex-col items-center text-center space-y-6 animate-in zoom-in duration-500">
                            <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-500/20">
                                <CheckCircle2 size={56} />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-3xl font-bold text-gray-800 dark:text-white">All Set!</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                    Your request has been sent for review. Check your email for status updates over the next 24 hours.
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="mt-6 px-12 py-3.5 rounded-xl font-bold text-sm bg-gray-800 dark:bg-white text-white dark:text-gray-900 transition-all hover:opacity-90 active:scale-95 shadow-xl"
                            >
                                Back to Website
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default SubscriptionRequestModal;
