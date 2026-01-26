import { BookOpen, GraduationCap, Trophy, Clock } from 'lucide-react';
import { CourseCard } from '@/fitur/pembelajar/komponen/CourseCard';
import { Card, CardContent } from '@/komponen/ui/card';
import { Badge } from '@/komponen/ui/badge';
import {
  useLearnerStats,
  useEnrollments,
  useUpcomingDeadlines
} from '@/fitur/pembelajar/api/learnerApi';
import { Skeleton } from '@/komponen/ui/skeleton';

export function PembelajarDashboard() {
  const { data: stats, isLoading: statsLoading } = useLearnerStats();
  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments();
  const { data: deadlines, isLoading: deadlinesLoading } = useUpcomingDeadlines();

  // Filter hanya kursus aktif untuk ditampilkan
  const activeEnrollments = enrollments?.filter(e => e.status === 'aktif') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Pembelajar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Lanjutkan perjalanan belajar Anda hari ini.
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-0.5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            {new Date().toLocaleDateString("id-ID", { weekday: 'long' })}
          </span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-base font-bold text-gray-900 dark:text-zinc-100 italic">
              {new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          <>
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </>
        ) : (
          <>
            <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-blue-500/50 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-sm font-semibold text-muted-foreground">Kursus Aktif</span>
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                    <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
                  {stats?.total_kursus_aktif || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Kursus yang sedang diikuti
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-emerald-500/50 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-sm font-semibold text-muted-foreground">Kursus Selesai</span>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-colors">
                    <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold tracking-tight text-emerald-900 dark:text-emerald-100">
                  {stats?.total_kursus_selesai || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Kursus yang telah diselesaikan
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-orange-500/50 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-sm font-semibold text-muted-foreground">Tugas Tertunda</span>
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 transition-colors">
                    <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold tracking-tight text-orange-900 dark:text-orange-100">
                  {stats?.total_tugas_pending || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Tugas yang belum dikerjakan
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-purple-500/50 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-sm font-semibold text-muted-foreground">Rata-rata Progress</span>
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-colors">
                    <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold tracking-tight text-purple-900 dark:text-purple-100">
                  {stats?.rata_rata_progress || 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Progress keseluruhan
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Active Courses */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Kursus Aktif</h2>
        {enrollmentsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        ) : activeEnrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeEnrollments.map((enrollment) => (
              <CourseCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum ada kursus aktif</h3>
              <p className="text-muted-foreground">
                Mulai perjalanan belajar Anda dengan mendaftar kursus
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upcoming Deadlines */}
      <Card className="rounded-2xl shadow-none border-muted/60 overflow-hidden">
        <div className="bg-muted/10 border-b p-6">
          <h2 className="text-xl font-bold">Tenggat Waktu Mendatang</h2>
          <p className="text-sm text-muted-foreground font-medium">Jadwal tugas dan ujian terdekat</p>
        </div>
        <CardContent className="p-6">
          {deadlinesLoading ? (
            <Skeleton className="h-48 w-full rounded-xl" />
          ) : deadlines && deadlines.length > 0 ? (
            <div className="space-y-3">
              {deadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-center justify-between p-4 border border-muted/40 rounded-xl hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={deadline.tipe === 'tugas' ? 'default' : 'secondary'} className="text-[10px] uppercase tracking-wider">
                        {deadline.tipe}
                      </Badge>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors">{deadline.judul}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                      {deadline.kursus_judul}
                    </p>
                  </div>
                  <div className="text-right pl-4 border-l border-dashed border-muted ml-4">
                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                      {new Date(deadline.deadline).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {new Date(deadline.deadline).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <h3 className="text-lg font-bold">Tidak ada tenggat waktu</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">
                Anda tidak memiliki tugas atau ujian yang harus diselesaikan dalam waktu dekat
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
