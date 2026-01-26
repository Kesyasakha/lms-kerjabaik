import { useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { Input } from '@/komponen/ui/input';
import { Button } from '@/komponen/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/komponen/ui/select';
import { Card, CardContent } from '@/komponen/ui/card';
import { Skeleton } from '@/komponen/ui/skeleton';
import { Badge } from '@/komponen/ui/badge';
import { useCatalogCourses, useCourseCategories } from '@/fitur/pembelajar/api/catalogApi';
import { useLearnerStore } from '@/fitur/pembelajar/stores/learnerStore';
import { Link } from 'react-router-dom';
import type { Course } from '@/fitur/pembelajar/tipe';

export function CoursesPage() {
  const { courseFilters, setCourseFilters, resetFilters } = useLearnerStore();
  const [searchInput, setSearchInput] = useState(courseFilters.search || '');

  const { data: catalogData, isLoading } = useCatalogCourses({
    search: courseFilters.search,
    kategori: courseFilters.kategori || undefined,
    tingkat: courseFilters.tingkat as any,
    page: 1,
    limit: 12,
  });

  const { data: categories } = useCourseCategories();

  const handleSearch = () => {
    setCourseFilters({ search: searchInput });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleResetFilters = () => {
    setSearchInput('');
    resetFilters();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Katalog Kursus
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Jelajahi dan daftar kursus pembelajaran
        </p>
      </div>

      {/* Search & Filters */}
      <Card className="rounded-2xl border-border/60 shadow-none">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search */}
            <div className="md:col-span-6 lg:col-span-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari kursus berdasarkan judul atau deskripsi..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-10 rounded-xl border-zinc-200 dark:border-zinc-800"
                />
              </div>
            </div>

            {/* Kategori Filter */}
            <div className="md:col-span-4 lg:col-span-3">
              <Select
                value={courseFilters.kategori || 'all'}
                onValueChange={(value) =>
                  setCourseFilters({ kategori: value === 'all' ? null : value })
                }
              >
                <SelectTrigger className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800">
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories?.map((kategori) => (
                    <SelectItem key={kategori} value={kategori}>
                      {kategori}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reset Button */}
            <div className="md:col-span-2 lg:col-span-1">
              <Button
                onClick={handleResetFilters}
                variant="outline"
                className="w-full rounded-xl h-10 font-bold shrink-0 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200"
                title="Reset Filter"
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {(courseFilters.search || courseFilters.kategori || courseFilters.tingkat) && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">Filter aktif:</span>
              {courseFilters.search && (
                <Badge variant="secondary">
                  Search: {courseFilters.search}
                </Badge>
              )}
              {courseFilters.kategori && (
                <Badge variant="secondary">
                  Kategori: {courseFilters.kategori}
                </Badge>
              )}
              {courseFilters.tingkat && (
                <Badge variant="secondary">
                  Tingkat: {courseFilters.tingkat}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Count */}
      {catalogData && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {catalogData.courses.length} dari {catalogData.total} kursus
          </p>
        </div>
      )}

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      ) : catalogData && catalogData.courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogData.courses.map((course: Course) => (
            <Link key={course.id} to={`/pembelajar/kursus/${course.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                {/* Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                  {course.url_gambar_mini ? (
                    <img
                      src={course.url_gambar_mini}
                      alt={course.judul}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-white/50" />
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  {/* Kategori & Tingkat */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {course.kategori && (
                      <Badge variant="outline" className="text-xs">
                        {course.kategori}
                      </Badge>
                    )}
                    {course.tingkat && (
                      <span className={`text-xs px-2 py-1 rounded-md ${getTingkatColor(course.tingkat)}`}>
                        {course.tingkat.charAt(0).toUpperCase() + course.tingkat.slice(1)}
                      </span>
                    )}
                  </div>

                  {/* Judul */}
                  <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                    {course.judul}
                  </h3>

                  {/* Deskripsi */}
                  {course.deskripsi && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {course.deskripsi}
                    </p>
                  )}

                  {/* Instruktur */}
                  {course.instruktur && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        {course.instruktur.url_foto ? (
                          <img
                            src={course.instruktur.url_foto}
                            alt={course.instruktur.nama_lengkap}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium text-primary">
                            {course.instruktur.nama_lengkap.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span>{course.instruktur.nama_lengkap}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tidak ada kursus ditemukan</h3>
            <p className="text-muted-foreground mb-4">
              Coba ubah filter atau kata kunci pencarian Anda
            </p>
            <Button onClick={handleResetFilters} variant="outline">
              Reset Filter
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
