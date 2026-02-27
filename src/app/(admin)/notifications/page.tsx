"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { formatDistanceToNow } from "date-fns";
import {
    Bell,
    CheckCircle2,
    Clock,
    Trash2,
    Inbox,
    RefreshCw,
    AlertCircle
} from "lucide-react";
import api from "@/services/api";
import { toast } from "sonner";
import Badge from "@/components/ui/badge/Badge";
import { Button } from "@/components/ui/button/Button";
import Loader from "@/components/common/Loader";
import { useSearchParams } from "next/navigation";

interface Notification {
    id: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    userId: string;
}

// ── Inner component that reads searchParams ──────────────────────────────────
function NotificationsInner() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
    const [highlightedId, setHighlightedId] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get("/notifications");
            if (res.data?.success) {
                setNotifications(res.data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // After notifications load, scroll to & highlight the targeted notification
    useEffect(() => {
        if (loading) return;
        const id = searchParams.get("highlight");
        if (!id) return;

        setHighlightedId(id);
        // Also make sure unread filter doesn't hide it
        setFilter("ALL");

        // Wait one tick for the DOM to settle, then scroll
        setTimeout(() => {
            const el = rowRefs.current[id];
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }, 100);

        // Remove highlight ring after 3 seconds
        const timer = setTimeout(() => setHighlightedId(null), 3000);
        return () => clearTimeout(timer);
    }, [loading, searchParams]);

    const markAsRead = async (id: string) => {
        try {
            const res = await api.patch(`/notifications/${id}`, { isRead: true });
            if (res.data?.success) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            }
        } catch (error) {
            toast.error("Failed to mark as read");
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            const res = await api.delete(`/notifications/${id}`);
            if (res.data?.success) {
                setNotifications(prev => prev.filter(n => n.id !== id));
                toast.success("Notification deleted");
            }
        } catch (error) {
            toast.error("Failed to delete notification");
        }
    };

    const markAllAsRead = async () => {
        const unread = notifications.filter(n => !n.isRead);
        if (unread.length === 0) return;

        try {
            await Promise.all(unread.map(n => api.patch(`/notifications/${n.id}`, { isRead: true })));
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success("All marked as read");
        } catch (error) {
            toast.error("Failed to mark all as read");
        }
    };

    const filteredNotifications = filter === "ALL"
        ? notifications
        : notifications.filter(n => !n.isRead);

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <Bell className="w-8 h-8 text-brand-500" /> Notifications
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Keep track of your restaurant activities and requests.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={fetchNotifications}
                        className="rounded-xl h-11 px-4 border-gray-200 dark:border-gray-800"
                    >
                        <RefreshCw size={18} className={`${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                        onClick={markAllAsRead}
                        disabled={!notifications.some(n => !n.isRead)}
                        className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-black px-6 py-3 rounded-xl shadow-md text-xs uppercase tracking-widest"
                    >
                        Mark all as read
                    </Button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 bg-gray-100/50 dark:bg-gray-900/50 p-1.5 rounded-2xl w-fit border border-gray-100 dark:border-gray-800">
                <button
                    onClick={() => setFilter("ALL")}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === "ALL" ? "bg-white dark:bg-gray-800 shadow-sm text-brand-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                    All ({notifications.length})
                </button>
                <button
                    onClick={() => setFilter("UNREAD")}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === "UNREAD" ? "bg-white dark:bg-gray-800 shadow-sm text-brand-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                    Unread ({notifications.filter(n => !n.isRead).length})
                </button>
            </div>

            {/* Content Section */}
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                        <Loader />
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading your updates...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-300">
                            <Inbox size={40} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Nothing to see here</h3>
                            <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2 font-medium">You're all caught up! When you have new activities, they'll show up here.</p>
                        </div>
                        <Button variant="outline" onClick={() => setFilter("ALL")} className="rounded-xl px-8 border-gray-200">Show all history</Button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50 dark:divide-gray-800">
                        {filteredNotifications.map((notification) => {
                            const isHighlighted = highlightedId === notification.id;
                            return (
                                <div
                                    key={notification.id}
                                    id={`notif-${notification.id}`}
                                    ref={(el) => { rowRefs.current[notification.id] = el; }}
                                    className={[
                                        "p-6 flex items-start gap-4 transition-all duration-500",
                                        // Highlighted ring (fades out after 3s via state reset)
                                        isHighlighted
                                            ? "bg-brand-50 dark:bg-brand-900/20 ring-2 ring-inset ring-brand-400 dark:ring-brand-500 rounded-2xl scale-[1.01]"
                                            : !notification.isRead
                                                ? "bg-brand-50/20 dark:bg-brand-900/5 border-l-4 border-l-brand-500 hover:bg-gray-50/50 dark:hover:bg-gray-800/20"
                                                : "hover:bg-gray-50/50 dark:hover:bg-gray-800/20",
                                    ].join(" ")}
                                >
                                    <div className={`mt-1 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-500 ${isHighlighted
                                            ? "bg-brand-200 text-brand-700 dark:bg-brand-800 dark:text-brand-200"
                                            : !notification.isRead
                                                ? "bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
                                                : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                                        }`}>
                                        {notification.message.toLowerCase().includes("upgrade") ? (
                                            <RefreshCw size={24} />
                                        ) : (
                                            <AlertCircle size={24} />
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-sm leading-relaxed ${!notification.isRead ? "font-black text-gray-900 dark:text-white" : "font-medium text-gray-600 dark:text-gray-400"}`}>
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <CheckCircle2 size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <Clock size={12} /> {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </span>
                                            {!notification.isRead && (
                                                <Badge variant="solid" color="warning" className="text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-tight">New</Badge>
                                            )}
                                            {isHighlighted && (
                                                <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest animate-pulse">
                                                    ← From notification
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="mt-8 p-6 bg-blue-50/30 dark:bg-blue-900/10 rounded-3xl border border-blue-100/50 dark:border-blue-900/20 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <AlertCircle size={20} />
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                    Contact us via email at <span className="font-black">saifgrill@gmail.com</span> or call <span className="font-black">+1-994-343-434</span> for new subscriptions and feature updates.
                </p>
            </div>
        </div>
    );
}

// ── Root export wrapped in Suspense (required for useSearchParams) ────────────
export default function NotificationsPage() {
    return (
        <Suspense fallback={
            <div className="py-20 flex items-center justify-center">
                <Loader />
            </div>
        }>
            <NotificationsInner />
        </Suspense>
    );
}
