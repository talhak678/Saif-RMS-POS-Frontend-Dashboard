"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, ChevronRight, Info, Loader2, Star } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button/Button";
import { toast } from "sonner";
import api from "@/services/api";

interface PlanPrice {
    id: string;
    plan: string;
    price: string;
    billingCycle: string;
    isActive: boolean;
    features: string[];
    restaurantId: string;
}

interface RenewModalProps {
    isOpen: boolean;
    onClose: () => void;
    restaurantId: string;
    currentPlan?: string;
}

const PLAN_ORDER = ["FREE", "BASIC", "PREMIUM", "ENTERPRISE"];
const PLAN_COLORS: Record<string, string> = {
    FREE: "from-gray-400 to-gray-500",
    BASIC: "from-blue-400 to-blue-600",
    PREMIUM: "from-brand-500 to-brand-700",
    ENTERPRISE: "from-purple-500 to-purple-700",
};
const PLAN_BADGE: Record<string, string> = {
    FREE: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    BASIC: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    PREMIUM: "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400",
    ENTERPRISE: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const RenewModal = ({ isOpen, onClose, restaurantId, currentPlan }: RenewModalProps) => {
    const [loading, setLoading] = useState(false);
    const [plansLoading, setPlansLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [plans, setPlans] = useState<PlanPrice[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<PlanPrice | null>(null);
    const [description, setDescription] = useState("");

    // Fetch subscription plans
    useEffect(() => {
        if (!isOpen) return;
        const fetchPlans = async () => {
            setPlansLoading(true);
            try {
                const res = await api.get("/subscription-prices");
                if (res.data?.success) {
                    const allPlans: PlanPrice[] = res.data.data || [];
                    // Sort by plan order and filter active ones
                    const sorted = allPlans
                        .filter((p) => p.isActive)
                        .sort((a, b) => PLAN_ORDER.indexOf(a.plan) - PLAN_ORDER.indexOf(b.plan));
                    setPlans(sorted);
                    // Pre-select the first plan that's higher than current
                    const currentIdx = PLAN_ORDER.indexOf(currentPlan || "FREE");
                    const nextPlan = sorted.find((p) => PLAN_ORDER.indexOf(p.plan) > currentIdx);
                    if (nextPlan) setSelectedPlan(nextPlan);
                    else if (sorted.length > 0) setSelectedPlan(sorted[0]);
                }
            } catch (error) {
                console.error("Failed to fetch plans", error);
                toast.error("Failed to load subscription plans");
            } finally {
                setPlansLoading(false);
            }
        };
        fetchPlans();
    }, [isOpen, currentPlan]);

    const handleSubmit = async () => {
        if (!selectedPlan) return;
        try {
            setLoading(true);
            const res = await api.post("/subscription-requests", {
                plan: selectedPlan.plan,
                billingCycle: selectedPlan.billingCycle,
                description,
                restaurantId,
            });
            if (res.data?.success) {
                toast.success("Upgrade request submitted! Super Admin will be notified.");
                setStep(3);
                setTimeout(() => { handleClose(); }, 3000);
            } else {
                toast.error(res.data?.message || "Failed to submit request");
            }
        } catch (error) {
            console.error("Submission error", error);
            toast.error("An error occurred during submission");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep(1);
        setDescription("");
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-2xl p-0 overflow-hidden rounded-3xl">
            <div className="bg-white dark:bg-gray-800">
                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/20">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                            {step === 3 ? "Request Sent!" : step === 2 ? "Confirm Upgrade" : "Renew / Upgrade Plan"}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                            {step === 1 ? `Current plan: ${currentPlan || "FREE"}` : step === 2 ? "Review your selection" : ""}
                        </p>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <div className="p-8 max-h-[75vh] overflow-y-auto">

                    {/* ── STEP 1: Choose Plan ── */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            {plansLoading ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                                </div>
                            ) : plans.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <p className="text-sm">No subscription plans available.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Plan Cards Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {plans.map((plan) => {
                                            const isCurrentPlan = plan.plan === currentPlan;
                                            const isSelected = selectedPlan?.id === plan.id;
                                            return (
                                                <button
                                                    key={plan.id}
                                                    onClick={() => !isCurrentPlan && setSelectedPlan(plan)}
                                                    disabled={isCurrentPlan}
                                                    className={`relative text-left rounded-2xl border-2 p-5 transition-all duration-200 ${isSelected
                                                            ? "border-brand-500 bg-brand-50/50 dark:bg-brand-900/10 shadow-lg shadow-brand-500/10"
                                                            : isCurrentPlan
                                                                ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 opacity-60 cursor-not-allowed"
                                                                : "border-gray-200 dark:border-gray-700 hover:border-brand-300 hover:shadow-md bg-white dark:bg-gray-800/50"
                                                        }`}
                                                >
                                                    {/* Plan header */}
                                                    <div className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-3 ${PLAN_BADGE[plan.plan] || PLAN_BADGE.BASIC}`}>
                                                        {plan.plan === "ENTERPRISE" && <Star size={10} />}
                                                        {plan.plan}
                                                    </div>

                                                    <div className="mb-3">
                                                        <span className="text-2xl font-black text-gray-900 dark:text-white">${plan.price}</span>
                                                        <span className="text-xs text-gray-400 font-medium ml-1">/{plan.billingCycle.toLowerCase()}</span>
                                                    </div>

                                                    {/* Features list */}
                                                    {plan.features?.length > 0 ? (
                                                        <ul className="space-y-1.5">
                                                            {plan.features.map((f, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                                    <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                                                                    {f}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-xs text-gray-400 italic">Basic access</p>
                                                    )}

                                                    {/* Selected tick */}
                                                    {isSelected && (
                                                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                                                            <CheckCircle2 size={12} className="text-white" />
                                                        </div>
                                                    )}
                                                    {isCurrentPlan && (
                                                        <div className="absolute top-3 right-3 text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                                            Current
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Optional note */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            Why are you upgrading? (Optional)
                                        </label>
                                        <textarea
                                            className="w-full h-20 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-900/50 focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition-all"
                                            placeholder="Tell us about your requirements..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />
                                    </div>

                                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 flex items-start gap-3">
                                        <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                                        <p className="text-[11px] text-blue-700 dark:text-blue-400 leading-relaxed font-medium">
                                            After submission, our Super Admin will review your request and update your plan.
                                        </p>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            onClick={() => setStep(2)}
                                            disabled={!selectedPlan}
                                            className="px-8 py-4 rounded-xl font-black text-xs gap-2 group"
                                        >
                                            Confirm Details <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ── STEP 2: Review & Submit ── */}
                    {step === 2 && selectedPlan && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="text-center space-y-1 pb-2">
                                <h4 className="text-lg font-bold dark:text-white">Review Request</h4>
                                <p className="text-xs text-gray-500">Please confirm your selection below.</p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 divide-y divide-gray-200/50 dark:divide-gray-800">
                                <div className="flex justify-between py-3">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Selected Plan</span>
                                    <span className={`text-xs font-black px-2.5 py-1 rounded-full ${PLAN_BADGE[selectedPlan.plan] || PLAN_BADGE.BASIC}`}>{selectedPlan.plan}</span>
                                </div>
                                <div className="flex justify-between py-3">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Price</span>
                                    <span className="text-sm font-black text-brand-600">${selectedPlan.price} / {selectedPlan.billingCycle.toLowerCase()}</span>
                                </div>
                                {selectedPlan.features?.length > 0 && (
                                    <div className="py-4">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Included Features</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {selectedPlan.features.map((f, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                    <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />{f}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {description && (
                                    <div className="py-3">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Note</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 italic">&quot;{description}&quot;</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col md:flex-row gap-3 pt-2">
                                <Button variant="outline" onClick={() => setStep(1)} disabled={loading} className="flex-1 rounded-xl font-bold border-gray-200 text-gray-500">
                                    Back to Plans
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    loading={loading}
                                    className="flex-[2] rounded-xl font-black uppercase text-[10px] tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    Submit Upgrade Request
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Success ── */}
                    {step === 3 && (
                        <div className="py-12 flex flex-col items-center text-center space-y-4 animate-in zoom-in duration-300">
                            <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/10">
                                <CheckCircle2 size={48} />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-gray-900 dark:text-white">Submission Successful!</h4>
                                <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">
                                    Our Super Admin has been notified. We will update your plan once the request is reviewed.
                                </p>
                            </div>
                            <Button variant="outline" onClick={handleClose} className="mt-8 rounded-xl px-10 border-gray-100">Close Window</Button>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default RenewModal;
