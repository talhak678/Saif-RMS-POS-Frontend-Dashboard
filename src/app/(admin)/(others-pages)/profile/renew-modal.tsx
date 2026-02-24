"use client";

import React, { useState } from "react";
import { X, CheckCircle2, ChevronRight, Info } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { toast } from "sonner";
import api from "@/services/api";

const PLAN_OPTIONS = [
    { label: "BASIC", value: "BASIC" },
    { label: "PREMIUM", value: "PREMIUM" },
    { label: "ENTERPRISE", value: "ENTERPRISE" },
];

const BILLING_CYCLE_OPTIONS = [
    { label: "MONTHLY", value: "MONTHLY" },
    { label: "YEARLY", value: "YEARLY" },
];

interface RenewModalProps {
    isOpen: boolean;
    onClose: () => void;
    restaurantId: string;
    currentPlan?: string;
}

const RenewModal = ({ isOpen, onClose, restaurantId, currentPlan }: RenewModalProps) => {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        plan: "PREMIUM",
        billingCycle: "MONTHLY",
        description: "",
    });

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const res = await api.post("/subscription-requests", {
                ...form,
                restaurantId,
            });

            if (res.data?.success) {
                toast.success("Upgrade request submitted! Super Admin will be notified.");
                setStep(3); // Success step
                setTimeout(() => {
                    handleClose();
                }, 3000);
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
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-xl p-0 overflow-hidden rounded-3xl">
            <div className="bg-white dark:bg-gray-800">
                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/20">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                            {step === 3 ? "Request Sent!" : "Upgrade Plan"}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">Select your desired plan and billing cycle</p>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Plan</Label>
                                    <Select
                                        options={PLAN_OPTIONS}
                                        defaultValue={form.plan}
                                        onChange={(val) => setForm({ ...form, plan: val })}
                                        className="h-12 rounded-xl border-gray-100 dark:border-gray-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Billing Cycle</Label>
                                    <Select
                                        options={BILLING_CYCLE_OPTIONS}
                                        defaultValue={form.billingCycle}
                                        onChange={(val) => setForm({ ...form, billingCycle: val })}
                                        className="h-12 rounded-xl border-gray-100 dark:border-gray-700"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Why are you upgrading? (Optional)</Label>
                                <textarea
                                    className="w-full h-24 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-900/50 focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition-all"
                                    placeholder="Tell us about your requirements..."
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </div>

                            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 flex items-start gap-3">
                                <Info size={18} className="text-blue-500 mt-0.5 shrink-0" />
                                <p className="text-[11px] text-blue-700 dark:text-blue-400 leading-relaxed font-medium">
                                    Your current plan is <span className="font-black underline">{currentPlan}</span>. After submission, our Super Admin will review your request and contact you.
                                </p>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button
                                    onClick={() => setStep(2)}
                                    className="px-8 py-4 rounded-xl font-black text-xs gap-2 group"
                                >
                                    Confirm Details <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="text-center space-y-2 pb-4">
                                <h4 className="text-lg font-bold dark:text-white">Review Request</h4>
                                <p className="text-xs text-gray-500">Please confirm your selection below.</p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 divide-y divide-gray-200/50 dark:divide-gray-800">
                                <div className="flex justify-between py-4">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">New Plan</span>
                                    <span className="text-sm font-black text-brand-600">{form.plan}</span>
                                </div>
                                <div className="flex justify-between py-4">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Billing cycle</span>
                                    <span className="text-sm font-black text-gray-800 dark:text-white uppercase">{form.billingCycle}</span>
                                </div>
                                {form.description && (
                                    <div className="py-4">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Requirement Note</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 italic">"{form.description}"</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col md:flex-row gap-3 pt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                    disabled={loading}
                                    className="flex-1 rounded-xl font-bold border-gray-200 text-gray-500"
                                >
                                    Back to Edit
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

                    {step === 3 && (
                        <div className="py-12 flex flex-col items-center text-center space-y-4 animate-in zoom-in duration-300">
                            <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/10">
                                <CheckCircle2 size={48} />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-gray-900 dark:text-white">Submission Successful!</h4>
                                <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">Our Super Admin has been notified. We will update your plan once the request is reviewed.</p>
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
