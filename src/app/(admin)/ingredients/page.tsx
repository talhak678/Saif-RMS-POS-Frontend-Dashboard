"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/services/api";
import {
    Eye,
    Plus,
    Package,
    Edit,
    Trash2,
    X,
    Save,
    AlertTriangle,
    Search,
    Filter,
    Upload,
    MoreVertical,
    ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/services/protected-route";
import Loader from "@/components/common/Loader";
import { toast } from "sonner";

export default function IngredientsPage() {
    const router = useRouter();
    const [ingredients, setIngredients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // --- MODAL STATES ---
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState({ name: "", unit: "" });
    const [formLoading, setFormLoading] = useState(false);

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        fetchIngredients();
    }, []);

    const fetchIngredients = async () => {
        try {
            setLoading(true);
            const res = await api.get("/ingredients");
            if (res.data?.success) {
                const sorted = res.data.data.sort(
                    (a: any, b: any) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setIngredients(sorted);
            }
        } catch (err) {
            console.error("Ingredients fetch failed", err);
            toast.error("Failed to load ingredients");
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingItem(null);
        setFormData({ name: "", unit: "" });
        setIsFormModalOpen(true);
    };

    const openEditModal = (item: any) => {
        setEditingItem(item);
        setFormData({ name: item.name, unit: item.unit });
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (editingItem) {
                await api.put(`/ingredients/${editingItem.id}`, formData);
                toast.success("Ingredient updated");
            } else {
                await api.post("/ingredients", formData);
                toast.success("Ingredient created");
            }
            setIsFormModalOpen(false);
            fetchIngredients();
        } catch (error) {
            console.error("Operation failed", error);
            toast.error("Operation failed");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/ingredients/${deleteId}`);
            toast.success("Ingredient deleted");
            setDeleteId(null);
            fetchIngredients();
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Delete failed");
        } finally {
            setDeleteLoading(false);
        }
    };

    const filteredIngredients = useMemo(() => {
        return ingredients.filter(ing =>
            ing.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [ingredients, searchQuery]);

    const getOnHand = (stocks: any[] = []) => {
        return stocks.reduce((sum, s) => sum + Number(s.quantity), 0);
    };

    return (
        <ProtectedRoute module="inventory-recipes:ingredients">
            <div className="min-h-screen bg-white dark:bg-gray-950 pb-20 font-outfit">

                {/* --- SIMPLIFIED HEADER --- */}
                <div className="px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/30 rounded-xl flex items-center justify-center text-brand-600">
                            <Package size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Ingredients</h1>
                            <p className="text-xs text-gray-500 font-medium tracking-tight">Manage your restaurant inventory and stock</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative group flex-1 md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-brand-500 rounded-xl outline-none text-sm transition-all"
                            />
                        </div>
                        <button className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 hover:text-brand-600 transition-all">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="p-8 max-w-7xl mx-auto space-y-6">

                    {/* --- ACTIONS BAR --- */}
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-gray-900 px-6 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm gap-4">
                        <div className="flex gap-4">
                            <button className="text-xs font-bold text-brand-600">All Items</button>
                            <button className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">Low Stocks</button>
                            <button className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">History</button>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold border border-gray-100 dark:border-gray-700 hover:bg-gray-100 transition-all">
                                <Upload size={14} /> Bulk
                            </button>
                            <button
                                onClick={openAddModal}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-all shadow-md shadow-brand-600/10"
                            >
                                <Plus size={16} /> New Ingredient
                            </button>
                        </div>
                    </div>

                    {/* --- SIMPLE TABLE --- */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Name</th>
                                        <th className="px-6 py-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Category</th>
                                        <th className="px-6 py-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider text-center">In Stock</th>
                                        <th className="px-6 py-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider text-center">Par Level</th>
                                        <th className="px-6 py-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider text-right">Unit Price</th>
                                        <th className="px-6 py-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider text-right pr-8">Total Value</th>
                                        <th className="px-6 py-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {loading ? (
                                        <tr><td colSpan={7} className="py-20 text-center"><Loader size="sm" /></td></tr>
                                    ) : filteredIngredients.length === 0 ? (
                                        <tr><td colSpan={7} className="py-20 text-center text-gray-400 text-sm italic">No records found.</td></tr>
                                    ) : (
                                        filteredIngredients.map((ing: any) => (
                                            <tr
                                                key={ing.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                                onClick={() => router.push(`/ingredients/${ing.id}`)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{ing.name}</span>
                                                        <span className="block text-[10px] text-gray-400 mt-0.5 font-medium uppercase">{ing.id.slice(-6)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-500 font-medium">Liquor / Bar</td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="inline-flex items-baseline gap-1 px-3 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 rounded-lg">
                                                        <span className="text-sm font-bold">{getOnHand(ing.stocks)}</span>
                                                        <span className="text-[10px] font-medium opacity-70 uppercase">{ing.unit}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center text-xs text-gray-400 font-medium italic">Not set</td>
                                                <td className="px-6 py-4 text-right text-xs text-gray-500 font-semibold">$0.00</td>
                                                <td className="px-6 py-4 text-right text-sm font-bold text-gray-800 dark:text-gray-200 pr-8">$0.00</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                                        <button onClick={() => openEditModal(ing)} className="p-2 text-gray-400 hover:text-brand-600 transition-colors">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button onClick={() => setDeleteId(ing.id)} className="p-2 text-gray-400 hover:text-rose-600 transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* --- SIMPLE MODALS --- */}
                {isFormModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <h2 className="text-base font-bold text-gray-800 dark:text-white">
                                    {editingItem ? "Edit Ingredient" : "New Ingredient"}
                                </h2>
                                <button onClick={() => setIsFormModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Tomatoes, Flour, etc."
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">Base Unit</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="kg, box, litre"
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsFormModalOpen(false)}
                                        className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="flex-[2] bg-brand-600 text-white font-bold py-2.5 rounded-xl hover:bg-brand-700 transition-all text-sm"
                                    >
                                        {formLoading ? "Saving..." : "Save Item"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {deleteId && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm p-8 text-center animate-in fade-in zoom-in duration-200">
                            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Delete Item?</h3>
                            <p className="text-xs text-gray-500 mb-6">Are you sure? This action will remove the ingredient from your list and recipes.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600">Cancel</button>
                                <button onClick={handleDelete} className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20">Delete</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}