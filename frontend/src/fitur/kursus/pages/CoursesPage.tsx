import { useState, useMemo } from 'react';
import { BookOpen, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/komponen/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/komponen/ui/select';
import { Skeleton } from '@/komponen/ui/skeleton';
import { Badge } from '@/komponen/ui/badge';
import { SearchInput } from '@/komponen/ui/SearchInput';
import { useCatalogCourses, useCourseCategories } from '@/fitur/pembelajar/api/catalogApi';
import { useEnrollments } from '@/fitur/pembelajar/api/learnerApi';
import { useLearnerStore } from '@/fitur/pembelajar/stores/learnerStore';
import { CourseCard } from '@/fitur/pembelajar/komponen/CourseCard';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Course, Enrollment } from '@/fitur/pembelajar/tipe';

export function CoursesPage() {
  const { courseFilters, setCourseFilters, resetFilters } = useLearnerStore();
  const [searchInput, setSearchInput] = useState(courseFilters.search || '');
  const [viewStatus, setViewStatus] = useState<'katalog' | 'aktif' | 'selesai'>('katalog');
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  const { data: catalogData, isLoading: isCatalogLoading } = useCatalogCourses({
    search: viewStatus === 'katalog' ? courseFilters.search : undefined,
    kategori: viewStatus === 'katalog' && courseFilters.kategori ? courseFilters.kategori : undefined,
    tingkat: courseFilters.tingkat as any,
    page: 1,
    limit: 24,
  });

  const { data: enrollments, isLoading: isEnrollmentsLoading } = useEnrollments();
  const { data: categories } = useCourseCategories();

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setCourseFilters({ search: value });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    resetFilters();
    setViewStatus('katalog');
  };

  const filteredEnrollments = useMemo(() => {
    return enrollments?.filter(e => {
      const isStatusMatch = e.status === viewStatus;
      const isSearchMatch = searchInput
        ? e.kursus?.judul.toLowerCase().includes(searchInput.toLowerCase()) ||
        e.kursus?.deskripsi?.toLowerCase().includes(searchInput.toLowerCase())
        : true;
      const isCategoryMatch = courseFilters.kategori && courseFilters.kategori !== 'all'
        ? e.kursus?.kategori === courseFilters.kategori
        : true;
      return isStatusMatch && isSearchMatch && isCategoryMatch;
    }) || [];
  }, [enrollments, viewStatus, searchInput, courseFilters.kategori]);

  // Hitung ID kursus yang sudah diikuti
  const enrolledCourseIds = useMemo(() => {
    if (!enrollments) return new Set<string>();
    return new Set(enrollments.map(e => e.kursus?.id).filter(Boolean) as string[]);
  }, [enrollments]);

  const renderContent = () => {
    const isLoading = viewStatus === 'katalog' ? isCatalogLoading : isEnrollmentsLoading;

    if (isLoading) {
      return (
        <div className={viewType === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" : "space-y-4"}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className={viewType === 'grid' ? "h-72 rounded-xl" : "h-32 rounded-xl w-full"} />
          ))}
        </div>
      );
    }

    if (viewStatus === 'katalog') {
      if (!catalogData || catalogData.courses.length === 0) {
        return <EmptyState onReset={handleResetFilters} />;
      }

      return (
        <motion.div
          layout
          className={viewType === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" : "space-y-4"}
        >
          {catalogData.courses.map((course: Course) => (
            <CatalogCourseCard
              key={course.id}
              course={course}
              viewType={viewType}
              isEnrolled={enrolledCourseIds.has(course.id)}
            />
          ))}
        </motion.div>
      );
    }

    if (filteredEnrollments.length === 0) {
      return (
        <EmptyState
          message={viewStatus === 'aktif' ? 'Belum ada kursus aktif.' : 'Belum ada kursus selesai.'}
          onReset={() => setViewStatus('katalog')}
          buttonText="Jelajahi Katalog"
        />
      );
    }

    return (
      <motion.div
        layout
        className={viewType === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" : "space-y-4"}
      >
        {filteredEnrollments.map((enrollment: Enrollment) => (
          <CourseCard key={enrollment.id} enrollment={enrollment} variant={viewType} />
        ))}
      </motion.div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Compact - Tanpa Ikon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Katalog & Kursus Saya
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Kelola pembelajaran dan temukan materi baru untuk pengembangan diri.
          </p>
        </div>
      </div>

      {/* Modern Tool Bar - Clean White Style */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between bg-white dark:bg-zinc-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex-1 md:max-w-md">
          <SearchInput
            placeholder="Cari kursus..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            onClear={() => handleSearchChange('')}
            className="h-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Select value={viewStatus} onValueChange={(value: any) => setViewStatus(value)}>
            <SelectTrigger className="w-[160px] h-9 border-gray-200 dark:border-gray-800 focus:ring-primary/20">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="katalog">Katalog Kursus</SelectItem>
              <SelectItem value="aktif">Sedang Belajar</SelectItem>
              <SelectItem value="selesai">Selesai</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={courseFilters.kategori || 'all'}
            onValueChange={(value) => setCourseFilters({ kategori: value === 'all' ? null : value })}
          >
            <SelectTrigger className="w-[160px] h-9 border-gray-200 dark:border-gray-800 focus:ring-primary/20">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="h-9 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden md:block" />

          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setViewType('grid')}
              className={`p-1.5 rounded-md transition-all ${viewType === 'grid' ? 'bg-white dark:bg-zinc-950 text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`p-1.5 rounded-md transition-all ${viewType === 'list' ? 'bg-white dark:bg-zinc-950 text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${viewStatus}-${viewType}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function CatalogCourseCard({ course, viewType, isEnrolled }: { course: Course, viewType: 'grid' | 'list', isEnrolled?: boolean }) {
  const isGrid = viewType === 'grid';

  return (
    <Link to={`/pembelajar/kursus/${course.id}`} className="group block">
      <div className={`bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 ${isGrid ? 'flex flex-col h-full' : 'flex gap-5 p-4'}`}>
        <div className={`relative overflow-hidden shrink-0 bg-slate-100 dark:bg-zinc-800 ${isGrid ? 'h-44' : 'w-48 h-32 rounded-xl'}`}>
          {course.url_gambar_mini ? (
            <img src={course.url_gambar_mini} alt={course.judul} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-slate-300 dark:text-zinc-700" />
            </div>
          )}
        </div>

        <div className={`flex-1 flex flex-col ${isGrid ? 'p-5' : 'py-1'}`}>
          <div className="flex items-center gap-1.5 mb-2">
            {course.kategori && <Badge variant="outline" className="text-[9px] font-bold uppercase py-0 px-2 h-5 rounded-sm">{course.kategori}</Badge>}
            {isEnrolled ? (
              <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black uppercase tracking-tighter rounded-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/30 cursor-default">Sudah Daftar</Badge>
            ) : (
              <Badge className="bg-primary/10 text-primary border-0 text-[10px] font-black uppercase tracking-tighter rounded-sm">Katalog</Badge>
            )}
          </div>
          <h3 className={`font-bold text-gray-900 dark:text-zinc-100 leading-tight group-hover:text-primary transition-colors line-clamp-2 ${isGrid ? 'text-base mb-3' : 'text-lg mb-2'}`}>
            {course.judul}
          </h3>
          {!isGrid && course.deskripsi && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{course.deskripsi}</p>
          )}
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {course.instruktur?.url_foto ? (
                  <img src={course.instruktur.url_foto} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-bold text-primary">{course.instruktur?.nama_lengkap.charAt(0)}</span>
                )}
              </div>
              <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">{course.instruktur?.nama_lengkap}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-primary px-3 py-1 bg-primary/5 rounded-lg border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
              Lihat Detail
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ message = "Tidak ada kursus ditemukan", onReset, buttonText = "Reset Filter" }: { message?: string, onReset: () => void, buttonText?: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-gray-300 dark:border-zinc-800 py-20 px-4 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-6">
        <BookOpen size={40} className="text-gray-300 dark:text-zinc-700" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 dark:text-zinc-200 mb-2">{message}</h3>
      <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm mb-8 leading-relaxed">
        Coba sesuaikan filter Anda atau gunakan kata kunci lain untuk menemukan kursus yang sesuai.
      </p>
      <Button onClick={onReset} variant="outline" className="rounded-xl px-8 font-bold text-sm bg-transparent border-gray-200 shadow-none hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800 transition-all active:scale-95">
        {buttonText}
      </Button>
    </div>
  );
}
