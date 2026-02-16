"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { Eye, Trash2, Plus, X } from "lucide-react";
import { ViewDetailModal } from "@/components/ViewDetailModal";

function Branch() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const restaurantId = searchParams.get("restaurantId");

    const [branches, setBranches]: any = useState([]);
    const [loading, setLoading] = useState(true);

    // --- VIEW DETAILS MODAL ---
    const [viewBranch, setViewBranch] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedBranch, setSelectedBranch]: any = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchBranches();
    }, [restaurantId]);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            if (restaurantId) {
                const res = await api.get(`/restaurants/${restaurantId}`);
                if (res.data?.success) {
                    setBranches(res.data.data.branches);
                }

            } else {
                const res = await api.get("/branches", {
                    params: restaurantId ? { restaurantId } : {},
                });
                if (res.data?.success) {
                    setBranches(res.data.data);
                }
            }

        } catch (err) {
            console.error("Fetch branches failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedBranch) return;

        try {
            setDeleting(true);
            await api.delete(`/branches/${selectedBranch.id}`);
            setDeleteModal(false);
            fetchBranches();
        } catch (err) {
            console.error("Delete failed", err);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="min-h-screen p-4 dark:bg-gray-900 dark:text-gray-200">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-300">
                    Branches
                </h1>

                <button
                    onClick={() =>
                        router.push(
                            restaurantId
                                ? `/branches/add?restaurantId=${restaurantId}`
                                : "/branches/add"
                        )
                    }
                    className="bg-button backdrop-blur-xs outline-1 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                    <Plus size={16} />
                    Add Branch
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">Branch</th>
                            <th className="px-4 py-3">Restaurant</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-10 text-center">
                                    Loading branches...
                                </td>
                            </tr>
                        ) : (
                            branches.map((branch: any, i: number) => (
                                <tr
                                    key={branch.id}
                                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    onDoubleClick={() => {
                                        setViewBranch(branch);
                                        setIsViewModalOpen(true);
                                    }}
                                >
                                    <td className="px-4 py-3">{i + 1}</td>
                                    <td className="px-4 py-3">{branch.name}</td>
                                    <td className="px-4 py-3">
                                        {branch.restaurant?.name}
                                    </td>
                                    <td className="px-4 py-3">{branch.phone}</td>
                                    <td className="px-4 py-3 flex gap-2">
                                        <button
                                            onClick={() => {
                                                setViewBranch(branch);
                                                setIsViewModalOpen(true);
                                            }}
                                            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                                        >
                                            <Eye size={16} />
                                        </button>

                                        <button
                                            onClick={() => {
                                                setSelectedBranch(branch);
                                                setDeleteModal(true);
                                            }}
                                            className="p-2 rounded bg-red-600 text-white"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* DELETE MODAL */}
            {deleteModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-80">
                        <div className="flex justify-between mb-4">
                            <h2 className="font-semibold">Delete Branch</h2>
                            <button onClick={() => setDeleteModal(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <p className="text-sm mb-4">
                            Are you sure you want to delete{" "}
                            <b>{selectedBranch?.name}</b>?
                        </p>

                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="w-full bg-red-600 text-white py-2 rounded"
                        >
                            {deleting ? "Deleting..." : "Confirm Delete"}
                        </button>
                    </div>
                </div>
            )}

            {/* VIEW DETAIL MODAL */}
            <ViewDetailModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Branch Details"
                data={viewBranch}
                fields={[
                    { label: "Name", key: "name" },
                    { label: "Restaurant", render: (data: any) => data?.restaurant?.name },
                    { label: "Phone", key: "phone" },
                    { label: "Address", key: "address" },
                    { label: "Delivery Radius", render: (data: any) => `${data?.deliveryRadius || 0} km` },
                    { label: "Free Delivery Threshold", render: (data: any) => `Rs. ${data?.freeDeliveryThreshold || 0}` },
                    { label: "Delivery Charge", render: (data: any) => `Rs. ${data?.deliveryCharge || 0}` },
                    { label: "Delivery Off Time", key: "deliveryOffTime" },
                ]}
            />
        </div>
    );
}
export default function BranchPage() {
    return (
        // 2. Yahan Suspense wrap karein
        <Suspense fallback={<div className="p-10 text-center">Loading Form...</div>}>
            <Branch />
        </Suspense>
    );
}
