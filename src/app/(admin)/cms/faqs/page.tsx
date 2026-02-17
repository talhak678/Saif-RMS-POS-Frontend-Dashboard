"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import { HelpCircle, Plus, Trash2, Edit3, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";

interface FAQ {
    id: string;
    question: string;
    answer: string;
}

export default function FAQPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ question: "", answer: "" });
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        try {
            const res = await api.get("/cms/faq");
            if (res.data?.success) {
                setFaqs(res.data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch FAQs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.question || !formData.answer) return toast.error("Both fields are required");
        setSubmitting(true);
        try {
            let res;
            if (editingId) {
                res = await api.post("/cms/faq", { ...formData, id: editingId, faqId: editingId });
            } else {
                res = await api.post("/cms/faq", formData);
            }

            if (res.data?.success) {
                toast.success(editingId ? "FAQ updated" : "FAQ added");
                fetchFAQs();
                resetForm();
            }
        } catch (error) {
            toast.error("Process failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this FAQ?")) return;
        try {
            await api.delete(`/cms/faq/${id}`);
            setFaqs(faqs.filter(f => f.id !== id));
            toast.success("FAQ deleted");
        } catch (error) {
            toast.error("Deletion failed");
        }
    };

    const startEdit = (faq: FAQ) => {
        setFormData({ question: faq.question, answer: faq.answer });
        setEditingId(faq.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({ question: "", answer: "" });
        setEditingId(null);
        setShowForm(false);
    };

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div></div>;

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                        <HelpCircle className="w-8 h-8 text-brand-500" />
                        Help Center FAQs
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage frequently asked questions that appear on your support page.</p>
                </div>
                <button
                    onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
                    className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-2xl transition-all shadow-lg active:scale-95 font-bold"
                >
                    <Plus className={`w-5 h-5 transition-transform ${showForm ? 'rotate-45' : ''}`} />
                    {editingId ? "Edit Item" : "Add FAQ"}
                </button>
            </div>

            {/* Editor Box */}
            {showForm && (
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-brand-500/20 rounded-[2.5rem] p-10 mb-12 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-4 bg-brand-500 rounded-3xl text-white shadow-xl shadow-brand-500/30">
                            {editingId ? <Edit3 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-800 dark:text-white">{editingId ? "Update FAQ" : "New Support Question"}</h2>
                            <p className="text-sm text-gray-500">Use clear and concise language for better customer understanding.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                                <MessageCircle className="w-3 h-3" /> The Question
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Do you offer contactless delivery?"
                                value={formData.question}
                                onChange={e => setFormData({ ...formData, question: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent border-gray-100 dark:border-gray-800 focus:border-brand-500/50 rounded-2xl px-6 py-4 text-base font-semibold focus:ring-0 transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                                <Edit3 className="w-3 h-3" /> The Answer
                            </label>
                            <textarea
                                rows={5}
                                placeholder="Describe the answer in detail here..."
                                value={formData.answer}
                                onChange={e => setFormData({ ...formData, answer: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent border-gray-100 dark:border-gray-800 focus:border-brand-500/50 rounded-2xl px-6 py-4 text-base font-medium focus:ring-0 transition-all outline-none resize-none"
                            />
                        </div>
                    </div>

                    <div className="mt-10 flex gap-4">
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-brand-500 hover:bg-brand-600 text-white px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-brand-500/20 disabled:opacity-50 active:scale-95"
                        >
                            {submitting ? "Publishing..." : editingId ? "Save Changes" : "Post Question"}
                        </button>
                        <button
                            onClick={resetForm}
                            className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-10 py-4 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* List Section */}
            <div className="space-y-6">
                {faqs.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/20 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-bold text-lg">Your FAQ list is empty.</p>
                        <p className="text-sm text-gray-400 mt-2">Help your customers by providing quick answers.</p>
                    </div>
                ) : (
                    faqs.map((faq) => (
                        <div key={faq.id} className="group bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/50 rounded-[2rem] p-8 hover:shadow-2xl hover:shadow-brand-500/5 transition-all duration-300">
                            <div className="flex justify-between items-start gap-6">
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-gray-800 dark:text-white leading-tight mb-4 group-hover:text-brand-500 transition-colors">
                                        Q: {faq.question}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed font-normak">
                                        {faq.answer}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => startEdit(faq)}
                                        className="p-3 bg-brand-500/10 text-brand-500 rounded-2xl hover:bg-brand-500 hover:text-white transition-all shadow-sm"
                                        title="Edit"
                                    >
                                        <Edit3 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(faq.id)}
                                        className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-12 p-8 bg-brand-500/5 border-2 border-brand-500/10 rounded-[2.5rem] flex items-center gap-6">
                <div className="w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-brand-500/20">
                    <HelpCircle className="w-8 h-8" />
                </div>
                <div>
                    <h4 className="text-xl font-black text-gray-900 dark:text-white">Customer Satisfaction</h4>
                    <p className="text-gray-500 dark:text-gray-400">Studies show that a Good FAQ section reduces support tickets by up to 35%.</p>
                </div>
            </div>
        </div>
    );
}
