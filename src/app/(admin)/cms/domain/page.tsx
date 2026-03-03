"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import {
    Globe, CheckCircle2, AlertCircle, ExternalLink, Copy,
    ShieldCheck, HelpCircle, XCircle, Clock, Loader2,
    ArrowRight, Check, Trash2, ChevronDown
} from "lucide-react";
import { useAuth } from "@/services/permission.service";
import Loader from "@/components/common/Loader";
import { ProtectedRoute } from "@/services/protected-route";

const PLATFORM_DOMAIN = "saif-rms-pos-website.vercel.app";
const PLATFORM_IP = "76.76.21.21";

const DomainPage = () => {
    const { user } = useAuth();
    const [domain, setDomain] = useState("");
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [restaurantData, setRestaurantData] = useState<any>(null);
    const [verificationResult, setVerificationResult] = useState<any>(null);
    const [faqOpen, setFaqOpen] = useState<number | null>(null);

    useEffect(() => {
        if (user?.restaurantId) fetchRestaurant();
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
        if (!domain) { toast.error("Please enter a domain name"); return; }
        let cleanDomain = domain.toLowerCase().trim()
            .replace(/^(https?:\/\/)/, "")
            .replace(/\/$/, "");
        if (!cleanDomain.includes(".") || cleanDomain.includes(" ")) {
            toast.error("Invalid domain format. Use 'example.com' or 'www.example.com'");
            return;
        }
        cleanDomain = cleanDomain.replace(/^www\./, "");
        if (!user?.restaurantId) return;
        setLoading(true);
        try {
            const res = await api.put(`/restaurants/${user.restaurantId}`, {
                ...restaurantData, customDomain: cleanDomain
            });
            if (res.data.success) {
                toast.success("Domain saved! Now add the DNS records shown below.");
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
                ...restaurantData, customDomain: null, domainStatus: "NONE"
            });
            if (res.data.success) {
                toast.success("Domain removed");
                setDomain(""); setVerificationResult(null); fetchRestaurant();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to remove domain");
        } finally {
            setRemoving(false);
        }
    };

    const handleVerifyDomain = async () => {
        if (!domain || !restaurantData?.customDomain) return;
        setVerifying(true); setVerificationResult(null);
        try {
            const res = await api.get(
                `/restaurants/verify-domain?domain=${restaurantData.customDomain}&restaurantId=${user?.restaurantId}`
            );
            if (res.data.success) {
                setVerificationResult(res.data.data);
                if (res.data.data.isFullyVerified) toast.success("🎉 Domain is fully connected and live!");
                else if (res.data.data.dns?.aRecordMatches || res.data.data.dns?.cnameMatches)
                    toast.info("DNS is correct! Vercel is still processing. Try again in a few minutes.");
                else toast.error("DNS records not found yet. Please add them and wait for propagation.");
                fetchRestaurant();
            }
        } catch {
            toast.error("Verification failed. Please try again later.");
        } finally {
            setVerifying(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.info("Copied to clipboard!");
    };

    if (!restaurantData) return <div className="flex items-center justify-center min-h-[400px]"><Loader size="md" /></div>;

    const domainStatus = restaurantData.domainStatus || "NONE";
    const hasDomain = !!restaurantData.customDomain;

    const statusConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
        NONE: { color: "text-gray-400", bg: "bg-gray-100 dark:bg-gray-800", icon: Globe, label: "No Domain" },
        PENDING: { color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", icon: Clock, label: "Pending Verification" },
        VERIFIED: { color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: CheckCircle2, label: "Verified & Active" },
        FAILED: { color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", icon: XCircle, label: "Configuration Failed" },
    };
    const currentStatus = statusConfig[domainStatus] || statusConfig.NONE;
    const StatusIcon = currentStatus.icon;

    const faqs = [
        { q: "Why is it not working?", a: "DNS changes don't happen instantly. It usually takes 5–30 minutes but can take up to 24 hours. Make sure you've deleted any old A records for @ before adding the new one." },
        { q: "Is SSL Automatic?", a: "Yes! Once your domain points to our servers and is verified, Vercel automatically issues a free SSL certificate within minutes." },
        { q: "Do I need both records?", a: "Yes! The A Record makes your root domain work. The CNAME Record makes the www version work. Both are important for a complete setup." },
        { q: "Can I change my domain later?", a: "Yes! Simply enter a new domain and save. The old domain will be automatically removed. You'll need to update DNS records for the new domain." },
    ];

    return (
        <ProtectedRoute module="cms-website:domain">
            <div className="pb-10">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 px-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                            <Globe className="w-6 h-6 text-[#5d69b9]" />
                            Custom Domain Settings
                        </h1>
                        <p className="text-gray-500 text-sm mt-1 font-medium">
                            Connect your own domain like <span className="text-[#5d69b9] font-semibold">www.yourname.com</span> to your restaurant website
                        </p>
                    </div>
                    {hasDomain && (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${currentStatus.bg} ${currentStatus.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {currentStatus.label}
                        </div>
                    )}
                </div>

                <div className="px-4 grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* ── Left: Steps ── */}
                    <div className="xl:col-span-2 space-y-4">

                        {/* Step 1 */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black" style={{ backgroundColor: "#5d69b9" }}>1</div>
                                <div>
                                    <h3 className="font-bold text-gray-800 dark:text-white text-sm">Enter Your Domain Name</h3>
                                    <p className="text-xs text-gray-500">Specify the domain purchased from Hostinger, GoDaddy, Namecheap, etc.</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={domain}
                                        onChange={(e) => setDomain(e.target.value)}
                                        placeholder="e.g. kababjees.com"
                                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/[0.03] focus:border-[#5d69b9] outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Enter without http:// or www prefix — just the bare domain (e.g. kababjees.com)
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    <button
                                        onClick={handleSaveDomain}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                                        style={{ backgroundColor: "#5d69b9" }}
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                        {loading ? "Saving..." : "Save & Connect"}
                                    </button>
                                    {hasDomain && (
                                        <button
                                            onClick={handleRemoveDomain}
                                            disabled={removing}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 transition-all disabled:opacity-50"
                                        >
                                            {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm transition-all ${!hasDomain ? "opacity-50 pointer-events-none" : ""}`}>
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black bg-blue-500">2</div>
                                <div>
                                    <h3 className="font-bold text-gray-800 dark:text-white text-sm">Update DNS Records</h3>
                                    <p className="text-xs text-gray-500">Login to your domain provider and add these two records in DNS settings</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {/* A Record */}
                                <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-[10px] font-black uppercase tracking-widest">A Record</span>
                                        <button onClick={() => copyToClipboard(PLATFORM_IP)} className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all">
                                            <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-[#5d69b9]" />
                                        </button>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div><p className="text-[10px] uppercase font-bold text-gray-400">Type</p><p className="font-mono font-bold text-gray-900 dark:text-white">A</p></div>
                                        <div><p className="text-[10px] uppercase font-bold text-gray-400">Host</p><p className="font-mono font-bold text-gray-900 dark:text-white">@</p></div>
                                        <div><p className="text-[10px] uppercase font-bold text-gray-400">IP Value</p><p className="font-mono font-bold text-[#5d69b9] break-all">{PLATFORM_IP}</p></div>
                                    </div>
                                    {verificationResult && (
                                        <div className={`flex items-center gap-1.5 text-xs font-bold ${verificationResult.dns?.aRecordMatches ? "text-emerald-500" : "text-amber-500"}`}>
                                            {verificationResult.dns?.aRecordMatches ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                            {verificationResult.dns?.aRecordMatches ? "A Record Found ✓" : "A Record Not Found Yet"}
                                        </div>
                                    )}
                                </div>

                                {/* CNAME Record */}
                                <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest">CNAME</span>
                                        <button onClick={() => copyToClipboard(PLATFORM_DOMAIN)} className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all">
                                            <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-[#5d69b9]" />
                                        </button>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div><p className="text-[10px] uppercase font-bold text-gray-400">Type</p><p className="font-mono font-bold text-gray-900 dark:text-white">CNAME</p></div>
                                        <div><p className="text-[10px] uppercase font-bold text-gray-400">Host</p><p className="font-mono font-bold text-gray-900 dark:text-white">www</p></div>
                                        <div><p className="text-[10px] uppercase font-bold text-gray-400">Target</p><p className="font-mono font-bold text-[#5d69b9] break-all text-xs">{PLATFORM_DOMAIN}</p></div>
                                    </div>
                                    {verificationResult && (
                                        <div className={`flex items-center gap-1.5 text-xs font-bold ${verificationResult.dns?.cnameMatches ? "text-emerald-500" : "text-amber-500"}`}>
                                            {verificationResult.dns?.cnameMatches ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                            {verificationResult.dns?.cnameMatches ? "CNAME Found ✓" : "CNAME Not Found Yet"}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Guide */}
                            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4">
                                <p className="font-bold text-blue-600 dark:text-blue-400 text-xs flex items-center gap-1.5 mb-2">
                                    <AlertCircle className="w-3.5 h-3.5" /> Quick Steps for Hostinger:
                                </p>
                                <ol className="text-xs text-blue-600/70 dark:text-blue-400/70 list-decimal list-inside space-y-1">
                                    <li>Login to <strong>hpanel.hostinger.com</strong></li>
                                    <li>Go to <strong>Domains → DNS / Name Servers</strong></li>
                                    <li>Delete any existing A record for <strong>@</strong></li>
                                    <li>Add <strong>A Record</strong>: Host = <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">@</code>, IP = <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">{PLATFORM_IP}</code></li>
                                    <li>Add <strong>CNAME</strong>: Host = <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">www</code>, Points to = <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">{PLATFORM_DOMAIN}</code></li>
                                    <li>Wait 5–30 min, then click Verify below</li>
                                </ol>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm transition-all ${!hasDomain ? "opacity-50 pointer-events-none" : ""}`}>
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black bg-emerald-500">3</div>
                                <div>
                                    <h3 className="font-bold text-gray-800 dark:text-white text-sm">Verify Connection</h3>
                                    <p className="text-xs text-gray-500">After adding DNS records, verify the connection is working</p>
                                </div>
                            </div>

                            <button
                                onClick={handleVerifyDomain}
                                disabled={verifying || !hasDomain}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-all disabled:opacity-50 mb-4"
                            >
                                {verifying ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : <><ShieldCheck className="w-4 h-4" /> Verify Connectivity</>}
                            </button>

                            {verificationResult && (
                                <div className={`rounded-xl border p-5 space-y-4 ${verificationResult.isFullyVerified
                                        ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30"
                                        : "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30"
                                    }`}>
                                    <div className="flex items-center gap-2">
                                        {verificationResult.isFullyVerified
                                            ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            : <Clock className="w-5 h-5 text-amber-500" />}
                                        <p className="font-bold text-sm">{verificationResult.message}</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 text-xs">
                                        {[
                                            { label: "A Record", ok: verificationResult.dns?.aRecordMatches, found: verificationResult.dns?.aRecords },
                                            { label: "CNAME (www)", ok: verificationResult.dns?.cnameMatches, found: verificationResult.dns?.cnameRecords },
                                            { label: "Vercel SSL", ok: verificationResult.vercel?.isConfigured, found: null },
                                        ].map(item => (
                                            <div key={item.label} className={`p-3 rounded-lg ${item.ok ? "bg-emerald-100 dark:bg-emerald-900/20" : "bg-gray-100 dark:bg-gray-800"}`}>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">{item.label}</p>
                                                <p className={`font-bold ${item.ok ? "text-emerald-600" : "text-gray-500"}`}>
                                                    {item.ok ? "✓ Connected" : item.label === "Vercel SSL" ? "⏳ Processing" : "✗ Not Found"}
                                                </p>
                                                {item.found && item.found.length > 0 && (
                                                    <p className="text-gray-400 mt-0.5 truncate">{item.found.join(", ")}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-3">
                                <AlertCircle className="w-3.5 h-3.5" />
                                DNS propagation can sometimes take up to 24 hours. Be patient!
                            </p>
                        </div>
                    </div>

                    {/* ── Right Sidebar ── */}
                    <div className="space-y-4">

                        {/* Domain Status Card */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Domain Status</h4>
                            {hasDomain ? (
                                <div className="space-y-3">
                                    <div className="p-4 bg-gray-50 dark:bg-white/[0.03] rounded-xl border border-gray-100 dark:border-gray-700">
                                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Root Domain</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-mono font-bold text-gray-900 dark:text-white truncate pr-2">{restaurantData.customDomain}</p>
                                            <a href={`https://${restaurantData.customDomain}`} target="_blank" rel="noreferrer"
                                                className="p-1.5 rounded-lg transition-all hover:scale-110" style={{ color: "#5d69b9" }}>
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-white/[0.03] rounded-xl border border-gray-100 dark:border-gray-700">
                                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">WWW Version</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-mono font-bold text-gray-900 dark:text-white truncate pr-2">www.{restaurantData.customDomain}</p>
                                            <a href={`https://www.${restaurantData.customDomain}`} target="_blank" rel="noreferrer"
                                                className="p-1.5 rounded-lg transition-all hover:scale-110 text-gray-400 hover:text-[#5d69b9]">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-2 text-xs font-semibold p-3 rounded-xl ${domainStatus === "VERIFIED" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                                            : domainStatus === "PENDING" ? "text-amber-600 bg-amber-50 dark:bg-amber-900/20"
                                                : domainStatus === "FAILED" ? "text-red-600 bg-red-50 dark:bg-red-900/20"
                                                    : "text-gray-400 bg-gray-100 dark:bg-gray-800"
                                        }`}>
                                        {domainStatus === "VERIFIED" && <><div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> SSL Certificate Active</>}
                                        {domainStatus === "PENDING" && <><Clock className="w-3.5 h-3.5" /> Awaiting DNS Verification</>}
                                        {domainStatus === "FAILED" && <><XCircle className="w-3.5 h-3.5" /> Configuration Issue</>}
                                        {domainStatus === "NONE" && <><Globe className="w-3.5 h-3.5" /> Not Yet Connected</>}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <Globe className="w-8 h-8 opacity-20 mx-auto mb-2" />
                                    <p className="text-sm font-medium">No custom domain linked yet.</p>
                                    <p className="text-xs mt-1">Enter a domain above to get started.</p>
                                </div>
                            )}
                        </div>

                        {/* FAQ */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                                <HelpCircle className="w-4 h-4" style={{ color: "#5d69b9" }} /> Help & Support
                            </h4>
                            <div className="space-y-2">
                                {faqs.map((faq, i) => (
                                    <div key={i} className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                                            className="w-full flex justify-between items-center px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            {faq.q}
                                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ml-2 ${faqOpen === i ? "rotate-180" : ""}`} />
                                        </button>
                                        {faqOpen === i && (
                                            <div className="px-4 pb-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-3">
                                                {faq.a}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default DomainPage;
