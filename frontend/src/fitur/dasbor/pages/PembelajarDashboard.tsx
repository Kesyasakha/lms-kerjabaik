import { BookOpen, GraduationCap, Trophy, Clock, FileText } from 'lucide-react';
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Dashboard Pembelajar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </>
        ) : (
          <>
            <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-md border-border/60 hover:border-blue-500/50 group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kursus Aktif</span>
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                    <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {stats?.total_kursus_aktif || 0}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                  Kursus yang sedang diikuti
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-md border-border/60 hover:border-emerald-500/50 group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kursus Selesai</span>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-colors">
                    <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {stats?.total_kursus_selesai || 0}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                  Kursus yang telah diselesaikan
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-md border-border/60 hover:border-orange-500/50 group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tugas Tertunda</span>
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 transition-colors">
                    <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {stats?.total_tugas_pending || 0}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                  Tugas yang belum dikerjakan
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-md border-border/60 hover:border-purple-500/50 group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rata-rata Progress</span>
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-colors">
                    <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {stats?.rata_rata_progress || 0}%
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                  Progress keseluruhan
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Active Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Kursus Aktif</h2>
        </div>
        {enrollmentsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        ) : activeEnrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeEnrollments.map((enrollment) => (
              <CourseCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-bold mb-1">Belum ada kursus aktif</h3>
              <p className="text-xs text-muted-foreground">
                Mulai perjalanan belajar Anda dengan mendaftar kursus
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upcoming Deadlines */}
      <Card className="rounded-lg shadow-sm border border-border/60 overflow-hidden">
        <div className="bg-muted/30 border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold">Tenggat Waktu Mendatang</h2>
              <p className="text-[10px] text-muted-foreground font-medium">Jadwal tugas dan ujian terdekat</p>
            </div>
            <Badge variant="outline" className="font-mono text-[10px]">
              {deadlines?.length || 0} Tugas
            </Badge>
          </div>
        </div>
        <CardContent className="p-0">
          {deadlinesLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : deadlines && deadlines.length > 0 ? (
            <div className="divide-y divide-border/50">
              {deadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`
                      mt-0.5 p-1.5 rounded-md shrink-0
                      ${deadline.tipe === 'tugas' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}
                    `}>
                      {deadline.tipe === 'tugas' ? <FileText className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">{deadline.judul}</h4>
                      <p className="text-[10px] text-muted-foreground font-medium line-clamp-1">
                        {deadline.kursus_judul}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <p className="text-xs font-bold text-orange-600 dark:text-orange-400">
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
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 bg-muted/50 rounded-full flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-muted-foreground/30" />
              </div>
              <h3 className="text-sm font-bold">Tidak ada tenggat waktu</h3>
              <p className="text-muted-foreground text-xs mt-0.5">
                Anda aman untuk saat ini
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
