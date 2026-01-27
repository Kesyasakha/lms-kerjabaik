import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useTenants,
  useCreateTenant,
  useUpdateTenant,
  useDeleteTenant,
} from "../hooks/useTenants";
import { TenantTable } from "../komponen/TenantTable";
import { TenantDialog } from "../komponen/TenantDialog";
import { pemberitahuan } from "@/pustaka/pemberitahuan";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/komponen/ui/card";
import {
  Plus,
  Search,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { TenantWithStats, TenantFilters } from "../tipe/tenant.types";

export function TenantsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<TenantFilters>({
    page: 1,
    limit: 10,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantWithStats | null>(
    null,
  );

  const { data: tenantsData, isLoading } = useTenants(filters);
  const createMutation = useCreateTenant();
  const updateMutation = useUpdateTenant();
  const deleteMutation = useDeleteTenant();

  const handleCreate = () => {
    setSelectedTenant(null);
    setDialogOpen(true);
  };

  const handleEdit = (tenant: TenantWithStats) => {
    setSelectedTenant(tenant);
    setDialogOpen(true);
  };

  const handleDelete = (tenant: TenantWithStats) => {
    pemberitahuan.konfirmasi(
      "Konfirmasi Hapus",
      `Apakah Anda yakin ingin menghapus tenant **${tenant.nama}**? Semua data terkait akan dihapus secara permanen.`,
      async () => {
        try {
          pemberitahuan.tampilkanPemuatan("Menghapus tenant...");
          await deleteMutation.mutateAsync(tenant.id);
          pemberitahuan.sukses("Tenant berhasil dihapus.");
        } catch (error) {
          pemberitahuan.gagal("Gagal menghapus tenant.");
        } finally {
          pemberitahuan.hilangkanPemuatan();
        }
      }
    );
  };

  const handleViewDetail = (tenant: TenantWithStats) => {
    navigate(`/superadmin/tenants/${tenant.id}`);
  };

  const handleSubmit = async (data: any) => {
    try {
      pemberitahuan.tampilkanPemuatan(selectedTenant ? "Memperbarui tenant..." : "Menambah tenant...");
      if (selectedTenant) {
        await updateMutation.mutateAsync({
          id: selectedTenant.id,
          data,
        });
        pemberitahuan.sukses("Data tenant berhasil diperbarui.");
      } else {
        await createMutation.mutateAsync(data);
        pemberitahuan.sukses("Tenant baru berhasil ditambahkan.");
      }
      setDialogOpen(false);
      setSelectedTenant(null);
    } catch (error) {
      console.error("Failed to save tenant:", error);
      pemberitahuan.gagal("Gagal menyimpan data tenant.");
    } finally {
      pemberitahuan.hilangkanPemuatan();
    }
  };

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

  const handleTipeFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      tipe: value === "all" ? undefined : value,
      page: 1,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Kelola Tenant</h1>
          <p className="text-muted-foreground text-xs">
            Kelola data organisasi dan lembaga yang terdaftar dalam sistem secara global.
          </p>
        </div>
        <Button onClick={handleCreate} className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Tenant Baru
        </Button>
      </div>

      {/* Stats Overview */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-blue-500/50 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Tenant</CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenantsData?.count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Tenant terdaftar</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-green-500/50 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Aktif</CardTitle>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg group-hover:bg-green-100 dark:group-hover:bg-green-900/40 transition-colors">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tenantsData?.data?.filter((t) => t.status === "aktif").length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Status aktif saat ini</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-red-500/50 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Non-Aktif/Ditangguhkan</CardTitle>
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {(tenantsData?.data?.filter((t) => t.status === "nonaktif" || t.status === "suspended").length) || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Memerlukan perhatian</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-purple-500/50 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-colors">
              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {tenantsData?.data?.reduce((acc, curr) => acc + (curr.user_count || 0), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Pengguna di seluruh tenant</p>
          </CardContent>
        </Card>
      </section>

      {/* Filters & Table Section */}
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau slug..."
              className="pl-10 bg-background border-muted-foreground/20 focus:border-primary transition-all h-10"
              value={filters.search || ""}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={filters.status || "all"}
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className="w-[160px] bg-background h-10">
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
              value={filters.tipe || "all"}
              onValueChange={handleTipeFilter}
            >
              <SelectTrigger className="w-[160px] bg-background h-10">
                <SelectValue placeholder="Semua Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="provinsi">Provinsi</SelectItem>
                <SelectItem value="bkd">BKD/BKPSDM</SelectItem>
                <SelectItem value="kampus">Kampus</SelectItem>
                <SelectItem value="korporasi">Korporasi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden transition-all">
          <TenantTable
            tenants={tenantsData?.data || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetail={handleViewDetail}
          />

          {tenantsData && tenantsData.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t bg-muted/30">
              <p className="text-sm text-muted-foreground">
                Halaman {tenantsData.page} dari {tenantsData.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={tenantsData.page === 1}
                  className="h-8"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: prev.page! - 1,
                    }))
                  }
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={tenantsData.page === tenantsData.totalPages}
                  className="h-8 text-primary border-primary/20 hover:bg-primary/5"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: prev.page! + 1,
                    }))
                  }
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <TenantDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tenant={selectedTenant}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog dihapus karena menggunakan pemberitahuan.konfirmasi */}
    </div>
  );
}
