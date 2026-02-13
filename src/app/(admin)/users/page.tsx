"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { iUser } from "@/types/auth.types";
import { AuthServiceInstance } from "@/services/auth.service";
import { toast } from "sonner";
import Button from "@/components/ui/button/Button";

export default function Users() {
    const [users, setUsers] = useState<iUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const authServ = AuthServiceInstance()

    const fetchUsers = async () => {
        try {
            const res = await authServ.getUsers();
            if (res?.success) {
                setUsers(res?.data || []);
            }
            else {
                toast.error(res?.message || 'Failed to fetch users')
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        fetchUsers();
    }, []);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="p-2 md:p-4 dark:bg-gray-900">
                <div className="md:flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-300">
                        Users
                    </h1>

                    
                </div>

                {/* Table */}
                <Table className="w-full text-sm">
                    <TableHeader>
                        <TableRow className="whitespace-nowrap">
                            <TableCell className="px-4 py-3 text-left">#</TableCell>
                            <TableCell className="px-4 py-3 text-left">Name</TableCell>
                            <TableCell className="px-4 py-3 text-left">Email</TableCell>
                            <TableCell className="px-4 py-3 text-left">Restaurant</TableCell>
                            <TableCell className="px-4 py-3 text-left">Role</TableCell>
                            <TableCell className="px-4 py-3 text-left">Actions</TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="whitespace-nowrap">
                        {loading ? (
                            <TableRow>
                                <TableCell className="py-10 text-center text-gray-500">
                                    Loading users...
                                </TableCell>
                            </TableRow>
                        ) : users.length > 0 ? (
                            users.map((user: iUser, index: number) => (
                                <TableRow
                                    key={user.id}
                                >
                                    <TableCell className="px-4 py-3">{index + 1}</TableCell>
                                    <TableCell className="px-4 py-3">{(user.name)}</TableCell>
                                    <TableCell className="px-4 py-3">{user.email}</TableCell>
                                    <TableCell className="px-4 py-3">{user?.restaurant?.name||'---'}</TableCell>
                                    <TableCell className="px-4 py-3">
                                        {user?.role?.name||'---'}
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                                        >
                                            <Eye size={18} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    // colSpan={6}
                                    className="py-10 text-center text-gray-500"
                                >
                                    No users found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
