"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/services/api";
import { Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { ViewDetailModal } from "@/components/ViewDetailModal";

export default function CustomersPage() {
  const [customers, setCustomers]: any = useState([]);
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
    <div className="min-h-screen">
      {/* Header */}
      <div className="p-2 md:p-4 dark:bg-gray-900">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-300">
            Customers
          </h1>
        </div>

        {/* Table */}
        <Table className="w-full text-sm">
          <TableHeader>
            <TableRow className="whitespace-nowrap">
              <TableCell className="px-4 py-3 text-left">#</TableCell>
              <TableCell className="px-4 py-3 text-left">Name</TableCell>
              <TableCell className="px-4 py-3 text-left">Email</TableCell>
              <TableCell className="px-4 py-3 text-left">Phone</TableCell>
              <TableCell className="px-4 py-3 text-left">Orders</TableCell>
              <TableCell className="px-4 py-3 text-left">Actions</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="whitespace-nowrap">
            {loading ? (
              <TableRow>
                <TableCell className="py-10 text-center text-gray-500">
                  Loading customers...
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
                  No customers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
