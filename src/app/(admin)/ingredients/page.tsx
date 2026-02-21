"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { ViewDetailModal } from "@/components/ViewDetailModal";
import { ProtectedRoute } from "@/services/protected-route";

export default function IngredientsPage() {
    const [ingredients, setIngredients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // --- VIEW DETAIS MODAL ---
    const [viewIngredient, setViewIngredient] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // --- MODAL STATES ---
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null); // Null = Add Mode, Object = Edit Mode
    const [formData, setFormData] = useState({ name: "", unit: "" });
    const [formLoading, setFormLoading] = useState(false);

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        fetchIngredients();
    }, []);

    // --- FETCH DATA ---
    const fetchIngredients = async () => {
        try {
            setLoading(true);
            const res = await api.get("/ingredients");
            if (res.data?.success) {
                // Sorting by Created Date (Newest First)
                const sorted = res.data.data.sort(
                    (a: any, b: any) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setIngredients(sorted);
            }
        } catch (err) {
            console.error("Ingredients fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS ---
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
                // Update Logic
                await api.put(`/ingredients/${editingItem.id}`, formData);
            } else {
                // Create Logic
                await api.post("/ingredients", formData);
            }
            setIsFormModalOpen(false);
            fetchIngredients(); // Refresh list
        } catch (error) {
            console.error("Operation failed", error);
            alert("Something went wrong");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/ingredients/${deleteId}`);
            setDeleteId(null);
            fetchIngredients(); // Refresh list
        } catch (error) {
            console.error("Delete failed", error);
            alert("Could not delete ingredient");
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <ProtectedRoute module="inventory-recipes:ingredients">
            <div className="min-h-screen p-3 md:p-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl dark:text-gray-200">

                {/* HEADER */}
                <div className="md:flex gap-1 items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <Package className="text-blue-600" />
                        Ingredients Inventory
                    </h1>

                    <button
                        onClick={openAddModal}
                        className="bg-button backdrop-blur-xs outline-1 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add New Ingredient
                    </button>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 tracking-wider">
                            <tr>
                                <th className="px-4 py-3 text-left">#</th>
                                <th className="px-4 py-3 text-left">Ingredient Name</th>
                                <th className="px-4 py-3 text-left">Unit</th>
                                <th className="px-4 py-3 text-center">Stock Batches</th>
                                <th className="px-4 py-3 text-center">Used In Recipes</th>
                                <th className="px-4 py-3 text-left">Created</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center text-gray-500">
                                        Loading ingredients...
                                    </td>
                                </tr>
                            ) : ingredients.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center text-gray-500">
                                        No ingredients found. Add one to get started.
                                    </td>
                                </tr>
                            ) : (
                                ingredients.map((ing: any, index: number) => (
                                    <tr
                                        key={ing.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-gray-500">{index + 1}</td>

                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                                            {ing.name}
                                        </td>

                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border dark:border-gray-600">
                                                {ing.unit}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                {ing._count?.stocks || 0} Batches
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                                {ing._count?.recipes || 0} Recipes
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                                            {new Date(ing.createdAt).toLocaleDateString()}
                                        </td>

                                        <td className="px-4 py-3 flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setViewIngredient(ing);
                                                    setIsViewModalOpen(true);
                                                }}
                                                className="p-2 rounded transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(ing)}
                                                className="p-2 rounded transition-colors bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                                title="Edit"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteId(ing.id)}
                                                className="p-2 rounded transition-colors bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- ADD / EDIT MODAL --- */}
                {isFormModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                            <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                    {editingItem ? "Edit Ingredient" : "Add New Ingredient"}
                                </h2>
                                <button onClick={() => setIsFormModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Name
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Tomatoes"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Unit (e.g. kg, liter, pcs)
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. kg"
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsFormModalOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {formLoading ? "Saving..." : <><Save size={16} /> Save</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- DELETE CONFIRMATION MODAL --- */}
                {deleteId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in duration-200">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Ingredient?</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                This will remove the ingredient from the system. This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    disabled={deleteLoading}
                                    className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleteLoading}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                                >
                                    {deleteLoading ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW DETAIL MODAL */}
                <ViewDetailModal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    title="Ingredient Details"
                    data={viewIngredient}
                    fields={[
                        { label: "Name", key: "name" },
                        { label: "Unit", key: "unit" },
                        { label: "Stock Batches", render: (data: any) => data?._count?.stocks || 0 },
                        { label: "Recipes Used In", render: (data: any) => data?._count?.recipes || 0 },
                        { label: "Created At", render: (data: any) => new Date(data?.createdAt).toLocaleString() },
                        { label: "Last Updated", render: (data: any) => new Date(data?.updatedAt).toLocaleString() },
                        { label: "ID", key: "id" },
                    ]}
                />
            </div>
        </ProtectedRoute>
    );
}