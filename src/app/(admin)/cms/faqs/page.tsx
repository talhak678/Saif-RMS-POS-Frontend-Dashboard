"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import { Plus, Edit2, Trash2, Search, X, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { createPortal } from "react-dom";
import { ProtectedRoute } from "@/services/protected-route";
import Loader from "@/components/common/Loader";

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

    if (loading) return <div className="flex justify-center items-center h-96"><Loader size="md" /></div>;

    return (
        <ProtectedRoute module="cms-website:faqs">

            <div className="space-y-6">
                {!embedded && (
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                                <HelpCircle className="w-6 h-6 text-brand-500" />
                                FAQ Manager
                            </h1>
                            <p className="text-gray-500 text-sm mt-1 font-medium">Manage frequently asked questions for your customers.</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search FAQs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium outline-none focus:border-brand-500 transition-all shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => { setCurrentFaq({}); setIsModalOpen(true); }}
                        className="flex items-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:bg-brand-600 transition-all whitespace-nowrap text-sm"
                    >
                        <Plus className="w-4 h-4" /> Add New FAQ
                    </button>
                </div>

                {/* List */}
                <div className="space-y-3">
                    {filteredFaqs.map((faq) => (
                        <div key={faq.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all">
                            <div
                                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                                className="p-4 cursor-pointer flex items-center justify-between"
                            >
                                <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-500 text-xs font-bold">Q</span>
                                    {faq.question}
                                </h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${expandedId === faq.id ? "rotate-180 text-brand-500" : ""}`} />
                            </div>

                            <div className={`overflow-hidden transition-all duration-300 ${expandedId === faq.id ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                                <div className="px-4 pb-4 pt-0 text-gray-600 dark:text-gray-400 text-sm font-medium leading-relaxed border-t border-gray-50 dark:border-gray-700/50">
                                    <div className="pt-4 flex gap-3">
                                        <span className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 text-xs font-bold shrink-0">A</span>
                                        <div className="flex-1">
                                            {faq.answer}
                                            <div className="flex gap-2 justify-end mt-4">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setCurrentFaq(faq); setIsModalOpen(true); }}
                                                    className="px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                                                >
                                                    Edit FAQ
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(faq.id); }}
                                                    className="px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal */}
                {isModalOpen && createPortal(
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">{currentFaq.id ? "Edit Question" : "New Question"}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSave} className="p-6 space-y-5">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Question</label>
                                        <input
                                            required
                                            value={currentFaq.question || ""}
                                            onChange={e => setCurrentFaq({ ...currentFaq, question: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-700 focus:border-brand-500 rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all placeholder:text-gray-400"
                                            placeholder="e.g., What are your opening hours?"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Answer</label>
                                        <textarea
                                            required
                                            value={currentFaq.answer || ""}
                                            onChange={e => setCurrentFaq({ ...currentFaq, answer: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-700 focus:border-brand-500 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all resize-none shadow-sm"
                                            rows={4}
                                            placeholder="Write your answer here..."
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Discard
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
                                                        setCurrentFaq({});
                                                    }
                                                }).catch(error => {
                                                    toast.error(error.response?.data?.message || "Failed to save FAQ");
                                                }).finally(() => {
                                                    setSaving(false);
                                                });
                                            }}
                                            disabled={saving}
                                            className="px-5 py-2 rounded-xl text-sm font-semibold text-brand-500 border border-brand-200 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors disabled:opacity-50 flex justify-center items-center"
                                        >
                                            {saving ? <Loader size="sm" className="space-y-0" /> : "Save & Add Another"}
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-8 py-2 rounded-xl text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center"
                                    >
                                        {saving ? <Loader size="sm" className="space-y-0" /> : "Save Question"}
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
