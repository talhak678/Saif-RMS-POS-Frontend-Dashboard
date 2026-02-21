"use client";

import { useState } from "react";
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
} from "recharts";
import { Calendar, Download, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users } from "lucide-react";
import {
    analyticsData,
    ordersCustomersData,
    inventoryData,
    branchesData,
    menuCategoriesData,
} from "@/data/mockData";
import { ProtectedRoute } from "@/services/protected-route";
import { useAuth } from "@/services/permission.service";

const TABS = [
    "Analytics",
    "Orders & Customers",
    "Inventory",
    "Restaurant & Branches",
    "Menu & Categories",
];

export default function ReportsDashboard() {
    const { user } = useAuth();
    const isSuperAdmin = user?.role?.name === 'SUPER_ADMIN';

    const [activeTab, setActiveTab] = useState(0);
    const [timeRange, setTimeRange] = useState("daily");
    // const [dateRange, setDateRange] = useState("Jan 27 2026 - Feb 2 2026");

    const filteredTabs = isSuperAdmin
        ? TABS.filter(tab => tab === "Analytics" || tab === "Restaurant & Branches")
        : TABS;



    return (
        <ProtectedRoute module="dashboard:reports">
            <div className="min-h-screen p-3 md:p-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl dark:text-gray-200">
                {/* Header */}
                {/* <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Reports Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Comprehensive analytics and insights for your restaurant
                </p>
            </div> */}

                {/* Top Control Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Tab Navigation */}
                        <div className="flex gap-6 overflow-x-auto pb-2 lg:pb-0">
                            {filteredTabs.map((tab, index) => {
                                const originalIndex = TABS.indexOf(tab);
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(originalIndex)}
                                        className={`whitespace-nowrap pb-2 px-1 text-sm font-medium transition-all ${activeTab === originalIndex
                                            ? "text-blue-600 border-b-2 border-blue-600"
                                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Date Picker & Export */}
                        {/* <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <Calendar size={18} />
                            <span className="text-sm">{dateRange}</span>
                        </button>
                    </div> */}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {activeTab === 0 && <AnalyticsTab timeRange={timeRange} setTimeRange={setTimeRange} />}
                    {activeTab === 1 && <OrdersCustomersTab />}
                    {activeTab === 2 && <InventoryTab />}
                    {activeTab === 3 && <BranchesTab />}
                    {activeTab === 4 && <MenuCategoriesTab />}
                </div>
            </div>
        </ProtectedRoute>
    );
}

// Tab 1: Analytics
function AnalyticsTab({ timeRange, setTimeRange }: { timeRange: string; setTimeRange: (range: string) => void }) {
    const data = analyticsData.salesTrend[timeRange as keyof typeof analyticsData.salesTrend];

    return (
        <>
            {/* Sales Trend Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-0">
                        Sales Trend
                    </h2>
                    <div className="flex gap-2">
                        {["daily", "weekly", "monthly"].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === range
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                    }`}
                            >
                                {range.charAt(0).toUpperCase() + range.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis yAxisId="left" stroke="#6b7280" />
                        <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                            }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="sales" fill="#2563EB" name="Net Sales ($)" radius={[8, 8, 0, 0]} />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="orders"
                            stroke="#6366F1"
                            strokeWidth={3}
                            name="Order Count"
                            dot={{ fill: "#6366F1", r: 5 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Payments Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <DollarSign className="text-blue-600" size={24} />
                        </div>
                        <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                            <TrendingUp size={16} />
                            {analyticsData.summary.payments.change}%
                        </div>
                    </div>
                    <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Payments</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                        ${analyticsData.summary.payments.total.toLocaleString()}
                    </p>
                    <div className="mt-4 space-y-2">
                        {analyticsData.summary.payments.breakdown.map((item) => (
                            <div key={item.method} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">{item.method}</span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">{item.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                            <TrendingUp className="text-purple-500" size={24} />
                        </div>
                        <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                            <TrendingUp size={16} />
                            {analyticsData.summary.revenue.change}%
                        </div>
                    </div>
                    <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Revenue</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                        ${analyticsData.summary.revenue.total.toLocaleString()}
                    </p>
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Net Profit</span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                                ${analyticsData.summary.revenue.netProfit.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tips Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <ShoppingCart className="text-blue-500" size={24} />
                        </div>
                        <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                            <TrendingUp size={16} />
                            {analyticsData.summary.tips.change}%
                        </div>
                    </div>
                    <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Tips</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                        ${analyticsData.summary.tips.total.toLocaleString()}
                    </p>
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Avg per Order</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                ${analyticsData.summary.tips.averagePerOrder}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Tab 2: Orders & Customers
function OrdersCustomersTab() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Source Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                    Order Source
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={ordersCustomersData.orderSource}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {ordersCustomersData.orderSource.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Customer Type Donut Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                    Customer Type
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={ordersCustomersData.customerType}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}%`}
                            innerRadius={60}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {ordersCustomersData.customerType.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Customer Locations Bar Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 lg:col-span-2">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                    Top Customer Locations
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ordersCustomersData.customerLocations}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="area" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                            }}
                        />
                        <Bar dataKey="orders" fill="#6366F1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// Tab 3: Inventory
function InventoryTab() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Consumption */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                    Top Stock Consumption
                </h2>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={inventoryData.stockConsumption} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" stroke="#6b7280" />
                        <YAxis dataKey="ingredient" type="category" stroke="#6b7280" width={100} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                            }}
                        />
                        <Bar dataKey="consumed" fill="#2563EB" radius={[0, 8, 8, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Recipe Popularity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                    Recipe Popularity
                </h2>
                <div className="space-y-4">
                    {inventoryData.recipePopularity.map((recipe, index) => (
                        <div key={recipe.recipe} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">{recipe.recipe}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{recipe.orders} orders</p>
                                </div>
                            </div>
                            <p className="text-lg font-semibold text-blue-600">${recipe.revenue}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Tab 4: Restaurant & Branches
function BranchesTab() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                Sales per Branch
            </h2>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={branchesData.salesPerBranch}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="branch" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                        }}
                    />
                    <Legend />
                    <Bar dataKey="sales" fill="#2563EB" name="Sales ($)" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="orders" fill="#6366F1" name="Orders" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>

            {/* Branch Details */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {branchesData.salesPerBranch.map((branch) => (
                    <div key={branch.branch} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{branch.branch}</h3>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Sales:</span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">${branch.sales.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Orders:</span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">{branch.orders}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Growth:</span>
                                <span className={`font-medium ${branch.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                                    {branch.growth >= 0 ? "+" : ""}{branch.growth}%
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Tab 5: Menu & Categories
function MenuCategoriesTab() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales by Category Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                    Sales by Category
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={menuCategoriesData.salesByCategory}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(props: any) => `${props.category}: ${props.value}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {menuCategoriesData.salesByCategory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                    {menuCategoriesData.salesByCategory.map((cat) => (
                        <div key={cat.category} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                <span className="text-gray-700 dark:text-gray-300">{cat.category}</span>
                            </div>
                            <span className="font-medium text-gray-800 dark:text-gray-200">${cat.sales.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Selling Items */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                    Top Selling Items
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={menuCategoriesData.topSellingItems.slice(0, 5)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" stroke="#6b7280" />
                        <YAxis dataKey="item" type="category" stroke="#6b7280" width={120} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                            }}
                        />
                        <Bar dataKey="sales" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
