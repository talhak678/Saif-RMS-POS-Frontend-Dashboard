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

            <div className="max-w-6xl mx-auto pb-20">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                            <ImageIcon className="w-8 h-8 text-brand-500" />
                            Promotional Banners
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage marketing banners and promo slides for your website.</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-2xl transition-all shadow-lg active:scale-95 font-bold"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Banner
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/50 p-6 rounded-[2rem] shadow-sm">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Banners</p>
                        <p className="text-4xl font-black text-gray-800 dark:text-white mt-2">{banners.length}</p>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/50 p-6 rounded-[2rem] shadow-sm">
                        <p className="text-sm font-bold text-green-500 uppercase tracking-wider">Active Banners</p>
                        <p className="text-4xl font-black text-gray-800 dark:text-white mt-2">{banners.filter(b => b.isActive).length}</p>
                    </div>
                    <div className="bg-brand-500 p-6 rounded-[2rem] shadow-xl text-white">
                        <p className="text-sm font-bold opacity-80 uppercase tracking-wider text-white">Target Reach</p>
                        <p className="text-4xl font-black mt-2">100% Live</p>
                    </div>
                </div>

                {/* Add Form Modal/Section */}
                {showForm && (
                    <div className="bg-white dark:bg-gray-900 border border-brand-500/30 rounded-[2.5rem] p-8 mb-10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                            <Plus className="w-6 h-6 text-brand-500" />
                            New Banner Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase ml-2">Banner Title (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="Summer Sale 20% Off"
                                    value={newBanner.title}
                                    onChange={e => setNewBanner({ ...newBanner, title: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-brand-500"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <ImageUpload
                                    label="Banner Image"
                                    value={newBanner.imageUrl}
                                    onChange={(url) => setNewBanner({ ...newBanner, imageUrl: url })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase ml-2">Link/Action URL (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="https://example.com/promo"
                                    value={newBanner.linkUrl}
                                    onChange={e => setNewBanner({ ...newBanner, linkUrl: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-brand-500"
                                />
                            </div>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={handleAdd}
                                disabled={submitting}
                                className="bg-brand-500 hover:bg-brand-600 text-white px-8 py-3 rounded-2xl font-bold transition-all disabled:opacity-50 flex justify-center items-center"
                            >
                                {submitting ? <Loader size="sm" className="space-y-0" /> : "Create Banner"}
                            </button>
                            <button
                                onClick={() => setShowForm(false)}
                                className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-8 py-3 rounded-2xl font-bold"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Banners Grid */}
                {banners.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-800/20 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-bold text-lg">No banners found. Start by adding one!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {banners.map((banner) => (
                            <div key={banner.id} className="group bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/50 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
                                <div className="h-56 relative bg-gray-100 dark:bg-gray-800">
                                    <img
                                        src={banner.imageUrl}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        alt={banner.title || 'Banner'}
                                        onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL')}
                                    />
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg ${banner.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                                            {banner.isActive ? 'Active' : 'Draft'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <h3 className="text-xl font-black text-gray-800 dark:text-white truncate mb-4">{banner.title || 'Untitled Banner'}</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <ExternalLink className="w-4 h-4" />
                                            <span className="truncate">{banner.linkUrl || 'No external link'}</span>
                                        </div>
                                        <div className="pt-6 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => toggleStatus(banner)}
                                                    className={`p-3 rounded-xl transition-all ${banner.isActive ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-orange-500' : 'bg-brand-500/10 text-brand-500 hover:bg-brand-500 hover:text-white'}`}
                                                    title={banner.isActive ? "Deactivate" : "Activate"}
                                                >
                                                    {banner.isActive ? <ToggleLeft className="w-5 h-5" /> : <ToggleRight className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(banner.id)}
                                                    className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                <LayoutList className="w-5 h-5 text-gray-400" />
                                            </div>
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
