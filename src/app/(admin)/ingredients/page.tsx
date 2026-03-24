"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/services/api";
import {
    Eye,
    Plus,
    Package,
    Edit,
    Trash2,
    X,
    Save,
    AlertTriangle,
    Search,
    Filter,
    Upload,
    MoreVertical,
    ChevronDown,
    FileSpreadsheet,
    Download,
    FileUp,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/services/protected-route";
import Loader from "@/components/common/Loader";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";

const ALLOWED_UNITS = ["kg", "g", "l", "ml", "pcs", "box", "pack", "dozen", "bottle", "can", "bag", "packet"];

export default function IngredientsPage() {
    const router = useRouter();
    const [ingredients, setIngredients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // --- MODAL STATES ---
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState({ name: "", unit: "", category: "", unitPrice: "", parLevel: "" });
    const [bulkData, setBulkData] = useState("");
    const [formLoading, setFormLoading] = useState(false);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"all" | "low" | "history">("all");

    useEffect(() => {
        fetchIngredients();
    }, []);

    const fetchIngredients = async () => {
        try {
            setLoading(true);
            const res = await api.get("/ingredients");
            if (res.data?.success) {
                const sorted = res.data.data.sort(
                    (a: any, b: any) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setIngredients(sorted);
            }
        } catch (err) {
            console.error("Ingredients fetch failed", err);
            toast.error("Failed to load ingredients");
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingItem(null);
        setFormData({ name: "", unit: "", category: "", unitPrice: "", parLevel: "" });
        setIsFormModalOpen(true);
    };

    const openEditModal = (item: any) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            unit: item.unit,
            category: item.category || "",
            unitPrice: item.unitPrice?.toString() || "",
            parLevel: item.parLevel?.toString() || ""
        });
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const payload = {
                ...formData,
                unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : undefined,
                parLevel: formData.parLevel ? parseFloat(formData.parLevel) : undefined
            };

            if (editingItem) {
                await api.put(`/ingredients/${editingItem.id}`, payload);
                toast.success("Ingredient updated");
            } else {
                await api.post("/ingredients", payload);
                toast.success("Ingredient created");
            }
            setIsFormModalOpen(false);
            fetchIngredients();
        } catch (error) {
            console.error("Operation failed", error);
            toast.error("Operation failed");
        } finally {
            setFormLoading(false);
        }
    };

    const handleBulkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBulkLoading(true);
        try {
            let items: any[] = [];

            if (uploadFile) {
                // Parse Excel File
                const data = await uploadFile.arrayBuffer();
                const workbook = XLSX.read(data);
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

                const invalidUnits: string[] = [];
                items = jsonData.map((row: any, index: number) => {
                    const unit = (row.Unit || row.unit || "pcs").toLowerCase().trim();
                    if (!ALLOWED_UNITS.includes(unit)) {
                        invalidUnits.push(`Row ${index + 2}: ${unit}`);
                    }
                    return {
                        name: row.Name || row.name,
                        unit: unit,
                        category: row.Category || row.category || undefined,
                        unitPrice: row.UnitPrice || row.unitPrice || row["Unit Price"] ? parseFloat(row.UnitPrice || row.unitPrice || row["Unit Price"]) : undefined,
                        parLevel: row.ParLevel || row.parLevel || row["Par Level"] ? parseFloat(row.ParLevel || row.parLevel || row["Par Level"]) : undefined
                    };
                }).filter(item => item.name);

                if (invalidUnits.length > 0) {
                    toast.error(`Invalid units found: ${invalidUnits.slice(0, 3).join(", ")}${invalidUnits.length > 3 ? "..." : ""}. Allowed: ${ALLOWED_UNITS.join(", ")}`);
                    setBulkLoading(false);
                    return;
                }
            } else if (bulkData.trim()) {
                // Parse CSV format from textarea: Name, Unit, Category, UnitPrice, ParLevel
                const lines = bulkData.split("\n").filter(line => line.trim().length > 0);
                const invalidUnits: string[] = [];
                
                items = lines.map((line, index) => {
                    const parts = line.split(",").map(p => p.trim());
                    const unit = (parts[1] || "pcs").toLowerCase();
                    if (!ALLOWED_UNITS.includes(unit)) {
                        invalidUnits.push(`Line ${index + 1}: ${unit}`);
                    }
                    return {
                        name: parts[0],
                        unit: unit,
                        category: parts[2] || undefined,
                        unitPrice: parts[3] ? parseFloat(parts[3]) : undefined,
                        parLevel: parts[4] ? parseFloat(parts[4]) : undefined
                    };
                }).filter(item => item.name);

                if (invalidUnits.length > 0) {
                    toast.error(`Invalid units: ${invalidUnits.slice(0, 3).join(", ")}. Allowed: ${ALLOWED_UNITS.join(", ")}`);
                    setBulkLoading(false);
                    return;
                }
            }

            if (items.length === 0) {
                toast.error("No valid items found");
                return;
            }

            const res = await api.post("/ingredients/bulk", items);
            if (res.data?.success) {
                toast.success(`${items.length} Ingredients added successfully`);
                setIsBulkModalOpen(false);
                setBulkData("");
                setUploadFile(null);
                fetchIngredients();
            }
        } catch (error: any) {
            console.error("Bulk upload failed", error);
            toast.error("Bulk upload failed: " + (error.response?.data?.message || error.message));
        } finally {
            setBulkLoading(false);
        }
    };

    const downloadTemplate = () => {
        const templateData = [
            { Name: "Tomatoes", Unit: "kg", Category: "Vegetables", UnitPrice: 2.5, ParLevel: 10 },
            { Name: "Flour", Unit: "kg", Category: "Baking", UnitPrice: 1.2, ParLevel: 50 },
            { Name: "Cheese", Unit: "pcs", Category: "Dairy", UnitPrice: 5.0, ParLevel: 20 },
        ];

        const worksheet = XLSX.utils.json_to_sheet(templateData);
        
        // Add a small guide about allowed units
        const guideData = [
            { "Allowed Units Guide": "" },
            ...ALLOWED_UNITS.map(u => ({ "Allowed Units Guide": u }))
        ];
        const guideSheet = XLSX.utils.json_to_sheet(guideData);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Ingredients");
        XLSX.utils.book_append_sheet(workbook, guideSheet, "Allowed Units");
        
        XLSX.writeFile(workbook, "Ingredients_Bulk_Template.xlsx");
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/ingredients/${deleteId}`);
            toast.success("Ingredient deleted");
            setDeleteId(null);
            fetchIngredients();
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Delete failed");
        } finally {
            setDeleteLoading(false);
        }
    };

    const getOnHand = (stocks: any[] = []) => {
        return stocks.reduce((sum, s) => sum + Number(s.quantity), 0);
    };

    const filteredIngredients = useMemo(() => {
        let list = ingredients.filter(ing =>
            ing.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (activeTab === "low") {
            // Low stock: onHand is 0 OR below parLevel
            list = list.filter(ing => {
                const onHand = getOnHand(ing.stocks);
                if (ing.parLevel) return onHand < ing.parLevel;
                return onHand === 0;
            });
        } else if (activeTab === "history") {
            // History: sorted by most recently updated
            list = [...list].sort(
                (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
        }

        return list;
    }, [ingredients, searchQuery, activeTab]);

    return (
        <ProtectedRoute module="inventory-recipes:ingredients">
            <div className="min-h-screen bg-white/60 dark:bg-gray-900/60  pb-20 font-outfit">

                {/* --- SIMPLIFIED HEADER --- */}
                <div className="px-4 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/30 rounded-xl flex items-center justify-center text-brand-600">
                            <Package size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Ingredients</h1>
                            <p className="text-xs text-gray-500 font-medium tracking-tight">Manage your restaurant inventory and stock</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative group flex-1 md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-brand-500 rounded-xl outline-none text-sm transition-all text-gray-700 dark:text-gray-200"
                            />
                        </div>
                        <button className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 hover:text-brand-600 transition-all">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="p-4 md:p-6 space-y-6">

                    {/* --- ACTIONS BAR --- */}
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-gray-900 px-6 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm gap-4">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setActiveTab("all")}
                                className={`text-xs font-bold transition-colors ${activeTab === "all" ? "text-brand-600" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                All Items
                            </button>
                            <button
                                onClick={() => setActiveTab("low")}
                                className={`text-xs font-bold transition-colors ${activeTab === "low" ? "text-brand-600" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                Low Stocks
                            </button>
                            <button
                                onClick={() => setActiveTab("history")}
                                className={`text-xs font-bold transition-colors ${activeTab === "history" ? "text-brand-600" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                History
                            </button>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => setIsBulkModalOpen(true)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold border border-gray-100 dark:border-gray-700 hover:bg-gray-100 transition-all">
                                <Upload size={14} /> Bulk
                            </button>
                            <button
                                onClick={openAddModal}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-all shadow-md shadow-brand-600/10"
                            >
                                <Plus size={16} /> New Ingredient
                            </button>
                        </div>
                    </div>

                    {/* --- SIMPLE TABLE --- */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Name</th>
                                        <th className="px-6 py-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Category</th>
                                        <th className="px-6 py-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider text-center">In Stock</th>
                                        <th className="px-6 py-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider text-center">Par Level</th>
                                        <th className="px-6 py-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider text-right">Unit Price</th>
                                        <th className="px-6 py-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider text-right pr-8">Total Value</th>
                                        <th className="px-6 py-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {loading ? (
                                        <tr><td colSpan={7} className="py-20 text-center"><Loader size="sm" /></td></tr>
                                    ) : filteredIngredients.length === 0 ? (
                                        <tr><td colSpan={7} className="py-20 text-center text-gray-400 text-sm italic">No records found.</td></tr>
                                    ) : (
                                        filteredIngredients.map((ing: any) => (
                                            <tr
                                                key={ing.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                                onClick={() => router.push(`/ingredients/${ing.id}`)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{ing.name}</span>
                                                        <span className="block text-[10px] text-gray-400 mt-0.5 font-medium uppercase">{ing.id.slice(-6)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 font-medium">{ing.category || "Uncategorized"}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="inline-flex items-baseline gap-1 px-3 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 rounded-lg">
                                                        <span className="text-sm font-bold">{getOnHand(ing.stocks)}</span>
                                                        <span className="text-[10px] font-medium opacity-70 uppercase">{ing.unit}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center text-xs text-gray-400 dark:text-gray-500 font-medium italic">{ing.parLevel ? `${ing.parLevel} ${ing.unit}` : "Not set"}</td>
                                                <td className="px-6 py-4 text-right text-xs text-gray-500 dark:text-gray-400 font-semibold">${ing.unitPrice ? parseFloat(ing.unitPrice).toFixed(2) : "0.00"}</td>
                                                <td className="px-6 py-4 text-right text-sm font-bold text-gray-800 dark:text-gray-200 pr-8">
                                                    ${(getOnHand(ing.stocks) * (ing.unitPrice ? parseFloat(ing.unitPrice) : 0)).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                                        <button onClick={() => openEditModal(ing)} className="p-2 text-gray-400 hover:text-brand-600 transition-colors">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button onClick={() => setDeleteId(ing.id)} className="p-2 text-gray-400 hover:text-rose-600 transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* --- MODALS --- */}
                <Modal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    showCloseButton={false}
                    className="max-w-md"
                >
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h2 className="text-base font-bold text-gray-800 dark:text-white">
                                {editingItem ? "Edit Ingredient" : "New Ingredient"}
                            </h2>
                            <button onClick={() => setIsFormModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Tomatoes, Flour, etc."
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium text-gray-700 dark:text-gray-200"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">Base Unit</label>
                                <select
                                    required
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium text-gray-700 dark:text-gray-200 appearance-none"
                                >
                                    <option value="" disabled>Select a unit</option>
                                    {ALLOWED_UNITS.map(unit => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">Category</label>
                                <input
                                    type="text"
                                    placeholder="Liquor, Veggies, etc."
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium text-gray-700 dark:text-gray-200"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">Unit Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.unitPrice}
                                        onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium text-gray-700 dark:text-gray-200"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">Par Level</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={formData.parLevel}
                                        onChange={(e) => setFormData({ ...formData, parLevel: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium text-gray-700 dark:text-gray-200"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsFormModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex-[2] bg-brand-600 text-white font-bold py-2.5 rounded-xl hover:bg-brand-700 transition-all text-sm"
                                >
                                    {formLoading ? "Saving..." : "Save Item"}
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>

                {/* --- BULK ADD MODAL --- */}
                <Modal
                    isOpen={isBulkModalOpen}
                    onClose={() => setIsBulkModalOpen(false)}
                    showCloseButton={false}
                    className="max-w-md"
                >
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <FileSpreadsheet size={18} className="text-emerald-500" />
                                Bulk Create Ingredients
                            </h2>
                            <button onClick={() => setIsBulkModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleBulkSubmit} className="p-6 space-y-5">
                            <div className="space-y-4">
                                {/* Excel Upload Option */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">Upload Excel File</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept=".xlsx, .xls, .csv"
                                            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="bulk-excel-upload"
                                        />
                                        <label
                                            htmlFor="bulk-excel-upload"
                                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer group"
                                        >
                                            {uploadFile ? (
                                                <div className="flex flex-col items-center gap-2 text-emerald-600">
                                                    <FileSpreadsheet size={32} />
                                                    <span className="text-xs font-bold">{uploadFile.name}</span>
                                                    <button type="button" onClick={(e) => { e.preventDefault(); setUploadFile(null); }} className="text-[10px] text-gray-400 hover:text-rose-500 underline">Remove</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <FileUp className="text-gray-400 group-hover:text-brand-500 mb-2 transition-colors" size={24} />
                                                    <p className="text-xs font-bold text-gray-500 group-hover:text-gray-600">Click to upload .xlsx or .csv</p>
                                                    <p className="text-[10px] text-gray-400 mt-1 italic">Maximum file size 5MB</p>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={downloadTemplate}
                                        className="flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors bg-brand-50 dark:bg-brand-900/20 px-3 py-1.5 rounded-lg mt-2 w-fit"
                                    >
                                        <Download size={14} /> Download Sample Template
                                    </button>
                                </div>

                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="bg-white dark:bg-gray-900 px-3 font-bold text-gray-400">OR ENTER MANUALLY</span>
                                    </div>
                                </div>

                                {/* Manual CSV entry */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">Manual (Format: Name, Unit)</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Tomatoes, kg&#10;Onion, box"
                                        value={bulkData}
                                        onChange={(e) => setBulkData(e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium font-mono text-gray-700 dark:text-gray-200"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1 italic">Enter one ingredient per line. Separate Name and Unit with a comma.</p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsBulkModalOpen(false);
                                        setUploadFile(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={bulkLoading || (!uploadFile && !bulkData.trim())}
                                    className="flex-[2] bg-brand-600 text-white font-bold py-2.5 rounded-xl hover:bg-brand-700 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-600/10"
                                >
                                    {bulkLoading ? "Processing..." : "Create Items"}
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>

                <Modal
                    isOpen={!!deleteId}
                    onClose={() => setDeleteId(null)}
                    showCloseButton={false}
                    className="max-w-sm"
                >
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full p-8 text-center">
                        <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Delete Item?</h3>
                        <p className="text-xs text-gray-500 mb-6">Are you sure? This action will remove the ingredient from your list and recipes.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20">Delete</button>
                        </div>
                    </div>
                </Modal>
            </div>
        </ProtectedRoute>
    );
}
