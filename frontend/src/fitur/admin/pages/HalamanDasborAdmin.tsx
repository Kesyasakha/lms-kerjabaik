import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { cn, getInitials, getAvatarColor } from "@/pustaka/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/komponen/ui/card";
import { Button } from "@/komponen/ui/button";
import { Badge } from "@/komponen/ui/badge";
import { useDashboardStats } from "../hooks/useDashboard";
import { StatCard } from "@/fitur/superadmin/komponen/dashboard/StatCard";
import {
  Teacher,
  Profile2User,
  Book,
  TrendUp,
  ProfileAdd,
  Add,
  Chart,
  ArrowRight,
  Clock
} from "iconsax-react";
import { motion } from "framer-motion";

export function HalamanDasborAdmin() {
  const { data: stats, isLoading, error } = useDashboardStats();

  // Format date to relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString("id-ID");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-muted rounded-2xl"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-dashed border-red-200">
        <div className="p-4 rounded-full bg-red-50 text-red-500 mb-4">
          <Settings size={24} />
        </div>
        <h3 className="text-xl font-bold text-red-900">Gagal memuat dashboard</h3>
        <p className="text-red-600/70 mt-2">{error.message}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-6 rounded-xl">
          Coba Lagi
        </Button>
      </div>
    );
  }

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
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 mb-1">
            Dasbor Admin
          </h1>
          <p className="text-gray-500 text-xs">
            Overview performa organisasi dan statistik pembelajaran.
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Pengguna"
          value={stats?.totalUsers || 0}
          subtext="Akun terdaftar"
          icon={Profile2User}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Kursus"
          value={stats?.totalCourses || 0}
          subtext="Aktif & Draft"
          icon={Book}
          color="bg-violet-500"
        />
        <StatCard
          title="Pendaftaran"
          value={stats?.activeEnrollments || 0}
          subtext="Sedang belajar"
          icon={TrendUp}
          color="bg-emerald-500"
        />
        <StatCard
          title="Selesai"
          value={stats?.completedEnrollments || 0}
          subtext="Lulus pembelajaran"
          icon={Teacher} // Using 'Teacher' as a metaphor for 'Graduated/Mastery' or we could use 'Award'
          color="bg-amber-500"
        />
      </motion.div>

      {/* Quick Actions Redesign */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/users" className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[100px] -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <ProfileAdd size={24} variant="Bold" />
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">Tambah Pengguna</h3>
              <p className="text-gray-500 text-xs mt-1">Daftarkan akun siswa atau instruktur baru</p>
            </div>
            <div className="mt-4 flex items-center text-blue-600 text-xs font-bold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              Mulai Sekarang <ArrowRight size={14} className="ml-1" />
            </div>
          </div>
        </Link>

        <Link to="/admin/courses" className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 hover:shadow-md hover:border-violet-200 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50 rounded-bl-[100px] -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="p-3 bg-violet-50 text-violet-600 rounded-xl w-fit group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
              <Add size={24} variant="Bold" />
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-gray-800 text-lg group-hover:text-violet-600 transition-colors">Tambah Kursus</h3>
              <p className="text-gray-500 text-xs mt-1">Buat modul pembelajaran baru</p>
            </div>
            <div className="mt-4 flex items-center text-violet-600 text-xs font-bold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              Mulai Sekarang <ArrowRight size={14} className="ml-1" />
            </div>
          </div>
        </Link>

        <Link to="/admin/reports" className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 hover:shadow-md hover:border-emerald-200 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[100px] -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
              <Chart size={24} variant="Bold" />
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-gray-800 text-lg group-hover:text-emerald-600 transition-colors">Laporan</h3>
              <p className="text-gray-500 text-xs mt-1">Lihat analitik pembelajaran detil</p>
            </div>
            <div className="mt-4 flex items-center text-emerald-600 text-xs font-bold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              Lihat Data <ArrowRight size={14} className="ml-1" />
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Recent Activity Grid */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Pengguna Terbaru</h3>
              <p className="text-xs text-gray-500 mt-1">Registrasi pengguna bulan ini</p>
            </div>
            <Link to="/admin/users" className="text-xs font-bold text-violet-600 hover:text-violet-700 hover:bg-violet-50 px-3 py-2 rounded-lg transition-colors">
              Lihat Semua
            </Link>
          </div>
          <div className="p-4 flex-1">
            {stats?.recentUsers && stats.recentUsers.length > 0 ? (
              <div className="space-y-2">
                {stats.recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-sm transition-transform group-hover:scale-105",
                        getAvatarColor(user.nama_lengkap)
                      )}>
                        {getInitials(user.nama_lengkap)}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-800 group-hover:text-violet-600 transition-colors">
                          {user.nama_lengkap}
                        </p>
                        <p className="text-xs text-gray-500 font-medium font-mono">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize text-[10px] font-bold px-2.5 py-1 rounded-lg border-0 shadow-sm",
                          user.role === 'admin' ? "bg-blue-50 text-blue-700" :
                            user.role === 'instruktur' ? "bg-purple-50 text-purple-700" :
                              "bg-gray-100 text-gray-700"
                        )}
                      >
                        {user.role === 'admin' ? "Admin" : user.role === 'instruktur' ? "Instruktur" : "Pembelajar"}
                      </Badge>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(user.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-60 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Profile2User size={32} className="text-gray-300" variant="Bulk" />
                </div>
                <p className="text-sm font-bold text-gray-900">Belum ada pengguna</p>
                <p className="text-xs text-gray-400 mt-1 max-w-[200px]">Data akan muncul setelah ada pengguna mendaftar.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Courses */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Kursus Terbaru</h3>
              <p className="text-xs text-gray-500 mt-1">Kurikulum pembelajaran terkini</p>
            </div>
            <Link to="/admin/courses" className="text-xs font-bold text-violet-600 hover:text-violet-700 hover:bg-violet-50 px-3 py-2 rounded-lg transition-colors">
              Lihat Semua
            </Link>
          </div>
          <div className="p-4 flex-1">
            {stats?.recentCourses && stats.recentCourses.length > 0 ? (
              <div className="space-y-2">
                {stats.recentCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
                        <Book size={24} variant="Bold" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <Link
                          to={`/admin/kursus/${course.id}`}
                          className="text-sm font-bold text-gray-800 hover:text-violet-600 truncate block transition-colors"
                        >
                          {course.judul}
                        </Link>
                        <p className="text-[10px] text-gray-500 font-medium flex items-center gap-2">
                          <span className="flex items-center gap-1"><Teacher size={12} className="text-gray-400" /> {course.instruktur_nama || "Belum ada instruktur"}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="flex items-center gap-1 text-gray-700 font-bold"><Profile2User size={12} className="text-gray-400" /> {course.enrollment_count} Siswa</span>
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize text-[10px] font-bold px-2.5 py-1 rounded-lg border-0 shadow-sm",
                          course.status === 'published' ? "bg-emerald-50 text-emerald-700" :
                            course.status === 'draft' ? "bg-amber-50 text-amber-700" :
                              "bg-gray-100 text-gray-700"
                        )}
                      >
                        {course.status === 'published' ? 'Terbit' : course.status === 'draft' ? 'Draft' : 'Arsip'}
                      </Badge>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                        <TrendUp size={12} className="text-emerald-500" variant="Bold" />
                        Baru dibuat
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-60 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Book size={32} className="text-gray-300" variant="Bulk" />
                </div>
                <p className="text-sm font-bold text-gray-900">Belum ada kursus</p>
                <Button asChild size="sm" className="mt-4 rounded-xl text-xs h-9 bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200">
                  <Link to="/admin/courses">Buat Kursus Pertama</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default HalamanDasborAdmin;
