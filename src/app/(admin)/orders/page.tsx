"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Eye, X } from "lucide-react";

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
  const [orders, setOrders]: any = useState([]);
  const [loading, setLoading] = useState(true);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [statusModal, setStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder]: any = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);

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

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      setUpdating(true);

      await api.put(`/orders/${selectedOrder.id}`, {
        status: newStatus,
        paymentStatus:
          selectedOrder.payment?.status === "PAID"
            ? "PAID"
            : "PENDING",
      });

      setStatusModal(false);
      fetchOrders();
    } catch (err) {
      console.error("Status update failed", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen p-3 md:p-6 dark:bg-gray-900 dark:text-gray-200">
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
                <>
                  {/* MAIN ROW */}
                  <tr
                    key={order.id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">
                      #{order.orderNo}
                    </td>
                    <td className="px-4 py-3">
                      {order.customer?.name}
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
                        onClick={() =>
                          setOpenOrderId(
                            openOrderId === order.id
                              ? null
                              : order.id
                          )
                        }
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus(order.status);
                          setStatusModal(true);
                        }}
                        className="text-xs px-3 py-1 rounded bg-blue-600 text-white"
                      >
                        Change Status
                      </button>
                    </td>
                  </tr>

                  {/* INVOICE DETAILS */}
                  {openOrderId === order.id && (
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <td colSpan={8} className="p-5 text-sm">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* LEFT */}
                          <div>
                            <h3 className="font-semibold mb-3">
                              Order Items
                            </h3>
                            {order.items.map((item: any) => (
                              <div
                                key={item.id}
                                className="flex justify-between border-b py-1"
                              >
                                <span>
                                  {item.menuItem.name} ×{" "}
                                  {item.quantity}
                                </span>
                                <span>
                                  Rs. {item.price * item.quantity}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* RIGHT */}
                          <div>
                            <h3 className="font-semibold mb-3">
                              Order Summary
                            </h3>
                            <p>
                              <b>Customer:</b>{" "}
                              {order.customer.name}
                            </p>
                            <p>
                              <b>Phone:</b>{" "}
                              {order.customer.phone}
                            </p>
                            <p>
                              <b>Order Type:</b> {order.type}
                            </p>
                            <p>
                              <b>Branch:</b>{" "}
                              {order.branch?.name}
                            </p>
                            <p>
                              <b>Payment:</b>{" "}
                              {order.payment.method} (
                              {order.payment.status})
                            </p>
                            <p>
                              <b>Placed At:</b>{" "}
                              {new Date(
                                order.createdAt
                              ).toLocaleString()}
                            </p>

                            <p className="mt-3 text-lg font-semibold">
                              Total: Rs. {order.total}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

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
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full p-2 border rounded mb-4 dark:bg-gray-700"
            >
              {ORDER_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

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
  );
}
