"use client";

import { useEffect, useState, useCallback, use } from "react";
import api from "@/services/api";
import {
    ArrowLeft,
    Printer,
    Edit,
    Plus,
    Minus,
    Bike,
    Smartphone,
    Globe,
    Monitor,
    Banknote,
    User,
    X,
    Check,
    ChevronDown,
    MessageSquare,
    Eye,
    Wallet,
    Phone,
    MapPin,
    Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/services/protected-route";
import ReceiptModal from "@/components/orders/ReceiptModal";
import Loader from "@/components/common/Loader";
import { toast } from "sonner";

interface OrderDetailProps {
    params: Promise<{ id: string }>;
}

const ORDER_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "KITCHEN_READY",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
];

const getStatusBadge = (status: string) => {
    const base = "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider";
    switch (status) {
        case "PENDING":
            return `${base} bg-amber-100 text-amber-700 border border-amber-200`;
        case "CONFIRMED":
        case "ACCEPTED":
            return `${base} bg-green-500 text-white`;
        case "CANCELLED":
            return `${base} bg-rose-500 text-white`;
        case "DELIVERED":
            return `${base} bg-emerald-100 text-emerald-700 border border-emerald-200`;
        default:
            return `${base} bg-brand-500 text-white`;
    }
};

export default function OrderDetailPage({ params }: OrderDetailProps) {
    const { id } = use(params);
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

    const fetchOrderDetails = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/orders/${id}`);
            if (res.data?.success) {
                setOrder(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch order details", err);
            toast.error("Failed to load order details");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    const updateStatus = async (status: string) => {
        try {
            setUpdating(true);
            const res = await api.put(`/orders/${id}`, { status });
            if (res.data?.success) {
                toast.success(`Order marked as ${status}`);
                fetchOrderDetails();
            }
        } catch (err) {
            console.error("Failed to update status", err);
            toast.error("Status update failed");
        } finally {
            setUpdating(false);
        }
    };

    const handleWhatsapp = () => {
        const phone = order.customer?.phone;
        if (!phone) return toast.error("Customer phone not available");
        const message = `Hello ${order.customer?.name}, your order #${order.orderNo} status is: ${order.status}`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handlePrint = () => {
        setIsPrintModalOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <Loader size="lg" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 gap-4">
                <p className="text-gray-500">Order not found.</p>
                <button onClick={() => router.back()} className="text-brand-600 font-bold flex items-center gap-2">
                    <ArrowLeft size={18} /> Go Back
                </button>
            </div>
        );
    }

    const itemsByCategory = order.items.reduce((acc: any, item: any) => {
        const catName = item.menuItem?.category?.name || "Main Menu";
        if (!acc[catName]) acc[catName] = [];
        acc[catName].push(item);
        return acc;
    }, {});

    return (
        <ProtectedRoute module="customers-orders:orders-history">
            <div className="min-h-screen bg-[#FDFDFD] dark:bg-gray-950 pb-20 font-outfit">

                {/* --- TOP HEADER SECTION --- */}
                <div className="px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Order ID #{order.orderNo || order.id.slice(-6)}</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase mr-1">Mark Order As:</span>
                            <button
                                onClick={() => updateStatus("CANCELLED")}
                                disabled={updating}
                                className="flex items-center gap-1 px-4 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition-all disabled:opacity-50"
                            >
                                <X size={14} /> Cancelled
                            </button>
                            <button
                                onClick={() => updateStatus("CONFIRMED")}
                                disabled={updating}
                                className="flex items-center gap-1 px-4 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all disabled:opacity-50"
                            >
                                <Check size={14} /> Accept
                            </button>
                        </div>
                        <button
                            onClick={handleWhatsapp}
                            className="flex items-center gap-2 px-4 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-bold shadow-md shadow-brand-600/20 hover:bg-brand-700 transition-all"
                        >
                            Send Whatsapp to Customer <MessageSquare size={14} />
                        </button>
                    </div>
                </div>

                {/* --- BREADCRUMB ACTIONS --- */}
                <div className="px-8 py-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-400 text-white rounded-lg text-[11px] font-bold hover:bg-orange-500 transition-all shadow-sm">
                            <Printer size={12} /> Print
                        </button>
                        <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-[11px] font-bold hover:bg-orange-600 transition-all shadow-sm">
                            <Printer size={12} /> Print KOT
                        </button>
                        <div className="relative group">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 text-white rounded-lg text-[11px] font-bold hover:bg-cyan-600 transition-all shadow-sm">
                                Change Status <ChevronDown size={12} />
                            </button>
                            <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl py-2 hidden group-hover:block z-30">
                                {ORDER_STATUSES.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => updateStatus(s)}
                                        className="w-full text-left px-4 py-1.5 text-[11px] font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 uppercase"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 text-white rounded-lg text-[11px] font-bold hover:bg-cyan-700 transition-all shadow-sm">
                            Change Branch
                        </button>
                    </div>
                </div>

                <div className="px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* --- LEFT SIDEBAR (Customer & History) --- */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Profile Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100/50 dark:border-gray-700 p-6 flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden mb-4 border-4 border-gray-50 dark:border-gray-600">
                                <User size={48} className="text-gray-300" />
                            </div>
                            <h2 className="text-lg font-black text-gray-800 dark:text-white mb-3 text-center">{order.customer?.name || "Guest Customer"}</h2>
                            <button className="flex items-center gap-2 px-6 py-1.5 bg-brand-600 text-white rounded-lg text-[10px] font-bold shadow-lg shadow-brand-600/30 hover:scale-105 transition-all">
                                <Wallet size={12} /> Add to Wallet
                            </button>

                            <div className="w-full mt-8 space-y-4">
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Customer Details</h3>
                                <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-[11px]">
                                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                            <tr>
                                                <td className="p-2.5 font-bold text-gray-400 bg-gray-50/50 dark:bg-gray-700/30 w-1/3 text-center border-r dark:border-gray-700">Name</td>
                                                <td className="p-2.5 font-bold text-gray-600 dark:text-gray-300 text-center">{order.customer?.name || "N/A"}</td>
                                            </tr>
                                            <tr>
                                                <td className="p-2.5 font-bold text-gray-400 bg-gray-50/50 dark:bg-gray-700/30 text-center border-r dark:border-gray-700">Phone</td>
                                                <td className="p-2.5 font-bold text-blue-500 text-center flex items-center justify-center gap-2">
                                                    {order.customer?.phone || "N/A"} <Phone size={10} />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="p-2.5 font-bold text-gray-400 bg-gray-50/50 dark:bg-gray-700/30 text-center border-r dark:border-gray-700">Email</td>
                                                <td className="p-2.5 font-bold text-gray-600 dark:text-gray-300 text-center truncate max-w-[120px]">{order.customer?.email || "N/A"}</td>
                                            </tr>
                                            <tr>
                                                <td className="p-2.5 font-bold text-gray-400 bg-gray-50/50 dark:bg-gray-700/30 text-center border-r dark:border-gray-700">Delivery Address</td>
                                                <td className="p-2.5 font-bold text-gray-600 dark:text-gray-300 text-center leading-tight">
                                                    {order.deliveryAddress || "Not specified"}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="w-full mt-6 space-y-4">
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Order Information</h3>
                                <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-[11px]">
                                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                            <tr>
                                                <td className="p-2.5 font-bold text-gray-400 bg-gray-50/50 dark:bg-gray-700/30 w-1/3 text-center border-r dark:border-gray-700">Source</td>
                                                <td className="p-2.5 font-bold text-gray-600 dark:text-gray-300 text-center uppercase">{order.source}</td>
                                            </tr>
                                            <tr>
                                                <td className="p-2.5 font-bold text-gray-400 bg-gray-50/50 dark:bg-gray-700/30 text-center border-r dark:border-gray-700">Branch</td>
                                                <td className="p-2.5 font-bold text-gray-600 dark:text-gray-300 text-center">{order.branch?.name || "Main Branch"}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* History Section - Derived from timestamps */}
                        <div className="space-y-4 px-2">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">History</h3>
                            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-brand-600 bg-white dark:bg-gray-950 z-10" />
                                    <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 uppercase">Order Placed</p>
                                    <p className="text-[9px] text-gray-400 font-medium">
                                        {new Date(order.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                {order.updatedAt !== order.createdAt && (
                                    <div className="relative">
                                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-gray-300 bg-white dark:bg-gray-950 z-10" />
                                        <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase">Last Updated</p>
                                        <p className="text-[9px] text-gray-400 font-medium">
                                            {new Date(order.updatedAt).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-emerald-500 bg-white dark:bg-gray-950 z-10" />
                                    <p className="text-[11px] font-bold text-emerald-600 uppercase">Current Status: {order.status}</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* --- RIGHT SECTION (Order Details & Items) --- */}
                    <div className="lg:col-span-9 bg-white dark:bg-gray-800 rounded-3xl shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-8 space-y-8">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Order Items & Summary</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                                {/* Order Meta Info */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-px bg-gray-100 dark:bg-gray-700 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                                        <div className="bg-white dark:bg-gray-800 p-4 space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ref #</p>
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">#{order.orderNo}</p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-4 space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</p>
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{order.type}</p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-4 space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Status</p>
                                            <div className="pt-1">
                                                <span className={getStatusBadge(order.status)}>{order.status}</span>
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-4 space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Status</p>
                                            <p className="text-xs font-bold text-orange-500 uppercase">{order.payment?.status}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 px-1">
                                        {[
                                            { label: "Branch Name", value: order.branch?.name || "Main Branch" },
                                            { label: "Payment Type", value: <div className="flex items-center gap-2">{order.payment?.method} <div className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 border border-green-200 flex items-center gap-1"> <Banknote size={12} /> </div> </div> },
                                            { label: "Order Date", value: <div className="px-3 py-1 bg-brand-500 text-white rounded-lg text-[10px] font-bold shadow-sm">{new Date(order.createdAt).toLocaleDateString()}</div> },
                                            { label: "Platform", value: <div className="px-2 py-0.5 bg-cyan-600 text-white rounded text-[9px] font-black italic uppercase">{order.source}</div> }
                                        ].map((row, idx) => (
                                            <div key={idx} className="flex justify-between items-center py-2.5 border-b border-gray-50 dark:border-gray-700 last:border-0">
                                                <span className="text-xs font-bold text-gray-800 dark:text-gray-300">{row.label}</span>
                                                <div className="text-xs text-gray-400 font-medium">{row.value}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Banner */}
                                    <div className="space-y-3">
                                        <div className="w-full bg-brand-600/5 dark:bg-brand-600/10 border border-brand-100 dark:border-brand-500/20 rounded-2xl p-4 flex items-center justify-between text-brand-600 dark:text-brand-400">
                                            <div className="flex items-center gap-3">
                                                <Bike size={24} />
                                                <div className="text-left">
                                                    <p className="text-[10px] font-black uppercase opacity-60">Order Mode</p>
                                                    <p className="text-sm font-black italic uppercase">{order.type} Order</p>
                                                </div>
                                            </div>
                                            {order.rider && (
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black uppercase opacity-60">Rider</p>
                                                    <p className="text-xs font-bold">{order.rider.name}</p>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            className="w-full bg-brand-600 text-white rounded-2xl p-4 flex items-center justify-center font-black uppercase text-sm shadow-lg shadow-brand-600/30 active:scale-95 transition-all hover:bg-brand-700"
                                        >
                                            {order.riderId ? "Change Rider" : "Assign a Rider"}
                                        </button>
                                    </div>
                                </div>

                                {/* Order Items List */}
                                <div className="space-y-8">
                                    {Object.keys(itemsByCategory).map((catName) => (
                                        <div key={catName} className="space-y-4">
                                            <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-wider border-l-4 border-brand-600 pl-3">{catName}</h3>
                                            <div className="space-y-5">
                                                {itemsByCategory[catName].map((item: any) => (
                                                    <div key={item.id} className="flex justify-between items-start group">
                                                        <div className="flex gap-4">
                                                            <span className="text-xs flex items-center justify-center w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-700 font-bold text-gray-600 group-hover:bg-brand-600 group-hover:text-white transition-all">{item.quantity}</span>
                                                            <div className="space-y-0.5">
                                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{item.menuItem?.name}</p>
                                                                <p className="text-[11px] text-gray-400 font-medium">${Number(item.price).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-800 dark:text-white">${(Number(item.price) * item.quantity).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pt-8 border-t border-gray-100 dark:border-gray-700 space-y-3">
                                        <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                                            <span>Sub Total</span>
                                            <span className="text-gray-800 dark:text-white font-black">${Number(order.total).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                                            <span>Delivery Charge</span>
                                            <span className="text-gray-800 dark:text-white font-black">${Number(order.deliveryCharge || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-lg font-black text-gray-800 dark:text-white">Total Amount</span>
                                            <span className="text-xl font-black text-brand-600 dark:text-brand-400 tracking-tight">${(Number(order.total) + Number(order.deliveryCharge || 0)).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6 gap-3">
                                        <button className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-black uppercase hover:bg-red-100 transition-all active:scale-95">
                                            <Trash2 size={14} /> Cancel Order
                                        </button>
                                        <button className="flex items-center gap-2 px-8 py-3 bg-brand-600 text-white rounded-xl text-xs font-black uppercase shadow-xl shadow-brand-600/30 hover:bg-brand-700 transition-all active:scale-95">
                                            <Edit size={14} /> Edit Order
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>

                <ReceiptModal
                    isOpen={isPrintModalOpen}
                    onClose={() => setIsPrintModalOpen(false)}
                    order={order}
                />

            </div>
        </ProtectedRoute>
    );
}
