"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import { ChevronDown, Save, Layout, Palette, Image as ImageIcon, Settings as SettingsIcon, Check, Search, Info, Phone, MessageSquare, Plus, Trash2, List } from "lucide-react";
import BlogsPage from "./blogs/page";
import FaqsPage from "./faqs/page";
import { ProtectedRoute } from "@/services/protected-route";
import Loader from "@/components/common/Loader";
import ImageUpload from "@/components/common/ImageUpload";

const DEFAULT_CONFIG = {
    home: {
        enabled: true,
        required: true,
        sections: {
            header: {
                required: true, enabled: true,
                content: {
                    menuItems: "Home, Our Menu, Contact Us",
                    showCart: "true",
                    showLogin: "true",
                    logoUrl: ""
                }
            },
            banner: {
                required: true, enabled: true,
                content: { title: "Delicious Food For You", subtitle: "Best quality food in town", imageUrl: "", buttonText: "Order Now", buttonLink: "/our-menu-1" }
            },
            browseMenu: {
                required: false, enabled: true,
                content: { title: "Browse Our Menu", selectedCategoryIds: [] }
            },
            todaysSpecial: {
                required: false, enabled: false,
                content: { title: "Today's Special", description: "Special items for today only", selectedItemIds: [] }
            },
            ourMenu: {
                required: true, enabled: true,
                content: { title: "Our Regular Menu", selectedCategoryIds: [] }
            },
            customerComments: {
                required: false, enabled: false,
                content: { title: "What Our Customers Say" }
            },
            footer: {
                required: true, enabled: true,
                content: {
                    address: "123 Street, City, Country",
                    description: "Quality food delivered to your doorstep.",
                    contactEmail: "info@example.com",
                    contactPhone: "+123456789",
                    facebook: "",
                    instagram: "",
                    tiktok: "",
                    openHours: "Mon-Sun: 9AM - 11PM",
                    menuItems: "Home, Our Menu, Contact Us, About Us, FAQ"
                }
            },
            copyrightBar: {
                required: false, enabled: false,
                content: { text: "Copyright 2026 Saif RMS. All Rights Reserved." }
            },
        }
    },
    menu: {
        enabled: true,
        required: true,
        sections: {
            banner: {
                required: false, enabled: true,
                content: { title: "Our Menu", breadcrumb: "Delicious Selection", imageUrl: "" }
            },
            menuGallery: {
                required: true, enabled: true,
                content: {
                    title: "Full Menu Gallery",
                    description: "Discover our wide variety of dishes",
                    selectedCategoryIds: [] // ENABLE SELECTION PICKER
                }
            }
        }
    },
    about: {
        enabled: true,
        required: false,
        sections: {
            banner: {
                required: false, enabled: true,
                content: { title: "About Us", breadcrumb: "Our Story", imageUrl: "" }
            },
            video: {
                required: false, enabled: false,
                content: { videoUrl: "", title: "Discover Our Kitchen", subtitle: "A glimpse into our cooking process" }
            },
            whatWeDo: {
                required: true, enabled: true,
                content: {
                    title: "What We Do",
                    description: "We are committed to providing the best dining experience.",
                    cards: [
                        { title: "Fresh Ingredients", description: "We use only the finest and freshest ingredients." },
                        { title: "Expert Chefs", description: "Our chefs have years of experience." },
                        { title: "Professional Service", description: "Customer satisfaction is our top priority." },
                        { title: "Cozy Atmosphere", description: "Enjoy your meal in a warm environment." }
                    ]
                }
            },
        }
    },
    contact: {
        enabled: true,
        required: true,
        sections: {
            banner: {
                required: false, enabled: true,
                content: { title: "Contact Us", breadcrumb: "Get In Touch", imageUrl: "" }
            },
            cards: {
                required: false, enabled: true,
                content: {
                    phoneTitle: "Phone Number",
                    phoneValue: "+123 456 7890",
                    emailTitle: "Email Address",
                    emailValue: "info@example.com",
                    addressTitle: "Location",
                    addressValue: "123 Main Street, City",
                    hoursTitle: "Opening Hours",
                    hoursValue: "9:00 AM - 11:00 PM"
                }
            },
            form: {
                required: true, enabled: true,
                content: { title: "Make A Reservation", description: "Fill out the form below to book a table." }
            },
        }
    },
    blogs: {
        enabled: true,
        required: false,
        sections: {
            banner: {
                required: false, enabled: true,
                content: { title: "Our Blogs", breadcrumb: "Latest News", imageUrl: "" }
            },
            blogList: {
                required: true, enabled: true,
                content: { title: "Latest Articles" }
            },
            footer: {
                required: true, enabled: true,
                content: {
                    address: "123 Street, City, Country",
                    description: "Quality food delivered to your doorstep.",
                    contactEmail: "info@example.com",
                    contactPhone: "+123456789",
                    facebook: "",
                    instagram: "",
                    tiktok: "",
                    openHours: "Mon-Sun: 9AM - 11PM",
                    menuItems: "Home, Our Menu, Contact Us, About Us, FAQ"
                }
            },
            copyrightBar: {
                required: false, enabled: false,
                content: { text: "Copyright 2026 Saif RMS. All Rights Reserved." }
            },
        }
    },
    faq: {
        enabled: true,
        required: false,
        sections: {
            banner: {
                required: false, enabled: true,
                content: { title: "Frequently Asked Questions", breadcrumb: "Help Center", imageUrl: "" }
            },
            faqList: {
                required: true, enabled: true,
                content: { title: "Common Questions" }
            },
            footer: {
                required: true, enabled: true,
                content: {
                    address: "123 Street, City, Country",
                    description: "Quality food delivered to your doorstep.",
                    contactEmail: "info@example.com",
                    contactPhone: "+123456789",
                    facebook: "",
                    instagram: "",
                    tiktok: "",
                    openHours: "Mon-Sun: 9AM - 11PM",
                    menuItems: "Home, Our Menu, Contact Us, About Us, FAQ"
                }
            },
            copyrightBar: {
                required: false, enabled: false,
                content: { text: "Copyright 2026 Saif RMS. All Rights Reserved." }
            },
        }
    },
    theme: {
        enabled: true,
        required: false,
        sections: {
            colors: {
                required: false, enabled: true,
                content: {
                    primaryColor: "#ff0000",
                    secondaryColor: "#000000",
                    accentColor: "#f3f4f6",
                    backgroundColor: "#ffffff",
                    textColor: "#666666"
                }
            },
            fonts: {
                required: false, enabled: true,
                content: {
                    primaryFont: "Outfit",
                    secondaryFont: "Outfit"
                }
            },
            logos: {
                required: false, enabled: true,
                content: {
                    mainLogo: "",
                    favicon: "",
                    footerLogo: ""
                }
            }
        }
    }
};

export default function CMSPage() {
    const [config, setConfig] = useState<any>(null);
    const [theme, setTheme] = useState({ backgroundColor: "#ffffff", primaryColor: "#ff0000" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("home");
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Business Data
    const [categories, setCategories] = useState<any[]>([]);
    const [menuItems, setMenuItems] = useState<any[]>([]);

    useEffect(() => {
        const init = async () => {
            await Promise.all([fetchConfig(), fetchBusinessData()]);
            setLoading(false);
        };
        init();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await api.get("/cms/config");
            if (res.data?.success) {
                const data = res.data.data;
                const mergedConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

                if (data.configJson) {
                    Object.keys(data.configJson).forEach(page => {
                        if (mergedConfig[page]) {
                            // Merge page-level enabled status
                            mergedConfig[page].enabled = data.configJson[page].enabled !== false;

                            Object.keys(data.configJson[page].sections).forEach(sec => {
                                if (mergedConfig[page].sections[sec]) {
                                    mergedConfig[page].sections[sec].enabled = data.configJson[page].sections[sec].enabled !== false;
                                    mergedConfig[page].sections[sec].content = {
                                        ...mergedConfig[page].sections[sec].content,
                                        ...data.configJson[page].sections[sec].content
                                    };
                                    // FORCE: Ensure selection arrays exist
                                    if (sec === 'todaysSpecial') {
                                        // Clean up old category selection if it exists
                                        delete mergedConfig[page].sections[sec].content.selectedCategoryIds;
                                        if (!mergedConfig[page].sections[sec].content.selectedItemIds)
                                            mergedConfig[page].sections[sec].content.selectedItemIds = [];
                                    }
                                    if (sec === 'ourMenu' || sec === 'browseMenu' || sec === 'menuGallery') {
                                        if (!mergedConfig[page].sections[sec].content.selectedCategoryIds)
                                            mergedConfig[page].sections[sec].content.selectedCategoryIds = [];
                                    }
                                }
                            });
                        }
                    });
                }

                if (mergedConfig.theme) {
                    if (data.backgroundColor) mergedConfig.theme.sections.colors.content.backgroundColor = data.backgroundColor;
                    if (data.primaryColor) mergedConfig.theme.sections.colors.content.primaryColor = data.primaryColor;
                }

                setConfig(mergedConfig);
                setTheme({
                    backgroundColor: data.backgroundColor || "#ffffff",
                    primaryColor: data.primaryColor || "#ff0000"
                });
            }
        } catch (error) {
            console.error("Failed to fetch CMS config", error);
            setConfig(DEFAULT_CONFIG);
        }
    };

    const fetchBusinessData = async () => {
        try {
            const [catRes, itemRes] = await Promise.all([
                api.get("/categories"),
                api.get("/menu-items")
            ]);
            console.log("CMS Data Fetch:", { categories: catRes.data, items: itemRes.data });
            if (catRes.data?.success) setCategories(catRes.data.data || []);
            if (itemRes.data?.success) setMenuItems(itemRes.data.data || []);
        } catch (error) {
            console.error("Failed to fetch business data", error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Extract latest colors from the theme configuration if available
            const themeColors = config.theme?.sections?.colors?.content || {};
            const pColor = themeColors.primaryColor || theme.primaryColor;
            const bColor = themeColors.backgroundColor || theme.backgroundColor;

            const response = await api.post("/cms/config", {
                configJson: config,
                backgroundColor: bColor,
                primaryColor: pColor
            });

            console.log("✅ CMS Save Response:", response.data);

            if (response.data?.success) {
                toast.success("✅ All settings published successfully!");
            } else {
                toast.error(response.data?.message || "Save failed");
            }
        } catch (error: any) {
            console.error("❌ CMS Save Error:", error);
            const errorMsg = error.response?.data?.message || error.message || "Failed to save settings";
            toast.error(`❌ ${errorMsg}`);
        } finally {
            setSaving(false);
        }
    }

    const handleToggle = (page: string, section: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (config[page].sections[section].required) {
            toast.error("This section is required for the page to function.");
            return;
        }
        setConfig((prev: any) => {
            const newConfig = JSON.parse(JSON.stringify(prev));
            newConfig[page].sections[section].enabled = !newConfig[page].sections[section].enabled;
            return newConfig;
        });
    };

    const handleContentChange = (page: string, section: string, field: string, value: any) => {
        setConfig((prev: any) => {
            const newConfig = JSON.parse(JSON.stringify(prev));
            newConfig[page].sections[section].content[field] = value;
            return newConfig;
        });
    };

    const handleArrayChange = (page: string, section: string, arrayField: string, index: number, subField: string, value: any) => {
        setConfig((prev: any) => {
            const newConfig = JSON.parse(JSON.stringify(prev));
            newConfig[page].sections[section].content[arrayField][index][subField] = value;
            return newConfig;
        });
    };

    const handlePageToggle = (page: string) => {
        if (config[page].required) {
            toast.error("This page is required and cannot be hidden.");
            return;
        }
        setConfig((prev: any) => {
            const newConfig = JSON.parse(JSON.stringify(prev));
            newConfig[page].enabled = !newConfig[page].enabled;
            return newConfig;
        });
    };

    const addArrayItem = (page: string, section: string, arrayField: string) => {
        setConfig((prev: any) => {
            const newConfig = JSON.parse(JSON.stringify(prev));
            const newItem = { title: "New Item", description: "Enter description here..." };
            newConfig[page].sections[section].content[arrayField] = [...(newConfig[page].sections[section].content[arrayField] || []), newItem];
            return newConfig;
        });
    };

    const removeArrayItem = (page: string, section: string, arrayField: string, index: number) => {
        setConfig((prev: any) => {
            const newConfig = JSON.parse(JSON.stringify(prev));
            newConfig[page].sections[section].content[arrayField].splice(index, 1);
            return newConfig;
        });
    };

    const toggleSelection = (page: string, section: string, field: string, id: string) => {
        setConfig((prev: any) => {
            const newConfig = JSON.parse(JSON.stringify(prev));
            const currentList = newConfig[page].sections[section].content[field] || [];
            if (currentList.includes(id)) {
                newConfig[page].sections[section].content[field] = currentList.filter((x: string) => x !== id);
            } else {
                newConfig[page].sections[section].content[field] = [...currentList, id];
            }
            return newConfig;
        });
    };

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader size="md" /></div>;

    const pages = Object.keys(config);

    return (
        <ProtectedRoute module="cms-website:page-sections">
            <div className="pb-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 px-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                            <Layout className="w-6 h-6 text-brand-500" />
                            Website Designer
                        </h1>
                        <p className="text-gray-500 text-sm mt-1 font-medium">Manage your restaurant's digital presence</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 font-semibold text-sm shadow-sm justify-center min-w-[140px]"
                    >
                        {saving ? <Loader size="sm" showText={false} className="space-y-0" /> : <Save className="w-4 h-4" />}
                        {saving ? "Publishing..." : "Publish Changes"}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 shadow-sm">
                            <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-4 px-3">Pages</h2>
                            <div className="space-y-1">
                                {pages.map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => { setActiveTab(p); setExpandedSection(null); }}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold capitalize transition-all ${activeTab === p
                                            ? "bg-brand-500 text-white shadow-md shadow-brand-500/10"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {p === 'home' && <Layout className="w-4 h-4" />}
                                            {p === 'about' && <Info className="w-4 h-4" />}
                                            {p === 'contact' && <Phone className="w-4 h-4" />}
                                            {p === 'menu' && <List className="w-4 h-4" />}
                                            {p === 'blogs' && <MessageSquare className="w-4 h-4" />}
                                            {p === 'faq' && <Check className="w-4 h-4" />}
                                            {p === 'theme' && <Palette className="w-4 h-4" />}
                                            <div className="flex flex-col items-start leading-none">
                                                <span>{p === 'theme' ? 'Branding' : p}</span>
                                                {!config[p].enabled && <span className="text-[9px] font-bold text-red-500 mt-0.5">Hidden</span>}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-9 space-y-6">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm min-h-[600px]">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-brand-50 dark:bg-brand-500/10 rounded-xl text-brand-500">
                                    <SettingsIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white capitalize">{activeTab === 'theme' ? 'Branding & Style' : `${activeTab} Page Content`}</h2>
                                    <p className="text-gray-500 text-xs font-medium">{activeTab === 'theme' ? 'Manage global colors, fonts and logos' : 'Customize sections and information'}</p>
                                </div>
                            </div>

                            {/* Page Visibility Toggle */}
                            {activeTab !== 'theme' && (
                                <div className={`mb-6 p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${config[activeTab].enabled ? 'bg-green-50/50 dark:bg-green-500/5 border-green-100 dark:border-green-900/30' : 'bg-red-50/50 dark:bg-red-500/5 border-red-100 dark:border-red-900/30'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config[activeTab].enabled ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                            <ImageIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Page Status</h3>
                                            <p className="text-[11px] text-gray-500 font-medium">
                                                {config[activeTab].enabled ? "Enabled on public website" : "Hidden from public website"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {config[activeTab].required && <span className="text-[10px] font-bold uppercase text-brand-500 px-2 py-1 bg-brand-50 dark:bg-brand-500/10 rounded-md border border-brand-100 dark:border-brand-900/30">Required</span>}
                                        <button
                                            onClick={() => handlePageToggle(activeTab)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${config[activeTab].enabled ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-700"} ${config[activeTab].required ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config[activeTab].enabled ? "translate-x-6" : "translate-x-1"}`} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                {Object.keys(config[activeTab].sections).map((sectionKey) => {
                                    const section = config[activeTab].sections[sectionKey];
                                    const isExpanded = expandedSection === sectionKey;
                                    return (
                                        <div
                                            key={sectionKey}
                                            className={`rounded-xl border transition-all ${isExpanded
                                                ? "border-brand-500 ring-1 ring-brand-500/10 bg-white dark:bg-white/[0.03]"
                                                : "border-gray-200 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-500/30"
                                                }`}
                                        >
                                            <div
                                                onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}
                                                className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isExpanded ? "bg-brand-50 dark:bg-brand-500/5" : ""}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${isExpanded ? "bg-brand-500 text-white shadow-md shadow-brand-500/20" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
                                                        <SettingsIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 dark:text-gray-200 capitalize text-sm">
                                                            {sectionKey.replace(/([A-Z])/g, ' $1')}
                                                        </p>
                                                        <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Configure Content</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    {activeTab !== 'theme' && (
                                                        <button
                                                            onClick={(e) => handleToggle(activeTab, sectionKey, e)}
                                                            disabled={section.required}
                                                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${section.enabled ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-800"
                                                                } ${section.required ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                                                        >
                                                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${section.enabled ? "translate-x-5.5" : "translate-x-1"}`} />
                                                        </button>
                                                    )}
                                                    <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180 text-brand-500" : "text-gray-400"}`} />
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="p-6 border-t border-gray-100 dark:border-gray-800 space-y-6">
                                                    {/* Section Basic Fields */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        {Object.keys(section.content || {}).filter(k => k !== 'cards' && k !== 'selectedCategoryIds' && k !== 'selectedItemIds').map((field) => {
                                                            const isThemeColor = activeTab === 'theme' && sectionKey === 'colors';
                                                            const isThemeFont = activeTab === 'theme' && sectionKey === 'fonts';

                                                            const fieldDescriptions: any = {
                                                                primaryColor: "Primary brand color",
                                                                secondaryColor: "Accent color",
                                                                accentColor: "Subtle highlight color",
                                                                backgroundColor: "Site background",
                                                                textColor: "Main text color",
                                                            };

                                                            const fontOptions = ['Outfit', 'Inter', 'Poppins', 'Roboto', 'Montserrat'];

                                                            return (
                                                                <div key={field} className={`${field === 'description' || field === 'address' || field === 'menuItems' ? 'md:col-span-2' : ''} space-y-1.5`}>
                                                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                                                                    {field === 'description' || field === 'address' ? (
                                                                        <textarea
                                                                            rows={3}
                                                                            value={section.content[field]}
                                                                            onChange={(e) => handleContentChange(activeTab, sectionKey, field, e.target.value)}
                                                                            className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-700 focus:border-brand-500 rounded-lg px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400"
                                                                            placeholder={`Enter ${field}...`}
                                                                        />
                                                                    ) : field === 'menuItems' ? (
                                                                        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-white/[0.03] rounded-lg border border-gray-200 dark:border-gray-700">
                                                                            {["Home", "Our Menu", "About Us", "Contact Us", "Blogs"].map((item) => {
                                                                                const currentItems = (section.content[field] || "").split(",").map((i: string) => i.trim()).filter(Boolean);
                                                                                const isSelected = currentItems.includes(item);
                                                                                return (
                                                                                    <div
                                                                                        key={item}
                                                                                        onClick={() => {
                                                                                            let newItems;
                                                                                            if (isSelected) {
                                                                                                if (currentItems.length <= 1) return;
                                                                                                newItems = currentItems.filter((i: string) => i !== item);
                                                                                            } else {
                                                                                                newItems = [...currentItems, item];
                                                                                            }
                                                                                            handleContentChange(activeTab, sectionKey, field, newItems.join(", "));
                                                                                        }}
                                                                                        className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all border text-xs font-semibold flex items-center gap-2 ${isSelected
                                                                                            ? "bg-brand-500 border-brand-500 text-white shadow-sm"
                                                                                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-500"
                                                                                            }`}
                                                                                    >
                                                                                        {item}
                                                                                        {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    ) : isThemeFont ? (
                                                                        <select
                                                                            value={section.content[field]}
                                                                            onChange={(e) => handleContentChange(activeTab, sectionKey, field, e.target.value)}
                                                                            className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-700 focus:border-brand-500 rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                                                                        >
                                                                            {fontOptions.map(font => (
                                                                                <option key={font} value={font}>{font}</option>
                                                                            ))}
                                                                        </select>
                                                                    ) : field.toLowerCase().includes('color') ? (
                                                                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/[0.03] p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                            <div
                                                                                className="h-8 w-8 rounded-md border border-gray-200 dark:border-gray-600 relative overflow-hidden shrink-0"
                                                                                style={{ backgroundColor: section.content[field] }}
                                                                            >
                                                                                <input
                                                                                    type="color"
                                                                                    value={section.content[field]}
                                                                                    onChange={(e) => handleContentChange(activeTab, sectionKey, field, e.target.value)}
                                                                                    className="absolute inset-0 opacity-0 cursor-pointer h-full w-full scale-150"
                                                                                />
                                                                            </div>
                                                                            <input
                                                                                type="text"
                                                                                value={section.content[field]}
                                                                                onChange={(e) => handleContentChange(activeTab, sectionKey, field, e.target.value)}
                                                                                className="flex-1 bg-transparent border-none outline-none text-xs font-mono uppercase"
                                                                                placeholder="#000000"
                                                                            />
                                                                        </div>
                                                                    ) : (field.toLowerCase().includes('url') || field.toLowerCase().includes('logo')) && !(['facebook', 'instagram', 'tiktok', 'twitter', 'linkedin', 'youtube'].some(social => field.toLowerCase().includes(social))) ? (
                                                                        <ImageUpload
                                                                            label={field.replace(/([A-Z])/g, ' $1').replace('Url', ' Image')}
                                                                            value={section.content[field]}
                                                                            onChange={(url) => handleContentChange(activeTab, sectionKey, field, url)}
                                                                        />
                                                                    ) : (
                                                                        <input
                                                                            type="text"
                                                                            value={section.content[field]}
                                                                            onChange={(e) => handleContentChange(activeTab, sectionKey, field, e.target.value)}
                                                                            className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-700 focus:border-brand-500 rounded-lg px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400"
                                                                            placeholder={`Enter ${field}...`}
                                                                        />
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* SPECIAL: Dynamic List Handler (ARRAY) */}
                                                    {section.content?.cards && (
                                                        <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <List className="w-5 h-5 text-brand-500" />
                                                                    <h3 className="text-sm font-bold text-gray-800 dark:text-white">Content Lists</h3>
                                                                </div>
                                                                <button onClick={() => addArrayItem(activeTab, sectionKey, 'cards')} className="flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm active:scale-95">
                                                                    <Plus className="w-3.5 h-3.5" /> Add Item
                                                                </button>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {section.content.cards.map((item: any, idx: number) => (
                                                                    <div key={idx} className="bg-gray-50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-200 dark:border-gray-700 relative group/card">
                                                                        <button onClick={() => removeArrayItem(activeTab, sectionKey, 'cards', idx)} className="absolute top-3 right-3 text-red-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover/card:opacity-100"><Trash2 className="w-4 h-4" /></button>
                                                                        <div className="space-y-4">
                                                                            <div className="space-y-1">
                                                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Title</label>
                                                                                <input value={item.title} onChange={(e) => handleArrayChange(activeTab, sectionKey, 'cards', idx, 'title', e.target.value)} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-brand-500 rounded-lg px-3 py-2 text-sm outline-none shadow-sm" />
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</label>
                                                                                <textarea rows={2} value={item.description} onChange={(e) => handleArrayChange(activeTab, sectionKey, 'cards', idx, 'description', e.target.value)} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-brand-500 rounded-lg px-3 py-2 text-sm outline-none resize-none shadow-sm" />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* SPECIAL: Live Picker for Categories/Items */}
                                                    {(section.content?.selectedCategoryIds || section.content?.selectedItemIds) && (
                                                        <div className="space-y-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                                                            {[
                                                                ['selectedCategoryIds', categories, 'Pick Categories'],
                                                                ['selectedItemIds', menuItems, 'Pick Menu Items']
                                                            ]
                                                                .filter(([field]) => section.content[field as string])
                                                                .map(([field, data, label]) => (
                                                                    <div key={field as string} className="space-y-4">
                                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50 dark:bg-white/[0.03] p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                                                            <div className="flex items-center gap-3">
                                                                                <List className="w-5 h-5 text-brand-500" />
                                                                                <label className="text-sm font-bold text-gray-800 dark:text-gray-200">{label as string}</label>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                                                                                <Search className="w-3.5 h-3.5 text-gray-400" />
                                                                                <input placeholder="Search..." className="bg-transparent border-none outline-none text-xs w-40 font-medium" onChange={(e) => setSearchTerm(e.target.value)} />
                                                                            </div>
                                                                        </div>
                                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1 custom-scrollbar">
                                                                            {(data as any[])
                                                                                .filter(item => (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()))
                                                                                .map(item => {
                                                                                    const isSelected = section.content[field as string]?.includes(item.id);
                                                                                    return (
                                                                                        <div
                                                                                            key={item.id}
                                                                                            onClick={() => toggleSelection(activeTab, sectionKey, field as string, item.id)}
                                                                                            className={`px-3 py-2.5 rounded-xl cursor-pointer transition-all border text-xs font-semibold flex items-center justify-between gap-2 ${isSelected ? "bg-brand-500 border-brand-500 text-white shadow-sm" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-brand-500"
                                                                                                }`}
                                                                                        >
                                                                                            <span className="truncate">{item.name}</span>
                                                                                            {isSelected && <Check className="w-3 h-3 shrink-0" />}
                                                                                        </div>
                                                                                    );
                                                                                })
                                                                            }
                                                                            {(data as any[]).length === 0 && (
                                                                                <div className="col-span-full py-8 text-center text-gray-400 text-xs border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                                                                    No data found.
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    )}
                                                    {/* SPECIAL: Embedded Managers */}
                                                    {(sectionKey === 'blogList' || sectionKey === 'faqList') && (
                                                        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                                                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] p-6 border-2 border-dashed border-gray-200 dark:border-gray-700">
                                                                {sectionKey === 'blogList' && <BlogsPage embedded={true} />}
                                                                {sectionKey === 'faqList' && <FaqsPage embedded={true} />}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
