"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { ArrowLeft } from "lucide-react";
import ImageUpload from "@/components/common/ImageUpload";

const STATUS_OPTIONS = ["PENDING", "ACTIVE", "SUSPENDED"];
const SUBSCRIPTION_OPTIONS = [
  "FREE",
  "BASIC",
  "PREMIUM",
  "ENTERPRISE",
];

export default function AddRestaurantPage() {
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
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/restaurants", {
        ...form,
      });

      router.push("/restaurants");
    } catch (err: any) {
      console.error("Create restaurant failed", err);
      setError("Failed to create restaurant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 dark:bg-gray-900">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/restaurants")}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
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
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md"
      >
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 dark:bg-red-900/30 p-3 rounded">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {/* NAME */}
          <div>
            <label className="text-sm">Restaurant Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-2 mt-1 border rounded dark:bg-gray-700"
            />
          </div>

          {/* SLUG */}
          <div>
            <label className="text-sm">Slug *</label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="saifs-kitchen"
              className="w-full p-2 mt-1 border rounded dark:bg-gray-700"
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
            <label className="text-sm">Meta Pixel ID</label>
            <input
              name="metaPixelId"
              value={form.metaPixelId}
              onChange={handleChange}
              className="w-full p-2 mt-1 border rounded dark:bg-gray-700"
            />
          </div>

          {/* STATUS */}
          <div>
            <label className="text-sm">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full p-2 mt-1 border rounded dark:bg-gray-700"
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
            <label className="text-sm">Subscription</label>
            <select
              name="subscription"
              value={form.subscription}
              onChange={handleChange}
              className="w-full p-2 mt-1 border rounded dark:bg-gray-700"
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
          <label className="text-sm">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 mt-1 border rounded dark:bg-gray-700"
          />
        </div>

        {/* SOCIAL LINKS */}
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <input
            name="facebookUrl"
            value={form.facebookUrl}
            onChange={handleChange}
            placeholder="Facebook URL"
            className="p-2 border rounded dark:bg-gray-700"
          />
          <input
            name="instagramUrl"
            value={form.instagramUrl}
            onChange={handleChange}
            placeholder="Instagram URL"
            className="p-2 border rounded dark:bg-gray-700"
          />
          <input
            name="tiktokUrl"
            value={form.tiktokUrl}
            onChange={handleChange}
            placeholder="TikTok URL"
            className="p-2 border rounded dark:bg-gray-700"
          />
        </div>

        {/* ACTIONS */}
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            {loading ? "Creating..." : "Create Restaurant"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/restaurants")}
            className="px-6 py-2 rounded border dark:border-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
