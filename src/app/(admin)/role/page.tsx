"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { iRole } from "@/types/auth.types";
import { toast } from "sonner";
import { RoleServiceInstance } from "@/services/role.service";
import AddRole from "./add-role";
import EditRole from "./edit-role";
import DeleteRole from "./delete-role";
import { Eye, ShieldCheck } from "lucide-react"; // Import Icons

export default function Roles() {
    const [Roles, setRoles] = useState<iRole[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const roleServ = RoleServiceInstance();

    // State to manage which role's details are open
    const [openRoleId, setOpenRoleId] = useState<string | null>(null);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const res = await roleServ.getRoles();
            if (res?.success) {
                setRoles(res?.data || []);
            } else {
                toast.error(res?.message || "Failed to fetch Roles");
            }
        } catch (error) {
            console.error("Failed to fetch Roles", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="p-2 md:p-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl dark:text-gray-200">
                <div className="md:flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-300">
                        Roles
                    </h1>

                    <AddRole />
                </div>

                {/* Table */}
                <div className="overflow-x-auto bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                    <Table className="w-full text-sm">
                        <TableHeader>
                            <TableRow className="whitespace-nowrap bg-gray-100 dark:bg-gray-700">
                                <TableCell className="px-4 py-3 text-left">#</TableCell>
                                <TableCell className="px-4 py-3 text-left">Name</TableCell>
                                <TableCell className="px-4 py-3 text-left">Users Count</TableCell>
                                <TableCell className="px-4 py-3 text-left">Actions</TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="whitespace-nowrap">
                            {loading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="py-10 text-center text-gray-500"
                                    >
                                        Loading Roles...
                                    </TableCell>
                                </TableRow>
                            ) : Roles.length > 0 ? (
                                Roles.map((Role: any, index: number) => (
                                    <>
                                        {/* MAIN ROW */}
                                        <TableRow
                                            key={Role.id}
                                            className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <TableCell className="px-4 py-3">{index + 1}</TableCell>
                                            <TableCell className="px-4 py-3 font-medium">
                                                {Role.name}
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                    {Role._count?.users || 0} Users
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() =>
                                                            setOpenRoleId(
                                                                openRoleId === Role.id ? null : Role.id
                                                            )
                                                        }
                                                        className={`p-2 rounded transition-colors ${openRoleId === Role.id
                                                            ? "bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400"
                                                            : "hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
                                                            }`}
                                                        title="View Permissions"
                                                    >
                                                        <Eye size={18} />
                                                    </button>

                                                    <EditRole onAction={fetchRoles} Role={Role} />
                                                    <DeleteRole onAction={fetchRoles} Role={Role} />
                                                </div>
                                            </TableCell>
                                        </TableRow>

                                        {/* DETAILS DROPDOWN ROW */}
                                        {openRoleId === Role.id && (
                                            <TableRow className="bg-gray-50 dark:bg-gray-700/50 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <TableCell colSpan={4} className="p-4 sm:p-6">
                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        {/* Role Info Column */}
                                                        <div>
                                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wider">
                                                                Role Details
                                                            </h3>
                                                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                                                <p>
                                                                    <span className="font-medium text-gray-900 dark:text-gray-200">
                                                                        ID:
                                                                    </span>{" "}
                                                                    <span className="font-mono text-xs">
                                                                        {Role.id}
                                                                    </span>
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium text-gray-900 dark:text-gray-200">
                                                                        Created:
                                                                    </span>{" "}
                                                                    {Role.createdAt
                                                                        ? new Date(Role.createdAt).toLocaleDateString()
                                                                        : "N/A"}
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium text-gray-900 dark:text-gray-200">
                                                                        Updated:
                                                                    </span>{" "}
                                                                    {Role.updatedAt
                                                                        ? new Date(Role.updatedAt).toLocaleDateString()
                                                                        : "N/A"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Permissions Column */}
                                                        <div>
                                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wider flex items-center gap-2">
                                                                <ShieldCheck
                                                                    size={16}
                                                                    className="text-blue-500"
                                                                />
                                                                Assigned Permissions
                                                            </h3>

                                                            {Role.permissions && Role.permissions.length > 0 ? (
                                                                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                                                    {Role.permissions.map(
                                                                        (perm: any, idx: number) => (
                                                                            <span
                                                                                key={perm.id || idx}
                                                                                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-gray-200 text-gray-700 shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
                                                                            >
                                                                                {/* Formatting permission string (e.g., "order:edit" -> "Order: Edit") */}
                                                                                {perm.action
                                                                                    ? perm.action
                                                                                        .split(":")
                                                                                        .map(
                                                                                            (s: string) =>
                                                                                                s.charAt(0).toUpperCase() +
                                                                                                s.slice(1)
                                                                                        )
                                                                                        .join(": ")
                                                                                    : "Unknown"}
                                                                            </span>
                                                                        )
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-gray-500 italic dark:text-gray-400">
                                                                    No specific permissions assigned.
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="py-10 text-center text-gray-500"
                                    >
                                        No Role found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}