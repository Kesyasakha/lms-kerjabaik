import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useAdminCourses,
  useAssignInstructor,
  useUpdateCourseVisibility,
  useInstructors,
  useCreateAdminCourse,
  useUpdateAdminCourse,
  useDeleteAdminCourse,
} from "../hooks/useAdminCourses";
import { DialogKursusAdmin } from "@/fitur/admin/komponen/DialogKursusAdmin";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/komponen/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/komponen/ui/alert-dialog";
import { Label } from "@/komponen/ui/label";
import { Badge } from "@/komponen/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/komponen/ui/card";
import {
  Search,
  Users,
  Eye,
  EyeOff,
  Archive,
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
  BookOpen,
} from "lucide-react";
import type {
  AdminCourseFilters,
  KursusWithInstructor,
} from "../tipe/courses.types";
import { useToast } from "@/komponen/ui/use-toast";
import { cn, getInitials } from "@/pustaka/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/komponen/ui/dropdown-menu";

const statusColors = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
  published:
    "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50",
  archived: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50",
};

const statusLabels = {
  draft: "Draft",
  published: "Terbit",
  archived: "Arsip",
};

// Predefined course categories
const courseCategories = [
  { value: "teknologi", label: "Teknologi" },
  { value: "bisnis", label: "Bisnis & Manajemen" },
  { value: "soft-skills", label: "Soft Skills" },
  { value: "bahasa", label: "Bahasa" },
  { value: "kepemimpinan", label: "Kepemimpinan" },
  { value: "teknis", label: "Kompetensi Teknis" },
  { value: "lainnya", label: "Lainnya" },
];

export function HalamanKursusAdmin() {
  const [filters, setFilters] = useState<AdminCourseFilters>({
    page: 1,
    limit: 12,
  });
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] =
    useState<KursusWithInstructor | null>(null);

  const [selectedCourse, setSelectedCourse] =
    useState<KursusWithInstructor | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<string>("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] =
    useState<KursusWithInstructor | null>(null);

  const { data: coursesData, isLoading } = useAdminCourses(filters);
  const { data: instructors } = useInstructors();
  const assignMutation = useAssignInstructor();
  const updateVisibilityMutation = useUpdateCourseVisibility();
  const createCourseMutation = useCreateAdminCourse();
  const updateCourseMutation = useUpdateAdminCourse();
  const deleteMutation = useDeleteAdminCourse();
  const { toast } = useToast();

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value === "all" ? undefined : (value as any),
      page: 1,
    }));
  };

  const handleKategoriFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      kategori: value === "all" ? undefined : value,
      page: 1,
    }));
  };

  // CRUD Course Logic
  const handleOpenCreateDialog = () => {
    setEditingCourse(null);
    setCourseDialogOpen(true);
  };

  const handleOpenEditDialog = (course: KursusWithInstructor) => {
    setEditingCourse(course);
    setCourseDialogOpen(true);
  };

  const handleCreateCourse = async (data: any) => {
    try {
      await createCourseMutation.mutateAsync(data);
      setCourseDialogOpen(false);
      toast({
        title: "Kursus berhasil dibuat",
        description: `Kursus "${data.judul}" telah ditambahkan.`,
      });
    } catch (error: any) {
      toast({
        title: "Gagal membuat kursus",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCourse = async (data: any) => {
    if (!editingCourse) return;
    try {
      await updateCourseMutation.mutateAsync({
        kursusId: editingCourse.id,
        data,
      });
      setCourseDialogOpen(false);
      setEditingCourse(null);
      toast({
        title: "Kursus berhasil diupdate",
        description: `Perubahan pada kursus tersebut telah disimpan.`,
      });
    } catch (error: any) {
      toast({
        title: "Gagal update kursus",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const handleSubmitCourse = (data: any) => {
    if (editingCourse) {
      handleUpdateCourse(data);
    } else {
      handleCreateCourse(data);
    }
  };

  const handleOpenAssignDialog = (course: KursusWithInstructor) => {
    setSelectedCourse(course);
    setSelectedInstructor(course.id_instruktur || "");
    setAssignDialogOpen(true);
  };

  const handleAssignInstructor = async () => {
    if (!selectedCourse || !selectedInstructor) return;

    try {
      await assignMutation.mutateAsync({
        id_kursus: selectedCourse.id,
        id_instruktur: selectedInstructor,
      });
      setAssignDialogOpen(false);
      toast({
        title: "Instruktur berhasil ditugaskan",
        description: `Instruktur telah ditugaskan ke kursus "${selectedCourse.judul}".`,
      });
    } catch (error: any) {
      toast({
        title: "Gagal menugaskan instruktur",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const handleToggleVisibility = async (course: KursusWithInstructor) => {
    const newStatus = course.status === "published" ? "draft" : "published";

    try {
      await updateVisibilityMutation.mutateAsync({
        kursusId: course.id,
        status: newStatus,
      });
      toast({
        title: "Status berhasil diubah",
        description: `Kursus "${course.judul}" sekarang ${statusLabels[newStatus]}.`,
      });
    } catch (error: any) {
      toast({
        title: "Gagal mengubah status",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const handleArchiveCourse = async (course: KursusWithInstructor) => {
    try {
      await updateVisibilityMutation.mutateAsync({
        kursusId: course.id,
        status: "archived",
      });
      toast({
        title: "Kursus berhasil diarsipkan",
        description: `Kursus "${course.judul}" telah diarsipkan.`,
      });
    } catch (error: any) {
      toast({
        title: "Gagal mengarsipkan kursus",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      await deleteMutation.mutateAsync(courseToDelete.id);
      setDeleteConfirmOpen(false);
      setCourseToDelete(null);
      toast({
        title: "Kursus berhasil dihapus",
        description: `Kursus "${courseToDelete.judul}" telah dihapus dari sistem.`,
      });
    } catch (error: any) {
      toast({
        title: "Gagal menghapus kursus",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteCourse = (course: KursusWithInstructor) => {
    setCourseToDelete(course);
    setDeleteConfirmOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manajemen Kursus
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Kelola kurikulum, instruktur, dan ketersediaan pelatihan
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog} className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kursus Baru
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari judul kursus..."
                className="pl-10 h-10 shadow-none border-muted focus-visible:ring-blue-500"
                value={filters.search || ""}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>

          {/* Kategori Filter */}
          <div>
            <Select
              value={filters.kategori || "all"}
              onValueChange={handleKategoriFilter}
            >
              <SelectTrigger className="h-10 shadow-none border-muted">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {courseCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <Select
              value={filters.status || "all"}
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className="h-10 shadow-none border-muted">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Terbit</SelectItem>
                <SelectItem value="archived">Arsip</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats Info */}
      {coursesData && (
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
            Menampilkan <span className="font-bold">{coursesData.data.length}</span> dari <span className="font-bold">{coursesData.count}</span> kursus
            {filters.search || filters.status ? " (hasil filter)" : ""}
          </p>
        </div>
      )}

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="shadow-sm border-muted animate-pulse">
              <CardHeader className="space-y-3">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardContent>
              <CardFooter>
                <div className="h-9 bg-muted rounded w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : coursesData?.data.length === 0 ? (
        <div className="p-20 text-center bg-card rounded-xl border border-dashed flex flex-col items-center gap-4">
          <BookOpen className="w-16 h-16 text-muted-foreground/20" />
          <div className="space-y-1">
            <p className="text-lg font-bold text-foreground">Tidak ada kursus ditemukan</p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Cobalah sesuaikan kata kunci atau filter pencarian Anda, atau buat kursus baru sekarang.
            </p>
          </div>
          <Button
            variant="outline"
            className="mt-2"
            onClick={handleOpenCreateDialog}
          >
            <Plus className="w-4 h-4 mr-2" />
            Buat Kursus Pertama
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesData?.data.map((course) => (
            <Card key={course.id} className="group hover:shadow-md transition-all duration-300 border-muted-foreground/10 overflow-hidden flex flex-col">
              <CardHeader className="pb-3 flex-1">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Badge className={cn("font-semibold text-[10px] px-2 py-0 uppercase tracking-wider", statusColors[course.status])}>
                    {statusLabels[course.status]}
                  </Badge>
                  {course.kategori && (
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {course.kategori}
                    </span>
                  )}
                </div>
                <Link to={`/admin/kursus/${course.id}`} className="block">
                  <h3 className="font-bold text-lg leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                    {course.judul}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-3">
                  {course.deskripsi || "Tidak ada deskripsi yang tersedia untuk kursus ini."}
                </p>
              </CardHeader>
              <CardContent className="py-0">
                <div className="pt-4 border-t border-muted/50 space-y-3 pb-4">
                  <div className="flex items-center gap-2.5 text-sm text-foreground/80">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                      {getInitials(course.instruktur?.nama_lengkap || "A")}
                    </div>
                    <span className="truncate">
                      {course.instruktur?.nama_lengkap || "Belum ada instruktur"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span><span className="font-bold text-foreground">{(course as any).enrollment_count || 0}</span> Siswa Terdaftar</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-zinc-50/50 dark:bg-zinc-900/30 p-3 flex gap-2 border-t border-muted/50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-9 rounded-lg font-bold text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                  onClick={() => handleOpenEditDialog(course)}
                >
                  <Pencil className="w-3.5 h-3.5 mr-1.5" />
                  Ubah
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-9 rounded-lg font-bold text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                  onClick={() => handleOpenAssignDialog(course)}
                >
                  <Users className="w-3.5 h-3.5 mr-1.5" />
                  Tugaskan
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 shrink-0"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[180px]">
                    <DropdownMenuItem onClick={() => handleToggleVisibility(course)} disabled={course.status === "archived"} className="cursor-pointer">
                      {course.status === "published" ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2 text-amber-600" />
                          Batal Terbit
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2 text-blue-600" />
                          Terbitkan
                        </>
                      )}
                    </DropdownMenuItem>
                    {course.status !== "archived" && (
                      <DropdownMenuItem
                        onClick={() => handleArchiveCourse(course)}
                        className="text-amber-600 cursor-pointer"
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        Arsipkan
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => confirmDeleteCourse(course)}
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Hapus Kursus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {coursesData && coursesData.totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t mt-6">
          <p className="text-sm text-muted-foreground">
            Halaman <span className="font-bold text-foreground">{coursesData.page}</span> dari <span className="font-bold text-foreground">{coursesData.totalPages}</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={coursesData.page === 1}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))
              }
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={coursesData.page === coursesData.totalPages}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))
              }
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Course Dialog */}
      <DialogKursusAdmin
        open={courseDialogOpen}
        onOpenChange={(open: boolean) => {
          setCourseDialogOpen(open);
          if (!open) setEditingCourse(null);
        }}
        onSubmit={handleSubmitCourse}
        isSubmitting={
          createCourseMutation.isPending || updateCourseMutation.isPending
        }
        course={editingCourse}
      />

      {/* Assign Instructor Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={(open: boolean) => setAssignDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Instruktur</DialogTitle>
            <DialogDescription>
              Tugaskan instruktur untuk kursus "{selectedCourse?.judul}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instructor">Pilih Instruktur</Label>
              <Select
                value={selectedInstructor}
                onValueChange={setSelectedInstructor}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih instruktur..." />
                </SelectTrigger>
                <SelectContent>
                  {instructors?.map((instructor) => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                      {instructor.nama_lengkap} ({instructor.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleAssignInstructor}
              disabled={!selectedInstructor || assignMutation.isPending}
            >
              {assignMutation.isPending ? "Menyimpan..." : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={(open: boolean) => setDeleteConfirmOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus kursus{" "}
              <span className="font-bold text-foreground">{courseToDelete?.judul}</span> secara
              permanen dari sistem, termasuk semua modul, materi, dan data yang terkait.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

