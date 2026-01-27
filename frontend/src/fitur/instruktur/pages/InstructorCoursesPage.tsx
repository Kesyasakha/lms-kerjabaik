import { useState } from "react";
import { Card, CardContent } from "@/komponen/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/komponen/ui/table";
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
  Search,
  Filter,
  Calendar,
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Kursus Saya
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            Kelola kursus yang Anda ajarkan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-white/50 backdrop-blur-sm shadow-sm border-gray-200">
            <Calendar className="w-3.5 h-3.5 mr-2 text-primary" />
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
          <div className="rounded-md border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 border-b hover:bg-muted/30">
                  <TableHead className="w-[350px] font-bold text-foreground py-3 px-4">Kursus</TableHead>
                  <TableHead className="font-bold text-foreground py-3">Kategori</TableHead>
                  <TableHead className="font-bold text-foreground py-3 text-center">Status</TableHead>
                  <TableHead className="font-bold text-foreground py-3 text-center">Peserta</TableHead>
                  <TableHead className="font-bold text-foreground py-3 text-center">Tertunda</TableHead>
                  <TableHead className="font-bold text-foreground py-3 text-center">Selesai</TableHead>
                  <TableHead className="font-bold text-foreground py-3 text-center">Rata-rata</TableHead>
                  <TableHead className="font-bold text-foreground py-3 text-right px-4">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((course) => (
                  <TableRow key={course.id} className="group hover:bg-muted/10 transition-colors border-b last:border-0">
                    <TableCell className="py-2.5 px-4">
                      <Link to={`/instruktur/kursus/${course.id}`} className="group-hover:text-primary transition-colors">
                        <div className="flex items-center gap-3">
                          {course.url_gambar_mini ? (
                            <img
                              src={course.url_gambar_mini}
                              alt=""
                              className="h-10 w-16 object-cover rounded-md border border-border/50"
                            />
                          ) : (
                            <div className="h-10 w-16 bg-muted rounded-md border border-border/50 flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-muted-foreground/30" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm truncate max-w-[250px]">{course.judul}</h3>
                            {course.deskripsi && (
                              <p className="text-[10px] text-muted-foreground truncate max-w-[250px]">{course.deskripsi}</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="py-2.5">
                      {course.kategori ? (
                        <Badge variant="outline" className="font-normal text-xs text-muted-foreground">
                          {course.kategori}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5 text-center">
                      <Badge variant={statusColors[course.status]} className="text-[10px] uppercase font-bold px-2 py-0.5 h-auto shadow-none">
                        {statusLabels[course.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1 text-sm font-medium">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        {course.total_peserta || 0}
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 text-center">
                      {(course.pending_submissions || 0) > 0 ? (
                        <Badge variant="secondary" className="font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800">
                          {course.pending_submissions}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5 text-center">
                      <span className="text-sm font-medium text-green-600 dark:text-green-500">
                        {course.completion_rate || 0}%
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 text-center">
                      <span className="text-sm font-bold">
                        {course.avg_score || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 text-right px-4">
                      <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                        <Link to={`/instruktur/kursus/${course.id}`}>
                          <span className="sr-only">Detail</span>
                          <TrendingUp className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
