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
      // Edit mode: populate form with user data
      reset({
        nama_lengkap: user.nama_lengkap,
        email: user.email,
        password: "", // Don't populate password
        role: user.role as any,
        id_lembaga: user.id_lembaga,
        status: user.status as any,
      });
    } else if (!open) {
      // Reset pada saat dialog ditutup
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

  const handleFormSubmit = (data: UserFormValues) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Pengguna" : "Tambah Pengguna Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Ubah informasi pengguna"
              : "Buat pengguna baru untuk tenant tertentu"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Nama Lengkap */}
          <div className="space-y-2">
            <Label htmlFor="nama_lengkap">
              Nama Lengkap <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nama_lengkap"
              {...register("nama_lengkap")}
              placeholder="John Doe"
            />
            {errors.nama_lengkap && (
              <p className="text-sm text-red-500">
                {errors.nama_lengkap.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Password{" "}
              {isEditMode ? (
                <span className="text-gray-500 font-normal">(Opsional)</span>
              ) : (
                <span className="text-red-500">*</span>
              )}
            </Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder={
                isEditMode
                  ? "Kosongkan jika tidak diubah"
                  : "Minimal 6 karakter"
              }
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Tenant */}
          <div className="space-y-2">
            <Label htmlFor="id_lembaga">
              Tenant <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch("id_lembaga")}
              onValueChange={(value) => setValue("id_lembaga", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Tenant" />
              </SelectTrigger>
              <SelectContent>
                {tenantsData?.data.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.id_lembaga && (
              <p className="text-sm text-red-500">{errors.id_lembaga.message}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">
              Peran <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch("role")}
              onValueChange={(value: any) => setValue("role", value)}
              disabled={!isEditMode}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="instruktur">Instruktur</SelectItem>
                <SelectItem value="pembelajar">Pembelajar</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
            {!isEditMode && (
              <p className="text-[10px] text-muted-foreground">
                Pengguna baru yang dibuat melalui panel Superadmin otomatis diberikan akses Admin.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Menyimpan..."
                : isEditMode
                  ? "Simpan Perubahan"
                  : "Tambah Pengguna"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
