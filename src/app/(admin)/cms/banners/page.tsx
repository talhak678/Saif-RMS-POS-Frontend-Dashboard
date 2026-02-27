"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import { Image as ImageIcon, Plus, Trash2, ExternalLink, ToggleRight, ToggleLeft, LayoutList } from "lucide-react";
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
    const [showForm, setShowForm] = useState(false);
    const [newBanner, setNewBanner] = useState({ title: "", imageUrl: "", linkUrl: "", isActive: true });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await api.get("/cms/banners");
            if (res.data?.success) {
                setBanners(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch banners", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newBanner.imageUrl) return toast.error("Image URL is required");
        setSubmitting(true);
        try {
            const res = await api.post("/cms/banners", newBanner);
            if (res.data?.success) {
                toast.success("Banner added successfully");
                setBanners([res.data.data, ...banners]);
                setNewBanner({ title: "", imageUrl: "", linkUrl: "", isActive: true });
                setShowForm(false);
            }
        } catch (error) {
            toast.error("Failed to add banner");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this banner?")) return;
        try {
            await api.delete(`/cms/banners/${id}`);
            setBanners(banners.filter(b => b.id !== id));
            toast.success("Banner deleted");
        } catch (error) {
            toast.error("Failed to delete banner");
        }
    };

    const toggleStatus = async (banner: Banner) => {
        try {
            const updated = { ...banner, isActive: !banner.isActive };
            await api.post(`/cms/banners`, { ...updated, bannerId: banner.id });
            setBanners(banners.map(b => b.id === banner.id ? updated : b));
            toast.success(`Banner ${updated.isActive ? 'activated' : 'deactivated'}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader size="md" /></div>;

    return (
        <ProtectedRoute module="cms-website:banners">

            <div className="max-w-[calc(98vw)] lg:max-w-[calc(78vw)] mx-auto p-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl my-4">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                            <ImageIcon className="w-6 h-6 text-brand-500" />
                            Promotional Banners
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage marketing banners and promo slides for your website.</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-brand-100 dark:shadow-none active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        {showForm ? "Close Form" : "Add New Banner"}
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 rounded-2xl shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Total Banners</p>
                        <p className="text-2xl font-black text-gray-800 dark:text-white mt-2 leading-none">{banners.length}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 rounded-2xl shadow-sm">
                        <p className="text-[10px] font-black text-green-500 uppercase tracking-widest leading-none">Active Banners</p>
                        <p className="text-2xl font-black text-gray-800 dark:text-white mt-2 leading-none">{banners.filter(b => b.isActive).length}</p>
                    </div>
                    <div className="bg-brand-500 p-5 rounded-2xl shadow-lg text-white">
                        <p className="text-[10px] font-black opacity-80 uppercase tracking-widest leading-none text-white">Target Reach</p>
                        <p className="text-2xl font-black mt-2 leading-none">100% Live</p>
                    </div>
                </div>

                {/* Add Form Modal/Section */}
                {showForm && (
                    <div className="bg-white dark:bg-gray-800 border border-brand-500/30 rounded-3xl p-6 mb-8 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 dark:text-white">
                            <Plus className="w-5 h-5 text-brand-500" />
                            New Banner Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Banner Title (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Summer Sale 20% Off"
                                    value={newBanner.title}
                                    onChange={e => setNewBanner({ ...newBanner, title: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none text-gray-800 dark:text-white transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Link/Action URL (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="https://example.com/promo"
                                    value={newBanner.linkUrl}
                                    onChange={e => setNewBanner({ ...newBanner, linkUrl: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none text-gray-800 dark:text-white transition-all"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-1.5">
                                <ImageUpload
                                    label="Banner Image (Recommended: 1920 x 1080)"
                                    value={newBanner.imageUrl}
                                    onChange={(url) => setNewBanner({ ...newBanner, imageUrl: url })}
                                    isBanner
                                />
                            </div>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={handleAdd}
                                disabled={submitting}
                                className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 flex justify-center items-center text-sm"
                            >
                                {submitting ? <Loader size="sm" className="space-y-0" /> : "Create Banner"}
                            </button>
                            <button
                                onClick={() => setShowForm(false)}
                                className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-6 py-2.5 rounded-xl font-bold text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Banners Grid */}
                {banners.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-800/20 rounded-[32px] border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-bold">No banners found. Start by adding one!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {banners.map((banner) => (
                            <div
                                key={banner.id}
                                className={`group bg-white dark:bg-gray-800 border-2 rounded-[32px] p-3 transition-all duration-300 flex flex-col ${banner.isActive ? "border-transparent hover:border-brand-600 hover:shadow-lg hover:shadow-brand-50" : "border-gray-100 dark:border-gray-700 opacity-80"}`}
                            >
                                {/* Image Container */}
                                <div className="h-44 w-full bg-gray-100 dark:bg-gray-700 relative rounded-[24px] overflow-hidden mb-4">
                                    <img
                                        src={banner.imageUrl}
                                        className={`w-full h-full object-cover transition-transform duration-700 ${banner.isActive ? 'group-hover:scale-110' : 'grayscale'}`}
                                        alt={banner.title || 'Banner'}
                                        onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL')}
                                    />
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${banner.isActive ? 'bg-brand-500/80 text-white' : 'bg-gray-500/80 text-white'}`}>
                                            {banner.isActive ? 'Active' : 'Draft'}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 flex flex-col px-1">
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base line-clamp-1 leading-tight mb-2">
                                        {banner.title || 'Untitled Banner'}
                                    </h3>

                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 h-8 mb-4 leading-normal flex items-center gap-1.5">
                                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{banner.linkUrl || 'No external link'}</span>
                                    </p>

                                    {/* Action Footer */}
                                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => toggleStatus(banner)}
                                                className={`p-2 rounded-xl border transition-all ${banner.isActive ? 'bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600 text-gray-400 hover:text-brand-500' : 'bg-brand-50 dark:bg-brand-900/20 border-brand-100 dark:border-brand-800/30 text-brand-600 dark:text-brand-400 hover:bg-brand-100'}`}
                                                title={banner.isActive ? "Deactivate" : "Activate"}
                                            >
                                                {banner.isActive ? <ToggleLeft size={18} /> : <ToggleRight size={18} />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(banner.id)}
                                                className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                            <LayoutList size={16} className="text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
