"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { Eye, Trash2, Plus, X, Edit, Filter, Phone, Clock, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import { ViewDetailModal } from "@/components/ViewDetailModal";
import { ProtectedRoute } from "@/services/protected-route";
import { useAuth } from "@/services/permission.service";
import Loader from "@/components/common/Loader";

function Branch() {
    const { user } = useAuth();
    const isSuperAdmin = user?.role?.name === 'SUPER_ADMIN';

    const searchParams = useSearchParams();
    const router = useRouter();
    const restaurantId = searchParams.get("restaurantId");

    const [branches, setBranches]: any = useState([]);
    const [restaurants, setRestaurants]: any = useState([]);
    const [loading, setLoading] = useState(true);

    // --- VIEW DETAILS MODAL ---
    const [viewBranch, setViewBranch] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedBranch, setSelectedBranch]: any = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (isSuperAdmin) {
            fetchRestaurants();
        }
    }, [isSuperAdmin]);

    useEffect(() => {
        fetchBranches();
    }, [restaurantId]);

    const fetchRestaurants = async () => {
        try {
            const res = await api.get("/restaurants");
            if (res.data?.success) {
                setRestaurants(res.data.data);
            }
        } catch (err) {
            console.error("Fetch restaurants failed", err);
        }
    };

    const fetchBranches = async (id?: string) => {
        const idToUse = id || restaurantId;

        // If super admin and no restaurant selected, don't fetch
        if (isSuperAdmin && !idToUse) {
            setBranches([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await api.get("/branches", {
                params: idToUse ? { restaurantId: idToUse } : {},
            });
            if (res.data?.success) {
                setBranches(res.data.data);
            }
        } catch (err) {
            console.error("Fetch branches failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRestaurantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        if (id) {
            router.push(`/branches?restaurantId=${id}`);
            fetchBranches(id);
        } else {
            router.push(`/branches`);
            setBranches([]);
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
        <div className="min-h-screen p-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl dark:text-gray-200">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-300">
                    Branches
                </h1>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {isSuperAdmin && (
                        <select
                            value={restaurantId || ""}
                            onChange={handleRestaurantChange}
                            className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                            <option value="">Select Restaurant</option>
                            {restaurants.map((res: any) => (
                                <option key={res.id} value={res.id}>
                                    {res.name}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* {isSuperAdmin && ( */}
                    <button
                        onClick={() =>
                            router.push(
                                restaurantId
                                    ? `/branches/add?restaurantId=${restaurantId}`
                                    : "/branches/add"
                            )
                        }
                        className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-100 dark:shadow-none flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Branch
                    </button>
                    {/* )} */}
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-x-auto border border-gray-100 dark:border-gray-700 shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50/50 dark:bg-gray-700/30">
                        <tr className="border-b dark:border-gray-700 font-bold uppercase tracking-widest text-[10px] text-gray-400">
                            <th className="px-4 py-4 text-left">#</th>
                            <th className="px-4 py-4 text-left">Branch</th>
                            <th className="px-4 py-4 text-left text-center">Status</th>
                            <th className="px-4 py-4 text-left">Restaurant</th>
                            <th className="px-4 py-4 text-left">Contact Info</th>
                            <th className="px-4 py-4 text-left">Timing</th>
                            <th className="px-4 py-4 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="py-20 text-center">
                                    <Loader size="md" />
                                </td>
                            </tr>
                        ) : isSuperAdmin && !restaurantId ? (
                            <tr>
                                <td colSpan={7} className="py-24 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400">
                                            <Filter size={24} />
                                        </div>
                                        <p className="font-medium text-lg text-gray-800 dark:text-gray-200">Please Select a Restaurant</p>
                                        <p className="text-sm max-w-[300px] mx-auto opacity-70">To view branches, please select a restaurant from the dropdown menu above.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : branches.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-20 text-center text-gray-500">
                                    No branches found
                                </td>
                            </tr>
                        ) : (
                            branches.map((branch: any, i: number) => (
                                <tr
                                    key={branch.id}
                                    className="group hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-all cursor-pointer"
                                    onClick={() => {
                                        setViewBranch(branch);
                                        setIsViewModalOpen(true);
                                    }}
                                >
                                    <td className="px-4 py-4 font-black font-mono text-gray-300 text-xs">{String(i + 1).padStart(2, '0')}</td>
                                    <td className="px-4 py-4">
                                        <div>
                                            <p className="font-black text-gray-800 dark:text-gray-200 tracking-tight">{branch.name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold truncate max-w-[150px]">{branch.address}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex justify-center">
                                            {branch.isOpen ? (
                                                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/20 uppercase tracking-widest">
                                                    <CheckCircle size={10} /> Open
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-[10px] font-black text-rose-500 bg-rose-50/50 dark:bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-100 dark:border-rose-500/20 uppercase tracking-widest">
                                                    <XCircle size={10} /> Closed
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                                            <span className="text-xs font-bold truncate max-w-[120px]">{branch.restaurant?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 min-w-[180px]">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                                                <Phone size={12} className="text-brand-500" />
                                                {branch.phone}
                                            </div>
                                            {branch.whatsappNumber && (
                                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                                                    <MessageSquare size={12} />
                                                    {branch.whatsappNumber}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                            <Clock size={12} className="text-brand-500" />
                                            {branch.timing || "N/A"}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => {
                                                    setViewBranch(branch);
                                                    setIsViewModalOpen(true);
                                                }}
                                                className="p-2 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-500/10 text-gray-400 hover:text-brand-500 transition-all border border-transparent hover:border-brand-100 dark:hover:border-brand-500/20"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>

                                            <button
                                                onClick={() => router.push(`/branches/edit/${branch.id}`)}
                                                className="p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-500/10 text-gray-400 hover:text-amber-600 transition-all border border-transparent hover:border-amber-100 dark:hover:border-amber-500/20"
                                                title="Edit Branch"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedBranch(branch);
                                                    setDeleteModal(true);
                                                }}
                                                className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-gray-400 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-500/20"
                                                title="Delete Branch"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
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
                    { label: "Branch Status", render: (data: any) => data?.isOpen ? '✅ Open' : '❌ Closed' },
                    { label: "Phone", key: "phone" },
                    { label: "WhatsApp", key: "whatsappNumber" },
                    { label: "Timing", key: "timing" },
                    { label: "Address", key: "address" },
                    { label: "Delivery Radius", render: (data: any) => `${data?.deliveryRadius || 0} km` },
                    { label: "Free Delivery Threshold", render: (data: any) => `$ ${data?.freeDeliveryThreshold || 0}` },
                    { label: "Delivery Charge", render: (data: any) => `$ ${data?.deliveryCharge || 0}` },
                    { label: "Delivery Off Time", key: "deliveryOffTime" },
                    { label: "Latitude", key: "lat" },
                    { label: "Longitude", key: "lng" },
                ]}
            />
        </div>
    );
}
export default function BranchPage() {
    return (
        // 2. Yahan Suspense wrap karein
        <ProtectedRoute module="restaurant-config:branches">
            <Suspense fallback={<div className="p-20 flex justify-center"><Loader size="md" /></div>}>
                <Branch />
            </Suspense>
        </ProtectedRoute>
    );
}
