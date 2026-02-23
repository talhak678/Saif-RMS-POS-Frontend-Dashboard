"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/services/api";
import { ArrowLeft, Save } from "lucide-react";
import Loader from "@/components/common/Loader";
import ImageUpload from "@/components/common/ImageUpload";
import { useAuth } from "@/services/permission.service";
import { toast } from "sonner";

const STATUS_OPTIONS = ["PENDING", "ACTIVE", "SUSPENDED"];
const SUBSCRIPTION_OPTIONS = [
    "FREE",
    "BASIC",
    "PREMIUM",
    "ENTERPRISE",
];

export default function EditRestaurantPage() {
    const { user, loadingUser } = useAuth();
    const isSuperAdmin = user?.role?.name === 'SUPER_ADMIN';
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const [form, setForm] = useState({
        name: "",
        slug: "",
        logo: "",
        description: "",
        status: "PENDING",
        subscription: "FREE",
        facebookUrl: "",
        instagramUrl: "",
        tiktokUrl: "",
        metaPixelId: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!loadingUser && user && !isSuperAdmin) {
            toast.error("Access denied. Only Super Admins can edit restaurants.");
            router.push("/restaurants");
        }
    }, [user, loadingUser, isSuperAdmin, router]);

    useEffect(() => {
        if (id && isSuperAdmin) {
            fetchRestaurant();
        }
    }, [id, isSuperAdmin]);

    const fetchRestaurant = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/restaurants/${id}`);
            if (res.data?.success) {
                const data = res.data.data;
                setForm({
                    name: data.name || "",
                    slug: data.slug || "",
                    logo: data.logo || "",
                    description: data.description || "",
                    status: data.status || "PENDING",
                    subscription: data.subscription || "FREE",
                    facebookUrl: data.facebookUrl || "",
                    instagramUrl: data.instagramUrl || "",
                    tiktokUrl: data.tiktokUrl || "",
                    metaPixelId: data.metaPixelId || "",
                });
            } else {
                setError("Restaurant not found");
            }
        } catch (err) {
            console.error("Fetch restaurant failed", err);
            setError("Failed to fetch restaurant details");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validate = () => {
        if (!form.name || form.name.length < 2)
            return "Restaurant name must be at least 2 characters";
        if (!form.slug || form.slug.length < 2)
            return "Slug must be at least 2 characters";
        return "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) {
            toast.error(validationError);
            return;
        }

        try {
            setSaving(true);
            // Requirement: send all data along with changes
            const res = await api.put(`/restaurants/${id}`, {
                ...form,
            });

            if (res.data?.success) {
                toast.success("Restaurant updated successfully");
                router.push("/restaurants");
            } else {
                toast.error(res.data?.message || "Failed to update restaurant");
            }
        } catch (err: any) {
            console.error("Update restaurant failed", err);
            toast.error("An error occurred while updating the restaurant");
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
                    onClick={() => router.push("/restaurants")}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300"
                >
                    <ArrowLeft size={18} />
                </button>

                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-300">
                    Edit Restaurant
                </h1>
            </div>

            {/* FORM */}
            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md max-w-4xl mx-auto"
            >
                {error && (
                    <div className="mb-4 text-sm text-red-600 bg-red-100 dark:bg-red-900/30 p-3 rounded">
                        {error}
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                    {/* NAME */}
                    <div>
                        <label className="text-sm font-medium dark:text-gray-300">Restaurant Name *</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full p-2 mt-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>

                    {/* SLUG */}
                    <div>
                        <label className="text-sm font-medium dark:text-gray-300">Slug *</label>
                        <input
                            name="slug"
                            value={form.slug}
                            onChange={handleChange}
                            placeholder="saifs-kitchen"
                            className="w-full p-2 mt-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>

                    {/* LOGO UPLOAD */}
                    <div className="md:col-span-2">
                        <ImageUpload
                            label="Restaurant Logo"
                            value={form.logo}
                            onChange={(url) => setForm({ ...form, logo: url })}
                        />
                    </div>

                    {/* META PIXEL */}
                    <div>
                        <label className="text-sm font-medium dark:text-gray-300">Meta Pixel ID</label>
                        <input
                            name="metaPixelId"
                            value={form.metaPixelId}
                            onChange={handleChange}
                            className="w-full p-2 mt-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>

                    {/* STATUS */}
                    <div>
                        <label className="text-sm font-medium dark:text-gray-300">Status</label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full p-2 mt-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        >
                            {STATUS_OPTIONS.map((st) => (
                                <option key={st} value={st}>
                                    {st}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* SUBSCRIPTION */}
                    <div>
                        <label className="text-sm font-medium dark:text-gray-300">Subscription</label>
                        <select
                            name="subscription"
                            value={form.subscription}
                            onChange={handleChange}
                            className="w-full p-2 mt-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        >
                            {SUBSCRIPTION_OPTIONS.map((sub) => (
                                <option key={sub} value={sub}>
                                    {sub}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* DESCRIPTION */}
                <div className="mt-4">
                    <label className="text-sm font-medium dark:text-gray-300">Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-2 mt-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    />
                </div>

                {/* SOCIAL LINKS */}
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div>
                        <label className="text-xs text-gray-500 font-medium">Facebook URL</label>
                        <input
                            name="facebookUrl"
                            value={form.facebookUrl}
                            onChange={handleChange}
                            placeholder="Facebook URL"
                            className="w-full p-2 mt-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 font-medium">Instagram URL</label>
                        <input
                            name="instagramUrl"
                            value={form.instagramUrl}
                            onChange={handleChange}
                            placeholder="Instagram URL"
                            className="w-full p-2 mt-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 font-medium">TikTok URL</label>
                        <input
                            name="tiktokUrl"
                            value={form.tiktokUrl}
                            onChange={handleChange}
                            placeholder="TikTok URL"
                            className="w-full p-2 mt-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>
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
                        onClick={() => router.push("/restaurants")}
                        className="px-6 py-2 rounded border dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
