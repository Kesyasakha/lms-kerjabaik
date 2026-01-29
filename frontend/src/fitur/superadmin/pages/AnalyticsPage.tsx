import { useTenantAnalytics } from "../hooks/useAnalytics";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/komponen/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/komponen/ui/table";
import {
  Building,
  Profile2User,
  Book,
  Chart,
  TickCircle
} from "iconsax-react";
import { Badge } from "@/komponen/ui/badge";
import { StatCard } from "@/fitur/superadmin/komponen/dashboard/StatCard";
import { AnalyticsCharts } from "@/fitur/superadmin/komponen/dashboard/AnalyticsCharts";
import { motion, AnimatePresence } from "framer-motion";

export function AnalyticsPage() {
  const { data: analytics, isLoading } = useTenantAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Memuat data analitik...
          </p>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totals = analytics?.reduce(
    (acc, tenant) => ({
      tenants: acc.tenants + 1,
      users: acc.users + tenant.user_count,
      courses: acc.courses + tenant.course_count,
      enrollments: acc.enrollments + tenant.enrollment_count,
    }),
    { tenants: 0, users: 0, courses: 0, enrollments: 0 },
  ) || { tenants: 0, users: 0, courses: 0, enrollments: 0 };


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
      className="space-y-6 font-sans text-gray-900 antialiased pb-10"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header Section */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight text-gray-800">Analitik & Wawasan</h1>
          <p className="text-gray-500 text-xs">
            Pantau performa platform, pertumbuhan tenant, dan aktivitas pengguna secara real-time.
          </p>
        </div>
      </motion.div>

      {/* Platform Overview */}
      <motion.section variants={item} className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tenant"
          value={totals.tenants}
          subtext="Entitas terdaftar"
          icon={Building}
          color="bg-blue-500"
          trend="+5%"
        />
        <StatCard
          title="Total Pengguna"
          value={totals.users}
          subtext="Akun platform"
          icon={Profile2User}
          color="bg-emerald-500"
          trend="+12%"
        />
        <StatCard
          title="Total Kursus"
          value={totals.courses}
          subtext="Modul pembelajaran"
          icon={Book}
          color="bg-violet-500"
          trend="+8%"
        />
        <StatCard
          title="Pendaftaran"
          value={totals.enrollments}
          subtext="Total partisipasi"
          icon={Chart}
          color="bg-amber-500"
          trend="+24%"
        />
      </motion.section>

      {/* Analytics Charts */}
      <motion.div variants={item}>
        <AnalyticsCharts />
      </motion.div>

      {/* Full Table */}
      <motion.div variants={item} className="shadow-sm border border-gray-300 rounded-xl overflow-hidden bg-white">
        <CardHeader className="bg-white border-b py-5 px-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-gray-800">Detail Statistik Per Tenant</CardTitle>
              <CardDescription className="text-xs text-gray-400 mt-1">
                Tabel data lengkap performa seluruh tenant.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100">
                <TableHead className="py-4 pl-6 pr-4 text-left text-xs font-semibold text-gray-500">Nama Tenant</TableHead>
                <TableHead className="px-2 py-4 text-center text-xs font-semibold text-gray-500">Pengguna</TableHead>
                <TableHead className="px-2 py-4 text-center text-xs font-semibold text-gray-500">Kursus</TableHead>
                <TableHead className="px-2 py-4 text-center text-xs font-semibold text-gray-500">Pendaftaran</TableHead>
                <TableHead className="px-2 py-4 text-center text-xs font-semibold text-gray-500">Aktif (30hr)</TableHead>
                <TableHead className="px-4 py-4 text-center text-xs font-semibold text-gray-500">Efektivitas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics?.map((tenant) => (
                <TableRow key={tenant.id_lembaga} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0 cursor-pointer">
                  <TableCell className="py-4 pl-6 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-gray-100 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-sm transition-all duration-200 group-hover:border-violet-100">
                        <Building size={20} variant="Bold" className="group-hover:text-primary transition-colors" />
                      </div>
                      <span className="font-bold text-sm text-gray-800 group-hover:text-primary transition-colors">
                        {tenant.tenant_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-4 px-2">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-gray-700">{tenant.user_count}</span>
                      <span className="text-[10px] text-gray-400">Users</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-4 px-2">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-gray-700">{tenant.course_count}</span>
                      <span className="text-[10px] text-gray-400">Kursus</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-4 px-2">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-gray-700">{tenant.enrollment_count}</span>
                      <span className="text-[10px] text-gray-400">Daftar</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-4 px-2">
                    <div className="flex items-center gap-1.5 border rounded-full p-1 pl-1.5 w-fit bg-white border-gray-100 shadow-sm mx-auto">
                      <TickCircle size={16} variant='Bold' className='text-emerald-500' />
                      <span className="text-xs font-bold text-emerald-700 pr-2">
                        {tenant.active_users_30d} Active
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-4 px-4">
                    <Badge variant="outline" className="font-bold text-[10px] bg-gray-50 border-gray-200 text-gray-600 py-1">
                      {tenant.course_count > 0 ? (tenant.enrollment_count / tenant.course_count).toFixed(1) : "0"} Daftar/Modul
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </motion.div>
    </motion.div>
  );
}
