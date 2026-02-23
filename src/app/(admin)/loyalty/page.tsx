"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/services/api";
import { Eye, Trash2, Plus, X, Search } from "lucide-react";
import { ViewDetailModal } from "@/components/ViewDetailModal";
import { toast } from "sonner";
import { ProtectedRoute } from "@/services/protected-route";

const TRANSACTION_TYPES = ["EARNED", "REDEEMED"];

const getTypeBadge = (type: string) => {
    const base = "px-2 py-1 rounded text-xs font-medium";
    if (type === "EARNED") {
        return `${base} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
    }
    return `${base} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`;
};

interface LoyaltyTransaction {
    id: string;
    points: number;
    type: "EARNED" | "REDEEMED";
    customerId: string;
    customer: {
        name: string;
        loyaltyPoints: number;
    };
    createdAt: string;
}

export default function LoyaltyPage() {
    const searchParams = useSearchParams();
    const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
    const [allTransactions, setAllTransactions] = useState<LoyaltyTransaction[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // View Detail Modal
    const [viewTransaction, setViewTransaction] = useState<LoyaltyTransaction | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Add Transaction Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [addFormData, setAddFormData] = useState({
        points: "",
        type: "EARNED" as "EARNED" | "REDEEMED",
        customerId: "",
    });
    const [adding, setAdding] = useState(false);

    // Delete
    const [deleting, setDeleting] = useState<string | null>(null);

    // Customer Search
    const [customerSearch, setCustomerSearch] = useState("");

    useEffect(() => {
        fetchCustomers();
        fetchTransactions();
    }, []);

    useEffect(() => {
        // Check for URL params and auto-open add modal
        const customerId = searchParams.get("customerId");

        if (customerId) {
            setAddFormData({
                points: "",
                type: "EARNED",
                customerId: customerId,
            });
            setShowAddModal(true);
        }
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await api.get("/customers");
            if (res.data?.success) {
                setCustomers(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch customers", err);
        }
    };

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const res = await api.get("/loyalty-transactions");

            if (res.data?.success) {
                setAllTransactions(res.data.data);
                setTransactions(res.data.data);
            } else {
                toast.error(res.data?.message || "Failed to fetch loyalty transactions");
            }
        } catch (err) {
            console.error("Failed to fetch loyalty transactions", err);
            toast.error("Failed to fetch loyalty transactions");
        } finally {
            setLoading(false);
        }
    };

    // Filter transactions by customer search
    useEffect(() => {
        if (!customerSearch.trim()) {
            setTransactions(allTransactions);
        } else {
            const filtered = allTransactions.filter((transaction) =>
                transaction.customer.name.toLowerCase().includes(customerSearch.toLowerCase())
            );
            setTransactions(filtered);
        }
    }, [customerSearch, allTransactions]);

    const handleAddTransaction = async () => {
        if (!addFormData.customerId || !addFormData.points) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            setAdding(true);
            const payload = {
                points: parseInt(addFormData.points),
                type: addFormData.type,
                customerId: addFormData.customerId,
            };

            await api.post("/loyalty-transactions", payload);
            toast.success("Transaction added successfully!");
            setShowAddModal(false);
            setAddFormData({
                points: "",
                type: "EARNED",
                customerId: "",
            });
            fetchTransactions();
        } catch (err) {
            console.error("Failed to add transaction", err);
            toast.error("Failed to add transaction");
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteTransaction = async (transactionId: string) => {
        if (!confirm("Are you sure you want to delete this transaction? Points will be reversed.")) return;

        try {
            setDeleting(transactionId);
            await api.delete(`/loyalty-transactions/${transactionId}`);
            toast.success("Transaction deleted successfully!");
            fetchTransactions();
        } catch (err) {
            console.error("Failed to delete transaction", err);
            toast.error("Failed to delete transaction");
        } finally {
            setDeleting(null);
        }
    };

    return (
        <ProtectedRoute module="marketing-loyalty:loyalty" >
            <div className="min-h-screen p-3 md:p-6 dark:bg-gray-900 dark:text-gray-200">
                <div className="flex justify-between items-center mb-5">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                        Loyalty Transactions
                    </h1>

                    <div className="flex gap-3">
                        {/* CUSTOMER SEARCH */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={customerSearch}
                                onChange={(e) => setCustomerSearch(e.target.value)}
                                placeholder="Search customer..."
                                className="pl-10 pr-4 py-2 rounded border dark:bg-gray-800 dark:border-gray-700 min-w-[250px]"
                            />
                        </div>

                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all font-bold shadow-lg shadow-brand-100 dark:shadow-none"
                        >
                            <Plus size={18} />
                            Add Transaction
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left">#</th>
                                <th className="px-4 py-3 text-left">Customer</th>
                                <th className="px-4 py-3 text-left">Points</th>
                                <th className="px-4 py-3 text-left">Type</th>
                                <th className="px-4 py-3 text-left">Current Balance</th>
                                <th className="px-4 py-3 text-left">Date</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center">
                                        Loading transactions...
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center">
                                        No transactions found
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((transaction, index) => (
                                    <tr
                                        key={transaction.id}
                                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <td className="px-4 py-3">{index + 1}</td>
                                        <td className="px-4 py-3 font-medium">{transaction.customer.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={transaction.type === "EARNED" ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}>
                                                {transaction.type === "EARNED" ? "+" : "-"}{transaction.points}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={getTypeBadge(transaction.type)}>
                                                {transaction.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-semibold">
                                            {transaction.customer.loyaltyPoints} pts
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            {new Date(transaction.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setViewTransaction(transaction);
                                                    setIsViewModalOpen(true);
                                                }}
                                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>

                                            <button
                                                onClick={() => handleDeleteTransaction(transaction.id)}
                                                disabled={deleting === transaction.id}
                                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600 dark:text-red-400"
                                                title="Delete Transaction"
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

                {/* ADD TRANSACTION MODAL */}
                {
                    showAddModal && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
                                <div className="flex justify-between mb-4">
                                    <h2 className="font-semibold text-lg">Add Loyalty Transaction</h2>
                                    <button onClick={() => setShowAddModal(false)}>
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Customer ID *</label>
                                        <input
                                            type="text"
                                            value={addFormData.customerId}
                                            onChange={(e) =>
                                                setAddFormData({ ...addFormData, customerId: e.target.value })
                                            }
                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                            placeholder="clxxx..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Points *</label>
                                        <input
                                            type="number"
                                            value={addFormData.points}
                                            onChange={(e) =>
                                                setAddFormData({ ...addFormData, points: e.target.value })
                                            }
                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                            placeholder="50"
                                            min="1"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Transaction Type *</label>
                                        <select
                                            value={addFormData.type}
                                            onChange={(e) =>
                                                setAddFormData({ ...addFormData, type: e.target.value as "EARNED" | "REDEEMED" })
                                            }
                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                        >
                                            {TRANSACTION_TYPES.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="p-3 bg-brand-50 dark:bg-brand-900/30 rounded-lg border border-brand-100 dark:border-brand-800 text-sm">
                                        <p className="text-brand-700 dark:text-brand-300">
                                            <b>Note:</b> EARNED adds points, REDEEMED subtracts points from customer balance.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleAddTransaction}
                                        disabled={adding}
                                        className="w-full bg-brand-600 text-white py-3 rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-all font-bold shadow-lg shadow-brand-100 dark:shadow-none"
                                    >
                                        {adding ? "Adding..." : "Add Transaction"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* VIEW DETAIL MODAL */}
                <ViewDetailModal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    title="Transaction Details"
                    data={viewTransaction}
                    fields={[
                        { label: "Customer", render: (data: any) => data?.customer?.name },
                        { label: "Points", render: (data: any) => `${data?.type === "EARNED" ? "+" : "-"}${data?.points}` },
                        { label: "Type", render: (data: any) => <span className={getTypeBadge(data?.type)}>{data?.type}</span> },
                        { label: "Current Balance", render: (data: any) => `${data?.customer?.loyaltyPoints} points` },
                        { label: "Transaction Date", render: (data: any) => new Date(data?.createdAt).toLocaleDateString() },
                        { label: "Transaction ID", key: "id" },
                    ]}
                />
            </div>
        </ProtectedRoute>
    );
}
