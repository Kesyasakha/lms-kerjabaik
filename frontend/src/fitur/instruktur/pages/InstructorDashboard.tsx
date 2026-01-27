import { Card, CardContent, CardHeader, CardTitle } from "@/komponen/ui/card";
import { Button } from "@/komponen/ui/button";
import { Badge } from "@/komponen/ui/badge";
import { Skeleton } from "@/komponen/ui/skeleton";
import {
  BookOpen,
  Users,
  ClipboardList,
  TrendingUp,
  Calendar,
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Dasbor Instruktur
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            Selamat datang kembali! Berikut ringkasan aktivitas pengajaran Anda hari ini.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-white/50 backdrop-blur-sm shadow-sm border-gray-200">
            <Calendar className="w-3.5 h-3.5 mr-2 text-primary" />
            {new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden transition-all hover:shadow-md border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Kursus</CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {stats?.total_courses || 0}
                </div>
                <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase">
                  Kursus diajarkan
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all hover:shadow-md border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Peserta</CardTitle>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {stats?.total_students || 0}
                </div>
                <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase">Peserta aktif</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all hover:shadow-md border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Tugas Tertunda
            </CardTitle>
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
              <ClipboardList className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {stats?.pending_submissions || 0}
                </div>
                <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase">Perlu dinilai</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all hover:shadow-md border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Rata-rata Nilai
            </CardTitle>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {stats?.avg_class_score || 0}
                </div>
                <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase">
                  Skor keseluruhan
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Submissions */}
        <Card className="shadow-sm border-border/60 overflow-hidden">
          <CardHeader className="bg-muted/30 border-b py-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Tugas Tertunda</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Jawaban siswa yang belum dinilai
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild className="h-8 text-xs font-bold text-primary hover:text-primary/80 hover:bg-primary/5">
                <Link to="/instruktur/assessments">
                  Lihat Semua
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {pendingLoading ? (
              <div className="space-y-3 p-6">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : pendingSubmissions && pendingSubmissions.length > 0 ? (
              <div className="divide-y divide-border/50">
                {pendingSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-bold text-foreground truncate">
                          {submission.student_name}
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                          {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true, locale: idLocale })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {submission.kursus_judul} • <span className="font-medium text-foreground/80">{submission.assignment_title}</span>
                      </p>
                    </div>
                    {submission.days_pending > 3 && (
                      <Badge variant="destructive" className="shrink-0 text-[10px] px-2 py-0.5 h-auto">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        {submission.days_pending} hari
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-3">
                  <ClipboardList className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm font-bold text-foreground">Semua tugas telah dinilai!</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tidak ada antrean tugas saat ini
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="shadow-sm border-border/60 overflow-hidden">
          <CardHeader className="bg-muted/30 border-b py-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Aktivitas Terbaru</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Interaksi terkini dalam kursus Anda
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activitiesLoading ? (
              <div className="space-y-3 p-6">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="divide-y divide-border/50">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5
                      ${activity.type === 'submission' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' :
                        activity.type === 'pendaftaran_kursus' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}
                    `}>
                      {activity.type === 'submission' ? <ClipboardList className="w-4 h-4" /> :
                        activity.type === 'pendaftaran_kursus' ? <Users className="w-4 h-4" /> :
                          <TrendingUp className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-sm text-foreground">
                          <span className="font-bold">
                            {activity.student_name}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            {activity.description.toLowerCase()}
                          </span>
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(activity.timestamp), {
                            addSuffix: true,
                            locale: idLocale,
                          })}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-primary">
                        {activity.kursus_judul}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
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
