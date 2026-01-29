import { usePlatformOverview } from "@/fitur/superadmin/hooks/useAnalytics";
import { useRecentActivity } from "@/fitur/superadmin/hooks/useAuditLogs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/komponen/ui/card";
import {
  HardDrive,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { StatCard } from "@/fitur/superadmin/komponen/dashboard/StatCard";
import { ActivityList } from "@/fitur/superadmin/komponen/dashboard/ActivityList";
import { Book, Profile2User, Teacher, TrendUp, ArrowRight } from 'iconsax-react';
import { motion } from "framer-motion";

// Dummy data for Tenant Growth Chart
const tenantGrowthData = [
  { month: "Jan", tenants: 12, newTenants: 12 },
  { month: "Feb", tenants: 18, newTenants: 6 },
  { month: "Mar", tenants: 25, newTenants: 7 },
  { month: "Apr", tenants: 32, newTenants: 7 },
  { month: "Mei", tenants: 42, newTenants: 10 },
  { month: "Jun", tenants: 48, newTenants: 6 },
  { month: "Jul", tenants: 55, newTenants: 7 },
  { month: "Agt", tenants: 62, newTenants: 7 },
  { month: "Sep", tenants: 71, newTenants: 9 },
  { month: "Okt", tenants: 78, newTenants: 7 },
  { month: "Nov", tenants: 85, newTenants: 7 },
  { month: "Des", tenants: 92, newTenants: 7 },
];

// Dummy data for Storage Usage per Tenant
const storageUsageData = [
  { name: "Provinsi Jatim", usage: 75, color: "#3b82f6" },
  { name: "BKD DKI", usage: 62, color: "#10b981" },
  { name: "Kampus ITB", usage: 88, color: "#f59e0b" },
  { name: "Korporasi ABC", usage: 45, color: "#8b5cf6" },
  { name: "Provinsi Jabar", usage: 92, color: "#ef4444" },
];

export function SuperadminDashboard() {
  const { data: overview, isLoading: _overviewLoading } = usePlatformOverview();
  const { data: recentActivity, isLoading: activityLoading } =
    useRecentActivity(10); // Limit to 10 for sidebar

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="space-y-6 font-sans text-gray-900 antialiased selection:bg-violet-100 selection:text-violet-900"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-xl font-bold text-gray-800 mb-1">Dasbor Superadmin</h1>
        <p className="text-gray-500 text-xs">Overview performa platform dan statistik sistem.</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Tenant"
          value={overview?.total_tenants || 0}
          subtext={`${overview?.active_tenants || 0} tenant aktif`}
          icon={Teacher} // Using Teacher icon as placeholder for Tenant/Building
          color="bg-blue-500"
        />
        <StatCard
          title="Total Pengguna"
          value={overview?.total_users || 0}
          subtext={`${overview?.active_users_today || 0} aktif hari ini`}
          icon={Profile2User}
          color="bg-green-500"
        />
        <StatCard
          title="Total Kursus"
          value={overview?.total_courses || 0}
          subtext="Kursus tersedia"
          icon={Book}
          color="bg-violet-500"
        />
        <StatCard
          title="Pendaftaran"
          value={overview?.total_enrollments || 0}
          subtext="Total siswa terdaftar"
          icon={TrendUp}
          color="bg-orange-500"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Section - Main (Charts) */}
        <motion.div variants={item} className="lg:col-span-2 space-y-6">

          {/* Tenant Growth Chart */}
          <Card className="rounded-xl border border-gray-300 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b border-gray-200 bg-white">
              <div className="space-y-1">
                <CardTitle className="text-base font-bold text-gray-800">Pertumbuhan Tenant</CardTitle>
                <p className="text-xs text-gray-500">
                  Tren pertumbuhan tenant per bulan
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={tenantGrowthData}>
                  <defs>
                    <linearGradient id="colorTenants" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                    stroke="transparent"
                    dy={10}
                  />
                  <YAxis
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                    stroke="transparent"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      fontSize: "12px",
                      color: "#374151"
                    }}
                    itemStyle={{ padding: "0" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="tenants"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTenants)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Storage Usage */}
          <Card className="rounded-xl border border-gray-300 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b border-gray-200 bg-white">
              <div className="space-y-1">
                <CardTitle className="text-base font-bold text-gray-800">Penggunaan Storage</CardTitle>
                <p className="text-xs text-gray-500">
                  Top 5 tenant dengan penggunaan tertinggi
                </p>
              </div>
              <HardDrive className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {storageUsageData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700">{item.name}</span>
                      <span className={`font-semibold ${item.usage > 80 ? 'text-red-600' : item.usage > 60 ? 'text-orange-600' : 'text-green-600'}`}>
                        {item.usage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 relative"
                        style={{
                          width: `${item.usage}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </motion.div>

        {/* Sidebar Section - Right (Activity) */}
        <motion.div variants={item} className="space-y-5">
          <h2 className="text-base font-bold text-gray-800">Aktivitas Terbaru</h2>
          <div className="bg-white rounded-xl border border-gray-300 p-5 shadow-sm min-h-[400px]">
            <ActivityList logs={recentActivity || []} isLoading={activityLoading} />

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-center">
              <button
                onClick={() => window.location.href = '/superadmin/audit-logs'}
                className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
              >
                Lihat Semua Aktivitas <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

