"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Pencil, Trash2, Plus } from "lucide-react";
import EditSettingModal from "./EditSettingModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

export default function SettingsPage() {
    const [settings, setSettings] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get("/settings");
            if (res.data?.success) setSettings(res.data.data);
            else if (Array.isArray(res.data)) setSettings(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            await api.delete(`/settings/${deleteId}`);
            setDeleteId(null);
            fetchSettings();
        } finally {
            setLoading(false);
        }
    };

    // Open Modal for Add (Create)
    const handleAddClick = () => {
        setSelected(null);
        setIsModalOpen(true);
    };

    // Open Modal for Edit (Update)
    const handleEditClick = (setting: any) => {
        setSelected(setting);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen p-6 dark:bg-gray-900 bg-transparent">

            {/* --- NEW HEADER UI (Transparent/Glassy Style) --- */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-300">
                    Settings
                </h1>

                <button
                    onClick={handleAddClick}
                    className="bg-button backdrop-blur-xs outline-1 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                    <Plus size={16} />
                    Add Setting
                </button>
            </div>

            {/* Settings List */}
            <div className="space-y-3">
                {settings.map((s) => (
                    <div
                        key={s.id}
                        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4"
                    >
                        <div className="flex-1 w-full">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 px-2 py-0.5 rounded">
                                    {s.key}
                                </span>
                                {s.restaurant?.name && (
                                    <span className="text-xs text-gray-400">• {s.restaurant.name}</span>
                                )}
                            </div>
                            <p className="text-lg font-medium dark:text-gray-200 break-all">
                                {s.value}
                            </p>
                        </div>

                        <div className="flex gap-2 self-end md:self-center">
                            <button
                                onClick={() => handleEditClick(s)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-blue-600 transition-colors"
                            >
                                <Pencil size={18} />
                            </button>
                            <button
                                onClick={() => setDeleteId(s.id)}
                                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {settings.length === 0 && (
                    <div className="text-center py-10 text-gray-500">No settings found.</div>
                )}
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <EditSettingModal
                    setting={selected}
                    onClose={() => setIsModalOpen(false)}
                    onUpdated={() => {
                        fetchSettings();
                        setIsModalOpen(false);
                    }}
                    // Hardcoded ID 
                    defaultRestaurantId="cmljaoung000fv5w8os1foeb2"
                />
            )}

            {/* DELETE CONFIRM */}
            {deleteId && (
                <DeleteConfirmModal
                    loading={loading}
                    onCancel={() => setDeleteId(null)}
                    onConfirm={handleDelete}
                />
            )}
        </div>
    );
}