"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import api from "@/services/api";
import {
  Eye,
  X,
  Star,
  RefreshCw,
  Search,
  Filter,
  Download,
  Printer,
  ChevronDown,
  Bike,
  ShoppingBag,
  UtensilsCrossed,
  Monitor,
  Smartphone,
  Globe,
  MoreVertical,
  Calendar,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ViewDetailModal } from "@/components/ViewDetailModal";
import ReceiptModal from "@/components/orders/ReceiptModal";
import { ProtectedRoute } from "@/services/protected-route";
import Loader from "@/components/common/Loader";
import { Modal } from "@/components/ui/modal";
import DatePicker from "@/components/common/DatePicker";

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
  const base = "px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider";
  switch (status) {
    case "PENDING":
      return `${base} bg-amber-100 text-amber-700 border border-amber-200`;
    case "CONFIRMED":
      return `${base} bg-brand-100 text-brand-700 border border-brand-200`;
    case "PREPARING":
      return `${base} bg-purple-100 text-purple-700 border border-purple-200`;
    case "KITCHEN_READY":
      return `${base} bg-cyan-100 text-cyan-700 border border-cyan-200`;
    case "OUT_FOR_DELIVERY":
      return `${base} bg-orange-100 text-orange-700 border border-orange-200`;
    case "DELIVERED":
      return `${base} bg-emerald-100 text-emerald-700 border border-emerald-200`;
    case "CANCELLED":
      return `${base} bg-rose-100 text-rose-700 border border-rose-200`;
    default:
      return base;
  }
};

const getSourceIcon = (source: string) => {
  switch (source) {
    case "POS":
      return <Monitor size={14} />;
    case "MOBILE":
      return <Smartphone size={14} />;
    default:
      return <Globe size={14} />;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "DELIVERY":
      return <Bike size={14} />;
    case "PICKUP":
      return <ShoppingBag size={14} />;
    default:
      return <UtensilsCrossed size={14} />;
  }
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders]: any = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters State
  const [searchRef, setSearchRef] = useState("");
  const [searchCustomerRef, setSearchCustomerRef] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");

  // Date Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Selection
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  // View Modal State
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Print Modal State
  const [printOrder, setPrintOrder] = useState<any>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Status Update State
  const [statusModal, setStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder]: any = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  // Rider States
  const [availableRiders, setAvailableRiders] = useState<any[]>([]);
  const [selectedRiderId, setSelectedRiderId] = useState("");
  const [loadingRiders, setLoadingRiders] = useState(false);
  const [assignedRider, setAssignedRider] = useState<any>(null);
  const [loadingRiderDetails, setLoadingRiderDetails] = useState(false);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    // IF EITHER DATE IS SELECTED, BOTH MUST BE SELECTED
    if ((startDate && !endDate) || (!startDate && endDate)) {
      return;
    }

    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const params: any = {};
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get(`/orders`, { params });
      if (res.data?.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error("Orders fetch failed", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, startDate, endDate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
      console.error("Failed to fetch rider details", err);
      setAssignedRider(null);
    } finally {
      setLoadingRiderDetails(false);
    }
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
        paymentStatus: newStatus === "DELIVERED" ? "PAID" : selectedOrder.payment?.status === "PAID" ? "PAID" : "PENDING",
      };
      if (newStatus === "OUT_FOR_DELIVERY" && selectedRiderId) payload.riderId = selectedRiderId;

      await api.put(`/orders/${selectedOrder.id}`, payload);
      setStatusModal(false);
      setSelectedRiderId("");
      fetchOrders(true);
    } catch (err) {
      console.error("Status update failed", err);
    } finally {
      setUpdating(false);
    }
  };

  // Derived filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o: any) => {
      const matchRef = searchRef ? o.orderNo?.toString().includes(searchRef) : true;
      const matchCustomerRef = searchCustomerRef ? (o.customerId?.toLowerCase().includes(searchCustomerRef.toLowerCase())) : true;
      const matchPhone = searchPhone ? o.customer?.phone?.includes(searchPhone) : true;
      const matchName = searchName ? o.customer?.name?.toLowerCase().includes(searchName.toLowerCase()) : true;
      const matchStatus = statusFilter === "ALL" ? true : o.status === statusFilter;
      const matchPayment = paymentFilter === "ALL" ? true : o.payment?.method === paymentFilter;
      return matchRef && matchCustomerRef && matchPhone && matchName && matchStatus && matchPayment;
    });
  }, [orders, searchRef, searchCustomerRef, searchPhone, searchName, statusFilter, paymentFilter]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: any = { ALL: orders.length };
    ORDER_STATUSES.forEach(s => {
      counts[s] = orders.filter((o: any) => o.status === s).length;
    });
    // Processing count often groups PREPARING and KITCHEN_READY
    counts["PROCESSING"] = orders.filter((o: any) => ["CONFIRMED", "PREPARING", "KITCHEN_READY"].includes(o.status)).length;
    return counts;
  }, [orders]);

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((o: any) => o.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter(sid => sid !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const openViewModal = (order: any) => {
    router.push(`/orders/${order.id}`);
  };

  const openPrintModal = (order: any) => {
    setPrintOrder(order);
    setIsPrintModalOpen(true);
  };

  const openStatusModal = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setSelectedRiderId("");
    setStatusModal(true);
  };

  const exportToCSV = () => {
    if (filteredOrders.length === 0) return;

    // Define headers
    const headers = ["Order#", "Customer", "Phone", "Branch", "Type", "Payment", "Total", "Status", "Platform", "Date"];

    // Create rows
    const rows = filteredOrders.map((o: any) => [
      `#${o.orderNo}`,
      o.customer?.name || "Guest",
      o.customer?.phone || "N/A",
      o.branch?.name || "Main",
      o.type,
      o.payment?.method || "CASH",
      o.total,
      o.status,
      o.source || "WEB",
      new Date(o.createdAt).toLocaleString()
    ]);

    // Combine into CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map((r: any[]) => r.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    // Trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ProtectedRoute module="customers-orders:orders-history">
      <div className="min-h-screen bg-white dark:bg-gray-950">

        {/* Header Bar - Purple Theme with Combined Filters */}
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 p-4 shadow-lg flex flex-wrap justify-between items-center text-white gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg  border border-white/20">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Incoming Orders</h1>
              <p className="text-[10px] opacity-80 uppercase font-bold tracking-widest">Powered by BMS POS</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* DATE FILTER */}
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-5 py-2 rounded-xl border border-white/20 shadow-sm text-gray-700 dark:text-white min-w-[340px]">
              <div className="flex flex-1 items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-gray-400">From</span>
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="Select"
                  className="bg-transparent text-xs font-bold outline-none cursor-pointer"
                />
              </div>
              <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-700 mx-2"></div>
              <div className="flex flex-1 items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-gray-400">To</span>
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="Select"
                  className="bg-transparent text-xs font-bold outline-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full border border-green-400/30 text-[10px] font-bold">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              ONLINE
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-6 space-y-6">

          {/* Filters Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Ref #</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search by Ref #"
                    value={searchRef}
                    onChange={(e) => setSearchRef(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-xs text-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Customer Ref #</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="text"
                    placeholder="Customer Ref #"
                    value={searchCustomerRef}
                    onChange={(e) => setSearchCustomerRef(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-xs text-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Phone Number</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search by Phone"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-xs text-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Customer Name</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search by Name"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-xs text-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-xs font-medium text-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="ALL">Select status</option>
                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-xs font-medium text-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="ALL">Payment Type</option>
                <option value="CASH">CASH</option>
                <option value="CARD">CARD</option>
                <option value="STRIPE">STRIPE</option>
              </select>
              <div className="flex-1" />
              <button
                onClick={() => fetchOrders(true)}
                disabled={refreshing}
                className="flex items-center gap-2 bg-brand-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-brand-700 disabled:opacity-50 transition-all shadow-md active:scale-95"
              >
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Reload Orders
              </button>
              <button
                onClick={exportToCSV}
                disabled={filteredOrders.length === 0}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-5 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95 border border-gray-200 dark:border-gray-600"
              >
                <Download size={14} /> Export Details
              </button>
            </div>
          </div>

          {/* Status Tabs - Purple Theme */}
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
            <button
              onClick={() => setStatusFilter("PENDING")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 transition-all whitespace-nowrap ${statusFilter === "PENDING"
                ? "bg-brand-50 border-brand-600 text-brand-700 font-bold"
                : "bg-white dark:bg-gray-800 border-transparent text-gray-500 hover:bg-gray-50 shadow-sm"
                }`}
            >
              New Orders <span className={`text-[10px] flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-white ${statusFilter === "PENDING" ? "bg-brand-600" : "bg-gray-400"}`}>{tabCounts.PENDING}</span>
            </button>
            <button
              onClick={() => setStatusFilter("CONFIRMED")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 transition-all whitespace-nowrap ${statusFilter === "CONFIRMED"
                ? "bg-brand-50 border-brand-600 text-brand-700 font-bold"
                : "bg-white dark:bg-gray-800 border-transparent text-gray-500 hover:bg-gray-50 shadow-sm"
                }`}
            >
              Processing <span className={`text-[10px] flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-white ${statusFilter === "CONFIRMED" ? "bg-brand-600" : "bg-gray-400"}`}>{tabCounts.PROCESSING}</span>
            </button>
            <button
              onClick={() => setStatusFilter("DELIVERED")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 transition-all whitespace-nowrap ${statusFilter === "DELIVERED"
                ? "bg-green-50 border-green-600 text-green-700 font-bold"
                : "bg-white dark:bg-gray-800 border-transparent text-gray-500 hover:bg-gray-50 shadow-sm"
                }`}
            >
              Completed <span className={`text-[10px] flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-white ${statusFilter === "DELIVERED" ? "bg-green-600" : "bg-gray-400"}`}>{tabCounts.DELIVERED}</span>
            </button>
            <button
              onClick={() => setStatusFilter("CANCELLED")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 transition-all whitespace-nowrap ${statusFilter === "CANCELLED"
                ? "bg-rose-50 border-rose-600 text-rose-700 font-bold"
                : "bg-white dark:bg-gray-800 border-transparent text-gray-500 hover:bg-gray-50 shadow-sm"
                }`}
            >
              Cancellations <span className={`text-[10px] flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-white ${statusFilter === "CANCELLED" ? "bg-rose-600" : "bg-gray-400"}`}>{tabCounts.CANCELLED}</span>
            </button>
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 transition-all whitespace-nowrap ${statusFilter === "ALL"
                ? "bg-brand-600 border-brand-600 text-white font-bold"
                : "bg-white dark:bg-gray-800 border-transparent text-gray-500 hover:bg-gray-50 shadow-sm"
                }`}
            >
              All Orders
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead className="bg-gray-50 dark:bg-gray-700/30">
                  <tr className="border-b dark:border-gray-700">
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                    </th>
                    <th className="p-4 w-20 text-[10px] font-black uppercase text-gray-400 tracking-widest">Actions</th>
                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Order Info</th>
                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Branch</th>
                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Customer</th>
                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Mode</th>
                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Payment</th>
                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Pricing</th>
                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Platform</th>
                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {loading ? (
                    <tr><td colSpan={15} className="py-20 text-center"><Loader size="md" /></td></tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr><td colSpan={15} className="py-20 text-center text-gray-400 text-xs font-bold italic">No orders found match your criteria</td></tr>
                  ) : (
                    filteredOrders.map((o: any) => (
                      <tr
                        key={o.id}
                        className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors border-b dark:border-gray-800/50 last:border-0"
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(o.id)}
                            onChange={() => toggleSelect(o.id)}
                            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 transition-opacity">
                            <button
                              onClick={() => openPrintModal(o)}
                              className="p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-all text-gray-500 dark:text-gray-400"
                            >
                              <Printer size={13} />
                            </button>
                            <button
                              onClick={() => openStatusModal(o)}
                              className="p-2 bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-600 hover:text-white rounded-lg transition-all text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-500/10"
                            >
                              <RefreshCw size={13} />
                            </button>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-gray-900 dark:text-white leading-none tracking-tight">#{o.orderNo}</span>
                            <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase">ID: {o.id?.slice(-6)}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300">
                            <MapPin size={12} className="text-gray-300" />
                            {o.branch?.name || "Main"}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-brand-600 dark:text-brand-400">{o.customer?.name || "Guest"}</span>
                            <span className="text-[10px] text-gray-400 font-medium mt-0.5 tracking-wider">{o.customer?.phone || "NO PHONE"}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${o.type === "DELIVERY" ? "bg-brand-50 text-brand-600 dark:bg-brand-900/40" : "bg-amber-50 text-amber-600 dark:bg-amber-900/40"
                              }`}>
                              {o.type}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <span className={`px-2.5 py-1 rounded border text-[9px] font-black uppercase tracking-widest ${o.payment?.method === "CASH"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-500/20"
                              : "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-500/20"
                              }`}>
                              {o.payment?.method || "CASH"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-gray-900 dark:text-white tracking-widest">${o.total}</span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase opacity-60">Net Total</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1.5 items-start">
                            <span className={getStatusBadge(o.status)}>{o.status}</span>
                            <button onClick={() => openViewModal(o)} className="text-[9px] text-brand-600 font-black uppercase tracking-widest hover:underline">View History</button>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {o.source || 'POS'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col text-[10px] font-bold text-gray-500 dark:text-gray-400">
                            <span className="text-gray-900 dark:text-white">{new Date(o.createdAt).toLocaleDateString()}</span>
                            <span className="opacity-60">{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination / Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/30 border-t dark:border-gray-700 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select className="bg-transparent border-gray-300 dark:border-gray-600 rounded p-1 text-gray-700 dark:text-gray-300">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <span>entries</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Total {filteredOrders.length} records</span>
              </div>
            </div>
          </div>
        </div>
        <ReceiptModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          order={printOrder}
        />

        {/* Status Update Modal */}
        <Modal isOpen={statusModal} onClose={() => setStatusModal(false)} showCloseButton={false} className="max-w-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full overflow-hidden">
            <div className="bg-brand-600 p-4 flex justify-between items-center text-white">
              <h3 className="font-bold">Update Order Status</h3>
              <button onClick={() => setStatusModal(false)}><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Select New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => {
                    setNewStatus(e.target.value);
                    if (e.target.value === "OUT_FOR_DELIVERY") fetchAvailableRiders();
                  }}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {ORDER_STATUSES.map(s => <option key={s} value={s}>{s === "OUT_FOR_DELIVERY" ? "ON THE WAY" : s}</option>)}
                </select>
              </div>
              {newStatus === "OUT_FOR_DELIVERY" && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Assign Rider</label>
                  <select
                    value={selectedRiderId}
                    onChange={(e) => setSelectedRiderId(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">Select a rider</option>
                    {availableRiders.map(r => <option key={r.id} value={r.id}>{r.name} ({r.phone})</option>)}
                  </select>
                </div>
              )}
              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="w-full bg-brand-600 text-white font-bold py-3.5 rounded-2xl hover:bg-brand-700 disabled:opacity-50 shadow-lg shadow-brand-600/20 transition-all active:scale-95 text-sm"
              >
                {updating ? "Updating..." : "Confirm Update"}
              </button>
            </div>
          </div>
        </Modal>

      </div>
    </ProtectedRoute>
  );
}
