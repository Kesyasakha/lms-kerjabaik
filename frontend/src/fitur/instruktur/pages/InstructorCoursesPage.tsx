import { useState } from "react";
import { Card, CardContent } from "@/komponen/ui/card";
import { Button } from "@/komponen/ui/button";
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
  Star,
  TrendingUp,
  Calendar,
  MoreVertical,
  Plus,
  LayoutGrid,
  List,
} from "lucide-react";
import { Link } from "react-router-dom";
import { SearchInput } from "@/komponen/ui/SearchInput";
import { useInstructorCourses } from "../hooks/useInstructorCourses";
import type { CourseFilters } from "../tipe/instructor.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/komponen/ui/dropdown-menu";
import { motion, AnimatePresence, Variants } from "framer-motion";

export default function InstructorCoursesPage() {
  const [filters, setFilters] = useState<CourseFilters>({
    page: 1,
    limit: 12,
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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

  const statusStyles = {
    draft: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    published: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    archived: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  };

  const statusLabels = {
    draft: "Draf",
    published: "Terbit",
    archived: "Diarsipkan",
  };

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
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Kursus Saya
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Kelola dan pantau kinerja kursus Anda
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-background/50 backdrop-blur-sm border-gray-200 dark:border-gray-800 rounded-lg">
            <Calendar className="w-3.5 h-3.5 mr-2 text-primary" />
            {new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Badge>
          <Button size="sm" className="h-8 gap-1" asChild>
            <Link to="/kursus/new">
              <Plus className="w-4 h-4" />
              Buat Kursus
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Filters Toolbar */}
      <motion.div variants={item} className="flex flex-col gap-4 md:flex-row md:items-center justify-between bg-white dark:bg-zinc-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex-1 md:max-w-md">
          <SearchInput
            placeholder="Cari kursus..."
            value={filters.search || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            onClear={() => handleSearchChange("")}
            className="h-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Select
            value={filters.kategori || "all"}
            onValueChange={handleKategoriChange}
          >
            <SelectTrigger className="w-[160px] h-9 border-gray-200 dark:border-gray-800 focus:ring-primary/20">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              <SelectItem value="programming">Pemrograman</SelectItem>
              <SelectItem value="design">Desain</SelectItem>
              <SelectItem value="business">Bisnis</SelectItem>
              <SelectItem value="marketing">Pemasaran</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.status || "all"}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[160px] h-9 border-gray-200 dark:border-gray-800 focus:ring-primary/20">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="draft">Draf</SelectItem>
              <SelectItem value="published">Terbit</SelectItem>
              <SelectItem value="archived">Diarsipkan</SelectItem>
            </SelectContent>
          </Select>

          <div className="h-9 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden md:block" />

          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "grid"
                ? "bg-white dark:bg-zinc-950 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "list"
                ? "bg-white dark:bg-zinc-950 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Courses Grid/List */}
      {isLoading ? (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className={`${viewMode === 'grid' ? 'h-[320px]' : 'h-[120px]'} w-full rounded-xl`} />
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              <motion.div
                key="grid"
                variants={container}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {data.data.map((course) => (
                  <motion.div key={course.id} variants={item} layout>
                    <Card
                      className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-full bg-white dark:bg-card"
                    >
                      {/* Image & Status */}
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        {course.url_gambar_mini ? (
                          <img
                            src={course.url_gambar_mini}
                            alt={course.judul}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted/50">
                            <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <Badge
                            variant="outline"
                            className={`shadow-sm backdrop-blur-md border px-2 py-0.5 text-[10px] ${statusStyles[course.status]}`}
                          >
                            {statusLabels[course.status]}
                          </Badge>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Content */}
                      <CardContent className="p-4 flex flex-col flex-1">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-[10px] px-2 py-0 rounded-full border-primary/20 text-primary bg-primary/5">
                              {course.kategori || "Umum"}
                            </Badge>
                          </div>

                          <h3 className="font-bold text-base leading-snug line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                            <Link to={`/instruktur/kursus/${course.id}`}>
                              {course.judul}
                            </Link>
                          </h3>

                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {course.deskripsi || "Tidak ada deskripsi"}
                          </p>
                        </div>

                        {/* Stats Divider */}
                        <div className="my-3 border-t border-dashed border-gray-200 dark:border-gray-800" />

                        {/* Footer Stats & Action */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-3 text-[10px] font-medium text-gray-500">
                            <div className="flex items-center gap-1" title="Total Siswa">
                              <Users className="w-3 h-3" />
                              <span>{course.total_peserta || 0}</span>
                            </div>
                            <div className="flex items-center gap-1" title="Rating">
                              <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                              <span>{course.avg_score || 0}</span>
                            </div>
                            <div className="flex items-center gap-1" title="Tingkat Penyelesaian">
                              <TrendingUp className="w-3 h-3 text-emerald-500" />
                              <span>{course.completion_rate || 0}%</span>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-gray-100 dark:hover:bg-gray-800 -mr-2">
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/instruktur/kursus/${course.id}`}>
                                  Dasbor Kursus
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/instruktur/kursus/${course.id}/edit`}>
                                  Edit Konten
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/kursus/${course.id}/edit`}>
                                  Edit Info
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                variants={container}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="flex flex-col gap-3"
              >
                {data.data.map((course) => (
                  <motion.div key={course.id} variants={item} layout>
                    <Card
                      className="group hover:shadow-md transition-all duration-300 border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-card h-full sm:h-36"
                    >
                      <div className="flex flex-col sm:flex-row h-full">
                        {/* Image */}
                        <div className="w-full sm:w-56 aspect-video sm:aspect-auto relative overflow-hidden bg-muted shrink-0">
                          {course.url_gambar_mini ? (
                            <img
                              src={course.url_gambar_mini}
                              alt={course.judul}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted/50">
                              <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4 flex flex-col justify-between">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] px-2 py-0 rounded-full border-primary/20 text-primary bg-primary/5">
                                  {course.kategori || "Umum"}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`border px-2 py-0 text-[10px] ${statusStyles[course.status]}`}
                                >
                                  {statusLabels[course.status]}
                                </Badge>
                              </div>
                              <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                                <Link to={`/instruktur/kursus/${course.id}`}>
                                  {course.judul}
                                </Link>
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 max-w-xl">
                                {course.deskripsi || "Tidak ada deskripsi"}
                              </p>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={`/instruktur/kursus/${course.id}`}>
                                    Dasbor Kursus
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/instruktur/kursus/${course.id}/edit`}>
                                    Edit Konten
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/kursus/${course.id}/edit`}>
                                    Edit Info
                                  </Link>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="flex items-center gap-6 mt-4 pt-3 border-t border-dashed border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-1.5 min-w-[80px]" title="Total Siswa">
                              <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-md text-blue-600 dark:text-blue-400">
                                <Users className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Siswa</span>
                                <span className="text-xs font-bold">{course.total_peserta || 0}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 min-w-[80px]" title="Rating">
                              <div className="p-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-md text-orange-600 dark:text-orange-400">
                                <Star className="w-3.5 h-3.5 fill-orange-600 dark:fill-orange-400" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Rating</span>
                                <span className="text-xs font-bold">{course.avg_score || 0}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 min-w-[80px]" title="Tingkat Penyelesaian">
                              <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-md text-emerald-600 dark:text-emerald-400">
                                <TrendingUp className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Selesai</span>
                                <span className="text-xs font-bold">{course.completion_rate || 0}%</span>
                              </div>
                            </div>

                            <div className="flex-1"></div>

                            <Button size="sm" variant="outline" className="h-8 -translate-y-0.5" asChild>
                              <Link to={`/instruktur/kursus/${course.id}`}>
                                Kelola
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8 pb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page! - 1),
                  }))
                }
                disabled={filters.page === 1}
                className="border-gray-200 dark:border-gray-800"
              >
                Sebelumnya
              </Button>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 px-4">
                Halaman {filters.page} dari {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: Math.min(data.totalPages || 1, prev.page! + 1),
                  }))
                }
                disabled={filters.page === data.totalPages}
                className="border-gray-200 dark:border-gray-800"
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-zinc-950 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
          <div className="p-4 bg-gray-50 dark:bg-zinc-900 rounded-full mb-4">
            <BookOpen className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Tidak ada kursus ditemukan
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            {filters.search || filters.kategori || filters.status
              ? "Tidak dapat menemukan kursus dengan filter tersebut. Coba reset filter pencarian Anda."
              : "Anda belum memiliki kursus yang ditugaskan. Hubungi administrator untuk informasi lebih lanjut."}
          </p>
          {(filters.search || filters.kategori || filters.status) && (
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => setFilters({ page: 1, limit: 12 })}
            >
              Reset Filter
            </Button>
          )}
        </div>
      )
      }
    </motion.div >
  );
}
