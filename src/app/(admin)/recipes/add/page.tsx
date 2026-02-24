"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";
import { ArrowLeft, Save, ChefHat, Scale, Plus, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Loader from "@/components/common/Loader";

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

  // Ingredient Modal State
  const [isIngModalOpen, setIsIngModalOpen] = useState(false);
  const [newIngData, setNewIngData] = useState({ name: "", unit: "" });
  const [ingLoading, setIngLoading] = useState(false);

  // Helper to show unit based on selected ingredient
  const selectedIngredientUnit = ingredients.find(i => i.id === formData.ingredientId)?.unit || "";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [menuRes, ingRes] = await Promise.all([
        api.get("/menu-items"),
        api.get("/ingredients")
      ]);

      if (menuRes.data?.success) setMenuItems(menuRes.data.data);
      if (ingRes.data?.success) {
        const sorted = ingRes.data.data.sort((a: any, b: any) => a.name.localeCompare(b.name));
        setIngredients(sorted);
      }
    } catch (error) {
      console.error("Failed to load data", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleNewIngredientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIngLoading(true);
    try {
      const res = await api.post("/ingredients", newIngData);
      if (res.data?.success) {
        toast.success("Ingredient created");
        const created = res.data.data;
        // Update local list
        setIngredients(prev => [...prev, created].sort((a: any, b: any) => a.name.localeCompare(b.name)));
        // Select it automatically
        setFormData(prev => ({ ...prev, ingredientId: created.id }));
        setIsIngModalOpen(false);
        setNewIngData({ name: "", unit: "" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create ingredient");
    } finally {
      setIngLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/recipes", {
        menuItemId: formData.menuItemId,
        ingredientId: formData.ingredientId,
        quantity: parseFloat(formData.quantity)
      });
      toast.success("Recipe item added successfully");
      router.push("/recipes");
    } catch (error) {
      console.error("Create failed", error);
      toast.error("Failed to add recipe item.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900/60">
        <Loader size="md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl flex items-center justify-center">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            href="/recipes"
            className="p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Add Recipe Ingredient
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Assign ingredients to your menu dishes.</p>
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden relative">

          <form onSubmit={handleSubmit} className="p-8 space-y-8">

            {/* Menu Item Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 ml-1">
                <ChefHat size={14} className="text-brand-600" /> Select Menu Item
              </label>
              <select
                required
                value={formData.menuItemId}
                onChange={(e) => setFormData({ ...formData, menuItemId: e.target.value })}
                className="w-full p-4 border border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium text-sm"
              >
                <option value="" disabled>Choose a Dish...</option>
                {menuItems.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Ingredient Selection */}
              <div className="space-y-3">
                <div className="flex justify-between items-center ml-1">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Scale size={14} className="text-brand-600" /> Ingredient
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsIngModalOpen(true)}
                    className="text-[10px] font-black uppercase text-brand-600 hover:underline flex items-center gap-0.5"
                  >
                    <Plus size={10} strokeWidth={3} /> New
                  </button>
                </div>
                <select
                  required
                  value={formData.ingredientId}
                  onChange={(e) => setFormData({ ...formData, ingredientId: e.target.value })}
                  className="w-full p-4 border border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium text-sm"
                >
                  <option value="" disabled>Select Ingredient...</option>
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                  ))}
                </select>
              </div>

              {/* Quantity Input */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">
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
                    className="w-full p-4 border border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 transition-all font-mono font-bold"
                  />
                  {selectedIngredientUnit && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-brand-600 bg-brand-50 dark:bg-brand-900/30 px-2 py-1 rounded-md">
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
                className="px-6 py-3.5 rounded-2xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 font-bold text-sm transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-10 py-3.5 bg-brand-600 text-white rounded-2xl font-bold shadow-xl shadow-brand-100 dark:shadow-none hover:bg-brand-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {submitting ? <Loader size="sm" className="space-y-0" /> : <><Save size={18} /> Save Recipe</>}
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* QUICK ADD INGREDIENT MODAL */}
      {isIngModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-tight">New Ingredient</h2>
                <p className="text-[10px] text-gray-500 font-medium tracking-tight">Add to global inventory</p>
              </div>
              <button onClick={() => setIsIngModalOpen(false)} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleNewIngredientSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Potatoes, Flour"
                  value={newIngData.name}
                  onChange={(e) => setNewIngData({ ...newIngData, name: e.target.value })}
                  className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Base Unit</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. kg, gram, pcs"
                  value={newIngData.unit}
                  onChange={(e) => setNewIngData({ ...newIngData, unit: e.target.value })}
                  className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsIngModalOpen(false)}
                  className="flex-1 px-4 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ingLoading}
                  className="flex-[2] bg-brand-600 text-white font-bold py-3 rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 dark:shadow-none text-sm flex justify-center items-center"
                >
                  {ingLoading ? <Loader size="sm" className="space-y-0" /> : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddRecipePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center"><Loader size="md" /></div>}>
      <AddRecipeForm />
    </Suspense>
  );
}
