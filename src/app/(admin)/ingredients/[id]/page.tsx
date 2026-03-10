"use client";

import { useEffect, useState, useCallback, use } from "react";
import api from "@/services/api";
import {
    ArrowLeft,
    Package,
    Clock,
    Edit,
    Trash2,
    Layers,
    Database,
    Tag,
    Hash,
    ShoppingBag,
    List,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/services/protected-route";
import Loader from "@/components/common/Loader";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { X, AlertTriangle, Save } from "lucide-react";

interface IngredientDetailProps {
    params: Promise<{ id: string }>;
}

export default function IngredientDetailPage({ params }: IngredientDetailProps) {
    const { id } = use(params);
    const router = useRouter();
    const [ingredient, setIngredient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", unit: "", category: "", unitPrice: "", parLevel: "" });
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const fetchIngredientDetails = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/ingredients/${id}`);
            if (res.data?.success) {
                setIngredient(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch ingredient details", err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchIngredientDetails();
    }, [fetchIngredientDetails]);

    const handleEditOpen = () => {
        if (!ingredient) return;
        setFormData({
            name: ingredient.name,
            unit: ingredient.unit,
            category: ingredient.category || "",
            unitPrice: ingredient.unitPrice?.toString() || "",
            parLevel: ingredient.parLevel?.toString() || ""
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : undefined,
                parLevel: formData.parLevel ? parseFloat(formData.parLevel) : undefined
            };
            const res = await api.put(`/ingredients/${id}`, payload);
            if (res.data?.success) {
                toast.success("Ingredient updated");
                setIsEditModalOpen(false);
                fetchIngredientDetails();
            }
        } catch (error) {
            console.error("Update failed", error);
            toast.error("Update failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await api.delete(`/ingredients/${id}`);
            if (res.data?.success) {
                toast.success("Ingredient deleted");
                router.push("/ingredients");
            }
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Delete failed");
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
                <Loader size="md" />
            </div>
        );
    }

    if (!ingredient) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950 gap-4">
                <p className="text-gray-500 font-medium">Ingredient not found.</p>
                <button
                    onClick={() => router.back()}
                    className="text-brand-600 font-bold flex items-center gap-2 px-4 py-2"
                >
                    <ArrowLeft size={18} /> Go Back
                </button>
            </div>
        );
    }

    return (
        <ProtectedRoute module="inventory-recipes:ingredients">
            <div className="min-h-screen bg-white dark:bg-gray-950 pb-20 font-outfit">

                {/* --- SIMPLE HEADER --- */}
                <div className="px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} className="text-gray-500" />
                        </button>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold text-gray-800 dark:text-white">{ingredient.name}</h1>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Ingredient ID: {ingredient.id.slice(-8)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleEditOpen}
                            className="flex items-center gap-2 px-5 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-all">
                            <Edit size={14} /> Edit
                        </button>
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2 border border-gray-200 dark:border-gray-700 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all">
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Summary Card */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 flex flex-col items-center text-center shadow-sm">
                                <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center text-brand-600 mb-4">
                                    <Package size={28} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white uppercase tracking-normal">{ingredient.name}</h2>
                                <p className="text-xs text-brand-600 font-bold uppercase mt-1 tracking-wide bg-brand-50 dark:bg-brand-900/40 px-3 py-1 rounded-full">{ingredient.category || "Uncategorized"}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase mt-3 tracking-wide">Base Unit: {ingredient.unit}</p>

                                <div className="w-full grid grid-cols-2 gap-px bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden mt-8">
                                    <div className="bg-white dark:bg-gray-900 p-4">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Batches</p>
                                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{(ingredient.stocks || []).length}</p>
                                    </div>
                                    <div className="bg-white dark:bg-gray-900 p-4">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Recipes</p>
                                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{(ingredient.recipes || []).length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-5 shadow-sm">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide border-b border-gray-50 dark:border-gray-800 pb-3">History & Meta</h4>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                        <Clock size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Registered</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold">{new Date(ingredient.createdAt).toLocaleDateString()} {new Date(ingredient.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                        <Layers size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Last Activity</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold">{new Date(ingredient.updatedAt).toLocaleDateString()} {new Date(ingredient.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                        <Tag size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Pricing & Par</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold">
                                            ${ingredient.unitPrice ? parseFloat(ingredient.unitPrice).toFixed(2) : "0.00"} / {ingredient.parLevel ? `${ingredient.parLevel} ${ingredient.unit}` : "No Par"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                        <Hash size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Internal ID</p>
                                        <p className="text-[10px] text-gray-400 font-mono break-all">{ingredient.id}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Data Lists */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Stocks Section */}
                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                                <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Database size={16} className="text-brand-600" />
                                        <h3 className="text-sm font-bold text-gray-800 dark:text-white">Live Stock Inventory</h3>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{ingredient.stocks?.length || 0} Records</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50/30 dark:bg-gray-800/20">
                                            <tr>
                                                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase">Branch Name</th>
                                                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase text-center">Available Stock</th>
                                                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase text-right">Last Verified</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                            {ingredient.stocks?.length > 0 ? ingredient.stocks.map((stock: any) => (
                                                <tr key={stock.id} className="hover:bg-gray-50/30 transition-colors group">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/10 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all">
                                                                <ShoppingBag size={14} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{stock.branch?.name || "Main Branch"}</p>
                                                                <p className="text-[10px] text-gray-400 font-medium">Branch ID: {stock.branch?.id.slice(-6)}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <div className="inline-flex items-baseline gap-1 bg-gray-50 dark:bg-gray-800 px-4 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700">
                                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{stock.quantity}</span>
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase">{ingredient.unit}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <p className="text-xs font-bold text-gray-600 dark:text-gray-300">{new Date(stock.updatedAt).toLocaleDateString()}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium">{new Date(stock.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={3} className="p-16 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Database size={32} className="text-gray-200" />
                                                            <p className="text-gray-400 text-xs font-medium italic">No active stock records found for this ingredient.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Recipes Section */}
                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-6">
                                    <Tag size={16} className="text-brand-600" />
                                    <h3 className="text-sm font-bold text-gray-800 dark:text-white">Used In These Recipes</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {ingredient.recipes?.length > 0 ? (
                                        ingredient.recipes.map((recipe: any) => (
                                            <div key={recipe.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:border-brand-300 transition-all cursor-pointer group">
                                                <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-brand-600 shadow-sm">
                                                    <List size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{recipe.menuItem?.name || "Menu Item"}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Qty Req: {recipe.quantity} {ingredient.unit}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-2 py-8 text-center bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                            <Tag size={24} className="text-gray-200 mx-auto mb-2" />
                                            <p className="text-gray-400 text-xs font-medium italic">No linked recipes found.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Edit Modal */}
                    <Modal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        showCloseButton={false}
                        className="max-w-md"
                    >
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <h2 className="text-base font-bold text-gray-800 dark:text-white">Edit Ingredient</h2>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-700 dark:text-gray-200"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Unit</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-700 dark:text-gray-200"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Category</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-700 dark:text-gray-200"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500">Unit Price</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.unitPrice}
                                            onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-700 dark:text-gray-200"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500">Par Level</label>
                                        <input
                                            type="number"
                                            value={formData.parLevel}
                                            onChange={(e) => setFormData({ ...formData, parLevel: e.target.value })}
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-700 dark:text-gray-200"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2.5 text-sm font-bold text-gray-400">Cancel</button>
                                    <button type="submit" disabled={submitting} className="flex-[2] bg-brand-600 text-white py-2.5 rounded-xl text-sm font-bold">
                                        {submitting ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </Modal>

                    {/* Delete Modal */}
                    <Modal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        showCloseButton={false}
                        className="max-w-sm"
                    >
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center">
                            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Delete Ingredient?</h3>
                            <p className="text-xs text-gray-500 mb-6">This will permanently remove this ingredient and its stock records.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 text-sm font-bold text-gray-400">Cancel</button>
                                <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-bold">
                                    {deleting ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </Modal>
                </div>
            </div>
        </ProtectedRoute>
    );
}
