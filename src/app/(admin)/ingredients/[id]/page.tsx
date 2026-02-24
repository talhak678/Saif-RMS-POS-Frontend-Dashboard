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

interface IngredientDetailProps {
    params: Promise<{ id: string }>;
}

export default function IngredientDetailPage({ params }: IngredientDetailProps) {
    const { id } = use(params);
    const router = useRouter();
    const [ingredient, setIngredient] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
                        <button className="flex items-center gap-2 px-5 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-all">
                            <Edit size={14} /> Edit
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2 border border-gray-200 dark:border-gray-700 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all">
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
                                <p className="text-xs text-brand-600 font-bold uppercase mt-1 tracking-wide bg-brand-50 dark:bg-brand-900/40 px-3 py-1 rounded-full">Base Unit: {ingredient.unit}</p>

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

                </div>

            </div>
        </ProtectedRoute>
    );
}
