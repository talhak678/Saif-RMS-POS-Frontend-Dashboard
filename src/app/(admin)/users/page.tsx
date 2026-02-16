"use client";

import { useEffect, useState } from "react";
import { AuthServiceInstance } from "@/services/auth.service";
import { toast } from "sonner";
import { Eye, ShieldCheck } from "lucide-react"; // Added ShieldCheck icon for permissions
import AddUser from "./add-user";
import EditUser from "./edit-user";
import DeleteUser from "./delete-user";
import { iUser } from "@/types/auth.types";

// Helper for consistent badge style
const getRoleBadge = (role: string) => {
    const base = "px-2 py-1 rounded text-xs font-medium";
    if (role === "ADMIN") return `${base} bg-purple-100 text-purple-800`;
    if (role === "MANAGER") return `${base} bg-blue-100 text-blue-800`;
    return `${base} bg-gray-100 text-gray-800`;
};

export default function UsersPage() {
    const [users, setUsers] = useState<iUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const authServ = AuthServiceInstance();

    const [openUserId, setOpenUserId] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await authServ.getUsers();
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

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="p-2 md:p-4 dark:bg-gray-900">
                <div className="md:flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-300">
                        Users
                    </h1>

                    <AddUser />
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
                                    </TableCell>
                                </TableRow>
                            ) : users.length > 0 ? (
                                users.map((user: iUser, index: number) => (
                                    <TableRow
                                        key={user.id}
                                    >
                                        <TableCell className="px-4 py-3">{index + 1}</TableCell>
                                        <TableCell className="px-4 py-3">{(user.name)}</TableCell>
                                        <TableCell className="px-4 py-3">{user.email}</TableCell>
                                        <TableCell className="px-4 py-3">{user?.restaurant?.name || '---'}</TableCell>
                                        <TableCell className="px-4 py-3">
                                            {user?.role?.name || '---'}
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <EditUser onAction={fetchUsers} user={user} />
                                            <DeleteUser onAction={fetchUsers} user={user} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        // colSpan={6}
                                        className="py-10 text-center text-gray-500"
                                    >
                                        No user found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            );
}