"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { endpoints } from "@/types/environment";
import { toast } from "sonner";
import { Filter, Plus } from "lucide-react";
import { ProtectedRoute } from "@/services/protected-route";
import { useAuth } from "@/services/permission.service";
import AddPlan from "./add-plan";
import EditPlan from "./edit-plan";

export default function PaymentPlansPage() {
    const { user } = useAuth();
    const isSuperAdmin = user?.role?.name === "SUPER_ADMIN";

    const [prices, setPrices] = useState<any[]>([]);
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    const fetchPrices = async (restaurantId?: string) => {
        const idToUse = restaurantId !== undefined ? restaurantId : selectedRestaurantId;

        // If super admin and no restaurant selected, don't fetch
        if (isSuperAdmin && !idToUse) {
            setPrices([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await api.get(endpoints.getSubscriptionPrices, {
                params: idToUse ? { restaurantId: idToUse } : {},
            });
            if (res.data?.success) {
                setPrices(res.data.data);
            } else {
                toast.error(res.data?.message || "Failed to fetch payment plans");
            }
        } catch (error) {
            console.error("Failed to fetch payment plans", error);
            toast.error("An error occurred while fetching payment plans");
        } finally {
            setLoading(false);
        }
    };

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

    useEffect(() => {
        if (isSuperAdmin) {
            fetchRestaurants();
        }
        // Only fetch prices if not super admin, or if super admin has a selected restaurant
        if (!isSuperAdmin || selectedRestaurantId) {
            fetchPrices();
        } else {
            setLoading(false); // Stop initial loader for Super Admin
        }
    }, [isSuperAdmin]);

    const handleRestaurantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedRestaurantId(id);
        fetchPrices(id);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this payment plan?")) return;
        try {
            const res = await api.delete(`${endpoints.deleteSubscriptionPrice}${id}`);
            if (res.data?.success) {
                toast.success("Payment plan deleted successfully");
                fetchPrices();
            } else {
                toast.error(res.data?.message || "Failed to delete payment plan");
            }
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("An error occurred while deleting the payment plan");
        }
    };

    return (
        <ProtectedRoute module="restaurant-config:payment-plans">
            <div className="min-h-screen p-3 md:p-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl dark:text-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                        Payment Plans
                    </h1>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {isSuperAdmin && (
                            <>
                                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700 shadow-sm">
                                    <Filter size={16} className="text-gray-400" />
                                    <select
                                        value={selectedRestaurantId}
                                        onChange={handleRestaurantChange}
                                        className="bg-transparent text-sm focus:outline-none dark:text-gray-200"
                                    >
                                        <option value="">Select Restaurant</option>
                                        {restaurants.map((res) => (
                                            <option key={res.id} value={res.id}>
                                                {res.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <AddPlan onAction={fetchPrices} />

                            </>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">#</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Plan</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Price</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Billing Cycle</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Restaurant</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                {isSuperAdmin && (
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                                )}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center text-gray-500">
                                        Loading plans...
                                    </td>
                                </tr>
                            ) : isSuperAdmin && !selectedRestaurantId ? (
                                <tr>
                                    <td colSpan={7} className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400">
                                                <Filter size={24} />
                                            </div>
                                            <p className="font-medium text-lg text-gray-800 dark:text-gray-200">Please Select a Restaurant</p>
                                            <p className="text-sm max-w-[300px] mx-auto opacity-70">To manage subscription plans, please select a restaurant from the dropdown menu above.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : prices.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center text-gray-500">
                                        No payment plans found
                                    </td>
                                </tr>
                            ) : (
                                prices.map((price, index) => (
                                    <tr
                                        key={price.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                                            {price.plan}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                            ${price.price}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                            {price.billingCycle}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                            {price.restaurant?.name || "---"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${price.isActive
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                }`}>
                                                {price.isActive ? "ACTIVE" : "INACTIVE"}
                                            </span>
                                        </td>
                                        {isSuperAdmin && (
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <EditPlan onAction={fetchPrices} priceData={price} />
                                                    <button
                                                        onClick={() => handleDelete(price.id)}
                                                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </ProtectedRoute>
    );
}
