import type { TenantWithStats } from "../tipe/tenant.types";
import { Badge } from "@/komponen/ui/badge";
import { Button } from "@/komponen/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/komponen/ui/table";
import { formatTanggal, cn } from "@/pustaka/utils";
import { Edit, Trash2, Eye, MoreVertical, Users, BookOpen, Calendar, Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/komponen/ui/dropdown-menu";

interface TenantTableProps {
  tenants: TenantWithStats[];
  isLoading?: boolean;
  onEdit: (tenant: TenantWithStats) => void;
  onDelete: (tenant: TenantWithStats) => void;
  onViewDetail: (tenant: TenantWithStats) => void;
}

const statusColors = {
  aktif:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
  nonaktif:
    "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400 border-slate-200 dark:border-slate-800",
  suspended:
    "bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200 dark:border-rose-900",
};

const tipeColors: Record<string, string> = {
  provinsi: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-800",
  bkd: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/10 dark:text-purple-400 dark:border-purple-800",
  kampus: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/10 dark:text-indigo-400 dark:border-indigo-800",
  korporasi: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-800",
};

export function TenantTable({
  tenants,
  isLoading,
  onEdit,
  onDelete,
  onViewDetail,
}: TenantTableProps) {
  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[300px]">Organisasi</TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Statistik</TableHead>
            <TableHead>Terdaftar</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              </TableCell>
              <TableCell><div className="h-6 bg-muted animate-pulse rounded w-20" /></TableCell>
              <TableCell><div className="h-6 bg-muted animate-pulse rounded w-16" /></TableCell>
              <TableCell><div className="h-6 bg-muted animate-pulse rounded w-24" /></TableCell>
              <TableCell><div className="h-6 bg-muted animate-pulse rounded w-24" /></TableCell>
              <TableCell className="text-right"><div className="h-8 w-8 ml-auto bg-muted animate-pulse rounded-full" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className="p-20 text-center bg-card rounded-lg border border-dashed flex flex-col items-center gap-3">
        <Building2 className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-muted-foreground font-medium">
          Belum ada tenant yang terdaftar dalam sistem
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/30 hover:bg-muted/30 border-b">
          <TableHead className="w-[380px] font-semibold text-foreground py-3">Organisasi / Lembaga</TableHead>
          <TableHead className="font-semibold text-foreground py-3">Tipe</TableHead>
          <TableHead className="font-semibold text-foreground py-3">Status</TableHead>
          <TableHead className="font-semibold text-foreground text-center py-3">Pengguna</TableHead>
          <TableHead className="font-semibold text-foreground text-center py-3">Kursus</TableHead>
          <TableHead className="font-semibold text-foreground py-3">Tgl Terdaftar</TableHead>
          <TableHead className="text-right font-semibold text-foreground py-3 pr-6">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tenants.map((tenant) => (
          <TableRow key={tenant.id} className="group transition-all hover:bg-muted/20 border-b last:border-0">
            <TableCell className="py-2.5">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors cursor-pointer" onClick={() => onViewDetail(tenant)}>
                  {tenant.nama}
                </span>
                <span className="text-xs text-muted-foreground font-medium">/{tenant.slug}</span>
              </div>
            </TableCell>
            <TableCell className="py-4">
              <Badge
                variant="outline"
                className={cn("font-semibold capitalize px-2.5 py-1 text-[11px] tracking-wide", tipeColors[tenant.tipe.toLowerCase()] || "bg-secondary/50")}
              >
                {tenant.tipe}
              </Badge>
            </TableCell>
            <TableCell className="py-2.5">
              <Badge
                variant="outline"
                className={cn("font-bold rounded-full px-3 py-1 text-[11px] tracking-wide border shadow-sm", statusColors[tenant.status])}
              >
                {tenant.status === 'suspended' ? 'Ditangguhkan' : tenant.status === 'nonaktif' ? 'Non-Aktif' : 'Aktif'}
              </Badge>
            </TableCell>
            <TableCell className="text-center py-2.5">
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center justify-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
                  <Users className="w-4 h-4" />
                  <span>{tenant.user_count || 0}</span>
                </div>

              </div>
            </TableCell>
            <TableCell className="text-center py-2.5">
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center justify-center gap-1.5 font-bold text-purple-600 dark:text-purple-400">
                  <BookOpen className="w-4 h-4" />
                  <span>{tenant.course_count || 0}</span>
                </div>

              </div>
            </TableCell>
            <TableCell className="py-2.5">
              <div className="flex items-center gap-2 text-sm text-foreground/80 font-medium">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                {formatTanggal(tenant.created_at, "short")}
              </div>
            </TableCell>
            <TableCell className="text-right py-2.5 pr-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-background shadow-none border border-transparent hover:border-muted-foreground/10 transition-all">
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px] p-2">
                  <DropdownMenuItem onClick={() => onViewDetail(tenant)} className="cursor-pointer rounded-md py-2.5 px-3 focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:text-blue-700 dark:focus:text-blue-400">
                    <Eye className="w-4 h-4 mr-3 text-blue-600" />
                    <span className="font-medium text-sm">Lihat Detail</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(tenant)} className="cursor-pointer rounded-md py-2.5 px-3 focus:bg-amber-50 dark:focus:bg-amber-900/20 focus:text-amber-700 dark:focus:text-amber-400">
                    <Edit className="w-4 h-4 mr-3 text-amber-600" />
                    <span className="font-medium text-sm">Ubah Data</span>
                  </DropdownMenuItem>
                  <div className="h-px bg-muted my-2" />
                  <DropdownMenuItem
                    onClick={() => onDelete(tenant)}
                    className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20 focus:text-red-700 dark:focus:text-red-300 cursor-pointer rounded-md py-2.5 px-3"
                  >
                    <Trash2 className="w-4 h-4 mr-3" />
                    <span className="font-bold text-sm">Hapus Tenant</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>

  );
}
