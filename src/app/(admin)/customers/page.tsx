"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/services/api";
import {
  Eye,
  Gift,
  Users,
  RefreshCcw,
  TrendingUp,
  Wallet,
  Search,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/services/protected-route";
import Loader from "@/components/common/Loader";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Stats {
  summary: {
    totalCustomers: number;
    repeatRate: string;
    averageOrderValue: string;
    retentionRate: string;
  };
  segments: {
    newCustomers: number;
    vipCustomers: number;
    repeatBuyers: number;
    zeroOrders: number;
    dormantCustomers: number;
    frequentBuyers: number;
    cartAbandoners: number;
    oneTimeBuyers: number;
  };
}

type SegmentKey =
  | "newCustomers"
  | "vipCustomers"
  | "repeatBuyers"
  | "zeroOrders"
  | "dormantCustomers"
  | "frequentBuyers"
  | "cartAbandoners"
  | "oneTimeBuyers"
  | null;

// ─── Segment config ───────────────────────────────────────────────────────────
const SEGMENT_CONFIG: {
  key: Exclude<SegmentKey, null>;
  label: string;
  desc: string;
  border: string;
  badge: string;
}[] = [
    { key: "newCustomers", label: "New Customers", desc: "Joined in last 30 days", border: "border-l-purple-500", badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
    { key: "vipCustomers", label: "VIP Customers", desc: "More than 20 orders", border: "border-l-indigo-500", badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" },
    { key: "repeatBuyers", label: "Repeat Buyers", desc: "More than 1 order", border: "border-l-green-500", badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
    { key: "zeroOrders", label: "Zero Orders", desc: "Having 0 orders", border: "border-l-red-500", badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
    { key: "dormantCustomers", label: "Dormant Customers", desc: "No orders in last 60 days", border: "border-l-orange-500", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" },
    { key: "frequentBuyers", label: "Frequent Buyers", desc: "More than 5 orders", border: "border-l-teal-500", badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300" },
    { key: "cartAbandoners", label: "Cart Abandoners", desc: "Left items in cart since last 10 days", border: "border-l-yellow-500", badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
    { key: "oneTimeBuyers", label: "One-time Buyers", desc: "Only one order placed", border: "border-l-slate-500", badge: "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300" },
  ];

// ─── Segment filter logic (pure, runs on client data) ────────────────────────
const SIXTY_DAYS = 60 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

function matchesSegment(customer: any, key: SegmentKey): boolean {
  const orderCount = customer._count?.orders ?? 0;
  const createdAt = customer.createdAt ? new Date(customer.createdAt).getTime() : 0;
  const now = Date.now();

  // last order date (customers list includes orders array if backend sends it)
  const lastOrderAt = customer.lastOrderAt
    ? new Date(customer.lastOrderAt).getTime()
    : null;

  switch (key) {
    case "newCustomers": return now - createdAt <= THIRTY_DAYS;
    case "vipCustomers": return orderCount > 20;
    case "repeatBuyers": return orderCount > 1;
    case "zeroOrders": return orderCount === 0;
    case "dormantCustomers": return orderCount > 0 && lastOrderAt !== null && now - lastOrderAt > SIXTY_DAYS;
    case "frequentBuyers": return orderCount > 5;
    case "cartAbandoners": return false; // not supported yet
    case "oneTimeBuyers": return orderCount === 1;
    default: return true;
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const router = useRouter();
  const tableRef = useRef<HTMLDivElement>(null);

  const [customers, setCustomers] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  // search
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  // active segment
  const [activeSegment, setActiveSegment] = useState<SegmentKey>(null);

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const res = await api.get("/customers");
      if (res.data?.success) setCustomers(res.data.data);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await api.get("/customers/stats");
      if (res.data?.success) setStats(res.data.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, []);

  // ── segment click → filter + scroll ──────────────────────────────────────
  const handleSegmentClick = (key: SegmentKey) => {
    setActiveSegment((prev) => (prev === key ? null : key)); // toggle
    // clear search filters when switching segment
    setSearchName("");
    setSearchPhone("");
    setSearchEmail("");
    // scroll table into view
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // ── combined filter ───────────────────────────────────────────────────────
  const filtered = customers.filter((c) => {
    const nameOk = (c.name ?? "").toLowerCase().includes(searchName.toLowerCase());
    const phoneOk = (c.phone ?? "").toLowerCase().includes(searchPhone.toLowerCase());
    const emailOk = (c.email ?? "").toLowerCase().includes(searchEmail.toLowerCase());
    const segOk = activeSegment === null || matchesSegment(c, activeSegment);
    return nameOk && phoneOk && emailOk && segOk;
  });

  const activeCfg = SEGMENT_CONFIG.find((s) => s.key === activeSegment) ?? null;

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <ProtectedRoute module="customers-orders:customers">
      <div className="min-h-screen p-3 md:p-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl dark:text-gray-200 space-y-6">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Customer Management
          </h1>
          <button
            onClick={() => { fetchCustomers(); fetchStats(); }}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCcw size={14} /> Refresh
          </button>
        </div>

        {/* ── Summary stats ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Customers" value={loadingStats ? "…" : String(stats?.summary.totalCustomers ?? 0)} icon={<Users size={18} className="text-brand-600" />} />
          <StatCard label="Repeat Rate" value={loadingStats ? "…" : (stats?.summary.repeatRate ?? "0%")} icon={<RefreshCcw size={18} className="text-green-600" />} />
          <StatCard label="Average Order Value" value={loadingStats ? "…" : `$ ${stats?.summary.averageOrderValue ?? "0"}`} icon={<Wallet size={18} className="text-orange-500" />} />
          <StatCard label="Retention Rate" value={loadingStats ? "…" : (stats?.summary.retentionRate ?? "0%")} icon={<TrendingUp size={18} className="text-blue-500" />} />
        </div>

        {/* ── Smart Segments ────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
            Smart Segments
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SEGMENT_CONFIG.map((seg) => {
              const count = loadingStats ? null : (stats?.segments as any)?.[seg.key] ?? 0;
              const isActive = activeSegment === seg.key;
              return (
                <div
                  key={seg.key as string}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 ${seg.border} space-y-1 transition-all
                    ${isActive ? "ring-2 ring-brand-500 ring-offset-1" : ""}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {seg.label}
                    </span>
                    <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${seg.badge}`}>
                      {count === null ? "…" : count}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{seg.desc}</p>
                  <button
                    className={`text-xs font-semibold mt-1 transition-colors
                      ${isActive
                        ? "text-red-500 hover:text-red-600"
                        : "text-brand-600 dark:text-brand-400 hover:underline"
                      }`}
                    onClick={() => handleSegmentClick(seg.key)}
                  >
                    {isActive ? "✕ Clear Filter" : "View Customers →"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Active segment banner ─────────────────────────────────────────── */}
        {activeCfg && (
          <div className="flex items-center justify-between bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg px-4 py-2">
            <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">
              Filtering by: <span className="font-black">{activeCfg.label}</span>
              &nbsp;—&nbsp;{filtered.length} customer{filtered.length !== 1 ? "s" : ""} found
            </span>
            <button
              onClick={() => setActiveSegment(null)}
              className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 font-bold"
            >
              <X size={14} /> Clear
            </button>
          </div>
        )}

        {/* ── Search bar ───────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col sm:flex-row gap-3">
          {[
            { ph: "Search by name…", val: searchName, set: setSearchName },
            { ph: "Search by phone…", val: searchPhone, set: setSearchPhone },
            { ph: "Search by email…", val: searchEmail, set: setSearchEmail },
          ].map(({ ph, val, set }) => (
            <div key={ph} className="relative flex-1">
              <Search size={14} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder={ph}
                value={val}
                onChange={(e) => set(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900/40 outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          ))}
        </div>

        {/* ── Table ────────────────────────────────────────────────────────── */}
        <div
          ref={tableRef}
          className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow scroll-mt-4"
        >
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Orders</th>
                <th className="px-4 py-3 text-left">Loyalty Pts</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingCustomers ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <Loader size="md" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-400">
                    {activeSegment
                      ? `No customers in "${activeCfg?.label}" segment`
                      : "No customers found"}
                  </td>
                </tr>
              ) : (
                filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{c.email ?? "—"}</td>
                    <td className="px-4 py-3">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 border border-brand-100 dark:border-brand-800">
                        {c._count?.orders ?? 0} Orders
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-amber-600 font-semibold">
                        <Wallet size={14} /> {c.loyaltyPoints ?? 0} pts
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        title="View details"
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        title="Add loyalty points"
                        onClick={() => router.push(`/loyalty?customerId=${c.id}`)}
                        className="p-2 hover:bg-green-100 dark:hover:bg-green-900/40 rounded text-green-600"
                      >
                        <Gift size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!loadingCustomers && (
            <div className="px-4 py-3 text-xs text-gray-400 border-t dark:border-gray-700 flex items-center justify-between">
              <span>Showing {filtered.length} of {customers.length} customers</span>
              {activeSegment && (
                <span className="font-semibold text-brand-600">
                  Segment: {activeCfg?.label}
                </span>
              )}
            </div>
          )}
        </div>

      </div>
    </ProtectedRoute>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-gray-800 dark:text-gray-100">{value}</span>
          {sub && (
            <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 dark:bg-orange-900/30 px-1.5 py-0.5 rounded italic">
              {sub}
            </span>
          )}
        </div>
      </div>
      <div className="p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg">{icon}</div>
    </div>
  );
}