import { useEffect, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/komponen/ui/select";
import { useTenants } from "../hooks/useTenants";
import type { PenggunaWithTenant } from "../api/usersApi";
import {
  User,
  Sms,
  Key,
  Hierarchy,
  Building,
  Status,
  CloseCircle,
  TickCircle,
  Building4
} from "iconsax-react";
import { cn } from "@/pustaka/utils";

// Base types for form values
interface UserFormValues {
  nama_lengkap: string;
  email: string;
  password?: string;
  role: "admin" | "instruktur" | "pembelajar";
  id_lembaga: string;
  status?: "aktif" | "nonaktif" | "suspended";
}

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormValues) => void;
  isSubmitting?: boolean;
  user?: PenggunaWithTenant | null;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  user,
}: CreateUserDialogProps) {
  const { data: tenantsData } = useTenants({ limit: 100 });
  const isEditMode = !!user;

  // Dynamic schema based on edit mode
  const schema = useMemo(() => {
    return z.object({
      nama_lengkap: z.string().min(3, "Nama minimal 3 karakter"),
      email: z.string().email("Email tidak valid"),
      password: isEditMode
        ? z
          .string()
          .optional()
          .refine(
            (val) => !val || val.length === 0 || val.length >= 6,
            "Password minimal 6 karakter jika diisi",
          )
        : z.string().min(6, "Password minimal 6 karakter"),
      role: z.enum(["admin", "instruktur", "pembelajar"]),
      id_lembaga: z.string().min(1, "Tenant harus dipilih"),
      status: z.enum(["aktif", "nonaktif", "suspended"]).optional(),
    });
  }, [isEditMode]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nama_lengkap: "",
      email: "",
      password: "",
      role: "admin",
      id_lembaga: "",
      status: "aktif",
    },
  });

  // Reset form when dialog closes or user changes
  useEffect(() => {
    if (open && user) {
      reset({
        nama_lengkap: user.nama_lengkap,
        email: user.email,
        password: "",
        role: user.role as any,
        id_lembaga: user.id_lembaga,
        status: user.status as any,
      });
    } else if (!open) {
      reset({
        nama_lengkap: "",
        email: "",
        password: "",
        role: "admin",
        id_lembaga: "",
        status: "aktif",
      });
    }
  }, [open, user, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-0 rounded-2xl shadow-2xl gap-0">
        <DialogHeader className="p-6 bg-violet-50/50 border-b border-violet-100 flex flex-row items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-violet-500 flex items-center justify-center text-white shadow-lg shadow-violet-200 shrink-0">
            <User size={20} variant="Bold" />
          </div>
          <div className="text-left">
            <DialogTitle className="text-lg font-bold text-gray-800">
              {isEditMode ? "Ubah Profil Pengguna" : "Daftarkan Pengguna Baru"}
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-xs mt-0.5">
              {isEditMode
                ? "Sesuaikan informasi identitas dan hak akses pengguna."
                : "Lengkapi formulir untuk menambahkan akun ke sistem."}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
            {/* Nama Lengkap */}
            <div className="space-y-2">
              <Label htmlFor="nama_lengkap" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                Nama Lengkap
              </Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors">
                  <User size={16} />
                </div>
                <Input
                  id="nama_lengkap"
                  {...register("nama_lengkap")}
                  placeholder="Bambang Pamungkas"
                  className="pl-9 h-10 bg-gray-50 border-transparent focus:bg-white focus:border-violet-200 rounded-xl transition-all font-medium text-sm"
                />
              </div>
              {errors.nama_lengkap && (
                <p className="text-[10px] font-bold text-red-500 ml-1">{errors.nama_lengkap.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                Alamat Email
              </Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors">
                  <Sms size={16} />
                </div>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="bambang@kerjabaik.ai"
                  className="pl-9 h-10 bg-gray-50 border-transparent focus:bg-white focus:border-violet-200 rounded-xl transition-all font-medium text-sm"
                />
              </div>
              {errors.email && (
                <p className="text-[10px] font-bold text-red-500 ml-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                Kata Sandi
              </Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors">
                  <Key size={16} />
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder={isEditMode ? "Kosongkan jika tidak diubah" : "Paling sedikit 6 karakter"}
                  className="pl-9 h-10 bg-gray-50 border-transparent focus:bg-white focus:border-violet-200 rounded-xl transition-all font-medium text-sm"
                />
              </div>
              {errors.password && (
                <p className="text-[10px] font-bold text-red-500 ml-1">{errors.password.message}</p>
              )}
            </div>

            {/* Tenant Selection */}
            <div className="space-y-2">
              <Label htmlFor="id_lembaga" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                Tenant / Organisasi
              </Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-gray-400 group-focus-within:text-violet-500 transition-colors">
                  <Building size={16} />
                </div>
                <Select
                  value={watch("id_lembaga")}
                  onValueChange={(value) => setValue("id_lembaga", value, { shouldValidate: true })}
                >
                  <SelectTrigger className="pl-9 h-10 bg-gray-50 border-transparent focus:bg-white focus:border-violet-200 rounded-xl transition-all font-medium text-sm">
                    <SelectValue placeholder="Pilih Organisasi" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-100">
                    {tenantsData?.data.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id} className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <Building4 size={14} className="text-gray-400" />
                          {tenant.nama}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.id_lembaga && (
                <p className="text-[10px] font-bold text-red-500 ml-1">{errors.id_lembaga.message}</p>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                Peran Pengguna
              </Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-gray-400 group-focus-within:text-violet-500 transition-colors">
                  <Hierarchy size={16} />
                </div>
                <Select
                  value={watch("role")}
                  onValueChange={(value: any) => setValue("role", value, { shouldValidate: true })}
                >
                  <SelectTrigger className="pl-9 h-10 bg-gray-50 border-transparent focus:bg-white focus:border-violet-200 rounded-xl transition-all font-medium text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-100">
                    {isEditMode ? (
                      <>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="instruktur">Instruktur</SelectItem>
                        <SelectItem value="pembelajar">Pembelajar</SelectItem>
                      </>
                    ) : (
                      <SelectItem value="admin">Admin</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {!isEditMode && (
                <p className="text-[9px] text-[#7B6CF0] font-bold mt-1 ml-1 leading-tight">
                  <TickCircle size={10} variant="Bold" className="inline mr-1" />
                  Superadmin dikonfigurasi untuk mendaftarkan akun sebagai Admin Tenant.
                </p>
              )}
            </div>

            {/* Status (Visible only in edit mode) */}
            {isEditMode && (
              <div className="space-y-2">
                <Label htmlFor="status" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                  Status Akun
                </Label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-gray-400 group-focus-within:text-violet-500 transition-colors">
                    <Status size={16} />
                  </div>
                  <Select
                    value={watch("status")}
                    onValueChange={(value: any) => setValue("status", value)}
                  >
                    <SelectTrigger className="pl-9 h-10 bg-gray-50 border-transparent focus:bg-white focus:border-violet-200 rounded-xl transition-all font-medium text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-100">
                      <SelectItem value="aktif">Aktif</SelectItem>
                      <SelectItem value="nonaktif">Non-Aktif</SelectItem>
                      <SelectItem value="suspended">Ditangguhkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-3 border-t border-gray-50 mt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors bg-gray-50 hover:bg-gray-100 rounded-xl"
            >
              <CloseCircle size={16} />
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 active:scale-95 transition-all rounded-xl shadow-lg shadow-violet-100 disabled:opacity-50"
            >
              <TickCircle size={16} variant="Bold" />
              {isSubmitting ? "Memproses..." : isEditMode ? "Simpan Perubahan" : "Daftarkan Pengguna"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
