"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Eye, X, RefreshCw, Clock, ChevronRight } from "lucide-react";
import { ViewDetailModal } from "@/components/ViewDetailModal";

const ORDER_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "KITCHEN_READY",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
    PENDING: { label: "Pending", color: "text-yellow-700 dark:text-yellow-300", bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-700", dot: "bg-yellow-500" },
    CONFIRMED: { label: "Confirmed", color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-700", dot: "bg-blue-500" },
    PREPARING: { label: "Preparing", color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-200 dark:border-purple-700", dot: "bg-purple-500" },
    KITCHEN_READY: { label: "Kitchen Ready", color: "text-indigo-700 dark:text-indigo-300", bg: "bg-indigo-50 dark:bg-indigo-900/20", border: "border-indigo-200 dark:border-indigo-700", dot: "bg-indigo-500" },
    OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "text-orange-700 dark:text-orange-300", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-700", dot: "bg-orange-500" },
    DELIVERED: { label: "Delivered", color: "text-green-700 dark:text-green-300", bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-700", dot: "bg-green-500" },
    CANCELLED: { label: "Cancelled", color: "text-red-700 dark:text-red-300", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-700", dot: "bg-red-500" },
};

const getStatusBadge = (status: string) => {
    const base = "px-2 py-1 rounded text-xs font-medium";
    const cfg = STATUS_CONFIG[status];
    if (!cfg) return base;
    return `${base} ${cfg.bg} ${cfg.color}`;
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["PENDING"];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function OrderCard({ order, onChangeStatus }: { order: any; onChangeStatus: (order: any) => void }) {
    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG["PENDING"];
    return (
        <div className={`rounded-2xl border-2 ${cfg.border} bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden`}>
            {/* Card Header */}
            <div className={`px-4 py-3 ${cfg.bg} border-b ${cfg.border} flex justify-between items-start`}>
                <div>
                    <p className={`text-xs font-semibold ${cfg.color} uppercase tracking-wide`}>Order #{order.orderNo}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleString("en-PK", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                </div>
                <StatusBadge status={order.status} />
            </div>

            {/* Card Body */}
            <div className="px-4 py-3 flex-1">
                {/* Branch & Customer */}
                <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                        {order.branch?.name || "—"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {order.customer?.name
                            ? `${order.customer.name}${order.source === "POS" ? " (POS)" : ""}`
                            : order.source === "POS" ? "POS Order" : "Guest"
                        }
                    </p>
                </div>

                {/* Order Type Badge */}
                <div className="mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        {order.type?.replace("_", " ")}
                    </span>
                </div>

                {/* Items */}
                <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Order Items</p>
                    {order.items?.slice(0, 3).map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center">
                            <span className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1 pr-2">
                                {item.menuItem?.name} <span className="text-gray-400">×{item.quantity}</span>
                            </span>
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">
                                Rs. {(parseFloat(item.price) * item.quantity).toFixed(0)}
                            </span>
                        </div>
                    ))}
                    {order.items?.length > 3 && (
                        <p className="text-[10px] text-gray-400">+{order.items.length - 3} more items</p>
                    )}
                </div>
            </div>

            {/* Card Footer */}
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">Total</p>
                    <p className="text-base font-bold text-gray-900 dark:text-gray-100">Rs. {order.total}</p>
                </div>
                <button
                    onClick={() => onChangeStatus(order)}
                    className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border ${cfg.border} ${cfg.color} ${cfg.bg} hover:opacity-80 transition-opacity`}
                >
                    Update <ChevronRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}

export default function IncomingOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [branches, setBranches] = useState<any[]>([]);
    const [branchFilter, setBranchFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // View Modal
    const [viewOrder, setViewOrder] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Status Modal
    const [statusModal, setStatusModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [newStatus, setNewStatus] = useState("");
    const [updating, setUpdating] = useState(false);

    // Rider
    const [availableRiders, setAvailableRiders] = useState<any[]>([]);
    const [selectedRiderId, setSelectedRiderId] = useState("");
    const [loadingRiders, setLoadingRiders] = useState(false);

    // Rider details for view modal
    const [assignedRider, setAssignedRider] = useState<any>(null);
    const [loadingRiderDetails, setLoadingRiderDetails] = useState(false);

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [branchFilter, statusFilter]);

    const fetchBranches = async () => {
        try {
            const res = await api.get("/branches");
            if (res.data?.success) setBranches(res.data.data);
        } catch (err) {
            console.error("Failed to fetch branches", err);
        }
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params: string[] = [];
            if (branchFilter !== "ALL") params.push(`branchId=${branchFilter}`);
            if (statusFilter !== "ALL") params.push(`status=${statusFilter}`);
            const query = params.length ? `?${params.join("&")}` : "";
            const res = await api.get(`/orders${query}`);
            if (res.data?.success) {
                const sorted = res.data.data.sort(
                    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setOrders(sorted);
            }
        } catch (err) {
            console.error("Failed to fetch orders", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableRiders = async () => {
        try {
            setLoadingRiders(true);
            const res = await api.get("/riders?status=AVAILABLE");
            if (res.data?.success) setAvailableRiders(res.data.data);
        } catch (err) {
            console.error("Failed to fetch riders", err);
        } finally {
            setLoadingRiders(false);
        }
    };

    const fetchRiderDetails = async (riderId: string) => {
        try {
            setLoadingRiderDetails(true);
            const res = await api.get(`/riders/${riderId}`);
            if (res.data?.success) setAssignedRider(res.data.data);
        } catch (err) {
            setAssignedRider(null);
        } finally {
            setLoadingRiderDetails(false);
        }
    };

    const openStatusModal = (order: any) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setSelectedRiderId("");
        setStatusModal(true);
    };

    const handleStatusUpdate = async () => {
        if (!selectedOrder || !newStatus) return;
        if (newStatus === "OUT_FOR_DELIVERY" && !selectedRiderId) {
            alert("Please select a rider for delivery");
            return;
        }
        try {
            setUpdating(true);
            const payload: any = {
                status: newStatus,
                paymentStatus:
                    newStatus === "DELIVERED"
                        ? "PAID"
                        : selectedOrder.payment?.status === "PAID"
                            ? "PAID"
                            : "PENDING",
            };
            if (newStatus === "OUT_FOR_DELIVERY" && selectedRiderId) {
                payload.riderId = selectedRiderId;
            }
            await api.put(`/orders/${selectedOrder.id}`, payload);
            setStatusModal(false);
            setSelectedRiderId("");
            fetchOrders();
        } catch (err) {
            console.error("Status update failed", err);
        } finally {
            setUpdating(false);
        }
    };

    const latestSix = orders.slice(0, 6);
    const restOrders = orders.slice(6);

    const renderOrderItems = (order: any) => (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            {order?.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between border-b dark:border-gray-600 py-2 last:border-0">
                    <span className="text-gray-700 dark:text-gray-300">{item.menuItem?.name} × {item.quantity}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">Rs. {parseFloat(item.price) * item.quantity}</span>
                </div>
            ))}
            <div className="flex justify-between pt-3 mt-1 border-t dark:border-gray-600 font-bold text-lg">
                <span>Total</span>
                <span>Rs. {order?.total}</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen p-4 md:p-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl dark:text-gray-200">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Incoming Orders</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {loading ? "Loading..." : `${orders.length} total orders`}
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                    {/* Branch Filter */}
                    <select
                        value={branchFilter}
                        onChange={(e) => setBranchFilter(e.target.value)}
                        className="text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ALL">All Branches</option>
                        {branches.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ALL">All Statuses</option>
                        {ORDER_STATUSES.map((st) => (
                            <option key={st} value={st}>{STATUS_CONFIG[st]?.label || st}</option>
                        ))}
                    </select>

                    {/* Refresh */}
                    <button
                        onClick={fetchOrders}
                        disabled={loading}
                        className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {loading ? (
                /* Loading Skeleton */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 h-64 animate-pulse">
                            <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-t-2xl" />
                            <div className="p-4 space-y-3">
                                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-3/4" />
                                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
                                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                        <RefreshCw className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-medium">No orders found</p>
                    <p className="text-sm mt-1">Try changing the filters or refresh</p>
                </div>
            ) : (
                <>
                    {/* ── TOP 6 LATEST ORDER CARDS ── */}
                    <div className="mb-2">
                        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                            Latest Orders
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {latestSix.map((order) => (
                                <OrderCard key={order.id} order={order} onChangeStatus={openStatusModal} />
                            ))}
                        </div>
                    </div>

                    {/* ── REST OF ORDERS LIST ── */}
                    {restOrders.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                                All Orders ({orders.length})
                            </h2>
                            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700">
                                <table className="min-w-[750px] w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-700/60">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">#</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Order</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Customer</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Branch</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Type</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Time</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {restOrders.map((order: any, index: number) => (
                                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{index + 7}</td>
                                                <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">#{order.orderNo}</td>
                                                <td className="px-4 py-3">
                                                    {order.customer
                                                        ? (
                                                            <span className="text-gray-700 dark:text-gray-300">
                                                                {order.customer.name}
                                                                {order.source && order.source !== "WEBSITE" && (
                                                                    <span className="ml-1 text-blue-500 text-xs">({order.source})</span>
                                                                )}
                                                            </span>
                                                        )
                                                        : order.source === "POS"
                                                            ? <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">POS</span>
                                                            : <span className="text-gray-400 text-xs">—</span>
                                                    }
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{order.branch?.name || "—"}</td>
                                                <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{order.type?.replace("_", " ")}</td>
                                                <td className="px-4 py-3">
                                                    <span className={getStatusBadge(order.status)}>{order.status}</span>
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">Rs. {order.total}</td>
                                                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(order.createdAt).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1.5">
                                                        <button
                                                            onClick={() => {
                                                                setViewOrder(order);
                                                                setIsViewModalOpen(true);
                                                                if (order.riderId) fetchRiderDetails(order.riderId);
                                                                else setAssignedRider(null);
                                                            }}
                                                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => openStatusModal(order)}
                                                            className="text-xs px-2.5 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                                                        >
                                                            Status
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* VIEW DETAIL MODAL */}
            <ViewDetailModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title={`Order Details #${viewOrder?.orderNo || ""}`}
                data={viewOrder}
                fields={[
                    {
                        label: "Customer",
                        render: (data: any) => {
                            if (!data?.customer) return data?.source === "POS" ? <span className="text-blue-600 font-semibold">POS Order</span> : <span className="text-gray-400">—</span>;
                            return <span>{data.customer.name}{data.source && data.source !== "WEBSITE" && <span className="ml-1 text-blue-500 text-xs">({data.source})</span>}</span>;
                        },
                    },
                    { label: "Phone", render: (data: any) => data?.customer?.phone || "—" },
                    { label: "Branch", render: (data: any) => data?.branch?.name || "—" },
                    { label: "Order Type", key: "type" },
                    { label: "Source", render: (data: any) => data?.source || "—" },
                    {
                        label: "Status",
                        render: (data: any) => <StatusBadge status={data?.status || "PENDING"} />,
                    },
                    {
                        label: "Payment",
                        render: (data: any) => {
                            const isPaid = data?.payment?.status === "PAID";
                            return (
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${isPaid ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"}`}>
                                    {data?.payment?.method} — {data?.payment?.status}
                                </span>
                            );
                        },
                    },
                    { label: "Placed At", render: (data: any) => data?.createdAt ? new Date(data.createdAt).toLocaleString() : "N/A" },
                    {
                        label: "Assigned Rider",
                        render: (data: any) => {
                            if (!data?.riderId) return <span className="text-gray-500">No rider assigned</span>;
                            if (loadingRiderDetails) return <span className="text-gray-500">Loading...</span>;
                            if (!assignedRider) return <span className="text-gray-500">N/A</span>;
                            return (
                                <div className="space-y-1">
                                    <div className="font-medium">{assignedRider.name}</div>
                                    <div className="text-sm text-gray-500">{assignedRider.phone}</div>
                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${assignedRider.status === "AVAILABLE" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}>
                                        {assignedRider.status}
                                    </span>
                                </div>
                            );
                        },
                    },
                    { label: "Order Items", fullWidth: true, render: renderOrderItems },
                ]}
            />

            {/* STATUS CHANGE MODAL */}
            {statusModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                            <div>
                                <h2 className="font-bold text-gray-900 dark:text-gray-100">Change Status</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Order #{selectedOrder?.orderNo}</p>
                            </div>
                            <button onClick={() => setStatusModal(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Status</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => {
                                        const status = e.target.value;
                                        setNewStatus(status);
                                        if (status === "OUT_FOR_DELIVERY") fetchAvailableRiders();
                                    }}
                                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {ORDER_STATUSES.map((st) => (
                                        <option key={st} value={st}>{STATUS_CONFIG[st]?.label || st}</option>
                                    ))}
                                </select>
                            </div>

                            {/* DELIVERED notice */}
                            {newStatus === "DELIVERED" && (
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                                        ✅ Payment will automatically be marked as <strong>PAID</strong>
                                    </p>
                                </div>
                            )}

                            {/* Rider selection */}
                            {newStatus === "OUT_FOR_DELIVERY" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assign Rider *</label>
                                    {loadingRiders ? (
                                        <p className="text-sm text-gray-500">Loading riders...</p>
                                    ) : (
                                        <select
                                            value={selectedRiderId}
                                            onChange={(e) => setSelectedRiderId(e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Select a rider</option>
                                            {availableRiders.map((rider) => (
                                                <option key={rider.id} value={rider.id}>{rider.name} — {rider.phone}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-5 pt-0 flex gap-3">
                            <button
                                onClick={() => setStatusModal(false)}
                                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStatusUpdate}
                                disabled={updating}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
                            >
                                {updating ? "Updating..." : "Update Status"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
