"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/services/api";
import { Eye, Edit, Trash2, Plus, X, Star } from "lucide-react";
import { ViewDetailModal } from "@/components/ViewDetailModal";
import { toast } from "sonner";
import { ProtectedRoute } from "@/services/protected-route";

const StarRating = ({ rating, interactive = false, onChange }: { rating: number; interactive?: boolean; onChange?: (rating: number) => void }) => {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={18}
                    className={`${star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                        } ${interactive ? "cursor-pointer hover:fill-yellow-300" : ""}`}
                    onClick={() => interactive && onChange && onChange(star)}
                />
            ))}
        </div>
    );
};

interface Review {
    id: string;
    rating: number;
    comment: string;
    aiEnhanced: boolean;
    orderId: string;
    order: {
        orderNo: number;
        customer: { name: string };
    };
    menuItemId?: string;
    menuItem?: { name: string };
    createdAt: string;
}

export default function ReviewsPage() {
    const searchParams = useSearchParams();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    // View Detail Modal
    const [viewReview, setViewReview] = useState<Review | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Add Review Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [addFormData, setAddFormData] = useState({
        rating: 5,
        comment: "",
        orderId: "",
        menuItemId: "",
    });
    const [adding, setAdding] = useState(false);

    // Edit Review Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [editFormData, setEditFormData] = useState({
        rating: 5,
        comment: "",
        orderId: "",
        menuItemId: "",
    });
    const [updating, setUpdating] = useState(false);

    // Delete
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchReviews();

        // Check for URL params and auto-open add modal
        const orderId = searchParams.get("orderId");
        const menuItemId = searchParams.get("menuItemId");

        if (orderId) {
            setAddFormData({
                rating: 5,
                comment: "",
                orderId: orderId,
                menuItemId: menuItemId || "",
            });
            setShowAddModal(true);
        }
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await api.get("/marketing/reviews");

            if (res.data?.success) {
                setReviews(res.data.data);
            } else {
                toast.error(res.data?.message || "Failed to fetch reviews");
            }
        } catch (err) {
            console.error("Failed to fetch reviews", err);
            toast.error("Failed to fetch reviews");
        } finally {
            setLoading(false);
        }
    };

    const handleAddReview = async () => {
        if (!addFormData.orderId || addFormData.rating < 1 || addFormData.rating > 5) {
            toast.error("Please fill all required fields with valid data");
            return;
        }

        try {
            setAdding(true);
            const payload: any = {
                rating: addFormData.rating,
                comment: addFormData.comment,
                orderId: addFormData.orderId,
            };

            if (addFormData.menuItemId) {
                payload.menuItemId = addFormData.menuItemId;
            }

            await api.post("/marketing/reviews", payload);
            toast.success("Review added successfully!");
            setShowAddModal(false);
            setAddFormData({
                rating: 5,
                comment: "",
                orderId: "",
                menuItemId: "",
            });
            fetchReviews();
        } catch (err) {
            console.error("Failed to add review", err);
            toast.error("Failed to add review");
        } finally {
            setAdding(false);
        }
    };

    const handleEditReview = async () => {
        if (!selectedReview || !editFormData.orderId || editFormData.rating < 1 || editFormData.rating > 5) {
            toast.error("Please fill all required fields with valid data");
            return;
        }

        try {
            setUpdating(true);
            const payload: any = {
                rating: editFormData.rating,
                comment: editFormData.comment,
                orderId: editFormData.orderId,
            };

            if (editFormData.menuItemId) {
                payload.menuItemId = editFormData.menuItemId;
            }

            await api.put(`/marketing/reviews/${selectedReview.id}`, payload);
            toast.success("Review updated successfully!");
            setShowEditModal(false);
            setSelectedReview(null);
            fetchReviews();
        } catch (err) {
            console.error("Failed to update review", err);
            toast.error("Failed to update review");
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        try {
            setDeleting(reviewId);
            await api.delete(`/marketing/reviews/${reviewId}`);
            toast.success("Review deleted successfully!");
            fetchReviews();
        } catch (err) {
            console.error("Failed to delete review", err);
            toast.error("Failed to delete review");
        } finally {
            setDeleting(null);
        }
    };

    const openEditModal = (review: Review) => {
        setSelectedReview(review);
        setEditFormData({
            rating: review.rating,
            comment: review.comment,
            orderId: review.orderId,
            menuItemId: review.menuItemId || "",
        });
        setShowEditModal(true);
    };

    return (
        <ProtectedRoute module="marketing-loyalty:reviews">

            <div className="min-h-screen p-3 md:p-6 dark:bg-gray-900 dark:text-gray-200">
                <div className="flex justify-between items-center mb-5">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                        Customer Reviews
                    </h1>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all font-bold shadow-lg shadow-brand-100 dark:shadow-none"
                    >
                        <Plus size={18} />
                        Add Review
                    </button>
                </div>

                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left">#</th>
                                <th className="px-4 py-3 text-left">Customer</th>
                                <th className="px-4 py-3 text-left">Rating</th>
                                <th className="px-4 py-3 text-left">Menu Item</th>
                                <th className="px-4 py-3 text-left">Order</th>
                                <th className="px-4 py-3 text-left">AI Enhanced</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center">
                                        Loading reviews...
                                    </td>
                                </tr>
                            ) : reviews.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center">
                                        No reviews found
                                    </td>
                                </tr>
                            ) : (
                                reviews.map((review, index) => (
                                    <tr
                                        key={review.id}
                                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <td className="px-4 py-3">{index + 1}</td>
                                        <td className="px-4 py-3 font-medium">{review.order.customer.name}</td>
                                        <td className="px-4 py-3">
                                            <StarRating rating={review.rating} />
                                        </td>
                                        <td className="px-4 py-3">{review.menuItem?.name || "N/A"}</td>
                                        <td className="px-4 py-3">#{review.order.orderNo}</td>
                                        <td className="px-4 py-3">
                                            {review.aiEnhanced && (
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 border border-brand-100 dark:border-brand-800 uppercase tracking-wider">
                                                    AI Enhanced
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setViewReview(review);
                                                    setIsViewModalOpen(true);
                                                }}
                                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>

                                            <button
                                                onClick={() => openEditModal(review)}
                                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                title="Edit Review"
                                            >
                                                <Edit size={18} />
                                            </button>

                                            <button
                                                onClick={() => handleDeleteReview(review.id)}
                                                disabled={deleting === review.id}
                                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600 dark:text-red-400"
                                                title="Delete Review"
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

                {/* ADD REVIEW MODAL */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
                            <div className="flex justify-between mb-4">
                                <h2 className="font-semibold text-lg">Add New Review</h2>
                                <button onClick={() => setShowAddModal(false)}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Rating</label>
                                    <StarRating
                                        rating={addFormData.rating}
                                        interactive
                                        onChange={(rating) => setAddFormData({ ...addFormData, rating })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Comment</label>
                                    <textarea
                                        value={addFormData.comment}
                                        onChange={(e) =>
                                            setAddFormData({ ...addFormData, comment: e.target.value })
                                        }
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                        placeholder="Amazing food and service!"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Order ID *</label>
                                    <input
                                        type="text"
                                        value={addFormData.orderId}
                                        onChange={(e) =>
                                            setAddFormData({ ...addFormData, orderId: e.target.value })
                                        }
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                        placeholder="clxxx..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Menu Item ID (Optional)</label>
                                    <input
                                        type="text"
                                        value={addFormData.menuItemId}
                                        onChange={(e) =>
                                            setAddFormData({ ...addFormData, menuItemId: e.target.value })
                                        }
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                        placeholder="clxxx..."
                                    />
                                </div>

                                <button
                                    onClick={handleAddReview}
                                    disabled={adding}
                                    className="w-full bg-brand-600 text-white py-3 rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-all font-bold shadow-lg shadow-brand-100 dark:shadow-none"
                                >
                                    {adding ? "Adding..." : "Add Review"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* EDIT REVIEW MODAL */}
                {showEditModal && selectedReview && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
                            <div className="flex justify-between mb-4">
                                <h2 className="font-semibold text-lg">Edit Review</h2>
                                <button onClick={() => setShowEditModal(false)}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Rating</label>
                                    <StarRating
                                        rating={editFormData.rating}
                                        interactive
                                        onChange={(rating) => setEditFormData({ ...editFormData, rating })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Comment</label>
                                    <textarea
                                        value={editFormData.comment}
                                        onChange={(e) =>
                                            setEditFormData({ ...editFormData, comment: e.target.value })
                                        }
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                        placeholder="Amazing food and service!"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Order ID *</label>
                                    <input
                                        type="text"
                                        value={editFormData.orderId}
                                        onChange={(e) =>
                                            setEditFormData({ ...editFormData, orderId: e.target.value })
                                        }
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                        placeholder="clxxx..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Menu Item ID (Optional)</label>
                                    <input
                                        type="text"
                                        value={editFormData.menuItemId}
                                        onChange={(e) =>
                                            setEditFormData({ ...editFormData, menuItemId: e.target.value })
                                        }
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                        placeholder="clxxx..."
                                    />
                                </div>

                                <button
                                    onClick={handleEditReview}
                                    disabled={updating}
                                    className="w-full bg-brand-600 text-white py-3 rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-all font-bold shadow-lg shadow-brand-100 dark:shadow-none"
                                >
                                    {updating ? "Updating..." : "Update Review"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW DETAIL MODAL */}
                <ViewDetailModal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    title="Review Details"
                    data={viewReview}
                    fields={[
                        { label: "Customer", render: (data: any) => data?.order?.customer?.name },
                        { label: "Rating", render: (data: any) => <StarRating rating={data?.rating || 0} /> },
                        { label: "Comment", key: "comment" },
                        { label: "AI Enhanced", render: (data: any) => data?.aiEnhanced ? "Yes" : "No" },
                        { label: "Order #", render: (data: any) => `#${data?.order?.orderNo}` },
                        { label: "Menu Item", render: (data: any) => data?.menuItem?.name || "N/A" },
                        { label: "Created", render: (data: any) => new Date(data?.createdAt).toLocaleDateString() },
                        { label: "ID", key: "id" },
                    ]}
                />
            </div>
        </ProtectedRoute>
    );
}
