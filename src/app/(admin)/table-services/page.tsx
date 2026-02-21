"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import {
    Eye, Plus, Trash2, X, RefreshCw,
    Users, LayoutGrid, CheckCircle,
} from "lucide-react";
import { ProtectedRoute } from "@/services/protected-route";

const TABLE_STATUSES = ["AVAILABLE", "OCCUPIED", "RESERVED"];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; dot: string; cardBg: string }> = {
    AVAILABLE: { label: "Available", color: "text-green-700 dark:text-green-300", bg: "bg-green-100 dark:bg-green-900/30", border: "border-green-200 dark:border-green-700", dot: "bg-green-500", cardBg: "from-green-50 to-white dark:from-green-900/10 dark:to-gray-800" },
    OCCUPIED: { label: "Occupied", color: "text-orange-700 dark:text-orange-300", bg: "bg-orange-100 dark:bg-orange-900/30", border: "border-orange-200 dark:border-orange-700", dot: "bg-orange-500", cardBg: "from-orange-50 to-white dark:from-orange-900/10 dark:to-gray-800" },
    RESERVED: { label: "Reserved", color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-100 dark:bg-blue-900/30", border: "border-blue-200 dark:border-blue-700", dot: "bg-blue-500", cardBg: "from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-800" },
};

function StatusPill({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["AVAILABLE"];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

const EMPTY_FORM = { number: "", capacity: "", branchId: "", status: "AVAILABLE" };

export default function TableServicesPage() {
    const [tables, setTables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [branches, setBranches] = useState<any[]>([]);
    const [branchFilter, setBranchFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

    // Create / Edit
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    // View Modal
    const [viewItem, setViewItem] = useState<any>(null);
    const [viewLoading, setViewLoading] = useState(false);

    // Status quick-change
    const [statusModal, setStatusModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [newStatus, setNewStatus] = useState("");
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Delete
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    const [deleting, setDeleting] = useState(false);

    // ── FETCH ──────────────────────────────────────────────────
    useEffect(() => { fetchBranches(); }, []);
    useEffect(() => { fetchTables(); }, [branchFilter, statusFilter]);

    const fetchBranches = async () => {
        try {
            const res = await api.get("/branches");
            if (res.data?.success) setBranches(res.data.data);
        } catch (err) { console.error(err); }
    };

    const fetchTables = async () => {
        try {
            setLoading(true);
            const params: string[] = [];
            if (branchFilter !== "ALL") params.push(`branchId=${branchFilter}`);
            if (statusFilter !== "ALL") params.push(`status=${statusFilter}`);
            const query = params.length ? `?${params.join("&")}` : "";
            const res = await api.get(`/tables${query}`);
            if (res.data?.success) {
                const sorted = res.data.data.sort((a: any, b: any) => a.number - b.number);
                setTables(sorted);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchTableDetail = async (id: string) => {
        try {
            setViewLoading(true);
            const res = await api.get(`/tables/${id}`);
            if (res.data?.success) setViewItem(res.data.data);
        } catch (err) { console.error(err); }
        finally { setViewLoading(false); }
    };

    // ── CRUD ───────────────────────────────────────────────────
    const openCreate = () => {
        setEditItem(null);
        setForm({ ...EMPTY_FORM });
        setFormError("");
        setShowForm(true);
    };

    const openEdit = (t: any) => {
        setEditItem(t);
        setForm({ number: String(t.number), capacity: String(t.capacity), branchId: t.branchId, status: t.status });
        setFormError("");
        setShowForm(true);
    };

    const validateForm = () => {
        if (!form.number || parseInt(form.number) < 1) return "Table number must be a positive integer";
        if (!form.capacity || parseInt(form.capacity) < 1) return "Capacity must be at least 1";
        if (!form.branchId) return "Please select a branch";
        return "";
    };

    const handleSave = async () => {
        const err = validateForm();
        if (err) { setFormError(err); return; }
        setFormError("");
        try {
            setSaving(true);
            const body = {
                number: parseInt(form.number),
                capacity: parseInt(form.capacity),
                branchId: form.branchId,
                status: form.status,
            };
            if (editItem) {
                await api.put(`/tables/${editItem.id}`, body);
            } else {
                await api.post("/tables", body);
            }
            setShowForm(false);
            setEditItem(null);
            fetchTables();
        } catch (err: any) {
            setFormError(err?.response?.data?.message || "Failed to save table");
        } finally { setSaving(false); }
    };

    const handleStatusUpdate = async () => {
        if (!selectedItem || !newStatus) return;
        try {
            setUpdatingStatus(true);
            await api.put(`/tables/${selectedItem.id}`, { status: newStatus });
            setStatusModal(false);
            fetchTables();
        } catch (err) { console.error(err); }
        finally { setUpdatingStatus(false); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            setDeleting(true);
            await api.delete(`/tables/${deleteTarget.id}`);
            setDeleteModal(false);
            fetchTables();
        } catch (err) { console.error(err); }
        finally { setDeleting(false); }
    };

    const inputCls = "w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
    const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

    const stats = TABLE_STATUSES.map(st => ({
        st, count: tables.filter(t => t.status === st).length, cfg: STATUS_CONFIG[st]
    }));

    return (
        <ProtectedRoute module="pos:table-services">
            <div className="min-h-screen p-4 md:p-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl dark:text-gray-200">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <LayoutGrid className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            Table Services
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {loading ? "Loading..." : `${tables.length} tables total`}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                        {/* Branch filter */}
                        <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}
                            className="text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="ALL">All Branches</option>
                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>

                        {/* Status filter */}
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                            className="text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="ALL">All Statuses</option>
                            {TABLE_STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label}</option>)}
                        </select>

                        {/* View toggle */}
                        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                            <button onClick={() => setViewMode("grid")}
                                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === "grid" ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500 dark:text-gray-400"}`}>
                                Grid
                            </button>
                            <button onClick={() => setViewMode("table")}
                                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === "table" ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500 dark:text-gray-400"}`}>
                                Table
                            </button>
                        </div>

                        <button onClick={fetchTables} disabled={loading}
                            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                            Refresh
                        </button>

                        <button onClick={openCreate}
                            className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">
                            <Plus className="w-4 h-4" />
                            Add Table
                        </button>
                    </div>
                </div>

                {/* Stats pills */}
                <div className="flex flex-wrap gap-3 mb-6">
                    {stats.map(({ st, count, cfg }) => (
                        <button key={st} onClick={() => setStatusFilter(statusFilter === st ? "ALL" : st)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all text-sm font-semibold shadow-sm ${statusFilter === st
                                ? `${cfg.bg} ${cfg.color} ${cfg.border} ring-2 ring-offset-1 ring-blue-400`
                                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                            <span className={`ml-1 text-lg font-bold ${statusFilter === st ? cfg.color : "text-gray-700 dark:text-gray-300"}`}>{count}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 h-36 animate-pulse" />
                        ))}
                    </div>
                ) : tables.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <LayoutGrid className="w-14 h-14 mb-3 opacity-20" />
                        <p className="text-lg font-medium">No tables found</p>
                        <p className="text-sm mt-1">Add a table or adjust filters</p>
                    </div>
                ) : viewMode === "grid" ? (
                    /* ── GRID VIEW ── */
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {tables.map(t => {
                            const cfg = STATUS_CONFIG[t.status] || STATUS_CONFIG["AVAILABLE"];
                            return (
                                <div key={t.id}
                                    className={`rounded-2xl border-2 ${cfg.border} bg-gradient-to-br ${cfg.cardBg} shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer`}
                                    onClick={() => fetchTableDetail(t.id)}>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center border ${cfg.border}`}>
                                                <span className={`text-lg font-black ${cfg.color}`}>{t.number}</span>
                                            </div>
                                            <StatusPill status={t.status} />
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{t.branch?.name || "—"}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Users className="w-3 h-3 text-gray-400" />
                                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t.capacity} seats</span>
                                        </div>
                                        {t._count?.reservations > 0 && (
                                            <p className="text-[10px] text-blue-500 dark:text-blue-400 mt-1 font-medium">
                                                {t._count.reservations} reservation{t._count.reservations > 1 ? "s" : ""}
                                            </p>
                                        )}
                                    </div>
                                    <div className={`px-3 py-2 border-t ${cfg.border} flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity`}
                                        onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => openEdit(t)}
                                            className="flex-1 text-[11px] py-1 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                            Edit
                                        </button>
                                        <button onClick={() => { setSelectedItem(t); setNewStatus(t.status); setStatusModal(true); }}
                                            className="flex-1 text-[11px] py-1 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">
                                            Status
                                        </button>
                                        <button onClick={() => { setDeleteTarget(t); setDeleteModal(true); }}
                                            className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                            <Trash2 size={12} className="text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* ── TABLE VIEW ── */
                    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700">
                        <table className="min-w-[700px] w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700/60">
                                <tr>
                                    {["#", "Table No.", "Capacity", "Branch", "Reservations", "Status", "Actions"].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {tables.map((t: any, index: number) => (
                                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                        <td className="px-4 py-3 text-xs text-gray-400">{index + 1}</td>
                                        <td className="px-4 py-3 font-bold text-gray-800 dark:text-gray-200">Table {t.number}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                                                <Users className="w-3.5 h-3.5 text-gray-400" />{t.capacity}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{t.branch?.name || "—"}</td>
                                        <td className="px-4 py-3 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                                            {t._count?.reservations ?? 0}
                                        </td>
                                        <td className="px-4 py-3"><StatusPill status={t.status} /></td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1.5">
                                                <button onClick={() => fetchTableDetail(t.id)}
                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors" title="View">
                                                    <Eye size={15} className="text-gray-500 dark:text-gray-400" />
                                                </button>
                                                <button onClick={() => openEdit(t)}
                                                    className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold">
                                                    Edit
                                                </button>
                                                <button onClick={() => { setSelectedItem(t); setNewStatus(t.status); setStatusModal(true); }}
                                                    className="text-xs px-2.5 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold">
                                                    Status
                                                </button>
                                                <button onClick={() => { setDeleteTarget(t); setDeleteModal(true); }}
                                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
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

                {/* ── CREATE / EDIT FORM MODAL ── */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
                            <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                                <div>
                                    <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">{editItem ? "Edit Table" : "Add New Table"}</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{editItem ? `Table ${editItem.number}` : "Fill in table details"}</p>
                                </div>
                                <button onClick={() => { setShowForm(false); setEditItem(null); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X size={18} /></button>
                            </div>
                            <div className="p-5 space-y-4">
                                {formError && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300 font-medium">
                                        ⚠️ {formError}
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>Table Number *</label>
                                        <input type="number" min={1} value={form.number}
                                            onChange={(e) => setForm({ ...form, number: e.target.value })}
                                            placeholder="5" className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Capacity *</label>
                                        <input type="number" min={1} value={form.capacity}
                                            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                                            placeholder="4" className={inputCls} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Branch *</label>
                                    <select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })} className={inputCls}>
                                        <option value="">Select branch</option>
                                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Status</label>
                                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                                        {TABLE_STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="p-5 pt-0 flex gap-3">
                                <button onClick={() => { setShowForm(false); setEditItem(null); }}
                                    className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2.5 rounded-lg text-sm font-bold transition-colors">
                                    {saving ? "Saving..." : editItem ? "Save Changes" : "Add Table"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── VIEW DETAIL MODAL ── */}
                {viewItem && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
                            <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                                <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">Table {viewItem.number} Details</h2>
                                <button onClick={() => setViewItem(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X size={18} /></button>
                            </div>
                            {viewLoading ? (
                                <div className="p-10 text-center text-gray-400"><RefreshCw className="w-8 h-8 animate-spin mx-auto" /></div>
                            ) : (
                                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                                    <div className="flex justify-center"><StatusPill status={viewItem.status} /></div>

                                    {[
                                        { label: "Table Number", value: `#${viewItem.number}` },
                                        { label: "Capacity", value: `${viewItem.capacity} seats` },
                                        { label: "Branch", value: viewItem.branch?.name || "—" },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                            <div>
                                                <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold">{label}</p>
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">{value}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Active Reservations */}
                                    {viewItem.reservations?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Active Reservations</p>
                                            <div className="space-y-2">
                                                {viewItem.reservations.map((r: any) => (
                                                    <div key={r.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                                        <p className="font-semibold text-blue-800 dark:text-blue-300 text-sm">{r.customerName}</p>
                                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                                                            {r.guestCount} guests · {new Date(r.startTime).toLocaleString("en-PK", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                        </p>
                                                        <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === "ARRIVED" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                                                            {r.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-1">
                                        <button onClick={() => { const v = viewItem; setViewItem(null); openEdit(v); }}
                                            className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
                                            Edit
                                        </button>
                                        <button onClick={() => { setViewItem(null); setSelectedItem(viewItem); setNewStatus(viewItem.status); setStatusModal(true); }}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-bold transition-colors">
                                            Change Status
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── STATUS MODAL ── */}
                {statusModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
                            <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                                <div>
                                    <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">Change Status</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Table {selectedItem?.number}</p>
                                </div>
                                <button onClick={() => setStatusModal(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X size={18} /></button>
                            </div>
                            <div className="p-5 space-y-2">
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    Waiter can mark table as <strong>Occupied</strong> for walk-in customers, or <strong>Available</strong> after they leave.
                                </div>
                                {TABLE_STATUSES.map(st => {
                                    const cfg = STATUS_CONFIG[st];
                                    const isSelected = newStatus === st;
                                    return (
                                        <button key={st} onClick={() => setNewStatus(st)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${isSelected ? `${cfg.border} ${cfg.bg}` : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
                                                }`}>
                                            <span className={`w-3 h-3 rounded-full flex-shrink-0 ${cfg.dot}`} />
                                            <div className="flex-1">
                                                <span className={`font-semibold text-sm ${isSelected ? cfg.color : "text-gray-700 dark:text-gray-300"}`}>{cfg.label}</span>
                                            </div>
                                            {isSelected && <CheckCircle size={16} className="text-blue-500 flex-shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="p-5 pt-0 flex gap-3">
                                <button onClick={() => setStatusModal(false)}
                                    className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
                                    Cancel
                                </button>
                                <button onClick={handleStatusUpdate} disabled={updatingStatus}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2.5 rounded-lg text-sm font-bold transition-colors">
                                    {updatingStatus ? "Updating..." : "Update Status"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── DELETE MODAL ── */}
                {deleteModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
                            <div className="p-5 text-center">
                                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trash2 className="w-7 h-7 text-red-500" />
                                </div>
                                <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">Delete Table?</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">Table {deleteTarget?.number}</span> permanently delete ho jayega.
                                </p>
                            </div>
                            <div className="p-5 pt-0 flex gap-3">
                                <button onClick={() => setDeleteModal(false)}
                                    className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
                                    Cancel
                                </button>
                                <button onClick={handleDelete} disabled={deleting}
                                    className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white py-2.5 rounded-lg text-sm font-bold transition-colors">
                                    {deleting ? "Deleting..." : "Yes, Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
