"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import { Plus, Edit2, Trash2, Search, X, Image as ImageIcon, FileText, User } from "lucide-react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { ProtectedRoute } from "@/services/protected-route";
import Loader from "@/components/common/Loader";
import ImageUpload from "@/components/common/ImageUpload";

type Blog = {
    id: string;
    title: string;
    snippet: string;
    content: string;
    imageUrl: string;
    author: string;
    publishedAt: string;
};

type Props = {
    embedded?: boolean;
};

export default function BlogsPage({ embedded = false }: Props) {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBlog, setCurrentBlog] = useState<Partial<Blog>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const res = await api.get("/cms/blogs");
            if (res.data.success) {
                setBlogs(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch blogs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this blog post?")) return;
        try {
            await api.delete(`/cms/blogs/${id}`);
            setBlogs(prev => prev.filter(b => b.id !== id));
            toast.success("Blog deleted successfully");
        } catch (error) {
            toast.error("Failed to delete blog");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (currentBlog.id) {
                const res = await api.put(`/cms/blogs/${currentBlog.id}`, currentBlog);
                if (res.data.success) {
                    setBlogs(prev => prev.map(b => b.id === currentBlog.id ? res.data.data : b));
                    toast.success("Blog updated successfully");
                }
            } else {
                const res = await api.post("/cms/blogs", currentBlog);
                if (res.data.success) {
                    setBlogs(prev => [res.data.data, ...prev]);
                    toast.success("Blog created successfully");
                }
            }
            setIsModalOpen(false);
            setCurrentBlog({});
        } catch (error: any) {
            const data = error.response?.data;
            if (data?.error && typeof data.error === 'object') {
                const errorMessages = Object.entries(data.error)
                    .map(([field, messages]: [string, any]) => `${field}: ${messages.join(', ')}`)
                    .join('\n');
                toast.error(`Validation Failed:\n${errorMessages}`);
            } else {
                toast.error(data?.message || "Failed to save blog");
            }
        } finally {
            setSaving(false);
        }
    };

    const filteredBlogs = blogs.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) return <div className="flex justify-center items-center h-96"><Loader size="md" /></div>;

    return (
        <ProtectedRoute module="cms-website:page-sections" component={embedded}>

            <div className="space-y-6">
                {!embedded && (
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                                <FileText className="w-6 h-6 text-brand-500" />
                                Blog Management
                            </h1>
                            <p className="text-gray-500 text-sm mt-1 font-medium">Create and manage your website's articles.</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search blogs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium outline-none focus:border-brand-500 transition-all shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => { setCurrentBlog({}); setIsModalOpen(true); }}
                        className="flex items-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:bg-brand-600 transition-all whitespace-nowrap text-sm"
                    >
                        <Plus className="w-4 h-4" /> Add Blog Post
                    </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBlogs.map((blog) => (
                        <div key={blog.id} className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="h-44 bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
                                {blog.imageUrl ? (
                                    <Image src={blog.imageUrl} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-300">
                                        <ImageIcon className="w-10 h-10" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => { setCurrentBlog(blog); setIsModalOpen(true); }}
                                        className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-lg text-blue-500 hover:text-blue-600 shadow-sm border border-gray-100 dark:border-gray-700"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(blog.id)}
                                        className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-lg text-red-500 hover:text-red-600 shadow-sm border border-gray-100 dark:border-gray-700"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="space-y-1">
                                    <h3 className="text-base font-bold text-gray-800 dark:text-white line-clamp-1">{blog.title}</h3>
                                    <p className="text-gray-500 text-xs font-medium line-clamp-2 leading-relaxed">{blog.snippet}</p>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                        <User className="w-3 h-3 text-brand-500" /> {blog.author || "Admin"}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 dark:bg-gray-900 px-2 py-0.5 rounded-md border border-gray-100 dark:border-gray-700">
                                        {new Date(blog.publishedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal */}
                {isModalOpen && createPortal(
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">{currentBlog.id ? "Edit Article" : "Write Article"}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Title</label>
                                        <input
                                            required
                                            value={currentBlog.title || ""}
                                            onChange={e => setCurrentBlog({ ...currentBlog, title: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-700 focus:border-brand-500 rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all placeholder:text-gray-400"
                                            placeholder="Catchy title for your post..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Author Name</label>
                                            <input
                                                value={currentBlog.author || ""}
                                                onChange={e => setCurrentBlog({ ...currentBlog, author: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-700 focus:border-brand-500 rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all placeholder:text-gray-400"
                                                placeholder="Who is writing this?"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <ImageUpload
                                                label="Cover Image"
                                                value={currentBlog.imageUrl || ""}
                                                onChange={(url) => setCurrentBlog({ ...currentBlog, imageUrl: url })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Short Snippet</label>
                                        <textarea
                                            value={currentBlog.snippet || ""}
                                            onChange={e => setCurrentBlog({ ...currentBlog, snippet: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-700 focus:border-brand-500 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all resize-none shadow-sm"
                                            rows={2}
                                            placeholder="A brief summary for seekers..."
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Article Content</label>
                                        <textarea
                                            required
                                            value={currentBlog.content || ""}
                                            onChange={e => setCurrentBlog({ ...currentBlog, content: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-700 focus:border-brand-500 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all resize-y min-h-[180px] shadow-sm"
                                            placeholder="Tell your story..."
                                        />
                                    </div>
                                </div>
                            </form>
                            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col sm:flex-row justify-end gap-3">
                                <button
                                    onClick={() => { setIsModalOpen(false); setCurrentBlog({}); }}
                                    className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                >
                                    Discard
                                </button>
                                {
                                    !currentBlog.id && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSaving(true);
                                                api.post("/cms/blogs", currentBlog).then(res => {
                                                    if (res.data.success) {
                                                        setBlogs(prev => [res.data.data, ...prev]);
                                                        toast.success("Blog created successfully");
                                                        setCurrentBlog({});
                                                    }
                                                }).catch(error => {
                                                    const data = error.response?.data;
                                                    if (data?.error && typeof data.error === 'object') {
                                                        const errorMessages = Object.entries(data.error)
                                                            .map(([field, messages]: [string, any]) => `${field}: ${messages.join(', ')}`)
                                                            .join('\n');
                                                        toast.error(`Validation Failed:\n${errorMessages}`);
                                                    } else {
                                                        toast.error(data?.message || "Failed to save blog");
                                                    }
                                                }).finally(() => {
                                                    setSaving(false);
                                                });
                                            }}
                                            disabled={saving}
                                            className="px-5 py-2 rounded-xl text-sm font-semibold text-brand-500 border border-brand-200 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors disabled:opacity-50 flex justify-center items-center"
                                        >
                                            {saving ? <Loader size="sm" className="space-y-0" /> : "Save & Continue"}
                                        </button>
                                    )
                                }
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-8 py-2 rounded-xl text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center"
                                >
                                    {saving ? <Loader size="sm" className="space-y-0" /> : "Publish Article"}
                                </button>
                            </div>
                        </div>
                    </div>, document.body
                )}
            </div>
        </ProtectedRoute>
    );
}
