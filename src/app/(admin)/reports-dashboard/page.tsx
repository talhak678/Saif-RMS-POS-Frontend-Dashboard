"use client";

import React, { useState, useEffect } from "react";
import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    BarChart,
} from "recharts";
import { Download, Calendar } from "lucide-react";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import { ProtectedRoute } from "@/services/protected-route";
import { useAuth } from "@/services/permission.service";
import Loader from "@/components/common/Loader";
import DatePicker from "@/components/common/DatePicker";

const TABS = [
    "Analytics",
    "Order & Customers",
    "Inventory",
    "Restaurant & Branches",
    "Menu & Categories",
];

export default function ReportsDashboard() {
    const { user } = useAuth();
    const isSuperAdmin = user?.role?.name === 'SUPER_ADMIN';

    const [activeTab, setActiveTab] = useState(0);
    const [timeRange, setTimeRange] = useState("daily");
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    const fetchRestaurants = async () => {
        try {
            const res = await api.get("/restaurants");
            if (res.data?.success) {
                setRestaurants(res.data.data || []);
            }
        } catch (err) {
            console.error("Fetch restaurants failed", err);
        }
    };

    const fetchReports = async (restaurantId?: string) => {
        const idToUse = restaurantId || selectedRestaurantId;

        // If super admin and no restaurant selected, don't fetch
        if (isSuperAdmin && !idToUse) return;

        // IF EITHER DATE IS SELECTED, BOTH MUST BE SELECTED
        if ((startDate && !endDate) || (!startDate && endDate)) {
            return;
        }

        try {
            setLoading(true);
            const params: any = {};
            if (idToUse) params.restaurantId = idToUse;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const res = await api.get("/reports", {
                params: params
            });
            if (res.data.success) {
                setReportData(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch reports:", error);
            toast.error("Failed to load reports data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isSuperAdmin) {
            fetchRestaurants();
        } else {
            fetchReports();
        }
    }, [isSuperAdmin]);

    // Handle date filtering
    useEffect(() => {
        if (isSuperAdmin && !selectedRestaurantId) return;
        fetchReports();
    }, [startDate, endDate]);

    // Handle restaurant change
    const handleRestaurantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedRestaurantId(id);
        if (!id) {
            setReportData(null);
        }
        // fetchReports will be triggered if no dates or both dates are present
        // But since we want immediate response on restaurant change:
        fetchReports(id);
    };

    const handleDownload = async () => {
        toast.success("Preparing download...");
    };

    const filteredTabs = isSuperAdmin
        ? TABS.filter(tab => tab === "Analytics" || tab === "Restaurant & Branches" || tab === "Order & Customers")
        : TABS;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader size="md" />
            </div>
        );
    }

    // if (!reportData) return null;


    return (
        <ProtectedRoute module="dashboard:reports">
            <div className="min-h-screen bg-white dark:bg-gray-900">
                {/* Minimal Tab Navigation */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                    <div className="max-w-[1400px] mx-auto px-6">
                        <div className="flex gap-10 overflow-x-auto scrollbar-hide pt-4">
                            {filteredTabs.map((tab) => {
                                const originalIndex = TABS.indexOf(tab);
                                const isSelected = activeTab === originalIndex;
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(originalIndex)}
                                        className={`pb-4 text-sm font-bold transition-all relative ${isSelected
                                            ? "text-blue-600 border-b-2 border-blue-600"
                                            : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="max-w-[1400px] mx-auto px-6 py-8">
                    {/* Simplified Filter Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div className="flex items-center gap-4">
                            {isSuperAdmin && (
                                <div className="flex items-center gap-2">
                                    <select
                                        value={selectedRestaurantId}
                                        onChange={handleRestaurantChange}
                                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">Select Restaurant</option>
                                        {restaurants.map((res) => (
                                            <option key={res.id} value={res.id}>{res.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-4 bg-white dark:bg-gray-800 px-6 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:border-brand-500 min-w-[320px]">
                                    <div className="flex flex-1 items-center gap-2">
                                        <span className="text-[10px] uppercase font-black text-gray-400">From</span>
                                        <DatePicker
                                            value={startDate}
                                            onChange={setStartDate}
                                            placeholder="Select"
                                            className="text-xs font-bold text-gray-700 dark:text-gray-200"
                                        />
                                    </div>
                                    <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-700 mx-2"></div>
                                    <div className="flex flex-1 items-center gap-2">
                                        <span className="text-[10px] uppercase font-black text-gray-400">To</span>
                                        <DatePicker
                                            value={endDate}
                                            onChange={setEndDate}
                                            placeholder="Select"
                                            className="text-xs font-bold text-gray-700 dark:text-gray-200"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest"
                        >
                            <Download size={16} />
                            Export
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center min-h-[40vh]">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                                <p className="text-gray-500 font-medium">Loading reports...</p>
                            </div>
                        </div>
                    ) : !reportData ? (
                        <div className="flex flex-col items-center justify-center min-h-[40vh] bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 text-blue-600">
                                <Calendar size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {isSuperAdmin ? "Please Select a Restaurant" : "No Report Data Available"}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                                {isSuperAdmin
                                    ? "Select a restaurant from the dropdown above to view its analytics and performance reports."
                                    : "We couldn't find any report data for the selected period."}
                            </p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-300">
                            {activeTab === 0 && <AnalyticsTab data={reportData} timeRange={timeRange} setTimeRange={setTimeRange} />}
                            {activeTab === 1 && <OrdersCustomersTab data={reportData.ordersCustomers} />}
                            {activeTab === 2 && <InventoryTab data={reportData.inventory} />}
                            {activeTab === 3 && <BranchesTab data={reportData.branches} />}
                            {activeTab === 4 && <MenuCategoriesTab data={reportData.menuCategories} />}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}

// Tab 1: Analytics
function AnalyticsTab({ data, timeRange, setTimeRange }: { data: any; timeRange: string; setTimeRange: (range: string) => void }) {
    const chartData = data.salesTrend[timeRange] || data.salesTrend.daily;

    return (
        <div className="space-y-12">
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight">Sales trend</h2>

                    <div className="bg-gray-100 dark:bg-gray-900 p-1 rounded-xl flex gap-1 border border-gray-200 dark:border-gray-800">
                        {["daily", "weekly", "monthly"].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-5 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${timeRange === range
                                    ? "bg-white dark:bg-gray-700 text-blue-600"
                                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    }`}
                            >
                                {range === 'daily' ? 'Days' : range === 'weekly' ? 'Weeks' : 'Months'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-[450px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:opacity-10" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }}
                                dy={15}
                            />
                            <YAxis
                                yAxisId="left"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                                tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}`}
                                width={50}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                                width={50}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                cursor={{ fill: 'transparent' }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                align="left"
                                iconType="circle"
                                wrapperStyle={{ paddingTop: '40px' }}
                            />
                            <Bar
                                yAxisId="left"
                                dataKey="sales"
                                fill="#3B82F6"
                                name="Net sales ($)"
                                radius={[6, 6, 0, 0]}
                                barSize={60}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="orders"
                                stroke="#7F8C9E"
                                strokeWidth={2}
                                name="Order count"
                                dot={{ fill: "#7F8C9E", r: 4 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Cards - Matching Reference */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Payments ($)"
                    value={data.summary.payments.total.toLocaleString()}
                    change={data.summary.payments.change}
                    itemLabel="Amount"
                />
                <StatCard
                    title="Revenue ($)"
                    value={data.summary.revenue.total.toLocaleString()}
                    change={data.summary.revenue.change}
                    itemLabel="Amount"
                />
                <StatCard
                    title="Tips ($)"
                    value={data.summary.tips.total.toLocaleString()}
                    change={data.summary.tips.change}
                    itemLabel="Amount"
                />
            </div>
        </div>
    );
}

function StatCard({ title, value, change, itemLabel }: any) {
    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-8">
                {title}
                <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-[10px] text-gray-400">i</div>
            </h3>
            <div className="flex justify-between items-center text-sm font-medium text-gray-400 mb-2">
                <span>{itemLabel}</span>
                <span>Change</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">${value}</span>
                <span className={`text-sm font-bold ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
                </span>
            </div>
        </div>
    );
}

// Tab 2: Orders & Customers
function OrdersCustomersTab({ data }: { data: any }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-8">Order Source</h3>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.orderSource}
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.orderSource.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-8">Top Locations</h3>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.customerLocations}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="area" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Bar dataKey="orders" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

// Tab 3: Inventory
function InventoryTab({ data }: { data: any }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-8">Stock Usage</h3>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.stockConsumption} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis dataKey="ingredient" type="category" axisLine={false} tickLine={false} width={120} />
                            <Tooltip />
                            <Bar dataKey="consumed" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={25} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-8">Recipe Popularity</h3>
                <div className="space-y-4">
                    {data.recipePopularity.map((recipe: any, index: number) => (
                        <div key={recipe.recipe} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-gray-400">#{index + 1}</span>
                                <span className="font-bold text-gray-900 dark:text-gray-100">{recipe.recipe}</span>
                            </div>
                            <span className="font-bold text-blue-600">${recipe.revenue.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Tab 4: Branches
function BranchesTab({ data }: { data: any }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-8">Branch Comparison</h3>
            <div className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.salesPerBranch}>
                        <XAxis dataKey="branch" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="sales" name="Sales ($)" fill="#3B82F6" barSize={35} />
                        <Bar dataKey="orders" name="Orders" fill="#7F8C9E" barSize={35} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// Tab 5: Menu 
function MenuCategoriesTab({ data }: { data: any }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-8">Category Revenue</h3>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={data.salesByCategory} dataKey="value" innerRadius={80} outerRadius={110} paddingAngle={5}>
                                {data.salesByCategory.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-8">Top Items</h3>
                <div className="space-y-4">
                    {data.topSellingItems.map((item: any, index: number) => (
                        <div key={item.item} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <span className="font-bold text-gray-900 dark:text-gray-100">{item.item}</span>
                            <span className="font-bold text-green-500">${item.sales.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
