"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import {
    X,
    LayoutGrid,
    Utensils,
    Calendar,
    Hash,
    AlignLeft,
    Package,
    DollarSign,
    Tag,
    ChevronRight,
} from "lucide-react";

interface CategoryDetailModalProps {
    categoryId: string | null;
    onClose: () => void;
}

export default function CategoryDetailModal({
    categoryId,
    onClose,
}: CategoryDetailModalProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!categoryId) return;
        setData(null);
        setLoading(true);
        api
            .get(`/categories/${categoryId}`)
            .then((res) => {
                if (res.data?.success) setData(res.data.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [categoryId]);

    if (!categoryId) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Slide-in Panel */}
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col bg-white dark:bg-gray-900 shadow-2xl animate-slide-in-right">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
                            <LayoutGrid className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Category</p>
                            <h2 className="text-base font-semibold text-gray-800 dark:text-white leading-tight">
                                {loading ? "Loading…" : data?.name ?? "Details"}
                            </h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-24">
                            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : !data ? (
                        <p className="text-center text-gray-400 py-20 text-sm">Failed to load details.</p>
                    ) : (
                        <>
                            {/* Stats Row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1 p-4 rounded-2xl bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800">
                                    <p className="text-xs text-brand-500 dark:text-brand-400 font-medium uppercase tracking-wide">Menu Items</p>
                                    <p className="text-3xl font-bold text-brand-700 dark:text-brand-300">
                                        {data.menuItems?.length ?? 0}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Added On</p>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-auto">
                                        {new Date(data.createdAt).toLocaleDateString("en-US", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            {data.description ? (
                                <div className="flex gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                                    <AlignLeft className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium mb-1">Description</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {data.description}
                                        </p>
                                    </div>
                                </div>
                            ) : null}

                            {/* Meta Info */}
                            <div className="space-y-2">
                                <InfoRow icon={<Hash size={14} />} label="Category ID" value={data.id} mono />
                                <InfoRow icon={<Hash size={14} />} label="Restaurant ID" value={data.restaurantId} mono />
                                <InfoRow
                                    icon={<Calendar size={14} />}
                                    label="Last Updated"
                                    value={new Date(data.updatedAt).toLocaleString()}
                                />
                            </div>

                            {/* Menu Items List */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Utensils size={13} />
                                    Menu Items
                                    <span className="ml-auto bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-bold px-2 py-0.5 rounded-full">
                                        {data.menuItems?.length ?? 0}
                                    </span>
                                </h3>

                                {data.menuItems?.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 gap-3 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400">
                                        <Package className="w-8 h-8 opacity-40" />
                                        <p className="text-sm">No menu items yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {data.menuItems.map((item: any) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-brand-200 dark:hover:border-brand-700 transition-colors group"
                                            >
                                                {/* Icon */}
                                                <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition-colors">
                                                    <Utensils className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                                                </div>

                                                {/* Name & Status */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                                                        {item.name}
                                                    </p>
                                                    {item.description && (
                                                        <p className="text-xs text-gray-400 truncate">{item.description}</p>
                                                    )}
                                                </div>

                                                {/* Price */}
                                                {item.price != null && (
                                                    <div className="flex items-center gap-1 text-sm font-bold text-brand-600 dark:text-brand-400 shrink-0">
                                                        <DollarSign size={12} />
                                                        {Number(item.price).toFixed(2)}
                                                    </div>
                                                )}

                                                {/* Availability Badge */}
                                                <span
                                                    className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${item.isAvailable
                                                            ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                                            : "bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400"
                                                        }`}
                                                >
                                                    {item.isAvailable ? "Available" : "Unavailable"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes slide-in-right {
                    from { transform: translateX(100%); opacity: 0; }
                    to   { transform: translateX(0);    opacity: 1; }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.25s cubic-bezier(0.4, 0, 0.2, 1) both;
                }
            `}</style>
        </>
    );
}

function InfoRow({
    icon,
    label,
    value,
    mono = false,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
            <span className="text-gray-400 shrink-0">{icon}</span>
            <div className="flex-1 flex items-center justify-between gap-4 min-w-0">
                <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
                <span
                    className={`text-xs text-gray-700 dark:text-gray-300 truncate text-right ${mono ? "font-mono" : "font-medium"
                        }`}
                >
                    {value}
                </span>
            </div>
        </div>
    );
}
