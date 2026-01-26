import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/komponen/ui/card";
import type { ProgressReportData } from "../api/reportsApi";

interface ProgressChartProps {
  data: ProgressReportData[];
}

export function ProgressChart({ data }: ProgressChartProps) {
  const chartData = data.reduce((acc, item) => {
    const existing = acc.find((x) => x.kursus === item.kursus_judul);
    if (existing) {
      existing.total_progress += item.persentase_kemajuan;
      existing.count += 1;
    } else {
      acc.push({
        kursus: item.kursus_judul,
        total_progress: item.persentase_kemajuan,
        count: 1,
      });
    }
    return acc;
  },
    [] as { kursus: string; total_progress: number; count: number }[],
  );

  const finalData = chartData.map((item) => ({
    kursus:
      item.kursus.length > 20
        ? item.kursus.substring(0, 20) + "..."
        : item.kursus,
    progress: Math.round(item.total_progress / item.count),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Progress Rata-rata per Kursus
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={finalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="kursus" angle={-45} textAnchor="end" height={100} />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="progress" fill="#3b82f6" name="Progress (%)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
