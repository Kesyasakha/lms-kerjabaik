import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/komponen/ui/table";
import { Badge } from "@/komponen/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/komponen/ui/card";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type {
  AssessmentReportData,
  AssessmentStatistics,
} from "../api/reportsApi";
import { FileText, TrendingUp, TrendingDown, Users } from "lucide-react";

interface TabelLaporanAsesmenProps {
  data: AssessmentReportData[];
  statistics: AssessmentStatistics;
  isLoading?: boolean;
}

export function TabelLaporanAsesmen({
  data,
  statistics,
  isLoading,
}: TabelLaporanAsesmenProps) {
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
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            Tidak ada data penilaian
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
      lulus: "default",
      tidak_lulus: "destructive",
      pending: "secondary",
    };

    const labels: Record<string, string> = {
      lulus: "Lulus",
      tidak_lulus: "Tidak Lulus",
      pending: "Pending",
    };

    return (
      <Badge variant={variants[status] || "outline"}>{labels[status]}</Badge>
    );
  };

  const getJenisBadge = (jenis: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      kuis: "outline",
      ujian: "default",
      tugas: "secondary",
    };

    const labels: Record<string, string> = {
      kuis: "Kuis",
      ujian: "Ujian",
      tugas: "Tugas",
    };

    return (
      <Badge variant={variants[jenis] || "outline"}>
        {labels[jenis] || jenis}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nilai Rata-rata
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.rata_rata}</div>
            <p className="text-xs text-muted-foreground">
              Dari {statistics.total_peserta} peserta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nilai Tertinggi
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statistics.nilai_tertinggi}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nilai Terendah
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statistics.nilai_terendah}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tingkat Kelulusan
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.total_peserta > 0
                ? Math.round(
                  (statistics.lulus / statistics.total_peserta) * 100,
                )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {statistics.lulus} dari {statistics.total_peserta} lulus
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="py-3 px-4">Peserta</TableHead>
              <TableHead className="py-3">Kursus</TableHead>
              <TableHead className="py-3">Jenis</TableHead>
              <TableHead className="py-3">Asesmen</TableHead>
              <TableHead className="py-3">Nilai</TableHead>
              <TableHead className="py-3">Persentase</TableHead>
              <TableHead className="py-3">Status</TableHead>
              <TableHead className="py-3 pr-4">Tanggal</TableHead>
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
                  <div className="max-w-[150px] truncate text-sm">
                    {item.kursus_judul}
                  </div>
                </TableCell>
                <TableCell className="py-2.5">{getJenisBadge(item.jenis_asesmen)}</TableCell>
                <TableCell className="py-2.5">
                  <div className="max-w-[150px] truncate text-sm">
                    {item.judul_asesmen}
                  </div>
                </TableCell>
                <TableCell className="py-2.5">
                  <div className="font-bold text-sm">
                    {item.nilai} / {item.nilai_maksimal}
                  </div>
                </TableCell>
                <TableCell className="py-2.5">
                  <div
                    className={`font-bold text-sm ${item.persentase >= 70
                      ? "text-green-600"
                      : item.persentase >= 50
                        ? "text-yellow-600"
                        : "text-red-600"
                      }`}
                  >
                    {item.persentase}%
                  </div>
                </TableCell>
                <TableCell className="py-2.5">{getStatusBadge(item.status)}</TableCell>
                <TableCell className="py-2.5 pr-4 text-sm text-muted-foreground">
                  {format(new Date(item.tanggal_pengerjaan), "dd MMM yyyy", {
                    locale: localeId,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
