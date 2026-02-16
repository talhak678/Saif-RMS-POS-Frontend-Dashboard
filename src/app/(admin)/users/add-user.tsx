"use client";
import React, { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
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

const AddUser = ({ onAction }: { onAction?: () => void }) => {
    const [UserForm, setUserForm] = useState<iUser>({
        name: "",
        email: "",
        password: "",
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

        const validation = baseServ.zodValidate(UserSchema, UserForm);
        if (!validation.success) {
            setErrors(validation.data || {});
            toast.error("Please check the form for errors");
            setSavingUser(false);
            return;
        }

        try {
            const res = await authServ.addUser(UserForm);
            if (res.success) {
                toast.success("User added successfully!");
                onAction?.();
                clearState();
            } else {
                toast.error(res?.message || "Failed to add user");
            }
        } catch (err) {
            toast.error("Failed to add user");
        } finally {
            setSavingUser(false);
        }
    }

    function clearState() {
        setErrors({});
        setUserForm({
            name: "",
            email: "",
            password: "",
            roleId: "",
            restaurantId: "",
        });
        setSavingUser(false);
        setModal(false);
    }

    useEffect(() => {
        if (modal) {
            fetchRoles();
        }
    }, [modal]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserForm({ ...UserForm, [e.target.name]: e.target.value });
        if (errors[e.target.name as keyof iUser]) {
            setErrors({ ...errors, [e.target.name]: undefined });
        }
    };

    return (
        <>
            <Button onClick={() => setModal(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Add User
            </Button>

            <Modal
                isOpen={modal}
                onClose={() => setModal(false)}
                className="max-w-xl p-0 overflow-hidden" // Remove default padding for custom header/footer
            >
                <div className="flex flex-col h-full bg-white dark:bg-gray-800">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b px-6 py-4 dark:border-gray-700">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Add New User
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Create a new user account details.
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
                        <form id="add-user-form" onSubmit={saveUser} className="space-y-5">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="col-span-2">
                                    <Input
                                        label="Full Name"
                                        name="name" // Schema uses 'name', input was 'fullName' in old code but schema likely 'name'
                                        value={UserForm.name}
                                        onChange={handleChange}
                                        placeholder="Enter full name"
                                        required
                                        disabled={savingUser}
                                        error={errors.name} // Assuming helper handles string error
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

                                <div>
                                    <Input
                                        label="Password"
                                        name="password"
                                        type="password"
                                        value={UserForm.password}
                                        onChange={handleChange}
                                        placeholder="Enter password"
                                        required
                                        disabled={savingUser}
                                    />
                                    {errors.password && <span className="text-xs text-red-500 mt-1">{errors.password}</span>}
                                </div>

                                <div className="flex flex-col">
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
                                        defaultValue={UserForm.roleId}
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
                            onClick={clearState}
                        >
                            Cancel
                        </Button>
                        <Button
                            form="add-user-form" // Link to form via ID
                            type="submit"
                            disabled={savingUser}
                            loading={savingUser}
                        >
                            Create User
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default AddUser;