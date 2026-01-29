import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/komponen/ui/card";
import { Button } from "@/komponen/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/komponen/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/komponen/ui/table";

import { Badge } from "@/komponen/ui/badge";
import { Skeleton } from "@/komponen/ui/skeleton";
import {
  Filter,
  Eye,
  Search,
  Award,
  Clock,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Users,
  Calendar,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/komponen/ui/avatar";
import { SearchInput } from "@/komponen/ui/SearchInput";
import { useInstructorCourses } from "../hooks/useInstructorCourses";
import {
  useEnrolledStudents,
  useCourseAnalytics,
} from "../hooks/useStudentProgress";
import type { StudentFilters } from "../tipe/instructor.types";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { StudentDetailDialog } from "../komponen/StudentDetailDialog";

export default function StudentProgressPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [filters, setFilters] = useState<StudentFilters>({
    page: 1,
    limit: 20,
  });

  const { data: courses } = useInstructorCourses({ limit: 100 });
  const { data: students, isLoading } = useEnrolledStudents(
    selectedCourseId,
    filters,
  );
  const { data: analytics } = useCourseAnalytics(selectedCourseId);

  // Helper function untuk menghitung days since last activity
  const getDaysSinceLastActivity = (lastActivity: string | null) => {
    if (!lastActivity) return null;
    return differenceInDays(new Date(), new Date(lastActivity));
  };

  // Helper function untuk menentukan apakah student at-risk
  const isStudentAtRisk = (
    avgScore: number | null,
    lastActivity: string | null,
  ) => {
    const daysSinceActivity = getDaysSinceLastActivity(lastActivity);
    return (
      (avgScore !== null && avgScore < 60) ||
      (daysSinceActivity !== null && daysSinceActivity > 7)
    );
  };

  // Helper function untuk menentukan severity level
  const getStudentSeverity = (
    avgScore: number | null,
    lastActivity: string | null,
  ): "critical" | "warning" | null => {
    const daysSinceActivity = getDaysSinceLastActivity(lastActivity);
    if (
      (avgScore !== null && avgScore < 50) ||
      (daysSinceActivity !== null && daysSinceActivity > 14)
    ) {
      return "critical";
    }
    if (
      (avgScore !== null && avgScore < 60) ||
      (daysSinceActivity !== null && daysSinceActivity > 7)
    ) {
      return "warning";
    }
    return null;
  };

  // Calculate at-risk students count
  const atRiskCount = useMemo(() => {
    if (!students?.data) return 0;
    return students.data.filter((s) =>
      isStudentAtRisk(s.avg_score, s.last_activity),
    ).length;
  }, [students]);

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value === "all" ? undefined : (value as any),
      page: 1,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Header Modern */}
      {/* Header Modern */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Progres & Analitik Peserta
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Pantau perkembangan dan performa belajar peserta secara real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-background/50 backdrop-blur-sm border-gray-200 dark:border-gray-800 rounded-lg">
            <Calendar className="w-3.5 h-3.5 mr-2 text-primary" />
            {new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Badge>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between bg-white dark:bg-zinc-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <Select
            value={selectedCourseId}
            onValueChange={(value) => {
              setSelectedCourseId(value);
              setFilters({ page: 1, limit: 20 });
            }}
          >
            <SelectTrigger className="w-full md:w-[300px] h-9 border-gray-200 dark:border-gray-800 focus:ring-primary/20 bg-background">
              <SelectValue placeholder="Pilih Kursus untuk Dianalisis" />
            </SelectTrigger>
            <SelectContent>
              {courses?.data.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.judul}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedCourseId && (
            <div className="flex-1 max-w-sm">
              <SearchInput
                placeholder="Cari nama atau email..."
                value={filters.search || ""}
                onChange={(e) => handleSearchChange(e.target.value)}
                onClear={() => handleSearchChange("")}
                className="h-9 bg-background border-gray-200 dark:border-gray-800"
              />
            </div>
          )}
        </div>

        {selectedCourseId && (
          <div className="flex items-center gap-2">
            <Select
              value={filters.status || "all"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-full md:w-[160px] h-9 border-gray-200 dark:border-gray-800 focus:ring-primary/20 text-muted-foreground">
                <Filter className="mr-2 h-3.5 w-3.5" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Dashboard Summary Cards */}
      {selectedCourseId && analytics && !isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden transition-all hover:shadow-md border border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rata-rata Kelas</CardTitle>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                <Award className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {analytics.avg_score.toFixed(1)}
              </div>
              <div className="mt-1 flex items-center text-[10px] font-medium text-muted-foreground uppercase">
                {analytics.avg_score >= 75 ? (
                  <span className="text-emerald-600 flex items-center"><ArrowUpRight className="w-3 h-3 mr-1" />Sangat Baik</span>
                ) : (
                  <span>Perlu ditingkatkan</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden transition-all hover:shadow-md border border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Peserta At-Risk</CardTitle>
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {atRiskCount}
              </div>
              <div className="mt-1 flex items-center text-[10px] font-medium text-muted-foreground uppercase">
                <span className={atRiskCount > 0 ? "text-red-600" : "text-muted-foreground"}>
                  {atRiskCount > 0 ? "Butuh perhatian" : "Aman"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden transition-all hover:shadow-md border border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Peserta Aktif</CardTitle>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                <Users className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {analytics.active_students}
              </div>
              <div className="mt-1 flex items-center text-[10px] font-medium text-muted-foreground uppercase">
                <span>Dari {analytics.total_students} Total</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden transition-all hover:shadow-md border border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Selesai</CardTitle>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {analytics.completion_rate.toFixed(1)}%
              </div>
              <div className="mt-1 flex items-center text-[10px] font-medium text-muted-foreground uppercase">
                <span>{analytics.completed_students} lulu</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Students Table */}
      {!selectedCourseId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Filter className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Pilih Kursus</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Pilih kursus untuk melihat progres peserta
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : students && students.data.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Daftar Peserta</CardTitle>
              <p className="text-sm text-muted-foreground">
                Total: {students.count} peserta
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-[300px]">Peserta</TableHead>
                    <TableHead>Progres Belajar</TableHead>
                    <TableHead>Performa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aktivitas Terakhir</TableHead>
                    <TableHead className="text-center w-[120px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.data.map((student) => {
                    const severity = getStudentSeverity(
                      student.avg_score,
                      student.last_activity,
                    );

                    return (
                      <TableRow
                        key={student.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-border">
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.student_name}`}
                                alt={student.student_name}
                              />
                              <AvatarFallback className="bg-primary/5 text-primary text-xs font-medium">
                                {student.student_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  {student.student_name}
                                </span>
                                {severity === "critical" && (
                                  <Badge
                                    variant="destructive"
                                    className="h-5 px-1.5 text-[10px] uppercase rounded-sm"
                                  >
                                    Risk
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {student.student_email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5 w-[140px]">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{student.completed_modules}/{student.total_modules} Modul</span>
                              <span className="font-medium">{student.progress_percentage}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-500 ease-in-out"
                                style={{
                                  width: `${student.progress_percentage}%`,
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {student.avg_score !== null ? (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={
                                student.avg_score >= 75
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : student.avg_score >= 60
                                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                              }>
                                {student.avg_score}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Belum ada nilai</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              student.status === "completed"
                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                : student.status === "active"
                                  ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                            }
                          >
                            {student.status === "completed"
                              ? "Lulus"
                              : student.status === "active"
                                ? "Aktif"
                                : "Tidak Aktif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {student.last_activity
                                ? formatDistanceToNow(new Date(student.last_activity), {
                                  addSuffix: true,
                                  locale: idLocale,
                                })
                                : "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs font-medium"
                            onClick={() => setSelectedStudentId(student.student_id)}
                          >
                            <Eye className="mr-2 h-3.5 w-3.5" />
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {students.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
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
                  Halaman {filters.page} dari {students.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: Math.min(students.totalPages, prev.page! + 1),
                    }))
                  }
                  disabled={filters.page === students.totalPages}
                >
                  Selanjutnya
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">
              Tidak ada peserta ditemukan
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {filters.search || filters.status
                ? "Coba ubah filter pencarian Anda"
                : "Belum ada peserta terdaftar di kursus ini"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Student Detail Dialog */}
      {selectedStudentId && selectedCourseId && (
        <StudentDetailDialog
          kursusId={selectedCourseId}
          studentId={selectedStudentId}
          open={!!selectedStudentId}
          onOpenChange={(open: boolean) => {
            if (!open) setSelectedStudentId(null);
          }}
        />
      )}
    </div>
  );
}
