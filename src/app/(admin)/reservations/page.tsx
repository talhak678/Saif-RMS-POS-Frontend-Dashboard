"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Eye, Plus, Trash2, X, RefreshCw, Calendar, Users, Phone, Clock } from "lucide-react";

const RESERVATION_STATUSES = ["BOOKED", "ARRIVED", "COMPLETED", "CANCELLED"];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
    BOOKED: { label: "Booked", color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-100 dark:bg-blue-900/30", border: "border-blue-200 dark:border-blue-700", dot: "bg-blue-500" },
    ARRIVED: { label: "Arrived", color: "text-green-700 dark:text-green-300", bg: "bg-green-100 dark:bg-green-900/30", border: "border-green-200 dark:border-green-700", dot: "bg-green-500" },
    COMPLETED: { label: "Completed", color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-100 dark:bg-purple-900/30", border: "border-purple-200 dark:border-purple-700", dot: "bg-purple-500" },
    CANCELLED: { label: "Cancelled", color: "text-red-700 dark:text-red-300", bg: "bg-red-100 dark:bg-red-900/30", border: "border-red-200 dark:border-red-700", dot: "bg-red-500" },
};

function StatusPill({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["BOOKED"];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString("en-PK", {
        month: "short", day: "numeric", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function formatDatetimeLocal(iso: string) {
    // Convert ISO to local datetime-local input format
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ── FORM INITIAL STATE ────────────────────────────────────────
const EMPTY_FORM = {
    customerName: "",
    phone: "",
    guestCount: "",
    startTime: "",
    status: "BOOKED",
    branchId: "",
};

export default function ReservationsPage() {
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [branches, setBranches] = useState<any[]>([]);
    const [branchFilter, setBranchFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Create Modal
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    // View Modal
    const [viewItem, setViewItem] = useState<any>(null);

    // Status Modal
    const [statusModal, setStatusModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [newStatus, setNewStatus] = useState("");
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Delete Modal
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchBranches();
        fetchReservations();
    }, []);

    useEffect(() => {
        fetchReservations();
    }, [branchFilter]);

    const fetchBranches = async () => {
        try {
            const res = await api.get("/branches");
            if (res.data?.success) setBranches(res.data.data);
        } catch (err) { console.error(err); }
    };

    const fetchReservations = async () => {
        try {
            setLoading(true);
            const query = branchFilter !== "ALL" ? `?branchId=${branchFilter}` : "";
            const res = await api.get(`/reservations${query}`);
            if (res.data?.success) {
                const sorted = res.data.data.sort(
                    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setReservations(sorted);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleCreate = async () => {
        if (!form.customerName.trim()) { setFormError("Customer name is required"); return; }
        if (!form.phone.trim()) { setFormError("Phone is required"); return; }
        if (!form.guestCount || parseInt(form.guestCount) < 1) { setFormError("Guest count must be at least 1"); return; }
        if (!form.startTime) { setFormError("Reservation time is required"); return; }
        if (!form.branchId) { setFormError("Please select a branch"); return; }
        setFormError("");
        try {
            setSaving(true);
            await api.post("/reservations", {
                customerName: form.customerName.trim(),
                phone: form.phone.trim(),
                guestCount: parseInt(form.guestCount),
                startTime: new Date(form.startTime).toISOString(),
                status: form.status,
                branchId: form.branchId,
            });
            setShowCreate(false);
            setForm({ ...EMPTY_FORM });
            fetchReservations();
        } catch (err: any) {
            setFormError(err?.response?.data?.message || "Failed to create reservation");
        } finally { setSaving(false); }
    };

    const handleStatusUpdate = async () => {
        if (!selectedItem || !newStatus) return;
        try {
            setUpdatingStatus(true);
            // Yahan humne pura payload bhej diya takay validation pass ho jaye
            await api.put(`/reservations/${selectedItem.id}`, {
                customerName: selectedItem.customerName,
                phone: selectedItem.phone,
                guestCount: selectedItem.guestCount,
                startTime: selectedItem.startTime,
                branchId: selectedItem.branchId,
                status: newStatus
            });
            setStatusModal(false);
            fetchReservations();
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to update status. Please try again.");
        }
        finally { setUpdatingStatus(false); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            setDeleting(true);
            await api.delete(`/reservations/${deleteTarget.id}`);
            setDeleteModal(false);
            fetchReservations();
        } catch (err) { console.error(err); }
        finally { setDeleting(false); }
    };

    const filtered = reservations.filter(r =>
        statusFilter === "ALL" || r.status === statusFilter
    );

    const inputCls = "w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
    const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

    return (
        <div className="min-h-screen p-4 md:p-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl dark:text-gray-200">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        Reservations
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {loading ? "Loading..." : `${filtered.length} reservations`}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    {/* Branch filter */}
                    <select
                        value={branchFilter}
                        onChange={(e) => setBranchFilter(e.target.value)}
                        className="text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ALL">All Branches</option>
                        {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>

                    {/* Status filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ALL">All Statuses</option>
                        {RESERVATION_STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label}</option>)}
                    </select>

                    {/* Refresh */}
                    <button
                        onClick={fetchReservations}
                        disabled={loading}
                        className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>

                    {/* Create button */}
                    <button
                        onClick={() => { setForm({ ...EMPTY_FORM }); setFormError(""); setShowCreate(true); }}
                        className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Reservation
                    </button>
                </div>
            </div>

            {/* Status summary pills */}
            <div className="flex flex-wrap gap-2 mb-5">
                {RESERVATION_STATUSES.map(st => {
                    const count = reservations.filter(r => r.status === st).length;
                    const cfg = STATUS_CONFIG[st];
                    return (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(statusFilter === st ? "ALL" : st)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${statusFilter === st
                                ? `${cfg.bg} ${cfg.color} ${cfg.border} ring-2 ring-offset-1 ring-blue-400`
                                : `bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:${cfg.bg}`
                                }`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                            <span className="ml-1 font-bold">{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* Table */}
            {loading ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-4 p-4 border-b dark:border-gray-700 last:border-0 animate-pulse">
                            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded flex-1" />
                            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-24" />
                            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-20" />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Calendar className="w-14 h-14 mb-3 opacity-20" />
                    <p className="text-lg font-medium">No reservations found</p>
                    <p className="text-sm mt-1">Create a reservation or adjust filters</p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700">
                    <table className="min-w-[750px] w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/60">
                            <tr>
                                {["#", "Customer", "Phone", "Guests", "Branch", "Reservation Time", "Status", "Actions"].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filtered.map((r: any, index: number) => (
                                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                    <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">{index + 1}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-gray-800 dark:text-gray-200">{r.customerName}</div>
                                        <div className="text-[11px] text-gray-400 dark:text-gray-500">
                                            Added {new Date(r.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{r.phone}</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            <Users className="w-3.5 h-3.5 text-gray-400" />
                                            {r.guestCount}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{r.branch?.name || "—"}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                                            <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                            {formatDateTime(r.startTime)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusPill status={r.status} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1.5">
                                            {/* View */}
                                            <button
                                                onClick={() => setViewItem(r)}
                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={15} className="text-gray-500 dark:text-gray-400" />
                                            </button>
                                            {/* Status */}
                                            <button
                                                onClick={() => { setSelectedItem(r); setNewStatus(r.status); setStatusModal(true); }}
                                                className="text-xs px-2.5 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold"
                                            >
                                                Status
                                            </button>
                                            {/* Delete */}
                                            <button
                                                onClick={() => { setDeleteTarget(r); setDeleteModal(true); }}
                                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={15} className="text-red-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── CREATE MODAL ───────────────────────────────────── */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                            <div>
                                <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">New Reservation</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Fill in the details below</p>
                            </div>
                            <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                            {formError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300 font-medium">
                                    ⚠️ {formError}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className={labelCls}>Customer Name *</label>
                                    <input
                                        type="text"
                                        value={form.customerName}
                                        onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                                        placeholder="Ahmed Khan"
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>Phone *</label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        placeholder="+92 300 1234567"
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>Guests *</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={form.guestCount}
                                        onChange={(e) => setForm({ ...form, guestCount: e.target.value })}
                                        placeholder="4"
                                        className={inputCls}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className={labelCls}>Reservation Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        value={form.startTime}
                                        onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>Branch *</label>
                                    <select
                                        value={form.branchId}
                                        onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                                        className={inputCls}
                                    >
                                        <option value="">Select branch</option>
                                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        className={inputCls}
                                    >
                                        {RESERVATION_STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 pt-0 flex gap-3">
                            <button
                                onClick={() => setShowCreate(false)}
                                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={saving}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2.5 rounded-lg text-sm font-bold transition-colors"
                            >
                                {saving ? "Creating..." : "Create Reservation"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── VIEW DETAIL MODAL ──────────────────────────────── */}
            {viewItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                            <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">Reservation Details</h2>
                            <button onClick={() => setViewItem(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Status at top */}
                            <div className="flex justify-center">
                                <StatusPill status={viewItem.status} />
                            </div>

                            {[
                                { icon: <Users className="w-4 h-4" />, label: "Customer", value: viewItem.customerName },
                                { icon: <Phone className="w-4 h-4" />, label: "Phone", value: viewItem.phone },
                                { icon: <Users className="w-4 h-4" />, label: "Guests", value: `${viewItem.guestCount} people` },
                                { icon: <Calendar className="w-4 h-4" />, label: "Branch", value: viewItem.branch?.name || "—" },
                                { icon: <Clock className="w-4 h-4" />, label: "Reservation Time", value: formatDateTime(viewItem.startTime) },
                                { icon: <Clock className="w-4 h-4" />, label: "Created At", value: formatDateTime(viewItem.createdAt) },
                            ].map(({ icon, label, value }) => (
                                <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    <span className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0">{icon}</span>
                                    <div>
                                        <p className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wide font-semibold">{label}</p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">{value}</p>
                                    </div>
                                </div>
                            ))}

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => { setViewItem(null); setSelectedItem(viewItem); setNewStatus(viewItem.status); setStatusModal(true); }}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-bold transition-colors"
                                >
                                    Change Status
                                </button>
                                <button
                                    onClick={() => setViewItem(null)}
                                    className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── STATUS MODAL ────────────────────────────────────── */}
            {statusModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                            <div>
                                <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">Update Status</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{selectedItem?.customerName}</p>
                            </div>
                            <button onClick={() => setStatusModal(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-5 space-y-3">
                            {RESERVATION_STATUSES.map(st => {
                                const cfg = STATUS_CONFIG[st];
                                const isSelected = newStatus === st;
                                return (
                                    <button
                                        key={st}
                                        onClick={() => setNewStatus(st)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${isSelected ? `${cfg.border} ${cfg.bg}` : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
                                            }`}
                                    >
                                        <span className={`w-3 h-3 rounded-full ${cfg.dot}`} />
                                        <span className={`font-semibold text-sm ${isSelected ? cfg.color : "text-gray-700 dark:text-gray-300"}`}>{cfg.label}</span>
                                        {isSelected && <span className="ml-auto text-xs text-blue-600 dark:text-blue-400 font-bold">Selected</span>}
                                    </button>
                                );
                            })}
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
                                disabled={updatingStatus}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2.5 rounded-lg text-sm font-bold transition-colors"
                            >
                                {updatingStatus ? "Updating..." : "Update Status"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── DELETE CONFIRM ──────────────────────────────────── */}
            {deleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
                        <div className="p-5 text-center">
                            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-7 h-7 text-red-500" />
                            </div>
                            <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">Delete Reservation?</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">{deleteTarget?.customerName}</span> ka reservation delete ho jayega. Yeh action undo nahi ho sakta.
                            </p>
                        </div>
                        <div className="p-5 pt-0 flex gap-3">
                            <button
                                onClick={() => setDeleteModal(false)}
                                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white py-2.5 rounded-lg text-sm font-bold transition-colors"
                            >
                                {deleting ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}