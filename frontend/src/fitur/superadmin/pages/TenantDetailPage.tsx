import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTenant, useTenantStats, useUpdateTenant } from "../hooks/useTenants";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/komponen/ui/card";
import { Button } from "@/komponen/ui/button";
import { Badge } from "@/komponen/ui/badge";
import {
  ArrowLeft,
  Profile2User,
  Book,
  Teacher,
  FolderCloud,
  Edit,
  Building,
  Calendar,
  Sms,
  Colorfilter,
  Settings,
  TickCircle,
  CloseCircle,
  Danger,
  Link,
} from "iconsax-react";
import { formatTanggal, cn } from "@/pustaka/utils";
import { StatCard } from "@/fitur/superadmin/komponen/dashboard/StatCard";
import { TenantDialog } from "../komponen/TenantDialog";
import { pemberitahuan } from "@/pustaka/pemberitahuan";
import { motion, AnimatePresence } from "framer-motion";

export function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: tenant, isLoading: tenantLoading } = useTenant(id!);
  const { data: stats } = useTenantStats(id!);
  const updateMutation = useUpdateTenant();

  if (tenantLoading) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium text-sm">Memuat detail organisasi...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <div className="text-center bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Danger size={32} variant="Bold" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Tenant Tidak Ditemukan</h2>
          <p className="text-gray-500 text-sm mt-2 max-w-xs">
            Data organisasi yang Anda cari tidak tersedia atau sudah dihapus.
          </p>
          <Button
            onClick={() => navigate("/superadmin/tenants")}
            variant="outline"
            className="mt-6 rounded-xl border-gray-200"
          >
            Kembali ke Daftar Tenant
          </Button>
        </div>
      </div>
    );
  }

  const handleUpdate = (data: any) => {
    pemberitahuan.tampilkanPemuatan("Memperbarui tenant...");
    updateMutation.mutate(
      { id: id!, data },
      {
        onSuccess: () => {
          pemberitahuan.sukses("Data tenant berhasil diperbarui.");
          setDialogOpen(false);
        },
        onError: (error: any) => {
          console.error("Failed to update tenant:", error);
          pemberitahuan.gagal("Gagal memperbarui data tenant.");
        },
        onSettled: () => {
          pemberitahuan.hilangkanPemuatan();
        },
      }
    );
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'aktif': return { label: 'Aktif', color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: <TickCircle size={16} variant="Bold" className="text-emerald-500" /> };
      case 'suspended': return { label: 'Suspended', color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100', icon: <Danger size={16} variant="Bold" className="text-red-500" /> };
      default: return { label: 'Non-Aktif', color: 'bg-gray-400', text: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-100', icon: <CloseCircle size={16} variant="Bold" className="text-gray-400" /> };
    }
  };

  const statusInfo = getStatusInfo((tenant as any).status);

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
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/superadmin/tenants")}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 shadow-sm hover:bg-gray-50 text-gray-500 transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-2xl font-bold tracking-tight text-gray-800">
                {(tenant as any).nama}
              </h1>
              <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider", statusInfo.bg, statusInfo.text, statusInfo.border)}>
                {statusInfo.icon}
                {statusInfo.label}
              </div>
            </div>
            <p className="text-gray-500 text-xs">
              Melihat detail data dan statistik performa organisasi.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
          >
            <Edit size={18} />
            <span>Ubah Data Tenant</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.section variants={item} className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Pengguna"
          value={stats?.total_users || 0}
          subtext={`${stats?.active_users || 0} akun aktif`}
          icon={Profile2User}
          color="bg-blue-500"
          trend="+5%"
        />
        <StatCard
          title="Total Kursus"
          value={stats?.total_courses || 0}
          subtext={`${stats?.published_courses || 0} kursus terbit`}
          icon={Book}
          color="bg-violet-500"
          trend="+2 New"
        />
        <StatCard
          title="Pendaftaran"
          value={stats?.total_enrollments || 0}
          subtext="Siswa berpartisipasi"
          icon={Teacher}
          color="bg-green-500"
          trend="Stable"
        />
        <StatCard
          title="Penyimpanan"
          value={`${stats?.storage_used_mb || 0} MB`}
          subtext="Kapasitas terpakai"
          icon={FolderCloud}
          color="bg-amber-500"
          trend="85% limit"
        />
      </motion.section>

      <motion.div variants={item} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Profile Card */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-gray-300 rounded-xl shadow-sm overflow-hidden h-full">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
                <Building size={18} className="text-violet-500" /> Profil Organisasi
              </div>
            </div>
            <div className="p-8">
              <div className="flex flex-col md:flex-row gap-10 items-start">
                {/* Logo Section */}
                <div className="shrink-0 flex flex-col items-center gap-4 w-full md:w-auto">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative h-32 w-32 bg-white rounded-[1.8rem] border border-gray-100 flex items-center justify-center shadow-sm overflow-hidden p-4">
                      {(tenant as any).url_logo ? (
                        <img
                          src={(tenant as any).url_logo}
                          alt={`Logo ${(tenant as any).nama}`}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <Building size={48} variant="TwoTone" className="text-gray-300" />
                      )}
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-violet-50 text-violet-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-violet-100 shadow-sm">
                    Logo Institusi
                  </span>
                </div>

                {/* Details Grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-7 gap-x-10">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Colorfilter size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Tipe Organisasi</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800 capitalize">{(tenant as any).tipe}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Link size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Slug / Subdomain</span>
                    </div>
                    <p className="text-sm font-mono font-bold text-violet-600">/{(tenant as any).slug}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Sms size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Email Kontak</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800">{(tenant as any).email || "Belum diatur"}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Calendar size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Tanggal Bergabung</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800">{formatTanggal((tenant as any).created_at, "long")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-300 rounded-xl shadow-sm overflow-hidden h-full">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
                <Settings size={18} className="text-gray-500" /> Konfigurasi
              </div>
            </div>
            <div className="p-0">
              {(tenant as any).konfigurasi && Object.keys((tenant as any).konfigurasi).length > 0 ? (
                <div className="relative group">
                  <pre className="bg-gray-900 text-gray-300 p-6 overflow-x-auto text-[11px] font-mono leading-relaxed h-[350px]">
                    {JSON.stringify((tenant as any).konfigurasi, null, 2)}
                  </pre>
                  <div className="absolute top-4 right-4 h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/10 text-white/50 hover:text-white transition-colors cursor-help">
                    <Settings size={14} />
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 border border-gray-100">
                    <Settings size={24} />
                  </div>
                  <p className="text-gray-400 text-xs font-medium">Tidak ada parameter konfigurasi kustom.</p>
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 italic text-[10px] text-gray-400 text-center">
              Parameter ini mengatur fungsionalitas teknis platform.
            </div>
          </div>
        </div>
      </motion.div>

      <TenantDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tenant={tenant as any}
        onSubmit={handleUpdate}
        isSubmitting={updateMutation.isPending}
      />
    </motion.div>
  );
}
