import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/komponen/ui/dialog";
import { Button } from "@/komponen/ui/button";
import { Input } from "@/komponen/ui/input";
import { Label } from "@/komponen/ui/label";
import { Textarea } from "@/komponen/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/komponen/ui/select";
import type { KursusWithInstructor } from "../tipe/courses.types";
import { useInstructors } from "../hooks/useAdminCourses";
import { uploadCourseImage } from "../api/coursesApi";
import { pemberitahuan } from "@/pustaka/pemberitahuan";

// Predefined categories (same as in AdminCoursesPage)
const courseCategories = [
  { value: "teknologi", label: "Teknologi" },
  { value: "bisnis", label: "Bisnis & Manajemen" },
  { value: "soft-skills", label: "Soft Skills" },
  { value: "bahasa", label: "Bahasa" },
  { value: "kepemimpinan", label: "Kepemimpinan" },
  { value: "teknis", label: "Kompetensi Teknis" },
  { value: "lainnya", label: "Lainnya" },
];

const courseSchema = z.object({
  judul: z.string().min(5, "Judul minimal 5 karakter"),
  deskripsi: z.string().optional(),
  kategori: z.string().min(1, "Kategori harus dipilih"),
  id_instruktur: z.string().optional(),
  status: z.enum(["draft", "published"]),
  enrollment_policy: z
    .enum(["self_enrollment", "admin_approval", "auto_enrollment"])
    .default("self_enrollment"),
  url_gambar_mini: z
    .string()
    .optional()
    .or(z.literal("")),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface DialogKursusAdminProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CourseFormValues) => void;
  isSubmitting?: boolean;
  course?: KursusWithInstructor | null; // If provided, edit mode
}

export function DialogKursusAdmin({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  course,
}: DialogKursusAdminProps) {
  const isEdit = !!course;
  const { data: instructors } = useInstructors();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      judul: "",
      deskripsi: "",
      kategori: "",
      id_instruktur: "none",
      status: "draft",
      enrollment_policy: "self_enrollment",
      url_gambar_mini: "",
    },
  });

  // Watch values for select components
  const watchedKategori = watch("kategori");
  const watchedInstruktur = watch("id_instruktur");
  const watchedStatus = watch("status");
  const watchedEnrollmentPolicy = watch("enrollment_policy");
  const watchedUrlGambar = watch("url_gambar_mini");

  // Reset form when dialog opens/closes or course changes
  useEffect(() => {
    if (open) {
      if (course) {
        reset({
          judul: course.judul,
          deskripsi: course.deskripsi || "",
          kategori: course.kategori || "",
          id_instruktur: course.id_instruktur || "",
          status: (course.status === "archived" ? "draft" : course.status) as
            | "draft"
            | "published",
          enrollment_policy:
            (course as any).enrollment_policy || "self_enrollment",
          url_gambar_mini: course.url_gambar_mini || "",
        });
        setPreviewUrl(course.url_gambar_mini || null);
      } else {
        reset({
          judul: "",
          deskripsi: "",
          kategori: "",
          id_instruktur: "",
          status: "draft",
          enrollment_policy: "self_enrollment",
          url_gambar_mini: "",
        });
        setPreviewUrl(null);
      }
      setSelectedFile(null);
    }
  }, [open, course, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { // 1MB limit
        pemberitahuan.gagal("Ukuran file maksimal 1MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        pemberitahuan.gagal("Hanya file gambar yang diperbolehkan");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onFormSubmit = async (data: CourseFormValues) => {
    try {
      if (selectedFile) {
        setIsUploading(true);
        const url = await uploadCourseImage(selectedFile);
        data.url_gambar_mini = url;
        setIsUploading(false);
      }
      onSubmit(data);
    } catch (error) {
      console.error("Upload failed:", error);
      pemberitahuan.gagal("Gagal mengupload gambar");
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Kursus" : "Tambah Kursus Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Ubah informasi kursus ini."
              : "Buat kursus baru. Anda bisa menambahkan konten modul nanti."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Judul */}
          <div className="space-y-2">
            <Label htmlFor="judul">
              Judul Kursus <span className="text-red-500">*</span>
            </Label>
            <Input
              id="judul"
              {...register("judul")}
              placeholder="Contoh: Dasar Pemrograman Python"
              className="rounded-lg"
            />
            {errors.judul && (
              <p className="text-sm text-red-500">{errors.judul.message}</p>
            )}
          </div>

          {/* Gambar Cover */}
          <div className="space-y-2">
            <Label htmlFor="gambar">Gambar Cover</Label>
            <div className="flex flex-col gap-3">
              <Input
                id="gambar"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />

              {/* Preview */}
              {(previewUrl || watchedUrlGambar) && (
                <div className="relative h-32 w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={previewUrl || watchedUrlGambar || ""}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=Preview&background=random`;
                    }}
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-medium">
                      Mengupload...
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Hidden input to keep registered field logic if needed handling legacy */}
            <input type="hidden" {...register("url_gambar_mini")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Kategori */}
            <div className="space-y-2">
              <Label htmlFor="kategori">
                Kategori <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watchedKategori}
                onValueChange={(val) => setValue("kategori", val)}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {courseCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.kategori && (
                <p className="text-sm text-red-500">{errors.kategori.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status Awal</Label>
              <Select
                value={watchedStatus}
                onValueChange={(val: "draft" | "published") =>
                  setValue("status", val)
                }
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Instruktur (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="instruktur">Instruktur (Opsional)</Label>
            <Select
              value={watchedInstruktur || "none"}
              onValueChange={(val) =>
                setValue("id_instruktur", val === "none" ? "" : val)
              }
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Pilih Instruktur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Belum Ada Instruktur --</SelectItem>
                {instructors?.map((inst) => (
                  <SelectItem key={inst.id} value={inst.id}>
                    {inst.nama_lengkap}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Anda bisa menugaskan instruktur nanti.
            </p>
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              {...register("deskripsi")}
              placeholder="Deskripsi singkat tentang kursus ini..."
              rows={3}
              className="resize-none rounded-lg"
            />
          </div>

          {/* Kebijakan Enrollment */}
          <div className="space-y-2">
            <Label htmlFor="enrollment_policy">
              Kebijakan Enrollment <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watchedEnrollmentPolicy}
              onValueChange={(
                val: "self_enrollment" | "admin_approval" | "auto_enrollment",
              ) => setValue("enrollment_policy", val)}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="self_enrollment">
                  Pendaftaran Mandiri
                </SelectItem>
                <SelectItem value="admin_approval">
                  Persetujuan Admin
                </SelectItem>
                <SelectItem value="auto_enrollment">
                  Auto-enrollment (Tenant)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {watchedEnrollmentPolicy === "self_enrollment" &&
                "Peserta dapat mendaftar sendiri ke kursus ini"}
              {watchedEnrollmentPolicy === "admin_approval" &&
                "Pendaftaran memerlukan persetujuan admin"}
              {watchedEnrollmentPolicy === "auto_enrollment" &&
                "Semua user di tenant otomatis terdaftar"}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isUploading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting || isUploading
                ? "Menyimpan..."
                : isEdit
                  ? "Simpan Perubahan"
                  : "Buat Kursus"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
