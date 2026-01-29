import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, User, CheckCircle, PlayCircle } from 'lucide-react';
import { Button } from '@/komponen/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/komponen/ui/card';
import { Badge } from '@/komponen/ui/badge';
import { Skeleton } from '@/komponen/ui/skeleton';
import { useCourseDetail, useIsEnrolled } from '@/fitur/pembelajar/api/catalogApi';
import { useEnrollCourse } from '@/fitur/pembelajar/api/learnerApi';
import { toast } from 'sonner';

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: course, isLoading: courseLoading } = useCourseDetail(id!);
  const { data: enrollmentStatus, isLoading: enrollmentLoading } = useIsEnrolled(id!);
  const enrollMutation = useEnrollCourse();

  const handleEnroll = async () => {
    try {
      await enrollMutation.mutateAsync(id!);
      toast.success('Berhasil mendaftar kursus!');
    } catch (error) {
      toast.error('Gagal mendaftar kursus. Silakan coba lagi.');
    }
  };

  const handleContinueLearning = () => {
    if (enrollmentStatus && 'enrollmentId' in enrollmentStatus) {
      navigate(`/pembelajar/learn/${enrollmentStatus.enrollmentId}`);
    }
  };

  const getTingkatColor = (tingkat?: string) => {
    switch (tingkat) {
      case 'pemula':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'menengah':
        return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'lanjutan':
        return 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800';
    }
  };

  const totalMateri = course?.modul?.reduce((sum, modul) => sum + (modul.materi?.length || 0), 0) || 0;
  const totalDurasi = course?.modul?.reduce((sum, modul) => sum + (modul.durasi_menit || 0), 0) || 0;

  if (courseLoading || enrollmentLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-96" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Kursus tidak ditemukan</h2>
        <p className="text-muted-foreground mb-4">Kursus yang Anda cari tidak tersedia</p>
        <Button onClick={() => navigate('/pembelajar/courses')}>
          Kembali ke Katalog
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/pembelajar/courses')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali ke Katalog
      </Button>

      {/* Course Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thumbnail & Title */}
          <Card>
            <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600">
              {course.url_gambar_mini ? (
                <img
                  src={course.url_gambar_mini}
                  alt={course.judul}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-24 w-24 text-white/50" />
                </div>
              )}
            </div>
            <CardContent className="p-6">
              {/* Kategori & Tingkat */}
              <div className="flex items-center gap-2 flex-wrap mb-4">
                {course.kategori && (
                  <Badge variant="outline">{course.kategori}</Badge>
                )}
                {course.tingkat && (
                  <span className={`text-sm px-3 py-1 rounded-md ${getTingkatColor(course.tingkat)}`}>
                    {course.tingkat.charAt(0).toUpperCase() + course.tingkat.slice(1)}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold mb-4">{course.judul}</h1>

              {/* Description */}
              {course.deskripsi && (
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {course.deskripsi}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Curriculum */}
          <Card>
            <CardHeader>
              <CardTitle>Kurikulum</CardTitle>
            </CardHeader>
            <CardContent>
              {course.modul && course.modul.length > 0 ? (
                <div className="space-y-4">
                  {course.modul
                    .sort((a, b) => a.urutan - b.urutan)
                    .map((modul, index) => (
                      <div key={modul.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold">
                              Modul {index + 1}: {modul.judul}
                            </h3>
                            {modul.deskripsi && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {modul.deskripsi}
                              </p>
                            )}
                          </div>
                          {modul.durasi_menit && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground ml-4">
                              <Clock className="h-4 w-4" />
                              <span>{modul.durasi_menit} menit</span>
                            </div>
                          )}
                        </div>

                        {/* Materi List */}
                        {modul.materi && modul.materi.length > 0 && (
                          <div className="mt-3 space-y-2 pl-4 border-l-2 border-muted">
                            {modul.materi
                              .sort((a, b) => a.urutan - b.urutan)
                              .map((materi) => (
                                <div
                                  key={materi.id}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  {materi.tipe === 'video' ? (
                                    <PlayCircle className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span>{materi.judul}</span>
                                  {materi.wajib && (
                                    <Badge variant="secondary" className="text-xs">
                                      Wajib
                                    </Badge>
                                  )}
                                  {materi.durasi_menit && (
                                    <span className="text-muted-foreground ml-auto">
                                      {materi.durasi_menit} menit
                                    </span>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Belum ada kurikulum untuk kursus ini
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Kursus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Instruktur */}
              {course.instruktur && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Instruktur</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {course.instruktur.url_foto ? (
                        <img
                          src={course.instruktur.url_foto}
                          alt={course.instruktur.nama_lengkap}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{course.instruktur.nama_lengkap}</p>
                      <p className="text-xs text-muted-foreground">
                        {course.instruktur.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Modul</span>
                  <span className="font-medium">{course.modul?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Materi</span>
                  <span className="font-medium">{totalMateri}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Durasi</span>
                  <span className="font-medium">
                    {Math.floor(totalDurasi / 60)}j {totalDurasi % 60}m
                  </span>
                </div>
              </div>

              {/* Enrollment Status & aksi */}
              <div className="pt-4 border-t">
                {enrollmentStatus && 'enrolled' in enrollmentStatus && enrollmentStatus.enrolled ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Anda sudah terdaftar</span>
                    </div>
                    {enrollmentStatus.status === 'aktif' ? (
                      <Button
                        className="w-full"
                        onClick={handleContinueLearning}
                      >
                        Lanjutkan Belajar
                      </Button>
                    ) : enrollmentStatus.status === 'selesai' ? (
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={handleContinueLearning}
                      >
                        Tinjau Materi
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={handleEnroll}
                    disabled={enrollMutation.isPending}
                  >
                    {enrollMutation.isPending ? 'Mendaftar...' : 'Daftar Kursus'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
