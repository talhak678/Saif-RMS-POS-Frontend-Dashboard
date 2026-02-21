    "use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Eye, ShieldCheck, Plus, Edit, Trash2, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Loader from "@/components/ui/spinner";
import { RoleServiceInstance } from "@/services/role.service";
import { ProtectedRoute } from "@/services/protected-route";
import { iRole } from "@/types/auth.types";

function Roles() {
    const router = useRouter();
    const [roles, setRoles] = useState<iRole[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [openRoleId, setOpenRoleId] = useState<string | null>(null);

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState<iRole | null>(null);
    const [deleting, setDeleting] = useState(false);

    const roleServ = RoleServiceInstance();

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const res = await roleServ.getRoles();
            if (res.success) {
                setRoles(res.data || []);
            } else {
                toast.error(res?.message || "Failed to fetch roles");
            }
        } catch (error) {
            console.error("Failed to fetch roles", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedRole?.id) return;
        try {
            setDeleting(true);
            const res = await roleServ.deleteRole(selectedRole.id);
            if (res.success) {
                toast.success("Role deleted successfully");
                setDeleteModal(false);
                fetchRoles();
            } else {
                toast.error(res?.message || "Failed to delete role");
            }
        } catch (err) {
            console.error("Delete failed", err);
            toast.error("Delete operation failed");
        } finally {
            setDeleting(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    return (

        <div className="min-h-screen p-3 md:p-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl dark:text-gray-200">
            {/* HEADER */}
            <div className="md:flex items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                        Roles & Permissions
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        System access control matrix
                    </p>
                </div>

                <Link
                    href="/role/add"
                    className="bg-button backdrop-blur-xs outline-1 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 mt-4 md:mt-0"
                >
                    <Plus className="h-4 w-4" />
                    Add New Role
                </Link>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                <Table className="w-full text-sm">
                    <TableHeader className="bg-gray-100 dark:bg-gray-700">
                        <TableRow>
                            <TableCell isHeader className="px-4 py-3 text-left">#</TableCell>
                            <TableCell isHeader className="px-4 py-3 text-left">Role Name</TableCell>
                            <TableCell isHeader className="px-4 py-3 text-left">Users Count</TableCell>
                            <TableCell isHeader className="px-4 py-3 text-left">Actions</TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader />
                                        <p className="text-gray-500 font-medium">Loading roles matrix...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : roles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="py-10 text-center text-gray-500 italic">
                                    No roles found
                                </TableCell>
                            </TableRow>
                        ) : (
                            roles.map((role, index) => (
                                <React.Fragment key={role.id}>
                                    <TableRow className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <TableCell className="px-4 py-3">{index + 1}</TableCell>
                                        <TableCell className="px-4 py-3 font-medium">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className="h-4 w-4 text-brand-500" />
                                                {role.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                {(role as any)._count?.users || 0} Users
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setOpenRoleId(openRoleId === role.id ? null : (role.id || null))}
                                                    className={`p-2 rounded transition-colors ${openRoleId === role.id
                                                        ? "bg-brand-500 text-white"
                                                        : "hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500"
                                                        }`}
                                                    title="View Permissions"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <Link href={`/role/edit/${role.id}`}>
                                                    <button className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500" title="Edit Role">
                                                        <Edit size={18} />
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setSelectedRole(role);
                                                        setDeleteModal(true);
                                                    }}
                                                    className="p-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                                                    title="Delete Role"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    {/* EXPANDED PERMISSIONS VIEW */}
                                    {openRoleId === role.id && (
                                        <TableRow className="bg-gray-50/50 dark:bg-white/[0.02]">
                                            <TableCell colSpan={4} className="p-6">
                                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    {role.permissions && role.permissions.length > 0 ? (
                                                        role.permissions.map((perm) => (
                                                            <div
                                                                key={perm.id}
                                                                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm"
                                                            >
                                                                <div className="h-1.5 w-1.5 rounded-full bg-brand-500"></div>
                                                                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">
                                                                    {perm.action.replace(/:/g, " | ")}
                                                                </span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="col-span-full py-4 text-center text-xs text-gray-500">
                                                            No specific permissions assigned.
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* DELETE MODAL */}
            {deleteModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Delete Role</h2>
                            <button onClick={() => setDeleteModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-medium">
                            Are you sure you want to delete the role <b>{selectedRole?.name}</b>? This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModal(false)}
                                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {deleting ? "Deleting..." : "Confirm Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function RolesPage() {
    return (
        <ProtectedRoute module="authentication:roles">
            <Suspense fallback={<div className="p-10 text-center text-gray-500">Loading Matrix...</div>}>
                <Roles />
            </Suspense>
        </ProtectedRoute>
    );
}