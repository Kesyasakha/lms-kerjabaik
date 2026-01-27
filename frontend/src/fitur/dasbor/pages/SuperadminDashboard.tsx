import { usePlatformOverview } from "@/fitur/superadmin/hooks/useAnalytics";
import { useRecentActivity } from "@/fitur/superadmin/hooks/useAuditLogs";
import { ActivityLog } from "@/fitur/superadmin/komponen/ActivityLog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/komponen/ui/card";
import {
  Building2,
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
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
    useRecentActivity(20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Dashboard Superadmin
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
          Ringkasan platform dan aktivitas terkini
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-blue-500/50 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Tenant</CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.total_tenants || 92}</div>
            <p className="text-xs text-muted-foreground">
              {overview?.active_tenants || 85} aktif
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-green-500/50 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg group-hover:bg-green-100 dark:group-hover:bg-green-900/40 transition-colors">
              <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.total_users || 2847}</div>
            <p className="text-xs text-muted-foreground">
              {overview?.active_users_today || 312} aktif hari ini
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-purple-500/50 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Kursus</CardTitle>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-colors">
              <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.total_courses || 156}</div>
            <p className="text-xs text-muted-foreground">
              Kursus tersedia di platform
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-orange-500/50 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Pendaftaran</CardTitle>
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 transition-colors">
              <GraduationCap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.total_enrollments || 1234}</div>
            <p className="text-xs text-muted-foreground">
              Total siswa terdaftar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tenant Growth Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">Pertumbuhan Tenant</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tren pertumbuhan tenant per bulan
            </p>
          </div>
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={tenantGrowthData}>
              <defs>
                <linearGradient id="colorTenants" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorNewTenants" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.3} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 12 }}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#f9fafb",
                  padding: "12px",
                }}
                itemStyle={{ padding: "4px 0" }}
              />
              <Area
                type="monotone"
                dataKey="tenants"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTenants)"
                name="Total Tenant"
              />
              <Area
                type="monotone"
                dataKey="newTenants"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorNewTenants)"
                name="Tenant Baru"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Storage Usage per Tenant */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">Storage per Tenant</CardTitle>
            <p className="text-sm text-muted-foreground">
              5 Tenant dengan penggunaan storage tertinggi
            </p>
          </div>
          <HardDrive className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {storageUsageData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className={`text-sm font-semibold ${item.usage > 80 ? 'text-red-600' : item.usage > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {item.usage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 relative overflow-hidden"
                    style={{
                      width: `${item.usage}%`,
                      background: `linear-gradient(90deg, ${item.color}88 0%, ${item.color} 100%)`
                    }}
                  >
                    {item.usage > 60 && (
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">Aktivitas Terkini</CardTitle>
            <p className="text-sm text-muted-foreground">
              20 aktivitas terakhir di platform
            </p>
          </div>
          <TrendingUp className="w-5 h-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <ActivityLog logs={recentActivity || []} isLoading={activityLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
