"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Eye, X, Star, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { ViewDetailModal } from "@/components/ViewDetailModal";
import { ProtectedRoute } from "@/services/protected-route";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "KITCHEN_READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const getStatusBadge = (status: string) => {
  const base = "px-2 py-1 rounded text-xs font-medium";
  switch (status) {
    case "PENDING":
      return `${base} bg-yellow-100 text-yellow-800`;
    case "CONFIRMED":
      return `${base} bg-blue-100 text-blue-800`;
    case "PREPARING":
      return `${base} bg-purple-100 text-purple-800`;
    case "KITCHEN_READY":
      return `${base} bg-indigo-100 text-indigo-800`;
    case "OUT_FOR_DELIVERY":
      return `${base} bg-orange-100 text-orange-800`;
    case "DELIVERED":
      return `${base} bg-green-100 text-green-800`;
    case "CANCELLED":
      return `${base} bg-red-100 text-red-800`;
    default:
      return base;
  }
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders]: any = useState([]);
  const [loading, setLoading] = useState(true);

  // View Modal State
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [statusModal, setStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder]: any = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  // Rider Assignment States
  const [availableRiders, setAvailableRiders] = useState<any[]>([]);
  const [selectedRiderId, setSelectedRiderId] = useState("");
  const [loadingRiders, setLoadingRiders] = useState(false);

  // Rider Details for View Modal
  const [assignedRider, setAssignedRider] = useState<any>(null);
  const [loadingRiderDetails, setLoadingRiderDetails] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const query =
        statusFilter !== "ALL" ? `?status=${statusFilter}` : "";

      const res = await api.get(`/orders${query}`);

      if (res.data?.success) {
        const sorted = res.data.data.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
        setOrders(sorted);
      }
    } catch (err) {
      console.error("Orders fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available riders when status changes to OUT_FOR_DELIVERY
  const fetchAvailableRiders = async () => {
    try {
      setLoadingRiders(true);
      const res = await api.get("/riders?status=AVAILABLE");
      if (res.data?.success) {
        setAvailableRiders(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch riders", err);
    } finally {
      setLoadingRiders(false);
    }
  };

  // Fetch rider details by ID
  const fetchRiderDetails = async (riderId: string) => {
    try {
      setLoadingRiderDetails(true);
      const res = await api.get(`/riders/${riderId}`);
      if (res.data?.success) {
        setAssignedRider(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch rider details", err);
      setAssignedRider(null);
    } finally {
      setLoadingRiderDetails(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    // If status is OUT_FOR_DELIVERY, riderId is required
    if (newStatus === "OUT_FOR_DELIVERY" && !selectedRiderId) {
      alert("Please select a rider for delivery");
      return;
    }

    try {
      setUpdating(true);

      const payload: any = {
        status: newStatus,
        paymentStatus:
          newStatus === "DELIVERED"
            ? "PAID"
            : selectedOrder.payment?.status === "PAID"
              ? "PAID"
              : "PENDING",
      };

      // Add riderId if status is OUT_FOR_DELIVERY
      if (newStatus === "OUT_FOR_DELIVERY" && selectedRiderId) {
        payload.riderId = selectedRiderId;
      }

      await api.put(`/orders/${selectedOrder.id}`, payload);

      setStatusModal(false);
      setSelectedRiderId("");
      fetchOrders();
    } catch (err) {
      console.error("Status update failed", err);
    } finally {
      setUpdating(false);
    }
  };

  const renderOrderItems = (order: any) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
      {order.items.map((item: any) => (
        <div
          key={item.id}
          className="flex justify-between border-b dark:border-gray-600 py-2 last:border-0"
        >
          <span className="text-gray-700 dark:text-gray-300">
            {item.menuItem.name} × {item.quantity}
          </span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            Rs. {item.price * item.quantity}
          </span>
        </div>
      ))}
      <div className="flex justify-between pt-3 mt-1 border-t dark:border-gray-600 font-bold text-lg">
        <span>Total Amount</span>
        <span>Rs. {order.total}</span>
      </div>
    </div>
  );

  // Helper functions for modals
  const openViewModal = (order: any) => {
    setViewOrder(order);
    setIsViewModalOpen(true);
    if (order.riderId) {
      fetchRiderDetails(order.riderId);
    } else {
      setAssignedRider(null);
    }
  };

  const openStatusModal = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setSelectedRiderId("");
    setStatusModal(true);
  };

  return (
    <ProtectedRoute module="orders">
      <div className="min-h-screen p-3 md:p-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl dark:text-gray-200">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Orders
          </h1>

          {/* STATUS FILTER */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded border dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="ALL">All Orders</option>
            {ORDER_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order: any, index: number) => (
                  <tr
                    key={order.id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">
                      #{order.orderNo}
                    </td>
                    <td className="px-4 py-3">
                      {order.customer
                        ? (
                          <span>
                            {order.customer.name}
                            {order.source && order.source !== "WEBSITE" && (
                              <span className="ml-1 text-blue-600 dark:text-blue-400 text-xs font-medium">({order.source})</span>
                            )}
                          </span>
                        )
                        : order.source === "POS"
                          ? <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">POS</span>
                          : <span className="text-gray-400 text-xs">—</span>
                      }
                    </td>
                    <td className="px-4 py-3">{order.type}</td>
                    <td className="px-4 py-3">
                      <span className={getStatusBadge(order.status)}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      Rs. {order.total}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => openViewModal(order)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() => openStatusModal(order)}
                        className="text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Change Status
                      </button>

                      <button
                        onClick={() => {
                          const firstMenuItem = order.items?.[0]?.menuItemId || "";
                          router.push(`/reviews?orderId=${order.id}&menuItemId=${firstMenuItem}`);
                        }}
                        className="p-2 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded text-yellow-600 dark:text-yellow-400"
                        title="Add Review"
                      >
                        <Star size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* VIEW ORDER MODAL */}
        <ViewDetailModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Order Details #${viewOrder?.orderNo || ""}`}
          data={viewOrder}
          fields={[
            {
              label: "Customer Name",
              render: (data: any) => {
                if (!data?.customer) {
                  return data?.source === "POS"
                    ? <span className="text-blue-600 font-semibold">POS Order</span>
                    : <span className="text-gray-400">—</span>;
                }
                return (
                  <span>
                    {data.customer.name}
                    {data.source && data.source !== "WEBSITE" && (
                      <span className="ml-1 text-blue-600 text-xs font-medium">({data.source})</span>
                    )}
                  </span>
                );
              },
            },
            {
              label: "Source",
              render: (data: any) => data?.source || "—",
            },
            {
              label: "Phone Number",
              render: (data: any) => data?.customer?.phone,
            },
            {
              label: "Order Type",
              key: "type",
            },
            {
              label: "Branch",
              render: (data: any) => data?.branch?.name,
            },
            {
              label: "Status",
              render: (data: any) => (
                <span className={getStatusBadge(data?.status || "")}>
                  {data?.status}
                </span>
              ),
            },
            {
              label: "Payment",
              render: (data: any) => (
                <span>
                  {data?.payment?.method} ({data?.payment?.status})
                </span>
              ),
            },
            {
              label: "Placed At",
              render: (data: any) =>
                data?.createdAt
                  ? new Date(data.createdAt).toLocaleString()
                  : "N/A",
            },
            {
              label: "Assigned Rider",
              render: (data: any) => {
                if (!data?.riderId) return <span className="text-gray-500">No rider assigned</span>;
                if (loadingRiderDetails) return <span className="text-gray-500">Loading...</span>;
                if (!assignedRider) return <span className="text-gray-500">N/A</span>;
                return (
                  <div className="space-y-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{assignedRider.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{assignedRider.phone}</div>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${assignedRider.status === "AVAILABLE"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : assignedRider.status === "BUSY"
                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}>
                      {assignedRider.status}
                    </span>
                  </div>
                );
              },
            },
            {
              label: "Order Items",
              fullWidth: true,
              render: renderOrderItems,
            },
          ]}
        />

        {/* STATUS MODAL */}
        {statusModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-80">
              <div className="flex justify-between mb-4">
                <h2 className="font-semibold">
                  Change Order Status
                </h2>
                <button onClick={() => setStatusModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <select
                value={newStatus}
                onChange={(e) => {
                  const status = e.target.value;
                  setNewStatus(status);
                  // Fetch riders when OUT_FOR_DELIVERY is selected
                  if (status === "OUT_FOR_DELIVERY") {
                    fetchAvailableRiders();
                  }
                }}
                className="w-full p-2 border rounded mb-4 dark:bg-gray-700"
              >
                {ORDER_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>

              {/* Rider Selection - Only show when OUT_FOR_DELIVERY */}
              {newStatus === "OUT_FOR_DELIVERY" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Assign Rider *
                  </label>
                  {loadingRiders ? (
                    <div className="text-sm text-gray-500">Loading riders...</div>
                  ) : (
                    <select
                      value={selectedRiderId}
                      onChange={(e) => setSelectedRiderId(e.target.value)}
                      className="w-full p-2 border rounded dark:bg-gray-700"
                      required
                    >
                      <option value="">Select a rider</option>
                      {availableRiders.map((rider) => (
                        <option key={rider.id} value={rider.id}>
                          {rider.name} - {rider.phone}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="w-full bg-green-600 text-white py-2 rounded"
              >
                {updating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
