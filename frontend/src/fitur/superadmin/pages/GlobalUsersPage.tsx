import { useState, useEffect } from "react";
import {
  useGlobalUsers,
  useUpdateUserStatus,
  useCreateGlobalUser,
  useUpdateGlobalUser,
  useDeleteGlobalUser,
} from "../hooks/useGlobalUsers";
import { useTenants } from "../hooks/useTenants";
import { CreateUserDialog } from "../komponen/CreateUserDialog";
import { pemberitahuan } from "@/pustaka/pemberitahuan";
import { Input } from "@/komponen/ui/input";
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
import { Switch } from "@/komponen/ui/switch";
import { Button } from "@/komponen/ui/button";
import {
  SearchNormal1,
  Add,
  Edit,
  Trash,
  Profile2User,
  UserTick,
  UserRemove,
  ShieldSearch,
  Building,
} from "iconsax-react";
import { cn } from "@/pustaka/utils";
import type {
  GlobalUserFilters,
  CreateUserData,
  UpdateUserData,
  PenggunaWithTenant,
} from "../api/usersApi";
import { StatCard } from "@/fitur/superadmin/komponen/dashboard/StatCard";

const statusInfo = {
  aktif: { label: "Aktif", color: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
  nonaktif: { label: "Non-Aktif", color: "bg-gray-400", text: "text-gray-700", bg: "bg-gray-50", border: "border-gray-100" },
  suspended: { label: "Ditangguhkan", color: "bg-red-500", text: "text-red-700", bg: "bg-red-50", border: "border-red-100" },
};

const roleInfo = {
  superadmin: { label: "Superadmin", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-100" },
  admin: { label: "Admin", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100" },
  instruktur: { label: "Instruktur", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100" },
  pembelajar: { label: "Pembelajar", color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-100" },
};

export function GlobalUsersPage() {
  const [filters, setFilters] = useState<GlobalUserFilters>({
    page: 1,
    limit: 20,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PenggunaWithTenant | null>(
    null,
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: usersData, isLoading } = useGlobalUsers(filters);
  const { data: tenantsData } = useTenants({ limit: 100 });
  const updateStatusMutation = useUpdateUserStatus();
  const createUserMutation = useCreateGlobalUser();
  const updateUserMutation = useUpdateGlobalUser();
  const deleteUserMutation = useDeleteGlobalUser();

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

  const handleTenantFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      id_lembaga: value === "all" ? undefined : value,
      page: 1,
    }));
  };

  const handleToggleStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "aktif" ? "nonaktif" : "aktif";
    pemberitahuan.tampilkanPemuatan("Mengubah status...");
    updateStatusMutation.mutate(
      { userId, status: newStatus as any },
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

  const handleCreateUser = (data: CreateUserData) => {
    pemberitahuan.tampilkanPemuatan("Menambahkan pengguna...");
    createUserMutation.mutate(data, {
      onSuccess: () => {
        pemberitahuan.sukses("Pengguna baru berhasil ditambahkan.");
        setUserDialogOpen(false);
      },
      onError: (err: any) => {
        // Handle Edge Function error response properly
        // Supabase functions.invoke returns error in err object if status != 200
        const errorMessage = err?.message || "Gagal menambahkan pengguna.";
        console.error("Create User Error:", err);
        pemberitahuan.gagal(errorMessage);
      },
      onSettled: () => {
        pemberitahuan.hilangkanPemuatan();
      },
    });
  };

  const handleUpdateUser = (data: UpdateUserData) => {
    if (!editingUser) return;
    pemberitahuan.tampilkanPemuatan("Memperbarui pengguna...");
    updateUserMutation.mutate(
      { userId: editingUser.id, data },
      {
        onSuccess: () => {
          pemberitahuan.sukses("Data pengguna berhasil diperbarui.");
          setUserDialogOpen(false);
          setEditingUser(null);
        },
        onError: () => {
          pemberitahuan.gagal("Gagal memperbarui data pengguna.");
        },
        onSettled: () => {
          pemberitahuan.hilangkanPemuatan();
        },
      }
    );
  };

  const handleSubmitUser = (data: any) => {
    if (editingUser) {
      // Filter out fields that are not in the database table public.pengguna
      // Especially 'password' which is handled by auth, not this table directly
      const updateData: UpdateUserData = {
        nama_lengkap: data.nama_lengkap,
        email: data.email,
        id_lembaga: data.id_lembaga,
        status: data.status,
        role: data.role,
      };
      handleUpdateUser(updateData);
    } else {
      // Ensure all required fields for Edge Function are present and clean
      // and handle empty id_lembaga as null to avoid invalid UUID format error
      const createData: CreateUserData = {
        email: data.email,
        password: data.password,
        nama_lengkap: data.nama_lengkap,
        role: data.role || "admin",
        id_lembaga: data.id_lembaga || null,
      };
      console.log("Submitting Create User Data:", createData);
      handleCreateUser(createData);
    }
  };

  const handleOpenCreateDialog = () => {
    setEditingUser(null);
    setUserDialogOpen(true);
  };

  const handleEditUser = (user: PenggunaWithTenant) => {
    setEditingUser(user);
    setUserDialogOpen(true);
  };

  const confirmDeleteUser = (user: { id: string; nama: string }) => {
    pemberitahuan.konfirmasi(
      "Konfirmasi Hapus",
      `Apakah Anda yakin ingin menghapus pengguna **${user.nama}** secara permanen?`,
      () => {
        pemberitahuan.tampilkanPemuatan("Menghapus pengguna...");
        deleteUserMutation.mutate(user.id, {
          onSuccess: () => {
            pemberitahuan.sukses("Pengguna berhasil dihapus.");
          },
          onError: () => {
            pemberitahuan.gagal("Gagal menghapus pengguna.");
          },
          onSettled: () => {
            pemberitahuan.hilangkanPemuatan();
          },
        });
      }
    );
  };

  return (
    <div className="space-y-6 font-sans text-gray-900 antialiased pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight text-gray-800">Manajemen Pengguna</h1>
          <p className="text-gray-500 text-xs">
            Kelola akses dan data seluruh pengguna platform secara terpusat.
          </p>
        </div>
        <button
          onClick={handleOpenCreateDialog}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#7B6CF0] rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-violet-200"
        >
          <Add size={18} variant="Bold" />
          <span>Tambah Pengguna Baru</span>
        </button>
      </div>

      {/* Stats Overview */}
      <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Pengguna"
          value={usersData?.count || 0}
          subtext="Seluruh tenant"
          icon={Profile2User}
          color="bg-blue-500"
          trend="+12%"
        />
        <StatCard
          title="Pengguna Aktif"
          value={usersData?.data?.filter((u) => u.status === "aktif").length || 0}
          subtext="Berstatus Aktif"
          icon={UserTick}
          color="bg-emerald-500"
          trend="85%"
        />
        <StatCard
          title="Non-Aktif"
          value={usersData?.data?.filter((u) => u.status === "nonaktif").length || 0}
          subtext="Tidak aktif"
          icon={UserRemove}
          color="bg-gray-400"
          trend="-2%"
        />
        <StatCard
          title="Ditangguhkan"
          value={usersData?.data?.filter((u) => u.status === "suspended").length || 0}
          subtext="Perlu Verifikasi"
          icon={ShieldSearch}
          color="bg-red-500"
          trend="Flagged"
        />
      </section>

      {/* Filters Bar - Separate Card to match TenantsPage */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-md group">
          <SearchNormal1
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors"
          />
          <Input
            type="text"
            placeholder="Cari nama atau email pengguna..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus-visible:ring-2 focus-visible:ring-violet-100 focus-visible:border-violet-200 focus:bg-white transition-all h-10 shadow-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                <SelectItem value="superadmin">Superadmin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="instruktur">Instruktur</SelectItem>
                <SelectItem value="pembelajar">Pembelajar</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.id_lembaga || "all"} onValueChange={handleTenantFilter}>
              <SelectTrigger className="w-[160px] bg-gray-50 border-gray-200 rounded-lg text-xs font-medium h-9 hover:bg-white hover:border-violet-200 transition-all focus:ring-0">
                <SelectValue placeholder="Tenant" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100">
                <SelectItem value="all">Semua Tenant</SelectItem>
                {tenantsData?.data.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.nama}
                  </SelectItem>
                ))}
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
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100">
                <TableHead className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-gray-400">Pengguna</TableHead>
                <TableHead className="py-4 text-[11px] font-bold uppercase tracking-widest text-gray-400">Akses & Tenant</TableHead>
                <TableHead className="py-4 text-[11px] font-bold uppercase tracking-widest text-gray-400">Status Akun</TableHead>
                <TableHead className="py-4 text-[11px] font-bold uppercase tracking-widest text-gray-400 text-center">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-b border-gray-50">
                    <TableCell className="px-6 py-4"><div className="h-10 bg-gray-50 animate-pulse rounded-xl w-48" /></TableCell>
                    <TableCell className="py-4"><div className="h-6 bg-gray-50 animate-pulse rounded-lg w-32" /></TableCell>
                    <TableCell className="py-4"><div className="h-6 bg-gray-50 animate-pulse rounded-lg w-20" /></TableCell>
                    <TableCell className="py-4"><div className="h-8 bg-gray-50 animate-pulse rounded-xl w-24 mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : usersData?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                        <Profile2User size={32} />
                      </div>
                      <div>
                        <p className="text-gray-800 font-bold text-sm">Data Tidak Ditemukan</p>
                        <p className="text-gray-400 text-xs mt-1">Gunakan kata kunci atau filter lain.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                usersData?.data.map((user) => {
                  const sInfo = statusInfo[user.status as keyof typeof statusInfo] || statusInfo.nonaktif;
                  const rInfo = roleInfo[user.role as keyof typeof roleInfo] || roleInfo.pembelajar;

                  return (
                    <TableRow key={user.id} className="group hover:bg-gray-50/50 border-b border-gray-100 last:border-0 transition-colors">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-sm transition-all duration-200 border border-gray-100 group-hover:border-violet-100 font-bold text-sm shrink-0 uppercase">
                            {user.nama_lengkap.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-gray-800 group-hover:text-[#7B6CF0] transition-colors">
                              {user.nama_lengkap}
                            </span>
                            <span className="text-[11px] text-gray-400 font-medium">{user.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className={cn("inline-flex items-center w-fit px-2 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider", rInfo.bg, rInfo.color, rInfo.border)}>
                            {rInfo.label}
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500 text-[11px] font-medium">
                            <Building size={12} />
                            {user.tenant_name || "Tanpa Tenant"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider", sInfo.bg, sInfo.text, sInfo.border)}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", sInfo.color)}></span>
                            {sInfo.label}
                          </div>
                          <Switch
                            checked={user.status === "aktif"}
                            onCheckedChange={() => handleToggleStatus(user.id, user.status)}
                            disabled={user.role === "superadmin" || user.status === "suspended" || updateStatusMutation.isPending}
                            className="data-[state=checked]:bg-emerald-500 scale-75"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEditUser(user)}
                            disabled={user.role === "superadmin"}
                            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-orange-50 text-gray-400 hover:text-orange-600 transition-all disabled:opacity-30"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => confirmDeleteUser({ id: user.id, nama: user.nama_lengkap })}
                            disabled={user.role === "superadmin" || deleteUserMutation.isPending}
                            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all disabled:opacity-30"
                            title="Hapus"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {usersData && usersData.totalPages > 1 && (
          <div className="px-6 py-5 border-t border-gray-50 flex items-center justify-between bg-gray-50/20">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Halaman {usersData.page} / {usersData.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-gray-200 h-9 px-4 text-xs font-bold"
                disabled={usersData.page === 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-violet-200 text-violet-600 hover:bg-violet-50 h-9 px-4 text-xs font-bold"
                disabled={usersData.page === usersData.totalPages}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>

      <CreateUserDialog
        open={userDialogOpen}
        onOpenChange={(open) => {
          setUserDialogOpen(open);
          if (!open) setEditingUser(null);
        }}
        onSubmit={handleSubmitUser}
        isSubmitting={createUserMutation.isPending || updateUserMutation.isPending}
        user={editingUser}
      />
    </div>
  );
}
