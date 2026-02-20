"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/services/api";
import { Eye, X, RefreshCw, Clock, ChevronRight, LayoutGrid, List, Bell, BellOff } from "lucide-react";
import { ViewDetailModal } from "@/components/ViewDetailModal";
import { ProtectedRoute } from "@/services/protected-route";

const ORDER_STATUSES = [
    "PENDING", "CONFIRMED", "PREPARING", "KITCHEN_READY",
    "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED",
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; dot: string; cardBg: string }> = {
    PENDING: { label: "Pending", color: "text-yellow-700 dark:text-yellow-300", bg: "bg-yellow-100 dark:bg-yellow-900/30", border: "border-yellow-300 dark:border-yellow-700", dot: "bg-yellow-500", cardBg: "bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/10 dark:to-gray-800" },
    CONFIRMED: { label: "Confirmed", color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-100 dark:bg-blue-900/30", border: "border-blue-300 dark:border-blue-700", dot: "bg-blue-500", cardBg: "bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-800" },
    PREPARING: { label: "Preparing", color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-100 dark:bg-purple-900/30", border: "border-purple-300 dark:border-purple-700", dot: "bg-purple-500", cardBg: "bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/10 dark:to-gray-800" },
    KITCHEN_READY: { label: "Kitchen Ready", color: "text-indigo-700 dark:text-indigo-300", bg: "bg-indigo-100 dark:bg-indigo-900/30", border: "border-indigo-300 dark:border-indigo-700", dot: "bg-indigo-500", cardBg: "bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/10 dark:to-gray-800" },
    OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "text-orange-700 dark:text-orange-300", bg: "bg-orange-100 dark:bg-orange-900/30", border: "border-orange-300 dark:border-orange-700", dot: "bg-orange-500", cardBg: "bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/10 dark:to-gray-800" },
    DELIVERED: { label: "Delivered", color: "text-green-700 dark:text-green-300", bg: "bg-green-100 dark:bg-green-900/30", border: "border-green-300 dark:border-green-700", dot: "bg-green-500", cardBg: "bg-gradient-to-br from-green-50 to-white dark:from-green-900/10 dark:to-gray-800" },
    CANCELLED: { label: "Cancelled", color: "text-red-700 dark:text-red-300", bg: "bg-red-100 dark:bg-red-900/30", border: "border-red-300 dark:border-red-700", dot: "bg-red-500", cardBg: "bg-gradient-to-br from-red-50 to-white dark:from-red-900/10 dark:to-gray-800" },
};

function StatusPill({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["PENDING"];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function getStatusBadge(status: string) {
    const base = "px-2 py-1 rounded text-xs font-medium";
    const cfg = STATUS_CONFIG[status];
    if (!cfg) return base;
    return `${base} ${cfg.bg} ${cfg.color}`;
}

/* ── ORDER CARD ─────────────────────────────────────────────── */
function OrderCard({ order, onChangeStatus, onView }: {
    order: any;
    onChangeStatus: (o: any) => void;
    onView: (o: any) => void;
}) {
    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG["PENDING"];
    // collect first 3 item thumbnails
    const thumbs = order.items?.slice(0, 3).map((i: any) => i.menuItem?.image).filter(Boolean) ?? [];
    const extraItems = (order.items?.length ?? 0) - 3;

    return (
        <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.cardBg} shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden group`}>

            {/* Header */}
            <div className={`px-4 pt-4 pb-3 flex justify-between items-start`}>
                <div>
                    <p className="text-base font-bold text-gray-800 dark:text-gray-100">Order #{order.orderNo}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleString("en-PK", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                </div>
                <StatusPill status={order.status} />
            </div>

            {/* Thumbnails row */}
            {thumbs.length > 0 && (
                <div className="px-4 pb-2 flex gap-2 items-center">
                    {thumbs.map((src: string, i: number) => (
                        <img
                            key={i}
                            src={src}
                            alt="item"
                            className="w-12 h-12 rounded-xl object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop"; }}
                        />
                    ))}
                    {extraItems > 0 && (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 border-2 border-white dark:border-gray-700">
                            +{extraItems}
                        </div>
                    )}
                </div>
            )}

            {/* Info */}
            <div className="px-4 pb-3 flex-1 space-y-1.5">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{order.branch?.name || "—"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {order.customer
                        ? `${order.customer.name}${order.source && order.source !== "WEBSITE" ? ` (${order.source})` : ""}`
                        : order.source === "POS" ? "POS Order" : "Guest"
                    }
                </p>

                {/* Items list */}
                <div className="pt-1 space-y-1">
                    {order.items?.slice(0, 3).map((item: any) => (
                        <div key={item.id} className="flex items-center gap-2">
                            {item.menuItem?.image && (
                                <img
                                    src={item.menuItem.image}
                                    alt={item.menuItem.name}
                                    className="w-6 h-6 rounded-md object-cover flex-shrink-0"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                />
                            )}
                            <span className="text-xs text-gray-600 dark:text-gray-300 truncate flex-1">
                                {item.menuItem?.name}
                            </span>
                            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0">×{item.quantity}</span>
                        </div>
                    ))}
                    {(order.items?.length ?? 0) > 3 && (
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 pl-8">+{order.items.length - 3} more</p>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className={`px-4 py-3 border-t ${cfg.border} flex justify-between items-center gap-2`}>
                <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">Total</p>
                    <p className="text-base font-bold text-gray-900 dark:text-gray-100">Rs. {parseFloat(order.total).toFixed(0)}</p>
                </div>
                <div className="flex gap-1.5">
                    <button
                        onClick={() => onView(order)}
                        className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-gray-400 transition-colors"
                        title="View Details"
                    >
                        <Eye size={15} className="text-gray-600 dark:text-gray-300" />
                    </button>
                    <button
                        onClick={() => onChangeStatus(order)}
                        className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg ${cfg.bg} ${cfg.color} border ${cfg.border} hover:opacity-80 transition-opacity`}
                    >
                        Update <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── MAIN PAGE ───────────────────────────────────────────────── */
export default function IncomingOrdersPage() {
    const [activeTab, setActiveTab] = useState<"latest" | "all">("latest");
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [branches, setBranches] = useState<any[]>([]);
    const [branchFilter, setBranchFilter] = useState("ALL");
    // Separate status filters per tab
    const [latestStatusFilter, setLatestStatusFilter] = useState("PENDING");
    const [allStatusFilter, setAllStatusFilter] = useState("ALL");
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    // Sound alert state
    const [isMuted, setIsMuted] = useState(false);
    const isMutedRef = useRef(false);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const ringIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isRingingRef = useRef(false);

    // Play a rich loud ring using Web Audio API (two oscillators + compressor)
    const playDing = () => {
        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const ctx = audioCtxRef.current;

            const compressor = ctx.createDynamicsCompressor();
            compressor.connect(ctx.destination);

            // First tone — high bell
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = "sine";
            osc1.frequency.setValueAtTime(1046, ctx.currentTime); // C6
            osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4);
            gain1.gain.setValueAtTime(0.9, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            osc1.connect(gain1);
            gain1.connect(compressor);
            osc1.start(ctx.currentTime);
            osc1.stop(ctx.currentTime + 0.8);

            // Second tone — lower echo
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(523, ctx.currentTime + 0.1); // C5
            osc2.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
            gain2.gain.setValueAtTime(0.7, ctx.currentTime + 0.1);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
            osc2.connect(gain2);
            gain2.connect(compressor);
            osc2.start(ctx.currentTime + 0.1);
            osc2.stop(ctx.currentTime + 0.9);
        } catch (e) { /* ignore */ }
    };

    const startRing = () => {
        if (isRingingRef.current) return;
        isRingingRef.current = true;
        if (!isMutedRef.current) playDing();
        ringIntervalRef.current = setInterval(() => {
            if (!isMutedRef.current) playDing();
        }, 3000);
    };

    const stopRing = () => {
        isRingingRef.current = false;
        if (ringIntervalRef.current) {
            clearInterval(ringIntervalRef.current);
            ringIntervalRef.current = null;
        }
    };

    const toggleMute = () => {
        const next = !isMuted;
        setIsMuted(next);
        isMutedRef.current = next;
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => { stopRing(); };
    }, []);

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
    const [assignedRider, setAssignedRider] = useState<any>(null);
    const [loadingRiderDetails, setLoadingRiderDetails] = useState(false);

    useEffect(() => { fetchBranches(); }, []);

    // Fetch on filter change — tab specific
    const activeStatusFilter = activeTab === "latest" ? latestStatusFilter : allStatusFilter;
    useEffect(() => { fetchOrders(); }, [branchFilter, latestStatusFilter, allStatusFilter, activeTab]);

    // 30s polling — both tabs
    useEffect(() => {
        pollingRef.current = setInterval(() => {
            fetchOrders(true);
        }, 30000);
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [branchFilter, latestStatusFilter, allStatusFilter, activeTab]);

    // Ring when pending orders exist
    useEffect(() => {
        const hasPending = orders.some((o: any) => o.status === "PENDING");
        if (hasPending) startRing();
        else stopRing();
    }, [orders]);

    const fetchBranches = async () => {
        try {
            const res = await api.get("/branches");
            if (res.data?.success) setBranches(res.data.data);
        } catch (err) { console.error(err); }
    };

    const fetchOrders = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const params: string[] = [];
            if (branchFilter !== "ALL") params.push(`branchId=${branchFilter}`);
            // Use the active tab's status filter
            const currentStatusFilter = activeTab === "latest" ? latestStatusFilter : allStatusFilter;
            if (currentStatusFilter !== "ALL") params.push(`status=${currentStatusFilter}`);
            const query = params.length ? `?${params.join("&")}` : "";
            const res = await api.get(`/orders${query}`);
            if (res.data?.success) {
                const sorted = res.data.data.sort(
                    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setOrders(sorted);
                setLastRefreshed(new Date());
            }
        } catch (err) { console.error(err); }
        finally { if (!silent) setLoading(false); }
    };

    const fetchAvailableRiders = async () => {
        try {
            setLoadingRiders(true);
            const res = await api.get("/riders?status=AVAILABLE");
            if (res.data?.success) setAvailableRiders(res.data.data);
        } catch (err) { console.error(err); }
        finally { setLoadingRiders(false); }
    };

    const fetchRiderDetails = async (riderId: string) => {
        try {
            setLoadingRiderDetails(true);
            const res = await api.get(`/riders/${riderId}`);
            if (res.data?.success) setAssignedRider(res.data.data);
        } catch (err) { setAssignedRider(null); }
        finally { setLoadingRiderDetails(false); }
    };

    const openStatusModal = (order: any) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setSelectedRiderId("");
        setStatusModal(true);
    };

    const openViewModal = (order: any) => {
        setViewOrder(order);
        setIsViewModalOpen(true);
        if (order.riderId) fetchRiderDetails(order.riderId);
        else setAssignedRider(null);
    };

    const handleStatusUpdate = async () => {
        if (!selectedOrder || !newStatus) return;
        if (newStatus === "OUT_FOR_DELIVERY" && !selectedRiderId) {
            alert("Please select a rider");
            return;
        }
        try {
            setUpdating(true);
            const payload: any = {
                status: newStatus,
                paymentStatus: newStatus === "DELIVERED" ? "PAID"
                    : selectedOrder.payment?.status === "PAID" ? "PAID" : "PENDING",
            };
            if (newStatus === "OUT_FOR_DELIVERY" && selectedRiderId) payload.riderId = selectedRiderId;
            await api.put(`/orders/${selectedOrder.id}`, payload);
            setStatusModal(false);
            setSelectedRiderId("");
            fetchOrders();
        } catch (err) { console.error(err); }
        finally { setUpdating(false); }
    };

    const latestSix = orders;

    /* ── Filters bar (tab-aware) ── */
    const FiltersBar = () => {
        const statusVal = activeTab === "latest" ? latestStatusFilter : allStatusFilter;
        const setStatusVal = activeTab === "latest" ? setLatestStatusFilter : setAllStatusFilter;
        return (
            <div className="flex flex-wrap gap-2 items-center">
                <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="ALL">All Branches</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <select
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value)}
                    className="text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="ALL">All Statuses</option>
                    {ORDER_STATUSES.map((st) => <option key={st} value={st}>{STATUS_CONFIG[st]?.label || st}</option>)}
                </select>
                <button
                    onClick={() => fetchOrders()}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </button>
                {/* Mute toggle */}
                <button
                    onClick={toggleMute}
                    title={isMuted ? "Unmute alert" : "Mute alert"}
                    className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border transition-colors font-medium ${isMuted
                        ? "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                        : "border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                        }`}
                >
                    {isMuted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    {isMuted ? "Unmute" : "Sound On"}
                </button>
            </div>
        );
    };

    const renderOrderItems = (order: any) => (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg space-y-2">
            {order?.items?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 border-b dark:border-gray-600 pb-2 last:border-0 last:pb-0">
                    {item.menuItem?.image && (
                        <img
                            src={item.menuItem.image}
                            alt={item.menuItem.name}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    )}
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{item.menuItem?.name} × {item.quantity}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Rs. {parseFloat(item.price) * item.quantity}</span>
                </div>
            ))}
            <div className="flex justify-between pt-2 border-t dark:border-gray-600 font-bold text-base">
                <span>Total</span>
                <span>Rs. {order?.total}</span>
            </div>
        </div>
    );

    return (
        <ProtectedRoute module="orders">
            <div className="min-h-screen p-4 md:p-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl dark:text-gray-200">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Incoming Orders</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {loading ? "Loading..." : `${orders.length} orders found`}
                        </p>
                    </div>
                    <FiltersBar />
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit mb-6">
                    <button
                        onClick={() => setActiveTab("latest")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "latest"
                            ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Latest Orders
                        {latestSix.length > 0 && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "latest" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>
                                {latestSix.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "all"
                            ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                    >
                        <List className="w-4 h-4" />
                        All Orders
                        {orders.length > 0 && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "all" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>
                                {orders.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* ── LATEST ORDERS TAB ── */}
                {activeTab === "latest" && (
                    loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 h-72 animate-pulse">
                                    <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-t-2xl" />
                                    <div className="p-4 space-y-3">
                                        <div className="flex gap-2">
                                            {[...Array(3)].map((_, j) => <div key={j} className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl" />)}
                                        </div>
                                        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-2/3" />
                                        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : latestSix.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <RefreshCw className="w-12 h-12 mb-3 opacity-30" />
                            <p className="text-lg font-medium">No orders found</p>
                            <p className="text-sm mt-1">Try changing filters or refresh</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {latestSix.map((order) => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    onChangeStatus={openStatusModal}
                                    onView={openViewModal}
                                />
                            ))}
                        </div>
                    )
                )}

                {/* ── ALL ORDERS TAB ── */}
                {activeTab === "all" && (
                    loading ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 h-64 animate-pulse" />
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <RefreshCw className="w-12 h-12 mb-3 opacity-30" />
                            <p className="text-lg font-medium">No orders found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700">
                            <table className="min-w-[800px] w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700/60">
                                    <tr>
                                        {["#", "Order", "Customer", "Branch", "Type", "Status", "Total", "Time", "Actions"].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {orders.map((order: any, index: number) => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                            <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs">{index + 1}</td>
                                            <td className="px-4 py-3 font-bold text-gray-800 dark:text-gray-200">#{order.orderNo}</td>
                                            <td className="px-4 py-3">
                                                {order.customer
                                                    ? <span className="text-gray-700 dark:text-gray-300">
                                                        {order.customer.name}
                                                        {order.source && order.source !== "WEBSITE" && (
                                                            <span className="ml-1 text-blue-500 text-[10px] font-bold">({order.source})</span>
                                                        )}
                                                    </span>
                                                    : order.source === "POS"
                                                        ? <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">POS</span>
                                                        : <span className="text-gray-400 text-xs">—</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{order.branch?.name || "—"}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{order.type?.replace("_", " ")}</td>
                                            <td className="px-4 py-3">
                                                <span className={getStatusBadge(order.status)}>{STATUS_CONFIG[order.status]?.label || order.status}</span>
                                            </td>
                                            <td className="px-4 py-3 font-bold text-gray-800 dark:text-gray-200">Rs. {parseFloat(order.total).toFixed(0)}</td>
                                            <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(order.createdAt).toLocaleString("en-PK", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1.5">
                                                    <button
                                                        onClick={() => openViewModal(order)}
                                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                                        title="View"
                                                    >
                                                        <Eye size={15} className="text-gray-500 dark:text-gray-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => openStatusModal(order)}
                                                        className="text-xs px-2.5 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold"
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
                    )
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
                        { label: "Status", render: (data: any) => <StatusPill status={data?.status || "PENDING"} /> },
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

                {/* STATUS MODAL */}
                {statusModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
                            <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                                <div>
                                    <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">Change Status</h2>
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
                                            setNewStatus(e.target.value);
                                            if (e.target.value === "OUT_FOR_DELIVERY") fetchAvailableRiders();
                                        }}
                                        className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {ORDER_STATUSES.map((st) => (
                                            <option key={st} value={st}>{STATUS_CONFIG[st]?.label || st}</option>
                                        ))}
                                    </select>
                                </div>

                                {newStatus === "DELIVERED" && (
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                        <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                                            ✅ Payment will automatically be marked as <strong>PAID</strong>
                                        </p>
                                    </div>
                                )}

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
                                    className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={updating}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2.5 rounded-lg text-sm font-bold transition-colors"
                                >
                                    {updating ? "Updating..." : "Update Status"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
