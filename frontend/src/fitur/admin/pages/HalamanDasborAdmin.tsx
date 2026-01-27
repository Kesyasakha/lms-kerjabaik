import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  UserPlus,
  Plus,
  Settings,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { cn, getInitials, getAvatarColor } from "@/pustaka/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/komponen/ui/card";
import { Button } from "@/komponen/ui/button";
import { Badge } from "@/komponen/ui/badge";
import { useDashboardStats } from "../hooks/useDashboard";

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
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-red-900 dark:text-red-100">Gagal memuat dashboard</h3>
        <p className="text-red-600/70 dark:text-red-400/70 mt-2">{error.message}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-6">
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Dasbor Admin
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            Selamat datang kembali! Berikut ringkasan aktivitas organisasi Anda hari ini.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-white/50 backdrop-blur-sm shadow-sm border-gray-200">
            <Calendar className="w-3.5 h-3.5 mr-2 text-primary" />
            {new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-blue-500/50 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Pengguna</CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{stats?.totalUsers || 0}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase">
              Pengguna terdaftar
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-purple-500/50 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Kursus</CardTitle>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-colors">
              <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{stats?.totalCourses || 0}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase">
              Aktif & Draft
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-emerald-500/50 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Pendaftaran Aktif</CardTitle>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-colors">
              <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight" style={{ color: "rgb(16, 185, 129)" }}>{stats?.activeEnrollments || 0}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase">
              Sedang belajar
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-amber-500/50 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Selesai Belajar</CardTitle>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition-colors">
              <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight" style={{ color: "rgb(245, 158, 11)" }}>{stats?.completedEnrollments || 0}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase">
              Selesai kurikulum
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="rounded-2xl border shadow-none bg-muted/20">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold">Aksi Cepat</CardTitle>
            <p className="text-xs text-muted-foreground font-medium">
              Tugas administratif utama yang sering diakses
            </p>
          </div>
          <TrendingUp className="w-5 h-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="sm" className="rounded-xl shadow-sm px-5">
              <Link to="/admin/users">
                <UserPlus className="w-4 h-4 mr-2" />
                Tambah Pengguna
              </Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="rounded-xl shadow-none px-5 bg-white dark:bg-muted border border-muted-foreground/10">
              <Link to="/admin/courses">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Kursus
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-xl shadow-none px-5 border-muted-foreground/20">
              <Link to="/admin/reports">
                <BarChart3 className="w-4 h-4 mr-2" />
                Laporan Analitik
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-xl shadow-none px-5 border-muted-foreground/20">
              <Link to="/admin/settings">
                <Settings className="w-4 h-4 mr-2" />
                Pengaturan
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="rounded-2xl shadow-none border-muted/60 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-muted/10 border-b p-4">
            <div className="space-y-0.5">
              <CardTitle className="text-lg font-bold">Pengguna Terbaru</CardTitle>
              <p className="text-xs text-muted-foreground font-medium">Registrasi pengguna bulan ini</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="font-bold text-primary hover:text-primary/80 hover:bg-transparent">
              <Link to="/admin/users">Lihat Semua</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {stats?.recentUsers && stats.recentUsers.length > 0 ? (
              <div className="space-y-5">
                {stats.recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm transition-transform group-hover:scale-105",
                        getAvatarColor(user.nama_lengkap)
                      )}>
                        {getInitials(user.nama_lengkap)}
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-bold text-gray-900 dark:text-white leading-tight">
                          {user.nama_lengkap}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize text-[9px] font-bold px-2 py-0.5 rounded-md tracking-wider border-0",
                          user.role === 'admin' ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                            user.role === 'instruktur' ? "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" :
                              "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        )}
                      >
                        {user.role === 'admin' ? "Admin" : user.role === 'instruktur' ? "Instruktur" : "Pembelajar"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5 opacity-70">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(user.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground font-bold">Belum ada pengguna terbaru</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Courses */}
        <Card className="rounded-2xl shadow-none border-muted/60 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-muted/10 border-b p-4">
            <div className="space-y-0.5">
              <CardTitle className="text-lg font-bold">Kursus Terbaru</CardTitle>
              <p className="text-xs text-muted-foreground font-medium">Kurikulum pembelajaran terkini</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="font-bold text-primary hover:text-primary/80 hover:bg-transparent">
              <Link to="/admin/courses">Lihat Semua</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {stats?.recentCourses && stats.recentCourses.length > 0 ? (
              <div className="space-y-5">
                {stats.recentCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4 border-l-4 border-primary pl-4 py-1">
                      <div className="min-w-0 space-y-1">
                        <Link
                          to={`/admin/kursus/${course.id}`}
                          className="font-bold text-gray-900 dark:text-white hover:text-primary truncate block transition-colors leading-tight"
                        >
                          {course.judul}
                        </Link>
                        <p className="text-xs text-muted-foreground font-medium">
                          {course.instruktur_nama || "Belum ada instruktur"} •{" "}
                          <span className="text-foreground font-bold">{course.enrollment_count}</span> <span className="opacity-70">Siswa</span>
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize text-[9px] font-bold px-2 py-0.5 rounded-md tracking-wider border-0",
                          course.status === 'published' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" :
                            course.status === 'draft' ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" :
                              "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        )}
                      >
                        {course.status === 'published' ? 'Terbit' : course.status === 'draft' ? 'Draft' : 'Arsip'}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5 opacity-70">
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                        Baru saja dibuat
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 flex flex-col items-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground font-bold">Belum ada kursus</p>
                <Button asChild className="mt-6 rounded-xl" variant="outline">
                  <Link to="/admin/courses">Buat Kursus Pertama</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enrollment Overview */}
      {stats?.enrollmentsByStatus && stats.enrollmentsByStatus.length > 0 && (
        <Card className="rounded-2xl shadow-none border-muted/60 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-muted/5 border-b p-4">
            <div className="space-y-0.5">
              <CardTitle className="text-lg font-bold">Ringkasan Pendaftaran</CardTitle>
              <p className="text-xs text-muted-foreground font-medium">Distribusi status belajar siswa secara keseluruhan</p>
            </div>
            <div className="p-2 bg-muted rounded-lg">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.enrollmentsByStatus.map((item) => (
                <div
                  key={item.status}
                  className="p-4 rounded-xl border border-muted/40 bg-card hover:border-primary/30 transition-colors"
                >
                  <p className="text-2xl font-extrabold text-foreground">
                    {item.count}
                  </p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.05em] mt-1">
                    {item.status === 'enrolled' ? 'Terdaftar' : item.status === 'active' ? 'Aktif' : item.status === 'completed' ? 'Selesai' : 'Batal'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


export default HalamanDasborAdmin;
