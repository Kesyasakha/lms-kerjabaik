import { useState } from "react";
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
import { SearchInput } from "@/komponen/ui/SearchInput";
import { SortableTableHeader } from "@/komponen/ui/SortableTableHeader";
import {
  Filter,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
} from "lucide-react";
import { useSubmissions } from "../hooks/useAssessments";
import { useInstructorCourses } from "../hooks/useInstructorCourses";
import { useTableSort } from "@/hooks/useTableSort";
import { useDebounce } from "@/hooks/useDebounce";
import type { SubmissionFilters, Submission } from "../tipe/instructor.types";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { GradingDialog } from "@/fitur/instruktur/komponen/GradingDialog";

export default function AssessmentCenterPage() {
  const [filters, setFilters] = useState<SubmissionFilters>({
    page: 1,
    limit: 20,
  });
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: submissions, isLoading } = useSubmissions(filters);
  const { data: courses } = useInstructorCourses({ limit: 100 });

  // Helper function to get date range based on filter
  const getDateRange = (filter: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
      case "today":
        return {
          date_from: today.toISOString().split('T')[0],
          date_to: undefined,
        };
      case "7days":
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return {
          date_from: sevenDaysAgo.toISOString().split('T')[0],
          date_to: undefined,
        };
      case "30days":
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return {
          date_from: thirtyDaysAgo.toISOString().split('T')[0],
          date_to: undefined,
        };
      case "recent":
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);
        return {
          date_from: threeDaysAgo.toISOString().split('T')[0],
          date_to: undefined,
        };
      default:
        return {
          date_from: undefined,
          date_to: undefined,
        };
    }
  };

  // Handle date filter change
  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    const dateRange = getDateRange(value);
    setFilters((prev) => ({
      ...prev,
      ...dateRange,
      page: 1,
    }));
  };

  // Client-side sorting and filtering
  const filteredSubmissions = (submissions?.data || []).filter((sub) => {
    if (!debouncedSearch) return true;
    const query = debouncedSearch.toLowerCase();
    return (
      sub.student_name.toLowerCase().includes(query) ||
      sub.student_email.toLowerCase().includes(query) ||
      sub.assignment_title.toLowerCase().includes(query)
    );
  });

  const { sortConfig, sortedData, handleSort } = useTableSort(
    filteredSubmissions,
    {
      storageKey: "assessment-center-sort",
      defaultSort: { key: "submitted_at", direction: "asc" },
    },
  );

  const statusColors = {
    pending: "secondary",
    graded: "default",
    rejected: "destructive",
    revision_requested: "outline",
  } as const;

  const statusLabels = {
    pending: "Menunggu",
    graded: "Dinilai",
    rejected: "Ditolak",
    revision_requested: "Revisi",
  };

  const statusIcons = {
    pending: Clock,
    graded: CheckCircle2,
    rejected: XCircle,
    revision_requested: Clock,
  };




  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Pusat Penilaian
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-xs">
            Kelola dan nilai tugas yang dikumpulkan peserta
          </p>
        </div>

        {/* Progress Stats */}
        {submissions && submissions.count > 0 && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Progres</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-[10px] h-5 px-1.5">
                  {submissions.data.filter(s => s.status === "pending").length} Menunggu
                </Badge>
                <span className="text-muted-foreground text-xs">/</span>
                <Badge variant="default" className="font-mono text-[10px] h-5 px-1.5">
                  {submissions.data.filter(s => s.status === "graded").length} Dinilai
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card className="border-border border shadow-sm bg-muted/30">
        <CardContent className="p-3">
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="flex items-center gap-2">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery("")}
                placeholder="Cari peserta, email, atau tugas..."
                className="w-full h-8 text-xs bg-background"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col gap-2 md:flex-row">
              <Select
                value={filters.id_kursus || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    id_kursus: value === "all" ? undefined : value,
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="w-full md:w-[250px] h-8 text-xs bg-background">
                  <Filter className="mr-2 h-3 w-3" />
                  <SelectValue placeholder="Pilih Kursus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">Semua Kursus</SelectItem>
                  {courses?.data.map((course) => (
                    <SelectItem key={course.id} value={course.id} className="text-xs">
                      {course.judul}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: value === "all" ? undefined : (value as any),
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="w-full md:w-[200px] h-8 text-xs bg-background">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">Semua Status</SelectItem>
                  <SelectItem value="pending" className="text-xs">Menunggu</SelectItem>
                  <SelectItem value="graded" className="text-xs">Dinilai</SelectItem>
                  <SelectItem value="rejected" className="text-xs">Ditolak</SelectItem>
                  <SelectItem value="revision_requested" className="text-xs">Revisi</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={dateFilter}
                onValueChange={handleDateFilterChange}
              >
                <SelectTrigger className="w-full md:w-[200px] h-8 text-xs bg-background">
                  <Calendar className="mr-2 h-3 w-3" />
                  <SelectValue placeholder="Waktu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">Semua Waktu</SelectItem>
                  <SelectItem value="recent" className="text-xs">Terbaru (3 hari)</SelectItem>
                  <SelectItem value="today" className="text-xs">Hari Ini</SelectItem>
                  <SelectItem value="7days" className="text-xs">7 Hari Terakhir</SelectItem>
                  <SelectItem value="30days" className="text-xs">30 Hari Terakhir</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card className="border-border border shadow-sm">
        <CardHeader className="p-3 pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold">Data Pengumpulan</CardTitle>
            <div className="flex items-center gap-4">
              {submissions && submissions.count > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  Total: {submissions.count} data
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : sortedData.length > 0 ? (
            <>
              <div className="border-t border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 border-b hover:bg-muted/30 h-8">
                      <SortableTableHeader
                        sortKey="student_name"
                        currentSortKey={sortConfig.key as string}
                        currentDirection={sortConfig.direction}
                        onSort={(key) => handleSort(key as keyof Submission)}
                        className="py-1 px-4 font-semibold text-xs text-foreground h-8"
                      >
                        Peserta
                      </SortableTableHeader>
                      <TableHead className="py-1 px-2 font-semibold text-xs text-foreground h-8">Kursus</TableHead>
                      <TableHead className="py-1 px-2 font-semibold text-xs text-foreground h-8">Tugas</TableHead>
                      <TableHead className="py-1 px-2 font-semibold text-xs text-foreground h-8">Berkas</TableHead>
                      <SortableTableHeader
                        sortKey="submitted_at"
                        currentSortKey={sortConfig.key as string}
                        currentDirection={sortConfig.direction}
                        onSort={(key) => handleSort(key as keyof Submission)}
                        className="py-1 px-2 font-semibold text-xs text-foreground h-8"
                      >
                        Waktu Kirim
                      </SortableTableHeader>
                      <SortableTableHeader
                        sortKey="status"
                        currentSortKey={sortConfig.key as string}
                        currentDirection={sortConfig.direction}
                        onSort={(key) => handleSort(key as keyof Submission)}
                        className="py-1 px-2 font-semibold text-xs text-foreground h-8"
                      >
                        Status
                      </SortableTableHeader>
                      <SortableTableHeader
                        sortKey="grade"
                        currentSortKey={sortConfig.key as string}
                        currentDirection={sortConfig.direction}
                        onSort={(key) => handleSort(key as keyof Submission)}
                        className="py-1 px-2 font-semibold text-xs text-foreground h-8"
                      >
                        Nilai
                      </SortableTableHeader>
                      <TableHead className="py-1 px-4 text-center w-[100px] h-8 font-semibold text-xs text-foreground">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedData.map((submission) => {
                      const StatusIcon = statusIcons[submission.status];
                      return (
                        <TableRow key={submission.id} className="group hover:bg-muted/10 transition-colors border-b last:border-0 h-10">
                          <TableCell className="py-1 px-4">
                            <div>
                              <p className="font-semibold text-xs text-foreground truncate max-w-[150px]">
                                {submission.student_name}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                                {submission.student_email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[150px] py-1 px-2">
                            <p className="truncate text-xs font-medium" title={submission.kursus_judul}>
                              {submission.kursus_judul}
                            </p>
                          </TableCell>
                          <TableCell className="max-w-[150px] py-1 px-2">
                            <p className="truncate text-xs text-muted-foreground" title={submission.assignment_title}>
                              {submission.assignment_title}
                            </p>
                          </TableCell>
                          <TableCell className="py-1 px-2">
                            {submission.url_berkas ? (
                              <a
                                href={submission.url_berkas}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                              >
                                <FileText className="h-3 w-3" />
                                <span>Lihat</span>
                              </a>
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic">
                                -
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="py-1 px-2">
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              {formatDistanceToNow(
                                new Date(submission.submitted_at),
                                {
                                  addSuffix: true,
                                  locale: idLocale,
                                },
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-1 px-2">
                            <Badge variant={statusColors[submission.status]} className="text-[10px] uppercase px-1.5 py-0 h-5 font-bold shadow-none rounded-sm">
                              <StatusIcon className="mr-1 h-2.5 w-2.5" />
                              {statusLabels[submission.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-1 px-2">
                            {submission.grade !== null ? (
                              <span className="font-bold text-xs text-foreground">
                                {submission.grade}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-[10px]">-</span>
                            )}
                          </TableCell>
                          <TableCell className="py-1 px-4 text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-[10px] px-2 font-medium bg-secondary/30 hover:bg-secondary text-secondary-foreground"
                              onClick={() =>
                                setSelectedSubmissionId(submission.id)
                              }
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              Nilai
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {submissions && submissions.totalPages > 1 && (
                <div className="p-2 border-t flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
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
                  <span className="text-xs text-muted-foreground">
                    Hal am {filters.page} / {submissions.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        page: Math.min(
                          submissions?.totalPages || 1,
                          prev.page! + 1,
                        ),
                      }))
                    }
                    disabled={filters.page === submissions.totalPages}
                  >
                    Selanjutnya
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="h-10 w-10 text-muted-foreground/30" />
              <h3 className="mt-2 text-sm font-semibold">
                Tidak ada data pengumpulan
              </h3>
              <p className="text-xs text-muted-foreground">
                {filters.id_kursus || filters.status
                  ? "Coba ubah filter pencarian Anda"
                  : "Belum ada pengumpulan dari peserta"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grading Dialog */}
      {selectedSubmissionId && (
        <GradingDialog
          submissionId={selectedSubmissionId}
          open={!!selectedSubmissionId}
          onOpenChange={(open: boolean) => {
            if (!open) setSelectedSubmissionId(null);
          }}
        />
      )}

      {/* Konfirmasi menggunakan Notiflix */}
    </div>
  );
}
