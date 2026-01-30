import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, User, CheckCircle, PlayCircle, FileText, ChevronRight, Star, Share2 } from 'lucide-react';
import { Button } from '@/komponen/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/komponen/ui/card';
import { Badge } from '@/komponen/ui/badge';
import { Skeleton } from '@/komponen/ui/skeleton';
import { Separator } from '@/komponen/ui/separator';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/komponen/ui/accordion";
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
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'menengah':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'lanjutan':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800';
    }
  };

  const totalMateri = course?.modul?.reduce((sum, modul) => sum + (modul.materi?.length || 0), 0) || 0;
  const totalDurasi = course?.modul?.reduce((sum, modul) => sum + (modul.durasi_menit || 0), 0) || 0;

  if (courseLoading || enrollmentLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-12 w-3/4" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
            <BookOpen className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Kursus tidak ditemukan</h2>
        <p className="text-gray-500 mb-6">Kursus yang Anda cari tidak tersedia atau telah dihapus.</p>
        <Button onClick={() => navigate('/pembelajar/courses')} variant="outline">
          Kembali ke Katalog
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 pb-20">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Breadcrumb / Back Navigation */}
        <Button
            variant="ghost"
            onClick={() => navigate('/pembelajar/courses')}
            className="mb-8 hover:bg-white/50 dark:hover:bg-zinc-800/50 -ml-2 text-muted-foreground hover:text-foreground"
        >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Katalog
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Main Content (Left Column) */}
            <div className="lg:col-span-8 space-y-10">
                {/* Header Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 flex-wrap">
                        {course.kategori && (
                            <Badge variant="secondary" className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur border-gray-200 dark:border-zinc-700 shadow-sm font-medium">
                                {course.kategori}
                            </Badge>
                        )}
                        {course.tingkat && (
                            <Badge variant="outline" className={`${getTingkatColor(course.tingkat)} bg-opacity-100 border`}>
                                {course.tingkat.charAt(0).toUpperCase() + course.tingkat.slice(1)}
                            </Badge>
                        )}
                    </div>
                    
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.15]">
                        {course.judul}
                    </h1>

                    
                    {course.deskripsi && (
                        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">
                            {course.deskripsi}
                        </p>
                    )}

                    {/* Meta Stats Row */}
                    <div className="flex items-center gap-6 text-sm font-medium text-gray-500 dark:text-gray-400 pt-2 border-b border-gray-100 dark:border-zinc-800 pb-8">
                         <div className="flex items-center gap-2">
                             <User className="h-4 w-4" />
                             <span>{course.instruktur?.nama_lengkap}</span>
                         </div>
                         <div className="flex items-center gap-2">
                             <Clock className="h-4 w-4" />
                             <span>{Math.floor(totalDurasi / 60)}j {totalDurasi % 60}m</span>
                         </div>
                         <div className="flex items-center gap-2">
                             <BookOpen className="h-4 w-4" />
                             <span>{course.modul?.length || 0} Modul</span>
                         </div>
                    </div>
                </div>

                {/* About Course Section */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        Tentang Kursus
                    </h2>
                    <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                        {/* Placeholder for richer description if available, or re-using description */}
                        <p>{course.deskripsi || "Tidak ada deskripsi detail untuk kursus ini."}</p>
                    </div>
                </section>

                {/* Curriculum Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            Kurikulum Kursus
                        </h2>
                        <span className="text-sm text-gray-500 font-medium">
                            {totalMateri} Materi
                        </span>
                    </div>
                    
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                        {course.modul && course.modul.length > 0 ? (
                            <Accordion type="multiple" defaultValue={course.modul.map(m => m.id)} className="w-full">
                                {course.modul
                                    .sort((a, b) => a.urutan - b.urutan)
                                    .map((modul, index) => (
                                    <AccordionItem key={modul.id} value={modul.id} className="border-b last:border-0 border-gray-100 dark:border-zinc-800">
                                        <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:no-underline transition-colors group">
                                            <div className="flex text-left gap-4 items-start w-full">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold text-gray-500 group-hover:bg-white group-hover:text-primary transition-colors border border-transparent group-hover:border-gray-200 dark:group-hover:border-zinc-700">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                                                        {modul.judul}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                        <span>{modul.materi?.length || 0} Materi</span>
                                                        <span>•</span>
                                                        <span>{modul.durasi_menit} Menit</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-0 pb-0 bg-gray-50/50 dark:bg-zinc-900/50">
                                            <div className="divide-y divide-gray-100 dark:divide-zinc-800 border-t border-gray-100 dark:border-zinc-800">
                                                {modul.materi && modul.materi.length > 0 ? (
                                                    modul.materi
                                                        .sort((a, b) => a.urutan - b.urutan)
                                                        .map((materi) => (
                                                        <div key={materi.id} className="flex items-center gap-3 px-6 py-3.5 pl-[4.5rem] hover:bg-gray-100/50 dark:hover:bg-zinc-800/50 transition-colors">
                                                            {materi.tipe === 'video' ? (
                                                                <PlayCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                                            ) : materi.tipe === 'dokumen' ? (
                                                                <FileText className="h-4 w-4 text-orange-500 flex-shrink-0" />
                                                            ) : (
                                                                <BookOpen className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                                            )}
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1 truncate">
                                                                {materi.judul}
                                                            </span>
                                                            {materi.durasi_menit && (
                                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                                    {materi.durasi_menit} m
                                                                </span>
                                                            )}
                                                            {/* User cannot click specific material here unless enrolled, logic handled by main CTA */}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-6 py-4 text-sm text-muted-foreground text-center italic">
                                                        Belum ada materi
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <div className="p-12 text-center">
                                <p className="text-muted-foreground font-medium">Belum ada kurikulum yang tersedia.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Sidebar (Right Column) - Sticky */}
            <div className="lg:col-span-4 space-y-8">
                <div className="sticky top-24 space-y-6">
                    {/* Course Card Preview */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl shadow-gray-200/50 dark:shadow-zinc-950/50 overflow-hidden">
                        {/* Thumbnail */}
                        <div className="aspect-video relative bg-gray-100 dark:bg-zinc-800 group overflow-hidden">
                             {course.url_gambar_mini ? (
                                <img
                                  src={course.url_gambar_mini}
                                  alt={course.judul}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                                  <BookOpen className="h-12 w-12 text-white/80" />
                                </div>
                              )}
                             {/* Play Overlay if video preview existed (future proofing) */}
                             {enrollmentStatus && 'enrolled' in enrollmentStatus && enrollmentStatus.enrolled && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                                    <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-3">
                                        <PlayCircle className="h-8 w-8 text-white fill-white/20" />
                                    </div>
                                </div>
                             )}
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Price / Status */}
                            <div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Gratis
                                    <span className="text-sm font-normal text-muted-foreground ml-2 line-through opacity-50">Rp 0</span>
                                </div>
                                <p className="text-xs text-green-600 font-medium mt-1">Akses selamanya</p>
                            </div>

                            {/* Main CTA */}
                            {enrollmentStatus && 'enrolled' in enrollmentStatus && enrollmentStatus.enrolled ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                                        <CheckCircle className="h-5 w-5 flex-shrink-0" />
                                        <p className="text-sm font-medium leading-tight">Anda sudah terdaftar di kursus ini</p>
                                    </div>
                                    <Button 
                                        className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all" 
                                        onClick={handleContinueLearning}
                                    >
                                        {enrollmentStatus.status === 'selesai' ? 'Tinjau Materi' : 'Lanjutkan Belajar'}
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            ) : (
                                <Button 
                                    className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all" 
                                    onClick={handleEnroll}
                                    disabled={enrollMutation.isPending}
                                >
                                    {enrollMutation.isPending ? 'Memproses...' : 'Daftar Sekarang'}
                                </Button>
                            )}

                            {/* Features List */}
                            <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-zinc-800">
                                <h4 className="font-semibold text-sm">Yang Anda dapatkan:</h4>
                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <li className="flex items-center gap-2">
                                        <PlayCircle className="h-4 w-4 text-gray-400" />
                                        <span>{totalMateri} konten materi video & teks</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-gray-400" />
                                        <span>Akses modul kursus lengkap</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span>Akses selamanya</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Share Button */}
                            <Button variant="outline" className="w-full rounded-xl border-gray-200 dark:border-zinc-800" onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success("Link kursus disalin!");
                            }}>
                                <Share2 className="h-4 w-4 mr-2" />
                                Bagikan Kursus
                            </Button>
                        </div>
                    </div>

                    {/* Instructor Mini Card */}
                    {course.instruktur && (
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider text-muted-foreground">Instruktur</h4>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0 border border-gray-200 dark:border-zinc-700">
                                    {course.instruktur.url_foto ? (
                                        <img
                                            src={course.instruktur.url_foto}
                                            alt={course.instruktur.nama_lengkap}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-6 w-6 text-gray-400 m-3" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 dark:text-white truncate">
                                        {course.instruktur.nama_lengkap}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {course.instruktur.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
