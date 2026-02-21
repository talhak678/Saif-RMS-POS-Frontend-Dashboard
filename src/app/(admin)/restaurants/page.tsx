"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Eye, ExternalLink, Plus, Edit, Trash2, Power } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { ViewDetailModal } from "@/components/ViewDetailModal";
import { ProtectedRoute } from "@/services/protected-route";
import { useAuth } from "@/services/permission.service";
import { toast } from "sonner";


const getStatusBadge = (status: string) => {
    const base = "px-2 py-1 rounded text-xs font-semibold";
    return status === "ACTIVE"
        ? `${base} bg-green-100 text-green-800`
        : `${base} bg-red-100 text-red-800`;
};

const getSubscriptionBadge = (sub: string) => {
    const base = "px-2 py-1 rounded text-xs font-semibold";
    switch (sub) {
        case "PREMIUM":
            return `${base} bg-purple-100 text-purple-800`;
        case "STANDARD":
            return `${base} bg-blue-100 text-blue-800`;
        default:
            return `${base} bg-gray-100 text-gray-800`;
    }
};

export default function RestaurantsPage() {
    const { user } = useAuth();
    const isSuperAdmin = user?.role?.name === 'SUPER_ADMIN';

    const [restaurants, setRestaurants]: any = useState([]);
    const [loading, setLoading] = useState(true);

    // --- VIEW DETAILS MODAL ---
    const [viewRestaurant, setViewRestaurant] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const [togglingStatus, setTogglingStatus] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const res = await api.get("/restaurants");

            if (res.data?.success) {
                const sorted = res.data.data.sort(
                    (a: any, b: any) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                );
                setRestaurants(sorted);
            }
        } catch (err) {
            console.error("Restaurants fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (restaurant: any) => {
        try {
            setTogglingStatus(restaurant.id);
            const newStatus = restaurant.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

            // Per requirement: send all original data along with changed data
            const payload = {
                ...restaurant,
                status: newStatus
            };
            delete payload._count;

            const res = await api.put(`/restaurants/${restaurant.id}`, payload);
            if (res.data?.success) {
                toast.success(`Restaurant ${newStatus.toLowerCase()} successfully`);
                fetchRestaurants();
            } else {
                toast.error(res.data?.message || "Failed to update status");
            }
        } catch (err) {
            toast.error("Status update failed");
        } finally {
            setTogglingStatus(null);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;

        try {
            setDeleting(id);
            const res = await api.delete(`/restaurants/${id}`);
            if (res.data?.success) {
                toast.success("Restaurant deleted successfully");
                fetchRestaurants();
            } else {
                toast.error(res.data?.message || "Failed to delete restaurant");
            }
        } catch (err) {
            toast.error("Delete operation failed");
        } finally {
            setDeleting(null);
        }
    };

    return (
        <ProtectedRoute module="restaurant-config:restaurants">
            <div className="min-h-screen p-3 md:p-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl dark:text-gray-200">
                <div className="md:flex gap-1 items-center justify-between mb-6">

                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                        Restaurants
                    </h1>
                    {isSuperAdmin && (
                        <Link
                            href="/restaurants/new"
                            className="bg-button backdrop-blur-xs outline-1 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add New Restaurant
                        </Link>
                    )}
                </div>
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left">#</th>
                                <th className="px-4 py-3">Restaurant</th>
                                <th className="px-4 py-3">Subscription</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Branches</th>
                                <th className="px-4 py-3">Users</th>
                                <th className="px-4 py-3">Created</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="py-10 text-center">
                                        Loading restaurants...
                                    </td>
                                </tr>
                            ) : restaurants.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-10 text-center">
                                        No restaurants found
                                    </td>
                                </tr>
                            ) : (
                                restaurants.map((res: any, index: number) => (
                                    <tr
                                        key={res.id}
                                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <td className="px-4 py-3">{index + 1}</td>

                                        <td className="px-4 py-3 font-medium flex items-center gap-3">
                                            <img
                                                src={res.logo}
                                                alt={res.name}
                                                className="w-10 h-10 rounded object-cover"
                                            />
                                            <div>
                                                <div>{res.name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {res.slug}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <span
                                                className={getSubscriptionBadge(
                                                    res.subscription
                                                )}
                                            >
                                                {res.subscription}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            <span
                                                className={getStatusBadge(res.status)}
                                            >
                                                {res.status}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            {res._count.branches}
                                        </td>

                                        <td className="px-4 py-3">
                                            {res._count.users}
                                        </td>

                                        <td className="px-4 py-3 text-xs">
                                            {new Date(
                                                res.createdAt
                                            ).toLocaleDateString()}
                                        </td>

                                        <td className="px-4 py-3 flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setViewRestaurant(res);
                                                    setIsViewModalOpen(true);
                                                }}
                                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>

                                            {isSuperAdmin && (
                                                <>
                                                    <button
                                                        onClick={() => router.push(`/restaurants/edit/${res.id}`)}
                                                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 rounded"
                                                        title="Edit Restaurant"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusToggle(res)}
                                                        disabled={togglingStatus === res.id}
                                                        className={`p-2 rounded ${res.status === 'ACTIVE'
                                                            ? 'text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                                                            : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30'}`}
                                                        title={res.status === 'ACTIVE' ? "Suspend Restaurant" : "Activate Restaurant"}
                                                    >
                                                        <Power size={18} className={togglingStatus === res.id ? 'animate-spin' : ''} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(res.id, res.name)}
                                                        disabled={deleting === res.id}
                                                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded"
                                                        title="Delete Restaurant"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}

                                            {res._count.branches > 0 && (
                                                <button
                                                    onClick={() =>
                                                        router.push(
                                                            `/branches?restaurantId=${res.id}`
                                                        )
                                                    }
                                                    className="text-xs px-3 py-1 rounded bg-blue-600 text-white flex items-center gap-1 h-9"
                                                >
                                                    View Branches
                                                    <ExternalLink size={12} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* VIEW DETAIL MODAL */}
                <ViewDetailModal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    title="Restaurant Details"
                    data={viewRestaurant}
                    fields={[
                        { label: "Name", key: "name" },
                        { label: "Description", key: "description", fullWidth: true },
                        { label: "Slug", key: "slug" },
                        { label: "Subscription", render: (data: any) => <span className={getSubscriptionBadge(data?.subscription)}>{data?.subscription}</span> },
                        { label: "Status", render: (data: any) => <span className={getStatusBadge(data?.status)}>{data?.status}</span> },
                        {
                            label: "Facebook",
                            render: (data: any) => data?.facebookUrl ? <a href={data.facebookUrl} target="_blank" className="text-blue-600 underline">Link</a> : 'N/A'
                        },
                        {
                            label: "Instagram",
                            render: (data: any) => data?.instagramUrl ? <a href={data.instagramUrl} target="_blank" className="text-pink-600 underline">Link</a> : 'N/A'
                        },
                        {
                            label: "TikTok",
                            render: (data: any) => data?.tiktokUrl ? <a href={data.tiktokUrl} target="_blank" className="underline">Link</a> : 'N/A'
                        },
                        { label: "Meta Pixel ID", key: "metaPixelId" },
                        { label: "Created At", render: (data: any) => new Date(data?.createdAt).toLocaleString() },
                        { label: "Updated At", render: (data: any) => new Date(data?.updatedAt).toLocaleString() },
                    ]}
                />
            </div>
        </ProtectedRoute>
    );
}
