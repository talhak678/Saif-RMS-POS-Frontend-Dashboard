"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/services/api";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ApexOptions } from "apexcharts";
import {
  ShoppingBag, Users, Globe, TrendingUp, Star, Package,
  CheckCircle, Clock, XCircle, ChefHat, Truck, RefreshCw,
  Monitor, Smartphone, BarChart2, MessageSquare, ArrowUpRight,
  ArrowDownRight, Minus, UtensilsCrossed, Bike, Coffee,
  Activity, CalendarDays, DollarSign, LayoutGrid,
  Facebook, Instagram, Search, MapPin
} from "lucide-react";
import Loader from "@/components/common/Loader";

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

// ─── Period Buttons ─────────────────────────────────────────────────────────
const PERIODS: { key: Period; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "90d", label: "90 Days" },
];

// ─── Growth Badge ───────────────────────────────────────────────────────────
function GrowthBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-gray-400">—</span>;
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
    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
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
        <p className="text-xs text-gray-400">{sub}</p>
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
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
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
        <p className="text-[10px] text-gray-400">{percentage}% of searches</p>
      </div>
    </div>
  );
}

function SocialLinkRow({ name, clicks, icon, color }: { name: string; clicks: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${color} shadow-sm border-2 border-white dark:border-gray-800`}>
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">{name}</h4>
        <p className="text-xs text-gray-400 font-medium">{clicks} of clicks</p>
      </div>
    </div>
  );
}

// ─── Banner Section ───────────────────────────────────────────────────────────
function BannerCarousel() {
  return (
    <div className="w-full max-w-5xl mx-auto flex gap-3 h-[180px] md:h-[220px]">

      {/* Left — big banner */}
      <div className="relative flex-[2] rounded-3xl overflow-hidden shadow-xl border border-white/10 group">
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
      <div className="relative flex-1 rounded-3xl overflow-hidden shadow-xl border border-white/10 group">
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


// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<Period>("30d");
  const [chartTab, setChartTab] = useState<"revenue" | "orders">("revenue");

  const fetchData = useCallback(async (p: Period, silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await api.get(`/dashboard?period=${p}`);
      if (res.data?.success) setData(res.data.data);
    } catch (err) {
      console.error("Dashboard fetch failed", err);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader size="md" />
      </div>
    );
  }
  if (!data) {
    return <div className="flex items-center justify-center min-h-[400px] text-gray-400 text-sm">No data available.</div>;
  }

  return (
    <div className="space-y-5 pb-10">

      {/* ── PROMO BANNER ────────────────────────────────────────────────── */}
      <BannerCarousel />

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-brand-600" /> Overview Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Track your restaurant performance in real-time</p>
        </div>

        <div className="flex items-center gap-2">
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
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data</div>
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
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data</div>
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
              <p className="text-sm text-gray-400 text-center py-4">No orders yet</p>
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
            <p className="text-xs text-gray-400 mt-1">Per completed order</p>
          </div>
          {avgRating && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Stars rating={Math.round(Number(avgRating))} />
              <span className="text-xs text-gray-400">{avgRating} avg rating</span>
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
            <SocialLinkRow name="Facebook" clicks="4%" icon={<Facebook size={22} />} color="bg-[#1877F2]" />
            <SocialLinkRow name="Instagram" clicks="7%" icon={<Instagram size={22} />} color="bg-gradient-to-tr from-[#f09433] 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%" />
            <SocialLinkRow name="Google Maps" clicks="0%" icon={<MapPin size={22} />} color="bg-[#EA4335]" />
          </div>
        </div>

      </div>

    </div>
  );
}
