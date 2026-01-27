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
  ThumbsUp,
  ThumbsDown,
  FileText,
  Check,
  Square,
  Calendar,
} from "lucide-react";
import { useSubmissions, useGradeSubmission } from "../hooks/useAssessments";
import { useInstructorCourses } from "../hooks/useInstructorCourses";
import { useTableSort } from "@/hooks/useTableSort";
import { useDebounce } from "@/hooks/useDebounce";
import type { SubmissionFilters, Submission } from "../tipe/instructor.types";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { GradingDialog } from "@/fitur/instruktur/komponen/GradingDialog";
import { InlineGradeInput } from "@/fitur/instruktur/komponen/InlineGradeInput";
import { pemberitahuan } from "@/pustaka/pemberitahuan";

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
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: submissions, isLoading } = useSubmissions(filters);
  const { data: courses } = useInstructorCourses({ limit: 100 });
  const gradeSubmissionMutation = useGradeSubmission();

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

  // Quick aksi handlers
  const handleQuickGrade = async (submissionId: string, grade: number) => {
    try {
      pemberitahuan.tampilkanPemuatan("Menyimpan nilai...");
      await gradeSubmissionMutation.mutateAsync({
        submissionId,
        gradeData: {
          grade,
          status: "graded",
        },
      });
      pemberitahuan.sukses(`Nilai ${grade} berhasil disimpan.`);
      setEditingGradeId(null);
    } catch (error) {
      pemberitahuan.gagal("Gagal menyimpan nilai.");
    } finally {
      pemberitahuan.hilangkanPemuatan();
    }
  };

  const handleQuickApprove = async (submission: Submission) => {
    try {
      pemberitahuan.tampilkanPemuatan("Menyetujui submission...");
      await gradeSubmissionMutation.mutateAsync({
        submissionId: submission.id,
        gradeData: {
          grade: submission.assignment_max_score || 100,
          status: "graded",
          feedback: "Approved",
        },
      });
      pemberitahuan.sukses(`Submission dari ${submission.student_name} telah disetujui.`);
    } catch (error) {
      pemberitahuan.gagal("Gagal menyetujui submission.");
    } finally {
      pemberitahuan.hilangkanPemuatan();
    }
  };

  const handleQuickReject = async (submissionId: string) => {
    pemberitahuan.konfirmasi(
      "Reject Submission?",
      "Peserta akan menerima notifikasi bahwa submission mereka ditolak. Anda masih bisa mengubah status ini nanti.",
      async () => {
        try {
          pemberitahuan.tampilkanPemuatan("Menolak submission...");
          await gradeSubmissionMutation.mutateAsync({
            submissionId,
            gradeData: {
              grade: 0,
              status: "rejected",
              feedback: "Rejected",
            },
          });
          pemberitahuan.sukses("Submission telah ditolak.");
        } catch (error) {
          pemberitahuan.gagal("Gagal menolak submission.");
        } finally {
          pemberitahuan.hilangkanPemuatan();
        }
      },
      undefined,
      "Ya, Reject"
    );
  };

  // Bulk selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === sortedData.length && sortedData.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedData.map((s) => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkAction = async (aksi: "approve" | "reject") => {
    if (selectedIds.size === 0) return;

    const ids = Array.from(selectedIds);
    const label = aksi === "approve" ? "menyetujui" : "menolak";

    pemberitahuan.konfirmasi(
      `${aksi === "approve" ? "Approve" : "Reject"} ${ids.length} Submissions?`,
      `Anda akan ${label} **${ids.length}** submission secara massal. Aksi ini tidak dapat dibatalkan.`,
      async () => {
        try {
          pemberitahuan.tampilkanPemuatan(`Sedang ${label} ${ids.length} data...`);
          const status = aksi === "approve" ? "graded" : "rejected";
          const grade = aksi === "approve" ? 100 : 0;
          const feedback = aksi === "approve" ? "Bulk Approved" : "Bulk Rejected";

          await Promise.all(
            ids.map((id) =>
              gradeSubmissionMutation.mutateAsync({
                submissionId: id,
                gradeData: { grade, status, feedback },
              }),
            ),
          );
          pemberitahuan.sukses(`Berhasil ${label} ${ids.length} submission.`);
          setSelectedIds(new Set());
        } catch (error) {
          pemberitahuan.gagal("Gagal melakukan aksi massal.");
        } finally {
          pemberitahuan.hilangkanPemuatan();
        }
      }
    );
  };

  const handleBulkApprove = () => handleBulkAction("approve");
  const handleBulkReject = () => handleBulkAction("reject");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Pusat Penilaian
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            Kelola dan nilai submission dari peserta
          </p>
        </div>

        {/* Progress Stats */}
        {submissions && submissions.count > 0 && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Progress</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="font-mono">
                  {submissions.data.filter(s => s.status === "pending").length} Pending
                </Badge>
                <span className="text-muted-foreground">/</span>
                <Badge variant="default" className="font-mono">
                  {submissions.data.filter(s => s.status === "graded").length} Graded
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
              placeholder="Cari peserta, email, atau assignment..."
              className="w-full"
            />

            {/* Filters Row */}
            <div className="flex flex-col gap-4 md:flex-row">
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
                <SelectTrigger className="w-full md:w-[250px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Pilih Kursus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kursus</SelectItem>
                  {courses?.data.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
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
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="graded">Dinilai</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                  <SelectItem value="revision_requested">Revisi</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={dateFilter}
                onValueChange={handleDateFilterChange}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Waktu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Waktu</SelectItem>
                  <SelectItem value="recent">Terbaru (3 hari)</SelectItem>
                  <SelectItem value="today">Hari Ini</SelectItem>
                  <SelectItem value="7days">7 Hari Terakhir</SelectItem>
                  <SelectItem value="30days">30 Hari Terakhir</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Submissions</CardTitle>
            <div className="flex items-center gap-4">
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedIds.size} selected
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={handleBulkApprove}
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Approve All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleBulkReject}
                  >
                    <ThumbsDown className="mr-2 h-4 w-4" />
                    Reject All
                  </Button>
                </div>
              )}
              {submissions && submissions.count > 0 && (
                <p className="text-sm text-muted-foreground">
                  Total: {submissions.count} submissions
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : sortedData.length > 0 ? (
            <>
              <div className="rounded-md border border-border/60 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 border-b hover:bg-muted/30">
                      <TableHead className="w-12 py-3">
                        <button
                          onClick={toggleSelectAll}
                          className="flex items-center justify-center w-full h-full"
                          aria-label="Select all"
                        >
                          {selectedIds.size === sortedData.length && sortedData.length > 0 ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </TableHead>
                      <SortableTableHeader
                        sortKey="student_name"
                        currentSortKey={sortConfig.key as string}
                        currentDirection={sortConfig.direction}
                        onSort={(key) => handleSort(key as keyof Submission)}
                        className="py-3 font-bold text-foreground"
                      >
                        Peserta
                      </SortableTableHeader>
                      <TableHead className="py-3 font-bold text-foreground">Kursus</TableHead>
                      <TableHead className="py-3 font-bold text-foreground">Assignment</TableHead>
                      <TableHead className="py-3 font-bold text-foreground">File</TableHead>
                      <SortableTableHeader
                        sortKey="submitted_at"
                        currentSortKey={sortConfig.key as string}
                        currentDirection={sortConfig.direction}
                        onSort={(key) => handleSort(key as keyof Submission)}
                        className="py-3 font-bold text-foreground"
                      >
                        Submitted
                      </SortableTableHeader>
                      <SortableTableHeader
                        sortKey="status"
                        currentSortKey={sortConfig.key as string}
                        currentDirection={sortConfig.direction}
                        onSort={(key) => handleSort(key as keyof Submission)}
                        className="py-3 font-bold text-foreground"
                      >
                        Status
                      </SortableTableHeader>
                      <SortableTableHeader
                        sortKey="grade"
                        currentSortKey={sortConfig.key as string}
                        currentDirection={sortConfig.direction}
                        onSort={(key) => handleSort(key as keyof Submission)}
                        className="py-3 font-bold text-foreground"
                      >
                        Nilai
                      </SortableTableHeader>
                      <TableHead className="text-right py-3 font-bold text-foreground px-4">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedData.map((submission) => {
                      const StatusIcon = statusIcons[submission.status];
                      const isEditing = editingGradeId === submission.id;
                      return (
                        <TableRow key={submission.id} className="group hover:bg-muted/10 transition-colors border-b last:border-0">
                          <TableCell className="py-2.5">
                            <button
                              onClick={() => toggleSelect(submission.id)}
                              className="flex items-center justify-center w-full h-full"
                              aria-label={`Select submission from ${submission.student_name}`}
                            >
                              {selectedIds.has(submission.id) ? (
                                <Check className="h-4 w-4 text-primary" />
                              ) : (
                                <Square className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                          </TableCell>
                          <TableCell className="py-2.5">
                            <div>
                              <p className="font-bold text-sm text-foreground">
                                {submission.student_name}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {submission.student_email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[180px] py-2.5">
                            <p className="truncate text-sm font-medium">
                              {submission.kursus_judul}
                            </p>
                          </TableCell>
                          <TableCell className="max-w-[180px] py-2.5">
                            <p className="truncate text-sm text-muted-foreground">
                              {submission.assignment_title}
                            </p>
                          </TableCell>
                          <TableCell className="py-2.5">
                            {submission.url_berkas ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs px-2 bg-muted/50 hover:bg-muted text-primary"
                                asChild
                              >
                                <a
                                  href={submission.url_berkas}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1"
                                >
                                  <FileText className="h-3 w-3" />
                                  View
                                </a>
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">
                                No file
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="py-2.5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              {formatDistanceToNow(
                                new Date(submission.submitted_at),
                                {
                                  addSuffix: true,
                                  locale: idLocale,
                                },
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5">
                            <Badge variant={statusColors[submission.status]} className="text-[10px] uppercase px-2 py-0.5 h-auto font-bold shadow-none">
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {statusLabels[submission.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2.5">
                            {isEditing ? (
                              <InlineGradeInput
                                submissionId={submission.id}
                                currentGrade={submission.grade}
                                maxScore={
                                  submission.assignment_max_score || 100
                                }
                                onSave={handleQuickGrade}
                                onCancel={() => setEditingGradeId(null)}
                              />
                            ) : submission.grade !== null ? (
                              <span className="font-bold text-sm">
                                {submission.grade}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right py-2.5 px-4">
                            <div className="flex items-center justify-end gap-1">
                              {submission.status === "pending" &&
                                !isEditing && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
                                      onClick={() =>
                                        handleQuickApprove(submission)
                                      }
                                      title="Quick Approve (Max Score)"
                                    >
                                      <ThumbsUp className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                                      onClick={() =>
                                        handleQuickReject(submission.id)
                                      }
                                      title="Quick Reject"
                                    >
                                      <ThumbsDown className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 px-2 text-xs font-medium"
                                      onClick={() =>
                                        setEditingGradeId(submission.id)
                                      }
                                      title="Quick Grade"
                                    >
                                      Nilai
                                    </Button>
                                  </>
                                )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
                                onClick={() =>
                                  setSelectedSubmissionId(submission.id)
                                }
                              >
                                <Eye className="mr-1.5 h-3.5 w-3.5" />
                                {submission.status === "pending"
                                  ? "Detail"
                                  : "Detail"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {submissions && submissions.totalPages > 1 && (
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
                    Halaman {filters.page} dari {submissions.totalPages}
                  </span>
                  <Button
                    variant="outline"
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
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock className="h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">
                Tidak ada submission
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {filters.id_kursus || filters.status
                  ? "Coba ubah filter pencarian Anda"
                  : "Belum ada submission dari peserta"}
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
