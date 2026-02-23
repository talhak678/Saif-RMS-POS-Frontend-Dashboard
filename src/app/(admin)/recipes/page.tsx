"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import {
  Plus,
  Trash2,
  ChefHat,
  Utensils,
  Scale,
  AlertTriangle,
  Search
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ProtectedRoute } from "@/services/protected-route";
import Loader from "@/components/common/Loader";

// Types
interface RecipeItem {
  id: string;
  quantity: number;
  ingredient: {
    id: string;
    name: string;
    unit: string;
  };
}

interface MenuRecipeGroup {
  menuItemId: string;
  menuItemName: string;
  menuItemImage: string;
  menuItemPrice: string | number;
  ingredients: RecipeItem[];
}

export default function RecipesPage() {
  const [recipeGroups, setRecipeGroups] = useState<MenuRecipeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/recipes");
      if (res.data?.success) {
        // Data ko Menu Item ke hisaab se Group karna
        const grouped: Record<string, MenuRecipeGroup> = {};

        res.data.data.forEach((item: any) => {
          if (!grouped[item.menuItemId]) {
            grouped[item.menuItemId] = {
              menuItemId: item.menuItemId,
              menuItemName: item.menuItem?.name || "Unknown Item",
              menuItemImage: item.menuItem?.image || "",
              menuItemPrice: item.menuItem?.price,
              ingredients: []
            };
          }
          grouped[item.menuItemId].ingredients.push({
            id: item.id,
            quantity: item.quantity,
            ingredient: item.ingredient
          });
        });

        setRecipeGroups(Object.values(grouped));
      }
    } catch (error) {
      console.error("Failed to fetch recipes", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/recipes/${deleteId}`);
      setDeleteId(null);
      fetchRecipes(); // Refresh
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete recipe item");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <Loader size="md" />
      </div>
    );
  }

  return (
    <ProtectedRoute module="inventory-recipes:recipes">
      <div className="min-h-screen p-4 md:p-8 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
              <ChefHat className="text-brand-600 w-8 h-8" />
              Recipe Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Define ingredients and quantities for your menu items.
            </p>
          </div>
          <Link
            href="/recipes/add"
            className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-100 dark:shadow-none flex items-center gap-2"
          >
            <Plus size={20} /> Add Recipe Item
          </Link>
        </div>

        {/* RECIPE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {recipeGroups.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No recipes defined yet.</p>
            </div>
          ) : (
            recipeGroups.map((group) => (
              <div
                key={group.menuItemId}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col"
              >
                {/* Card Header (Image & Title) */}
                <div className="relative h-32 bg-gray-100 dark:bg-gray-700">
                  {group.menuItemImage ? (
                    <img
                      src={group.menuItemImage}
                      alt={group.menuItemName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Utensils size={32} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                    <h2 className="text-white text-xl font-bold truncate shadow-sm">
                      {group.menuItemName}
                    </h2>
                  </div>
                </div>

                {/* Ingredients List */}
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Ingredients Required</span>
                    <span className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-bold border border-brand-100 dark:bg-brand-900/30 dark:text-brand-300 dark:border-brand-800">
                      {group.ingredients.length} Items
                    </span>
                  </div>

                  <div className="space-y-3">
                    {group.ingredients.map((item) => (
                      <div key={item.id} className="flex justify-between items-center group/row p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-900/40 flex items-center justify-center text-brand-600 dark:text-brand-300">
                            <Scale size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              {item.ingredient.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.quantity} {item.ingredient.unit}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setDeleteId(item.id)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all opacity-0 group-hover/row:opacity-100"
                          title="Remove Ingredient"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <Link
                    href={`/recipes/add?menuItemId=${group.menuItemId}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 font-bold transition-colors"
                  >
                    <Plus size={16} /> Add More Ingredients
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DELETE CONFIRMATION MODAL */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in duration-200">
              <div className="w-14 h-14 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Remove Ingredient?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to remove this ingredient from the recipe?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2.5 border rounded-xl text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-md shadow-red-200 dark:shadow-none flex justify-center items-center"
                >
                  {deleteLoading ? <Loader size="sm" className="space-y-0" /> : "Remove"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}