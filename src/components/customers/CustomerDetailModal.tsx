"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { X, Info, Users, Phone, Mail, Wallet, ShoppingBag, TrendingUp, CalendarCheck, MapPin, Clock, ShieldCheck, ChevronRight } from "lucide-react";
import Loader from "@/components/common/Loader";

interface CustomerDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: any;
    loading: boolean;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
    isOpen,
    onClose,
    customer,
    loading,
}) => {
    const [activeTab, setActiveTab] = useState<"general" | "orders" | "loyalty">("general");

    if (!customer && !loading) return null;

    const tabs = [
        { id: "general", label: "Overview", icon: <Users size={16} /> },
        { id: "orders", label: "Order History", icon: <ShoppingBag size={16} /> },
        { id: "loyalty", label: "Loyalty & Insights", icon: <Wallet size={16} /> },
    ];

    const data = customer || {};

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-5xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh] p-0"
        >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-600/10 flex items-center justify-center">
                        <Users size={20} className="text-brand-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                            {data.name || "Customer Profile"}
                        </h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Customer Intelligence</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                            <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest flex items-center gap-1">
                                <ShieldCheck size={10} /> Active Member
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition active:scale-95"
                >
                    <X size={20} className="text-gray-500" />
                </button>
            </div>

            {/* Tabs Navigation */}
            <div className="px-6 border-b border-gray-100 dark:border-gray-800 flex gap-6 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
                            ? "border-brand-600 text-brand-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 min-h-[400px]">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                        <Loader size="lg" showText={false} />
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] animate-pulse">Retrieving Data...</span>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {activeTab === "general" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <InfoCard label="Full Name" value={data.name} icon={<Users size={16} />} />
                                <InfoCard label="Phone Number" value={data.phone} icon={<Phone size={16} />} />
                                <InfoCard label="Email Address" value={data.email} icon={<Mail size={16} />} />
                                <InfoCard label="Joined Since" value={data.createdAt ? new Date(data.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A'} icon={<TrendingUp size={16} />} />
                                <InfoCard label="Last Activity" value={data.lastOrderAt ? new Date(data.lastOrderAt).toLocaleString() : 'No recent activity'} icon={<CalendarCheck size={16} />} />
                                <InfoCard label="Address" value={data.address || 'No address saved.'} icon={<MapPin size={16} />} fullWidth />
                            </div>
                        )}

                        {activeTab === "orders" && (
                            <div className="space-y-4">
                                {!data.orders || data.orders.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                                        <ShoppingBag size={32} className="mx-auto text-gray-200 mb-3" />
                                        <p className="text-gray-500 text-sm font-medium">No order history found for this customer.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center mb-2 px-1">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Recent Transactions</h3>
                                            <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-gray-500">Total: {data.orders.length}</span>
                                        </div>

                                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                            {data.orders.map((order: any) => (
                                                <div key={order.id} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/40 transition-all hover:shadow-lg hover:border-brand-600/20 shadow-sm">
                                                    {/* Card Header */}
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight">Order #{order.orderNo}</span>
                                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${order.status === 'COMPLETED'
                                                                        ? 'bg-green-500 text-white shadow-sm shadow-green-200'
                                                                        : 'bg-amber-500 text-white shadow-sm shadow-amber-200'
                                                                    }`}>
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                            <div className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">
                                                                {new Date(order.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-black text-brand-600 leading-none">$ {order.total}</div>
                                                            <div className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mt-1.5 flex items-center justify-end gap-1.5">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                                {order.payment?.method || 'CASH'} • {order.payment?.status || 'PAID'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Items Summary Box */}
                                                    <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-xl p-3 border border-gray-100/50 dark:border-gray-700/50 space-y-2.5">
                                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                                                            <div className="h-[1px] flex-1 bg-gray-200 dark:bg-gray-700" />
                                                            Order Items
                                                            <div className="h-[1px] flex-1 bg-gray-200 dark:bg-gray-700" />
                                                        </div>
                                                        {order.items?.map((it: any) => (
                                                            <div key={it.id} className="flex justify-between items-center text-xs">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-6 h-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-[10px] font-black text-brand-600 shadow-sm">
                                                                        {it.quantity}
                                                                    </div>
                                                                    <span className="font-bold text-gray-700 dark:text-gray-300">{it.menuItem?.name || 'Item'}</span>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-[10px] text-gray-400 font-medium">$ {it.price}</span>
                                                                    <div className="w-1 h-1 rounded-full bg-gray-200" />
                                                                    <span className="text-[10px] font-black text-gray-900 dark:text-white">$ {(it.price * it.quantity).toFixed(2)}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "loyalty" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white shadow-lg">
                                    <div className="flex justify-between items-start mb-6">
                                        <Wallet size={24} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Loyalty Balance</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-4xl font-black">{data.loyaltyPoints ?? 0}</div>
                                        <div className="text-xs font-medium opacity-90">Total reward points available</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">Customer Insight</h3>
                                    <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Order Frequency</span>
                                            <span className="font-bold text-gray-900 dark:text-white">
                                                {(data._count?.orders ?? 0) > 10 ? 'High' : 'Moderate'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Retention Risk</span>
                                            <span className="font-bold text-green-600">Low</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Calculated Value</span>
                                            <span className="font-bold text-indigo-600">Premium</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button
                    onClick={onClose}
                    className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition active:scale-95 shadow-sm"
                >
                    Return to List
                </button>
            </div>
        </Modal>
    );
};

function InfoCard({ label, value, icon, fullWidth }: { label: string; value: any; icon: React.ReactNode; fullWidth?: boolean }) {
    return (
        <div className={`p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 ${fullWidth ? "md:col-span-2 lg:col-span-3" : ""}`}>
            <div className="flex items-center gap-2 mb-1.5">
                <span className="text-brand-600">{icon}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {label}
                </span>
            </div>
            <div className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
                {value || "N/A"}
            </div>
        </div>
    );
}
