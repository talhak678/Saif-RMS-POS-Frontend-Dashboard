"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { iRole } from "@/types/auth.types";
import { toast } from "sonner";
import { RoleServiceInstance } from "@/services/role.service";
import AddRole from "./add-role";
import EditRole from "./edit-role";
import DeleteRole from "./delete-role";

export default function Roles() {
    const [Roles, setRoles] = useState<iRole[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const roleServ = RoleServiceInstance()

    const fetchRoles = async () => {
        try {
            const res = await roleServ.getRoles();
            if (res?.success) {
                setRoles(res?.data || []);
            }
            else {
                toast.error(res?.message || 'Failed to fetch Roles')
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
            <div className="p-2 md:p-4 dark:bg-gray-900">
                <div className="md:flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-300">
                        Roles
                    </h1>

                    <AddRole onAction={fetchRoles} />
                </div>

                {/* Table */}
                <Table className="w-full text-sm">
                    <TableHeader>
                        <TableRow className="whitespace-nowrap">
                            <TableCell className="px-4 py-3 text-left">#</TableCell>
                            <TableCell className="px-4 py-3 text-left">Name</TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="whitespace-nowrap">
                        {loading ? (
                            <TableRow>
                                <TableCell className="py-10 text-center text-gray-500">
                                    Loading Roles...
                                </TableCell>
                            </TableRow>
                        ) : Roles.length > 0 ? (
                            Roles.map((Role: iRole, index: number) => (
                                <TableRow
                                    key={Role.id}
                                >
                                    <TableCell className="px-4 py-3">{index + 1}</TableCell>
                                    <TableCell className="px-4 py-3">{(Role.name)}</TableCell>
                                    <TableCell className="px-4 py-3">
                                        <EditRole onAction={fetchRoles} Role={Role} />
                                        <DeleteRole onAction={fetchRoles} Role={Role} />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    // colSpan={6}
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
    );
}
