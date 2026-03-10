"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import {
    Image as ImageIcon, Plus, Trash2, ExternalLink,
    ToggleRight, ToggleLeft, X, Pencil, Save
} from "lucide-react";
import { ProtectedRoute } from "@/services/protected-route";
import Loader from "@/components/common/Loader";
import ImageUpload from "@/components/common/ImageUpload";

interface Banner {
    id: string;
    title?: string;
    imageUrl: string;
    linkUrl?: string;
    isActive: boolean;
}

export default function BannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);

    // Add form state
    const [showForm, setShowForm] = useState(false);
    const [newBanner, setNewBanner] = useState({ title: "", imageUrl: "", linkUrl: "", isActive: true });
    const [submitting, setSubmitting] = useState(false);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Banner>>({});
    const [updating, setUpdating] = useState(false);

    const showError = (error: any, fallback: string) => {
        const data = error?.response?.data || error?.data || error;
        if (data?.message === "Validation failed" && data?.error && typeof data.error === 'object') {
            const details = Object.values(data.error).flat().join(", ");
            toast.error(`Error: ${details}`);
        } else {
            toast.error(data?.message || fallback);
        }
    };

    useEffect(() => { fetchBanners(); }, []);

    const fetchBanners = async () => {
        try {
            const res = await api.get("/cms/banners");
            if (res.data?.success) setBanners(res.data.data);
        } catch (error) {
            console.error("Failed to fetch banners", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newBanner.imageUrl) return toast.error("Image URL is required");

        let finalLinkUrl = newBanner.linkUrl?.trim() || "";
        if (finalLinkUrl && !finalLinkUrl.startsWith("http://") && !finalLinkUrl.startsWith("https://")) {
            finalLinkUrl = "https://" + finalLinkUrl;
        }

        setSubmitting(true);
        try {
            const payload = { ...newBanner, linkUrl: finalLinkUrl };
            const res = await api.post("/cms/banners", payload);
            if (res.data?.success) {
                toast.success("Banner added successfully");
                setBanners([res.data.data, ...banners]);
                setNewBanner({ title: "", imageUrl: "", linkUrl: "", isActive: true });
                setShowForm(false);
            } else {
                showError(res, "Failed to add banner");
            }
        } catch (error: any) {
            showError(error, "Failed to add banner");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this banner?")) return;
        try {
            const res = await api.delete(`/cms/banners/${id}`);
            if (res.data?.success !== false) {
                setBanners(banners.filter(b => b.id !== id));
                toast.success("Banner deleted");
            } else {
                showError(res, "Failed to delete banner");
            }
        } catch (error: any) {
            showError(error, "Failed to delete banner");
        }
    };

    const toggleStatus = async (banner: Banner) => {
        try {
            const updated = { ...banner, isActive: !banner.isActive };
            const res = await api.put(`/cms/banners/${banner.id}`, updated);
            if (res.data?.success !== false) {
                setBanners(banners.map(b => b.id === banner.id ? updated : b));
                toast.success(`Banner ${updated.isActive ? "activated" : "deactivated"}`);
            } else {
                showError(res, "Failed to update status");
            }
        } catch (error: any) {
            showError(error, "Failed to update status");
        }
    };

    // Open edit — pre-fill form with current banner data
    const openEdit = (banner: Banner) => {
        setEditingId(banner.id);
        setEditForm({ title: banner.title || "", imageUrl: banner.imageUrl, linkUrl: banner.linkUrl || "" });
        // Close add form if open
        setShowForm(false);
    };

    const cancelEdit = () => { setEditingId(null); setEditForm({}); };

    const handleUpdate = async (banner: Banner) => {
        const { title, imageUrl, linkUrl } = editForm;
        if (!imageUrl) return toast.error("Image URL is required");

        let finalLinkUrl = linkUrl?.trim() || "";
        if (finalLinkUrl && !finalLinkUrl.startsWith("http://") && !finalLinkUrl.startsWith("https://")) {
            finalLinkUrl = "https://" + finalLinkUrl;
        }

        setUpdating(true);
        try {
            const payload: Banner = {
                ...banner,            // keep all existing fields (isActive etc.)
                title,
                imageUrl,
                linkUrl: finalLinkUrl,
            };
            const res = await api.put(`/cms/banners/${banner.id}`, payload);
            if (res.data?.success) {
                toast.success("Banner updated successfully");
                setBanners(banners.map(b => b.id === banner.id ? payload : b));
                cancelEdit();
            } else {
                showError(res, "Failed to update banner");
            }
        } catch (err: any) {
            showError(err, "Failed to update banner");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader size="md" /></div>;

    const activeCount = banners.filter(b => b.isActive).length;

    return (
        <ProtectedRoute module="cms-website:banners">
            <div className="pb-10">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 px-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                            <ImageIcon className="w-6 h-6 text-[#5d69b9]" />
                            Promotional Banners
                        </h1>
                        <p className="text-gray-500 text-sm mt-1 font-medium">
                            Manage marketing banners and promo slides for your website
                        </p>
                    </div>
                    <button
                        onClick={() => { setShowForm(!showForm); cancelEdit(); }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
                        style={{ backgroundColor: showForm ? "#e5e7eb" : "#5d69b9", color: showForm ? "#374151" : "#fff" }}
                    >
                        {showForm ? <><X className="w-4 h-4 text-[#5d69b9]" /> Close</> : <><Plus className="w-4 h-4" /> Add Banner</>}
                    </button>
                </div>

                <div className="px-4 space-y-6">

                    {/* ── Stats Row ── */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: "Total Banners", value: banners.length, accent: "text-gray-700 dark:text-white" },
                            { label: "Active", value: activeCount, accent: "text-emerald-600 dark:text-emerald-400" },
                            { label: "Inactive", value: banners.length - activeCount, accent: "text-gray-400" },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</p>
                                <p className={`text-3xl font-black mt-1 ${stat.accent}`}>{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* ── Add Form ── */}
                    {showForm && (
                        <div className="bg-white dark:bg-gray-800 border-2 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-3 duration-200"
                            style={{ borderColor: "#5d69b940" }}>
                            <h2 className="text-base font-bold mb-5 flex items-center gap-2 text-gray-800 dark:text-white">
                                <Plus className="w-4 h-4" style={{ color: "#5d69b9" }} />
                                New Banner Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Banner Title (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Summer Sale 20% Off"
                                        value={newBanner.title}
                                        onChange={e => setNewBanner({ ...newBanner, title: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-700 focus:border-[#5d69b9] rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Link/Action URL (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="https://example.com/promo"
                                        value={newBanner.linkUrl}
                                        onChange={e => setNewBanner({ ...newBanner, linkUrl: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-700 focus:border-[#5d69b9] rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-1.5">
                                    <ImageUpload
                                        label="Banner Image (Recommended: 1920 × 1080)"
                                        value={newBanner.imageUrl}
                                        onChange={(url) => setNewBanner({ ...newBanner, imageUrl: url })}
                                        isBanner
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={handleAdd}
                                    disabled={submitting}
                                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                                    style={{ backgroundColor: "#5d69b9" }}
                                >
                                    {submitting ? <Loader size="sm" showText={false} className="space-y-0" /> : "Create Banner"}
                                </button>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Banners Grid ── */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-5">All Banners</h2>

                        {banners.length === 0 ? (
                            <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-semibold text-sm">No banners yet. Click &quot;Add Banner&quot; to get started.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {banners.map((banner) => (
                                    <div
                                        key={banner.id}
                                        className={`group rounded-xl border-2 overflow-hidden transition-all duration-200 ${editingId === banner.id
                                            ? "border-[#5d69b9]/60 shadow-md"
                                            : banner.isActive
                                                ? "border-transparent hover:border-[#5d69b9]/40 hover:shadow-md"
                                                : "border-gray-100 dark:border-gray-700 opacity-70"
                                            }`}
                                    >
                                        {/* Image */}
                                        <div className="h-40 bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                                            <img
                                                src={editingId === banner.id ? (editForm.imageUrl || banner.imageUrl) : banner.imageUrl}
                                                className={`w-full h-full object-cover transition-transform duration-500 ${banner.isActive && editingId !== banner.id ? "group-hover:scale-105" : ""} ${!banner.isActive ? "grayscale" : ""}`}
                                                alt={banner.title || "Banner"}
                                                onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/800x400?text=Invalid+Image")}
                                            />
                                            <div className="absolute top-2 right-2 flex gap-1.5">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider  shadow ${banner.isActive ? "bg-[#5d69b9]/80 text-white" : "bg-gray-600/80 text-white"
                                                    }`}>
                                                    {banner.isActive ? "Active" : "Draft"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* ── Editing mode ── */}
                                        {editingId === banner.id ? (
                                            <div className="p-4 bg-white dark:bg-gray-800 border-t border-[#5d69b9]/20 space-y-3">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-[#5d69b9] mb-1">Editing Banner</p>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Title</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Banner title"
                                                        value={editForm.title || ""}
                                                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                                        className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-700 focus:border-[#5d69b9] rounded-lg px-3 py-2 text-sm outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Link URL</label>
                                                    <input
                                                        type="text"
                                                        placeholder="https://..."
                                                        value={editForm.linkUrl || ""}
                                                        onChange={e => setEditForm({ ...editForm, linkUrl: e.target.value })}
                                                        className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-700 focus:border-[#5d69b9] rounded-lg px-3 py-2 text-sm outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <ImageUpload
                                                        label="Banner Image"
                                                        value={editForm.imageUrl || ""}
                                                        onChange={(url) => setEditForm({ ...editForm, imageUrl: url })}
                                                        isBanner
                                                    />
                                                </div>
                                                <div className="flex gap-2 pt-1">
                                                    <button
                                                        onClick={() => handleUpdate(banner)}
                                                        disabled={updating}
                                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-50"
                                                        style={{ backgroundColor: "#5d69b9" }}
                                                    >
                                                        {updating ? <Loader size="sm" showText={false} className="space-y-0" /> : <><Save size={13} /> Save Changes</>}
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-700 transition-all"
                                                    >
                                                        <X size={13} /> Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* ── Normal view ── */
                                            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">
                                                    {banner.title || "Untitled Banner"}
                                                </h3>
                                                {banner.linkUrl && (
                                                    <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1 truncate">
                                                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                                        {banner.linkUrl}
                                                    </p>
                                                )}

                                                {/* Actions */}
                                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                                    <div className="flex gap-1.5">
                                                        <button
                                                            onClick={() => toggleStatus(banner)}
                                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${banner.isActive
                                                                ? "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 hover:border-[#5d69b9] hover:text-[#5d69b9]"
                                                                : "border-[#5d69b9]/30 text-[#5d69b9] bg-[#5d69b9]/5 hover:bg-[#5d69b9]/10"
                                                                }`}
                                                            title={banner.isActive ? "Deactivate" : "Activate"}
                                                        >
                                                            {banner.isActive ? <ToggleLeft size={15} /> : <ToggleRight size={15} />}
                                                            {banner.isActive ? "Deactivate" : "Activate"}
                                                        </button>
                                                    </div>
                                                    <div className="flex gap-1.5">
                                                        <button
                                                            onClick={() => openEdit(banner)}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#5d69b9] hover:bg-[#5d69b9]/10 transition-all"
                                                            title="Edit"
                                                        >
                                                            <Pencil size={15} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(banner.id)}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
