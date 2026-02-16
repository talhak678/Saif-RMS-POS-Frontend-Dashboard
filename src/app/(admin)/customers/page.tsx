"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Eye } from "lucide-react";
<<<<<<< HEAD
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { ViewDetailModal } from "@/components/ViewDetailModal";
=======
>>>>>>> b1edb8e0f2d4f19fb3b904f86d16a09ab55388bd

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCustomerId, setOpenCustomerId] = useState<string | null>(null);

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
    <div className="min-h-screen p-3 md:p-6 dark:bg-gray-900 dark:text-gray-200">
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
<<<<<<< HEAD
                </TableCell>
              </TableRow>
            ) : customers.length > 0 ? (
              customers.map((customer: any, index: number) => (
                <TableRow
                  key={customer.id}
                >
                  <TableCell className="px-4 py-3">{index + 1}</TableCell>
                  <TableCell className="px-4 py-3">{(customer.name)}</TableCell>
                  <TableCell className="px-4 py-3">{customer.email}</TableCell>
                  <TableCell className="px-4 py-3">{customer.phone}</TableCell>
                  <TableCell className="px-4 py-3">
                    {(customer._count)?.orders ?? 0}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <button
                      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                      title="View"
                      onClick={() => {
                        setViewCustomer(customer);
                        setIsViewModalOpen(true);
                      }}
                    >
                      <Eye size={18} />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  // colSpan={6}
                  className="py-10 text-center text-gray-500"
                >
=======
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center">
>>>>>>> b1edb8e0f2d4f19fb3b904f86d16a09ab55388bd
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((customer, index) => (
                <>
                  {/* MAIN ROW */}
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
                        onClick={() =>
                          setOpenCustomerId(
                            openCustomerId === customer.id ? null : customer.id
                          )
                        }
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>

                  {/* DETAILS ROW */}
                  {openCustomerId === customer.id && (
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <td colSpan={6} className="p-5 text-sm">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-semibold mb-3">Customer Profile</h3>
                            <p><b>Name:</b> {customer.name}</p>
                            <p><b>Email:</b> {customer.email}</p>
                            <p><b>Phone:</b> {customer.phone}</p>
                          </div>
                          <div>
                            <h3 className="font-semibold mb-3">Stats</h3>
                            <p><b>Total Orders:</b> {customer._count?.orders ?? 0}</p>
                            {/* You could add "Total Spent" or "Last Order Date" here if available in API */}
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