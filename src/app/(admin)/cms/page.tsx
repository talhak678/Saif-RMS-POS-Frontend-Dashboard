"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import { ChevronDown, Save, Layout, Palette, Image as ImageIcon, Settings as SettingsIcon, Check, Search, Info, Phone, MessageSquare, Plus, Trash2, List } from "lucide-react";
import BlogsPage from "./blogs/page";
import FaqsPage from "./faqs/page";

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
                    openHours: "Mon-Sun: 9AM - 11PM"
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
                    openHours: "Mon-Sun: 9AM - 11PM"
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
                    openHours: "Mon-Sun: 9AM - 11PM"
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
                    backgroundColor: "#ffffff"
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

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div></div>;

    const pages = Object.keys(config);

    return (
        <div className="max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 px-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white flex items-center gap-4">
                        <div className="p-3 bg-brand-500 rounded-2xl text-white shadow-xl shadow-brand-500/20">
                            <Layout className="w-8 h-8" />
                        </div>
                        Website Designer
                    </h1>
                    <p className="text-gray-500 font-medium mt-2">Professional CMS to manage your restaurant's digital presence.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-3 bg-brand-500 hover:bg-brand-600 text-white px-10 py-4 rounded-2xl transition-all shadow-2xl hover:shadow-brand-500/40 disabled:opacity-50 font-black text-lg active:scale-95"
                >
                    {saving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Save className="w-6 h-6" />}
                    {saving ? "Publishing..." : "Publish Changes"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-white/20 dark:border-gray-800/50 rounded-[2.5rem] p-4 shadow-2xl">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 px-4">Navigation</h2>
                        <div className="space-y-3">
                            {pages.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => { setActiveTab(p); setExpandedSection(null); }}
                                    className={`w-full flex items-center justify-between px-6 py-5 rounded-[1.5rem] text-sm font-black capitalize transition-all duration-300 ${activeTab === p
                                        ? "bg-brand-500 text-white shadow-xl shadow-brand-500/30 scale-[1.02] translate-x-2"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:translate-x-1"
                                        }`}
                                >
                                    <div className="flex items-center gap-4 text-left">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeTab === p ? "bg-white/20" : "bg-gray-100 dark:bg-gray-800"}`}>
                                            {p === 'home' && <Layout className="w-4 h-4" />}
                                            {p === 'about' && <Info className="w-4 h-4" />}
                                            {p === 'contact' && <Phone className="w-4 h-4" />}
                                            {p === 'menu' && <List className="w-4 h-4" />}
                                            {p === 'blogs' && <MessageSquare className="w-4 h-4" />}
                                            {p === 'faq' && <Check className="w-4 h-4" />}
                                            {p === 'theme' && <Palette className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <div className="capitalize">{p === 'theme' ? 'Theme Config' : `${p} page`}</div>
                                            {!config[p].enabled && <div className="text-[8px] font-black uppercase text-red-500 bg-red-100/50 dark:bg-red-900/30 px-1.5 py-0.5 rounded-md w-fit">Hidden</div>}
                                        </div>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${activeTab === p ? "-rotate-90" : "opacity-0"}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-white/20 dark:border-gray-800/50 rounded-[3rem] p-10 shadow-2xl min-h-[700px]">
                        <div className="flex items-center gap-5 mb-10">
                            <div className="p-5 bg-brand-500/10 rounded-[1.75rem] text-brand-500">
                                <SettingsIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white capitalize">{activeTab === 'theme' ? 'Theme Configuration' : `${activeTab} Page Customizer`}</h2>
                                <p className="text-gray-500 font-medium">{activeTab === 'theme' ? 'Configure your website colors, fonts and logos.' : 'Toggle sections and edit content live.'}</p>
                            </div>
                        </div>

                        {/* Page Visibility Toggle */}
                        {activeTab !== 'theme' && (
                            <div className={`mb-12 p-8 rounded-[2.5rem] border-2 transition-all flex flex-col sm:flex-row items-center justify-between gap-6 ${config[activeTab].enabled ? 'bg-green-50/30 dark:bg-green-500/5 border-green-100/50 dark:border-green-900/20' : 'bg-red-50/30 dark:bg-red-500/5 border-red-100/50 dark:border-red-900/20 opacity-80'}`}>
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-shadow ${config[activeTab].enabled ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-red-500 text-white shadow-lg shadow-red-500/20'}`}>
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">Live on Website</h3>
                                        <p className="text-sm text-gray-500 font-medium">
                                            {config[activeTab].enabled ? "This page is reachable by customers." : "This page is currently disabled for customers."}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {config[activeTab].required && <span className="text-[10px] font-black uppercase text-brand-500 bg-brand-500/10 px-3 py-1.5 rounded-xl">Required Page</span>}
                                    <button
                                        onClick={() => handlePageToggle(activeTab)}
                                        className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all duration-300 ${config[activeTab].enabled ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-700"} ${config[activeTab].required ? "opacity-30 cursor-not-allowed" : "cursor-pointer active:scale-90 shadow-xl"}`}
                                    >
                                        <span className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-2xl transition-transform duration-300 ${config[activeTab].enabled ? "translate-x-11" : "translate-x-1"}`} />
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
                                        className={`group rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden ${isExpanded
                                            ? "border-brand-500 bg-white dark:bg-gray-900/50 shadow-2xl scale-[1.01]"
                                            : "border-gray-100 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-900/30"
                                            }`}
                                    >
                                        <div
                                            onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}
                                            className={`flex items-center justify-between p-8 cursor-pointer transition-colors ${isExpanded ? "bg-brand-50/30 dark:bg-brand-500/5" : ""}`}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-500 ${isExpanded ? "bg-brand-500 text-white rotate-[360deg] shadow-xl shadow-brand-500/30" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
                                                    <SettingsIcon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 dark:text-gray-100 capitalize tracking-tight text-xl">
                                                        {sectionKey.replace(/([A-Z])/g, ' $1')}
                                                    </p>
                                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.1em] mt-1 inline-block">Section Settings</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                {activeTab !== 'theme' && (
                                                    <button
                                                        onClick={(e) => handleToggle(activeTab, sectionKey, e)}
                                                        disabled={section.required}
                                                        className={`relative inline-flex h-9 w-16 items-center rounded-full transition-all duration-300 ${section.enabled ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-700"
                                                            } ${section.required ? "opacity-30 cursor-not-allowed" : "cursor-pointer active:scale-90 shadow-lg"}`}
                                                    >
                                                        <span className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-xl transition-transform duration-300 ${section.enabled ? "translate-x-8" : "translate-x-1"}`} />
                                                    </button>
                                                )}
                                                <ChevronDown className={`w-6 h-6 transition-transform duration-500 ${isExpanded ? "rotate-180 text-brand-500" : "text-gray-300"}`} />
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="p-10 border-t border-gray-100 dark:border-gray-800 space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
                                                {/* Section Basic Fields */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    {Object.keys(section.content || {}).filter(k => k !== 'cards' && k !== 'selectedCategoryIds' && k !== 'selectedItemIds').map((field) => {
                                                        const isThemeColor = activeTab === 'theme' && sectionKey === 'colors';
                                                        const isThemeFont = activeTab === 'theme' && sectionKey === 'fonts';

                                                        const fieldDescriptions: any = {
                                                            primaryColor: "Used for buttons, icons, highlights & primary brand elements.",
                                                            secondaryColor: "Used for secondary buttons, subtitles & accent text.",
                                                            accentColor: "Used for light borders, soft backgrounds & subtle highlights.",
                                                            backgroundColor: "The main background color of the entire website canvas.",
                                                            primaryFont: "Primary typeface used for headings and prominent text.",
                                                            secondaryFont: "Secondary typeface used for body text and paragraphs."
                                                        };

                                                        const fontOptions = ['Outfit', 'Inter', 'Poppins', 'Roboto', 'Montserrat', 'Oswald', 'Raleway', 'Playfair Display', 'Lora'];

                                                        return (
                                                            <div key={field} className={`${field === 'description' || field === 'address' || field === 'menuItems' ? 'md:col-span-2' : ''} space-y-3`}>
                                                                <div className="flex flex-col gap-1">
                                                                    <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{field.replace(/([A-Z])/g, ' $1')}</label>
                                                                    {fieldDescriptions[field] && <p className="text-[10px] text-brand-500/70 font-bold ml-1">{fieldDescriptions[field]}</p>}
                                                                </div>
                                                                {field === 'description' || field === 'address' ? (
                                                                    <textarea
                                                                        rows={3}
                                                                        value={section.content[field]}
                                                                        onChange={(e) => handleContentChange(activeTab, sectionKey, field, e.target.value)}
                                                                        className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 rounded-[1.5rem] px-6 py-5 text-sm font-bold outline-none transition-all shadow-inner"
                                                                        placeholder={`Enter ${field}...`}
                                                                    />
                                                                ) : field === 'menuItems' ? (
                                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-100/50 dark:bg-gray-800/50 p-6 rounded-[2rem] border-2 border-white dark:border-gray-800 shadow-inner">
                                                                        {["Home", "Our Menu", "About Us", "Contact Us", "Blogs"].map((item) => {
                                                                            const currentItems = (section.content[field] || "").split(",").map((i: string) => i.trim()).filter(Boolean);
                                                                            const isSelected = currentItems.includes(item);
                                                                            return (
                                                                                <div
                                                                                    key={item}
                                                                                    onClick={() => {
                                                                                        let newItems;
                                                                                        if (isSelected) {
                                                                                            if (currentItems.length <= 1) {
                                                                                                toast.error("At least one menu item required!");
                                                                                                return;
                                                                                            }
                                                                                            newItems = currentItems.filter((i: string) => i !== item);
                                                                                        } else {
                                                                                            newItems = [...currentItems, item];
                                                                                        }
                                                                                        handleContentChange(activeTab, sectionKey, field, newItems.join(", "));
                                                                                    }}
                                                                                    className={`p-5 rounded-[1.5rem] cursor-pointer transition-all duration-300 border-2 flex items-center justify-between gap-3 ${isSelected
                                                                                        ? "bg-brand-500 border-brand-500 text-white shadow-xl shadow-brand-500/30 scale-[1.03]"
                                                                                        : "bg-white dark:bg-gray-900 border-white dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-900/40 text-gray-500 dark:text-gray-400 hover:text-brand-500 shadow-sm"
                                                                                        }`}
                                                                                >
                                                                                    <span className="text-xs font-black uppercase tracking-wider">{item}</span>
                                                                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isSelected ? "bg-white text-brand-500" : "bg-gray-100 dark:bg-gray-800"}`}>
                                                                                        {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                ) : isThemeFont ? (
                                                                    <select
                                                                        value={section.content[field]}
                                                                        onChange={(e) => handleContentChange(activeTab, sectionKey, field, e.target.value)}
                                                                        className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 rounded-2xl px-6 py-5 text-sm font-bold outline-none transition-all shadow-inner appearance-none"
                                                                    >
                                                                        {fontOptions.map(font => (
                                                                            <option key={font} value={font}>{font}</option>
                                                                        ))}
                                                                    </select>
                                                                ) : field.toLowerCase().includes('color') ? (
                                                                    <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border-2 border-transparent focus-within:border-brand-500 transition-all">
                                                                        <div
                                                                            className="h-12 w-12 rounded-xl cursor-pointer border-2 border-white/20 shadow-lg relative overflow-hidden"
                                                                            style={{ backgroundColor: section.content[field] }}
                                                                        >
                                                                            <input
                                                                                type="color"
                                                                                value={section.content[field]}
                                                                                onChange={(e) => handleContentChange(activeTab, sectionKey, field, e.target.value)}
                                                                                className="absolute inset-0 opacity-0 cursor-pointer h-20 w-20"
                                                                            />
                                                                        </div>
                                                                        <input
                                                                            type="text"
                                                                            value={section.content[field]}
                                                                            onChange={(e) => handleContentChange(activeTab, sectionKey, field, e.target.value)}
                                                                            className="flex-1 bg-transparent border-none outline-none text-sm font-bold"
                                                                            placeholder="#000000"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <input
                                                                        type="text"
                                                                        value={section.content[field]}
                                                                        onChange={(e) => handleContentChange(activeTab, sectionKey, field, e.target.value)}
                                                                        className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 rounded-2xl px-6 py-5 text-sm font-bold outline-none transition-all shadow-inner"
                                                                        placeholder={`Enter ${field}...`}
                                                                    />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* SPECIAL: Dynamic List Handler (ARRAY) */}
                                                {section.content?.cards && (
                                                    <div className="space-y-8 pt-8 border-t border-gray-50 dark:border-gray-800">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div className="p-3 bg-brand-500/10 rounded-xl text-brand-500">
                                                                    <List className="w-5 h-5" />
                                                                </div>
                                                                <h3 className="text-xl font-black text-gray-800 dark:text-white">Content Capsules</h3>
                                                            </div>
                                                            <button onClick={() => addArrayItem(activeTab, sectionKey, 'cards')} className="flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-xl shadow-brand-500/20 active:scale-95">
                                                                <Plus className="w-4 h-4" /> Add More Details
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {section.content.cards.map((item: any, idx: number) => (
                                                                <div key={idx} className="bg-gray-50/50 dark:bg-gray-800/40 p-8 rounded-[2rem] border-2 border-transparent hover:border-brand-500/20 transition-all relative group/card shadow-sm">
                                                                    <button onClick={() => removeArrayItem(activeTab, sectionKey, 'cards', idx)} className="absolute top-6 right-6 text-red-400 hover:text-red-500 bg-white dark:bg-gray-900 p-2 rounded-xl shadow-lg opacity-0 group-hover/card:opacity-100 transition-all"><Trash2 className="w-5 h-5" /></button>
                                                                    <div className="space-y-6">
                                                                        <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Title</label>
                                                                            <input value={item.title} onChange={(e) => handleArrayChange(activeTab, sectionKey, 'cards', idx, 'title', e.target.value)} className="w-full bg-white dark:bg-gray-900 border-2 border-transparent focus:border-brand-500 rounded-2xl px-5 py-4 text-sm font-black outline-none shadow-sm" /></div>
                                                                        <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                                                                            <textarea rows={3} value={item.description} onChange={(e) => handleArrayChange(activeTab, sectionKey, 'cards', idx, 'description', e.target.value)} className="w-full bg-white dark:bg-gray-900 border-2 border-transparent focus:border-brand-500 rounded-2xl px-5 py-4 text-sm font-bold outline-none resize-none shadow-sm" /></div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* SPECIAL: Live Picker for Categories/Items */}
                                                {(section.content?.selectedCategoryIds || section.content?.selectedItemIds) && (
                                                    <div className="space-y-10 pt-8 border-t border-gray-50 dark:border-gray-800">
                                                        {[
                                                            ['selectedCategoryIds', categories, 'Pick Categories'],
                                                            ['selectedItemIds', menuItems, 'Pick Menu Items']
                                                        ]
                                                            .filter(([field]) => section.content[field as string])
                                                            .map(([field, data, label]) => (
                                                                <div key={field as string} className="space-y-6">
                                                                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border-2 border-white dark:border-gray-700">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center text-brand-500"><List className="w-5 h-5" /></div>
                                                                            <label className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest ml-1">{label as string}</label>
                                                                        </div>
                                                                        <div className="flex items-center gap-3 bg-white dark:bg-gray-900 px-5 py-2.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                                                            <Search className="w-4 h-4 text-gray-400" />
                                                                            <input placeholder="Quick search..." className="bg-transparent border-none outline-none text-sm w-48 font-bold" onChange={(e) => setSearchTerm(e.target.value)} />
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-80 overflow-y-auto no-scrollbar p-1">
                                                                        {(data as any[])
                                                                            .filter(item => (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()))
                                                                            .map(item => {
                                                                                const isSelected = section.content[field as string]?.includes(item.id);
                                                                                return (
                                                                                    <div
                                                                                        key={item.id}
                                                                                        onClick={() => toggleSelection(activeTab, sectionKey, field as string, item.id)}
                                                                                        className={`p-5 rounded-3xl cursor-pointer transition-all border-2 flex items-center justify-between gap-2 overflow-hidden ${isSelected ? "bg-brand-500 border-brand-500 text-white shadow-xl shadow-brand-500/30 scale-[1.05]" : "bg-white dark:bg-gray-800 border-white dark:border-gray-700 hover:border-brand-200 shadow-sm"
                                                                                            }`}
                                                                                    >
                                                                                        <span className="text-[11px] font-black truncate">{item.name}</span>
                                                                                        {isSelected && <Check className="w-4 h-4 shrink-0" />}
                                                                                    </div>
                                                                                );
                                                                            })
                                                                        }
                                                                        {(data as any[]).length === 0 && (
                                                                            <div className="col-span-full py-10 text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
                                                                                No data found. Check your {field === 'selectedCategoryIds' ? 'Categories' : 'Menu Items'} module.
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
    );
}
