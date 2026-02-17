"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Eye, Edit, Trash2, Plus, X } from "lucide-react";
import { ViewDetailModal } from "@/components/ViewDetailModal";
import { toast } from "sonner";

const RIDER_STATUSES = ["AVAILABLE", "BUSY", "OFFLINE"];

const getStatusBadge = (status: string) => {
    const base = "px-2 py-1 rounded text-xs font-medium";
    switch (status) {
        case "AVAILABLE":
            return `${base} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
        case "BUSY":
            return `${base} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`;
        case "OFFLINE":
            return `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
        default:
            return base;
    }
};

interface Rider {
    id: string;
    name: string;
    phone: string;
    status: "AVAILABLE" | "BUSY" | "OFFLINE";
    createdAt: string;
    restaurantId: string;
}

export default function RidersPage() {
    const [riders, setRiders] = useState<Rider[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");

    // View Detail Modal
    const [viewRider, setViewRider] = useState<Rider | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Add Rider Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [addFormData, setAddFormData] = useState({
        name: "",
        phone: "",
        status: "AVAILABLE",
    });
    const [adding, setAdding] = useState(false);

    // Edit Rider Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
    const [editFormData, setEditFormData] = useState({
        name: "",
        phone: "",
        status: "AVAILABLE",
    });
    const [updating, setUpdating] = useState(false);

    // Delete
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchRiders();
    }, [statusFilter]);

    const fetchRiders = async () => {
        try {
            setLoading(true);
            const query = statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
            const res = await api.get(`/riders${query}`);

            if (res.data?.success) {
                setRiders(res.data.data);
            } else {
                toast.error(res.data?.message || "Failed to fetch riders");
            }
        } catch (err) {
            console.error("Failed to fetch riders", err);
            toast.error("Failed to fetch riders");
        } finally {
            setLoading(false);
        }
    };

    const handleAddRider = async () => {
        if (!addFormData.name || !addFormData.phone) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            setAdding(true);
            await api.post("/riders", addFormData);
            toast.success("Rider added successfully!");
            setShowAddModal(false);
            setAddFormData({ name: "", phone: "", status: "AVAILABLE" });
            fetchRiders();
        } catch (err) {
            console.error("Failed to add rider", err);
            toast.error("Failed to add rider");
        } finally {
            setAdding(false);
        }
    };

    const handleEditRider = async () => {
        if (!selectedRider || !editFormData.name || !editFormData.phone) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            setUpdating(true);
            await api.put(`/riders/${selectedRider.id}`, {
                ...editFormData,
                restaurantId: selectedRider.restaurantId, // Use existing restaurantId
            });
            toast.success("Rider updated successfully!");
            setShowEditModal(false);
            setSelectedRider(null);
            fetchRiders();
        } catch (err) {
            console.error("Failed to update rider", err);
            toast.error("Failed to update rider");
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteRider = async (riderId: string) => {
        if (!confirm("Are you sure you want to delete this rider?")) return;

        try {
            setDeleting(riderId);
            await api.delete(`/riders/${riderId}`);
            toast.success("Rider deleted successfully!");
            fetchRiders();
        } catch (err) {
            console.error("Failed to delete rider", err);
            toast.error("Failed to delete rider");
        } finally {
            setDeleting(null);
        }
    };

    const openEditModal = (rider: Rider) => {
        setSelectedRider(rider);
        setEditFormData({
            name: rider.name,
            phone: rider.phone,
            status: rider.status,
        });
        setShowEditModal(true);
    };

    return (
        <div className="min-h-screen p-3 md:p-6 dark:bg-gray-900 dark:text-gray-200">
            <div className="flex justify-between items-center mb-5">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                    Riders
                </h1>

                <div className="flex gap-3">
                    {/* STATUS FILTER */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="p-2 rounded border dark:bg-gray-800 dark:border-gray-700"
                    >
                        <option value="ALL">All Riders</option>
                        {RIDER_STATUSES.map((st) => (
                            <option key={st} value={st}>
                                {st}
                            </option>
                        ))}
                    </select>

                    {/* ADD RIDER BUTTON */}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        Add Rider
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left">#</th>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Phone</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-10 text-center">
                                    Loading riders...
                                </td>
                            </tr>
                        ) : riders.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-10 text-center">
                                    No riders found
                                </td>
                            </tr>
                        ) : (
                            riders.map((rider, index) => (
                                <tr
                                    key={rider.id}
                                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <td className="px-4 py-3">{index + 1}</td>
                                    <td className="px-4 py-3 font-medium">{rider.name}</td>
                                    <td className="px-4 py-3">{rider.phone}</td>
                                    <td className="px-4 py-3">
                                        <span className={getStatusBadge(rider.status)}>
                                            {rider.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 flex gap-2">
                                        <button
                                            onClick={() => {
                                                setViewRider(rider);
                                                setIsViewModalOpen(true);
                                            }}
                                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </button>

                                        <button
                                            onClick={() => openEditModal(rider)}
                                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                            title="Edit Rider"
                                        >
                                            <Edit size={18} />
                                        </button>

                                        <button
                                            onClick={() => handleDeleteRider(rider.id)}
                                            disabled={deleting === rider.id}
                                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600 dark:text-red-400"
                                            title="Delete Rider"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ADD RIDER MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
                        <div className="flex justify-between mb-4">
                            <h2 className="font-semibold text-lg">Add New Rider</h2>
                            <button onClick={() => setShowAddModal(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    value={addFormData.name}
                                    onChange={(e) =>
                                        setAddFormData({ ...addFormData, name: e.target.value })
                                    }
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="Enter rider name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={addFormData.phone}
                                    onChange={(e) =>
                                        setAddFormData({ ...addFormData, phone: e.target.value })
                                    }
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="+92 300 1234567"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Status
                                </label>
                                <select
                                    value={addFormData.status}
                                    onChange={(e) =>
                                        setAddFormData({ ...addFormData, status: e.target.value })
                                    }
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                >
                                    {RIDER_STATUSES.map((st) => (
                                        <option key={st} value={st}>
                                            {st}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleAddRider}
                                disabled={adding}
                                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                {adding ? "Adding..." : "Add Rider"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT RIDER MODAL */}
            {showEditModal && selectedRider && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
                        <div className="flex justify-between mb-4">
                            <h2 className="font-semibold text-lg">Edit Rider</h2>
                            <button onClick={() => setShowEditModal(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editFormData.name}
                                    onChange={(e) =>
                                        setEditFormData({ ...editFormData, name: e.target.value })
                                    }
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="Enter rider name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={editFormData.phone}
                                    onChange={(e) =>
                                        setEditFormData({ ...editFormData, phone: e.target.value })
                                    }
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="+92 300 1234567"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Status
                                </label>
                                <select
                                    value={editFormData.status}
                                    onChange={(e) =>
                                        setEditFormData({ ...editFormData, status: e.target.value })
                                    }
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                >
                                    {RIDER_STATUSES.map((st) => (
                                        <option key={st} value={st}>
                                            {st}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleEditRider}
                                disabled={updating}
                                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {updating ? "Updating..." : "Update Rider"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW DETAIL MODAL */}
            <ViewDetailModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Rider Details"
                data={viewRider}
                fields={[
                    { label: "Name", key: "name" },
                    { label: "Phone", key: "phone" },
                    { label: "Status", render: (data: any) => <span className={getStatusBadge(data?.status)}>{data?.status}</span> },
                    { label: "Joined", render: (data: any) => new Date(data?.createdAt).toLocaleDateString() },
                    { label: "ID", key: "id" },
                ]}
            />
        </div>
    );
}
