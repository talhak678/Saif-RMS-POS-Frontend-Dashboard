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
    Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/services/protected-route";
import ReceiptModal from "@/components/orders/ReceiptModal";
import Loader from "@/components/common/Loader";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";

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
    
    // Rider Assignment Status
    const [riders, setRiders] = useState<any[]>([]);
    const [isRiderModalOpen, setIsRiderModalOpen] = useState(false);
    const [fetchingRiders, setFetchingRiders] = useState(false);

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

    const fetchRiders = async () => {
        try {
            setFetchingRiders(true);
            const res = await api.get("/riders?status=AVAILABLE");
            if (res.data?.success) {
                setRiders(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch riders", err);
            toast.error("Could not load riders");
        } finally {
            setFetchingRiders(false);
        }
    };

    const assignRider = async (riderId: string) => {
        try {
            setUpdating(true);
            const res = await api.put(`/orders/${id}`, { riderId });
            if (res.data?.success) {
                toast.success("Rider assigned successfully");
                setIsRiderModalOpen(false);
                fetchOrderDetails();
            }
        } catch (err) {
            console.error("Failed to assign rider", err);
            toast.error("Assignment failed");
        } finally {
            setUpdating(false);
        }
    };

    const deleteOrder = async () => {
        if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;
        try {
            setUpdating(true);
            const res = await api.delete(`/orders/${id}`);
            if (res.data?.success) {
                toast.success("Order deleted");
                router.push("/orders");
            }
        } catch (err) {
            console.error("Failed to delete order", err);
            toast.error("Delete failed");
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
                <div className="px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <ArrowLeft size={20} className="text-gray-500" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-none">Order Details</h1>
                            <p className="text-xs text-brand-600 font-medium mt-1">Ref No: #{order.orderNo || order.id.slice(-6)}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => updateStatus("CANCELLED")}
                            disabled={updating || order.status === "CANCELLED"}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-rose-50 hover:text-rose-600 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => updateStatus("CONFIRMED")}
                            disabled={updating || order.status !== "PENDING"}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-md shadow-emerald-600/10"
                        >
                            Confirm Order
                        </button>
                        <button
                            onClick={handleWhatsapp}
                            className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all"
                        >
                            <MessageSquare size={14} /> WhatsApp
                        </button>
                    </div>
                </div>

                {/* --- ACTION BAR --- */}
                <div className="px-8 py-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-50 dark:border-gray-800/50">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                            <button onClick={handlePrint} className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold hover:bg-gray-50 border-r dark:border-gray-700">
                                <Printer size={14} /> Receipt
                            </button>
                            <button onClick={handlePrint} className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold hover:bg-gray-50">
                                <Printer size={14} /> KOT
                            </button>
                        </div>

                        <div className="relative group">
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-bold shadow-lg shadow-gray-200 dark:shadow-none">
                                Status: {order.status === "OUT_FOR_DELIVERY" ? "ON THE WAY" : order.status} <ChevronDown size={14} />
                            </button>
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl py-2 hidden group-hover:block z-30 overflow-hidden animate-in fade-in slide-in-from-top-1">
                                {ORDER_STATUSES.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => updateStatus(s)}
                                        className={`w-full text-left px-5 py-2.5 text-xs font-bold transition-colors uppercase ${order.status === s ? 'text-brand-600 bg-brand-50' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                    >
                                        {s === "OUT_FOR_DELIVERY" ? "ON THE WAY" : s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Progress</span>
                        <div className="flex gap-1">
                            {ORDER_STATUSES.slice(0, 6).map((s, i) => {
                                const currentIndex = ORDER_STATUSES.indexOf(order.status);
                                const isCompleted = ORDER_STATUSES.indexOf(s) <= currentIndex;
                                return (
                                    <div key={i} className={`h-1.5 w-6 rounded-full ${isCompleted ? 'bg-brand-500' : 'bg-gray-100 dark:bg-gray-700'}`} />
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* --- LEFT SIDEBAR (Customer & History) --- */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Profile Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center">
                            <div className="w-20 h-20 rounded-2xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 flex items-center justify-center mb-4 border border-brand-100 dark:border-brand-500/20">
                                <User size={36} />
                            </div>
                            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 text-center">{order.customer?.name || "Guest Customer"}</h2>
                            
                            <div className="w-full space-y-3">
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Customer Info</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Phone</p>
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-0.5">{order.customer?.phone || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Email</p>
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-0.5 truncate">{order.customer?.email || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Delivery Address</p>
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-0.5 leading-relaxed italic">{order.deliveryAddress || "Not specified"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full mt-6 space-y-3">
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Order Info</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Mode</p>
                                        <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase">{order.type}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Source</p>
                                        <span className="text-[10px] font-bold bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded uppercase">{order.source}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Branch</p>
                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{order.branch?.name || "Main Branch"}</span>
                                    </div>
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
                                    <p className="text-[11px] font-bold text-emerald-600 uppercase">Current Status: {order.status === "OUT_FOR_DELIVERY" ? "ON THE WAY" : order.status}</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* --- RIGHT SECTION (Order Details & Items) --- */}
                    <div className="lg:col-span-9 bg-white dark:bg-gray-800 rounded-3xl shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-8 space-y-8">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Order Items & Summary</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                                {/* Simplified Meta Section */}
                                <div className="space-y-6">
                                    <div className="bg-gray-50 dark:bg-gray-900/40 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 space-y-4">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-gray-400 uppercase tracking-widest">Order Mode</span>
                                            <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{order.type}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-gray-400 uppercase tracking-widest">Platform</span>
                                            <span className="font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded uppercase">{order.source}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-gray-400 uppercase tracking-widest">Payment Status</span>
                                            <span className="font-black text-orange-600 uppercase italic">{order.payment?.status || "PENDING"}</span>
                                        </div>
                                        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
                                            <span className="font-bold text-gray-400 uppercase tracking-widest">Branch</span>
                                            <span className="text-gray-700 dark:text-gray-300 font-bold">{order.branch?.name || "Main Branch"}</span>
                                        </div>
                                    </div>

                                    {/* Rider Assignment Info */}
                                    <div className="w-full bg-brand-50/30 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-500/10 rounded-2xl p-6">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-brand-600 shadow-sm">
                                                <Bike size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delivery Partner</p>
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{order.rider ? order.rider.name : "Unassigned"}</p>
                                            </div>
                                        </div>
                                        
                                        <button
                                            disabled={order.status !== "OUT_FOR_DELIVERY"}
                                            onClick={() => { fetchRiders(); setIsRiderModalOpen(true); }}
                                            className={`w-full py-3 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                                                order.status === "OUT_FOR_DELIVERY" 
                                                ? "bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-600/10"
                                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            }`}
                                        >
                                            <Users size={14} /> {order.rider ? "Change Rider" : "Assign a Rider"}
                                        </button>
                                        
                                        {order.status !== "OUT_FOR_DELIVERY" && (
                                            <p className="text-[9px] text-gray-400 font-medium text-center mt-3 bg-white/50 dark:bg-gray-800/50 py-1 rounded-full border border-gray-100 dark:border-gray-700">Assignment enabled only when <b>ON THE WAY</b></p>
                                        )}
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

                                    <div className="p-6 bg-gray-50 rounded-2xl dark:bg-gray-950/20 space-y-3">
                                        <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                            <span className="uppercase tracking-widest">Order Total</span>
                                            <span className="text-gray-800 dark:text-white">${Number(order.total).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                            <span className="uppercase tracking-widest">Delivery Fee</span>
                                            <span className="text-gray-800 dark:text-white">${Number(order.deliveryCharge || 0).toLocaleString()}</span>
                                        </div>
                                        {order.loyaltyAmount > 0 && (
                                            <div className="flex justify-between items-center text-xs font-bold text-emerald-600">
                                                <span className="uppercase tracking-widest">Loyalty Reward</span>
                                                <span>-${Number(order.loyaltyAmount).toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-800">
                                            <span className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">Grand Total</span>
                                            <span className="text-xl font-black text-brand-600 dark:text-brand-400">${(Number(order.total) + Number(order.deliveryCharge || 0) - (order.loyaltyAmount || 0)).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-8 gap-3">
                                        <button 
                                            onClick={deleteOrder}
                                            disabled={updating}
                                            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-400 rounded-xl text-[11px] font-bold uppercase hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all active:scale-95"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                        <button 
                                            onClick={() => router.push(`/pos?orderId=${id}`)}
                                            className="flex items-center gap-2 px-8 py-3 bg-brand-600 text-white rounded-xl text-[11px] font-bold uppercase shadow-xl shadow-brand-600/10 hover:bg-brand-700 transition-all active:scale-95"
                                        >
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

                {/* Rider Selection Modal */}
                <Modal isOpen={isRiderModalOpen} onClose={() => setIsRiderModalOpen(false)} className="max-w-md">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">Assign a Rider</h2>
                            <button onClick={() => setIsRiderModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                                <X size={18} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-4 rounded-2xl text-[10px] font-bold uppercase tracking-wider leading-relaxed">
                                Only AVAILABLE riders are shown below. Assigning a rider will notify them instantly.
                            </div>
                            
                            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                {fetchingRiders ? (
                                    <div className="py-20 text-center"><Loader size="sm" /></div>
                                ) : riders.length === 0 ? (
                                    <div className="py-20 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-loose">No riders available right now.<br/>Change rider status in Riders menu.</div>
                                ) : (
                                    riders.map(r => (
                                        <button
                                            key={r.id}
                                            onClick={() => assignRider(r.id)}
                                            disabled={updating}
                                            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 hover:bg-brand-50 dark:hover:bg-brand-900/20 border border-transparent hover:border-brand-200 dark:hover:border-brand-500/30 rounded-2xl transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-brand-600 transition-colors shadow-sm">
                                                    <User size={20} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors">{r.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{r.phone}</p>
                                                </div>
                                            </div>
                                            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </Modal>

            </div>
        </ProtectedRoute>
    );
}
