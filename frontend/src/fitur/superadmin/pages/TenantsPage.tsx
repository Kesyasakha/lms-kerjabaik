import { useState, useEffect } from "react";
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

import { StatCard } from "@/fitur/superadmin/komponen/dashboard/StatCard";
import {
  Building,
  TickCircle,
  CloseCircle,
  Profile2User,
  Add,
  SearchNormal1,
  Setting4,
} from "iconsax-react";
import type { TenantWithStats, TenantFilters } from "../tipe/tenant.types";
import { motion, AnimatePresence } from "framer-motion";

export function TenantsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<TenantFilters>({
    page: 1,
    limit: 10,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantWithStats | null>(
    null,
  );
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: tenantsData, isLoading } = useTenants(filters);
  const createMutation = useCreateTenant();
  const updateMutation = useUpdateTenant();
  const deleteMutation = useDeleteTenant();

  const handleEdit = (tenant: TenantWithStats) => {
    setSelectedTenant(tenant);
    setDialogOpen(true);
  };

  const handleDelete = (tenant: TenantWithStats) => {
    pemberitahuan.konfirmasi(
      "Konfirmasi Hapus",
      `Apakah Anda yakin ingin menghapus tenant **${tenant.nama}**? Semua data terkait akan dihapus secara permanen.`,
      () => {
        pemberitahuan.tampilkanPemuatan("Menghapus tenant...");
        deleteMutation.mutate(tenant.id, {
          onSuccess: () => {
            pemberitahuan.sukses("Tenant berhasil dihapus.");
          },
          onError: () => {
            pemberitahuan.gagal("Gagal menghapus tenant.");
          },
          onSettled: () => {
            pemberitahuan.hilangkanPemuatan();
          },
        });
      }
    );
  };

  const handleViewDetail = (tenant: TenantWithStats) => {
    navigate(`/superadmin/tenants/${tenant.id}`);
  };

  const handleSubmit = (data: any) => {
    pemberitahuan.tampilkanPemuatan(
      selectedTenant ? "Memperbarui tenant..." : "Menambah tenant..."
    );

    const callbacks = {
      onSuccess: () => {
        pemberitahuan.sukses(
          selectedTenant
            ? "Data tenant berhasil diperbarui."
            : "Tenant baru berhasil ditambahkan."
        );
        setDialogOpen(false);
        setSelectedTenant(null);
      },
      onError: (error: any) => {
        console.error("Failed to save tenant:", error);
        pemberitahuan.gagal("Gagal menyimpan data tenant.");
      },
      onSettled: () => {
        pemberitahuan.hilangkanPemuatan();
      },
    };

    if (selectedTenant) {
      updateMutation.mutate(
        {
          id: selectedTenant.id,
          data,
        },
        callbacks
      );
    } else {
      createMutation.mutate(data, callbacks);
    }
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
      className="space-y-6 font-sans text-gray-900 antialiased selection:bg-violet-100 selection:text-violet-900"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header Section */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight text-gray-800">Manajemen Tenant</h1>
          <p className="text-gray-500 text-xs">
            Kelola data organisasi dan lembaga yang terdaftar dalam sistem.
          </p>
        </div>
        <button
          onClick={() => { setSelectedTenant(null); setDialogOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#7B6CF0] rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-violet-200"
        >
          <Add size={18} />
          <span>Tambah Tenant</span>
        </button>
      </motion.div>

      {/* Stats Overview */}
      <motion.section variants={item} className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tenant"
          value={tenantsData?.count || 0}
          subtext="Tenant terdaftar"
          icon={Building}
          color="bg-blue-500"
          trend="+2 Baru"
        />
        <StatCard
          title="Aktif"
          value={tenantsData?.data?.filter((t) => t.status === "aktif").length || 0}
          subtext="Status aktif saat ini"
          icon={TickCircle}
          color="bg-green-500"
          trend="Stabil"
        />
        <StatCard
          title="Non-Aktif"
          value={(tenantsData?.data?.filter((t) => t.status === "nonaktif" || t.status === "suspended").length) || 0}
          subtext="Memerlukan perhatian"
          icon={CloseCircle}
          color="bg-red-500"
          trend="Perlu Tindakan"
        />
        <StatCard
          title="Total Pengguna"
          value={tenantsData?.data?.reduce((acc, curr) => acc + (curr.user_count || 0), 0) || 0}
          subtext="Pengguna di seluruh tenant"
          icon={Profile2User}
          color="bg-violet-500"
          trend="+12%"
        />
      </motion.section>

      {/* Filters & Table Section */}
      <div className="space-y-6">
        <motion.div variants={item} className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-300 shadow-sm">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Select
                value={filters.status || "all"}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger className="w-[140px] bg-gray-50 border-gray-200 rounded-lg text-xs font-medium h-9 hover:bg-white hover:border-violet-200 transition-all focus:ring-0">
                  <SelectValue placeholder="Status" />
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
                <SelectTrigger className="w-[140px] bg-gray-50 border-gray-200 rounded-lg text-xs font-medium h-9 hover:bg-white hover:border-violet-200 transition-all focus:ring-0">
                  <SelectValue placeholder="Tipe Org" />
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

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative group flex-1 md:w-64">
              <Input
                placeholder="Cari tenant..."
                className="pl-10 pr-4 py-2 w-full bg-gray-50 border-gray-200 rounded-xl text-xs focus-visible:ring-2 focus-visible:ring-violet-100 focus-visible:border-violet-200 focus:bg-white transition-all text-gray-600 placeholder:text-gray-400 focus-visible:outline-none border h-10 shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SearchNormal1 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
            </div>
            <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 transition-colors h-10 w-10 flex items-center justify-center">
              <Setting4 size={18} />
            </button>
          </div>
        </motion.div>

        <motion.div variants={item} className="rounded-xl border border-gray-300 bg-card text-card-foreground shadow-sm overflow-hidden transition-all">
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
        </motion.div>
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
    </motion.div>
  );
}
