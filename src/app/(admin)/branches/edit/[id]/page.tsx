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
        lat: "",
        lng: "",
        restaurantId: "",
    });

    useEffect(() => {
        if (id) {
            fetchInitialData();
        }
    }, [id]);

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
                    lat: data.lat || "",
                    lng: data.lng || "",
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

    if (loadingUser || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 dark:bg-gray-900 bg-gray-50/30">
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-6 max-w-4xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="p-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300 transition-all bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700"
                >
                    <ArrowLeft size={18} />
                </button>

                <h1 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight">
                    Edit Branch
                </h1>
            </div>

            {/* FORM */}
            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none max-w-4xl mx-auto border border-gray-100 dark:border-gray-700"
            >
                <div className="grid md:grid-cols-2 gap-6">
                    {/* RESTAURANT */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 block">Restaurant *</label>
                        <select
                            name="restaurantId"
                            value={form.restaurantId}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
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
                        <label className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 block">Branch Name *</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>

                    {/* PHONE */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 block">Phone *</label>
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            required
                            placeholder="+1 300 1234567"
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>

                    {/* DELIVERY RADIUS */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 block">Delivery Radius (km)</label>
                        <input
                            type="number"
                            name="deliveryRadius"
                            value={form.deliveryRadius}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>

                    {/* FREE DELIVERY */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 block">Free Delivery Threshold ($)</label>
                        <input
                            type="number"
                            name="freeDeliveryThreshold"
                            value={form.freeDeliveryThreshold}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>

                    {/* DELIVERY CHARGE */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 block">Delivery Charge ($)</label>
                        <input
                            type="number"
                            name="deliveryCharge"
                            value={form.deliveryCharge}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>

                    {/* DELIVERY OFF TIME */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 block">Delivery Off Time</label>
                        <input
                            type="time"
                            name="deliveryOffTime"
                            value={form.deliveryOffTime}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>

                    {/* LATITUDE */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 block">Latitude</label>
                        <input
                            name="lat"
                            value={form.lat}
                            onChange={handleChange}
                            placeholder="24.8607"
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>

                    {/* LONGITUDE */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 block">Longitude</label>
                        <input
                            name="lng"
                            value={form.lng}
                            onChange={handleChange}
                            placeholder="67.0011"
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* ADDRESS */}
                <div className="mt-6">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 block">Address *</label>
                    <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                    />
                </div>

                {/* ACTIONS */}
                <div className="mt-8 flex gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 bg-brand-600 hover:bg-brand-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-200 dark:shadow-none flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        {saving ? <Loader size="sm" showText={false} className="space-y-0" /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                        {saving ? "Updating Branch..." : "Update Branch Details"}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-8 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-bold"
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
