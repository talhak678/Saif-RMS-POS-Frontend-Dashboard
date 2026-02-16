"use client";
import React, { useEffect, useState } from "react";
import { Edit, X } from "lucide-react";
import { BaseServiceInstance } from "@/services/base.service";
import { AuthServiceInstance } from "@/services/auth.service";
import { iRole, iUser, UserSchema } from "@/types/auth.types";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Label from "@/components/form/Label";
import { RoleServiceInstance } from "@/services/role.service";
import { Button } from "@/components/ui/button/Button";

const EditUser = ({ onAction, user }: { onAction?: () => void; user: iUser }) => {
    const [UserForm, setUserForm] = useState<iUser>({
        name: "",
        email: "",
        password: "", // Optional, usually empty for edit unless changing
        roleId: "",
        restaurantId: "",
    });
    const [roles, setRoles] = useState<iRole[]>([]);
    const [modal, setModal] = useState<boolean>(false);
    const [savingUser, setSavingUser] = useState<boolean>(false);
    const [loadingRoles, setLoadingRoles] = useState<boolean>(true);
    const [errors, setErrors] = useState<Partial<Record<keyof iUser, any>>>({});

    const baseServ = BaseServiceInstance();
    const authServ = AuthServiceInstance();
    const roleServ = RoleServiceInstance();

    const fetchRoles = async () => {
        try {
            const res = await roleServ.getRoles();
            if (res?.success) {
                setRoles(res?.data || []);
            } else {
                toast.error(res?.message || "Failed to fetch roles");
            }
        } catch (error) {
            console.error("Failed to fetch roles", error);
        } finally {
            setLoadingRoles(false);
        }
    };

    async function saveUser(e: any) {
        e.preventDefault();
        setSavingUser(true);
        setErrors({});

        // For Edit, partial validation might be needed if password is skipped,
        // but Zod schema has password optional.
        const validation = baseServ.zodValidate(UserSchema, UserForm);
        if (!validation.success) {
            setErrors(validation.data || {});
            toast.error("Please check the form for errors");
            setSavingUser(false);
            return;
        }

        try {
            const res = await authServ.updateUser(UserForm);
            if (res.success) {
                toast.success("User updated successfully!");
                onAction?.();
                setModal(false);
            } else {
                toast.error(res?.message || "Failed to update user");
            }
        } catch (err) {
            toast.error("Failed to update user");
        } finally {
            setSavingUser(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserForm({ ...UserForm, [e.target.name]: e.target.value });
        if (errors[e.target.name as keyof iUser]) {
            setErrors({ ...errors, [e.target.name]: undefined });
        }
    };

    useEffect(() => {
        if (modal) {
            fetchRoles();
            // Populate form with user data, ensure password is empty or handled
            setUserForm({
                ...user,
                password: "", // Reset password field for security/edit flow
                roleId: user.roleId || "", // Ensure roleId is string
                restaurantId: user.restaurantId || ""
            });
            setErrors({});
        }
    }, [modal, user]);

    return (
        <>
            <Button variant="ghost" size="icon" onClick={() => setModal(true)}>
                <Edit className="h-4 w-4" />
            </Button>

            <Modal
                isOpen={modal}
                onClose={() => setModal(false)}
                className="max-w-xl p-0 overflow-hidden"
            >
                <div className="flex flex-col h-full bg-white dark:bg-gray-800">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b px-6 py-4 dark:border-gray-700">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Edit User
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Update user account details.
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
                    <div className="p-6">
                        <form id="edit-user-form" onSubmit={saveUser} className="space-y-5">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="col-span-2">
                                    <Input
                                        label="Full Name"
                                        name="name"
                                        value={UserForm.name}
                                        onChange={handleChange}
                                        placeholder="Enter full name"
                                        required
                                        disabled={savingUser}
                                        error={errors.name}
                                    />
                                    {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name}</span>}
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <Input
                                        label="Email Address"
                                        name="email"
                                        type="email"
                                        value={UserForm.email}
                                        onChange={handleChange}
                                        placeholder="Enter email address"
                                        required
                                        disabled={savingUser}
                                    />
                                    {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email}</span>}
                                </div>

                                {/* Password field - Optional for edit */}
                                <div className="col-span-1 md:col-span-2">
                                    <Input
                                        label="Password (Optional)"
                                        name="password"
                                        type="password"
                                        value={UserForm.password}
                                        onChange={handleChange}
                                        placeholder="Leave blank to keep current password"
                                        disabled={savingUser}
                                    />
                                    {errors.password && <span className="text-xs text-red-500 mt-1">{errors.password}</span>}
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <Label>Role</Label>
                                    <Select
                                        options={roles.map((role) => ({
                                            label: role.name,
                                            value: role.id!,
                                        }))}
                                        placeholder={loadingRoles ? "Loading roles..." : "Select role"}
                                        onChange={(val) => {
                                            setUserForm({ ...UserForm, roleId: val })
                                            if (errors.roleId) setErrors({ ...errors, roleId: undefined })
                                        }}
                                        defaultValue={UserForm.roleId} // Use defaultValue or Value? Select component uses Value||defaultValue
                                        Value={UserForm.roleId || ""} // Explicitly pass value to control it
                                        required
                                        disabled={savingUser || loadingRoles}
                                        className="w-full"
                                    />
                                    {errors.roleId && <span className="text-xs text-red-500 mt-1">{errors.roleId}</span>}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 border-t bg-gray-50 px-6 py-4 dark:bg-gray-900/50 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={savingUser}
                            onClick={() => setModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            form="edit-user-form"
                            type="submit"
                            disabled={savingUser}
                            loading={savingUser}
                        >
                            Update User
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default EditUser;