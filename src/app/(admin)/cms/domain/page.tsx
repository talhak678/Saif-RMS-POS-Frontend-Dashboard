"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import {
    Globe,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    Copy,
    RefreshCw,
    Server,
    ShieldCheck,
    HelpCircle,
    Info
} from "lucide-react";
import { useAuth } from "@/services/permission.service";
import Loader from "@/components/common/Loader";
import { ProtectedRoute } from "@/services/protected-route";

const DomainPage = () => {
    const { user } = useAuth();
    const [domain, setDomain] = useState("");
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [restaurantData, setRestaurantData] = useState<any>(null);

    // Main platform URL for DNS instructions
    const PLATFORM_DOMAIN = "saif-rms-pos-website.vercel.app";
    const PLATFORM_IP = "76.76.21.21"; // Example Vercel IP

    useEffect(() => {
        if (user?.restaurantId) {
            fetchRestaurant();
        }
    }, [user]);

    const fetchRestaurant = async () => {
        if (!user?.restaurantId) return;
        try {
            const res = await api.get(`/restaurants/${user.restaurantId}`);
            if (res.data.success) {
                setRestaurantData(res.data.data);
                setDomain(res.data.data.customDomain || "");
            }
        } catch (error) {
            console.error("Failed to fetch restaurant details", error);
        }
    };

    const handleSaveDomain = async () => {
        if (!domain) {
            toast.error("Please enter a domain name");
            return;
        }

        // Basic validation: must contain a dot and no http/https
        if (!domain.includes(".") || domain.startsWith("http")) {
            toast.error("Invalid domain format. Use 'example.com' or 'www.example.com'");
            return;
        }

        if (!user?.restaurantId) return;
        setLoading(true);
        try {
            const res = await api.put(`/restaurants/${user.restaurantId}`, {
                ...restaurantData,
                customDomain: domain.toLowerCase().trim()
            });

            if (res.data.success) {
                toast.success("Domain updated successfully! 🌐");
                fetchRestaurant(); // Refresh local data
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update domain");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyDomain = async () => {
        if (!domain) return;
        setVerifying(true);
        try {
            // We'll call a dedicated verify endpoint on the backend
            const res = await api.get(`/restaurants/verify-domain?domain=${domain}`);
            if (res.data.success && res.data.data.isValid) {
                toast.success("Great! Your DNS records are correctly pointed. 🚀");
                fetchRestaurant();
            } else {
                toast.error("Records not found yet. It may take up to 24-48 hours to propagate.");
            }
        } catch (error) {
            toast.error("Verification failed. Please check your records and try again later.");
        } finally {
            setVerifying(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.info("Copied to clipboard!");
    };

    if (!restaurantData) return <Loader />;

    const isConnected = restaurantData.customDomain && restaurantData.customDomain !== "";

    return (
        <ProtectedRoute module="cms-website:page-sections">
            <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-10 bg-gray-50/30 dark:bg-transparent min-h-screen">
                {/* Elegant Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-10">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/10 text-brand-500 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
                            Pro Feature
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                            <Globe className="w-10 h-10 text-brand-500" />
                            Custom Domain Settings
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl">
                            Give your restaurant its own identity. Connect a domain like <span className="text-brand-500 font-medium">www.yourname.com</span> seamlessly.
                        </p>
                    </div>
                    {isConnected && (
                        <div className="flex items-center gap-3 px-6 py-3 bg-green-500 text-white rounded-2xl shadow-lg shadow-green-500/20 font-bold animate-in fade-in slide-in-from-right-4 duration-500">
                            <CheckCircle2 className="w-5 h-5" />
                            Domain Active
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                    {/* Main Workflow (Steps) */}
                    <div className="xl:col-span-2 space-y-10">

                        {/* Step 1: Input Domain */}
                        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-10 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-2 h-full bg-brand-500 opacity-20 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 bg-brand-500 text-white rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-lg shadow-brand-500/30">1</div>
                                <div className="flex-1 space-y-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Enter your domain name</h3>
                                        <p className="text-gray-500 dark:text-gray-400">Specify the domain you've purchased from Hostinger, GoDaddy, etc.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="relative group/input">
                                            <input
                                                type="text"
                                                value={domain}
                                                onChange={(e) => setDomain(e.target.value)}
                                                placeholder="e.g. www.kababjees.com"
                                                className="w-full h-16 pl-6 pr-14 rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all text-xl font-medium"
                                            />
                                            <Globe className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-brand-500 group-focus-within/input:scale-110 transition-all" />
                                        </div>
                                        <button
                                            onClick={handleSaveDomain}
                                            disabled={loading}
                                            className="h-16 px-10 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : "Save Domain Name"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 & 3: DNS Records */}
                        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-10 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 opacity-20 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-lg shadow-blue-500/30">2</div>
                                <div className="flex-1 space-y-8">
                                    <div className="text-black">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Update DNS Records in Hostinger</h3>
                                        <p className="text-gray-500 dark:text-gray-400">Login to your Hostinger panel and add these two records.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* A Record */}
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-black uppercase tracking-widest">A Record</span>
                                                <button onClick={() => copyToClipboard(PLATFORM_IP)} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all">
                                                    <Copy className="w-4 h-4 text-gray-400 hover:text-brand-500" />
                                                </button>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Host / Name</p>
                                                <p className="font-mono text-lg font-bold text-gray-900 dark:text-white">@</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Target / IP Value</p>
                                                <p className="font-mono text-lg font-bold text-brand-500 break-all">{PLATFORM_IP}</p>
                                            </div>
                                        </div>

                                        {/* CNAME Record */}
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 space-y-4">
                                            <div className="flex justify-between items-center font-bold">
                                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-black uppercase tracking-widest">CNAME Record</span>
                                                <button onClick={() => copyToClipboard(PLATFORM_DOMAIN)} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all">
                                                    <Copy className="w-4 h-4 text-gray-400 hover:text-brand-500" />
                                                </button>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Host / Name</p>
                                                <p className="font-mono text-lg font-bold text-gray-900 dark:text-white">www</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Target / Hostname</p>
                                                <p className="font-mono text-xs font-bold text-brand-500 break-all">{PLATFORM_DOMAIN}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 4: Verification */}
                        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-10 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-2 h-full bg-green-500 opacity-20 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-lg shadow-green-500/30">3</div>
                                <div className="flex-1 space-y-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Connection</h3>
                                        <p className="text-gray-500 dark:text-gray-400">Check if your domain is pointing correctly to our servers.</p>
                                    </div>

                                    <button
                                        onClick={handleVerifyDomain}
                                        disabled={verifying || !isConnected}
                                        className="w-full md:w-auto h-16 px-12 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-extrabold text-xl shadow-xl shadow-green-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {verifying ? (
                                            <>
                                                <RefreshCw className="w-6 h-6 animate-spin" />
                                                Verifying DNS...
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck className="w-7 h-7" />
                                                Verify Connectivity
                                            </>
                                        )}
                                    </button>

                                    <p className="text-sm text-gray-400 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        DNS propagation can sometimes take up to 24 hours. Be patient!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-8">
                        {/* Status Card */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-black rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
                            <h4 className="text-xl font-bold mb-6 flex items-center gap-3 underline decoration-brand-500 decoration-2 underline-offset-8">
                                Connected Store
                            </h4>

                            {isConnected ? (
                                <div className="space-y-6">
                                    <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                        <p className="text-xs uppercase font-black tracking-widest text-white/50 mb-2 underline decoration-brand-500 decoration-2 underline-offset-8">Active Website</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-lg font-mono font-bold truncate pr-4 underline decoration-brand-500 decoration-2 underline-offset-8">{restaurantData.customDomain}</p>
                                            <a href={`https://${restaurantData.customDomain}`} target="_blank" rel="noreferrer" className="p-2 bg-brand-500 rounded-xl hover:scale-110 active:scale-90 transition-all">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-green-400 font-bold text-sm bg-green-400/10 p-4 rounded-2xl">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                        SSL Certificate Active
                                    </div>
                                </div>
                            ) : (
                                <div className="text-white/50 text-center py-10 space-y-4">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                        <Globe className="w-8 h-8 opacity-20" />
                                    </div>
                                    <p className="font-medium">No custom domain linked yet.</p>
                                </div>
                            )}
                        </div>

                        {/* FAQ */}
                        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none space-y-6">
                            <h4 className="text-xl font-black flex items-center gap-2">
                                <HelpCircle className="w-6 h-6 text-brand-500" />
                                Help & Support
                            </h4>
                            <div className="space-y-6">
                                <details className="group">
                                    <summary className="flex justify-between items-center font-bold cursor-pointer list-none text-gray-700 dark:text-gray-300">
                                        Why is it not working?
                                        <span className="group-open:rotate-180 transition-transform">▼</span>
                                    </summary>
                                    <p className="text-sm text-gray-500 mt-3 leading-relaxed">DNS changes don't happen instantly. It usually takes 1-2 hours but can take up to 24 hours depending on your domain provider.</p>
                                </details>
                                <div className="h-[1px] bg-gray-100 dark:bg-gray-800" />
                                <details className="group">
                                    <summary className="flex justify-between items-center font-bold cursor-pointer list-none text-gray-700 dark:text-gray-300">
                                        Is SSL Automatic?
                                        <span className="group-open:rotate-180 transition-transform">▼</span>
                                    </summary>
                                    <p className="text-sm text-gray-500 mt-3 leading-relaxed">Yes! Once your domain points to our servers, we automatically issue a free Let's Encrypt SSL certificate within minutes.</p>
                                </details>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default DomainPage;
