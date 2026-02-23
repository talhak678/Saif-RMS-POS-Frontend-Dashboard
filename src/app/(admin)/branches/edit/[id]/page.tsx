"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/services/api";
import { ArrowLeft, Save } from "lucide-react";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/services/permission.service";
import { toast } from "sonner";

function EditBranchForm() {
    const { user, loadingUser } = useAuth();
    const isSuperAdmin = user?.role?.name === 'SUPER_ADMIN';
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const [restaurants, setRestaurants]: any = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: "",
        address: "",
        phone: "",
        deliveryRadius: 0,
        freeDeliveryThreshold: 0,
        deliveryCharge: 0,
        deliveryOffTime: '',
        restaurantId: "",
    });

    useEffect(() => {
        if (!loadingUser && user && !isSuperAdmin) {
            toast.error("Access denied. Only Super Admins can edit branches.");
            router.push("/branches");
        }
    }, [user, loadingUser, isSuperAdmin, router]);

    useEffect(() => {
        if (id && isSuperAdmin) {
            fetchInitialData();
        }
    }, [id, isSuperAdmin]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [restRes, branchRes] = await Promise.all([
                api.get("/restaurants"),
                api.get(`/branches/${id}`)
            ]);

            if (restRes.data?.success) {
                setRestaurants(restRes.data.data);
            }

            if (branchRes.data?.success) {
                const data = branchRes.data.data;
                setForm({
                    name: data.name || "",
                    address: data.address || "",
                    phone: data.phone || "",
                    deliveryRadius: data.deliveryRadius || 0,
                    freeDeliveryThreshold: data.freeDeliveryThreshold || 0,
                    deliveryCharge: data.deliveryCharge || 0,
                    deliveryOffTime: data.deliveryOffTime || '',
                    restaurantId: data.restaurantId || "",
                });
            }
        } catch (err) {
            console.error("Fetch data failed", err);
            toast.error("Failed to load branch details");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;

        const numberFields = [
            "deliveryRadius",
            "freeDeliveryThreshold",
            "deliveryCharge",
        ];

        setForm((prev) => ({
            ...prev,
            [name]: numberFields.includes(name)
                ? value === ""
                    ? 0
                    : Number(value)
                : value,
        }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!form.restaurantId) {
            toast.error("Please select a restaurant");
            return;
        }

        try {
            setSaving(true);
            const res = await api.put(`/branches/${id}`, form);
            if (res.data?.success) {
                toast.success("Branch updated successfully");
                router.push(`/branches?restaurantId=${form.restaurantId}`);
            } else {
                toast.error(res.data?.message || "Failed to update branch");
            }
        } catch (err) {
            console.error("Update branch failed", err);
            toast.error("An error occurred while updating the branch");
        } finally {
            setSaving(false);
        }
    };

    if (loadingUser || (loading && isSuperAdmin)) {
        return (
            <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
                <Loader size="lg" />
            </div>
        );
    }

    if (!isSuperAdmin) return null;

    return (
        <div className="min-h-screen p-4 dark:bg-gray-900">
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300"
                >
                    <ArrowLeft size={18} />
                </button>

                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-300">
                    Edit Branch
                </h1>
            </div>

            {/* FORM */}
            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md max-w-4xl mx-auto"
            >
                <div className="grid md:grid-cols-2 gap-4">
                    {/* RESTAURANT */}
                    <div>
                        <label className="text-sm font-medium dark:text-gray-300">Restaurant *</label>
                        <select
                            name="restaurantId"
                            value={form.restaurantId}
                            onChange={handleChange}
                            required
                            className="w-full p-2 mt-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        >
                            <option value="">Select Restaurant</option>
                            {restaurants.map((r: any) => (
                                <option key={r.id} value={r.id}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* BRANCH NAME */}
                    <div>
                        <label className="text-sm font-medium dark:text-gray-300">Branch Name *</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full p-2 mt-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>

                    {/* PHONE */}
                    <div>
                        <label className="text-sm font-medium dark:text-gray-300">Phone *</label>
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            required
                            placeholder="+92 300 1234567"
                            className="w-full p-2 mt-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>

                    {/* DELIVERY RADIUS */}
                    <div>
                        <label className="text-sm font-medium dark:text-gray-300">Delivery Radius (km)</label>
                        <input
                            type="number"
                            name="deliveryRadius"
                            value={form.deliveryRadius}
                            onChange={handleChange}
                            className="w-full p-2 mt-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>

                    {/* FREE DELIVERY */}
                    <div>
                        <label className="text-sm font-medium dark:text-gray-300">Free Delivery Threshold ($)</label>
                        <input
                            type="number"
                            name="freeDeliveryThreshold"
                            value={form.freeDeliveryThreshold}
                            onChange={handleChange}
                            className="w-full p-2 mt-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>

                    {/* DELIVERY CHARGE */}
                    <div>
                        <label className="text-sm font-medium dark:text-gray-300">Delivery Charge ($)</label>
                        <input
                            type="number"
                            name="deliveryCharge"
                            value={form.deliveryCharge}
                            onChange={handleChange}
                            className="w-full p-2 mt-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>

                    {/* DELIVERY OFF TIME */}
                    <div>
                        <label className="text-sm font-medium dark:text-gray-300">Delivery Off Time</label>
                        <input
                            type="time"
                            name="deliveryOffTime"
                            value={form.deliveryOffTime}
                            onChange={handleChange}
                            className="w-full p-2 mt-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>
                </div>

                {/* ADDRESS */}
                <div className="mt-4">
                    <label className="text-sm font-medium dark:text-gray-300">Address *</label>
                    <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="w-full p-2 mt-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    />
                </div>

                {/* ACTIONS */}
                <div className="mt-6 flex gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader size="sm" showText={false} className="space-y-0" /> : <Save size={18} />}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2 rounded border dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function EditBranchPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center text-gray-400 dark:text-gray-500">Loading Form...</div>}>
            <EditBranchForm />
        </Suspense>
    );
}
