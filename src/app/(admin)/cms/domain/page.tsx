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
    ShieldCheck,
    HelpCircle,
    XCircle,
    Clock,
    Loader2,
    ArrowRight,
    Check,
    Trash2
} from "lucide-react";
import { useAuth } from "@/services/permission.service";
import Loader from "@/components/common/Loader";
import { ProtectedRoute } from "@/services/protected-route";

const DomainPage = () => {
    const { user } = useAuth();
    const [domain, setDomain] = useState("");
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [restaurantData, setRestaurantData] = useState<any>(null);
    const [verificationResult, setVerificationResult] = useState<any>(null);

    // DNS config values
    const PLATFORM_DOMAIN = "saif-rms-pos-website.vercel.app";
    const PLATFORM_IP = "76.76.21.21";

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

        // Clean the domain
        let cleanDomain = domain.toLowerCase().trim()
            .replace(/^(https?:\/\/)/, '')
            .replace(/\/$/, '');

        // Basic validation
        if (!cleanDomain.includes(".") || cleanDomain.includes(" ")) {
            toast.error("Invalid domain format. Use 'example.com' or 'www.example.com'");
            return;
        }

        // Remove www prefix for storage (we handle both root and www on Vercel)
        cleanDomain = cleanDomain.replace(/^www\./, '');

        if (!user?.restaurantId) return;
        setLoading(true);
        try {
            const res = await api.put(`/restaurants/${user.restaurantId}`, {
                ...restaurantData,
                customDomain: cleanDomain
            });

            if (res.data.success) {
                toast.success("Domain saved! Now add the DNS records shown below. 🌐");
                setDomain(cleanDomain);
                setVerificationResult(null);
                fetchRestaurant();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save domain");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveDomain = async () => {
        if (!user?.restaurantId) return;
        if (!confirm("Are you sure you want to remove the custom domain?")) return;

        setRemoving(true);
        try {
            const res = await api.put(`/restaurants/${user.restaurantId}`, {
                ...restaurantData,
                customDomain: null,
                domainStatus: 'NONE'
            });

            if (res.data.success) {
                toast.success("Domain removed successfully");
                setDomain("");
                setVerificationResult(null);
                fetchRestaurant();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to remove domain");
        } finally {
            setRemoving(false);
        }
    };

    const handleVerifyDomain = async () => {
        if (!domain || !restaurantData?.customDomain) return;
        setVerifying(true);
        setVerificationResult(null);

        try {
            const res = await api.get(
                `/restaurants/verify-domain?domain=${restaurantData.customDomain}&restaurantId=${user?.restaurantId}`
            );

            if (res.data.success) {
                setVerificationResult(res.data.data);

                if (res.data.data.isFullyVerified) {
                    toast.success("🎉 Domain is fully connected and live!");
                } else if (res.data.data.dns?.aRecordMatches || res.data.data.dns?.cnameMatches) {
                    toast.info("DNS is correct! Vercel is still processing. Try again in a few minutes.");
                } else {
                    toast.error("DNS records not found yet. Please add them and wait for propagation.");
                }
                fetchRestaurant();
            }
        } catch (error) {
            toast.error("Verification failed. Please try again later.");
        } finally {
            setVerifying(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.info("Copied to clipboard!");
    };

    if (!restaurantData) return <Loader />;

    const domainStatus = restaurantData.domainStatus || 'NONE';
    const hasDomain = restaurantData.customDomain && restaurantData.customDomain !== "";

    // Status badge config
    const statusConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
        NONE: { color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', icon: Globe, label: 'No Domain' },
        PENDING: { color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: Clock, label: 'Pending Verification' },
        VERIFIED: { color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', icon: CheckCircle2, label: 'Verified & Active' },
        FAILED: { color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', icon: XCircle, label: 'Configuration Failed' },
    };

    const currentStatus = statusConfig[domainStatus] || statusConfig.NONE;
    const StatusIcon = currentStatus.icon;

    return (
        <ProtectedRoute module="cms-website:domain">
            <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-10 bg-gray-50/30 dark:bg-transparent min-h-screen">
                {/* Header */}
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
                    {hasDomain && (
                        <div className={`flex items-center gap-3 px-6 py-3 ${currentStatus.bg} ${currentStatus.color} rounded-2xl shadow-sm font-bold animate-in fade-in slide-in-from-right-4 duration-500 border`}>
                            <StatusIcon className="w-5 h-5" />
                            {currentStatus.label}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                    {/* Main Workflow */}
                    <div className="xl:col-span-2 space-y-10">

                        {/* Step 1: Input Domain */}
                        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-10 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-2 h-full bg-brand-500 opacity-20 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 bg-brand-500 text-white rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-lg shadow-brand-500/30">1</div>
                                <div className="flex-1 space-y-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Enter your domain name</h3>
                                        <p className="text-gray-500 dark:text-gray-400">Specify the domain you've purchased from Hostinger, GoDaddy, Namecheap, etc.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="relative group/input">
                                            <input
                                                type="text"
                                                value={domain}
                                                onChange={(e) => setDomain(e.target.value)}
                                                placeholder="e.g. kababjees.com"
                                                className="w-full h-16 pl-6 pr-14 rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all text-xl font-medium"
                                            />
                                            <Globe className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-brand-500 group-focus-within/input:scale-110 transition-all" />
                                        </div>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            Enter without http:// or www. prefix — just the bare domain (e.g. kababjees.com)
                                        </p>
                                        <div className="flex gap-3 flex-wrap">
                                            <button
                                                onClick={handleSaveDomain}
                                                disabled={loading}
                                                className="h-14 px-10 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                            >
                                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Save & Connect <ArrowRight className="w-5 h-5" /></>}
                                            </button>
                                            {hasDomain && (
                                                <button
                                                    onClick={handleRemoveDomain}
                                                    disabled={removing}
                                                    className="h-14 px-6 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {removing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Trash2 className="w-5 h-5" /> Remove</>}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: DNS Records */}
                        <div className={`bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-10 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none relative overflow-hidden group ${!hasDomain ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 opacity-20 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-lg shadow-blue-500/30">2</div>
                                <div className="flex-1 space-y-8">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Update DNS Records</h3>
                                        <p className="text-gray-500 dark:text-gray-400">Login to your domain provider (Hostinger, GoDaddy, etc.) and add these two records in DNS settings.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* A Record */}
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-black uppercase tracking-widest">A Record</span>
                                                <button onClick={() => copyToClipboard(PLATFORM_IP)} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all" title="Copy IP">
                                                    <Copy className="w-4 h-4 text-gray-400 hover:text-brand-500" />
                                                </button>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Type</p>
                                                <p className="font-mono text-sm font-bold text-gray-900 dark:text-white">A</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Host / Name</p>
                                                <p className="font-mono text-lg font-bold text-gray-900 dark:text-white">@</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Target / IP Value</p>
                                                <p className="font-mono text-lg font-bold text-brand-500 break-all">{PLATFORM_IP}</p>
                                            </div>
                                            {/* Status indicator */}
                                            {verificationResult && (
                                                <div className={`flex items-center gap-2 text-sm font-bold ${verificationResult.dns?.aRecordMatches ? 'text-green-500' : 'text-amber-500'}`}>
                                                    {verificationResult.dns?.aRecordMatches ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                                    {verificationResult.dns?.aRecordMatches ? 'A Record Found ✓' : 'A Record Not Found Yet'}
                                                </div>
                                            )}
                                        </div>

                                        {/* CNAME Record */}
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-black uppercase tracking-widest">CNAME Record</span>
                                                <button onClick={() => copyToClipboard(PLATFORM_DOMAIN)} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all" title="Copy Hostname">
                                                    <Copy className="w-4 h-4 text-gray-400 hover:text-brand-500" />
                                                </button>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Type</p>
                                                <p className="font-mono text-sm font-bold text-gray-900 dark:text-white">CNAME</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Host / Name</p>
                                                <p className="font-mono text-lg font-bold text-gray-900 dark:text-white">www</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Target / Hostname</p>
                                                <p className="font-mono text-xs font-bold text-brand-500 break-all">{PLATFORM_DOMAIN}</p>
                                            </div>
                                            {/* Status indicator */}
                                            {verificationResult && (
                                                <div className={`flex items-center gap-2 text-sm font-bold ${verificationResult.dns?.cnameMatches ? 'text-green-500' : 'text-amber-500'}`}>
                                                    {verificationResult.dns?.cnameMatches ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                                    {verificationResult.dns?.cnameMatches ? 'CNAME Record Found ✓' : 'CNAME Record Not Found Yet'}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick Guide */}
                                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5 space-y-2">
                                        <p className="font-bold text-blue-600 dark:text-blue-400 text-sm flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" /> Quick Steps for Hostinger:
                                        </p>
                                        <ol className="text-sm text-blue-600/70 dark:text-blue-400/70 list-decimal list-inside space-y-1">
                                            <li>Login to <strong>hpanel.hostinger.com</strong></li>
                                            <li>Go to <strong>Domains → DNS / Name Servers</strong></li>
                                            <li>Delete any existing A record for <strong>@</strong></li>
                                            <li>Add new <strong>A Record</strong>: Host = <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">@</code>, Points to = <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">{PLATFORM_IP}</code></li>
                                            <li>Add new <strong>CNAME Record</strong>: Host = <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">www</code>, Points to = <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">{PLATFORM_DOMAIN}</code></li>
                                            <li>Wait 5-30 minutes, then click <strong>Verify</strong> below</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Verification */}
                        <div className={`bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-10 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none relative overflow-hidden group ${!hasDomain ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="absolute top-0 left-0 w-2 h-full bg-green-500 opacity-20 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-lg shadow-green-500/30">3</div>
                                <div className="flex-1 space-y-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Connection</h3>
                                        <p className="text-gray-500 dark:text-gray-400">After adding DNS records, click below to check if everything is connected properly.</p>
                                    </div>

                                    <button
                                        onClick={handleVerifyDomain}
                                        disabled={verifying || !hasDomain}
                                        className="w-full md:w-auto h-16 px-12 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-extrabold text-xl shadow-xl shadow-green-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {verifying ? (
                                            <>
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                                Verifying DNS & Vercel...
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck className="w-7 h-7" />
                                                Verify Connectivity
                                            </>
                                        )}
                                    </button>

                                    {/* Verification Result Details */}
                                    {verificationResult && (
                                        <div className={`rounded-2xl border-2 p-6 space-y-4 ${verificationResult.isFullyVerified
                                            ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30'
                                            : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30'
                                            }`}>
                                            <div className="flex items-center gap-3">
                                                {verificationResult.isFullyVerified ? (
                                                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                                                ) : (
                                                    <Clock className="w-6 h-6 text-amber-500" />
                                                )}
                                                <p className="font-bold text-lg">
                                                    {verificationResult.message}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                                <div className={`p-3 rounded-xl ${verificationResult.dns?.aRecordMatches ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">A Record</p>
                                                    <p className={`font-bold ${verificationResult.dns?.aRecordMatches ? 'text-green-600' : 'text-gray-500'}`}>
                                                        {verificationResult.dns?.aRecordMatches ? '✓ Connected' : '✗ Not Found'}
                                                    </p>
                                                    {verificationResult.dns?.aRecords?.length > 0 && (
                                                        <p className="text-xs text-gray-400 mt-1">Found: {verificationResult.dns.aRecords.join(', ')}</p>
                                                    )}
                                                </div>
                                                <div className={`p-3 rounded-xl ${verificationResult.dns?.cnameMatches ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">CNAME (www)</p>
                                                    <p className={`font-bold ${verificationResult.dns?.cnameMatches ? 'text-green-600' : 'text-gray-500'}`}>
                                                        {verificationResult.dns?.cnameMatches ? '✓ Connected' : '✗ Not Found'}
                                                    </p>
                                                    {verificationResult.dns?.cnameRecords?.length > 0 && (
                                                        <p className="text-xs text-gray-400 mt-1">Found: {verificationResult.dns.cnameRecords.join(', ')}</p>
                                                    )}
                                                </div>
                                                <div className={`p-3 rounded-xl ${verificationResult.vercel?.isConfigured ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Vercel SSL</p>
                                                    <p className={`font-bold ${verificationResult.vercel?.isConfigured ? 'text-green-600' : 'text-gray-500'}`}>
                                                        {verificationResult.vercel?.isConfigured ? '✓ Active' : '⏳ Processing'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

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
                                Domain Status
                            </h4>

                            {hasDomain ? (
                                <div className="space-y-6">
                                    <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                        <p className="text-xs uppercase font-black tracking-widest text-white/50 mb-2">Domain</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-lg font-mono font-bold truncate pr-4">{restaurantData.customDomain}</p>
                                            <a href={`https://${restaurantData.customDomain}`} target="_blank" rel="noreferrer" className="p-2 bg-brand-500 rounded-xl hover:scale-110 active:scale-90 transition-all">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>

                                    {/* WWW version */}
                                    <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                        <p className="text-xs uppercase font-black tracking-widest text-white/50 mb-2">WWW Version</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-mono font-bold truncate pr-4">www.{restaurantData.customDomain}</p>
                                            <a href={`https://www.${restaurantData.customDomain}`} target="_blank" rel="noreferrer" className="p-2 bg-brand-500/50 rounded-xl hover:scale-110 active:scale-90 transition-all">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>

                                    {/* Status badge */}
                                    <div className={`flex items-center gap-3 font-bold text-sm p-4 rounded-2xl ${domainStatus === 'VERIFIED'
                                        ? 'text-green-400 bg-green-400/10'
                                        : domainStatus === 'PENDING'
                                            ? 'text-amber-400 bg-amber-400/10'
                                            : domainStatus === 'FAILED'
                                                ? 'text-red-400 bg-red-400/10'
                                                : 'text-gray-400 bg-gray-400/10'
                                        }`}>
                                        {domainStatus === 'VERIFIED' && <><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> SSL Certificate Active</>}
                                        {domainStatus === 'PENDING' && <><Clock className="w-4 h-4" /> Awaiting DNS Verification</>}
                                        {domainStatus === 'FAILED' && <><XCircle className="w-4 h-4" /> Configuration Issue</>}
                                        {domainStatus === 'NONE' && <><Globe className="w-4 h-4" /> Not Configured</>}
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
                                    <p className="text-sm text-gray-500 mt-3 leading-relaxed">DNS changes don't happen instantly. It usually takes 5-30 minutes but can take up to 24 hours depending on your domain provider. Make sure you've deleted any old A records for @ before adding the new one.</p>
                                </details>
                                <div className="h-[1px] bg-gray-100 dark:bg-gray-800" />
                                <details className="group">
                                    <summary className="flex justify-between items-center font-bold cursor-pointer list-none text-gray-700 dark:text-gray-300">
                                        Is SSL Automatic?
                                        <span className="group-open:rotate-180 transition-transform">▼</span>
                                    </summary>
                                    <p className="text-sm text-gray-500 mt-3 leading-relaxed">Yes! Once your domain points to our servers and is verified, Vercel automatically issues a free SSL certificate within minutes. You'll see HTTPS enabled on your domain.</p>
                                </details>
                                <div className="h-[1px] bg-gray-100 dark:bg-gray-800" />
                                <details className="group">
                                    <summary className="flex justify-between items-center font-bold cursor-pointer list-none text-gray-700 dark:text-gray-300">
                                        Do I need both records?
                                        <span className="group-open:rotate-180 transition-transform">▼</span>
                                    </summary>
                                    <p className="text-sm text-gray-500 mt-3 leading-relaxed">Yes! The <strong>A Record</strong> makes your root domain (kababjees.com) work. The <strong>CNAME Record</strong> makes the www version (www.kababjees.com) work. Both are important for a complete setup.</p>
                                </details>
                                <div className="h-[1px] bg-gray-100 dark:bg-gray-800" />
                                <details className="group">
                                    <summary className="flex justify-between items-center font-bold cursor-pointer list-none text-gray-700 dark:text-gray-300">
                                        Can I change my domain later?
                                        <span className="group-open:rotate-180 transition-transform">▼</span>
                                    </summary>
                                    <p className="text-sm text-gray-500 mt-3 leading-relaxed">Yes! Simply enter a new domain and save. The old domain will be automatically removed from our servers. You'll need to update DNS records for the new domain.</p>
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
