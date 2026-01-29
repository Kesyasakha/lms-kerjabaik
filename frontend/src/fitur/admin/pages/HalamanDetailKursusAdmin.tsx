import { useParams, useNavigate } from "react-router-dom";
import {
  useCourseDetail,
  useAssignInstructor,
  useUpdateCourseVisibility,
  useInstructors,
  useUpdateAdminCourse,
  useDeleteAdminCourse,
} from "../hooks/useAdminCourses";
import { DialogKursusAdmin } from "@/fitur/admin/komponen/DialogKursusAdmin";
import { Button } from "@/komponen/ui/button";
import { Badge } from "@/komponen/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/komponen/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/komponen/ui/select";
import {
  ArrowLeft,
  Users,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  Eye,
  EyeOff,
  Archive,
  Calendar,
  User,
  Pencil,
  Trash2,
  FileText,
  Video,
  HelpCircle,
  Layers,
} from "lucide-react";
import { useState } from "react";
import { formatTanggal, cn } from "@/pustaka/utils";
import { useToast } from "@/komponen/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

// Definisikan tipe untuk status kursus
type CourseStatus = "draft" | "published" | "archived";

const statusColors: Record<CourseStatus, string> = {
  draft: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900/40 dark:text-zinc-400 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900/40",
  published:
    "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
  archived: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50 hover:bg-rose-50 dark:hover:bg-rose-900/20",
};

const statusLabels: Record<CourseStatus, string> = {
  draft: "Draft",
  published: "Terbit",
  archived: "Arsip",
};

export function HalamanDetailKursusAdmin() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<string>("");

  const { data: course, isLoading } = useCourseDetail(id!);
  const { data: instructors } = useInstructors();
  const assignMutation = useAssignInstructor();
  const updateVisibilityMutation = useUpdateCourseVisibility();
  const updateCourseMutation = useUpdateAdminCourse();
  const deleteCourseMutation = useDeleteAdminCourse();

  const handleOpenAssignDialog = () => {
    setSelectedInstructor(course?.id_instruktur || "");
    setAssignDialogOpen(true);
  };

  const handleAssignInstructor = async () => {
    if (!id || !selectedInstructor) return;

    try {
      await assignMutation.mutateAsync({
        id_kursus: id,
        id_instruktur: selectedInstructor,
      });
      setAssignDialogOpen(false);
      toast({
        title: "Instruktur berhasil ditugaskan",
        description: "Instruktur telah ditugaskan ke kursus ini.",
      });
    } catch (error: any) {
      toast({
        title: "Gagal menugaskan instruktur",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const handleToggleVisibility = async () => {
    if (!course) return;
    const newStatus = course.status === "published" ? "draft" : "published";

    try {
      await updateVisibilityMutation.mutateAsync({
        kursusId: course.id,
        status: newStatus,
      });
      toast({
        title: "Status berhasil diubah",
        description: `Kursus sekarang ${statusLabels[newStatus]}.`,
      });
    } catch (error: any) {
      toast({
        title: "Gagal mengubah status",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCourse = async (data: any) => {
    if (!id) return;
    try {
      await updateCourseMutation.mutateAsync({
        kursusId: id,
        data,
      });
      setCourseDialogOpen(false);
      toast({
        title: "Kursus berhasil diupdate",
        description: `Perubahan pada kursus telah disimpan.`,
      });
    } catch (error: any) {
      toast({
        title: "Gagal update kursus",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCourse = async () => {
    if (!id) return;
    try {
      await deleteCourseMutation.mutateAsync(id);
      toast({
        title: "Kursus berhasil dihapus",
        description: "Kursus telah dihapus permanen.",
      });
      navigate("/admin/courses");
    } catch (error: any) {
      toast({
        title: "Gagal menghapus kursus",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const handleArchiveCourse = async () => {
    if (!course) return;

    try {
      await updateVisibilityMutation.mutateAsync({
        kursusId: course.id,
        status: "archived",
      });
      toast({
        title: "Kursus berhasil diarsipkan",
        description: "Kursus telah diarsipkan.",
      });
    } catch (error: any) {
      toast({
        title: "Gagal mengarsipkan kursus",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-9 w-24 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-10 bg-muted rounded w-1/3 animate-pulse" />
          <div className="h-6 bg-muted rounded w-1/2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-dashed">
        <BookOpen className="w-16 h-16 text-muted-foreground/20 mb-4" />
        <h3 className="text-xl font-bold">Kursus tidak ditemukan</h3>
        <p className="text-muted-foreground mt-2">Data kursus yang Anda cari mungkin telah dihapus atau dipindahkan.</p>
        <Button onClick={() => navigate("/admin/courses")} variant="outline" className="mt-6">
          Kembali ke Katalog
        </Button>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Navigation & Actions */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/courses")}
          className="w-fit -ml-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Manajemen Kursus
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCourseDialogOpen(true)} className="rounded-lg shadow-sm">
            <Pencil className="w-4 h-4 mr-2" />
            Ubah Detail
          </Button>
          <Button variant="outline" size="sm" onClick={handleOpenAssignDialog} className="rounded-lg shadow-sm">
            <Users className="w-4 h-4 mr-2" />
            Tugaskan Instruktur
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleVisibility}
            disabled={course.status === "archived"}
            className="rounded-lg shadow-sm"
          >
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
          </Button>
          {course.status !== "archived" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleArchiveCourse}
              className="rounded-lg shadow-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            >
              <Archive className="w-4 h-4 mr-2" />
              Arsipkan
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            className="rounded-lg shadow-sm text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Hapus
          </Button>
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.div variants={item} className="border-b pb-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={cn("px-2.5 py-0.5 font-semibold uppercase tracking-wider text-[9px]", statusColors[course.status as CourseStatus])}>
              {statusLabels[course.status as CourseStatus]}
            </Badge>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              {course.kategori || "Tanpa Kategori"}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {course.judul}
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {course.deskripsi || "Informasi deskripsi kursus belum ditambahkan."}
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-none shadow-sm bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border border-blue-100 dark:border-blue-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-400">
              Total Siswa
            </CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {course.stats.totalEnrollments}
            </div>
            <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70 mt-1 font-medium uppercase">Terdaftar dalam kursus</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background border border-emerald-100 dark:border-emerald-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              Siswa Aktif
            </CardTitle>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {course.stats.activeEnrollments}
            </div>
            <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 mt-1 font-medium uppercase">Sedang menempuh materi</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background border border-purple-100 dark:border-purple-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-400">
              Lulus / Selesai
            </CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {course.stats.completedEnrollments}
            </div>
            <p className="text-[10px] text-purple-600/70 dark:text-purple-400/70 mt-1 font-medium uppercase">Telah menyelesaikan modul</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Insights Section */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <CardHeader className="bg-muted/10 border-b p-6">
              <CardTitle className="text-xl font-bold">Informasi Detail</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Cover Image Banner */}
              <div className="w-full h-64 bg-gray-100 overflow-hidden border-b border-muted/40 relative group">
                <img
                  src={course.url_gambar_mini || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.judul)}&background=random&size=512`}
                  alt={course.judul}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(course.judul)}&background=random&size=512`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-white/90 text-black hover:bg-white border-none backdrop-blur-sm shadow-sm">
                    Cover Image
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-6 border-b md:border-b-0 md:border-r border-muted/40 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-muted rounded-xl">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Instruktur</p>
                      <p className="font-bold text-foreground leading-tight">
                        {course.instruktur?.nama_lengkap || "Belum ada instruktur"}
                      </p>
                      {course.instruktur?.email && (
                        <p className="text-xs text-muted-foreground">
                          {course.instruktur.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-muted rounded-xl">
                      <BookOpen className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kategori</p>
                      <p className="font-bold text-foreground leading-tight">
                        {course.kategori || "Umum / Tanpa Kategori"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-muted rounded-xl">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Dibuat Pada</p>
                      <p className="font-bold text-foreground leading-tight">
                        {formatTanggal(course.created_at)}
                      </p>
                    </div>
                  </div>

                  {course.updated_at && (
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-muted rounded-xl">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Terakhir Diperbarui</p>
                        <p className="font-bold text-foreground leading-tight">
                          {formatTanggal(course.updated_at)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 bg-muted/5 h-fit sticky top-6 overflow-hidden">
            <CardHeader className="p-6 flex flex-row items-center justify-between border-b bg-white dark:bg-card rounded-t-2xl">
              <CardTitle className="text-xl font-bold">Konten Kursus</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                {(course as any).modul && (course as any).modul.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-card">
                    {/* Sort modules manually just in case api sort isn't perfect or generic type issue */}
                    {(course as any).modul.sort((a: any, b: any) => a.urutan - b.urutan).map((modul: any, index: number) => (
                      <div key={modul.id} className="group">
                        <div className="px-6 py-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <div className="space-y-1 flex-1">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{modul.judul}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-1">{modul.deskripsi || "Tidak ada deskripsi"}</p>

                            {/* Materials List */}
                            {modul.materi && modul.materi.length > 0 && (
                              <div className="mt-3 space-y-2 pl-1">
                                {modul.materi.sort((a: any, b: any) => a.urutan - b.urutan).map((materi: any) => (
                                  <div key={materi.id} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    {materi.tipe === 'video' && <Video className="w-3.5 h-3.5 text-rose-500" />}
                                    {materi.tipe === 'artikel' && <FileText className="w-3.5 h-3.5 text-blue-500" />}
                                    {materi.tipe === 'kuis' && <HelpCircle className="w-3.5 h-3.5 text-amber-500" />}
                                    {materi.tipe === 'dokumen' && <Layers className="w-3.5 h-3.5 text-purple-500" />}
                                    <span className="truncate">{materi.judul}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {(!modul.materi || modul.materi.length === 0) && (
                              <p className="text-[10px] text-gray-400 italic mt-2">Belum ada materi</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Belum ada modul yang dibuat.</p>
                    <Button variant="link" size="sm" onClick={() => navigate(`/admin/kursus/${course.id}/modul`)}>
                      Mulai Buat Kurikulum
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Dialogs */}
      <DialogKursusAdmin
        open={courseDialogOpen}
        onOpenChange={(open: boolean) => setCourseDialogOpen(open)}
        onSubmit={handleUpdateCourse}
        isSubmitting={updateCourseMutation.isPending}
        course={course}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kursus Secara Permanen?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data kursus, modul, dan materi secara permanen dari server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCourse} className="bg-red-600 hover:bg-red-700" disabled={deleteCourseMutation.isPending}>
              {deleteCourseMutation.isPending ? "Menghapus..." : "Ya, Hapus Permanen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={assignDialogOpen} onOpenChange={(open: boolean) => setAssignDialogOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tugaskan Instruktur</DialogTitle>
            <DialogDescription>
              Pilih instruktur ahli yang akan bertanggung jawab mengelola kursus ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="instructor" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pilih Instruktur</Label>
              <Select
                value={selectedInstructor}
                onValueChange={setSelectedInstructor}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Pilih instruktur dari daftar..." />
                </SelectTrigger>
                <SelectContent>
                  {instructors?.map((instructor) => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-bold">{instructor.nama_lengkap}</span>
                        <span className="text-[10px] text-muted-foreground">{instructor.email}</span>
                      </div>
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
              {assignMutation.isPending ? "Menyimpan..." : "Tugaskan Sekarang"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
