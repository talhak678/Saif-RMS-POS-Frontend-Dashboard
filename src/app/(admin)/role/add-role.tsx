"use client";
import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { iPermission, iRole } from "@/types/auth.types";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import { RoleServiceInstance } from "@/services/role.service";
import { Button } from "@/components/ui/button/Button";
import Loader from "@/components/common/Loader";
import Checkbox from "@/components/form/input/Checkbox";
import Label from "@/components/form/Label";

const AddRole = ({ onAction }: { onAction?: () => void }) => {
    const [RoleForm, setRoleForm] = useState<iRole>({
        name: "",
        permissions: [],
    });
    const [permissions, setPermissions] = useState<iPermission[]>([]);
    const [permLoading, setPermLoading] = useState<boolean>(true);
    const [modal, setModal] = useState<boolean>(false);
    const [savingRole, setSavingRole] = useState<boolean>(false);
    const permServ = RoleServiceInstance();

    const fetchPermissions = async () => {
        try {
            const res = await permServ.getPermissions();
            if (res?.success) {
                setPermissions(res?.data || []);
            } else {
                toast.error(res?.message || "Failed to fetch permissions");
            }
        } catch (error) {
            console.error("Failed to fetch permissions", error);
        } finally {
            setPermLoading(false);
        }
    };

    async function saveRole(e: any) {
        e.preventDefault();
        if (!RoleForm.name) {
            toast.error("Role name is required");
            return;
        }
        setSavingRole(true);
        try {
            const payload = {
                name: RoleForm.name,
                permissionIds: RoleForm.permissions.map((p) => p.id),
            };
            const res = await permServ.addRole(payload as any);
            if (res.success) {
                toast.success("Role added successfully!");
                onAction?.();
                clearState();
            } else {
                toast.error(res?.message || "Failed to add Role");
            }
        } catch (err) {
            toast.error("Failed to add Role");
        } finally {
            setSavingRole(false);
        }
    }

    function clearState() {
        setRoleForm({ name: "", permissions: [] });
        setSavingRole(false);
        setModal(false);
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
        }
    }, [modal]);

    return (
        <>
            <Button onClick={() => setModal(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Add Role
            </Button>

            <Modal
                isOpen={modal}
                onClose={() => setModal(false)}
                className="max-w-4xl p-0 overflow-hidden"
            >
                <div className="flex flex-col h-[85vh] bg-white dark:bg-gray-800">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b px-6 py-4 dark:border-gray-700 shrink-0">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Add New Role
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Define the role name and assign permissions.
                            </p>
                        </div>
                        <button
                            onClick={() => setModal(false)}
                            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                        <div className="p-6 overflow-y-auto">
                            <form id="add-role-form" onSubmit={saveRole} className="space-y-6">
                                <div>
                                    <Input
                                        required
                                        name="name"
                                        value={RoleForm.name}
                                        onChange={(e) =>
                                            setRoleForm({ ...RoleForm, [e.target.name]: e.target.value })
                                        }
                                        placeholder="Enter role name (e.g. Sales Manager)"
                                        label="Role Name"
                                        disabled={savingRole}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="mb-0">Assign Permissions</Label>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={toggleAll}
                                            disabled={permLoading || permissions.length === 0}
                                            className="text-xs h-8"
                                        >
                                            {permissions.length > 0 && RoleForm.permissions.length === permissions.length
                                                ? "Deselect All"
                                                : "Select All"}
                                        </Button>
                                    </div>

                                    <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-900/50 dark:border-gray-700">
                                        {permLoading ? (
                                            <div className="flex items-center justify-center p-8 text-gray-500">
                                                <Loader size="sm" />
                                            </div>
                                        ) : permissions.length === 0 ? (
                                            <div className="flex items-center justify-center p-8 text-gray-500">
                                                No permissions found.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                {permissions.map((perm) => (
                                                    <div
                                                        key={perm.id}
                                                        className="flex items-start space-x-3 rounded-md border bg-white p-3 shadow-sm transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700/50"
                                                    >
                                                        <Checkbox
                                                            checked={RoleForm.permissions.some(
                                                                (p) => p.id === perm.id
                                                            )}
                                                            onChange={(checked) => handlePermissionChange(perm, checked)}
                                                            className="mt-0.5"
                                                        />
                                                        <div className="text-sm">
                                                            <span className="font-medium text-gray-900 dark:text-white block">
                                                                {perm.action}
                                                            </span>

                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Selected: {RoleForm.permissions.length} / {permissions.length} permissions
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 border-t bg-gray-50 px-6 py-4 dark:bg-gray-900/50 dark:border-gray-700 shrink-0">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={savingRole}
                            onClick={clearState}
                        >
                            Cancel
                        </Button>
                        <Button
                            form="add-role-form"
                            type="submit"
                            disabled={savingRole}
                            loading={savingRole}
                        >
                            Create Role
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default AddRole;