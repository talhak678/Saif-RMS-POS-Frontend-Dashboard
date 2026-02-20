"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Eye, Edit, Trash2, Plus, X } from "lucide-react";
import { ViewDetailModal } from "@/components/ViewDetailModal";
import { toast } from "sonner";
import { ProtectedRoute } from "@/services/protected-route";

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
        <ProtectedRoute module="delivery">
            <div className="min-h-screen p-4 md:p-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl dark:text-gray-200">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Riders Management</h1>
                        <p className="text-sm text-gray-500 mt-1">{riders.length} riders found</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
                    >
                        <Plus size={18} />
                        Add Rider
                    </button>
                </div>

                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/60 uppercase text-gray-500 dark:text-gray-400 font-bold text-[10px] tracking-widest">
                            <tr>
                                <th className="px-6 py-4 text-left">#</th>
                                <th className="px-6 py-4 text-left">Rider Info</th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-left">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400 font-medium">Loading riders...</td>
                                </tr>
                            ) : riders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400 font-medium whitespace-pre-wrap">No riders found.{"\n"}Click "Add Rider" to create one.</td>
                                </tr>
                            ) : (
                                riders.map((rider, index) => (
                                    <tr key={rider.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors group">
                                        <td className="px-6 py-4 text-gray-400 font-medium">{index + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800 dark:text-gray-200">{rider.name}</div>
                                            <div className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors">{rider.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={getStatusBadge(rider.status)}>{rider.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {new Date(rider.createdAt).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setViewRider(rider); setIsViewModalOpen(true); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-gray-500 transition-colors" title="View"><Eye size={16} /></button>
                                                <button onClick={() => openEditModal(rider)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg text-blue-600 transition-colors" title="Edit"><Edit size={16} /></button>
                                                <button onClick={() => handleDeleteRider(rider.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg text-red-600 transition-colors" title="Delete"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ADD RIDER MODAL */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border dark:border-gray-700">
                            <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                                <h2 className="font-bold text-lg">Add New Rider</h2>
                                <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X size={18} /></button>
                            </div>
                            <div className="p-5 space-y-4">
                                <div><label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">Name</label><input type="text" value={addFormData.name} onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })} className="w-full px-3 py-2.5 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Enter rider name" /></div>
                                <div><label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">Phone</label><input type="text" value={addFormData.phone} onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })} className="w-full px-3 py-2.5 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="+92 300 1234567" /></div>
                                <div><label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">Status</label><select value={addFormData.status} onChange={(e) => setAddFormData({ ...addFormData, status: e.target.value })} className="w-full px-3 py-2.5 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all">{RIDER_STATUSES.map((st) => (<option key={st} value={st}>{st}</option>))}</select></div>
                                <button onClick={handleAddRider} disabled={adding} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 mt-2">{adding ? "Adding..." : "Add Rider"}</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* EDIT RIDER MODAL */}
                {showEditModal && selectedRider && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border dark:border-gray-700">
                            <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                                <h2 className="font-bold text-lg">Edit Rider</h2>
                                <button onClick={() => setShowEditModal(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X size={18} /></button>
                            </div>
                            <div className="p-5 space-y-4">
                                <div><label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">Name</label><input type="text" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full px-3 py-2.5 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" /></div>
                                <div><label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">Phone</label><input type="text" value={editFormData.phone} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} className="w-full px-3 py-2.5 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" /></div>
                                <div><label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">Status</label><select value={editFormData.status} onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })} className="w-full px-3 py-2.5 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all">{RIDER_STATUSES.map((st) => (<option key={st} value={st}>{st}</option>))}</select></div>
                                <button onClick={handleEditRider} disabled={updating} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 mt-2">{updating ? "Updating..." : "Update Rider"}</button>
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
        </ProtectedRoute>
    );
}
