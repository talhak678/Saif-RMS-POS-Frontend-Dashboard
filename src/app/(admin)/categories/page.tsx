"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Plus, Utensils, LayoutGrid, Trash2, Pencil } from "lucide-react";
import AddCategoryModal from "./AddCategoryModal";
import DeleteCategoryModal from "./DeleteCategoryModal";
import CategoryDetailModal from "./CategoryDetailModal";
import EditCategoryModal from "./EditCategoryModal";
import { ProtectedRoute } from "@/services/protected-route";
import Loader from "@/components/common/Loader";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Detail panel
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [editCategory, setEditCategory] = useState<{ id: string; name: string; description?: string; image?: string } | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await api.get("/categories");
            if (res.data?.success) {
                const sorted = res.data.data.sort(
                    (a: any, b: any) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                );
                setCategories(sorted);
            }
        } catch (err) {
            console.error("Categories fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            setDeleteLoading(true);
            await api.delete(`/categories/${deleteId}`);
            setDeleteId(null);
            // Close detail panel if we just deleted the open category
            if (selectedId === deleteId) setSelectedId(null);
            fetchCategories();
        } catch (error) {
            console.error("Delete failed", error);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <ProtectedRoute module="menu-management:categories">
            <div className="min-h-screen p-3 md:p-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl dark:text-gray-200">

                {/* HEADER */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <LayoutGrid className="w-6 h-6 text-brand-600" />
                        Categories
                        {!loading && (
                            <span className="ml-1 text-sm font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-2.5 py-0.5 rounded-full">
                                {categories.length}
                            </span>
                        )}
                    </h1>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-button backdrop-blur-xs outline-1 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 hover:opacity-90"
                    >
                        <Plus className="h-4 w-4" />
                        Add Category
                    </button>
                </div>

                {/* CONTENT */}
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader size="md" />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-gray-400 gap-3">
                        <LayoutGrid className="w-14 h-14 opacity-20" />
                        <p className="text-base font-medium">No categories yet</p>
                        <p className="text-sm">Create your first category to organize your menu</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="mt-2 bg-button text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90"
                        >
                            <Plus className="h-4 w-4" />
                            Add First Category
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {categories.map((cat: any) => (
                            <div
                                key={cat.id}
                                onClick={() => setSelectedId(cat.id)}
                                className="relative flex flex-col items-center justify-center gap-2.5 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg hover:border-brand-300 dark:hover:border-brand-600 transition-all cursor-pointer group select-none"
                            >
                                {/* Edit button — top left on hover */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditCategory({ id: cat.id, name: cat.name, description: cat.description, image: cat.image });
                                    }}
                                    className="absolute top-2 left-2 p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-all"
                                    title="Edit"
                                >
                                    <Pencil size={13} />
                                </button>

                                {/* Delete button — top right on hover */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteId(cat.id);
                                    }}
                                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 opacity-0 group-hover:opacity-100 transition-all"
                                    title="Delete"
                                >
                                    <Trash2 size={13} />
                                </button>

                                {/* Icon / Image */}
                                <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-900/50 transition-colors overflow-hidden">
                                    {cat.image ? (
                                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Utensils className="w-7 h-7 text-brand-500 dark:text-brand-400" />
                                    )}
                                </div>

                                {/* Name */}
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 text-center leading-tight px-1 line-clamp-2">
                                    {cat.name}
                                </p>

                                {/* Item count badge */}
                                <span className="text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-2.5 py-0.5 rounded-full">
                                    {cat._count?.menuItems ?? 0} items
                                </span>
                            </div>
                        ))}

                        {/* Add New Card */}
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex flex-col items-center justify-center gap-2.5 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-brand-400 dark:hover:border-brand-500 hover:bg-brand-50/40 dark:hover:bg-brand-900/10 transition-all cursor-pointer group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30 transition-colors">
                                <Plus className="w-7 h-7 text-gray-400 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors" />
                            </div>
                            <p className="text-sm font-medium text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                Add New
                            </p>
                        </button>
                    </div>
                )}

                {/* ADD CATEGORY MODAL */}
                {showAddModal && (
                    <AddCategoryModal
                        onClose={() => setShowAddModal(false)}
                        onSuccess={fetchCategories}
                        restaurantId={categories[0]?.restaurantId}
                    />
                )}

                {/* EDIT CATEGORY MODAL */}
                {editCategory && (
                    <EditCategoryModal
                        category={editCategory}
                        onClose={() => setEditCategory(null)}
                        onSuccess={fetchCategories}
                    />
                )}

                {/* DELETE MODAL */}
                {deleteId && (
                    <DeleteCategoryModal
                        loading={deleteLoading}
                        onCancel={() => setDeleteId(null)}
                        onConfirm={handleDelete}
                    />
                )}

                {/* CATEGORY DETAIL SIDE PANEL */}
                <CategoryDetailModal
                    categoryId={selectedId}
                    onClose={() => setSelectedId(null)}
                />
            </div>
        </ProtectedRoute>
    );
}
