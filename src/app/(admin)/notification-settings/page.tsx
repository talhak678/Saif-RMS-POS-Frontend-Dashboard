"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import {
    Bell,
    Save,
    RefreshCw,
    Info,
    AlertCircle,
    MessageSquare,
    Variable
} from "lucide-react";
import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button/Button";
import { useAuth } from "@/services/permission.service";

interface Template {
    id: string;
    event: string;
    message: string;
}

const EVENT_LABELS: Record<string, { title: string; description: string; variables: string[] }> = {
    'NEW_ORDER_WEB': {
        title: 'Website Order Notification',
        description: 'Merchant ko notify karta hai jab website se naya order aye.',
        variables: ['#{orderNo}']
    },
    'NEW_ORDER_POS': {
        title: 'POS Order Notification',
        description: 'Staff ko notify karta hai jab POS se naya order aye.',
        variables: ['#{orderNo}', '#{restaurantName}']
    },
    'SUB_REQUEST': {
        title: 'Subscription Request (Super Admin)',
        description: 'Super Admin ko notify karta hai jab koi restaurant upgrade mangay.',
        variables: ['#{restaurantName}', '#{plan}']
    }
};

export default function NotificationSettingsPage() {
    const { user } = useAuth();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const res = await api.get("/notifications/templates");
            if (res.data?.success) {
                setTemplates(res.data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch templates", error);
            toast.error("Templates load karne mein masla hua");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateMessage = (event: string, newMessage: string) => {
        setTemplates(prev => prev.map(t => t.event === event ? { ...t, message: newMessage } : t));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await api.post("/notifications/templates", { templates });
            if (res.data?.success) {
                toast.success("Settings save ho gayin!");
                fetchTemplates();
            }
        } catch (error) {
            console.error("Failed to save templates", error);
            toast.error("Save karne mein masla hua");
        } finally {
            setSaving(false);
        }
    };

    if (user?.role?.name !== 'SUPER_ADMIN') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">Access Denied</h1>
                <p className="text-gray-500 mt-2 font-medium">Sirf Super Admin ye settings change kar sakta hai.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <Bell className="w-8 h-8 text-brand-500" /> Notification Text Settings
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Har kism ki notification ka text yahan se customize karein.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={fetchTemplates}
                        className="rounded-xl h-11 px-4 border-gray-200 dark:border-gray-800"
                    >
                        <RefreshCw size={18} className={`${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="bg-brand-600 hover:bg-brand-700 text-white font-black px-6 py-3 rounded-xl shadow-lg shadow-brand-500/30 text-xs uppercase tracking-widest flex items-center gap-2"
                    >
                        {saving ? <Loader size="sm" /> : <Save size={18} />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl p-4 mb-8 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                    <p className="font-bold mb-1">How it works:</p>
                    Yahan aap apna message likh sakte hain. Variable placeholders (e.g. <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded text-blue-800 dark:text-blue-200">#{"{orderNo}"}</code>) system khud order ID ya restaurant name se replace kar dega.
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <Loader />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Settings...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {templates.map((template) => {
                        const info = EVENT_LABELS[template.event] || {
                            title: template.event,
                            description: 'System notification template',
                            variables: []
                        };
                        return (
                            <div key={template.id} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-4 transition-all hover:shadow-md">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{info.title}</h3>
                                        <p className="text-xs text-gray-400 font-medium">{info.description}</p>
                                    </div>
                                    <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg text-[10px] font-black text-gray-500 uppercase">
                                        {template.event}
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Message Template</label>
                                    <textarea
                                        value={template.message}
                                        onChange={(e) => handleUpdateMessage(template.event, e.target.value)}
                                        className="w-full h-24 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                                        placeholder="Enter message text here..."
                                    />
                                    <MessageSquare className="absolute right-4 bottom-4 w-5 h-5 text-gray-300 pointer-events-none" />
                                </div>

                                {info.variables.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                            <Variable size={12} /> Available Variables:
                                        </span>
                                        {info.variables.map(v => (
                                            <button
                                                key={v}
                                                onClick={() => handleUpdateMessage(template.event, template.message + ' ' + v)}
                                                className="text-[10px] font-bold bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 px-2 py-1 rounded-md hover:bg-brand-100 transition-colors"
                                            >
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {templates.length === 0 && (
                        <div className="py-20 text-center text-gray-400 italic font-medium">No templates found. System will generate defaults on refresh.</div>
                    )}
                </div>
            )}
        </div>
    );
}
