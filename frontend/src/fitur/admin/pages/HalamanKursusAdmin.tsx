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
import { Label } from "@/komponen/ui/label";
import { pemberitahuan } from "@/pustaka/pemberitahuan";
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
import {
  AdminCourseFilters,
  KursusWithInstructor,
} from "../tipe/courses.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/komponen/ui/dropdown-menu";

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

  const { data: coursesData, isLoading } = useAdminCourses(filters);
  const { data: instructors } = useInstructors();
  const assignMutation = useAssignInstructor();
  const updateVisibilityMutation = useUpdateCourseVisibility();
  const createCourseMutation = useCreateAdminCourse();
  const updateCourseMutation = useUpdateAdminCourse();
  const deleteMutation = useDeleteAdminCourse();
  // useToast dihapus

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
      pemberitahuan.tampilkanPemuatan("Menambahkan kursus...");
      await createCourseMutation.mutateAsync(data);
      pemberitahuan.sukses(`Kursus "${data.judul}" berhasil ditambahkan.`);
      setCourseDialogOpen(false);
    } catch (error: any) {
      pemberitahuan.gagal(error.message || "Gagal membuat kursus.");
    } finally {
      pemberitahuan.hilangkanPemuatan();
    }
  };

  const handleUpdateCourse = async (data: any) => {
    if (!editingCourse) return;
    try {
      pemberitahuan.tampilkanPemuatan("Memperbarui kursus...");
      await updateCourseMutation.mutateAsync({
        kursusId: editingCourse.id,
        data,
      });
      pemberitahuan.sukses("Perubahan pada kursus berhasil disimpan.");
      setCourseDialogOpen(false);
      setEditingCourse(null);
    } catch (error: any) {
      pemberitahuan.gagal(error.message || "Gagal memperbarui kursus.");
    } finally {
      pemberitahuan.hilangkanPemuatan();
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
      pemberitahuan.tampilkanPemuatan("Menugaskan instruktur...");
      await assignMutation.mutateAsync({
        id_kursus: selectedCourse.id,
        id_instruktur: selectedInstructor,
      });
      pemberitahuan.sukses(`Instruktur berhasil ditugaskan ke kursus "${selectedCourse.judul}".`);
      setAssignDialogOpen(false);
    } catch (error: any) {
      pemberitahuan.gagal(error.message || "Gagal menugaskan instruktur.");
    } finally {
      pemberitahuan.hilangkanPemuatan();
    }
  };

  const handleToggleVisibility = async (course: KursusWithInstructor) => {
    const newStatus = course.status === "published" ? "draft" : "published";

    try {
      pemberitahuan.tampilkanPemuatan("Mengubah status...");
      await updateVisibilityMutation.mutateAsync({
        kursusId: course.id,
        status: newStatus,
      });
      pemberitahuan.sukses(`Status kursus "${course.judul}" sekarang ${statusLabels[newStatus]}.`);
    } catch (error: any) {
      pemberitahuan.gagal(error.message || "Gagal mengubah status.");
    } finally {
      pemberitahuan.hilangkanPemuatan();
    }
  };

  const handleArchiveCourse = async (course: KursusWithInstructor) => {
    try {
      pemberitahuan.tampilkanPemuatan("Mengarsipkan kursus...");
      await updateVisibilityMutation.mutateAsync({
        kursusId: course.id,
        status: "archived",
      });
      pemberitahuan.sukses(`Kursus "${course.judul}" telah diarsipkan.`);
    } catch (error: any) {
      pemberitahuan.gagal(error.message || "Gagal mengarsipkan kursus.");
    } finally {
      pemberitahuan.hilangkanPemuatan();
    }
  };

  const confirmDeleteCourse = (course: KursusWithInstructor) => {
    pemberitahuan.konfirmasi(
      "Konfirmasi Hapus",
      `Apakah Anda yakin ingin menghapus kursus **${course.judul}**? Tindakan ini akan menghapus semua modul dan materi terkait secara permanen.`,
      async () => {
        try {
          pemberitahuan.tampilkanPemuatan("Menghapus kursus...");
          await deleteMutation.mutateAsync(course.id);
          pemberitahuan.sukses("Kursus berhasil dihapus.");
        } catch (error: any) {
          pemberitahuan.gagal(error.message || "Gagal menghapus kursus.");
        } finally {
          pemberitahuan.hilangkanPemuatan();
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Katalog Kursus</h1>
          <p className="text-muted-foreground text-xs">
            Kelola kurikulum, materi pembelajaran, dan penugasan instruktur.
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog} size="sm" className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Buat Kursus Baru
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="h-40 bg-gray-100 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-100 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-50 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-50 rounded w-1/2 animate-pulse" />
                <div className="pt-4 flex gap-2">
                  <div className="h-8 bg-gray-100 rounded-lg w-full animate-pulse" />
                  <div className="h-8 bg-gray-100 rounded-lg w-10 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : coursesData?.data.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900">Belum ada kursus</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Mulai buat kursus pertama Anda untuk membagikan materi pembelajaran.
            </p>
          </div>
          <Button
            onClick={handleOpenCreateDialog}
            className="mt-2 bg-[#7B6CF0] hover:bg-[#6859d0] text-white rounded-xl shadow-lg shadow-blue-100"
          >
            <Plus className="w-4 h-4 mr-2" />
            Buat Kursus
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {coursesData?.data.map((course) => (
            <div
              key={course.id}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col relative"
            >
              {/* Image Cover */}
              <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                <img
                  src={course.url_gambar_mini || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.judul)}&background=random&size=256`}
                  alt={course.judul}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(course.judul)}&background=random&size=256`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`
                    px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md border border-white/20
                    ${course.status === 'published' ? 'bg-emerald-500/90 text-white' :
                      course.status === 'draft' ? 'bg-amber-500/90 text-white' : 'bg-gray-500/90 text-white'}
                  `}>
                    {statusLabels[course.status as keyof typeof statusLabels] || course.status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex-1 space-y-2">
                  {/* Category */}
                  <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 w-fit px-2 py-0.5 rounded-md">
                    {course.kategori || "Umum"}
                  </div>

                  <Link to={`/admin/kursus/${course.id}`} className="block">
                    <h3 className="font-bold text-gray-900 group-hover:text-[#7B6CF0] transition-colors line-clamp-2 text-base leading-snug">
                      {course.judul}
                    </h3>
                  </Link>

                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {course.deskripsi || "Tidak ada deskripsi singkat."}
                  </p>
                </div>

                {/* Stats Row */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1.5" title="Instruktur">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[9px] font-bold">
                      {course.instruktur?.nama_lengkap.charAt(0) || "?"}
                    </div>
                    <span className="font-medium truncate max-w-[80px]">
                      {course.instruktur?.nama_lengkap.split(' ')[0] || "No Instructor"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1" title="Pendaftar">
                      <Users size={12} className="text-gray-400" />
                      <span className="font-semibold">{course.enrollment_count || 0}</span>
                    </div>
                    {course.durasi_menit && (
                      <div className="flex items-center gap-1" title="Durasi">
                        <BookOpen size={12} className="text-gray-400" />
                        <span className="font-semibold">{course.durasi_menit}m</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 rounded-lg text-xs font-semibold bg-gray-50 border-gray-200 text-gray-700 hover:text-[#7B6CF0] hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-none"
                    onClick={() => handleOpenEditDialog(course)}
                  >
                    Edit Info
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg bg-white border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all shadow-none"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px] rounded-xl">
                      <DropdownMenuItem onClick={() => handleOpenAssignDialog(course)} className="cursor-pointer">
                        <Users className="w-4 h-4 mr-2" />
                        Assign Instruktur
                      </DropdownMenuItem>
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
                        className="text-red-600 focus:text-red-600 cursor-pointer bg-red-50/50 hover:bg-red-50 focus:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Hapus Kursus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
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

      {/* Konfirmasi hapus menggunakan Notiflix */}
    </div>
  );
}

