"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";

export default function EditSettingModal({
  setting, // Agar null hai, matlab "Add New" mode hai
  onClose,
  onUpdated,
  defaultRestaurantId, // Parent se ID aayegi
}: any) {
  // State for form data
  const [formData, setFormData] = useState({
    key: "",
    value: "",
  });
  const [loading, setLoading] = useState(false);

  // Jab modal khule, check karo k edit hai ya new
  useEffect(() => {
    if (setting) {
      setFormData({ key: setting.key, value: setting.value });
    } else {
      setFormData({ key: "", value: "" }); // Reset for new entry
    }
  }, [setting]);

  const handleSave = async () => {
    try {
      setLoading(true);

      if (setting?.id) {
        // === UPDATE (PUT) ===
        await api.put(`/settings/${setting.id}`, {
          value: formData.value,
        });
      } else {
        // === CREATE (POST) ===
        await api.post("/settings", {
          key: formData.key,
          value: formData.value,
          restaurantId: defaultRestaurantId,
        });
      }

      onUpdated();
      onClose();
    } catch (error) {
      console.error("Error saving setting:", error);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!setting; // Boolean check

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-5 dark:text-gray-200">
          {isEditing ? "Edit Setting" : "Add New Setting"}
        </h2>

        {/* KEY INPUT */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Key
          </label>
          <input
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            disabled={isEditing} // Edit mode me disable rahega
            placeholder="e.g. tax_rate"
            className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all 
              ${
                isEditing
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-700/50"
                  : "bg-white dark:bg-gray-700 dark:text-white"
              } dark:border-gray-600`}
          />
          {!isEditing && (
            <p className="text-xs text-gray-400 mt-1">
              Key cannot be changed once created.
            </p>
          )}
        </div>

        {/* VALUE INPUT */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Value
          </label>
          <input
            value={formData.value}
            onChange={(e) =>
              setFormData({ ...formData, value: e.target.value })
            }
            placeholder="e.g. 16"
            className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !formData.key || !formData.value}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}