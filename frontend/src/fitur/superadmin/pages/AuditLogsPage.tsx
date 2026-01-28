import { useState } from "react";
import { useAuditLogs } from "../hooks/useAuditLogs";
import { Input } from "@/komponen/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/komponen/ui/select";
import { Button } from "@/komponen/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/komponen/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/komponen/ui/table";
import { Filter, ClipboardList, User, ShieldAlert, ArrowRight } from "lucide-react";
import { cn } from "@/pustaka/utils";
import { Badge } from "@/komponen/ui/badge";
import { StatCard } from "@/fitur/superadmin/komponen/dashboard/StatCard";
import type { AuditLogFilters } from "../tipe/auditLog.types";

// --- Dictionaries & Helpers ---

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Tambah Data",
  UPDATE: "Perbarui Data",
  DELETE: "Hapus Data",
  LOGIN: "Masuk Sistem",
  LOGOUT: "Keluar Sistem",
  EXPORT: "Ekspor Data",
  IMPORT: "Impor Data",
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  UPDATE: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  DELETE: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  LOGIN: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  default: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
};

const RESOURCE_LABELS: Record<string, string> = {
  tenant: "Tenant / Lembaga",
  user: "Pengguna",
  course: "Kursus",
  enrollment: "Pendaftaran",
  auth: "Sistem Otentikasi",
  system: "Sistem",
  settings: "Pengaturan",
};

function formatDetailValue(value: any): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

const AuditLogDetailParser = ({ detail }: { detail: any }) => {
  if (!detail || Object.keys(detail).length === 0) {
    return <span className="text-muted-foreground italic text-xs">- Tidak ada detail -</span>;
  }

  // Cek apakah ini format perubahan (from -> to)
  const isChangeLog = detail.changes || (detail.old && detail.new);

  if (isChangeLog) {
    const changes = detail.changes || detail;
    return (
      <div className="flex flex-col gap-1">
        {Object.entries(changes).map(([key, val]: [string, any]) => (
          <div key={key} className="text-xs grid grid-cols-[1fr,auto,1fr] gap-2 items-center bg-muted/40 p-1.5 rounded border border-border/40">
            <span className="font-semibold text-muted-foreground truncate" title={key}>{key}</span>
            <ArrowRight className="w-3 h-3 text-muted-foreground/50" />
            <div className="flex flex-col sm:flex-row gap-1 items-center bg-background/50 px-1.5 py-0.5 rounded text-foreground font-medium">
              <span>{formatDetailValue(val.from || val.old)}</span>
              <ArrowRight className="w-3 h-3 text-primary mx-1" />
              <span className="text-primary">{formatDetailValue(val.to || val.new)}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Fallback untuk data biasa
  return (
    <div className="grid grid-cols-1 gap-1">
      {Object.entries(detail).map(([key, value]) => {
        // Skip field 'password' atau sensitif lainnya jika ada
        if (key.toLowerCase().includes('password')) return null;

        return (
          <div key={key} className="text-xs flex flex-wrap gap-1 items-baseline">
            <span className="font-semibold text-muted-foreground min-w-[80px]">{key}:</span>
            <span className="font-mono bg-muted/50 px-1 rounded text-foreground break-all">
              {formatDetailValue(value)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export function AuditLogsPage() {
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 50,
  });

  const { data, isLoading } = useAuditLogs(filters);

  const clearFilters = () => {
    setFilters({ page: 1, limit: 50 });
  };

  return (
    <div className="space-y-6 font-sans text-gray-900 antialiased pb-10">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-gray-800">Jejak Audit</h1>
        <p className="text-gray-500 text-xs">
          Tinjau seluruh aktivitas sensitif dan perubahan sistem yang dilakukan oleh Superadmin.
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Log"
          value={data?.count || 0}
          subtext="Entri tercatat"
          icon={ClipboardList}
          color="bg-blue-500"
          trend="Lifetime"
        />
        <StatCard
          title="Aktivitas Hari Ini"
          value={data?.data.filter(d => new Date(d.created_at).toDateString() === new Date().toDateString()).length || 0}
          subtext="Data baru hari ini"
          icon={ShieldAlert}
          color="bg-emerald-500"
          trend="Today"
        />
        {/* Placeholder for future stats if backend provides specifics */}
      </div>

      <div className="space-y-6">
        {/* Filters Bar - Horizontal */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-300 shadow-sm">
          {/* Date Range Group */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200">
              <span className="text-[10px] font-bold uppercase text-gray-400 pl-2">Rentang:</span>
              <Input
                type="date"
                className="bg-transparent border-0 text-xs h-7 w-[110px] p-0 focus-visible:ring-0 shadow-none text-gray-600"
                value={filters.date_from || ""}
                onChange={(e) => setFilters((prev) => ({ ...prev, date_from: e.target.value }))}
              />
              <span className="text-gray-300">-</span>
              <Input
                type="date"
                className="bg-transparent border-0 text-xs h-7 w-[110px] p-0 focus-visible:ring-0 shadow-none text-gray-600"
                value={filters.date_to || ""}
                onChange={(e) => setFilters((prev) => ({ ...prev, date_to: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={filters.aksi || "all"}
              onValueChange={(val) =>
                setFilters((prev) => ({
                  ...prev,
                  aksi: val === "all" ? undefined : val,
                }))
              }
            >
              <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200 rounded-lg text-xs font-medium h-9 hover:bg-white hover:border-violet-200 transition-all focus:ring-0">
                <SelectValue placeholder="Semua Tindakan" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100">
                <SelectItem value="all">Semua Tindakan</SelectItem>
                <SelectItem value="CREATE">Tambah Data (CREATE)</SelectItem>
                <SelectItem value="UPDATE">Perbarui Data (UPDATE)</SelectItem>
                <SelectItem value="DELETE">Hapus Data (DELETE)</SelectItem>
                <SelectItem value="LOGIN">Log Masuk (LOGIN)</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              className="rounded-lg border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 h-9 px-3 text-xs font-bold"
              onClick={clearFilters}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden transition-all">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100">
                  <TableHead className="py-4 pl-6 pr-4 text-left text-xs font-semibold text-gray-500 w-[200px]">Waktu & Tanggal</TableHead>
                  <TableHead className="py-4 text-left text-xs font-semibold text-gray-500 w-[200px]">Pengguna</TableHead>
                  <TableHead className="py-4 text-left text-xs font-semibold text-gray-500 w-[150px]">Tindakan</TableHead>
                  <TableHead className="py-4 text-left text-xs font-semibold text-gray-500 w-[150px]">Sumber Daya</TableHead>
                  <TableHead className="py-4 pr-6 text-left text-xs font-semibold text-gray-500">Rincian Perubahan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i} className="border-b border-gray-50">
                      <TableCell colSpan={5} className="py-4 px-6">
                        <div className="h-8 bg-gray-50 animate-pulse rounded w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  data?.data.map((log) => (
                    <TableRow key={log.id} className="group hover:bg-gray-50/50 transition-colors border-b last:border-0 border-gray-100 align-top">
                      <TableCell className="py-4 pl-6 pr-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-gray-800 font-bold text-sm">
                            {new Date(log.created_at).toLocaleDateString("id-ID", {
                              day: 'numeric', month: 'long', year: 'numeric'
                            })}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">
                            {new Date(log.created_at).toLocaleTimeString("id-ID", {
                              hour: '2-digit', minute: '2-digit'
                            })} WIB
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 shrink-0 border border-gray-200">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-800 text-sm truncate max-w-[140px]" title={log.id_pengguna || undefined}>
                              {log.nama_pengguna || "Superadmin"}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono truncate max-w-[140px]">
                              {log.id_pengguna?.split("-")[0]}...
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 border shadow-sm rounded-md",
                            ACTION_COLORS[log.aksi] || ACTION_COLORS.default
                          )}
                        >
                          {ACTION_LABELS[log.aksi] || log.aksi}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 text-xs font-medium border border-gray-200 capitalize">
                          {RESOURCE_LABELS[log.tipe_sumber_daya] || log.tipe_sumber_daya}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 pr-6 min-w-[350px]">
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/60 group-hover:border-gray-300 transition-colors">
                          <AuditLogDetailParser detail={log.detail} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {data?.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                          <ShieldAlert size={32} />
                        </div>
                        <p className="text-gray-800 font-bold text-sm">Belum ada log aktifitas</p>
                        <p className="text-gray-400 text-xs">Belum ada entri log audit yang ditemukan untuk filter ini.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/20">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Halaman {data.page} / {data.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-gray-200 h-9 px-4 text-xs font-bold"
                  disabled={data.page === 1}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))
                  }
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-violet-200 text-violet-600 hover:bg-violet-50 h-9 px-4 text-xs font-bold"
                  disabled={data.page === data.totalPages}
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
    </div>
  );
}
