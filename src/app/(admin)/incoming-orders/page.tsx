"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import api from "@/services/api";
import {
    Eye, X, RefreshCw, Clock, ChevronRight, LayoutGrid, List, Bell, BellOff,
    Printer, User, Phone, MapPin, Package, CreditCard, Building2, CheckCircle2,
    AlertCircle, Truck, ChefHat, Star,
} from "lucide-react";
import { ProtectedRoute } from "@/services/protected-route";
import Loader from "@/components/common/Loader";
import DatePicker from "@/components/common/DatePicker";
import { toast } from "sonner";

const ORDER_STATUSES = [
    "PENDING", "CONFIRMED", "PREPARING", "KITCHEN_READY",
    "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED",
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; dot: string; cardBg: string }> = {
    PENDING: { label: "Pending", color: "text-yellow-700 dark:text-yellow-300", bg: "bg-yellow-100 dark:bg-yellow-900/30", border: "border-yellow-300 dark:border-yellow-700", dot: "bg-yellow-500", cardBg: "bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/10 dark:to-gray-800" },
    CONFIRMED: { label: "Confirmed", color: "text-brand-700 dark:text-brand-300", bg: "bg-brand-50 dark:bg-brand-900/30", border: "border-brand-200 dark:border-brand-700", dot: "bg-brand-500", cardBg: "bg-gradient-to-br from-brand-50/50 to-white dark:from-brand-900/10 dark:to-gray-800" },
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

/* ── PRINT RECEIPT ──────────────────────────────────────────── */
function printOrderReceipt(order: any) {
    const items = order?.items || [];
    const subtotal = items.reduce((s: number, i: any) => s + parseFloat(i.price) * i.quantity, 0);
    const date = new Date(order.createdAt).toLocaleString("en-PK", { hour12: true });
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Receipt</title>
    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Courier New',monospace;font-size:12px;width:80mm;padding:4mm 3mm;color:#000;background:#fff}
        .c{text-align:center}.b{font-weight:bold}.lg{font-size:16px}.sm{font-size:10px}
        .div{border-top:1px dashed #000;margin:4px 0}
        .row{display:flex;justify-content:space-between;margin:2px 0}
        .ri{display:flex;justify-content:space-between;margin:3px 0;align-items:flex-start}
        .tr{display:flex;justify-content:space-between;font-weight:bold;font-size:14px;margin:4px 0}
        @media print{body{width:80mm}@page{margin:0;size:80mm auto}}
    </style></head><body>
    <div class="c b lg">RMS POS</div>
    <div class="c sm">Order Receipt</div>
    <div class="c sm">${date}</div>
    <div class="c b">Order #${order.orderNo || ''}</div>
    <div class="div"></div>
    <div class="row sm"><span>Type: <b>${(order.type || '').replace('_', ' ')}</b></span><span>Src: <b>${order.source || 'N/A'}</b></span></div>
    ${order.customerName ? `<div class="sm">Customer: <b>${order.customerName}</b></div>` : order.customer?.name ? `<div class="sm">Customer: <b>${order.customer.name}</b></div>` : ''}
    ${order.customer?.phone ? `<div class="sm">Phone: ${order.customer.phone}</div>` : ''}
    ${order.tableNumber ? `<div class="sm">Table: ${order.tableNumber}</div>` : ''}
    ${order.deliveryAddress ? `<div class="sm">Address: ${order.deliveryAddress}</div>` : ''}
    ${order.branch?.name ? `<div class="sm">Branch: ${order.branch.name}</div>` : ''}
    <div class="div"></div>
    <div class="row b sm"><span>ITEM</span><span>QTY</span><span>PRICE</span></div>
    <div class="div"></div>
    ${items.map((item: any) => `
        <div class="ri">
            <span style="flex:1;margin-right:4px">${item.menuItem?.name || 'Item'}</span>
            <span style="min-width:20px;text-align:center">${item.quantity}</span>
            <span style="min-width:50px;text-align:right">$${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
        </div>`).join('')}
    <div class="div"></div>
    <div class="row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
    <div class="div"></div>
    <div class="tr"><span>TOTAL</span><span>$${parseFloat(order.total).toFixed(2)}</span></div>
    <div class="div"></div>
    <div class="c sm" style="margin-top:8px">Thank you! Please come again.</div>
    </body></html>`;
    const iframe = document.createElement('iframe');
    Object.assign(iframe.style, { position: 'fixed', top: '-9999px', left: '-9999px', width: '80mm', height: '0' });
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) return;
    doc.open(); doc.write(html); doc.close();
    iframe.contentWindow?.focus();
    setTimeout(() => { iframe.contentWindow?.print(); setTimeout(() => document.body.removeChild(iframe), 1000); }, 400);
}

/* ── ORDER DETAIL MODAL ──────────────────────────────────────── */
function OrderDetailModal({
    order,
    isOpen,
    onClose,
    onStatusChange,
    loadingRiderDetails,
    assignedRider,
}: {
    order: any;
    isOpen: boolean;
    onClose: () => void;
    onStatusChange: (order: any, quick?: boolean) => void;
    loadingRiderDetails: boolean;
    assignedRider: any;
}) {
    if (!isOpen || !order) return null;

    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG["PENDING"];
    const items = order.items || [];
    const subtotal = items.reduce((s: number, i: any) => s + parseFloat(i.price) * i.quantity, 0);
    const customer = order.customer;
    const isPOS = order.source === "POS";
    const orderDate = new Date(order.createdAt);

    const typeIcons: Record<string, any> = {
        DINE_IN: ChefHat,
        PICKUP: Package,
        DELIVERY: Truck,
    };
    const TypeIcon = typeIcons[order.type] || Package;

    const typeColors: Record<string, string> = {
        DINE_IN: "bg-purple-600",
        PICKUP: "bg-cyan-600",
        DELIVERY: "bg-orange-500",
    };
    const typeBannerColor = typeColors[order.type] || "bg-brand-600";

    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
        };
    }, []);

    return createPortal(
        <div
            className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden"
                style={{ maxHeight: "90vh" }}
                onClick={(e) => e.stopPropagation()}
            >

                {/* ── TOP ACTION BAR ── */}
                <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => printOrderReceipt(order)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                        <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                    <button
                        onClick={() => { onStatusChange(order, false); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Change Status
                    </button>
                    {["PENDING", "CONFIRMED", "PREPARING", "KITCHEN_READY"].includes(order.status) && (
                        <button
                            onClick={() => onStatusChange(order, true)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                            {order.status === "PENDING" ? "Confirm" :
                                order.status === "CONFIRMED" ? "Start Preparing" :
                                    order.status === "PREPARING" ? "Mark Ready" : "Dispatch"}
                        </button>
                    )}
                    <div className="ml-auto">
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* ── BODY ── */}
                <div className="flex flex-1 overflow-hidden">

                    {/* LEFT PANEL — Customer */}
                    <div className="w-[260px] flex-shrink-0 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
                        {/* Avatar */}
                        <div className="flex flex-col items-center pt-6 pb-4 px-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-3 ring-4 ring-white dark:ring-gray-800 shadow">
                                {customer?.image
                                    ? <img src={customer.image} alt="" className="w-full h-full rounded-full object-cover" />
                                    : <User className="w-10 h-10 text-gray-400" />
                                }
                            </div>
                            <p className="font-bold text-gray-800 dark:text-gray-100 text-sm text-center">
                                {customer?.name || (isPOS ? "POS Order" : "Guest Customer")}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-0.5">
                                {customer?.email || ""}
                            </p>
                            <span className={`mt-2 text-[10px] px-2.5 py-1 rounded-full font-bold ${cfg.bg} ${cfg.color} ${cfg.border} border`}>
                                {cfg.label}
                            </span>
                        </div>

                        {/* Customer Details */}
                        <div className="p-4 space-y-3">
                            <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer Details</p>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2.5 p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                                    <User className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Name</p>
                                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                                            {customer?.name || (isPOS ? "POS" : "—")}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                                    <Phone className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Phone</p>
                                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                                            {customer?.phone || "—"}
                                        </p>
                                    </div>
                                </div>

                                {order.tableNumber && (
                                    <div className="flex items-center gap-2.5 p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                                        <Star className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Table</p>
                                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{order.tableNumber}</p>
                                        </div>
                                    </div>
                                )}

                                {order.deliveryAddress && (
                                    <div className="flex items-start gap-2.5 p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                                        <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Address</p>
                                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-snug">{order.deliveryAddress}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2.5 p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                                    <Building2 className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Branch</p>
                                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{order.branch?.name || "—"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Rider info */}
                            {order.riderId && (
                                <div className="mt-2">
                                    <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Assigned Rider</p>
                                    {loadingRiderDetails
                                        ? <Loader size="sm" className="space-y-0" />
                                        : assignedRider
                                            ? (
                                                <div className="p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                                                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{assignedRider.name}</p>
                                                    <p className="text-[11px] text-gray-500">{assignedRider.phone}</p>
                                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${assignedRider.status === "AVAILABLE" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                                                        {assignedRider.status}
                                                    </span>
                                                </div>
                                            )
                                            : <p className="text-xs text-gray-400">—</p>
                                    }
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL — Order Details */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-5 space-y-5">

                            {/* Title */}
                            <h2 className="text-xl font-black text-gray-800 dark:text-gray-100">Order Details</h2>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                                <div className="p-3 border-r border-b border-gray-200 dark:border-gray-700">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Ref #</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{order.orderNo || order.id?.slice(0, 8)}</p>
                                </div>
                                <div className="p-3 border-r border-b border-gray-200 dark:border-gray-700">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Source</p>
                                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-black ${order.source === "POS"
                                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                        : "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300"
                                        }`}>{order.source || "N/A"}</span>
                                </div>
                                <div className="p-3 border-r border-b border-gray-200 dark:border-gray-700">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Order Status</p>
                                    <StatusPill status={order.status} />
                                </div>
                                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Order Date/Time</p>
                                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        {orderDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                                        &nbsp;{orderDate.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: false })}
                                    </p>
                                </div>

                                <div className="p-3 border-r border-gray-200 dark:border-gray-700">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Branch Name</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{order.branch?.name || "—"}</p>
                                </div>
                                <div className="p-3 border-r border-gray-200 dark:border-gray-700">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Payment Type</p>
                                    <div className="flex items-center gap-1.5">
                                        <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{order.payment?.method || "—"}</p>
                                        <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-black ${order.payment?.status === "PAID"
                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                            }`}>{order.payment?.status || "PENDING"}</span>
                                    </div>
                                </div>
                                <div className="p-3 border-r border-gray-200 dark:border-gray-700">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Order Type</p>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-black text-white ${order.type === "DELIVERY" ? "bg-orange-500"
                                        : order.type === "DINE_IN" ? "bg-purple-600"
                                            : "bg-cyan-600"
                                        }`}>
                                        <TypeIcon className="w-3 h-3" />
                                        {(order.type || "N/A").replace("_", " ")}
                                    </span>
                                </div>
                                <div className="p-3">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Items Count</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{items.length} item{items.length !== 1 ? "s" : ""}</p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <p className="text-sm font-black text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">Order Items</p>
                                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                                    <div className="grid grid-cols-[1fr_auto_auto] text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800 px-4 py-2.5 gap-4">
                                        <span>Item</span>
                                        <span className="text-center">Qty</span>
                                        <span className="text-right">Price</span>
                                    </div>
                                    {items.map((item: any) => (
                                        <div key={item.id} className="grid grid-cols-[1fr_auto_auto] px-4 py-3 gap-4 border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <div className="flex items-center gap-3 min-w-0">
                                                {item.menuItem?.image && (
                                                    <img
                                                        src={item.menuItem.image}
                                                        alt={item.menuItem.name}
                                                        className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-gray-100 dark:border-gray-700"
                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                                    />
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{item.menuItem?.name || "Item"}</p>
                                                    {item.variation && (
                                                        <p className="text-[11px] text-blue-500 dark:text-blue-400">{item.variation.name}</p>
                                                    )}
                                                    {item.addons?.length > 0 && (
                                                        <p className="text-[11px] text-purple-500 dark:text-purple-400">+{item.addons.map((a: any) => a.name).join(", ")}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-sm text-center font-bold text-gray-700 dark:text-gray-300 self-center">×{item.quantity}</span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100 text-right self-center">
                                                ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="mt-3 flex justify-end">
                                    <div className="w-full md:w-64 space-y-1.5 text-sm">
                                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                            <span>Sub Total</span>
                                            <span className="font-semibold">${subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-1.5 font-black text-gray-900 dark:text-gray-100">
                                            <span>Total</span>
                                            <span className="text-brand-600 dark:text-brand-400 text-base">${parseFloat(order.total).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Type Banner */}
                            <div className={`${typeBannerColor} rounded-2xl p-4 flex items-center gap-3 text-white`}>
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                    <TypeIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold opacity-80">Order Type</p>
                                    <p className="text-lg font-black">
                                        This is a{" "}
                                        <span className="italic">{(order.type || "N/A").replace("_", " ")}</span>{" "}
                                        Order
                                    </p>
                                </div>
                                <div className="ml-auto text-right">
                                    <p className="text-xs opacity-80">Placed at</p>
                                    <p className="text-sm font-bold">
                                        {orderDate.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true })}
                                    </p>
                                    <p className="text-xs opacity-70">
                                        {orderDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

/* ── ORDER CARD ─────────────────────────────────────────────── */
function OrderCard({ order, onChangeStatus, onView }: {
    order: any;
    onChangeStatus: (o: any, quick?: boolean) => void;
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
                    <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-gray-800 dark:text-gray-100">Order #{order.orderNo}</p>
                        {order.status === "PENDING" && (
                            <Bell size={16} className="text-yellow-500 animate-bounce" />
                        )}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleString("en-PK", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                </div>
                <StatusPill status={order.status} />
            </div>




            {/* Info */}
            <div className="px-4 pb-3 flex-1 space-y-1.5">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{order.branch?.name || "—"}</p>

                {/* Customer / Source row */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    {order.source === "POS" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[11px] font-black uppercase tracking-wide border border-indigo-200 dark:border-indigo-700">
                            🖥 POS
                        </span>
                    ) : null}
                    {order.customer?.name ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-bold truncate">
                            👤 {order.customer.name}
                        </span>
                    ) : order.source !== "POS" ? (
                        <span className="text-xs text-gray-400 italic">Guest</span>
                    ) : null}
                    {order.source && order.source !== "POS" && order.source !== "WEBSITE" && (
                        <span className="text-[10px] text-gray-400 font-bold uppercase">({order.source})</span>
                    )}
                </div>

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
                    <p className="text-base font-bold text-gray-900 dark:text-gray-100">$ {parseFloat(order.total).toFixed(0)}</p>
                </div>
                <div className="flex gap-1.5">
                    <button
                        onClick={() => onView(order)}
                        className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-gray-400 transition-colors"
                        title="View Details"
                    >
                        <Eye size={15} className="text-gray-600 dark:text-gray-300" />
                    </button>
                    {["PENDING", "CONFIRMED", "PREPARING", "KITCHEN_READY"].includes(order.status) ? (
                        <button
                            onClick={() => onChangeStatus(order, true)}
                            className={`flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-all shadow-md shadow-brand-100 dark:shadow-none animate-in zoom-in-95 duration-200`}
                        >
                            {order.status === "PENDING" ? "Confirm Order" :
                                order.status === "CONFIRMED" ? "Start Preparing" :
                                    order.status === "PREPARING" ? "Mark Ready" :
                                        order.status === "KITCHEN_READY" ? "Send for Delivery" : "Update"}
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={() => onChangeStatus(order, false)}
                            className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg ${cfg.bg} ${cfg.color} border ${cfg.border} hover:opacity-80 transition-opacity`}
                        >
                            Update <ChevronRight className="w-3 h-3" />
                        </button>
                    )}
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
    const [startDate, setStartDate] = useState(new Date(Date.now() - 86400000).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    // Sound alert state
    const [isMuted, setIsMuted] = useState(false);
    const isMutedRef = useRef(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const ringIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isRingingRef = useRef(false);

    // Play custom shop bell sound
    const playDing = () => {
        try {
            if (!audioRef.current) {
                audioRef.current = new Audio("/Shop_bell.wav");
            }
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        } catch (e) { console.error("Audio error:", e); }
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
    useEffect(() => { fetchOrders(); }, [branchFilter, latestStatusFilter, allStatusFilter, activeTab, startDate, endDate]);

    // 30s polling — both tabs
    useEffect(() => {
        pollingRef.current = setInterval(() => {
            fetchOrders(true);
        }, 30000);
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [branchFilter, latestStatusFilter, allStatusFilter, activeTab, startDate, endDate]);

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

            if (startDate) params.push(`startDate=${startDate}`);
            if (endDate) params.push(`endDate=${endDate}`);

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

    const openStatusModal = (order: any, quick = false) => {
        if (quick) {
            handleQuickAction(order);
            return;
        }
        setSelectedOrder(order);
        setNewStatus(order.status);
        setSelectedRiderId("");
        setStatusModal(true);
    };

    const handleQuickAction = async (order: any) => {
        const sequence = ["PENDING", "CONFIRMED", "PREPARING", "KITCHEN_READY", "OUT_FOR_DELIVERY", "DELIVERED"];
        const currentIndex = sequence.indexOf(order.status);

        if (currentIndex === -1 || currentIndex >= sequence.length - 1) return;

        const nextS = sequence[currentIndex + 1];

        // If next step is delivery, we MUST pick a rider, so open modal instead
        if (nextS === "OUT_FOR_DELIVERY") {
            setSelectedOrder(order);
            setNewStatus(nextS);
            fetchAvailableRiders();
            setStatusModal(true);
            return;
        }

        try {
            setLoading(true); // show loader instead of full page lock
            const payload: any = {
                status: nextS,
                paymentStatus: nextS === "DELIVERED" ? "PAID"
                    : order.payment?.status === "PAID" ? "PAID" : "PENDING",
            };
            await api.put(`/orders/${order.id}`, payload);
            toast.success(`Order moved to ${nextS}`);
            fetchOrders(true);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update status");
        } finally {
            setLoading(false);
        }
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

    const handleDirectStatusUpdate = async (order: any, nextS: string) => {
        if (nextS === order.status) return;

        // If next step requires extra info, open modal
        if (nextS === "OUT_FOR_DELIVERY") {
            setSelectedOrder(order);
            setNewStatus(nextS);
            fetchAvailableRiders();
            setStatusModal(true);
            return;
        }

        try {
            setLoading(true);
            const payload: any = {
                status: nextS,
                paymentStatus: nextS === "DELIVERED" ? "PAID"
                    : order.payment?.status === "PAID" ? "PAID" : "PENDING",
            };
            await api.put(`/orders/${order.id}`, payload);
            toast.success(`Order status updated to ${nextS}`);
            fetchOrders(true);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update status");
        } finally {
            setLoading(false);
        }
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
                    className="text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                    <option value="ALL">All Branches</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>

                {/* <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:border-brand-500 min-w-[280px]">
                    <div className="flex flex-1 items-center gap-2">
                        <span className="text-[10px] uppercase font-black text-gray-400">From</span>
                        <DatePicker
                            value={startDate}
                            onChange={setStartDate}
                            placeholder="Select"
                            className="text-xs font-bold text-gray-700 dark:text-gray-200"
                        />
                    </div>
                    <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                    <div className="flex flex-1 items-center gap-2">
                        <span className="text-[10px] uppercase font-black text-gray-400">To</span>
                        <DatePicker
                            value={endDate}
                            onChange={setEndDate}
                            placeholder="Select"
                            className="text-xs font-bold text-gray-700 dark:text-gray-200"
                        />
                    </div>
                </div> */}
                <select
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value)}
                    className="text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                    <option value="ALL">All Statuses</option>
                    {ORDER_STATUSES.map((st) => <option key={st} value={st}>{STATUS_CONFIG[st]?.label || st}</option>)}
                </select>
                <button
                    onClick={() => fetchOrders()}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    {loading ? <Loader size="sm" showText={false} className="space-y-0" /> : <RefreshCw className="w-4 h-4" />}
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
                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">$ {parseFloat(item.price) * item.quantity}</span>
                </div>
            ))}
            <div className="flex justify-between pt-2 border-t dark:border-gray-600 font-bold text-base">
                <span>Total</span>
                <span>$ {order?.total}</span>
            </div>
        </div>
    );

    return (
        <ProtectedRoute module="customers-orders:incoming-orders">
            <div className="min-h-screen p-4 md:p-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl dark:text-gray-200">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Incoming Orders</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {loading ? <Loader size="sm" className="space-y-0" /> : `${orders.length} orders found`}
                        </p>
                    </div>
                    <FiltersBar />
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit mb-6">
                    <button
                        onClick={() => setActiveTab("latest")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "latest"
                            ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Latest Orders
                        {latestSix.length > 0 && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "latest" ? "bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>
                                {latestSix.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "all"
                            ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                    >
                        <List className="w-4 h-4" />
                        All Orders
                        {orders.length > 0 && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "all" ? "bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>
                                {orders.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* ── LATEST ORDERS TAB ── */}
                {activeTab === "latest" && (
                    loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader size="md" />
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
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                            <Loader size="md" />
                        </div>
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
                                            <td className="px-4 py-3 font-bold text-gray-800 dark:text-gray-200">
                                                <div className="flex items-center gap-2">
                                                    #{order.orderNo}
                                                    {order.status === "PENDING" && (
                                                        <Bell size={14} className="text-yellow-500 animate-bounce" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {order.customer
                                                    ? <span className="text-brand-600 dark:text-brand-400 font-bold">
                                                        {order.customer.name}
                                                        {order.source && order.source !== "WEBSITE" && (
                                                            <span className="ml-1 text-brand-500 text-[10px] font-black uppercase tracking-tight italic">({order.source})</span>
                                                        )}
                                                    </span>
                                                    : order.source === "POS"
                                                        ? <span className="text-brand-600 dark:text-brand-400 text-xs font-black uppercase tracking-tight italic">POS</span>
                                                        : <span className="text-gray-400 text-xs">—</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{order.branch?.name || "—"}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{order.type?.replace("_", " ")}</td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleDirectStatusUpdate(order, e.target.value)}
                                                    className={`text-[11px] font-bold px-2 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer ${STATUS_CONFIG[order.status]?.bg} ${STATUS_CONFIG[order.status]?.color}`}
                                                >
                                                    {ORDER_STATUSES.map((st) => (
                                                        <option key={st} value={st} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                                                            {STATUS_CONFIG[st]?.label || st}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3 font-bold text-gray-800 dark:text-gray-200">$ {parseFloat(order.total).toFixed(0)}</td>
                                            <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(order.createdAt).toLocaleString("en-PK", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1.5">
                                                    <button
                                                        onClick={() => openViewModal(order)}
                                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-1 text-gray-500 dark:text-gray-400 font-bold"
                                                        title="View"
                                                    >
                                                        <Eye size={15} />
                                                        <span className="text-[10px] uppercase">Details</span>
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

                {/* ORDER DETAIL MODAL */}
                <OrderDetailModal
                    order={viewOrder}
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    onStatusChange={openStatusModal}
                    loadingRiderDetails={loadingRiderDetails}
                    assignedRider={assignedRider}
                />

                {/* STATUS MODAL */}
                {statusModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100 p-4">
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
                                        className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                                            <div className="py-2"><Loader size="sm" className="space-y-0" /></div>
                                        ) : (
                                            <select
                                                value={selectedRiderId}
                                                onChange={(e) => setSelectedRiderId(e.target.value)}
                                                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                                    className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-brand-100 dark:shadow-none flex justify-center items-center"
                                >
                                    {updating ? <Loader size="sm" className="space-y-0" /> : "Update Status"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
