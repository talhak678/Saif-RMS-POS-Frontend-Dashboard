"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";
import { ArrowLeft, Save, ChefHat, Scale } from "lucide-react";
import Link from "next/link";

function AddRecipeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedMenuItemId = searchParams.get("menuItemId") || "";

  // Data Lists
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    menuItemId: preSelectedMenuItemId,
    ingredientId: "",
    quantity: "",
  });

  // Helper to show unit based on selected ingredient
  const selectedIngredientUnit = ingredients.find(i => i.id === formData.ingredientId)?.unit || "";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [menuRes, ingRes] = await Promise.all([
          api.get("/menu-items"),
          api.get("/ingredients")
        ]);

        if (menuRes.data?.success) setMenuItems(menuRes.data.data);
        if (ingRes.data?.success) setIngredients(ingRes.data.data);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/recipes", {
        menuItemId: formData.menuItemId,
        ingredientId: formData.ingredientId,
        quantity: parseFloat(formData.quantity)
      });
      router.push("/recipes");
    } catch (error) {
      console.error("Create failed", error);
      alert("Failed to add recipe item.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-blend-lighten backdrop-blur-2xl dark:bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/recipes"
            className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Add Recipe Ingredient
          </h1>
        </div>

        {/* Card Form */}
        <div className="bg-blend backdrop-blur-2xl dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Decorative Top Bar */}
          <div className="h-2 bg-gradient-to-r from-orange-400 to-red-500"></div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {/* Menu Item Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <ChefHat size={18} className="text-orange-500"/> Select Menu Item
              </label>
              <select
                required
                value={formData.menuItemId}
                onChange={(e) => setFormData({ ...formData, menuItemId: e.target.value })}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              >
                <option value="" disabled>Choose a Dish...</option>
                {menuItems.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Ingredient Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Scale size={18} className="text-blue-500"/> Ingredient
                </label>
                <select
                  required
                  value={formData.ingredientId}
                  onChange={(e) => setFormData({ ...formData, ingredientId: e.target.value })}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="" disabled>Select Ingredient...</option>
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                  ))}
                </select>
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Quantity Required
                </label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    step="0.001"
                    placeholder="0.00"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500 transition-all font-mono"
                  />
                  {selectedIngredientUnit && (
                    <span className="absolute right-4 top-3 text-sm font-medium text-gray-400">
                      {selectedIngredientUnit}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Link
                href="/recipes"
                className="px-6 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold shadow-lg shadow-orange-200 dark:shadow-none hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? "Saving..." : <><Save size={20} /> Save Recipe</>}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default function AddRecipePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <AddRecipeForm />
    </Suspense>
  );
}