import { useState } from "react";
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
import { Badge } from "@/komponen/ui/badge";
import { Switch } from "@/komponen/ui/switch";
// AlertDialog dihapus karena digantikan oleh Notiflix
import { Button } from "@/komponen/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/komponen/ui/card";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Users,
  UserCheck,
  UserX,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/pustaka/utils";
import type {
  GlobalUserFilters,
  CreateUserData,
  UpdateUserData,
  PenggunaWithTenant,
} from "../api/usersApi";

const statusColors = {
  aktif: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900",
  nonaktif: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800",
  suspended: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-900",
};

const roleColors = {
  superadmin:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-900",
  admin: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-900",
  instruktur:
    "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900",
  pembelajar:
    "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800",
};

export function GlobalUsersPage() {
  const [filters, setFilters] = useState<GlobalUserFilters>({
    page: 1,
    limit: 20,
  });
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PenggunaWithTenant | null>(
    null,
  );

  const { data: usersData, isLoading } = useGlobalUsers(filters);
  const { data: tenantsData } = useTenants({ limit: 100 });
  const updateStatusMutation = useUpdateUserStatus();
  const createUserMutation = useCreateGlobalUser();
  const updateUserMutation = useUpdateGlobalUser();
  const deleteUserMutation = useDeleteGlobalUser();

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

  const handleTenantFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      id_lembaga: value === "all" ? undefined : value,
      page: 1,
    }));
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "aktif" ? "nonaktif" : "aktif";
      pemberitahuan.tampilkanPemuatan("Mengubah status...");
      await updateStatusMutation.mutateAsync({
        userId,
        status: newStatus as any,
      });
      pemberitahuan.sukses(`Status pengguna berhasil diubah menjadi ${newStatus}.`);
    } catch (error) {
      pemberitahuan.gagal("Gagal mengubah status pengguna.");
    } finally {
      pemberitahuan.hilangkanPemuatan();
    }
  };

  const handleCreateUser = async (data: CreateUserData) => {
    try {
      pemberitahuan.tampilkanPemuatan("Menambahkan pengguna...");
      await createUserMutation.mutateAsync(data);
      pemberitahuan.sukses("Pengguna baru berhasil ditambahkan.");
      setUserDialogOpen(false);
    } catch (error) {
      pemberitahuan.gagal("Gagal menambahkan pengguna.");
    } finally {
      pemberitahuan.hilangkanPemuatan();
    }
  };

  const handleUpdateUser = async (data: UpdateUserData) => {
    if (!editingUser) return;
    try {
      pemberitahuan.tampilkanPemuatan("Memperbarui pengguna...");
      await updateUserMutation.mutateAsync({
        userId: editingUser.id,
        data,
      });
      pemberitahuan.sukses("Data pengguna berhasil diperbarui.");
      setUserDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      pemberitahuan.gagal("Gagal memperbarui data pengguna.");
    } finally {
      pemberitahuan.hilangkanPemuatan();
    }
  };

  const handleSubmitUser = (data: any) => {
    if (editingUser) {
      const updateData: UpdateUserData = {
        nama_lengkap: data.nama_lengkap,
        email: data.email,
        role: data.role,
        id_lembaga: data.id_lembaga,
        status: data.status,
      };
      handleUpdateUser(updateData);
    } else {
      handleCreateUser(data as CreateUserData);
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
      async () => {
        try {
          pemberitahuan.tampilkanPemuatan("Menghapus pengguna...");
          await deleteUserMutation.mutateAsync(user.id);
          pemberitahuan.sukses("Pengguna berhasil dihapus.");
        } catch (error) {
          pemberitahuan.gagal("Gagal menghapus pengguna.");
        } finally {
          pemberitahuan.hilangkanPemuatan();
        }
      }
    );
  };

  // handleDeleteUser dihapus karena logika dipindah ke confirmDeleteUser

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Kelola Pengguna Global</h1>
          <p className="text-muted-foreground text-sm">
            Kelola data seluruh pengguna dari berbagai tenant dalam platform secara terpusat.
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog} className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Pengguna Baru
        </Button>
      </div>

      {/* Stats Overview */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-blue-500/50 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Pengguna</CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{usersData?.count || 0}</div>
            <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase">Pengguna terdaftar</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-green-500/50 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Aktif</CardTitle>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg group-hover:bg-green-100 dark:group-hover:bg-green-900/40 transition-colors">
              <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-green-600">
              {usersData?.data?.filter((u) => u.status === "aktif").length || 0}
            </div>
            <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase">Sesi aktif saat ini</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-slate-500/50 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Non-Aktif</CardTitle>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
              <UserX className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-600">
              {usersData?.data?.filter((u) => u.status === "nonaktif").length || 0}
            </div>
            <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase">Pengguna hibernasi</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-red-100 dark:border-red-900/30 hover:border-red-500/50 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ditangguhkan</CardTitle>
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
              <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-red-600">
              {usersData?.data?.filter((u) => u.status === "suspended").length || 0}
            </div>
            <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase">Memerlukan perhatian</p>
          </CardContent>
        </Card>
      </section>

      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau email..."
              className="pl-10 bg-background border-muted-foreground/20 focus:border-primary transition-all h-10"
              value={filters.search || ""}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 md:flex gap-2">
            <Select
              value={filters.role || "all"}
              onValueChange={handleRoleFilter}
            >
              <SelectTrigger className="w-[150px] bg-background border-muted-foreground/20 h-10">
                <SelectValue placeholder="Semua Peran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Peran</SelectItem>
                <SelectItem value="superadmin">Superadmin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="instruktur">Instruktur</SelectItem>
                <SelectItem value="pembelajar">Pembelajar</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status || "all"}
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className="w-[150px] bg-background border-muted-foreground/20 h-10">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Non-Aktif</SelectItem>
                <SelectItem value="suspended">Ditangguhkan</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.id_lembaga || "all"}
              onValueChange={handleTenantFilter}
            >
              <SelectTrigger className="w-[180px] bg-background border-muted-foreground/20 h-10">
                <SelectValue placeholder="Semua Tenant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tenant</SelectItem>
                {tenantsData?.data.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-card text-card-foreground rounded-xl border border-border/60 shadow-sm overflow-hidden transition-all">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-b">
                  <TableHead className="font-semibold text-foreground py-4 px-6 w-[350px]">Identitas Pengguna</TableHead>
                  <TableHead className="font-semibold text-foreground py-4">Peran</TableHead>
                  <TableHead className="font-semibold text-foreground py-4">Tenant / Lembaga</TableHead>
                  <TableHead className="font-semibold text-foreground py-4">Status</TableHead>
                  <TableHead className="font-semibold text-foreground text-center py-4">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                          <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="h-6 bg-muted animate-pulse rounded w-20" />
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="h-4 bg-muted animate-pulse rounded w-24" />
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="h-6 bg-muted animate-pulse rounded w-16" />
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="h-8 w-16 mx-auto bg-muted animate-pulse rounded-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : usersData?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-muted/50 rounded-full">
                          <Users className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                        <p className="text-muted-foreground font-medium">
                          Tidak ada pengguna yang ditemukan
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  usersData?.data.map((user) => (
                    <TableRow key={user.id} className="group transition-all hover:bg-muted/20 border-b last:border-0">
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer" onClick={() => handleEditUser(user)}>
                            {user.nama_lengkap}
                          </span>
                          <span className="text-xs text-muted-foreground font-medium">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-semibold text-[10px] uppercase tracking-wider px-2.5 py-0.5 border shadow-sm",
                            roleColors[user.role as keyof typeof roleColors]
                          )}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 font-medium text-sm text-foreground/80">
                        {user.tenant_name || "-"}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-bold rounded-full px-3 py-1 text-[10px] uppercase tracking-wider border shadow-sm",
                            statusColors[user.status]
                          )}
                        >
                          {user.status === 'suspended' ? 'Ditangguhkan' : user.status === 'nonaktif' ? 'Non-Aktif' : 'Aktif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex items-center justify-center gap-3">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={user.status === "aktif"}
                              onCheckedChange={() =>
                                handleToggleStatus(user.id, user.status)
                              }
                              disabled={
                                user.role === "superadmin" ||
                                user.status === "suspended" ||
                                updateStatusMutation.isPending
                              }
                              className="data-[state=checked]:bg-green-600 scale-90"
                            />
                          </div>
                          <div className="w-px h-6 bg-muted mx-1 hidden md:block" />
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-full"
                              onClick={() => handleEditUser(user)}
                              disabled={user.role === "superadmin"}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                              onClick={() =>
                                confirmDeleteUser({
                                  id: user.id,
                                  nama: user.nama_lengkap,
                                })
                              }
                              disabled={
                                user.role === "superadmin" ||
                                deleteUserMutation.isPending
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {usersData && usersData.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t bg-muted/30">
              <p className="text-sm text-muted-foreground font-medium">
                Halaman {usersData.page} dari {usersData.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 shadow-sm hover:bg-background"
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
                  className="h-8 text-primary border-primary/20 hover:bg-primary/5 shadow-sm"
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
        </div>
      </div>

      <CreateUserDialog
        open={userDialogOpen}
        onOpenChange={(open) => {
          setUserDialogOpen(open);
          if (!open) setEditingUser(null);
        }}
        onSubmit={handleSubmitUser}
        isSubmitting={
          createUserMutation.isPending || updateUserMutation.isPending
        }
        user={editingUser}
      />

      {/* AlertDialog dihapus karena menggunakan Notiflix */}
    </div>
  );
}
