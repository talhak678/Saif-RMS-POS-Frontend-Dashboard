"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { ArrowLeft } from "lucide-react";
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

export default function AddRestaurantPage() {
    const { user, loadingUser } = useAuth();
    const isSuperAdmin = user?.role?.name === 'SUPER_ADMIN';
    const router = useRouter();

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
        customDomain: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Per-field social URL errors
    const [socialErrors, setSocialErrors] = useState({
        facebookUrl: "",
        instagramUrl: "",
        tiktokUrl: "",
    });

    const validateSocialUrl = (
        field: "facebookUrl" | "instagramUrl" | "tiktokUrl",
        value: string
    ): string => {
        if (!value) return ""; // optional – empty is fine
        try { new URL(value); } catch { return "Please enter a valid URL (e.g. https://...)"; }
        const rules: Record<string, { domain: string; label: string }> = {
            facebookUrl: { domain: "facebook.com", label: "Facebook" },
            instagramUrl: { domain: "instagram.com", label: "Instagram" },
            tiktokUrl: { domain: "tiktok.com", label: "TikTok" },
        };
        const { domain, label } = rules[field];
        if (!value.includes(domain))
            return `URL must be a valid ${label} link (must contain ${domain})`;
        return "";
    };

    useEffect(() => {
        if (!loadingUser && user && !isSuperAdmin) {
            toast.error("Access denied. Only Super Admins can add restaurants.");
            router.push("/restaurants");
        }
    }, [user, loadingUser, isSuperAdmin, router]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        // Real-time social URL validation
        if (name === "facebookUrl" || name === "instagramUrl" || name === "tiktokUrl") {
            setSocialErrors(prev => ({ ...prev, [name]: validateSocialUrl(name as any, value) }));
        }
    };

    const validate = () => {
        if (!form.name || form.name.length < 2)
            return "Restaurant name must be at least 2 characters";
        if (!form.slug || form.slug.length < 2)
            return "Slug must be at least 2 characters";

        const fbErr = validateSocialUrl("facebookUrl", form.facebookUrl);
        const igErr = validateSocialUrl("instagramUrl", form.instagramUrl);
        const ttErr = validateSocialUrl("tiktokUrl", form.tiktokUrl);
        if (fbErr || igErr || ttErr) {
            setSocialErrors({ facebookUrl: fbErr, instagramUrl: igErr, tiktokUrl: ttErr });
            return "Please fix the social media URL errors below";
        }
        return "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const res = await api.post("/restaurants", {
                ...form,
            });

            if (res.data?.success) {
                toast.success("Restaurant created successfully");
                router.push("/restaurants");
            } else {
                const msg = res.data?.message || "Failed to create restaurant";
                setError(msg);
                toast.error(msg);
            }
        } catch (err: any) {
            console.error("Create restaurant failed", err);
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to create restaurant";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (loadingUser) {
        return (
            <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
                <div className="text-gray-400">Checking permissions...</div>
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
                    Add Restaurant
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

                    {/* CUSTOM DOMAIN */}
                    <div>
                        <label className="text-sm font-medium dark:text-gray-300">Custom Domain / URL</label>
                        <input
                            name="customDomain"
                            value={form.customDomain}
                            onChange={handleChange}
                            placeholder="alshaikhmandi.vercel.app"
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
                    {/* Facebook */}
                    <div>
                        <label className="text-xs text-gray-500 font-medium">Facebook URL</label>
                        <input
                            name="facebookUrl"
                            value={form.facebookUrl}
                            onChange={handleChange}
                            placeholder="https://facebook.com/yourpage"
                            className={`w-full p-2 mt-1 border rounded dark:bg-gray-700 dark:text-gray-200 transition-colors ${socialErrors.facebookUrl
                                ? "border-red-500 dark:border-red-500 focus:ring-red-400"
                                : "dark:border-gray-600"
                                }`}
                        />
                        {socialErrors.facebookUrl && (
                            <p className="mt-1 text-xs text-red-500">{socialErrors.facebookUrl}</p>
                        )}
                    </div>
                    {/* Instagram */}
                    <div>
                        <label className="text-xs text-gray-500 font-medium">Instagram URL</label>
                        <input
                            name="instagramUrl"
                            value={form.instagramUrl}
                            onChange={handleChange}
                            placeholder="https://instagram.com/yourpage"
                            className={`w-full p-2 mt-1 border rounded dark:bg-gray-700 dark:text-gray-200 transition-colors ${socialErrors.instagramUrl
                                ? "border-red-500 dark:border-red-500 focus:ring-red-400"
                                : "dark:border-gray-600"
                                }`}
                        />
                        {socialErrors.instagramUrl && (
                            <p className="mt-1 text-xs text-red-500">{socialErrors.instagramUrl}</p>
                        )}
                    </div>
                    {/* TikTok */}
                    <div>
                        <label className="text-xs text-gray-500 font-medium">TikTok URL</label>
                        <input
                            name="tiktokUrl"
                            value={form.tiktokUrl}
                            onChange={handleChange}
                            placeholder="https://tiktok.com/@yourpage"
                            className={`w-full p-2 mt-1 border rounded dark:bg-gray-700 dark:text-gray-200 transition-colors ${socialErrors.tiktokUrl
                                ? "border-red-500 dark:border-red-500 focus:ring-red-400"
                                : "dark:border-gray-600"
                                }`}
                        />
                        {socialErrors.tiktokUrl && (
                            <p className="mt-1 text-xs text-red-500">{socialErrors.tiktokUrl}</p>
                        )}
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="mt-6 flex gap-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create Restaurant"}
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
