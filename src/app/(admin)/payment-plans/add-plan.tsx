"use client";

import React, { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import api from "@/services/api";
import { endpoints } from "@/types/environment";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Label from "@/components/form/Label";
import { Button } from "@/components/ui/button/Button";

const PLAN_OPTIONS = [
    { label: "FREE", value: "FREE" },
    { label: "BASIC", value: "BASIC" },
    { label: "PREMIUM", value: "PREMIUM" },
    { label: "ENTERPRISE", value: "ENTERPRISE" },
];

const BILLING_CYCLE_OPTIONS = [
    { label: "MONTHLY", value: "MONTHLY" },
    { label: "YEARLY", value: "YEARLY" },
];

const AddPlan = ({ onAction }: { onAction?: () => void }) => {
    const [form, setForm] = useState({
        plan: "PREMIUM",
        price: 0,
        billingCycle: "MONTHLY",
        restaurantId: "",
        isActive: true,
    });
    const [features, setFeatures] = useState<string[]>([]);
    const [featureInput, setFeatureInput] = useState("");
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [modal, setModal] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [loadingRestaurants, setLoadingRestaurants] = useState<boolean>(true);

    const addFeature = () => {
        const trimmed = featureInput.trim();
        if (trimmed && !features.includes(trimmed)) {
            setFeatures([...features, trimmed]);
        }
        setFeatureInput("");
    };

    const removeFeature = (idx: number) => {
        setFeatures(features.filter((_, i) => i !== idx));
    };

    const fetchRestaurants = async () => {
        try {
            const res = await api.get("/restaurants");
            if (res.data?.success) {
                setRestaurants(res.data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch restaurants", error);
        } finally {
            setLoadingRestaurants(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.restaurantId) {
            toast.error("Please select a restaurant");
            return;
        }

        try {
            setSaving(true);
            const res = await api.post(endpoints.addSubscriptionPrice, { ...form, features });
            if (res.data?.success) {
                toast.success("Payment plan added successfully!");
                onAction?.();
                setModal(false);
                setForm({
                    plan: "PREMIUM",
                    price: 0,
                    billingCycle: "MONTHLY",
                    restaurantId: "",
                    isActive: true,
                });
                setFeatures([]);
                setFeatureInput("");
            } else {
                toast.error(res.data?.message || "Failed to add payment plan");
            }
        } catch (err) {
            console.error("Add plan failed", err);
            toast.error("An error occurred while adding the payment plan");
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (modal) {
            fetchRestaurants();
        }
    }, [modal]);

    return (
        <>
            <Button onClick={() => setModal(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Add Plan
            </Button>

            <Modal
                isOpen={modal}
                onClose={() => setModal(false)}
                className="max-w-xl p-0 overflow-hidden"
            >
                <div className="flex flex-col h-full bg-white dark:bg-gray-800">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b px-6 py-4 dark:border-gray-700">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Add New Payment Plan
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Set subscription price for a restaurant.
                            </p>
                        </div>
                        <button
                            onClick={() => setModal(false)}
                            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto max-h-[70vh]">
                        <form id="add-plan-form" onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="flex flex-col">
                                    <Label>Restaurant *</Label>
                                    <Select
                                        options={restaurants.map((r) => ({
                                            label: r.name,
                                            value: r.id,
                                        }))}
                                        placeholder={loadingRestaurants ? "Loading restaurants..." : "Select restaurant"}
                                        onChange={(val) => setForm({ ...form, restaurantId: val })}
                                        defaultValue={form.restaurantId}
                                        required
                                        disabled={saving || loadingRestaurants}
                                        className="w-full"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <Label>Plan *</Label>
                                    <Select
                                        options={PLAN_OPTIONS}
                                        onChange={(val) => setForm({ ...form, plan: val })}
                                        defaultValue={form.plan}
                                        required
                                        disabled={saving}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Price ($) *"
                                        name="price"
                                        type="number"
                                        step={0.01}
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                                        placeholder="0.00"
                                        required
                                        disabled={saving}
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <Label>Billing Cycle *</Label>
                                    <Select
                                        options={BILLING_CYCLE_OPTIONS}
                                        onChange={(val) => setForm({ ...form, billingCycle: val })}
                                        defaultValue={form.billingCycle}
                                        required
                                        disabled={saving}
                                        className="w-full"
                                    />
                                </div>

                                {/* Features Input */}
                                <div className="col-span-2">
                                    <Label>Plan Features</Label>
                                    <div className="flex gap-2 mt-1">
                                        <input
                                            type="text"
                                            value={featureInput}
                                            onChange={(e) => setFeatureInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                                            placeholder="e.g. Unlimited Orders — press Enter or + to add"
                                            disabled={saving}
                                            className="flex-1 p-2.5 border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={addFeature}
                                            disabled={!featureInput.trim() || saving}
                                            className="px-3 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-40 transition-colors"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    {features.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {features.map((f, i) => (
                                                <span key={i} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full border border-brand-200 dark:border-brand-800">
                                                    {f}
                                                    <button type="button" onClick={() => removeFeature(i)} className="text-brand-400 hover:text-brand-700">
                                                        <X size={11} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="col-span-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.isActive}
                                            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 border-t bg-gray-50 px-6 py-4 dark:bg-gray-900/50 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={saving}
                            onClick={() => setModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            form="add-plan-form"
                            type="submit"
                            disabled={saving}
                            loading={saving}
                        >
                            Add Plan
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default AddPlan;
