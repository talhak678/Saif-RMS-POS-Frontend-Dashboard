"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";
import { ArrowLeft, Plus, Trash2, Save, Image as ImageIcon, Layers, PlusCircle } from "lucide-react";
import Link from "next/link";
import ImageUpload from "@/components/common/ImageUpload";

function AddItemForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL se categoryId uthana (agar mojood ho)
  const preSelectedCategoryId = searchParams.get("categoryId") || "";

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // For Categories fetching
  const [submitLoading, setSubmitLoading] = useState(false); // For Form Submit

  // Form Data State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    categoryId: preSelectedCategoryId,
    isAvailable: true,
    variations: [] as { name: string; price: string }[],
    addons: [] as { name: string; price: string }[],
  });

  // 1. Categories Fetch karna (Dropdown ke liye)
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await api.get("/categories");
        if (res.data?.success) {
          setCategories(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Update categoryId if URL param changes (optional safety)
  useEffect(() => {
    if (preSelectedCategoryId) {
      setFormData(prev => ({ ...prev, categoryId: preSelectedCategoryId }));
    }
  }, [preSelectedCategoryId]);

  // --- VARIATIONS LOGIC ---
  const addVariation = () => {
    setFormData({
      ...formData,
      variations: [...formData.variations, { name: "", price: "" }],
    });
  };

  const removeVariation = (index: number) => {
    const newVars = [...formData.variations];
    newVars.splice(index, 1);
    setFormData({ ...formData, variations: newVars });
  };

  const handleVariationChange = (index: number, field: string, value: string) => {
    const newVars: any = [...formData.variations];
    newVars[index][field] = value;
    setFormData({ ...formData, variations: newVars });
  };

  // --- ADDONS LOGIC ---
  const addAddon = () => {
    setFormData({
      ...formData,
      addons: [...formData.addons, { name: "", price: "" }],
    });
  };

  const removeAddon = (index: number) => {
    const newAddons = [...formData.addons];
    newAddons.splice(index, 1);
    setFormData({ ...formData, addons: newAddons });
  };

  const handleAddonChange = (index: number, field: string, value: string) => {
    const newAddons: any = [...formData.addons];
    newAddons[index][field] = value;
    setFormData({ ...formData, addons: newAddons });
  };

  // --- SUBMIT LOGIC ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      // Data format conversion (Strings to Numbers)
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image: formData.image,
        categoryId: formData.categoryId,
        isAvailable: formData.isAvailable,
        variations: formData.variations.map((v) => ({
          name: v.name,
          price: parseFloat(v.price) || 0,
        })),
        addons: formData.addons.map((a) => ({
          name: a.name,
          price: parseFloat(a.price) || 0,
        })),
      };

      await api.post("/menu-items", payload);
      router.push("/items"); // Redirect back to list
    } catch (error) {
      console.error("Failed to create item", error);
      alert("Error creating item. Please check console.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-blend backdrop-blur-1xl dark:bg-gray-900">
      <div className="max-w-screen mx-auto">

        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/items"
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Add New Menu Item
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 dark:text-white border-b dark:border-gray-700 pb-2">
              Basic Information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">

              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Item Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Chicken Biryani"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="" disabled>Select a Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {loading && <span className="text-xs text-blue-500">Loading categories...</span>}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Base Price (Rs.) *
                </label>
                <input
                  required
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Short description of the food item..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                />
              </div>

              {/* Image Upload */}
              <div className="md:col-span-2">
                <ImageUpload
                  label="Item Image"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                />
              </div>

            </div>
          </div>

          {/* --- SECTION 2: VARIATIONS --- */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-2">
              <h2 className="text-lg font-semibold dark:text-white flex items-center gap-2">
                <Layers size={18} className="text-blue-500" /> Variations <span className="text-xs font-normal text-gray-400">(Optional)</span>
              </h2>
              <button
                type="button"
                onClick={addVariation}
                className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus size={16} /> Add Variation
              </button>
            </div>

            <div className="space-y-3">
              {formData.variations.map((item, index) => (
                <div key={index} className="flex gap-3 items-end animate-in fade-in slide-in-from-top-1">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Name (e.g. Small)</label>
                    <input
                      type="text"
                      placeholder="Variation Name"
                      value={item.name}
                      onChange={(e) => handleVariationChange(index, "name", e.target.value)}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="w-32">
                    <label className="text-xs text-gray-500 mb-1 block">Price</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={item.price}
                      onChange={(e) => handleVariationChange(index, "price", e.target.value)}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariation(index)}
                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {formData.variations.length === 0 && (
                <p className="text-sm text-gray-400 italic text-center py-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-dashed dark:border-gray-700">
                  No variations added yet.
                </p>
              )}
            </div>
          </div>

          {/* --- SECTION 3: ADDONS --- */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-2">
              <h2 className="text-lg font-semibold dark:text-white flex items-center gap-2">
                <PlusCircle size={18} className="text-purple-500" /> Addons <span className="text-xs font-normal text-gray-400">(Optional)</span>
              </h2>
              <button
                type="button"
                onClick={addAddon}
                className="text-sm flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium bg-purple-50 dark:bg-purple-900/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus size={16} /> Add Addon
              </button>
            </div>

            <div className="space-y-3">
              {formData.addons.map((item, index) => (
                <div key={index} className="flex gap-3 items-end animate-in fade-in slide-in-from-top-1">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Name (e.g. Extra Cheese)</label>
                    <input
                      type="text"
                      placeholder="Addon Name"
                      value={item.name}
                      onChange={(e) => handleAddonChange(index, "name", e.target.value)}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="w-32">
                    <label className="text-xs text-gray-500 mb-1 block">Price</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={item.price}
                      onChange={(e) => handleAddonChange(index, "price", e.target.value)}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAddon(index)}
                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {formData.addons.length === 0 && (
                <p className="text-sm text-gray-400 italic text-center py-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-dashed dark:border-gray-700">
                  No addons added yet.
                </p>
              )}
            </div>
          </div>

          {/* --- FOOTER ACTIONS --- */}
          <div className="flex justify-end gap-4 pt-4 pb-20">
            <Link
              href="/menu-items"
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitLoading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitLoading ? (
                "Creating..."
              ) : (
                <>
                  <Save size={18} /> Create Item
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

import { ProtectedRoute } from "@/services/protected-route";

// Suspense Wrapper for Search Params
export default function AddItemPage() {
  return (
    <ProtectedRoute module="menu-management:items">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
          <div className="text-gray-500 animate-pulse">Loading Form...</div>
        </div>
      }>
        <AddItemForm />
      </Suspense>
    </ProtectedRoute>
  );
}