"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Eye } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders]: any = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders");
        if (res.data?.success) {
          setOrders(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="p-2 md:p-4 dark:bg-gray-900">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-300">
            Orders
          </h1>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              <tr className="whitespace-nowrap">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Order No</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody className="whitespace-nowrap">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-500">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((order: any, index: number) => (
                  <tr
                    key={order.id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">#{order.orderNo}</td>
                    <td className="px-4 py-3">
                      {order.customer?.name ?? "---"}
                    </td>
                    <td className="px-4 py-3">{order.type}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium
                          ${
                            order.status === "DELIVERED"
                              ? "bg-green-100 text-green-700"
                              : order.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }
                        `}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">Rs. {order.total}</td>
                    <td className="px-4 py-3">
                      {order.payment?.method} (
                      {order.payment?.status})
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                        title="View Order"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
