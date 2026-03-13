"use client";

import React, { useEffect, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import api from "@/services/api";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ApexOptions } from "apexcharts";
import {
  ShoppingBag, Users, Globe, TrendingUp, Star, Package,
  CheckCircle, Clock, XCircle, ChefHat, Truck, RefreshCw,
  Monitor, BarChart2, MessageSquare, ArrowUpRight,
  ArrowDownRight, Minus, UtensilsCrossed, Bike, Coffee,
  Activity, CalendarDays, DollarSign, LayoutGrid,
  Facebook, Instagram, Search, MapPin, Building2, BadgeCheck,
  AlertCircle, PauseCircle, CreditCard, Layers
} from "lucide-react";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/services/permission.service";
import toast from "react-hot-toast";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

// ─── Types ─────────────────────────────────────────────────────────────────────
type Period = "today" | "7d" | "30d" | "90d";

interface DashboardData {
  period: string;
  totalSales: number;
  totalRevenue: number;
  totalOrders: number;
  websiteOrders: number;
  avgOrderValue: number;
  newCustomers: number;
  totalCustomers: number;
  growth: { totalSales: number | null; revenue: number | null; orders: number | null; websiteOrders: number | null; newCustomers: number | null };
  statusBreakdown: Record<string, number>;
  sourceBreakdown: Record<string, number>;
  typeBreakdown: Record<string, number>;
  topItems: { name: string; quantity: number }[];
  monthlySales: { month: string; revenue: number; orders: number }[];
  hourlyOrders: { hour: string; count: number }[];
  categoryRevenue: { name: string; revenue: number; quantity: number }[];
  recentReviews: { id: string; rating: number; comment: string | null; customerName: string; createdAt: string }[];
}

interface SuperAdminData {
  period: string;
  totalRestaurants: number;
  activeRestaurants: number;
  pendingRestaurants: number;
  suspendedRestaurants: number;
  restaurantsByPlan: Record<string, number>;
  totalSubscriptionRevenue: number;
  subscriptionRevenue: { restaurantId: string; restaurantName: string; plan: string; billingCycle: string; price: number; features: string[] }[];
  platformRevenue: number;
  platformOrders: number;
  growth: { revenue: number | null; orders: number | null };
  monthlySalesTrend: { month: string; revenue: number; orders: number }[];
  topRestaurantsByRevenue: { id: string; name: string; revenue: number; orders: number }[];
  recentRestaurants: { id: string; name: string; slug: string; status: string; subscription: string; createdAt: string }[];
  totalUsers: number;
}

// ─── Period Buttons ─────────────────────────────────────────────────────────
const PERIODS: { key: Period; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "90d", label: "90 Days" },
];

// ─── Growth Badge ───────────────────────────────────────────────────────────
function GrowthBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-gray-400 dark:text-gray-500">—</span>;
  if (value > 0) return (
    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
      <ArrowUpRight size={11} />{value}%
    </span>
  );
  if (value < 0) return (
    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400 px-1.5 py-0.5 rounded-full">
      <ArrowDownRight size={11} />{Math.abs(value)}%
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
      <Minus size={11} />0%
    </span>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, accent, growth }: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; accent: string; growth?: number | null;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>
        {growth !== undefined && <GrowthBadge value={growth ?? null} />}
      </div>
    </div>
  );
}

// ─── Stars ───────────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={11} className={s <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"} />
      ))}
    </div>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────
function SectionHeader({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-brand-500">{icon}</span>
      <div>
        <h2 className="text-base font-semibold text-gray-800 dark:text-white leading-tight">{title}</h2>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Progress Bar Row ─────────────────────────────────────────────────────────
function ProgressRow({ label, value, total, color = "bg-brand-500", suffix = "" }: {
  label: string; value: number; total: number; color?: string; suffix?: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[160px]">{label}</span>
        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 shrink-0 ml-2">
          {value.toLocaleString()}{suffix}
        </span>
      </div>
      <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Status Meta ─────────────────────────────────────────────────────────────
const STATUS_META: Record<string, { label: string; color: string; dot: string; icon: React.ReactNode }> = {
  PENDING: { label: "Pending", dot: "bg-amber-400", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400", icon: <Clock size={12} /> },
  CONFIRMED: { label: "Confirmed", dot: "bg-blue-500", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400", icon: <CheckCircle size={12} /> },
  PREPARING: { label: "Preparing", dot: "bg-purple-500", color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400", icon: <ChefHat size={12} /> },
  KITCHEN_READY: { label: "Kitchen Ready", dot: "bg-cyan-400", color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400", icon: <ChefHat size={12} /> },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", dot: "bg-indigo-500", color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400", icon: <Truck size={12} /> },
  DELIVERED: { label: "Delivered", dot: "bg-emerald-500", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400", icon: <CheckCircle size={12} /> },
  CANCELLED: { label: "Cancelled", dot: "bg-red-500", color: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400", icon: <XCircle size={12} /> },
};

function KeywordRow({ keyword, count, percentage }: { keyword: string; count: number; percentage: number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
          <Search size={14} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{keyword}</span>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-gray-900 dark:text-white">{count}</p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500">{percentage}% of searches</p>
      </div>
    </div>
  );
}

function SocialLinkRow({ name, clicks, count, icon, color }: { name: string; clicks: string; count: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${color} shadow-sm border-2 border-white dark:border-gray-800 shrink-0`}>
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">{name}</h4>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Outbound clicks</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-black text-gray-700 dark:text-gray-200">{clicks}</span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400">
          {count.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

// ─── Banner Section ───────────────────────────────────────────────────────────
function BannerCarousel() {
  return (
    <div className="w-[calc(100%+3rem)] -mx-6 -mt-6 mb-6 flex gap-2 h-[180px] md:h-[260px] p-3 bg-gray-50 dark:bg-gray-900/30">

      {/* Left — big banner */}
      <div className="relative flex-[2.5] overflow-hidden rounded-2xl group shadow-md">
        <Image
          src="/images/authentication-images/Dashboard-Banner.jpg.jpeg"
          alt="Dashboard Banner 1"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-black/35 flex items-center justify-center p-6 transition-colors duration-300 group-hover:bg-black/45">
          <h2 className="text-xl md:text-3xl font-black text-white leading-tight drop-shadow-2xl text-center">
            Our digital menu makes restaurant management{" "}
            <br className="hidden md:block" />
            <span className="text-brand-400">simple and comfortable</span>
          </h2>
        </div>
      </div>

      {/* Right — small banner */}
      <div className="relative flex-1 overflow-hidden rounded-2xl group shadow-md">
        <Image
          src="/images/authentication-images/Dashboard-Banner 2.jpg.jpeg"
          alt="Dashboard Banner 2"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/30" />
      </div>

    </div>
  );
}


// ─── SuperAdmin Dashboard View ────────────────────────────────────────────────
function SuperAdminDashboard({ data, period, setPeriod, refreshing, onRefresh }: {
  data: SuperAdminData; period: Period; setPeriod: (p: Period) => void;
  refreshing: boolean; onRefresh: () => void;
}) {
  const [chartTab, setChartTab] = useState<"revenue" | "orders">("revenue");

  const trendChart: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "Outfit, sans-serif", background: "transparent" },
    colors: chartTab === "revenue" ? ["#6366f1"] : ["#f59e0b"],
    plotOptions: { bar: { borderRadius: 6, columnWidth: "55%", borderRadiusApplication: "end" } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: data.monthlySalesTrend.map(m => m.month),
      axisBorder: { show: false }, axisTicks: { show: false },
      labels: { style: { colors: "#9ca3af", fontFamily: "Outfit", fontSize: "11px" } },
    },
    yaxis: { labels: { style: { colors: "#9ca3af", fontFamily: "Outfit", fontSize: "11px" } } },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
    tooltip: { theme: "light", y: { formatter: v => chartTab === "revenue" ? `Rs. ${Number(v).toLocaleString()}` : `${v} orders` } },
  };

  const planColors: Record<string, string> = { FREE: "bg-gray-400", BASIC: "bg-blue-500", PREMIUM: "bg-violet-500", ENTERPRISE: "bg-amber-500" };
  const statusColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    ACTIVE: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400", icon: <BadgeCheck size={14} /> },
    PENDING: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400", icon: <AlertCircle size={14} /> },
    SUSPENDED: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400", icon: <PauseCircle size={14} /> },
  };

  const totalPlanCount = Object.values(data.restaurantsByPlan).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-brand-600" /> Platform Overview
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Super Admin — platform-wide metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-0.5">
            {PERIODS.map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p.key ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                  }`}>{p.label}</button>
            ))}
          </div>
          <button onClick={onRefresh} disabled={refreshing}
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={data.totalUsers.toLocaleString()} icon={<Users size={18} className="text-blue-600" />} accent="bg-blue-50 dark:bg-blue-900/30" />
        <StatCard label="Total Restaurants" value={data.totalRestaurants} icon={<Building2 size={18} className="text-violet-600" />} accent="bg-violet-50 dark:bg-violet-900/30" />
        <StatCard label="Platform Revenue" value={`USD. ${Number(data.platformRevenue).toLocaleString()}`} icon={<DollarSign size={18} className="text-indigo-600" />} accent="bg-indigo-50 dark:bg-indigo-900/30" growth={data.growth.revenue} />
        <StatCard label="Active" value={data.activeRestaurants} sub="Restaurants" icon={<BadgeCheck size={18} className="text-emerald-600" />} accent="bg-emerald-50 dark:bg-emerald-900/30" />
        {/* <StatCard label="Platform Orders" value={data.platformOrders.toLocaleString()} icon={<ShoppingBag size={18} className="text-amber-600" />} accent="bg-amber-50 dark:bg-amber-900/30" growth={data.growth.orders} /> */}
      </div>

      {/* Subscription Revenue + Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <SectionHeader icon={<CreditCard size={16} />} title="Subscription Revenue" sub={`Rs. ${Number(data.totalSubscriptionRevenue).toLocaleString()} total`} />
          {data.subscriptionRevenue.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-500 text-sm">No subscriptions</div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {data.subscriptionRevenue.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{s.restaurantName}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.plan === "ENTERPRISE" ? "bg-amber-100 text-amber-700" :
                      s.plan === "PREMIUM" ? "bg-violet-100 text-violet-700" :
                        s.plan === "BASIC" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                      }`}>{s.plan}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Rs. {Number(s.price).toLocaleString()}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{s.billingCycle}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <SectionHeader icon={<LayoutGrid size={16} />} title="Restaurants by Plan" />
          <div className="space-y-3 mt-2">
            {Object.entries(data.restaurantsByPlan).map(([plan, count]) => (
              <ProgressRow key={plan} label={plan} value={count} total={totalPlanCount}
                color={planColors[plan] || "bg-brand-500"} suffix=" restaurants" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="text-center p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20">
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Pending</p>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{data.pendingRestaurants}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">Suspended</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{data.suspendedRestaurants}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader icon={<Activity size={16} />} title="Platform Monthly Trend" sub="Revenue &amp; Orders" />
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5 gap-0.5">
            {(["revenue", "orders"] as const).map(t => (
              <button key={t} onClick={() => setChartTab(t)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all capitalize ${chartTab === t ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400"}`}>{t}</button>
            ))}
          </div>
        </div>
        <ReactApexChart
          options={trendChart}
          series={[{ name: chartTab === "revenue" ? "Revenue (Rs.)" : "Orders", data: data.monthlySalesTrend.map(m => chartTab === "revenue" ? m.revenue : m.orders) }]}
          type="bar" height={210} />
      </div>

      {/* Top Restaurants + Recent Restaurants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <SectionHeader icon={<TrendingUp size={16} />} title="Top Restaurants by Revenue" />
          {data.topRestaurantsByRevenue.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-500 text-sm">No data</div>
          ) : (
            <div className="space-y-3">
              {data.topRestaurantsByRevenue.map((r, i) => (
                <ProgressRow key={r.id} label={`${i + 1}. ${r.name}`}
                  value={r.revenue} total={data.topRestaurantsByRevenue[0]?.revenue || 1}
                  color={["bg-brand-500", "bg-indigo-500", "bg-amber-500", "bg-emerald-500", "bg-pink-500"][i]}
                  suffix={` — ${r.orders} orders`} />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <SectionHeader icon={<Building2 size={16} />} title="Recently Joined Restaurants" />
          {data.recentRestaurants.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-500 text-sm">No recent restaurants</div>
          ) : (
            <div className="space-y-2">
              {data.recentRestaurants.map(r => {
                const s = statusColors[r.status] || statusColors["PENDING"];
                return (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">{r.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{r.subscription} · {new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{s.icon}{r.status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, loadingUser } = useAuth();
  const isSuperAdmin = user?.role?.name === "SUPER_ADMIN";

  const [data, setData] = useState<DashboardData | null>(null);
  const [superData, setSuperData] = useState<SuperAdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<Period>("30d");
  const [chartTab, setChartTab] = useState<"revenue" | "orders">("revenue");
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiSummaryDate, setAiSummaryDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = useCallback(async (p: Period, silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await api.get(`/dashboard?period=${p}`);
      if (res.data?.success) {
        if (isSuperAdmin) setSuperData(res.data.data);
        else setData(res.data.data);
      }
    } catch (err) {
      console.error("Dashboard fetch failed", err);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, [isSuperAdmin]);

  const handleGenerateSummary = async () => {
    try {
      setGeneratingSummary(true);
      const res = await api.post("/ai/sales-summary", {
        date: aiSummaryDate,
        restaurantId: user?.restaurant?.id,
        instructions: aiPrompt
      });
      if (res.data?.summary) {
        setAiSummary(res.data.summary);
      } else {
        toast.error("AI returned no response. Try again.");
      }
    } catch (err) {
      console.error("AI Summary failed", err);
      toast.error("AI report failed. Please check your backend logs.");
    } finally {
      setGeneratingSummary(false);
    }
  };

  const downloadSummaryPDF = () => {
    if (!aiSummary) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Daily Sales Summary - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
            h1 { color: #6366f1; margin: 0; }
            .date { color: #888; font-size: 14px; margin-top: 5px; }
            .summary-content { line-height: 1.6; font-size: 14px; white-space: pre-wrap; background: #f9fafb; padding: 25px; border-radius: 12px; border: 1px solid #e5e7eb; }
            .stats-grid { display: grid; grid-template-cols: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
            .stat-box { background: #fff; padding: 15px; border-radius: 10px; border: 1px solid #eee; text-align: center; }
            .stat-label { font-size: 11px; text-transform: uppercase; color: #888; font-weight: bold; }
            .stat-value { font-size: 18px; font-weight: bold; color: #333; margin-top: 4px; }
            .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 20px; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Sales Performance Summary</h1>
            <div class="date">Generated on ${new Date().toLocaleString()} for ${user?.restaurant?.name || 'Restaurant'}</div>
          </div>

          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-label">Total Sales</div>
              <div class="stat-value">$${Number(data?.totalSales).toLocaleString()}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Total Revenue</div>
              <div class="stat-value">$${Number(data?.totalRevenue).toLocaleString()}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Total Orders</div>
              <div class="stat-value">${data?.totalOrders}</div>
            </div>
          </div>

          <div class="summary-content">
            ${aiSummary}
          </div>

          <div class="footer">
            &copy; ${new Date().getFullYear()} ${user?.restaurant?.name || 'RMS POS System'} - AI Generated Report
          </div>
          <script>
            window.onload = () => { window.print(); };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  useEffect(() => { fetchData(period); }, [period, fetchData]);

  // ── Chart options (built from data) ────────────────────────────────────
  const barChartOptions: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "Outfit, sans-serif", background: "transparent" },
    colors: chartTab === "revenue" ? ["#6366f1"] : ["#f59e0b"],
    plotOptions: { bar: { borderRadius: 6, columnWidth: "55%", borderRadiusApplication: "end" } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: data?.monthlySales.map(m => m.month) ?? [],
      axisBorder: { show: false }, axisTicks: { show: false },
      labels: { style: { colors: "#9ca3af", fontFamily: "Outfit", fontSize: "11px" } },
    },
    yaxis: { labels: { style: { colors: "#9ca3af", fontFamily: "Outfit", fontSize: "11px" } } },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 4, padding: { left: 0, right: 0 } },
    tooltip: { theme: "light", y: { formatter: v => chartTab === "revenue" ? `$${Number(v).toLocaleString()}` : `${v} orders` } },
  };

  const hourlyChartOptions: ApexOptions = {
    chart: { type: "area", toolbar: { show: false }, fontFamily: "Outfit, sans-serif", background: "transparent", sparkline: { enabled: false } },
    colors: ["#10b981"],
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0, stops: [0, 100] } },
    stroke: { curve: "smooth", width: 2 },
    dataLabels: { enabled: false },
    xaxis: {
      categories: data?.hourlyOrders.map(h => h.hour) ?? [],
      tickAmount: 8,
      axisBorder: { show: false }, axisTicks: { show: false },
      labels: { style: { colors: "#9ca3af", fontFamily: "Outfit", fontSize: "10px" } },
    },
    yaxis: { labels: { style: { colors: "#9ca3af", fontFamily: "Outfit", fontSize: "10px" } } },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
    tooltip: { theme: "light" },
  };

  const sourceChart: ApexOptions = {
    chart: { type: "donut", fontFamily: "Outfit, sans-serif" },
    colors: ["#6366f1", "#f59e0b", "#10b981"],
    labels: ["POS", "Website", "Mobile"],
    legend: { show: false }, dataLabels: { enabled: false },
    stroke: { width: 0 },
    plotOptions: { pie: { donut: { size: "68%", labels: { show: true, total: { show: true, label: "Total", fontSize: "12px", fontFamily: "Outfit", color: "#9ca3af", formatter: w => w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString() } } } } },
    tooltip: { theme: "light" },
  };

  const typeChart: ApexOptions = {
    chart: { type: "donut", fontFamily: "Outfit, sans-serif" },
    colors: ["#8b5cf6", "#3b82f6", "#ec4899"],
    labels: ["Dine-In", "Delivery", "Pickup"],
    legend: { show: false }, dataLabels: { enabled: false },
    stroke: { width: 0 },
    plotOptions: { pie: { donut: { size: "68%", labels: { show: true, total: { show: true, label: "Total", fontSize: "12px", fontFamily: "Outfit", color: "#9ca3af", formatter: w => w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString() } } } } },
    tooltip: { theme: "light" },
  };

  const totalStatusCount = Math.max(Object.values(data?.statusBreakdown ?? {}).reduce((a, b) => a + b, 0), 1);
  const posCount = data?.sourceBreakdown["POS"] ?? 0;
  const webCount = data?.sourceBreakdown["WEBSITE"] ?? 0;
  const mobileCount = data?.sourceBreakdown["MOBILE"] ?? 0;
  const dineCount = data?.typeBreakdown["DINE_IN"] ?? 0;
  const delivCount = data?.typeBreakdown["DELIVERY"] ?? 0;
  const pickCount = data?.typeBreakdown["PICKUP"] ?? 0;

  const avgRating = data?.recentReviews.length
    ? (data.recentReviews.reduce((s, r) => s + r.rating, 0) / data.recentReviews.length).toFixed(1)
    : null;

  if (loadingUser || loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader size="md" />
      </div>
    );
  }

  if (isSuperAdmin) {
    if (!superData) return <div className="flex items-center justify-center min-h-[400px] text-gray-400 text-sm">No data available.</div>;
    return <SuperAdminDashboard data={superData} period={period} setPeriod={setPeriod} refreshing={refreshing} onRefresh={() => fetchData(period, true)} />;
  }

  if (!data) {
    return <div className="flex items-center justify-center min-h-[400px] text-gray-400 text-sm">No data available.</div>;
  }

  return (
    <div className="space-y-5 pb-10">

      {/* ── PROMO BANNER (hidden for Super Admin) ──────────────────────── */}
      {!isSuperAdmin && <BannerCarousel />}

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-brand-600" /> Overview Dashboard
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Track your restaurant performance in real-time</p>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Summary Controls */}
          {!isSuperAdmin && (
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <input
                type="date"
                value={aiSummaryDate}
                onChange={(e) => setAiSummaryDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-gray-600 dark:text-gray-300 px-2 py-1.5 focus:outline-none border-r border-gray-100 dark:border-gray-700"
              />
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Ask AI (e.g. 'Who bought Pizza?')"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="pl-3 pr-8 py-1.5 bg-transparent text-xs text-gray-600 dark:text-gray-300 focus:outline-none w-48"
                />
              </div>
              <button
                onClick={handleGenerateSummary}
                disabled={generatingSummary}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {generatingSummary ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <Activity size={12} />
                )}
                {generatingSummary ? "Analysing..." : "Get AI Report"}
              </button>
            </div>
          )}

          {/* Period Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-0.5">
            {PERIODS.map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p.key
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}>
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={() => fetchData(period, true)} disabled={refreshing}
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* AI Summary Document Display */}
      {aiSummary && (
        <div className="bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-3xl shadow-2xl shadow-indigo-500/10 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 max-w-4xl mx-auto">
          {/* Document Header Bar */}
          <div className="px-8 py-4 bg-indigo-600 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <BarChart2 size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-black uppercase tracking-widest text-xs">AI Business Report</h3>
                <p className="text-indigo-100 text-[10px] font-bold">{new Date(aiSummaryDate).toDateString()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={downloadSummaryPDF}
                className="px-4 py-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
              >
                <Package size={14} /> Download PDF
              </button>
              <button 
                onClick={() => setAiSummary(null)} 
                className="w-10 h-10 flex items-center justify-center bg-black/10 hover:bg-black/20 text-white rounded-xl transition-all"
              >
                <XCircle size={20} />
              </button>
            </div>
          </div>
          
          <div className="p-10">
            <div className="ai-report-content prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed">
              <ReactMarkdown
                components={{
                  h1: (props) => <h1 className="text-xl font-black text-indigo-700 dark:text-indigo-300 mt-6 mb-3 border-b border-indigo-100 pb-2">{props.children}</h1>,
                  h2: (props) => <h2 className="text-base font-black text-gray-800 dark:text-gray-200 mt-5 mb-2">{props.children}</h2>,
                  h3: (props) => <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mt-4 mb-1">{props.children}</h3>,
                  strong: (props) => <strong className="font-black text-indigo-600 dark:text-indigo-400">{props.children}</strong>,
                  ul: (props) => <ul className="list-disc pl-5 space-y-1 my-2">{props.children}</ul>,
                  ol: (props) => <ol className="list-decimal pl-5 space-y-1 my-2">{props.children}</ol>,
                  li: (props) => <li className="text-gray-700 dark:text-gray-300">{props.children}</li>,
                  p: (props) => <p className="my-2 text-gray-700 dark:text-gray-300">{props.children}</p>,
                  hr: () => <hr className="my-4 border-gray-200 dark:border-gray-700" />,
                }}
              >
                {aiSummary || ""}
              </ReactMarkdown>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center italic text-[10px] text-gray-400">
              <p>Requested Insight: "{aiPrompt || "Full Daily Overview"}"</p>
              <p>Generated by RMS Intelligence • {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── KPI CARDS ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard label="Total Sales" value={`$${Number(data.totalSales).toLocaleString()}`}
          sub="All orders (gross)" icon={<TrendingUp size={18} className="text-rose-600" />}
          accent="bg-rose-50 dark:bg-rose-900/30" growth={data.growth.totalSales} />
        <StatCard label="Paid Revenue" value={`$${Number(data.totalRevenue).toLocaleString()}`}
          sub="Settled payments" icon={<DollarSign size={18} className="text-indigo-600" />}
          accent="bg-indigo-50 dark:bg-indigo-900/30" growth={data.growth.revenue} />
        <StatCard label="Total Orders" value={data.totalOrders.toLocaleString()}
          sub="All statuses" icon={<ShoppingBag size={18} className="text-amber-600" />}
          accent="bg-amber-50 dark:bg-amber-900/30" growth={data.growth.orders} />
        <StatCard label="Website Orders" value={data.websiteOrders.toLocaleString()}
          sub="Online store" icon={<Globe size={18} className="text-blue-600" />}
          accent="bg-blue-50 dark:bg-blue-900/30" growth={data.growth.websiteOrders} />
        <StatCard label="New Customers" value={data.newCustomers.toLocaleString()}
          sub={`${data.totalCustomers.toLocaleString()} total`} icon={<Users size={18} className="text-emerald-600" />}
          accent="bg-emerald-50 dark:bg-emerald-900/30" growth={data.growth.newCustomers} />
      </div>

      {/* ── ROW: Monthly Chart + Source Donut + Type Donut ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Monthly Sales / Orders Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <SectionHeader icon={<Activity size={16} />} title="Monthly Trend" sub="Last 12 months" />
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5 gap-0.5">
              {(["revenue", "orders"] as const).map(t => (
                <button key={t} onClick={() => setChartTab(t)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all capitalize ${chartTab === t ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400"
                    }`}>{t}</button>
              ))}
            </div>
          </div>
          <ReactApexChart
            options={barChartOptions}
            series={[{ name: chartTab === "revenue" ? "Revenue (Rs.)" : "Orders", data: data.monthlySales.map(m => chartTab === "revenue" ? m.revenue : m.orders) }]}
            type="bar" height={210} />
        </div>

        {/* Source Donut */}
        <div className="lg:col-span-2half bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm lg:col-span-3">
          <SectionHeader icon={<Monitor size={16} />} title="By Platform" />
          {posCount + webCount + mobileCount === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 dark:text-gray-500 text-sm">No data</div>
          ) : (
            <>
              <ReactApexChart options={sourceChart} series={[posCount, webCount, mobileCount]} type="donut" height={160} />
              <div className="mt-3 space-y-1.5">
                {[["POS", posCount, "bg-indigo-500"], ["Website", webCount, "bg-amber-500"], ["Mobile", mobileCount, "bg-emerald-500"]].map(([l, c, col]) => (
                  <div key={l as string} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <span className={`w-2 h-2 rounded-full ${col}`} />{l}
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{Number(c).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Order Type Donut */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm lg:col-span-2">
          <SectionHeader icon={<UtensilsCrossed size={16} />} title="By Type" />
          {dineCount + delivCount + pickCount === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 dark:text-gray-500 text-sm">No data</div>
          ) : (
            <>
              <ReactApexChart options={typeChart} series={[dineCount, delivCount, pickCount]} type="donut" height={160} />
              <div className="mt-3 space-y-1.5">
                {[["Dine-In", dineCount, "bg-violet-500", <Coffee size={11} />], ["Delivery", delivCount, "bg-blue-500", <Bike size={11} />], ["Pickup", pickCount, "bg-pink-500", <Package size={11} />]].map(([l, c, col, ico]) => (
                  <div key={l as string} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <span className={`w-2 h-2 rounded-full ${col}`} />{l}
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{Number(c).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── ROW: Today's Hourly Traffic ────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
        <SectionHeader icon={<CalendarDays size={16} />} title="Today's Order Activity" sub="Orders by hour (live)" />
        <ReactApexChart
          options={hourlyChartOptions}
          series={[{ name: "Orders", data: data.hourlyOrders.map(h => h.count) }]}
          type="area" height={140} />
      </div>

      {/* ── ROW: Status + Top Items + Category Revenue ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Order Status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <SectionHeader icon={<Package size={16} />} title="Order Status" sub="Current period" />
          <div className="space-y-3">
            {Object.entries(STATUS_META).map(([key, meta]) => {
              const count = data.statusBreakdown[key] ?? 0;
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${meta.color}`}>
                    {meta.icon} {meta.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${meta.dot} rounded-full`} style={{ width: `${Math.round((count / totalStatusCount) * 100)}%` }} />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200 w-6 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
            {Object.keys(data.statusBreakdown).length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No orders yet</p>
            )}
          </div>
        </div>

        {/* Top 5 Items */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <SectionHeader icon={<TrendingUp size={16} />} title="Top 5 Menu Items" sub="By quantity sold" />
          {data.topItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
              <Package size={28} className="opacity-30" />
              <p className="text-sm">No sales data yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.topItems.map((item, i) => (
                <ProgressRow key={i}
                  label={`${i + 1}. ${item.name}`}
                  value={item.quantity ?? 0}
                  total={data.topItems[0]?.quantity ?? 1}
                  suffix=" sold"
                  color={["bg-brand-500", "bg-indigo-500", "bg-amber-500", "bg-emerald-500", "bg-pink-500"][i]}
                />
              ))}
            </div>
          )}
        </div>

        {/* Category Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <SectionHeader icon={<LayoutGrid size={16} />} title="Category Revenue" sub="Top categories" />
          {data.categoryRevenue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
              <LayoutGrid size={28} className="opacity-30" />
              <p className="text-sm">No data yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.categoryRevenue.map((cat, i) => (
                <ProgressRow key={i}
                  label={cat.name}
                  value={cat.revenue}
                  total={data.categoryRevenue[0]?.revenue || 1}
                  color={["bg-brand-500", "bg-violet-500", "bg-amber-500", "bg-emerald-500", "bg-blue-500", "bg-pink-500"][i]}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── ROW: Avg Order + Reviews ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Avg Order Value Card */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Order Value</p>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              <DollarSign size={18} className="text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              ${Number(data.avgOrderValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Per completed order</p>
          </div>
          {avgRating && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Stars rating={Math.round(Number(avgRating))} />
              <span className="text-xs text-gray-400 dark:text-gray-500">{avgRating} avg rating</span>
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <SectionHeader icon={<MessageSquare size={16} />} title="Recent Reviews" sub={avgRating ? `Average: ${avgRating} / 5` : undefined} />
          {data.recentReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
              <Star size={28} className="opacity-30" />
              <p className="text-sm">No reviews yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.recentReviews.map(r => (
                <div key={r.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 hover:border-brand-200 dark:hover:border-brand-700 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{r.customerName}</p>
                    <Stars rating={r.rating} />
                  </div>
                  {r.comment
                    ? <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{r.comment}</p>
                    : <p className="text-xs text-gray-300 dark:text-gray-600 italic">No comment</p>
                  }
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── ROW: Keywords + Outbound Links ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Website Keyword Searcher */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <SectionHeader icon={<Search size={18} />} title="Website Keyword Searcher" sub="Top keywords used by visitors" />
          <div className="mt-4 space-y-1">
            <KeywordRow keyword="Best burger in town" count={1240} percentage={24} />
            <KeywordRow keyword="Restaurant near me" count={850} percentage={18} />
            <KeywordRow keyword="Special deals today" count={620} percentage={12} />
            <KeywordRow keyword="Late night delivery" count={430} percentage={8} />
            <KeywordRow keyword="Top rated pizza" count={310} percentage={6} />
          </div>
        </div>

        {/* Outbound Links */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <SectionHeader icon={<Globe size={18} />} title="Outbound Links" sub="Engagement with social media links" />
          <div className="mt-2 divide-y dark:divide-gray-700/50">
            <SocialLinkRow name="Facebook" clicks="4%" count={33} icon={<Facebook size={22} />} color="bg-[#1877F2]" />
            <SocialLinkRow
              name="Instagram"
              clicks="7%"
              count={58}
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              }
              color="bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]"
            />
            <SocialLinkRow name="Google Maps" clicks="0%" count={2} icon={<MapPin size={22} />} color="bg-[#EA4335]" />
            <SocialLinkRow name="Website" clicks="12%" count={97} icon={<Globe size={22} />} color="bg-[#4f46e5]" />
          </div>
        </div>

      </div>

    </div>
  );
}
