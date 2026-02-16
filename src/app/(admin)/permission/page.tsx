"use client";

import { useEffect, useState } from "react";
import { iPermission } from "@/types/auth.types";
import { toast } from "sonner";
import AddPermission from "./add-permission";
import { RoleServiceInstance } from "@/services/role.service";
import EditPermission from "./edit-permission";
import DeletePermission from "./delete-permission";
import Loader from "@/components/ui/spinner";

export default function Permissions() {
    const [Permissions, setPermissions] = useState<iPermission[]>([]);
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
        <div className="hover:shadow-md transition-shadow min-w-48">
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground">{permission.action}</h3>

                    <div>
                        <EditPermission onAction={fetchPermissions} Permission={permission} />
                        <DeletePermission onAction={fetchPermissions} Permission={permission} />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="p-2 md:p-4 dark:bg-gray-900">
                <div className="md:flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-300">
                        Permissions
                    </h1>

                    <AddPermission />
                </div>

                {
                    loading ?
                        <div className="flex h-40 gap-4 items-center justify-center">
                            <Loader /> Loading...
                        </div>
                        :
                        Permissions.length <= 0
                            ?
                            <div className="flex h-40 text-muted items-center justify-center">
                                No permission found
                            </div>
                            :
                            <div className="flex flex-wrap gap-4">
                                {
                                    Permissions.map((permission, i) => (
                                        <PermCard
                                            permission={permission}
                                            key={i}
                                        />
                                    ))
                                }
                            </div>
                }
            </div>
        </div>
    );
}
