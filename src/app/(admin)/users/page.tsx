"use client";

import { useEffect, useState } from "react";
import { AuthServiceInstance } from "@/services/auth.service";
import { toast } from "sonner";
import { Eye, ShieldCheck } from "lucide-react"; // Added ShieldCheck icon for permissions
import { ProtectedRoute } from "@/services/protected-route";
import AddUser from "./add-user";
import EditUser from "./edit-user";
import DeleteUser from "./delete-user";
import { useAuth } from "@/services/permission.service";
import api from "@/services/api";
import { iUser } from "@/types/auth.types";

// Helper for consistent badge style
const getRoleBadge = (role: string) => {
    const base = "px-2 py-1 rounded text-xs font-medium";
    if (role === "ADMIN") return `${base} bg-purple-100 text-purple-800`;
    if (role === "MANAGER") return `${base} bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 border border-brand-100 dark:border-brand-800`;
    return `${base} bg-gray-100 text-gray-800`;
};

export default function UsersPage() {
    const { user } = useAuth();
    const isSuperAdmin = user?.role?.name === "SUPER_ADMIN";

    const [users, setUsers] = useState<iUser[]>([]);
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const authServ = AuthServiceInstance();

    const [openUserId, setOpenUserId] = useState<string | null>(null);

    const fetchUsers = async (restaurantId?: string) => {
        try {
            setLoading(true);
            const res = await authServ.getUsers(restaurantId || selectedRestaurantId);
            if (res?.success) {
                setUsers(res?.data || []);
            } else {
                toast.error(res?.message || "Failed to fetch users");
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
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
        fetchUsers();
    }, [isSuperAdmin]);

    const handleRestaurantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedRestaurantId(id);
        fetchUsers(id);
    };

    return (
        <ProtectedRoute module="authentication:users">
            <div className="min-h-screen p-3 md:p-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl dark:text-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                        Users
                    </h1>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {isSuperAdmin && (
                            <select
                                value={selectedRestaurantId}
                                onChange={handleRestaurantChange}
                                className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                            >
                                <option value="">All Restaurants</option>
                                {restaurants.map((res) => (
                                    <option key={res.id} value={res.id}>
                                        {res.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        <AddUser onAction={fetchUsers} />
                    </div>
                </div>

                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left">#</th>
                                <th className="px-4 py-3 text-left">Name</th>
                                <th className="px-4 py-3 text-left">Email</th>
                                <th className="px-4 py-3 text-left">Restaurant</th>
                                <th className="px-4 py-3 text-left">Role</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-10 text-center">
                                        Loading users...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-10 text-center">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user, index) => (
                                    <>
                                        {/* MAIN ROW */}
                                        <tr
                                            key={user.id}
                                            className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                                                {user.name}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                                {user.email}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                                {user?.restaurant?.name || "---"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={getRoleBadge(user?.role?.name || "")}>
                                                    {user?.role?.name || "---"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        setOpenUserId(openUserId === user.id ? null : (user.id ?? null))
                                                    }
                                                    className={`p-2 rounded transition-colors ${openUserId === user.id
                                                        ? "bg-brand-50 text-brand-600 dark:bg-gray-700 dark:text-brand-400"
                                                        : "hover:bg-gray-100 text-gray-500 dark:hover:bg-gray-700 dark:text-gray-400"
                                                        }`}
                                                    title="View Permissions"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <EditUser onAction={fetchUsers} user={user} />
                                                <DeleteUser onAction={fetchUsers} user={user} />
                                            </td>
                                        </tr>

                                        {/* DETAILS DROPDOWN ROW */}
                                        {openUserId === user.id && (
                                            <tr className="bg-gray-50 dark:bg-gray-700/50 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <td colSpan={6} className="p-4 sm:p-6">
                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        {/* User Info Column */}
                                                        <div>
                                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wider">
                                                                User Details
                                                            </h3>
                                                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                                                <p>
                                                                    <span className="font-medium text-gray-900 dark:text-gray-200">
                                                                        ID:
                                                                    </span>{" "}
                                                                    <span className="font-mono text-xs">
                                                                        {user.id}
                                                                    </span>
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium text-gray-900 dark:text-gray-200">
                                                                        Created:
                                                                    </span>{" "}
                                                                    {user.createdAt
                                                                        ? new Date(user.createdAt).toLocaleDateString()
                                                                        : "N/A"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Permissions Column */}
                                                        <div>
                                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wider flex items-center gap-2">
                                                                <ShieldCheck size={16} className="text-brand-500" />
                                                                Module Access
                                                            </h3>

                                                            {user.role?.permissions && user.role.permissions.length > 0 ? (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {user.role.permissions.map((perm: any, idx: number) => (
                                                                        <span
                                                                            key={idx}
                                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
                                                                        >
                                                                            {perm.action} {/* Displaying just the module name */}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-gray-500 italic dark:text-gray-400">
                                                                    No specific permissions assigned.
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </ProtectedRoute>
    );
}