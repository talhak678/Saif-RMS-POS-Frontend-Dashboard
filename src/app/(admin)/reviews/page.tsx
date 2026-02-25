"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Eye, Edit, Trash2, X, Star } from "lucide-react";
import { ViewDetailModal } from "@/components/ViewDetailModal";
import { toast } from "sonner";
import { ProtectedRoute } from "@/services/protected-route";
import Loader from "@/components/common/Loader";
import Badge from "@/components/ui/badge/Badge";

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
    reply: string;
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
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    // View Detail Modal
    const [viewReview, setViewReview] = useState<Review | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Reply Review Modal
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [replyData, setReplyData] = useState({
        reply: "",
    });
    const [updating, setUpdating] = useState(false);

    // Delete
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchReviews();
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

    const handleReplyReview = async () => {
        if (!selectedReview) return;

        try {
            setUpdating(true);
            const payload: any = {
                rating: selectedReview.rating,
                comment: selectedReview.comment,
                orderId: selectedReview.orderId,
                reply: replyData.reply,
            };

            await api.put(`/marketing/reviews/${selectedReview.id}`, payload);
            toast.success("Reply updated successfully!");
            setShowReplyModal(false);
            setSelectedReview(null);
            fetchReviews();
        } catch (err) {
            console.error("Failed to update reply", err);
            toast.error("Failed to update reply");
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

    const openReplyModal = (review: Review) => {
        setSelectedReview(review);
        setReplyData({
            reply: review.reply || "",
        });
        setShowReplyModal(true);
    };

    return (
        <ProtectedRoute module="marketing-loyalty:reviews">

            <div className="min-h-screen p-3 md:p-6 dark:bg-gray-900 dark:text-gray-200 uppercase tracking-tight font-medium">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-800 dark:text-gray-200">
                            Customer Reviews
                        </h1>
                        <p className="text-gray-500 text-xs mt-1">Manage and reply to customer feedback</p>
                    </div>
                </div>

                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left">#</th>
                                <th className="px-6 py-4 text-left">Customer</th>
                                <th className="px-6 py-4 text-left">Rating</th>
                                <th className="px-6 py-4 text-left">Feedback</th>
                                <th className="px-6 py-4 text-left">Order</th>
                                <th className="px-6 py-4 text-left">Reply Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center">
                                        <Loader size="md" />
                                    </td>
                                </tr>
                            ) : reviews.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center mb-4">
                                            <Star size={32} className="text-gray-200" />
                                        </div>
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No reviews found yet</p>
                                    </td>
                                </tr>
                            ) : (
                                reviews.map((review, index) => (
                                    <tr
                                        key={review.id}
                                        className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                                    >
                                        <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-black text-gray-900 dark:text-gray-100">{review.order.customer.name}</div>
                                            <div className="text-[10px] text-gray-400 mt-0.5">{new Date(review.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StarRating rating={review.rating} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="max-w-xs truncate text-xs text-gray-600 dark:text-gray-400 italic">"{review.comment || 'No comment'}"</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-brand-600 dark:text-brand-400">#{review.order.orderNo}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {review.reply ? (
                                                <Badge variant="solid" color="success" className="text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-tight">Replied</Badge>
                                            ) : (
                                                <Badge variant="light" color="warning" className="text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-tight">Pending</Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setViewReview(review);
                                                        setIsViewModalOpen(true);
                                                    }}
                                                    className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>

                                                <button
                                                    onClick={() => openReplyModal(review)}
                                                    className="p-2.5 hover:bg-brand-50 dark:hover:bg-brand-900/40 rounded-xl text-brand-600 dark:text-brand-400 transition-colors"
                                                    title="Reply to Review"
                                                >
                                                    <Edit size={18} />
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteReview(review.id)}
                                                    disabled={deleting === review.id}
                                                    className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl text-red-600 transition-colors flex items-center justify-center min-w-[40px]"
                                                    title="Delete Review"
                                                >
                                                    {deleting === review.id ? <Loader size="sm" className="space-y-0" /> : <Trash2 size={18} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* REPLY MODAL */}
                {showReplyModal && selectedReview && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
                            <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                                <h2 className="font-black text-lg uppercase tracking-tight">Merchant Reply</h2>
                                <button onClick={() => setShowReplyModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Customer Review Context */}
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Customer Feedback</span>
                                        <StarRating rating={selectedReview.rating} />
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{selectedReview.comment || 'No comment provided'}"</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1">Your Response</label>
                                    <textarea
                                        value={replyData.reply}
                                        onChange={(e) =>
                                            setReplyData({ ...replyData, reply: e.target.value })
                                        }
                                        className="w-full p-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50/30 dark:bg-gray-900/30 focus:border-brand-500 transition-colors outline-none text-sm min-h-[120px]"
                                        placeholder="Thank you for your feedback! We're glad you enjoyed the meal..."
                                    />
                                </div>

                                <button
                                    onClick={handleReplyReview}
                                    disabled={updating}
                                    className="w-full bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-2xl disabled:opacity-50 transition-all font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-500/20 flex justify-center items-center gap-2 mt-2 active:scale-95"
                                >
                                    {updating ? <Loader size="sm" className="space-y-0" /> : "Post Reply"}
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
                        { label: "Comment", render: (data: any) => <span className="italic">"{data?.comment || 'N/A'}"</span> },
                        { label: "Merchant Reply", render: (data: any) => data?.reply ? <span className="text-brand-600 font-bold">"{data.reply}"</span> : <span className="text-gray-400 italic">No reply yet</span> },
                        { label: "AI Enhanced", render: (data: any) => data?.aiEnhanced ? <Badge color="success">Yes</Badge> : "No" },
                        { label: "Order #", render: (data: any) => `#${data?.order?.orderNo}` },
                        { label: "Menu Item", render: (data: any) => data?.menuItem?.name || "N/A" },
                        { label: "Created", render: (data: any) => new Date(data?.createdAt).toLocaleDateString() },
                    ]}
                />
            </div>
        </ProtectedRoute>
    );
}
