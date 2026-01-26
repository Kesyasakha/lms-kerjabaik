import { useState } from "react";
import { Card, CardContent } from "@/komponen/ui/card";
import { Button } from "@/komponen/ui/button";
import { Input } from "@/komponen/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/komponen/ui/select";
import { Skeleton } from "@/komponen/ui/skeleton";
import { Badge } from "@/komponen/ui/badge";
import {
  BookOpen,
  Users,
  TrendingUp,
  ClipboardList,
  Search,
  Filter,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useInstructorCourses } from "../hooks/useInstructorCourses";
import type { CourseFilters } from "../tipe/instructor.types";

export default function InstructorCoursesPage() {
  const [filters, setFilters] = useState<CourseFilters>({
    page: 1,
    limit: 12,
  });

  const { data, isLoading } = useInstructorCourses(filters);

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleKategoriChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      kategori: value === "all" ? undefined : value,
      page: 1,
    }));
  };

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value === "all" ? undefined : (value as any),
      page: 1,
    }));
  };

  const statusColors = {
    draft: "secondary",
    published: "default",
    archived: "outline",
  } as const;

  const statusLabels = {
    draft: "Draf",
    published: "Terbit",
    archived: "Diarsipkan",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Kursus Saya
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Kelola kursus yang Anda ajarkan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-white/50 backdrop-blur-sm shadow-sm border-gray-200">
            <Clock className="w-3.5 h-3.5 mr-2 text-primary" />
            {new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl shadow-sm border-muted/60">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari kursus..."
                value={filters.search || ""}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-10 rounded-xl border-muted-foreground/20 focus:border-primary/50 transition-all"
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Select
                value={filters.kategori || "all"}
                onValueChange={handleKategoriChange}
              >
                <SelectTrigger className="w-full md:w-[180px] h-10 rounded-xl border-muted-foreground/20">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  <SelectItem value="programming">Programming</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.status || "all"}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-full md:w-[180px] h-10 rounded-xl border-muted-foreground/20">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.data.map((course) => (
              <Link
                key={course.id}
                to={`/instruktur/kursus/${course.id}`}
                className="group"
              >
                <Card className={`h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-muted/60 hover:border-${course.status === 'published' ? 'green' : course.status === 'draft' ? 'amber' : 'slate'}-500/50`}>
                  {course.url_gambar_mini ? (
                    <div className="aspect-video overflow-hidden bg-muted relative">
                      <img
                        src={course.url_gambar_mini}
                        alt={course.judul}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant={statusColors[course.status]} className="shadow-sm">
                          {statusLabels[course.status]}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-muted relative">
                      <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                      <div className="absolute top-2 right-2">
                        <Badge variant={statusColors[course.status]} className="shadow-sm">
                          {statusLabels[course.status]}
                        </Badge>
                      </div>
                    </div>
                  )}
                  <CardContent className="p-5">
                    <div className="mb-3 space-y-2">
                      {course.kategori && (
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                          {course.kategori}
                        </div>
                      )}
                      <h3 className="font-bold text-lg line-clamp-2 text-gray-900 dark:text-white group-hover:text-primary transition-colors leading-tight">
                        {course.judul}
                      </h3>
                    </div>

                    {course.deskripsi && (
                      <p className="mb-5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {course.deskripsi}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-dashed">
                      <div className="space-y-0.5">
                        <div className="flex items-center text-muted-foreground text-xs font-medium mb-1">
                          <Users className="h-3.5 w-3.5 mr-1.5" />
                          Peserta
                        </div>
                        <p className="font-bold text-lg text-foreground">{course.total_peserta || 0}</p>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center text-muted-foreground text-xs font-medium mb-1">
                          <ClipboardList className="h-3.5 w-3.5 mr-1.5" />
                          Tertunda
                        </div>
                        <p className="font-bold text-lg text-foreground">{course.pending_submissions || 0}</p>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center text-muted-foreground text-xs font-medium mb-1">
                          <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                          Penyelesaian
                        </div>
                        <p className="font-bold text-lg text-foreground">{course.completion_rate || 0}%</p>
                      </div>

                      {course.avg_score !== null && (
                        <div className="space-y-0.5">
                          <div className="flex items-center text-muted-foreground text-xs font-medium mb-1">
                            <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                            Rata-rata
                          </div>
                          <p className="font-bold text-lg text-foreground">{course.avg_score}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page! - 1),
                  }))
                }
                disabled={filters.page === 1}
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-muted-foreground">
                Halaman {filters.page} dari {data.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: Math.min(data.totalPages, prev.page! + 1),
                  }))
                }
                disabled={filters.page === data.totalPages}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">
              Tidak ada kursus ditemukan
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {filters.search || filters.kategori || filters.status
                ? "Coba ubah filter pencarian Anda"
                : "Anda belum ditugaskan ke kursus apapun"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
