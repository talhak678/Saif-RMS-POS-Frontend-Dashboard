"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import {
    ChevronDown, Save, Layout, Palette, Image as ImageIcon, Settings as SettingsIcon, Check,
    Search, Info, Phone, MessageSquare, Plus, Trash2, List, Star, Quote, Copyright,
    Video, Type, FileText, HelpCircle, CreditCard, PanelTop, PanelBottom, MousePointer2,
    Shield,
    X
} from "lucide-react";
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
                    logoUrl: "",
                    menuItems: "Home, Our Menu, About Us, Contact Us, Blogs",
                    showCart: "true",
                    showLogin: "true"
                }
            },
            banner: {
                required: true, enabled: true,
                content: { title: "Delicious Food For You", subtitle: "Best quality food in town", description: "Discover the best culinary experience with our expertly crafted dishes prepared with the freshest ingredients.", imageUrl: "", buttonText: "Order Now", buttonLink: "/our-menu-1" }
            },
            browseMenu: {
                required: false, enabled: true,
                content: { title: "Browse Our Menu", selectedCategoryIds: [] }
            },
            todaysSpecial: {
                required: false, enabled: false,
                content: { title: "Today's Special", description: "Special items for today only", selectedItemIds: [], backgroundColor: "#222222", backgroundImageUrl: "" }
            },
            ourMenu: {
                required: true, enabled: true,
                content: { title: "Our Regular Menu", selectedCategoryIds: [] }
            },
            customerComments: {
                required: false, enabled: false,
                content: { title: "What Our Customers Say", selectedReviewIds: [] }
            },
            footer: {
                required: true, enabled: true,
                content: {
                    backgroundColor: "#0d0d0d",
                    logoTitle: "Saif RMS",
                    description: "Quality food delivered to your doorstep. Experience the best culinary delights with us.",
                    newsletterTitle: "Subscribe To Our Newsletter",
                    newsletterPlaceholder: "Enter Your Email",
                    newsletterButtonText: "Subscribe",
                    contactTitle: "CONTACT",
                    address: "123 Street, City, Country",
                    contactPhone: "+123 456 789",
                    contactEmail: "info@example.com",
                    linksTitle: "OUR LINKS",
                    links: "Home, About Us, Our Menu, Contact Us, FAQ",
                    servicesTitle: "OUR SERVICES",
                    services: "Fast Delivery, Seat Reservation, Pickup In Store, Online Order, Table Booking",
                    helpCenterTitle: "HELP CENTER",
                    helpCenter: "Support, Terms & Conditions, Privacy Policy, Account, Feedback",
                    facebook: "",
                    instagram: "",
                    tiktok: ""
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
            // footer: {
            //     required: true, enabled: true,
            //     content: {
            //         address: "123 Street, City, Country",
            //         description: "Quality food delivered to your doorstep.",
            //         contactEmail: "info@example.com",
            //         contactPhone: "+123456789",
            //         facebook: "",
            //         instagram: "",
            //         tiktok: "",
            //         openHours: "Mon-Sun: 9AM - 11PM",
            //         menuItems: "Home, Our Menu, Contact Us, About Us, FAQ"
            //     }
            // },
            // copyrightBar: {
            //     required: false, enabled: false,
            //     content: { text: "Copyright 2026 Saif RMS. All Rights Reserved." }
            // },
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
            // footer: {
            //     required: true, enabled: true,
            //     content: {
            //         address: "123 Street, City, Country",
            //         description: "Quality food delivered to your doorstep.",
            //         contactEmail: "info@example.com",
            //         contactPhone: "+123456789",
            //         facebook: "",
            //         instagram: "",
            //         tiktok: "",
            //         openHours: "Mon-Sun: 9AM - 11PM",
            //         menuItems: "Home, Our Menu, Contact Us, About Us, FAQ"
            //     }
            // },
            // copyrightBar: {
            //     required: false, enabled: false,
            //     content: { text: "Copyright 2026 Saif RMS. All Rights Reserved." }
            // },
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

const getSectionIcon = (key: string) => {
    switch (key) {
        case 'header': return <PanelTop className="w-5 h-5" />;
        case 'banner': return <ImageIcon className="w-5 h-5" />;
        case 'browseMenu': return <MousePointer2 className="w-5 h-5" />;
        case 'todaysSpecial': return <Star className="w-5 h-5" />;
        case 'ourMenu':
        case 'menuGallery': return <List className="w-5 h-5" />;
        case 'customerComments': return <Quote className="w-5 h-5" />;
        case 'footer': return <PanelBottom className="w-5 h-5" />;
        case 'copyrightBar': return <Copyright className="w-5 h-5" />;
        case 'video': return <Video className="w-5 h-5" />;
        case 'whatWeDo': return <Shield className="w-5 h-5" />;
        case 'cards': return <CreditCard className="w-5 h-5" />;
        case 'form': return <FileText className="w-5 h-5" />;
        case 'blogList': return <MessageSquare className="w-5 h-5" />;
        case 'faqList': return <HelpCircle className="w-5 h-5" />;
        case 'colors': return <Palette className="w-5 h-5" />;
        case 'fonts': return <Type className="w-5 h-5" />;
        case 'logos': return <ImageIcon className="w-5 h-5" />;
        default: return <SettingsIcon className="w-5 h-5" />;
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
    const [reviews, setReviews] = useState<any[]>([]);

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
                                    if (sec === 'customerComments') {
                                        if (!mergedConfig[page].sections[sec].content.selectedReviewIds)
                                            mergedConfig[page].sections[sec].content.selectedReviewIds = [];
                                    }
                                    // Remove redundant logo from header (centralized in branding)
                                    if (page === 'home' && sec === 'header') {
                                        delete mergedConfig[page].sections[sec].content.logoUrl;
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
            const [catRes, itemRes, reviewRes] = await Promise.all([
                api.get("/categories"),
                api.get("/menu-items"),
                api.get("/customers/reviews")
            ]);
            console.log("CMS Data Fetch:", { categories: catRes.data, items: itemRes.data, reviews: reviewRes.data });
            if (catRes.data?.success) setCategories(catRes.data.data || []);
            if (itemRes.data?.success) setMenuItems(itemRes.data.data || []);
            if (reviewRes.data?.success) {
                // Map reviews to have a 'name' property for the searchable picker
                const mappedReviews = (reviewRes.data.data?.reviews || []).map((r: any) => ({
                    ...r,
                    name: `${r.order?.customer?.name || 'Guest'}: ${r.comment?.substring(0, 30)}...`
                }));
                setReviews(mappedReviews);
            }
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
                                                <span>{p === 'theme' ? 'Branding' : p === 'faq' ? 'FAQs' : p}</span>
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
                                            className={`rounded-xl border transition-all overflow-hidden ${isExpanded
                                                ? "border-brand-500 ring-1 ring-brand-500/10 bg-white dark:bg-white/[0.03]"
                                                : "border-gray-200 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-500/30"
                                                }`}
                                        >
                                            <div
                                                onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}
                                                className={`flex items-center justify-between p-4 cursor-pointer transition-colors rounded-t-xl ${isExpanded ? "bg-brand-50 dark:bg-brand-500/5" : ""}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${isExpanded ? "bg-brand-500 text-white shadow-md shadow-brand-500/20" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
                                                        {getSectionIcon(sectionKey)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 dark:text-gray-200 capitalize text-sm">
                                                            {sectionKey.replace(/([A-Z])/g, ' $1')}
                                                        </p>
                                                        {/* <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Configure Content</span> */}
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
                                                        {Object.keys(section.content || {}).filter(k => k !== 'cards' && k !== 'selectedCategoryIds' && k !== 'selectedItemIds' && k !== 'selectedReviewIds').map((field) => {
                                                            const isThemeColor = activeTab === 'theme' && sectionKey === 'colors';
                                                            const isThemeFont = activeTab === 'theme' && sectionKey === 'fonts';

                                                            const fieldDescriptions: any = {
                                                                primaryColor: "Primary brand color",
                                                                secondaryColor: "Accent color",
                                                                accentColor: "Subtle highlight color",
                                                                backgroundColor: "Site background",
                                                                textColor: "Main text color",
                                                            };

                                                            const fontOptions = ['Outfit', 'Inter', 'Poppins', 'Roboto', 'Montserrat', 'Playfair Display', 'Open Sans', 'Lato', 'Lora', 'Merriweather'];


                                                            const isImageField = (field.toLowerCase().includes('url') || field.toLowerCase().includes('logo') || field.toLowerCase().includes('favicon')) && !(['facebook', 'instagram', 'tiktok', 'twitter', 'linkedin', 'youtube'].some(social => field.toLowerCase().includes(social)));

                                                            const isBooleanField = field === 'showCart' || field === 'showLogin';

                                                            const displayLabel =
                                                                field === 'title' ? 'Heading' :
                                                                    field === 'subtitle' ? 'Subheading' :
                                                                        field === 'backgroundColor' ? 'Section Background Color' :
                                                                            field === 'backgroundImageUrl' ? 'Section Background Image' :
                                                                                field === 'showCart' ? 'Show Cart Button' :
                                                                                    field === 'showLogin' ? 'Show Login Button' :
                                                                                        field.replace(/([A-Z])/g, ' $1');

                                                            return (
                                                                <div key={field} className={`${field === 'description' || field === 'address' || field === 'menuItems' || isImageField ? 'md:col-span-2' : ''} space-y-1.5`}>
                                                                    {!isImageField && <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize">{displayLabel}</label>}
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
                                                                    ) : isBooleanField ? (
                                                                        /* ── BOOLEAN TOGGLE ── */
                                                                        <div className="flex items-center gap-4 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
                                                                            <span className={`text-xs font-bold ${section.content[field] === 'true' || section.content[field] === true ? 'text-green-600' : 'text-red-500'}`}>
                                                                                {section.content[field] === 'true' || section.content[field] === true ? '✓ Enabled' : '✗ Disabled'}
                                                                            </span>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleContentChange(activeTab, sectionKey, field, String(!(section.content[field] === 'true' || section.content[field] === true)))}
                                                                                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 focus:outline-none ${(section.content[field] === 'true' || section.content[field] === true)
                                                                                    ? 'bg-brand-500 shadow-md shadow-brand-500/30'
                                                                                    : 'bg-gray-300 dark:bg-gray-700'
                                                                                    }`}
                                                                            >
                                                                                <span className={`inline-flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${(section.content[field] === 'true' || section.content[field] === true) ? 'translate-x-8' : 'translate-x-1'
                                                                                    }`}>
                                                                                    {(section.content[field] === 'true' || section.content[field] === true)
                                                                                        ? <Check className="w-2.5 h-2.5 text-brand-500" />
                                                                                        : <X className="w-2.5 h-2.5 text-gray-400" />
                                                                                    }
                                                                                </span>
                                                                            </button>
                                                                            <div className="flex items-center gap-2 ml-2">
                                                                                {['true', 'false'].map((opt) => (
                                                                                    <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                                                                                        <input
                                                                                            type="radio"
                                                                                            name={`${sectionKey}-${field}`}
                                                                                            checked={String(section.content[field]) === opt}
                                                                                            onChange={() => handleContentChange(activeTab, sectionKey, field, opt)}
                                                                                            className="accent-brand-500 w-3.5 h-3.5"
                                                                                        />
                                                                                        <span className={`text-xs font-semibold capitalize ${opt === 'true' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                                                                                            }`}>{opt === 'true' ? 'Yes' : 'No'}</span>
                                                                                    </label>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    ) : (field.toLowerCase().includes('url') || field.toLowerCase().includes('logo') || field.toLowerCase().includes('favicon')) && !(['facebook', 'instagram', 'tiktok', 'twitter', 'linkedin', 'youtube'].some(social => field.toLowerCase().includes(social))) ? (
                                                                        /* ── IMAGE UPLOAD ── */
                                                                        <div className="space-y-1.5">
                                                                            <div className="flex items-center justify-between">
                                                                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize">{displayLabel}</label>
                                                                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700">
                                                                                    {field === 'logoUrl' ? '(90×90)' : field.toLowerCase().includes('favicon') ? '(32×32)' : sectionKey === 'banner' ? '(1920×1080)' : '(400×200)'}
                                                                                </span>
                                                                            </div>
                                                                            <ImageUpload
                                                                                label=""
                                                                                value={section.content[field]}
                                                                                onChange={(url) => handleContentChange(activeTab, sectionKey, field, url)}
                                                                                isBanner={sectionKey === 'banner'}
                                                                                isLogo={!!(field === 'logoUrl' || field.toLowerCase().includes('logo') || field.toLowerCase().includes('favicon'))}
                                                                            />
                                                                        </div>
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

                                                    {/* SPECIAL: Live Picker for Categories/Items/Reviews */}
                                                    {(section.content?.selectedCategoryIds || section.content?.selectedItemIds || section.content?.selectedReviewIds) && (
                                                        <div className="space-y-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                                                            {[
                                                                ['selectedCategoryIds', categories, 'Pick Categories'],
                                                                ['selectedItemIds', menuItems, 'Pick Menu Items'],
                                                                ['selectedReviewIds', reviews, 'Pick Customer Reviews']
                                                            ]
                                                                .filter(([field]) => section.content[field as string])
                                                                .map(([field, data, label]) => {
                                                                    const isReviewPicker = field === 'selectedReviewIds';
                                                                    return (
                                                                        <div key={field as string} className="space-y-4">
                                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50 dark:bg-white/[0.03] p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                                                                <div className="flex items-center gap-3">
                                                                                    {isReviewPicker ? <Quote className="w-5 h-5 text-brand-500" /> : <List className="w-5 h-5 text-brand-500" />}
                                                                                    <label className="text-sm font-bold text-gray-800 dark:text-gray-200">{label as string}</label>
                                                                                </div>
                                                                                {!isReviewPicker && (
                                                                                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                                                                                        <Search className="w-3.5 h-3.5 text-gray-400" />
                                                                                        <input placeholder="Search..." className="bg-transparent border-none outline-none text-xs w-40 font-medium" onChange={(e) => setSearchTerm(e.target.value)} />
                                                                                    </div>
                                                                                )}
                                                                            </div>

                                                                            {isReviewPicker ? (
                                                                                /* ── REVIEW CARD GRID ── */
                                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 custom-scrollbar">
                                                                                    {(data as any[]).map(review => {
                                                                                        const isSelected = section.content[field as string]?.includes(review.id);
                                                                                        return (
                                                                                            <div
                                                                                                key={review.id}
                                                                                                onClick={() => toggleSelection(activeTab, sectionKey, field as string, review.id)}
                                                                                                className={`p-4 rounded-2xl cursor-pointer transition-all border-2 relative flex flex-col gap-3 h-full group ${isSelected
                                                                                                    ? "bg-brand-50 border-brand-500 scale-[0.98] shadow-sm shadow-brand-500/10"
                                                                                                    : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-brand-200"
                                                                                                    }`}
                                                                                            >
                                                                                                <div className="flex items-start justify-between">
                                                                                                    <div className="flex gap-0.5">
                                                                                                        {[...Array(5)].map((_, i) => (
                                                                                                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                                                                                                        ))}
                                                                                                    </div>
                                                                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${isSelected ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-transparent border border-gray-200 dark:border-gray-600 group-hover:border-brand-500 group-hover:text-brand-500"}`}>
                                                                                                        <Check className="w-3 h-3" />
                                                                                                    </div>
                                                                                                </div>
                                                                                                <p className="text-xs text-gray-600 dark:text-gray-400 italic font-medium line-clamp-3 leading-relaxed">
                                                                                                    "{review.comment || 'No comment provided'}"
                                                                                                </p>
                                                                                                <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-700/50">
                                                                                                    <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200">
                                                                                                        {review.order?.customer?.name || "Verified Guest"}
                                                                                                    </p>
                                                                                                    <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                                                                                                        Customer
                                                                                                    </p>
                                                                                                </div>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            ) : (
                                                                                /* ── NORMAL LIST GRID (Items/Categories) ── */
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
                                                                                </div>
                                                                            )}

                                                                            {(data as any[]).length === 0 && (
                                                                                <div className="py-8 text-center text-gray-400 text-xs border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                                                                    No {label} found.
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
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
