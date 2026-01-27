import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/komponen/ui/card";
import { Button } from "@/komponen/ui/button";
import { Input } from "@/komponen/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/komponen/ui/dropdown-menu";
import { Badge } from "@/komponen/ui/badge";
import { Skeleton } from "@/komponen/ui/skeleton";
import {
  Search,
  Filter,
  Eye,
  AlertCircle,
  Mail,
  MessageSquare,
  MoreVertical,
  Users,
  Award,
  AlertTriangle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Progress Peserta
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            Tracking progress dan engagement peserta
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-white/50 backdrop-blur-sm shadow-sm border-gray-200">
            <Calendar className="w-3.5 h-3.5 mr-2 text-primary" />
            {new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Badge>
        </div>
      </div>

      {/* Course Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <Select
              value={selectedCourseId}
              onValueChange={(value) => {
                setSelectedCourseId(value);
                setFilters({ page: 1, limit: 20 }); // Reset filters
              }}
            >
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Pilih Kursus" />
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
              <>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari peserta..."
                    value={filters.search || ""}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select
                  value={filters.status || "all"}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Summary Cards - Phase 1 Improvement */}
      {selectedCourseId && analytics && !isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Rata-rata Kelas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Rata-rata Kelas
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.avg_score.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.avg_score >= 75
                  ? "Performa sangat baik"
                  : analytics.avg_score >= 60
                    ? "Performa cukup baik"
                    : "Perlu perhatian"}
              </p>
            </CardContent>
          </Card>

          {/* At-Risk Students */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Peserta At-Risk
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {atRiskCount}
              </div>
              <p className="text-xs text-muted-foreground">
                {atRiskCount > 0
                  ? "Butuh perhatian segera"
                  : "Semua peserta on track"}
              </p>
            </CardContent>
          </Card>

          {/* Active Students */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Peserta Aktif
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.active_students}
              </div>
              <p className="text-xs text-muted-foreground">
                dari {analytics.total_students} total peserta
              </p>
            </CardContent>
          </Card>

          {/* Completion Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tingkat Penyelesaian
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.completion_rate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.completed_students} peserta selesai
              </p>
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
              Pilih kursus untuk melihat progress peserta
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Progres</TableHead>
                    <TableHead>Modul</TableHead>
                    <TableHead>Nilai Rata-rata</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aktivitas Terakhir</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.data.map((student) => {
                    const severity = getStudentSeverity(
                      student.avg_score,
                      student.last_activity,
                    );
                    const daysSinceActivity = getDaysSinceLastActivity(
                      student.last_activity,
                    );

                    return (
                      <TableRow
                        key={student.id}
                        className={
                          severity === "critical"
                            ? "bg-red-50 dark:bg-red-950/10"
                            : severity === "warning"
                              ? "bg-yellow-50 dark:bg-yellow-950/10"
                              : ""
                        }
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {severity && (
                              <Badge
                                variant={
                                  severity === "critical"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="shrink-0"
                              >
                                <AlertCircle className="mr-1 h-3 w-3" />
                                {severity === "critical"
                                  ? "Critical"
                                  : "Warning"}
                              </Badge>
                            )}
                            <span>{student.student_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {student.student_email}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div
                                className="h-2 rounded-full bg-primary transition-all"
                                style={{
                                  width: `${student.progress_percentage}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {student.progress_percentage}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {student.completed_modules}/{student.total_modules}
                          </span>
                        </TableCell>
                        <TableCell>
                          {student.avg_score !== null ? (
                            <span
                              className={
                                student.avg_score >= 75
                                  ? "font-medium text-green-600"
                                  : student.avg_score >= 60
                                    ? "font-medium text-yellow-600"
                                    : "font-medium text-red-600"
                              }
                            >
                              {student.avg_score}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              student.status === "completed"
                                ? "default"
                                : student.status === "active"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex flex-col">
                            <span
                              className={
                                daysSinceActivity && daysSinceActivity > 14
                                  ? "text-red-600 font-medium"
                                  : daysSinceActivity && daysSinceActivity > 7
                                    ? "text-yellow-600 font-medium"
                                    : "text-muted-foreground"
                              }
                            >
                              {student.last_activity
                                ? formatDistanceToNow(
                                  new Date(student.last_activity),
                                  {
                                    addSuffix: true,
                                    locale: idLocale,
                                  },
                                )
                                : "-"}
                            </span>
                            {daysSinceActivity && daysSinceActivity > 7 && (
                              <span className="text-xs text-muted-foreground">
                                ({daysSinceActivity} hari tidak aktif)
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {/* Quick Actions Menu - Phase 1 Improvement */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  setSelectedStudentId(student.student_id)
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Lihat Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  window.location.href = `mailto:${student.student_email}?subject=Mengenai Progress Kursus&body=Halo ${student.student_name},%0D%0A%0D%0A`;
                                }}
                              >
                                <Mail className="mr-2 h-4 w-4" />
                                Kirim Email
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Kirim Pesan
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
