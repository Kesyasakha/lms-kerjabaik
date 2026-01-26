import { Card, CardContent, CardHeader, CardTitle } from "@/komponen/ui/card";
import { Button } from "@/komponen/ui/button";
import { Badge } from "@/komponen/ui/badge";
import { Skeleton } from "@/komponen/ui/skeleton";
import {
  BookOpen,
  Users,
  ClipboardList,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  useInstructorDashboardStats,
  useRecentActivities,
  useDashboardCourses,
  usePendingSubmissions,
} from "../hooks/useInstructorDashboard";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default function InstructorDashboard() {
  const { data: stats, isLoading: statsLoading } =
    useInstructorDashboardStats();
  const { data: activities, isLoading: activitiesLoading } =
    useRecentActivities(10);
  const { data: courses, isLoading: coursesLoading } = useDashboardCourses(6);
  const { data: pendingSubmissions, isLoading: pendingLoading } =
    usePendingSubmissions(10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dasbor Instruktur
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Selamat datang kembali! Berikut ringkasan aktivitas pengajaran Anda hari ini.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-white/50 backdrop-blur-sm shadow-sm border-gray-200">
            <Clock className="w-3.5 h-3.5 mr-2 text-primary" />
            {new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-blue-500/50 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Kursus</CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
                  {stats?.total_courses || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Kursus yang Anda ajarkan
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-green-500/50 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Peserta</CardTitle>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg group-hover:bg-green-100 dark:group-hover:bg-green-900/40 transition-colors">
              <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold tracking-tight text-green-900 dark:text-green-100">
                  {stats?.total_students || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Peserta aktif</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-orange-500/50 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Tugas Tertunda
            </CardTitle>
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 transition-colors">
              <ClipboardList className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold tracking-tight text-orange-900 dark:text-orange-100">
                  {stats?.pending_submissions || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Perlu dinilai</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-purple-500/50 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Rata-rata Nilai
            </CardTitle>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-colors">
              <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold tracking-tight text-purple-900 dark:text-purple-100">
                  {stats?.avg_class_score || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Dari semua kursus
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Submissions */}
        <Card className="rounded-2xl shadow-none border-muted/60 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-muted/10 border-b p-6">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">Tugas Tertunda</CardTitle>
              <p className="text-sm text-muted-foreground font-medium">Jawaban siswa yang belum dinilai</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="font-bold text-primary hover:text-primary/80 hover:bg-transparent">
              <Link to="/instruktur/assessments">
                Lihat Semua
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {pendingLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : pendingSubmissions && pendingSubmissions.length > 0 ? (
              <div className="space-y-3">
                {pendingSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-start justify-between rounded-xl border border-muted/40 p-4 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {submission.student_name}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {submission.kursus_judul} •{" "}
                        <span className="text-foreground">{submission.assignment_title}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <p className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(
                            new Date(submission.submitted_at),
                            {
                              addSuffix: true,
                              locale: idLocale,
                            },
                          )}
                        </p>
                      </div>
                    </div>
                    {submission.days_pending > 3 && (
                      <Badge variant="destructive" className="shrink-0 text-[10px] px-2 py-0.5">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        {submission.days_pending} hari
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                  <ClipboardList className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-foreground font-bold">Semua tugas telah dinilai!</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tidak ada antrean tugas saat ini
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="rounded-2xl shadow-none border-muted/60 overflow-hidden">
          <CardHeader className="bg-muted/10 border-b p-6">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">Aktivitas Terbaru</CardTitle>
              <p className="text-sm text-muted-foreground font-medium">Interaksi terkini dalam kursus Anda</p>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {activitiesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center shrink-0
                      ${activity.type === 'submission' ? 'bg-orange-100 text-orange-600' :
                        activity.type === 'pendaftaran_kursus' ? 'bg-blue-100 text-blue-600' :
                          'bg-slate-100 text-slate-600'}
                    `}>
                      {activity.type === 'submission' ? <ClipboardList className="w-4 h-4" /> :
                        activity.type === 'pendaftaran_kursus' ? <Users className="w-4 h-4" /> :
                          <TrendingUp className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-bold">
                          {activity.student_name}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {activity.description.toLowerCase()}
                        </span>
                      </p>
                      <p className="text-xs font-medium text-primary/80">
                        {activity.kursus_judul}
                      </p>
                      <p className="text-[10px] text-muted-foreground pt-1">
                        {formatDistanceToNow(new Date(activity.timestamp), {
                          addSuffix: true,
                          locale: idLocale,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Belum ada aktivitas
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* My Courses */}
      {/* My Courses */}
      <Card className="rounded-2xl shadow-none border-muted/60 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-muted/10 border-b p-6">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold">Kursus Saya</CardTitle>
            <p className="text-sm text-muted-foreground font-medium">Akses cepat ke kursus yang Anda ampu</p>
          </div>
          <Button variant="ghost" size="sm" asChild className="font-bold text-primary hover:text-primary/80 hover:bg-transparent">
            <Link to="/instruktur/courses">
              Lihat Semua
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          {coursesLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          ) : courses && courses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/instruktur/kursus/${course.id}`}
                  className="group"
                >
                  <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-muted/60 hover:border-primary/50">
                    {course.url_gambar_mini && (
                      <div className="aspect-video overflow-hidden bg-muted relative">
                        <img
                          src={course.url_gambar_mini}
                          alt={course.judul}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="text-white font-bold text-sm px-4 py-2 border border-white/50 rounded-full backdrop-blur-sm">Kelola Kursus</span>
                        </div>
                      </div>
                    )}
                    <CardContent className="p-5">
                      <h3 className="font-bold text-lg line-clamp-2 text-gray-900 dark:text-white group-hover:text-primary transition-colors leading-tight mb-4">
                        {course.judul}
                      </h3>
                      <div className="grid grid-cols-3 gap-2 text-xs py-3 border-t border-dashed">
                        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300">
                          <Users className="h-4 w-4 mb-1" />
                          <span className="font-bold">{course.total_students}</span>
                          <span className="text-[9px] opacity-70 uppercase tracking-tighter">Siswa</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-300">
                          <ClipboardList className="h-4 w-4 mb-1" />
                          <span className="font-bold">{course.pending_submissions}</span>
                          <span className="text-[9px] opacity-70 uppercase tracking-tighter">Tugas</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-300">
                          <TrendingUp className="h-4 w-4 mb-1" />
                          <span className="font-bold">{course.completion_rate}%</span>
                          <span className="text-[9px] opacity-70 uppercase tracking-tighter">Selesai</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                Anda belum mengajar kursus apapun
              </p>
              <p className="text-xs text-muted-foreground">
                Hubungi admin untuk ditugaskan ke kursus
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
