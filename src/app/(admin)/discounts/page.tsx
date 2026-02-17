"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Eye, Edit, Trash2, Plus, X } from "lucide-react";
import { ViewDetailModal } from "@/components/ViewDetailModal";
import { toast } from "sonner";

const getStatusBadge = (isActive: boolean, expiresAt: string) => {
    const base = "px-2 py-1 rounded text-xs font-medium";
    const now = new Date();
    const expiry = new Date(expiresAt);

    if (expiry < now) {
        return `${base} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
    }

    if (isActive) {
        return `${base} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
    }

    return `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
};

const getStatusText = (isActive: boolean, expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);

    if (expiry < now) return "Expired";
    if (isActive) return "Active";
    return "Inactive";
};

interface Discount {
    id: string;
    code: string;
    percentage?: number;
    amount?: number;
    isActive: boolean;
    expiresAt: string;
    createdAt: string;
}

export default function DiscountsPage() {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(true);

    // View Detail Modal
    const [viewDiscount, setViewDiscount] = useState<Discount | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Add Discount Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [addFormData, setAddFormData] = useState({
        code: "",
        discountType: "percentage" as "percentage" | "amount",
        value: "",
        isActive: true,
        expiresAt: "",
    });
    const [adding, setAdding] = useState(false);

    // Edit Discount Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
    const [editFormData, setEditFormData] = useState({
        code: "",
        discountType: "percentage" as "percentage" | "amount",
        value: "",
        isActive: true,
        expiresAt: "",
    });
    const [updating, setUpdating] = useState(false);

    // Delete
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const fetchDiscounts = async () => {
        try {
            setLoading(true);
            const res = await api.get("/marketing/discounts");

            if (res.data?.success) {
                setDiscounts(res.data.data);
            } else {
                toast.error(res.data?.message || "Failed to fetch discounts");
            }
        } catch (err) {
            console.error("Failed to fetch discounts", err);
            toast.error("Failed to fetch discounts");
        } finally {
            setLoading(false);
        }
    };

    const handleAddDiscount = async () => {
        if (!addFormData.code || !addFormData.value || !addFormData.expiresAt) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            setAdding(true);
            const payload: any = {
                code: addFormData.code,
                isActive: addFormData.isActive,
                expiresAt: new Date(addFormData.expiresAt).toISOString(),
            };

            if (addFormData.discountType === "percentage") {
                payload.percentage = parseFloat(addFormData.value);
            } else {
                payload.amount = parseFloat(addFormData.value);
            }

            await api.post("/marketing/discounts", payload);
            toast.success("Discount added successfully!");
            setShowAddModal(false);
            setAddFormData({
                code: "",
                discountType: "percentage",
                value: "",
                isActive: true,
                expiresAt: "",
            });
            fetchDiscounts();
        } catch (err) {
            console.error("Failed to add discount", err);
            toast.error("Failed to add discount");
        } finally {
            setAdding(false);
        }
    };

    const handleEditDiscount = async () => {
        if (!selectedDiscount || !editFormData.code || !editFormData.value || !editFormData.expiresAt) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            setUpdating(true);
            const payload: any = {
                code: editFormData.code,
                isActive: editFormData.isActive,
                expiresAt: new Date(editFormData.expiresAt).toISOString(),
            };

            if (editFormData.discountType === "percentage") {
                payload.percentage = parseFloat(editFormData.value);
            } else {
                payload.amount = parseFloat(editFormData.value);
            }

            await api.put(`/marketing/discounts/${selectedDiscount.id}`, payload);
            toast.success("Discount updated successfully!");
            setShowEditModal(false);
            setSelectedDiscount(null);
            fetchDiscounts();
        } catch (err) {
            console.error("Failed to update discount", err);
            toast.error("Failed to update discount");
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteDiscount = async (discountId: string) => {
        if (!confirm("Are you sure you want to delete this discount?")) return;

        try {
            setDeleting(discountId);
            await api.delete(`/marketing/discounts/${discountId}`);
            toast.success("Discount deleted successfully!");
            fetchDiscounts();
        } catch (err) {
            console.error("Failed to delete discount", err);
            toast.error("Failed to delete discount");
        } finally {
            setDeleting(null);
        }
    };

    const openEditModal = (discount: Discount) => {
        setSelectedDiscount(discount);
        setEditFormData({
            code: discount.code,
            discountType: discount.percentage ? "percentage" : "amount",
            value: discount.percentage ? discount.percentage.toString() : discount.amount?.toString() || "",
            isActive: discount.isActive,
            expiresAt: new Date(discount.expiresAt).toISOString().slice(0, 16),
        });
        setShowEditModal(true);
    };

    return (
        <div className="min-h-screen p-3 md:p-6 dark:bg-gray-900 dark:text-gray-200">
            <div className="flex justify-between items-center mb-5">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                    Discount Codes
                </h1>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    <Plus size={18} />
                    Add Discount
                </button>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left">#</th>
                            <th className="px-4 py-3 text-left">Code</th>
                            <th className="px-4 py-3 text-left">Type</th>
                            <th className="px-4 py-3 text-left">Value</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Expires</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="py-10 text-center">
                                    Loading discounts...
                                </td>
                            </tr>
                        ) : discounts.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-10 text-center">
                                    No discounts found
                                </td>
                            </tr>
                        ) : (
                            discounts.map((discount, index) => (
                                <>
                                    {/* MAIN ROW */}
                                    <tr
                                        key={discount.id}
                                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <td className="px-4 py-3">{index + 1}</td>
                                        <td className="px-4 py-3 font-medium">{discount.code}</td>
                                        <td className="px-4 py-3">
                                            {discount.percentage ? "Percentage" : "Fixed Amount"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {discount.percentage ? `${discount.percentage}%` : `Rs. ${discount.amount}`}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={getStatusBadge(discount.isActive, discount.expiresAt)}>
                                                {getStatusText(discount.isActive, discount.expiresAt)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            {new Date(discount.expiresAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setViewDiscount(discount);
                                                    setIsViewModalOpen(true);
                                                }}
                                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>

                                            <button
                                                onClick={() => openEditModal(discount)}
                                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                title="Edit Discount"
                                            >
                                                <Edit size={18} />
                                            </button>

                                            <button
                                                onClick={() => handleDeleteDiscount(discount.id)}
                                                disabled={deleting === discount.id}
                                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600 dark:text-red-400"
                                                title="Delete Discount"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>


                                </>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ADD DISCOUNT MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
                        <div className="flex justify-between mb-4">
                            <h2 className="font-semibold text-lg">Add New Discount</h2>
                            <button onClick={() => setShowAddModal(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Code</label>
                                <input
                                    type="text"
                                    value={addFormData.code}
                                    onChange={(e) =>
                                        setAddFormData({ ...addFormData, code: e.target.value.toUpperCase() })
                                    }
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="NEWUSER50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Discount Type</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="percentage"
                                            checked={addFormData.discountType === "percentage"}
                                            onChange={(e) =>
                                                setAddFormData({ ...addFormData, discountType: "percentage" })
                                            }
                                            className="mr-2"
                                        />
                                        Percentage
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="amount"
                                            checked={addFormData.discountType === "amount"}
                                            onChange={(e) =>
                                                setAddFormData({ ...addFormData, discountType: "amount" })
                                            }
                                            className="mr-2"
                                        />
                                        Fixed Amount
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    {addFormData.discountType === "percentage" ? "Percentage" : "Amount (Rs.)"}
                                </label>
                                <input
                                    type="number"
                                    value={addFormData.value}
                                    onChange={(e) =>
                                        setAddFormData({ ...addFormData, value: e.target.value })
                                    }
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    placeholder={addFormData.discountType === "percentage" ? "50" : "200"}
                                    min="0"
                                    max={addFormData.discountType === "percentage" ? "100" : undefined}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Expiration Date</label>
                                <input
                                    type="datetime-local"
                                    value={addFormData.expiresAt}
                                    onChange={(e) =>
                                        setAddFormData({ ...addFormData, expiresAt: e.target.value })
                                    }
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>

                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={addFormData.isActive}
                                        onChange={(e) =>
                                            setAddFormData({ ...addFormData, isActive: e.target.checked })
                                        }
                                        className="mr-2"
                                    />
                                    Active
                                </label>
                            </div>

                            <button
                                onClick={handleAddDiscount}
                                disabled={adding}
                                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                {adding ? "Adding..." : "Add Discount"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT DISCOUNT MODAL */}
            {showEditModal && selectedDiscount && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
                        <div className="flex justify-between mb-4">
                            <h2 className="font-semibold text-lg">Edit Discount</h2>
                            <button onClick={() => setShowEditModal(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Code</label>
                                <input
                                    type="text"
                                    value={editFormData.code}
                                    onChange={(e) =>
                                        setEditFormData({ ...editFormData, code: e.target.value.toUpperCase() })
                                    }
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="NEWUSER50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Discount Type</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="percentage"
                                            checked={editFormData.discountType === "percentage"}
                                            onChange={(e) =>
                                                setEditFormData({ ...editFormData, discountType: "percentage" })
                                            }
                                            className="mr-2"
                                        />
                                        Percentage
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="amount"
                                            checked={editFormData.discountType === "amount"}
                                            onChange={(e) =>
                                                setEditFormData({ ...editFormData, discountType: "amount" })
                                            }
                                            className="mr-2"
                                        />
                                        Fixed Amount
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    {editFormData.discountType === "percentage" ? "Percentage" : "Amount (Rs.)"}
                                </label>
                                <input
                                    type="number"
                                    value={editFormData.value}
                                    onChange={(e) =>
                                        setEditFormData({ ...editFormData, value: e.target.value })
                                    }
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    placeholder={editFormData.discountType === "percentage" ? "50" : "200"}
                                    min="0"
                                    max={editFormData.discountType === "percentage" ? "100" : undefined}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Expiration Date</label>
                                <input
                                    type="datetime-local"
                                    value={editFormData.expiresAt}
                                    onChange={(e) =>
                                        setEditFormData({ ...editFormData, expiresAt: e.target.value })
                                    }
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>

                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={editFormData.isActive}
                                        onChange={(e) =>
                                            setEditFormData({ ...editFormData, isActive: e.target.checked })
                                        }
                                        className="mr-2"
                                    />
                                    Active
                                </label>
                            </div>

                            <button
                                onClick={handleEditDiscount}
                                disabled={updating}
                                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {updating ? "Updating..." : "Update Discount"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW DETAIL MODAL */}
            <ViewDetailModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Discount Details"
                data={viewDiscount}
                fields={[
                    { label: "Code", key: "code" },
                    { label: "Type", render: (data: any) => data?.percentage ? "Percentage" : "Fixed Amount" },
                    { label: "Value", render: (data: any) => data?.percentage ? `${data.percentage}%` : `Rs. ${data.amount}` },
                    { label: "Status", render: (data: any) => <span className={getStatusBadge(data?.isActive, data?.expiresAt)}>{getStatusText(data?.isActive, data?.expiresAt)}</span> },
                    { label: "Created", render: (data: any) => new Date(data?.createdAt).toLocaleDateString() },
                    { label: "Expires", render: (data: any) => new Date(data?.expiresAt).toLocaleDateString() },
                    { label: "ID", key: "id" },
                ]}
            />
        </div>
    );
}
