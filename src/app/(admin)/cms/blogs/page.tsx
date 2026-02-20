"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import { Plus, Edit2, Trash2, Search, X, Image as ImageIcon, FileText, User } from "lucide-react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { ProtectedRoute } from "@/services/protected-route";

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
            toast.error(error.response?.data?.message || "Failed to save blog");
        } finally {
            setSaving(false);
        }
    };

    const filteredBlogs = blogs.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div></div>;

    return (
        <ProtectedRoute module="cms">

            <div className="space-y-8">
                {!embedded && (
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <div className="p-3 bg-brand-500 rounded-2xl text-white shadow-lg shadow-brand-500/20">
                                    <FileText className="w-6 h-6" />
                                </div>
                                Blog Posts
                            </h1>
                            <p className="text-gray-500 font-medium mt-1">Manage your website's news and articles.</p>
                        </div>
                    </div>
                )}

                {embedded && (
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">Manage Blogs</h3>
                        <button
                            onClick={() => { setCurrentBlog({}); setIsModalOpen(true); }}
                            className="flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:bg-brand-600 text-sm"
                        >
                            <Plus className="w-4 h-4" /> Add Blog
                        </button>
                    </div>
                )}

                {!embedded && (
                    <div className="flex justify-end">
                        <button
                            onClick={() => { setCurrentBlog({}); setIsModalOpen(true); }}
                            className="flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-brand-500/20 hover:bg-brand-600 transition-all active:scale-95"
                        >
                            <Plus className="w-5 h-5" /> Add New Blog
                        </button>
                    </div>
                )}

                {/* Search */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search blogs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none font-medium placeholder-gray-400"
                    />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBlogs.map((blog) => (
                        <div key={blog.id} className="group bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="h-48 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                                {blog.imageUrl ? (
                                    <Image src={blog.imageUrl} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-300">
                                        <ImageIcon className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => { setCurrentBlog(blog); setIsModalOpen(true); }}
                                        className="p-2 bg-white/90 backdrop-blur rounded-xl text-blue-600 hover:text-blue-700 shadow-lg"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(blog.id)}
                                        className="p-2 bg-white/90 backdrop-blur rounded-xl text-red-500 hover:text-red-600 shadow-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">{blog.title}</h3>
                                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{blog.snippet}</p>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <User className="w-3 h-3" /> {blog.author || "Admin"}
                                    </div>
                                    <span className="text-xs font-bold text-brand-500">
                                        {new Date(blog.publishedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal */}
                {isModalOpen && createPortal(
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white">{currentBlog.id ? "Edit Blog" : "New Blog Post"}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>
                            <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
                                        <input
                                            required
                                            value={currentBlog.title || ""}
                                            onChange={e => setCurrentBlog({ ...currentBlog, title: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-500 rounded-2xl px-5 py-4 font-bold outline-none transition-all"
                                            placeholder="Enter blog title"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Author</label>
                                            <input
                                                value={currentBlog.author || ""}
                                                onChange={e => setCurrentBlog({ ...currentBlog, author: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-500 rounded-2xl px-5 py-4 font-bold outline-none transition-all"
                                                placeholder="Author name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Image URL</label>
                                            <input
                                                value={currentBlog.imageUrl || ""}
                                                onChange={e => setCurrentBlog({ ...currentBlog, imageUrl: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-500 rounded-2xl px-5 py-4 font-bold outline-none transition-all"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Snippet</label>
                                        <textarea
                                            value={currentBlog.snippet || ""}
                                            onChange={e => setCurrentBlog({ ...currentBlog, snippet: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-500 rounded-2xl px-5 py-4 font-bold outline-none transition-all resize-none"
                                            rows={2}
                                            placeholder="Short summary..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Content</label>
                                        <textarea
                                            required
                                            value={currentBlog.content || ""}
                                            onChange={e => setCurrentBlog({ ...currentBlog, content: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-500 rounded-2xl px-5 py-4 font-medium outline-none transition-all resize-y min-h-[200px]"
                                            placeholder="Write your blog post here..."
                                        />
                                    </div>
                                </div>
                            </form>
                            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                {!currentBlog.id && (
                                    <button
                                        onClick={(e) => {
                                            // Custom logic to handle "Save & Add Another"
                                            e.preventDefault();
                                            setSaving(true);
                                            api.post("/cms/blogs", currentBlog).then(res => {
                                                if (res.data.success) {
                                                    setBlogs(prev => [res.data.data, ...prev]);
                                                    toast.success("Blog created successfully");
                                                    setCurrentBlog({}); // Clear form
                                                }
                                            }).catch(error => {
                                                toast.error(error.response?.data?.message || "Failed to save blog");
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
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-8 py-3 rounded-xl font-bold bg-brand-500 text-white hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : "Save Blog Post"}
                                </button>
                            </div>
                        </div>
                    </div>, document.body
                )}
            </div>
        </ProtectedRoute>
    );
}
