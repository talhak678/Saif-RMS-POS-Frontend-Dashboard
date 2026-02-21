"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import { Plus, Edit2, Trash2, Search, X, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { createPortal } from "react-dom";
import { ProtectedRoute } from "@/services/protected-route";

type Faq = {
    id: string;
    question: string;
    answer: string;
};

type Props = {
    embedded?: boolean;
};

export default function FaqsPage({ embedded = false }: Props) {
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFaq, setCurrentFaq] = useState<Partial<Faq>>({});
    const [saving, setSaving] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            const res = await api.get("/cms/faq");
            if (res.data.success) {
                setFaqs(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch FAQs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this FAQ?")) return;
        try {
            await api.delete(`/cms/faq/${id}`);
            setFaqs(prev => prev.filter(f => f.id !== id));
            toast.success("FAQ deleted successfully");
        } catch (error) {
            toast.error("Failed to delete FAQ");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (currentFaq.id) {
                const res = await api.put(`/cms/faq/${currentFaq.id}`, currentFaq);
                if (res.data.success) {
                    setFaqs(prev => prev.map(f => f.id === currentFaq.id ? res.data.data : f));
                    toast.success("FAQ updated successfully");
                }
            } else {
                const res = await api.post("/cms/faq", currentFaq);
                if (res.data.success) {
                    setFaqs(prev => [res.data.data, ...prev]);
                    toast.success("FAQ created successfully");
                }
            }
            setIsModalOpen(false);
            setCurrentFaq({});
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save FAQ");
        } finally {
            setSaving(false);
        }
    };

    const filteredFaqs = faqs.filter(f =>
        f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div></div>;

    return (
        <ProtectedRoute module="cms-website:faqs">

            <div className="space-y-8">
                {!embedded && (
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <div className="p-3 bg-brand-500 rounded-2xl text-white shadow-lg shadow-brand-500/20">
                                    <HelpCircle className="w-6 h-6" />
                                </div>
                                FAQ Manager
                            </h1>
                            <p className="text-gray-500 font-medium mt-1">Manage frequently asked questions.</p>
                        </div>
                    </div>
                )}

                {embedded && (
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">Manage FAQs</h3>
                        <button
                            onClick={() => { setCurrentFaq({}); setIsModalOpen(true); }}
                            className="flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:bg-brand-600 text-sm"
                        >
                            <Plus className="w-4 h-4" /> Add FAQ
                        </button>
                    </div>
                )}

                {!embedded && (
                    <div className="flex justify-end">
                        <button
                            onClick={() => { setCurrentFaq({}); setIsModalOpen(true); }}
                            className="flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-brand-500/20 hover:bg-brand-600 transition-all active:scale-95"
                        >
                            <Plus className="w-5 h-5" /> Add New FAQ
                        </button>
                    </div>
                )}

                {/* Search */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search FAQs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none font-medium placeholder-gray-400"
                    />
                </div>

                {/* List */}
                <div className="space-y-4">
                    {filteredFaqs.map((faq) => (
                        <div key={faq.id} className="group bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-lg transition-all">
                            <div
                                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                                className="p-6 cursor-pointer flex items-center justify-between"
                            >
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-4">
                                    <span className="w-8 h-8 rounded-full bg-brand-50/50 dark:bg-brand-900/10 flex items-center justify-center text-brand-500 text-sm font-black">Q</span>
                                    {faq.question}
                                </h3>
                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expandedId === faq.id ? "rotate-180" : ""}`} />
                            </div>

                            <div className={`overflow-hidden transition-all duration-300 ${expandedId === faq.id ? "max-h-96" : "max-h-0"}`}>
                                <div className="px-6 pb-6 pt-0 text-gray-600 dark:text-gray-400 font-medium leading-relaxed border-t border-gray-50 dark:border-gray-800/50">
                                    <div className="pt-4 flex gap-4">
                                        <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 text-sm font-black shrink-0">A</span>
                                        {faq.answer}
                                    </div>
                                    <div className="flex gap-2 justify-end mt-4">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setCurrentFaq(faq); setIsModalOpen(true); }}
                                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(faq.id); }}
                                            className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal */}
                {isModalOpen && createPortal(
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white">{currentFaq.id ? "Edit FAQ" : "New FAQ"}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>
                            <form onSubmit={handleSave} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Question</label>
                                        <input
                                            required
                                            value={currentFaq.question || ""}
                                            onChange={e => setCurrentFaq({ ...currentFaq, question: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-500 rounded-2xl px-5 py-4 font-bold outline-none transition-all"
                                            placeholder="Enter question (e.g., What are your hours?)"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Answer</label>
                                        <textarea
                                            required
                                            value={currentFaq.answer || ""}
                                            onChange={e => setCurrentFaq({ ...currentFaq, answer: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-500 rounded-2xl px-5 py-4 font-medium outline-none transition-all resize-none"
                                            rows={4}
                                            placeholder="Enter answer..."
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    {!currentFaq.id && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSaving(true);
                                                api.post("/cms/faq", currentFaq).then(res => {
                                                    if (res.data.success) {
                                                        setFaqs(prev => [res.data.data, ...prev]);
                                                        toast.success("FAQ created successfully");
                                                        setCurrentFaq({}); // Clear form
                                                        // Keep modal open
                                                    }
                                                }).catch(error => {
                                                    toast.error(error.response?.data?.message || "Failed to save FAQ");
                                                }).finally(() => {
                                                    setSaving(false);
                                                });
                                            }}
                                            disabled={saving}
                                            className="px-6 py-3 rounded-xl font-bold bg-white text-brand-500 border-2 border-brand-500 hover:bg-brand-50 transition-colors disabled:opacity-50"
                                        >
                                            Save & Add Another
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-8 py-3 rounded-xl font-bold bg-brand-500 text-white hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-50"
                                    >
                                        {saving ? "Saving..." : "Save FAQ"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>, document.body
                )}
            </div>
        </ProtectedRoute>
    );
}
