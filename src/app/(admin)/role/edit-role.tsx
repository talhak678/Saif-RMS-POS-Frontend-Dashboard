"use client";
import React, { useEffect, useState } from "react";
import { Edit, ShieldCheck, X } from "lucide-react";
import { iPermission, iRole } from "@/types/auth.types";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import { RoleServiceInstance } from "@/services/role.service";
import { Button } from "@/components/ui/button/Button";
import Loader from "@/components/ui/spinner";
import Checkbox from "@/components/form/input/Checkbox";
import Label from "@/components/form/Label";

const EditRole = ({ onAction, Role }: { onAction?: () => void; Role: iRole }) => {
    const [RoleForm, setRoleForm] = useState<iRole>({
        name: "",
        permissions: [],
    });
    const [permissions, setPermissions] = useState<iPermission[]>([]);
    const [permLoading, setPermLoading] = useState<boolean>(true);
    const [modal, setModal] = useState<boolean>(false);
    const [savingRole, setSavingRole] = useState<boolean>(false);
    const roleServ = RoleServiceInstance();

    const fetchPermissions = async () => {
        try {
            const res = await roleServ.getPermissions();
            if (res?.success) {
                setPermissions(res?.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch permissions", error);
        } finally {
            setPermLoading(false);
        }
    };

    async function saveRole(e: any) {
        e.preventDefault();
        if (!RoleForm.name.trim()) {
            toast.error("Role name is required");
            return;
        }

        setSavingRole(true);
        try {
            // THE CRITICAL FIX: Send permissionIds (array of strings) instead of objects
            const payload = {
                id: Role.id,
                name: RoleForm.name,
                permissionIds: RoleForm.permissions.map(p => p.id).filter(Boolean) as string[]
            };

            // roleServ.updateRole(payload) internally calls PUT /roles/:id if we pass id
            const res = await roleServ.updateRole(payload as any);

            if (res.success) {
                toast.success("Role updated successfully!");
                onAction?.();
                setModal(false);
            } else {
                toast.error(res?.message || "Failed to update Role");
            }
        } catch (err) {
            toast.error("Failed to update Role");
        } finally {
            setSavingRole(false);
        }
    }

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
        if (modal) {
            fetchPermissions();
            setRoleForm({
                ...Role,
                permissions: Role.permissions || []
            });
        }
    }, [modal, Role]);

    return (
        <>
            <button
                onClick={() => setModal(true)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-all"
                title="Edit Role"
            >
                <Edit className="h-4.5 w-4.5" />
            </button>

            <Modal
                isOpen={modal}
                onClose={() => setModal(false)}
                className="max-w-4xl p-0 overflow-hidden bg-transparent shadow-none border-none"
            >
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700/50 shrink-0">
                        <div>
                            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                                Edit Role & Permissions
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Manage access levels and module availability
                            </p>
                        </div>
                        <button
                            onClick={() => setModal(false)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                        <div className="p-6 space-y-8">
                            {/* Role Name Section */}
                            <div className="max-w-md">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                                    Role Name
                                </label>
                                <input
                                    required
                                    name="name"
                                    value={RoleForm.name}
                                    onChange={(e) => setRoleForm({ ...RoleForm, name: e.target.value })}
                                    placeholder="e.g. Senior Manager"
                                    className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-gray-200 font-medium"
                                    disabled={savingRole}
                                />
                            </div>

                            {/* Permissions Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between bg-blue-50/50 dark:bg-blue-900/10 px-4 py-3 rounded-xl border border-blue-100 dark:border-blue-900/20">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/20">
                                            <ShieldCheck className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Module Access</h4>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">
                                                Selected: {RoleForm.permissions.length} / {permissions.length}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={toggleAll}
                                        disabled={permLoading || permissions.length === 0}
                                        className="text-xs font-bold py-2 px-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-all shadow-sm"
                                    >
                                        {permissions.length > 0 && RoleForm.permissions.length === permissions.length
                                            ? "Deselect All"
                                            : "Select All"}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {permLoading ? (
                                        [...Array(6)].map((_, i) => (
                                            <div key={i} className="h-16 rounded-xl border-2 border-dashed border-gray-100 dark:border-gray-800 animate-pulse bg-gray-50/30 dark:bg-gray-900/20" />
                                        ))
                                    ) : permissions.map((perm) => {
                                        const isChecked = RoleForm.permissions.some((p) => p.id === perm.id);
                                        return (
                                            <label
                                                key={perm.id}
                                                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer group hover:-translate-y-0.5 ${isChecked
                                                    ? 'bg-blue-50/30 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30'
                                                    : 'bg-white dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 hover:border-blue-100 dark:hover:border-blue-900/20 shadow-sm'
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isChecked
                                                    ? 'bg-blue-600 border-blue-600'
                                                    : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 group-hover:border-blue-400'
                                                    }`}>
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onChange={(checked) => handlePermissionChange(perm, checked)}
                                                        className="hidden"
                                                    />
                                                    {isChecked && (
                                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <span className={`text-sm font-bold block ${isChecked ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {perm.action.split(':').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(': ')}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 uppercase tracking-tighter font-medium mt-0.5 block">Module Access</span>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-5 bg-gray-50/80 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700/50 shrink-0 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setModal(false)}
                            disabled={savingRole}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={saveRole}
                            disabled={savingRole}
                            className="px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {savingRole ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Updating...
                                </>
                            ) : "Update Role"}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default EditRole;