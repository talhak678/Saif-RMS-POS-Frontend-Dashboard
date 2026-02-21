"use client";

import React, { useState, useEffect, use, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import Loader from "@/components/ui/spinner";
import { RoleServiceInstance } from "@/services/role.service";
import { iPermission, iRole } from "@/types/auth.types";
import { ProtectedRoute } from "@/services/protected-route";

interface PageProps {
    params: Promise<{ id: string }>;
}

function EditRoleForm({ params }: PageProps) {
    const router = useRouter();
    const resolvedParams = use(params);
    const roleId = resolvedParams.id;

    const [RoleForm, setRoleForm] = useState<iRole>({
        name: "",
        permissions: [],
    });
    const [permissions, setPermissions] = useState<iPermission[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);

    const roleServ = RoleServiceInstance();

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch All Permissions
            const permRes = await roleServ.getPermissions();
            if (permRes?.success) {
                setPermissions(permRes?.data || []);
            }

            // Fetch Specific Role Data
            const roleRes = await roleServ.getRoles();
            if (roleRes?.success) {
                const existingRole = roleRes.data.find((r: iRole) => r.id === roleId);
                if (existingRole) {
                    setRoleForm({
                        id: existingRole.id,
                        name: existingRole.name,
                        permissions: existingRole.permissions || [],
                    });
                } else {
                    toast.error("Role not found");
                    router.push("/role");
                }
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast.error("Initialization failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!RoleForm.name.trim()) {
            toast.error("Role name is required");
            return;
        }
        if (RoleForm.permissions.length === 0) {
            toast.error("Please select at least one permission");
            return;
        }

        try {
            setSaving(true);
            const payload = {
                id: roleId,
                name: RoleForm.name,
                permissionIds: RoleForm.permissions.map(p => p.id)
            };
            const res = await roleServ.updateRole(payload as any);
            if (res.success) {
                toast.success("Role updated successfully!");
                router.push("/role");
            } else {
                toast.error(res?.message || "Failed to update role");
            }
        } catch (err) {
            toast.error("Update failed");
        } finally {
            setSaving(false);
        }
    };

    const handlePermissionChange = (perm: iPermission, checked: boolean) => {
        setRoleForm((prev) => {
            if (!checked) {
                return {
                    ...prev,
                    permissions: prev.permissions.filter((p) => p.id !== perm.id),
                };
            } else {
                return {
                    ...prev,
                    permissions: [...prev.permissions, perm],
                };
            }
        });
    };

    const toggleAll = () => {
        if (RoleForm.permissions.length === permissions.length) {
            setRoleForm({ ...RoleForm, permissions: [] });
        } else {
            setRoleForm({ ...RoleForm, permissions: [...permissions] });
        }
    };

    useEffect(() => {
        fetchData();
    }, [roleId]);

    // Grouping permissions by module
    const groupedPermissions = permissions.reduce((acc, perm) => {
        const group = perm.action.split(':')[0] || 'Other';
        if (!acc[group]) acc[group] = [];
        acc[group].push(perm);
        return acc;
    }, {} as Record<string, iPermission[]>);

    return (
        <div className="min-h-screen p-4 dark:bg-gray-900/50">
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    <ArrowLeft size={18} />
                </button>

                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-300">
                    Edit Role Configuration
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* ROLE NAME CARD */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-100 dark:border-gray-700">
                    <div className="max-w-md">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                            Role Identity *
                        </label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                required
                                name="name"
                                value={RoleForm.name}
                                onChange={(e) => setRoleForm({ ...RoleForm, name: e.target.value })}
                                placeholder="e.g. Senior Administrator"
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                                disabled={saving}
                            />
                        </div>
                    </div>
                </div>

                {/* PERMISSIONS MATRIX CARD */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Permissions Matrix</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Modify module availability and controls</p>
                        </div>
                        <button
                            type="button"
                            onClick={toggleAll}
                            disabled={loading}
                            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline uppercase tracking-tight"
                        >
                            {RoleForm.permissions.length === permissions.length ? 'Deselect All' : 'Grant All Access'}
                        </button>
                    </div>

                    {loading ? (
                        <div className="py-20 flex flex-col items-center gap-3">
                            <Loader />
                            <p className="text-sm text-gray-500 font-bold animate-pulse uppercase">Synchronizing Matrix...</p>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {Object.entries(groupedPermissions).map(([group, groupPerms]) => (
                                <div key={group} className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-brand-500"></div>
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.15em]">
                                            {group} Module
                                        </h3>
                                        <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700"></div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {groupPerms.map((perm) => {
                                            const isChecked = RoleForm.permissions.some((p) => p.id === perm.id);
                                            return (
                                                <label
                                                    key={perm.id}
                                                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer select-none ${isChecked
                                                        ? 'bg-brand-500/5 border-brand-500/30'
                                                        : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 hover:border-brand-500/40'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={(e) => handlePermissionChange(perm, e.target.checked)}
                                                        className="w-5 h-5 accent-brand-500 rounded border-gray-300 dark:border-gray-600"
                                                    />
                                                    <div>
                                                        <span className={`text-[11px] font-black uppercase tracking-tight block ${isChecked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                                                            }`}>
                                                            {perm.action.includes(':') ? perm.action.split(':')[1].replace(/-/g, ' ') : perm.action}
                                                        </span>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={saving || loading}
                        className="bg-brand-500 text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-brand-500/20 hover:bg-brand-600 disabled:opacity-50 transition-all active:scale-95 flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Update Role
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={saving}
                        className="px-8 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Discard
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function EditRolePage({ params }: PageProps) {
    return (
        <ProtectedRoute module="authentication">
            <Suspense fallback={<div className="p-10 text-center text-gray-500">Loading Configuration...</div>}>
                <EditRoleForm params={params} />
            </Suspense>
        </ProtectedRoute>
    );
}