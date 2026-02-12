"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";
import { ArrowLeft } from "lucide-react";

function AddBranchForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const presetRestaurantId = searchParams.get("restaurantId");

    const [restaurants, setRestaurants]: any = useState([]);
    const [loading, setLoading] = useState(false);


    const [form, setForm] = useState({
        name: "",
        address: "",
        phone: 0,
        deliveryRadius: 0,
        freeDeliveryThreshold: 0,
        deliveryCharge: 0,
        deliveryOffTime: 0,
        restaurantId: presetRestaurantId || "",
    });

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        const res = await api.get("/restaurants");
        if (res.data?.success) {
            setRestaurants(res.data.data);
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
        try {
            setLoading(true);
            await api.post("/branches", form);
            router.push(`/branches?restaurantId=${form.restaurantId}`);
        } catch (err) {
            console.error("Create branch failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-4 dark:bg-gray-900">
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                    <ArrowLeft size={18} />
                </button>

                <h1 className="text-2xl font-semibold dark:text-gray-300">
                    Add Branch
                </h1>
            </div>

            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md"
            >


                <div className="grid md:grid-cols-2 gap-4">
                    {/* RESTAURANT */}
                    <div>
                        <label className="text-sm">Restaurant *</label>
                        <select
                            name="restaurantId"
                            value={form.restaurantId}
                            onChange={handleChange}
                            required
                            className="w-full p-2 mt-1 border rounded dark:bg-gray-700"
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
                        <label className="text-sm">Branch Name *</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full p-2 mt-1 border rounded dark:bg-gray-700"
                        />
                    </div>

                    {/* PHONE */}
                    <div>
                        <label className="text-sm">Phone *</label>
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="+92 300 1234567"
                            className="w-full p-2 mt-1 border rounded dark:bg-gray-700"
                        />
                    </div>

                    {/* DELIVERY RADIUS */}
                    <div>
                        <label className="text-sm">Delivery Radius (km)</label>
                        <input
                            type="number"
                            name="deliveryRadius"
                            value={form.deliveryRadius}
                            onChange={handleChange}
                            className="w-full p-2 mt-1 border rounded dark:bg-gray-700"
                        />
                    </div>

                    {/* FREE DELIVERY */}
                    <div>
                        <label className="text-sm">Free Delivery Threshold</label>
                        <input
                            type="number"
                            name="freeDeliveryThreshold"
                            value={form.freeDeliveryThreshold}
                            onChange={handleChange}
                            className="w-full p-2 mt-1 border rounded dark:bg-gray-700"
                        />
                    </div>

                    {/* DELIVERY CHARGE */}
                    <div>
                        <label className="text-sm">Delivery Charge</label>
                        <input
                            type="number"
                            name="deliveryCharge"
                            value={form.deliveryCharge}
                            onChange={handleChange}
                            className="w-full p-2 mt-1 border rounded dark:bg-gray-700"
                        />
                    </div>

                    {/* DELIVERY OFF TIME */}
                    <div>
                        <label className="text-sm">Delivery Off Time (minutes)</label>
                        <input
                            type="number"
                            name="deliveryOffTime"
                            value={form.deliveryOffTime}
                            onChange={handleChange}
                            className="w-full p-2 mt-1 border rounded dark:bg-gray-700"
                        />
                    </div>
                </div>

                {/* ADDRESS */}
                <div className="mt-4">
                    <label className="text-sm">Address *</label>
                    <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-2 mt-1 border rounded dark:bg-gray-700"
                    />
                </div>

                {/* ACTIONS */}
                <div className="mt-6 flex gap-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded"
                    >
                        {loading ? "Creating..." : "Create Branch"}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2 rounded border dark:border-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            </form>

        </div>
    );
}
export default function AddBranchPage() {
    return (
        // 2. Yahan Suspense wrap karein
        <Suspense fallback={<div className="p-10 text-center">Loading Form...</div>}>
            <AddBranchForm />
        </Suspense>
    );
}