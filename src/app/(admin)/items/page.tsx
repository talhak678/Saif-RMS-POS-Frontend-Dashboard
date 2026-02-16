"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Plus, ChevronDown, ChevronRight, ImageOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
                <div className="text-gray-500">Loading menu items...</div>
            </div>
        );
    }

    return (
        <div className="max-w-[calc(73vw)] mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                    Menu Items
                </h1>
                <Link
                    href="/items/add"
                    className="bg-button backdrop-blur-xs outline-1 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
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
                                        className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center gap-1 transition-colors"
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
                                        {group.items.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => router.push(`/items/${item.id}`)}
                                                className="group min-w-[280px] w-[280px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all relative flex flex-col"
                                            >
                                                {/* Image */}
                                                <div className="h-40 w-full bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                                                    {item.image ? (
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className={`w-full h-full object-cover transition-transform duration-300 ${item.isAvailable ? 'group-hover:scale-105' : 'grayscale'}`}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <ImageOff size={32} />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded">
                                                        Rs. {item.price}
                                                    </div>

                                                    {!item.isAvailable && (
                                                        <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                                                            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                                                Unavailable
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="p-4 flex-1 flex flex-col">
                                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10 mb-3">
                                                        {item.description}
                                                    </p>

                                                    <div className="flex items-center gap-2 mb-3">
                                                        {item.variations.length > 0 && (
                                                            <span className="text-[10px] uppercase tracking-wider font-semibold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded">
                                                                {item.variations.length} Vars
                                                            </span>
                                                        )}
                                                        {item.addons.length > 0 && (
                                                            <span className="text-[10px] uppercase tracking-wider font-semibold bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-0.5 rounded">
                                                                {item.addons.length} Adds
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Toggle Switch */}
                                                    <div className="mt-auto pt-3 border-t dark:border-gray-700 flex items-center justify-between">
                                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                            Available?
                                                        </span>
                                                        <div 
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${item.isAvailable ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                                            onClick={(e) => handleToggleStatus(e, item)}
                                                        >
                                                            <span
                                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.isAvailable ? 'translate-x-6' : 'translate-x-1'}`}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Empty State Card */}
                                        <Link
                                            href={`/items/add?categoryId=${group.info.id}`}
                                            className="min-w-[150px] w-[150px] flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-400 dark:border-gray-700 rounded-xl text-gray-400 hover:text-blue-500 hover:border-blue-400 dark:hover:border-blue-900 transition-colors bg-blend dark:bg-gray-800/50"
                                        >
                                            <Plus size={24} />
                                            <span className="text-sm font-medium">Add Item</span>
                                        </Link>

                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}