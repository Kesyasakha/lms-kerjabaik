import { useTenantAnalytics } from "../hooks/useAnalytics";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/komponen/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/komponen/ui/table";
import { Building2, Users, BookOpen, TrendingUp, BarChart3 } from "lucide-react";
import { Badge } from "@/komponen/ui/badge";

export function AnalyticsPage() {
  const { data: analytics, isLoading } = useTenantAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Memuat data analitik...
          </p>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totals = analytics?.reduce(
    (acc, tenant) => ({
      tenants: acc.tenants + 1,
      users: acc.users + tenant.user_count,
      courses: acc.courses + tenant.course_count,
      enrollments: acc.enrollments + tenant.enrollment_count,
    }),
    { tenants: 0, users: 0, courses: 0, enrollments: 0 },
  ) || { tenants: 0, users: 0, courses: 0, enrollments: 0 };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Analitik & Wawasan</h1>
        <p className="text-muted-foreground text-xs">
          Pantau performa platform, pertumbuhan tenant, dan aktivitas pengguna secara real-time.
        </p>
      </div>

      {/* Platform Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden transition-all hover:shadow-md border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Tenant</CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
              <Building2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{totals.tenants}</div>
            <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase">Entitas terdaftar</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all hover:shadow-md border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Pengguna</CardTitle>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{totals.users}</div>
            <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase">Akun platform</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all hover:shadow-md border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Kursus</CardTitle>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{totals.courses}</div>
            <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase">Modul pembelajaran</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all hover:shadow-md border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pendaftaran</CardTitle>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{totals.enrollments}</div>
            <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase">Total partisipasi</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Performers by Users */}
        <Card className="shadow-sm border-border/60 overflow-hidden">
          <CardHeader className="bg-muted/30 border-b py-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">5 Tenant Teratas (Pengguna)</CardTitle>
                <CardDescription className="text-xs">
                  Lembaga dengan basis pengguna terbanyak.
                </CardDescription>
              </div>
              <div className="p-2 bg-primary/5 rounded-full">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {analytics
                ?.sort((a, b) => b.user_count - a.user_count)
                .slice(0, 5)
                .map((tenant, index) => (
                  <div key={tenant.id_lembaga} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                        {index + 1}
                      </div>
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {tenant.tenant_name}
                      </span>
                    </div>
                    <Badge variant="outline" className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20">
                      {tenant.user_count}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers by Courses */}
        <Card className="shadow-sm border-border/60 overflow-hidden">
          <CardHeader className="bg-muted/30 border-b py-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold font-bold">5 Tenant Teratas (Kursus)</CardTitle>
                <CardDescription className="text-xs">
                  Lembaga paling produktif dalam pembuatan kursus.
                </CardDescription>
              </div>
              <div className="p-2 bg-primary/5 rounded-full">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {analytics
                ?.sort((a, b) => b.course_count - a.course_count)
                .slice(0, 5)
                .map((tenant, index) => (
                  <div key={tenant.id_lembaga} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-sm font-bold text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900">
                        {index + 1}
                      </div>
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {tenant.tenant_name}
                      </span>
                    </div>
                    <Badge variant="outline" className="font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20">
                      {tenant.course_count}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Full Table */}
        <Card className="lg:col-span-2 shadow-sm border-border/60 overflow-hidden">
          <CardHeader className="bg-muted/30 border-b py-4">
            <CardTitle className="text-lg font-bold">Detail Statistik Per Tenant</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20 border-b">
                  <TableHead className="font-bold text-foreground py-3 px-6">Nama Tenant</TableHead>
                  <TableHead className="font-bold text-foreground py-3 text-center">Pengguna</TableHead>
                  <TableHead className="font-bold text-foreground py-3 text-center">Kursus</TableHead>
                  <TableHead className="font-bold text-foreground py-3 text-center">Pendaftaran</TableHead>
                  <TableHead className="font-bold text-foreground py-3 text-center">Aktif (30hr)</TableHead>
                  <TableHead className="font-bold text-foreground py-3 text-center">Rasio Daftar/Kursus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics?.map((tenant) => (
                  <TableRow key={tenant.id_lembaga} className="group hover:bg-muted/10 transition-colors border-b last:border-0">
                    <TableCell className="py-2.5 px-6">
                      <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {tenant.tenant_name}
                      </span>
                    </TableCell>
                    <TableCell className="text-center py-2.5 font-medium text-sm">{tenant.user_count}</TableCell>
                    <TableCell className="text-center py-2.5 font-medium text-sm">{tenant.course_count}</TableCell>
                    <TableCell className="text-center py-2.5 font-medium text-sm">{tenant.enrollment_count}</TableCell>
                    <TableCell className="text-center py-2.5 font-medium text-sm text-green-600">{tenant.active_users_30d}</TableCell>
                    <TableCell className="text-center py-2.5">
                      <Badge variant="secondary" className="font-bold">
                        {tenant.course_count > 0 ? (tenant.enrollment_count / tenant.course_count).toFixed(1) : "0"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
