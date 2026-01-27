import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/komponen/ui/table";
import { Badge } from "@/komponen/ui/badge";
import { Progress } from "@/komponen/ui/progress";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type { ProgressReportData } from "../api/reportsApi";
import { Clock, BookOpen } from "lucide-react";

interface TabelLaporanKemajuanProps {
  data: ProgressReportData[];
  isLoading?: boolean;
}

export function TabelLaporanKemajuan({
  data,
  isLoading,
}: TabelLaporanKemajuanProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-muted-foreground">Memuat data...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            Tidak ada data laporan
          </p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      not_started: "outline",
      in_progress: "secondary",
      completed: "default",
    };

    const labels: Record<string, string> = {
      not_started: "Belum Mulai",
      in_progress: "Sedang Berjalan",
      completed: "Selesai",
    };

    return (
      <Badge variant={variants[status] || "outline"}>{labels[status]}</Badge>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="py-3 px-4">Peserta</TableHead>
            <TableHead className="py-3">Kursus</TableHead>
            <TableHead className="py-3">Kategori</TableHead>
            <TableHead className="py-3">Progress</TableHead>
            <TableHead className="py-3">Modul</TableHead>
            <TableHead className="py-3">Waktu Belajar</TableHead>
            <TableHead className="py-3">Status</TableHead>
            <TableHead className="py-3 pr-4">Tanggal Mulai</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/5 transition-colors">
              <TableCell className="py-2.5 px-4">
                <div>
                  <div className="font-bold text-sm text-foreground">{item.peserta_nama}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {item.peserta_email}
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="max-w-[200px] truncate text-sm">
                  {item.kursus_judul}
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <Badge variant="outline" className="text-[10px] font-bold">{item.kursus_kategori}</Badge>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="w-24 space-y-1">
                  <Progress value={item.persentase_kemajuan} className="h-1.5" />
                  <div className="text-[10px] text-muted-foreground font-medium">
                    {item.persentase_kemajuan}%
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="text-sm font-medium">
                  {item.modul_selesai} / {item.total_modul}
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  {Math.floor(item.waktu_belajar_menit / 60)}j{" "}
                  {item.waktu_belajar_menit % 60}m
                </div>
              </TableCell>
              <TableCell className="py-2.5">{getStatusBadge(item.status)}</TableCell>
              <TableCell className="py-2.5 pr-4 text-sm text-muted-foreground">
                {item.tanggal_mulai
                  ? format(new Date(item.tanggal_mulai), "dd MMM yyyy", {
                    locale: localeId,
                  })
                  : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
