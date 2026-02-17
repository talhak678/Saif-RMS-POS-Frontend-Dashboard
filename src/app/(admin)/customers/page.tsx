"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Eye, Gift } from "lucide-react";
import { useRouter } from "next/navigation";
import { ViewDetailModal } from "@/components/ViewDetailModal";

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View Modal State
  const [viewCustomer, setViewCustomer] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get("/customers");
        if (res.data?.success) {
          setCustomers(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch customers", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div className="min-h-screen p-3 md:p-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl dark:text-gray-200">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Customers
        </h1>
        {/* No Filter currently, but layout is ready for one */}
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Orders Count</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center">
                  Loading customers...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center">
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((customer: any, index: number) => (
                <tr
                  key={customer.id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-medium">{customer.name}</td>
                  <td className="px-4 py-3">{customer.email}</td>
                  <td className="px-4 py-3">{customer.phone}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {customer._count?.orders ?? 0} Orders
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => {
                        setViewCustomer(customer);
                        setIsViewModalOpen(true);
                      }}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      onClick={() => {
                        router.push(`/loyalty?customerId=${customer.id}`);
                      }}
                      className="p-2 hover:bg-green-100 dark:hover:bg-green-900 rounded text-green-600 dark:text-green-400"
                      title="Add Loyalty Points"
                    >
                      <Gift size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ViewDetailModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Customer Details"
        data={viewCustomer}
        fields={[
          { label: "Name", key: "name" },
          { label: "Email", key: "email" },
          { label: "Phone", key: "phone" },
          { label: "Total Orders", render: (data) => data?._count?.orders ?? 0 },
          { label: "Created At", render: (data) => data?.createdAt ? new Date(data.createdAt).toLocaleString() : 'N/A' },
        ]}
      />
    </div>
  );
}