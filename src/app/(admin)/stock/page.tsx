"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import {
  Eye,
  Package,
  RefreshCcw,
  Save,
  X,
  Store,
  Plus
} from "lucide-react";
import { ViewDetailModal } from "@/components/ViewDetailModal";
import { ProtectedRoute } from "@/services/protected-route";

export default function StocksPage() {
  // --- MAIN STATES ---
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // --- VIEW DETAILS MODAL ---
  const [viewStock, setViewStock] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // --- MODAL STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'ADD' | 'UPDATE'>('ADD');

  // Form Data
  const [ingredientId, setIngredientId] = useState<string>("");
  const [quantity, setQuantity] = useState<string | number>("");
  const [selectedIngredientName, setSelectedIngredientName] = useState<string>(""); // Display name for Update mode
  const [selectedIngredientUnit, setSelectedIngredientUnit] = useState<string>(""); // Unit display

  // Data for Dropdown
  const [ingredientsList, setIngredientsList] = useState<any[]>([]);
  const [updateLoading, setUpdateLoading] = useState(false);

  // --- 1. FETCH BRANCHES ---
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get("/branches");
        if (res.data?.success) {
          setBranches(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedBranchId(res.data.data[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch branches", error);
      }
    };
    fetchBranches();
  }, []);

  // --- 2. FETCH STOCKS ---
  useEffect(() => {
    if (selectedBranchId) {
      fetchStocks();
    }
  }, [selectedBranchId]);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/stocks?branchId=${selectedBranchId}`);
      if (res.data?.success) {
        setStocks(res.data.data);
      } else {
        setStocks([]);
      }
    } catch (error) {
      console.error("Failed to fetch stocks", error);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. FETCH INGREDIENTS (For Dropdown) ---
  const fetchIngredients = async () => {
    try {
      const res = await api.get("/ingredients");
      if (res.data?.success) {
        setIngredientsList(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch ingredients", error);
    }
  };

  // --- HANDLERS ---

  // Open "Add Stock" Modal
  const openAddModal = async () => {
    setModalMode('ADD');
    setIngredientId(""); // Reset selection
    setQuantity("");
    setSelectedIngredientUnit("");

    // Fetch ingredients agar pehle nahi kiye
    if (ingredientsList.length === 0) {
      await fetchIngredients();
    }

    setIsModalOpen(true);
  };

  // Open "Update Stock" Modal
  const openUpdateModal = (stockItem: any) => {
    setModalMode('UPDATE');
    setIngredientId(stockItem.ingredientId);
    setSelectedIngredientName(stockItem.ingredient?.name);
    setSelectedIngredientUnit(stockItem.ingredient?.unit);
    setQuantity(stockItem.quantity);
    setIsModalOpen(true);
  };

  // Handle Dropdown Change (to set unit dynamically)
  const handleIngredientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setIngredientId(id);
    const ing = ingredientsList.find(i => i.id === id);
    if (ing) setSelectedIngredientUnit(ing.unit);
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranchId || !ingredientId) return;

    setUpdateLoading(true);
    try {
      // Upsert API Call
      await api.post("/stocks", {
        branchId: selectedBranchId,
        ingredientId: ingredientId,
        quantity: parseFloat(quantity.toString()),
      });

      setIsModalOpen(false);
      fetchStocks(); // Refresh Table
    } catch (error) {
      console.error("Operation failed", error);
      alert("Failed to save stock.");
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <ProtectedRoute module="inventory-recipes:stock">
      <div className="min-h-screen p-3 md:p-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl dark:text-gray-200">

        {/* HEADER & CONTROLS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Package className="text-blue-600" />
              Stock Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage inventory for your branches.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Branch Selector */}
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border dark:border-gray-700">
              <Store size={18} className="text-gray-500" />
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-transparent outline-none text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[180px]"
              >
                <option value="" disabled>Select a Branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Add Stock Button */}
            <button
              onClick={openAddModal}
              disabled={!selectedBranchId}
              className="bg-button backdrop-blur-xs outline-1 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Add Stock
            </button>
          </div>
        </div>

        {/* STOCKS TABLE */}
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 tracking-widers">
              <tr>
                <th className="px-6 py-3 text-left">Ingredient</th>
                <th className="px-6 py-3 text-left">Current Stock</th>
                <th className="px-6 py-3 text-left">Last Updated</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-500">
                    Loading stocks...
                  </td>
                </tr>
              ) : stocks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-500">
                    No stock data found. Click "Add Stock" to begin.
                  </td>
                </tr>
              ) : (
                stocks.map((stock: any) => (
                  <tr
                    key={stock.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                      {stock.ingredient?.name}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${stock.quantity < 10
                        ? "bg-red-100 text-red-800 border-red-200"
                        : "bg-green-100 text-green-800 border-green-200"
                        }`}>
                        {stock.quantity} {stock.ingredient?.unit}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                      {new Date(stock.updatedAt).toLocaleString()}
                    </td>

                    <td className="px-6 py-4 flex items-center gap-2">
                      <button
                        onClick={() => openUpdateModal(stock)}
                        className="text-xs px-3 py-1.5 rounded bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center gap-1 transition-colors"
                      >
                        <RefreshCcw size={12} /> Update
                      </button>
                      <button
                        onClick={() => {
                          setViewStock(stock);
                          setIsViewModalOpen(true);
                        }}
                        className="p-1.5 rounded transition-colors hover:bg-gray-100 text-gray-500 dark:hover:bg-gray-700"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- ADD / UPDATE MODAL --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm border dark:border-gray-700 animate-in fade-in zoom-in duration-200">

              <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {modalMode === 'ADD' ? "Add Stock" : "Update Stock"}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">

                {/* Ingredient Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ingredient
                  </label>

                  {modalMode === 'UPDATE' ? (
                    // Update Mode: Read-only Text
                    <div className="w-full p-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 font-medium">
                      {selectedIngredientName}
                    </div>
                  ) : (
                    // Add Mode: Dropdown
                    <select
                      required
                      value={ingredientId}
                      onChange={handleIngredientSelect}
                      className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="" disabled>Select Ingredient</option>
                      {ingredientsList.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} ({ing.unit})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Quantity Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity {selectedIngredientUnit ? `(${selectedIngredientUnit})` : ""}
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="e.g. 50"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 shadow-md"
                  >
                    {updateLoading ? "Saving..." : <><Save size={16} /> Save Stock</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW DETAIL MODAL */}
        <ViewDetailModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Stock Details"
          data={viewStock}
          fields={[
            { label: "Ingredient", render: (data: any) => data?.ingredient?.name },
            { label: "Measuring Unit", render: (data: any) => data?.ingredient?.unit },
            { label: "Current Quantity", key: "quantity" },
            { label: "Branch", render: (data: any) => data?.branch?.name },
            { label: "Last Updated", render: (data: any) => new Date(data?.updatedAt).toLocaleString() },
            { label: "Stock ID", key: "id" },
            { label: "Ingredient ID", key: "ingredientId" },
          ]}
        />
      </div>
    </ProtectedRoute>
  );
}
