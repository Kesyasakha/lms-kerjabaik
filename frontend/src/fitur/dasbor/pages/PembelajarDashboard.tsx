import { BookOpen, GraduationCap, Trophy, Clock, FileText, Calendar } from 'lucide-react';
import { CourseCard } from '@/fitur/pembelajar/komponen/CourseCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/komponen/ui/card';
import { Badge } from '@/komponen/ui/badge';
import {
  useLearnerStats,
  useEnrollments,
  useUpcomingDeadlines
} from '@/fitur/pembelajar/api/learnerApi';
import { Skeleton } from '@/komponen/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

export function PembelajarDashboard() {
  const { data: stats, isLoading: statsLoading } = useLearnerStats();
  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments();
  const { data: deadlines, isLoading: deadlinesLoading } = useUpcomingDeadlines();

  // Filter kursus berdasarkan status
  const activeEnrollments = enrollments?.filter(e => e.status === 'aktif') || [];
  const finishedEnrollments = enrollments?.filter(e => e.status === 'selesai') || [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10"
    >
      {/* Header Modern */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Dasbor Pembelajar
          </h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Selamat datang kembali! Lanjutkan perjalanan belajar Anda hari ini.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1.5 bg-background/50 backdrop-blur-sm border-gray-200 dark:border-gray-800 rounded-sm">
            <Calendar className="w-3.5 h-3.5 mr-2 text-primary" />
            <span className="font-medium">
              {new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </Badge>
        </div>
      </motion.div>

      {/* Rangkuman Statistik (Stats Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-sm" />
            ))}
          </>
        ) : (
          <>
            <motion.div variants={item}>
              <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-md border-gray-200 dark:border-gray-800 rounded-sm group">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Kursus Aktif</span>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-sm text-blue-600 dark:text-blue-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {stats?.total_kursus_aktif || 0}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 font-medium italic">
                    Sedang dipelajari
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-md border-gray-200 dark:border-gray-800 rounded-sm group">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Kursus Selesai</span>
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-sm text-emerald-600 dark:text-emerald-400">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {stats?.total_kursus_selesai || 0}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 font-medium italic">
                    Telah diselesaikan
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-md border-gray-200 dark:border-gray-800 rounded-sm group">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tugas Tertunda</span>
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-sm text-orange-600 dark:text-orange-400">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {stats?.total_tugas_pending || 0}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 font-medium italic">
                    Segera selesaikan
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-md border-gray-200 dark:border-gray-800 rounded-sm group">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rerata Progres</span>
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-sm text-purple-600 dark:text-purple-400">
                      <Trophy className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {stats?.rata_rata_progress || 0}%
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 font-medium italic">
                    Capaian belajar
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kursus Aktif Section */}
        <motion.div variants={item} className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">Kursus Berjalan</h2>
          </div>

          {enrollmentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-64 rounded-sm" />
              <Skeleton className="h-64 rounded-sm" />
            </div>
          ) : activeEnrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeEnrollments.map((enrollment) => (
                <CourseCard key={enrollment.id} enrollment={enrollment} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 rounded-sm bg-muted/20">
              <CardContent className="p-12 text-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <h3 className="text-sm font-bold">Belum Ada Kursus Aktif</h3>
                <p className="text-xs text-muted-foreground mt-2 max-w-[200px] mx-auto">
                  Mulai perjalanan belajar Anda dengan mendaftar ke kursus yang tersedia.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Riwayat Belajar Section (Courses Selesai) */}
          {finishedEnrollments.length > 0 && (
            <div className="space-y-4 pt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight">Riwayat Belajar</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {finishedEnrollments.map((enrollment) => (
                  <CourseCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Tenggat Waktu Section */}
        <motion.div variants={item} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">Tenggat Waktu</h2>
          </div>

          <Card className="rounded-sm border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-fit">
            <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/50 border-b p-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold">Aktivitas Mendatang</CardTitle>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Pantau jadwal tugas Anda</p>
                </div>
                <Badge variant="secondary" className="font-bold text-[10px] h-5 rounded-sm">
                  {deadlines?.length || 0} Total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <AnimatePresence>
                {deadlinesLoading ? (
                  <div className="p-4 space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : deadlines && deadlines.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {deadlines.map((deadline) => (
                      <motion.div
                        key={deadline.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 hover:bg-slate-50/80 dark:hover:bg-zinc-900/50 transition-colors group cursor-default"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`
                            mt-0.5 p-2 rounded-sm shrink-0
                            ${deadline.tipe === 'tugas' ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'}
                          `}>
                            {deadline.tipe === 'tugas' ? <FileText className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-zinc-100 line-clamp-1 group-hover:text-primary transition-colors">
                              {deadline.judul}
                            </h4>
                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5 line-clamp-1">
                              {deadline.kursus_judul}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 text-[11px] font-bold">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {new Date(deadline.deadline).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                  })}
                                </span>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-medium">
                                {new Date(deadline.deadline).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                      <Clock className="h-6 w-6 text-slate-300 dark:text-zinc-700" />
                    </div>
                    <h3 className="text-sm font-bold">Semua Aman!</h3>
                    <p className="text-muted-foreground text-[11px] mt-1 line-clamp-2">
                      Tidak ada tenggat waktu tugas atau ujian dalam waktu dekat.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
