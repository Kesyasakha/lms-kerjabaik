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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Jejak Audit</h1>
        <p className="text-muted-foreground text-xs">
          Tinjau seluruh aktivitas sensitif dan perubahan sistem yang dilakukan oleh Superadmin.
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-slate-500/50 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Log</CardTitle>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
              <ClipboardList className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{data?.count || 0}</div>
            <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase">Entri tercatat</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col gap-4 bg-card p-6 rounded-xl border border-border/60 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-primary/5 rounded-md">
              <Filter className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-bold text-sm tracking-tight uppercase">Filter Pencarian</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Tindakan</label>
              <Select
                value={filters.aksi || "all"}
                onValueChange={(val) =>
                  setFilters((prev) => ({
                    ...prev,
                    aksi: val === "all" ? undefined : val,
                  }))
                }
              >
                <SelectTrigger className="bg-background border-muted-foreground/20 h-10">
                  <SelectValue placeholder="Semua Tindakan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tindakan</SelectItem>
                  <SelectItem value="CREATE">Tambah Data (CREATE)</SelectItem>
                  <SelectItem value="UPDATE">Perbarui Data (UPDATE)</SelectItem>
                  <SelectItem value="DELETE">Hapus Data (DELETE)</SelectItem>
                  <SelectItem value="LOGIN">Log Masuk (LOGIN)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Tgl Mulai</label>
              <Input
                type="date"
                className="bg-background border-muted-foreground/20 text-xs h-10"
                value={filters.date_from || ""}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, date_from: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Tgl Selesai</label>
              <Input
                type="date"
                className="bg-background border-muted-foreground/20 text-xs h-10"
                value={filters.date_to || ""}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, date_to: e.target.value }))
                }
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full text-xs font-bold uppercase tracking-tight h-10 hover:bg-muted hover:text-foreground transition-all"
                onClick={clearFilters}
              >
                Atur Ulang Filter
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card text-card-foreground rounded-xl border border-border/60 shadow-sm overflow-hidden transition-all">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-b">
                  <TableHead className="font-bold text-foreground py-3 px-6 w-[200px]">Waktu & Tanggal</TableHead>
                  <TableHead className="font-bold text-foreground py-3 w-[200px]">Pengguna</TableHead>
                  <TableHead className="font-bold text-foreground py-3 w-[180px]">Tindakan</TableHead>
                  <TableHead className="font-bold text-foreground py-3 w-[180px]">Sumber Daya</TableHead>
                  <TableHead className="font-bold text-foreground py-3 pr-6">Rincian Perubahan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5} className="py-4 px-6">
                        <div className="h-6 bg-muted animate-pulse rounded w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  data?.data.map((log) => (
                    <TableRow key={log.id} className="group hover:bg-muted/10 transition-colors border-b last:border-0 border-border/60 align-top">
                      <TableCell className="py-2.5 px-6 text-sm font-medium text-muted-foreground whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-foreground font-semibold">
                            {new Date(log.created_at).toLocaleDateString("id-ID", {
                              day: 'numeric', month: 'long', year: 'numeric'
                            })}
                          </span>
                          <span className="text-xs">
                            {new Date(log.created_at).toLocaleTimeString("id-ID", {
                              hour: '2-digit', minute: '2-digit'
                            })} WIB
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground text-sm truncate max-w-[140px]" title={log.id_pengguna || undefined}>
                              {log.nama_pengguna || "Superadmin"}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[140px]">
                              {log.id_pengguna?.split("-")[0]}...
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 border shadow-sm",
                            ACTION_COLORS[log.aksi] || ACTION_COLORS.default
                          )}
                        >
                          {ACTION_LABELS[log.aksi] || log.aksi}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground/80 capitalize">
                            {RESOURCE_LABELS[log.tipe_sumber_daya] || log.tipe_sumber_daya}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5 pr-6 min-w-[350px]">
                        <div className="bg-card/50 p-3 rounded-lg border border-border/40 hover:border-border/80 transition-colors">
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
                        <div className="p-4 bg-muted/50 rounded-full">
                          <ShieldAlert className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                        <p className="text-muted-foreground font-medium">
                          Belum ada entri log audit yang ditemukan
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t bg-muted/30">
              <p className="text-sm text-muted-foreground font-medium">
                Halaman {data.page} dari {data.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 shadow-sm hover:bg-background"
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
                  className="h-8 text-primary border-primary/20 hover:bg-primary/5 shadow-sm"
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
