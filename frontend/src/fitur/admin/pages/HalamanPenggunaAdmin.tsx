import { useState } from "react";
import {
  useAdminUsers,
  useAdminUserStats,
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
import { SearchNormal1, Add, Profile2User, UserTick, UserRemove } from "iconsax-react";
import { StatCard } from "@/fitur/superadmin/komponen/dashboard/StatCard";
import { TabelPenggunaAdmin } from "../komponen/TabelPenggunaAdmin";
import type { AdminUserFilters, AdminUserData } from "../tipe/admin.types";
import type { Database } from "@/shared/tipe/database.types";
import { pemberitahuan } from "@/pustaka/pemberitahuan";
import { motion, AnimatePresence } from "framer-motion";

type Pengguna = Database["public"]["Tables"]["pengguna"]["Row"];

export function HalamanPenggunaAdmin() {
  const [filters, setFilters] = useState<AdminUserFilters>({
    page: 1,
    limit: 20,
  });
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Pengguna | null>(null);

  const { data: usersData, isLoading } = useAdminUsers(filters);
  const { data: statsData } = useAdminUserStats();
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

  const handleToggleStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "aktif" ? "nonaktif" : "aktif";
    pemberitahuan.tampilkanPemuatan("Mengubah status...");
    updateUserMutation.mutate(
      { userId, data: { status: newStatus as any } },
      {
        onSuccess: () => {
          pemberitahuan.sukses(`Status pengguna berhasil diubah.`);
        },
        onError: () => {
          pemberitahuan.gagal("Gagal mengubah status pengguna.");
        },
        onSettled: () => {
          pemberitahuan.hilangkanPemuatan();
        },
      }
    );
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
      className="space-y-6 font-sans text-gray-900 antialiased pb-10"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header Section */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight text-gray-800">Manajemen Pengguna</h1>
          <p className="text-gray-500 text-xs">
            Kelola akses dan data pengguna dalam organisasi Anda.
          </p>
        </div>
        <Button
          onClick={handleOpenCreateDialog}
          className="shadow-lg shadow-blue-100 bg-[#7B6CF0] hover:bg-[#6859d0] hover:brightness-110 active:scale-95 transition-all text-white rounded-xl px-4 text-xs font-semibold h-9"
        >
          <Add size={18} className="mr-2" variant="Bold" />
          Tambah Pengguna Baru
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          title="Total Pengguna"
          value={statsData?.total || 0}
          subtext="Total seluruh pengguna"
          icon={Profile2User}
          color="bg-blue-500"
          trend="Total"
        />
        <StatCard
          title="Pengguna Aktif"
          value={statsData?.active || 0}
          subtext="Pengguna berstatus aktif"
          icon={UserTick}
          color="bg-emerald-500"
          trend="Aktif"
        />
        <StatCard
          title="Tidak Aktif / Ditangguhkan"
          value={(statsData?.nonActive || 0) + (statsData?.suspended || 0)}
          subtext="Tidak aktif atau ditangguhkan"
          icon={UserRemove}
          color="bg-rose-500"
          trend="Tidak Aktif"
        />
      </motion.div>

      {/* Filters Bar - Separate Card to match GlobalUsersPage */}
      <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-300 shadow-sm">
        <div className="relative flex-1 max-w-md group">
          <SearchNormal1
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors"
          />
          <Input
            type="text"
            placeholder="Cari nama atau email pengguna..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus-visible:ring-2 focus-visible:ring-violet-100 focus-visible:border-violet-200 focus:bg-white transition-all h-10 shadow-none"
            value={filters.search || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Select value={filters.role || "all"} onValueChange={handleRoleFilter}>
              <SelectTrigger className="w-[140px] bg-gray-50 border-gray-200 rounded-lg text-xs font-medium h-9 hover:bg-white hover:border-violet-200 transition-all focus:ring-0">
                <SelectValue placeholder="Peran" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100">
                <SelectItem value="all">Semua Peran</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="instruktur">Instruktur</SelectItem>
                <SelectItem value="pembelajar">Pembelajar</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status || "all"} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[140px] bg-gray-50 border-gray-200 rounded-lg text-xs font-medium h-9 hover:bg-white hover:border-violet-200 transition-all focus:ring-0">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100">
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Non-Aktif</SelectItem>
                <SelectItem value="suspended">Ditangguhkan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={item}>
        <TabelPenggunaAdmin
          users={usersData?.data || []}
          isLoading={isLoading}
          onEdit={handleEditUser}
          onDelete={(user) =>
            confirmDeleteUser({ id: user.id, nama: user.nama_lengkap })
          }
          onToggleStatus={handleToggleStatus}
        />
      </motion.div>

      {/* Pagination */}
      {usersData && usersData.totalPages > 1 && (
        <motion.div variants={item} className="flex items-center justify-between pt-6 border-t border-gray-100">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={usersData.page === 1}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))
              }
              className="rounded-xl"
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
              className="rounded-xl"
            >
              Selanjutnya
            </Button>
          </div>
        </motion.div>
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
    </motion.div>
  );
}
