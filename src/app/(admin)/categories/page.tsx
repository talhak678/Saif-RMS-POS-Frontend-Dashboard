"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Eye, Plus, Utensils, LayoutGrid, Trash2 } from "lucide-react";
// Modals import karein
import AddCategoryModal from "./AddCategoryModal";
import DeleteCategoryModal from "./DeleteCategoryModal";
import { ViewDetailModal } from "@/components/ViewDetailModal";
import { ProtectedRoute } from "@/services/protected-route";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // --- VIEW DETAILS MODAL ---
    const [viewCategory, setViewCategory] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

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

    // Delete Handler
    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            setDeleteLoading(true);
            await api.delete(`/categories/${deleteId}`);
            setDeleteId(null);
            fetchCategories(); // Refresh list
        } catch (error) {
            console.error("Delete failed", error);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <ProtectedRoute module="pos:menu">
            <div className="min-h-screen p-3 md:p-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl dark:text-gray-200">
                {/* HEADER */}
                <div className="md:flex gap-1 items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <LayoutGrid className="w-6 h-6 text-blue-600" />
                        Categories
                    </h1>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-button backdrop-blur-xs outline-1 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 hover:opacity-90"
                    >
                        <Plus className="h-4 w-4" />
                        Add New Category
                    </button>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left">#</th>
                                <th className="px-4 py-3 text-left">Category Name</th>
                                <th className="px-4 py-3 text-left">Description</th>
                                <th className="px-4 py-3 text-center">Menu Items</th>
                                <th className="px-4 py-3 text-left">Created</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-10 text-center text-gray-500">
                                        Loading categories...
                                    </td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-10 text-center text-gray-500">
                                        No categories found
                                    </td>
                                </tr>
                            ) : (
                                categories.map((cat: any, index: number) => (
                                    <tr
                                        key={cat.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-gray-500">{index + 1}</td>

                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                                            {cat.name}
                                        </td>

                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                            {cat.description || "N/A"}
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                {cat._count?.menuItems || 0} Items
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                                            {new Date(cat.createdAt).toLocaleDateString()}
                                        </td>

                                        <td className="px-4 py-3 flex items-center gap-2">
                                            {/* View Button */}
                                            <button
                                                onClick={() => {
                                                    setViewCategory(cat);
                                                    setIsViewModalOpen(true);
                                                }}
                                                className="p-2 rounded transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => setDeleteId(cat.id)}
                                                className="p-2 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 dark:hover:bg-red-900/30 transition-colors"
                                                title="Delete Category"
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

                {/* ADD CATEGORY MODAL */}
                {showAddModal && (
                    <AddCategoryModal
                        onClose={() => setShowAddModal(false)}
                        onSuccess={fetchCategories}
                        restaurantId={categories[0]?.restaurantId}
                    />
                )}

                {/* DELETE CONFIRMATION MODAL */}
                {deleteId && (
                    <DeleteCategoryModal
                        loading={deleteLoading}
                        onCancel={() => setDeleteId(null)}
                        onConfirm={handleDelete}
                    />
                )}

                {/* VIEW DETAIL MODAL */}
                <ViewDetailModal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    title="Category Details"
                    data={viewCategory}
                    fields={[
                        { label: "Name", key: "name" },
                        { label: "Description", key: "description", fullWidth: true },
                        { label: "Total Menu Items", render: (data: any) => <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{data?._count?.menuItems || 0} Items</span> },
                        { label: "ID", key: "id" },
                        { label: "Restaurant ID", key: "restaurantId" },
                        { label: "Created At", render: (data: any) => new Date(data?.createdAt).toLocaleString() },
                        { label: "Last Updated", render: (data: any) => new Date(data?.updatedAt).toLocaleString() },
                    ]}
                />
            </div>
        </ProtectedRoute>
    );
}
