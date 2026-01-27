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
import type { AttendanceReportData } from "../api/reportsApi";
import { UserCheck } from "lucide-react";

interface TabelLaporanKehadiranProps {
  data: AttendanceReportData[];
  isLoading?: boolean;
}

export function TabelLaporanKehadiran({
  data,
  isLoading,
}: TabelLaporanKehadiranProps) {
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
          <UserCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            Tidak ada data kehadiran
          </p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      hadir: "default",
      izin: "secondary",
      tidak_hadir: "destructive",
    };

    const labels: Record<string, string> = {
      hadir: "Hadir",
      izin: "Izin",
      tidak_hadir: "Tidak Hadir",
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
            <TableHead className="py-3 text-center">Total Sesi</TableHead>
            <TableHead className="py-3 text-center">Sesi Hadir</TableHead>
            <TableHead className="py-3">Persentase Kehadiran</TableHead>
            <TableHead className="py-3 pr-4">Status</TableHead>
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
                <div className="max-w-[250px] truncate text-sm">
                  {item.kursus_judul}
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="text-center font-bold text-sm">{item.total_sesi}</div>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="text-center font-bold text-sm">{item.sesi_hadir}</div>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="w-32 space-y-1">
                  <Progress value={item.persentase_kehadiran} className="h-1.5" />
                  <div className="text-[10px] text-muted-foreground font-medium">
                    {item.persentase_kehadiran}%
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-2.5 pr-4">{getStatusBadge(item.status_kehadiran)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
