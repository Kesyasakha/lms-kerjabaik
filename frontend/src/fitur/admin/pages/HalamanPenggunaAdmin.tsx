import { useState } from "react";
import {
  useAdminUsers,
  useCreateAdminUser,
  useUpdateAdminUser,
  useDeleteAdminUser,
} from "../hooks/useAdminUsers";
import { DialogPenggunaAdmin } from "@/fitur/admin/komponen/DialogPenggunaAdmin";
import { Button } from "@/komponen/ui/button";
import { Input } from "@/komponen/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/komponen/ui/select";
import { Search, Plus } from "lucide-react";
import { TabelPenggunaAdmin } from "../komponen/TabelPenggunaAdmin";
import type { AdminUserFilters, AdminUserData } from "../tipe/admin.types";
import type { Database } from "@/shared/tipe/database.types";
import { pemberitahuan } from "@/pustaka/pemberitahuan";

type Pengguna = Database["public"]["Tables"]["pengguna"]["Row"];

export function HalamanPenggunaAdmin() {
  const [filters, setFilters] = useState<AdminUserFilters>({
    page: 1,
    limit: 20,
  });
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Pengguna | null>(null);

  const { data: usersData, isLoading } = useAdminUsers(filters);
  const createUserMutation = useCreateAdminUser();
  const updateUserMutation = useUpdateAdminUser();
  const deleteUserMutation = useDeleteAdminUser();
  // useToast dihapus

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleRoleFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      role: value === "all" ? undefined : value,
      page: 1,
    }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value === "all" ? undefined : value,
      page: 1,
    }));
  };

  const handleCreateUser = async (data: AdminUserData) => {
    try {
      pemberitahuan.tampilkanPemuatan("Menambahkan pengguna...");
      await createUserMutation.mutateAsync(data);
      pemberitahuan.sukses(`Pengguna ${data.nama_lengkap} berhasil ditambahkan.`);
      setUserDialogOpen(false);
    } catch (error: any) {
      pemberitahuan.gagal(error.message || "Gagal membuat pengguna.");
    } finally {
      pemberitahuan.hilangkanPemuatan();
    }
  };

  const handleUpdateUser = async (data: AdminUserData) => {
    if (!editingUser) return;

    try {
      pemberitahuan.tampilkanPemuatan("Memperbarui pengguna...");
      await updateUserMutation.mutateAsync({
        userId: editingUser.id,
        data,
      });
      pemberitahuan.sukses(`Perubahan pada ${data.nama_lengkap} berhasil disimpan.`);
      setUserDialogOpen(false);
      setEditingUser(null);
    } catch (error: any) {
      pemberitahuan.gagal(error.message || "Gagal memperbarui pengguna.");
    } finally {
      pemberitahuan.hilangkanPemuatan();
    }
  };

  const handleSubmitUser = (data: AdminUserData) => {
    if (editingUser) {
      handleUpdateUser(data);
    } else {
      handleCreateUser(data);
    }
  };

  const handleOpenCreateDialog = () => {
    setEditingUser(null);
    setUserDialogOpen(true);
  };

  const handleEditUser = (user: Pengguna) => {
    setEditingUser(user);
    setUserDialogOpen(true);
  };

  const confirmDeleteUser = (user: { id: string; nama: string }) => {
    pemberitahuan.konfirmasi(
      "Konfirmasi Hapus",
      `Apakah Anda yakin ingin menghapus pengguna **${user.nama}** secara permanen?`,
      async () => {
        try {
          pemberitahuan.tampilkanPemuatan("Menghapus pengguna...");
          await deleteUserMutation.mutateAsync(user.id);
          pemberitahuan.sukses("Pengguna berhasil dihapus.");
        } catch (error: any) {
          pemberitahuan.gagal(error.message || "Gagal menghapus pengguna.");
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
          <h1 className="text-xl font-bold tracking-tight text-foreground">Kelola Pengguna</h1>
          <p className="text-muted-foreground text-xs">
            Manajemen data pengguna organisasi Anda, termasuk instruktur dan pembelajar.
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog} size="sm" className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Pengguna
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
                placeholder="Cari nama atau email..."
                className="pl-10 h-10 shadow-none border-muted focus-visible:ring-blue-500"
                value={filters.search || ""}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <Select
              value={filters.role || "all"}
              onValueChange={handleRoleFilter}
            >
              <SelectTrigger className="h-10 shadow-none border-muted">
                <SelectValue placeholder="Semua Peran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Peran</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="instruktur">Instruktur</SelectItem>
                <SelectItem value="pembelajar">Pembelajar</SelectItem>
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
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Non-Aktif</SelectItem>
                <SelectItem value="suspended">Ditangguhkan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats */}
      {usersData && (
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
            Menampilkan <span className="font-bold">{usersData.data.length}</span> dari <span className="font-bold">{usersData.count}</span> pengguna
            {filters.search || filters.role || filters.status
              ? " (hasil filter)"
              : ""}
          </p>
        </div>
      )}

      {/* Table */}
      <TabelPenggunaAdmin
        users={usersData?.data || []}
        isLoading={isLoading}
        onEdit={handleEditUser}
        onDelete={(user) =>
          confirmDeleteUser({ id: user.id, nama: user.nama_lengkap })
        }
      />

      {/* Pagination */}
      {usersData && usersData.totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t mt-2">
          <p className="text-sm text-muted-foreground">
            Halaman <span className="font-bold text-foreground">{usersData.page}</span> dari <span className="font-bold text-foreground">{usersData.totalPages}</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={usersData.page === 1}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))
              }
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={usersData.page === usersData.totalPages}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))
              }
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      {/* User Dialog */}
      <DialogPenggunaAdmin
        open={userDialogOpen}
        onOpenChange={(open: boolean) => {
          setUserDialogOpen(open);
          if (!open) setEditingUser(null);
        }}
        onSubmit={handleSubmitUser}
        isSubmitting={
          createUserMutation.isPending || updateUserMutation.isPending
        }
        user={editingUser}
      />

      {/* Konfirmasi hapus menggunakan Notiflix */}
    </div>
  );
}
