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
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type { EngagementReportData } from "../api/reportsApi";
import { Activity, Clock, MessageSquare } from "lucide-react";

interface TabelLaporanKeterlibatanProps {
  data: EngagementReportData[];
  isLoading?: boolean;
}

export function TabelLaporanKeterlibatan({
  data,
  isLoading,
}: TabelLaporanKeterlibatanProps) {
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
          <Activity className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            Tidak ada data keterlibatan
          </p>
        </div>
      </div>
    );
  }

  const getEngagementBadge = (score: number) => {
    if (score >= 80) {
      return <Badge className="bg-green-600">Sangat Aktif</Badge>;
    } else if (score >= 60) {
      return <Badge className="bg-blue-600">Aktif</Badge>;
    } else if (score >= 40) {
      return <Badge variant="secondary">Cukup Aktif</Badge>;
    } else {
      return <Badge variant="outline">Kurang Aktif</Badge>;
    }
  };

  const formatWaktu = (menit: number) => {
    const jam = Math.floor(menit / 60);
    const sisaMenit = menit % 60;
    return `${jam}j ${sisaMenit}m`;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="py-3 px-4">Peserta</TableHead>
            <TableHead className="py-3">Kursus</TableHead>
            <TableHead className="py-3">Waktu Belajar</TableHead>
            <TableHead className="py-3 text-center">Login</TableHead>
            <TableHead className="py-3">Interaksi</TableHead>
            <TableHead className="py-3">Engagement Score</TableHead>
            <TableHead className="py-3 pr-4">Aktivitas Terakhir</TableHead>
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
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  {formatWaktu(item.total_waktu_belajar_menit)}
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="text-center font-bold text-sm">
                  {item.jumlah_login}x
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[10px] font-bold">
                    <MessageSquare className="h-3 w-3 text-blue-600" />
                    <span>{item.interaksi_forum}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold">
                    <MessageSquare className="h-3 w-3 text-green-600" />
                    <span>{item.interaksi_diskusi}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="w-32 space-y-1">
                  <div className="flex items-center justify-between">
                    <Progress
                      value={item.engagement_score}
                      className="h-1.5 flex-1"
                    />
                    <span className="ml-2 text-[10px] font-bold">
                      {item.engagement_score}
                    </span>
                  </div>
                  {getEngagementBadge(item.engagement_score)}
                </div>
              </TableCell>
              <TableCell className="py-2.5 pr-4">
                <div className="text-[10px] text-muted-foreground font-medium">
                  {formatDistanceToNow(new Date(item.aktivitas_terakhir), {
                    addSuffix: true,
                    locale: localeId,
                  })}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
