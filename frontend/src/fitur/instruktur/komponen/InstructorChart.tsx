
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/komponen/ui/card";
import { BarChart3 } from "lucide-react";

interface InstructorChartProps {
    data: any[];
}

export function InstructorChart({ data }: InstructorChartProps) {
    // Transform data for chart
    const chartData = data.map((course) => ({
        name: course.judul.length > 20 ? course.judul.substring(0, 20) + "..." : course.judul,
        fullTitle: course.judul,
        students: course.total_students,
        completion: course.completion_rate
    }));

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-zinc-900 border border-border p-3 rounded-lg shadow-lg">
                    <p className="font-bold text-sm mb-2">{payload[0].payload.fullTitle}</p>
                    <div className="space-y-1">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            Total Siswa: {payload[0].value}
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="col-span-1 shadow-sm border border-gray-200 dark:border-gray-800">
            <CardHeader className="bg-muted/30 border-b py-4">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <div>
                        <CardTitle className="text-lg font-bold text-foreground">
                            Statistik Peserta
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                            Jumlah siswa aktif per kursus
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 10, fill: '#6B7280' }}
                                axisLine={false}
                                tickLine={false}
                                interval={0}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: '#6B7280' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            <Bar
                                dataKey="students"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                                animationDuration={2000}
                            >
                                {chartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#3b82f6" : "#60a5fa"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
