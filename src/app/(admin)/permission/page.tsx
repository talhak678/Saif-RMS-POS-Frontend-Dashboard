"use client";

import { useEffect, useState } from "react";
import { iPermission } from "@/types/auth.types";
import { toast } from "sonner";
import { RoleServiceInstance } from "@/services/role.service";
import Loader from "@/components/ui/spinner";
import { ShieldCheck } from "lucide-react";
import AddPermission from "./add-permission";


export default function Permissions() {
    const [permissions, setPermissions] = useState<iPermission[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const permServ = RoleServiceInstance()

    const fetchPermissions = async () => {
        try {
            const res = await permServ.getPermissions();
            if (res?.success) {
                setPermissions(res?.data || []);
            }
            else {
                toast.error(res?.message || 'Failed to fetch Permissions')
            }
        } catch (error) {
            console.error("Failed to fetch Permissions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    const PermCard: React.FC<{ permission: iPermission }> = ({ permission }) => (
        <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:shadow-xl dark:border-gray-800/30 dark:bg-gray-900/40 dark:hover:bg-gray-900/60">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500 transition-transform duration-300 group-hover:scale-110">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 uppercase tracking-tight">
                        {permission.action.replace(/-/g, ' ')}
                    </h3>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Permission Key: <span className="font-mono text-brand-600 dark:text-brand-400">{permission.action}</span>
                    </p>
                </div>
            </div>

            {/* Decorative background element */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-brand-500/5 blur-2xl transition-all duration-500 group-hover:bg-brand-500/10"></div>
        </div>
    );

    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Header Section */}
            <div className="mb-10 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        System Permissions
                    </h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        Overview of all available access control points in the system.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-brand-500/10 px-4 py-2 text-sm font-semibold text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                        {permissions.length} Total Permissions
                    </div>
                    <AddPermission onAction={fetchPermissions} />
                </div>
            </div>

            {
                loading ?
                    <div className="flex h-[400px] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/20">
                        <Loader />
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading permission architecture...</span>
                    </div>
                    :
                    permissions.length <= 0
                        ?
                        <div className="flex h-[400px] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20">
                            <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                                <ShieldCheck size={48} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">No Permissions Found</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">It looks like there are no permissions configured in the system.</p>
                        </div>
                        :
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {
                                permissions.map((permission, i) => (
                                    <PermCard
                                        permission={permission}
                                        key={permission.id || i}
                                    />
                                ))
                            }
                        </div>
            }
        </div>
    );
}

