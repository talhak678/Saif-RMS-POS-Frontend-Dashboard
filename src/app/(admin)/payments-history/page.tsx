"use client";

import React, { useState, useEffect } from "react";
import {
    Search,
    CheckCircle2,
    Clock,
    RefreshCcw,
    Download,
    CircleDollarSign,
    Filter
} from "lucide-react";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import { ProtectedRoute } from "@/services/protected-route";

const STATUS_COLORS: any = {
    PAID: "bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
    PENDING: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    FAILED: "bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
    REFUNDED: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
};

export default function PaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState("");

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/payments?status=${statusFilter}`);
            if (res.data.success) {
                setPayments(res.data.data.payments);
            }
        } catch (error) {
            toast.error("Failed to fetch payments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [statusFilter]);

    const handleRefund = async (paymentId: string) => {
        if (!confirm("Are you sure you want to refund this payment?")) return;
        try {
            const res = await api.patch("/payments", { paymentId, status: "REFUNDED" });
            if (res.data.success) {
                toast.success("Payment refunded successfully");
                fetchPayments();
            }
        } catch (error) {
            toast.error("Refund failed");
        }
    };

    return (
        <ProtectedRoute module="restaurant-config:payments-history">
            <div className="min-h-screen bg-transparent">
                <div className="mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Payments & Transactions</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage your restaurant's cashflow and refunds</p>
                        </div>

                        {/* <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                            {["", "PAID", "PENDING", "FAILED"].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${statusFilter === s
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        }`}
                                >
                                    {s || "All"}
                                </button>
                            ))}
                        </div> */}
                    </div>

                    {/* Stats Overview */}
                    {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <PaymentStatCard title="Total Volume" value="$12,450.00" icon={<CircleDollarSign size={20} className="text-blue-600" />} />
                        <PaymentStatCard title="Success Rate" value="98.2%" icon={<CheckCircle2 size={20} className="text-green-600" />} />
                        <PaymentStatCard title="Active Pending" value="14" icon={<Clock size={20} className="text-amber-600" />} />
                        <PaymentStatCard title="Refunded Vol" value="$420.00" icon={<RefreshCcw size={20} className="text-blue-500" />} />
                    </div> */}

                    {/* Filters & Actions */}
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by Order ID..."
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm">
                            <Download size={16} />
                            Export Data
                        </button>
                    </div>

                    {/* Data Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {loading ? (
                                        <tr><td colSpan={6} className="py-12 text-center text-gray-400 text-sm">Loading transactions...</td></tr>
                                    ) : payments.length === 0 ? (
                                        <tr><td colSpan={6} className="py-12 text-center text-gray-400 text-sm italic">No records found</td></tr>
                                    ) : (
                                        payments.map((p: any) => (
                                            <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">#{p.order.orderNo}</span>
                                                        <span className="text-[11px] text-gray-500 mt-0.5">{new Date(p.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">{p.order.customer?.name || "Walk-in"}</span>
                                                        <span className="text-xs text-gray-500 truncate max-w-[120px]">{p.order.customer?.email || "N/A"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">${Number(p.amount).toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                                                    {p.method}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${STATUS_COLORS[p.status]}`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {p.status === 'PAID' && (
                                                        <button
                                                            onClick={() => handleRefund(p.id)}
                                                            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                                                        >
                                                            Refund
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

function PaymentStatCard({ title, value, icon }: any) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:border-blue-500/30">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    {icon}
                </div>
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
                </div>
            </div>
        </div>
    );
}
