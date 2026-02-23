"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Plus, ChevronDown, ChevronRight, ImageOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/services/protected-route";
import Loader from "@/components/common/Loader";

// Interface
interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: string | number;
    image: string;
    categoryId: string;
    category: {
        id: string;
        name: string;
    };
    variations: any[];
    addons: any[];
    isAvailable: boolean;
}

interface GroupedData {
    [key: string]: {
        info: { id: string; name: string; description?: string };
        items: MenuItem[];
    };
}

export default function MenuItemsPage() {
    const [groupedItems, setGroupedItems] = useState<GroupedData>({});
    const [loading, setLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const router = useRouter();

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        try {
            setLoading(true);
            const res = await api.get("/menu-items");

            if (res.data?.success) {
                const grouped: GroupedData = {};
                res.data.data.forEach((item: MenuItem) => {
                    const catId = item.category?.id || "uncategorized";
                    if (!grouped[catId]) {
                        grouped[catId] = {
                            info: item.category || { id: "uncategorized", name: "Uncategorized" },
                            items: []
                        };
                    }
                    grouped[catId].items.push(item);
                });
                setGroupedItems(grouped);
                setExpandedCategories(new Set(Object.keys(grouped)));
            }
        } catch (error) {
            console.error("Failed to fetch menu items", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (catId: string) => {
        const newSet = new Set(expandedCategories);
        if (newSet.has(catId)) {
            newSet.delete(catId);
        } else {
            newSet.add(catId);
        }
        setExpandedCategories(newSet);
    };

    // --- FIX IS HERE (Data Formatting) ---
    const handleToggleStatus = async (e: React.MouseEvent, item: MenuItem) => {
        e.stopPropagation();

        const newStatus = !item.isAvailable;
        const catId = item.category?.id || "uncategorized";

        // 1. UI Update
        setGroupedItems((prev) => {
            const newData = { ...prev };
            if (newData[catId]) {
                newData[catId].items = newData[catId].items.map((i) =>
                    i.id === item.id ? { ...i, isAvailable: newStatus } : i
                );
            }
            return newData;
        });

        try {
            // 2. Data Formatting (Strings -> Numbers)
            // Backend ko number chahiye, agar string "1200" gayi to error aayega
            const payload = {
                name: item.name,
                description: item.description,
                price: parseFloat(item.price.toString()), // Main Price fix
                image: item.image,
                categoryId: item.categoryId,
                isAvailable: newStatus,

                // Variations Fix: Map kar ke price ko number bana rahe hain
                variations: item.variations.map((v: any) => ({
                    // Agar purana variation hai to ID bhejein, nahi to sirf name/price
                    ...(v.id ? { id: v.id } : {}),
                    name: v.name,
                    price: parseFloat(v.price.toString())
                })),

                // Addons Fix: Same here
                addons: item.addons.map((a: any) => ({
                    ...(a.id ? { id: a.id } : {}),
                    name: a.name,
                    price: parseFloat(a.price.toString())
                })),
            };

            await api.put(`/menu-items/${item.id}`, payload);

        } catch (error) {
            console.error("Failed to update status", error);
            // Revert UI if failed
            setGroupedItems((prev) => {
                const newData = { ...prev };
                if (newData[catId]) {
                    newData[catId].items = newData[catId].items.map((i) =>
                        i.id === item.id ? { ...i, isAvailable: !newStatus } : i
                    );
                }
                return newData;
            });
            alert("Status update failed due to validation error.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center dark:bg-gray-900">
                <Loader size="md" />
            </div>
        );
    }

    return (
        <ProtectedRoute module="menu-management:items">
            <div className="max-w-[calc(98vw)] lg:max-w-[calc(78vw)] mx-auto p-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl my-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                        Menu Items
                    </h1>
                    <Link
                        href="/items/add"
                        className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-brand-100 dark:shadow-none"
                    >
                        <Plus size={18} />
                        Add New Item
                    </Link>
                </div>

                <div className="space-y-6">
                    {Object.keys(groupedItems).length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            No menu items found. Start by adding some!
                        </div>
                    ) : (
                        Object.values(groupedItems).map((group) => (
                            <div
                                key={group.info.id}
                                className="bg-blend-transparent dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                            >
                                {/* Category Header */}
                                <div
                                    className="p-4 flex items-center justify-between bg-gray-50/50 dark:bg-gray-700/30 cursor-pointer select-none"
                                    onClick={() => toggleCategory(group.info.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="text-gray-400">
                                            {expandedCategories.has(group.info.id) ? (
                                                <ChevronDown size={20} />
                                            ) : (
                                                <ChevronRight size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                                {group.info.name}
                                            </h2>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {group.items.length} items
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        <Link
                                            href={`/items/add?categoryId=${group.info.id}`}
                                            className="px-4 py-2 text-xs font-bold bg-brand-50 dark:bg-brand-900/20 border-2 border-brand-100 dark:border-brand-800/30 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-800/40 text-brand-700 dark:text-brand-400 flex items-center gap-1.5 transition-all"
                                        >
                                            <Plus size={14} />
                                            Add Item
                                        </Link>
                                    </div>
                                </div>

                                {/* Items Horizontal Scroll Area */}
                                {expandedCategories.has(group.info.id) && (
                                    <div className="p-4 overflow-x-auto pb-6">
                                        <div className="flex gap-4 min-w-min">
                                            {group.items.map((item) => {
                                                const isVeg = item.name.toLowerCase().includes("salad") || item.name.toLowerCase().includes("veg") || item.name.toLowerCase().includes("juice");

                                                return (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => router.push(`/items/${item.id}`)}
                                                        className={`group min-w-[300px] w-[300px] bg-white dark:bg-gray-800 border-2 rounded-[32px] p-3 transition-all duration-200 cursor-pointer flex flex-col ${item.isAvailable ? "border-transparent hover:border-brand-600 hover:shadow-lg hover:shadow-brand-50" : "border-red-100 opacity-80"}`}
                                                    >
                                                        {/* Image */}
                                                        <div className="h-44 w-full bg-gray-100 dark:bg-gray-700 relative rounded-[24px] overflow-hidden mb-4">
                                                            {item.image ? (
                                                                <img
                                                                    src={item.image}
                                                                    alt={item.name}
                                                                    className={`w-full h-full object-cover transition-transform duration-500 ${item.isAvailable ? 'group-hover:scale-110' : 'grayscale'}`}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                    <ImageOff size={32} />
                                                                </div>
                                                            )}

                                                            {!item.isAvailable && (
                                                                <div className="absolute inset-0 bg-white/40 dark:bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                                                                    <span className="bg-red-500 text-white text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-xl shadow-lg">
                                                                        Unavailable
                                                                    </span>
                                                                </div>
                                                            )}

                                                            <div className="absolute top-2 left-2 flex gap-1">
                                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center p-0.5 border border-white/50 backdrop-blur-md ${isVeg ? "bg-brand-600/80" : "bg-red-600/80"}`}>
                                                                    <div className="w-full h-full rounded-full bg-white" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 flex flex-col px-1">
                                                            <div className="flex justify-between items-start mb-2 gap-2">
                                                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base line-clamp-2 leading-tight flex-1">
                                                                    {item.name}
                                                                </h3>
                                                                <p className="text-brand-600 dark:text-brand-400 font-black text-lg">
                                                                    $ {item.price}
                                                                </p>
                                                            </div>

                                                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10 mb-4 leading-relaxed">
                                                                {item.description}
                                                            </p>

                                                            <div className="flex items-center gap-2 mb-4">
                                                                {item.variations.length > 0 && (
                                                                    <span className="text-[9px] uppercase tracking-widest font-black bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg">
                                                                        {item.variations.length} Variations
                                                                    </span>
                                                                )}
                                                                {item.addons.length > 0 && (
                                                                    <span className="text-[9px] uppercase tracking-widest font-black bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg">
                                                                        {item.addons.length} Add-ons
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Availability Toggle */}
                                                            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                                                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                                                    Status Management
                                                                </span>
                                                                <div
                                                                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 cursor-pointer shadow-inner ${item.isAvailable ? 'bg-brand-500 shadow-brand-200' : 'bg-gray-300 dark:bg-gray-600'}`}
                                                                    onClick={(e) => handleToggleStatus(e, item)}
                                                                >
                                                                    <span
                                                                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${item.isAvailable ? 'translate-x-6' : 'translate-x-1'}`}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* Empty State Card */}
                                            <Link
                                                href={`/items/add?categoryId=${group.info.id}`}
                                                className="min-w-[150px] w-[150px] flex flex-col items-center justify-center gap-2 border-[3px] border-dashed border-gray-200 dark:border-gray-700 rounded-[32px] text-gray-400 hover:text-brand-600 hover:border-brand-200 dark:hover:border-brand-900/30 transition-all bg-gray-50/50 dark:bg-gray-800/50 hover:bg-brand-50/30"
                                            >
                                                <Plus size={28} />
                                                <span className="text-xs font-bold uppercase tracking-wider">Add Item</span>
                                            </Link>

                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}