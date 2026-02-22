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

import { useAuth } from "@/services/permission.service";
import api from "@/services/api";

const EditUser = ({ onAction, user }: { onAction?: () => void; user: iUser }) => {
    const { user: currentUser } = useAuth();
    const isSuperAdmin = currentUser?.role?.name === "SUPER_ADMIN";

    const [UserForm, setUserForm] = useState<iUser>({
        name: "",
        email: "",
        password: "",
        roleId: "",
        restaurantId: "",
    });
    const [roles, setRoles] = useState<iRole[]>([]);
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [modal, setModal] = useState<boolean>(false);
    const [savingUser, setSavingUser] = useState<boolean>(false);
    const [loadingRoles, setLoadingRoles] = useState<boolean>(true);
    const [loadingRestaurants, setLoadingRestaurants] = useState<boolean>(false);
    const [errors, setErrors] = useState<Partial<Record<keyof iUser, any>>>({});

    const authServ = AuthServiceInstance();
    const roleServ = RoleServiceInstance();

    const fetchRoles = async () => {
        try {
            const res = await roleServ.getRoles();
            if (res?.success) {
                setRoles(res?.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch roles", error);
        } finally {
            setLoadingRoles(false);
        }
    };

    const fetchRestaurants = async () => {
        try {
            setLoadingRestaurants(true);
            const res = await api.get("/restaurants");
            if (res.data?.success) {
                setRestaurants(res.data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch restaurants", error);
        } finally {
            setLoadingRestaurants(false);
        }
    };

    async function saveUser(e: any) {
        e.preventDefault();
        setSavingUser(true);
        setErrors({});

        // Custom validation check
        const newErrors: any = {};
        if (!UserForm.name.trim()) newErrors.name = "Name is required";
        if (!UserForm.email.trim()) newErrors.email = "Email is required";
        if (UserForm.password && UserForm.password.length < 6) newErrors.password = "Password must be at least 6 characters";
        if (!UserForm.roleId) newErrors.roleId = "Role is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fix the errors in the form");
            setSavingUser(false);
            return;
        }

        try {
            // Only send password if it was entered
            const payload: any = {
                id: user.id,
                name: UserForm.name,
                email: UserForm.email,
                roleId: UserForm.roleId,
                restaurantId: UserForm.restaurantId
            };
            if (UserForm.password) {
                payload.password = UserForm.password;
            }

            const res = await authServ.updateUser(payload);
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
            if (isSuperAdmin) {
                fetchRestaurants();
            }
            setUserForm({
                ...user,
                password: "",
                roleId: user.roleId || "",
                restaurantId: user.restaurantId || ""
            });
            setErrors({});
        }
    }, [modal, user, isSuperAdmin]);

    return (
        <>
            <button
                onClick={() => setModal(true)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-all"
                title="Edit User"
            >
                <Edit className="h-4.5 w-4.5" />
            </button>

            <Modal
                isOpen={modal}
                onClose={() => setModal(false)}
                className="max-w-xl p-0 overflow-hidden bg-transparent shadow-none border-none"
            >
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700/50">
                        <div>
                            <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                                Edit User Account
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Update profile information and permissions
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
                    <div className="p-6">
                        <form id="edit-user-form" onSubmit={saveUser} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <input
                                            name="name"
                                            value={UserForm.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            className={`w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border ${errors.name ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-gray-200`}
                                            disabled={savingUser}
                                        />
                                        {errors.name && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.name}</p>}
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                                        Email Address
                                    </label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={UserForm.email}
                                        onChange={handleChange}
                                        placeholder="john@example.com"
                                        className={`w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border ${errors.email ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-gray-200`}
                                        disabled={savingUser}
                                    />
                                    {errors.email && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.email}</p>}
                                </div>

                                <div className="md:col-span-2 p-4 bg-blue-50/30 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                                        Password <span className="text-[10px] font-normal text-blue-500 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full uppercase tracking-wider">Leave blank to keep current</span>
                                    </label>
                                    <input
                                        name="password"
                                        type="password"
                                        value={UserForm.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className={`w-full px-4 py-2.5 bg-white dark:bg-gray-900/80 border ${errors.password ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-gray-200`}
                                        disabled={savingUser}
                                    />
                                    {errors.password && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.password}</p>}
                                </div>

                                {isSuperAdmin && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                                            Assigned Restaurant
                                        </label>
                                        <select
                                            value={UserForm.restaurantId}
                                            onChange={(e) => {
                                                setUserForm({ ...UserForm, restaurantId: e.target.value });
                                                if (errors.restaurantId) setErrors({ ...errors, restaurantId: undefined });
                                            }}
                                            className={`w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border ${errors.restaurantId ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-gray-200 appearance-none`}
                                            disabled={savingUser || loadingRestaurants}
                                        >
                                            <option value="">{loadingRestaurants ? "Loading restaurants..." : "Select a restaurant"}</option>
                                            {restaurants.map((res) => (
                                                <option key={res.id} value={res.id}>{res.name}</option>
                                            ))}
                                        </select>
                                        {errors.restaurantId && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.restaurantId}</p>}
                                    </div>
                                )}

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                                        Assigned Role
                                    </label>
                                    <select
                                        value={UserForm.roleId}
                                        onChange={(e) => {
                                            setUserForm({ ...UserForm, roleId: e.target.value });
                                            if (errors.roleId) setErrors({ ...errors, roleId: undefined });
                                        }}
                                        className={`w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border ${errors.roleId ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-gray-200 appearance-none`}
                                        disabled={savingUser || loadingRoles}
                                    >
                                        <option value="">{loadingRoles ? "Loading roles..." : "Select a role"}</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                    {errors.roleId && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.roleId}</p>}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-5 bg-gray-50/80 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setModal(false)}
                            disabled={savingUser}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            form="edit-user-form"
                            type="submit"
                            disabled={savingUser}
                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {savingUser ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Updating...
                                </>
                            ) : "Save Changes"}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default EditUser;