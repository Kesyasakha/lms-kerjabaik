import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/komponen/ui/card";
import { Button } from "@/komponen/ui/button";
import { Badge } from "@/komponen/ui/badge";
import { Skeleton } from "@/komponen/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/komponen/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/komponen/ui/table";
import {
  ArrowLeft,
  Users,
  BookOpen,
  TrendingUp,
  ClipboardList,
  Edit,
} from "lucide-react";
import { useInstructorCourseDetail } from "../hooks/useInstructorCourses";
import { useEnrolledStudents } from "../hooks/useStudentProgress";
import { useSubmissions } from "../hooks/useAssessments";
import { useCourseAnalytics } from "../hooks/useStudentProgress";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AnimatePresence, motion } from "framer-motion";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function InstructorCourseDetailPage() {
  const { id: kursusId } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: course, isLoading: courseLoading } = useInstructorCourseDetail(
    kursusId!,
  );
  const { data: students, isLoading: studentsLoading } = useEnrolledStudents(
    kursusId!,
    { limit: 100 },
  );
  const { data: submissions, isLoading: submissionsLoading } = useSubmissions({
    id_kursus: kursusId,
    limit: 100,
  });
  const { data: analytics, isLoading: analyticsLoading } = useCourseAnalytics(
    kursusId!,
  );

  if (courseLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-2xl font-bold">Kursus tidak ditemukan</h2>
        <Link to="/instruktur/courses">
          <Button className="mt-4">Kembali ke Kursus</Button>
        </Link>
      </div>
    );
  }

  const statusColors = {
    draft: "secondary",
    published: "default",
    archived: "outline",
  } as const;

  const statusLabels = {
    draft: "Draf",
    published: "Terbit",
    archived: "Diarsipkan",
  };

  const tabVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    exit: { y: -10, opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link
            to="/instruktur/courses"
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors mb-1"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Kembali
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
              {course.judul}
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant={statusColors[course.status]} className="text-[10px] px-2 py-0 h-5">
                {statusLabels[course.status]}
              </Badge>
              {course.kategori && (
                <Badge variant="outline" className="text-[10px] px-2 py-0 h-5">{course.kategori}</Badge>
              )}
            </div>
          </div>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{course.deskripsi}</p>
        </div>
        <Link to={`/instruktur/kursus/${kursusId}/edit`}>
          <Button size="sm" className="h-8 text-xs">
            <Edit className="mr-2 h-3 w-3" />
            Edit Konten
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-xs font-medium">Total Peserta</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold">
              {course.enrollment_stats.total_enrolled}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {course.enrollment_stats.active_students} aktif
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-xs font-medium">
              Tingkat Penyelesaian
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold">
              {course.enrollment_stats.completion_rate}%
            </div>
            <p className="text-[10px] text-muted-foreground">
              {course.enrollment_stats.completed_students} selesai
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-xs font-medium">Modul</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold">{course.module_count}</div>
            <p className="text-[10px] text-muted-foreground">Total modul</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-xs font-medium">Assignments</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold">{course.total_assignments}</div>
            <p className="text-[10px] text-muted-foreground">Total tugas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-9">
          <TabsTrigger value="overview" className="text-xs px-3">Ringkasan</TabsTrigger>
          <TabsTrigger value="students" className="text-xs px-3">
            Peserta ({course.enrollment_stats.total_enrolled})
          </TabsTrigger>
          <TabsTrigger value="submissions" className="text-xs px-3">
            Tugas ({submissions?.data.filter((s) => s.status === "pending").length || 0})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs px-3">Analisis</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <TabsContent value="overview" forceMount={true} className="mt-3 focus-visible:outline-none">
              <motion.div
                key="overview"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-3"
              >
                <Card className="border border-gray-200 dark:border-gray-800">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">Informasi Kursus</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Status
                        </p>
                        <p className="text-sm font-medium">{statusLabels[course.status]}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Kategori
                        </p>
                        <p className="text-sm font-medium">{course.kategori || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Total Modul
                        </p>
                        <p className="text-sm font-medium">{course.module_count}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Total Assignments
                        </p>
                        <p className="text-sm font-medium">{course.total_assignments}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 dark:border-gray-800">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">Statistik Pendaftaran</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Total Terdaftar</span>
                        <span className="text-sm font-medium">
                          {course.enrollment_stats.total_enrolled}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Siswa Aktif</span>
                        <span className="text-sm font-medium">
                          {course.enrollment_stats.active_students}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Siswa Selesai</span>
                        <span className="text-sm font-medium">
                          {course.enrollment_stats.completed_students}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Tingkat Penyelesaian</span>
                        <span className="text-sm font-medium">
                          {course.enrollment_stats.completion_rate}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          )}

          {activeTab === "students" && (
            <TabsContent value="students" forceMount={true} className="mt-3 focus-visible:outline-none">
              <motion.div
                key="students"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Card className="border border-gray-200 dark:border-gray-800">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">Daftar Peserta</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {studentsLoading ? (
                      <div className="space-y-3 p-4">
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-10 w-full" />
                        ))}
                      </div>
                    ) : students && students.data.length > 0 ? (
                      <div className="rounded-md border-t border-gray-100 dark:border-gray-800">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="h-9 text-xs">Nama</TableHead>
                              <TableHead className="h-9 text-xs">Email</TableHead>
                              <TableHead className="h-9 text-xs">Progress</TableHead>
                              <TableHead className="h-9 text-xs">Score</TableHead>
                              <TableHead className="h-9 text-xs">Status</TableHead>
                              <TableHead className="h-9 text-xs">Aktivitas</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {students.data.map((student) => (
                              <TableRow key={student.id} className="h-10">
                                <TableCell className="py-2 text-sm font-medium">
                                  {student.student_name}
                                </TableCell>
                                <TableCell className="py-2 text-xs text-muted-foreground">
                                  {student.student_email}
                                </TableCell>
                                <TableCell className="py-2">
                                  <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-16 rounded-full bg-muted">
                                      <div
                                        className="h-1.5 rounded-full bg-primary"
                                        style={{
                                          width: `${student.progress_percentage}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs">
                                      {student.progress_percentage}%
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-2 text-xs">
                                  {student.avg_score !== null
                                    ? student.avg_score
                                    : "-"}
                                </TableCell>
                                <TableCell className="py-2">
                                  <Badge
                                    variant={
                                      student.status === "completed"
                                        ? "default"
                                        : student.status === "active"
                                          ? "secondary"
                                          : "outline"
                                    }
                                    className="text-[10px] px-1.5 py-0 h-5"
                                  >
                                    {student.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-2 text-xs text-muted-foreground">
                                  {student.last_activity
                                    ? formatDistanceToNow(
                                      new Date(student.last_activity),
                                      {
                                        addSuffix: true,
                                        locale: idLocale,
                                      },
                                    )
                                    : "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        Belum ada peserta terdaftar
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          )}

          {activeTab === "submissions" && (
            <TabsContent value="submissions" forceMount={true} className="mt-3 focus-visible:outline-none">
              <motion.div
                key="submissions"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Card className="border border-gray-200 dark:border-gray-800">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">Pengumpulan Tugas Terbaru</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {submissionsLoading ? (
                      <div className="space-y-3 p-4">
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-10 w-full" />
                        ))}
                      </div>
                    ) : submissions && submissions.data.length > 0 ? (
                      <div className="rounded-md border-t border-gray-100 dark:border-gray-800">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="h-9 text-xs">Siswa</TableHead>
                              <TableHead className="h-9 text-xs">Tugas</TableHead>
                              <TableHead className="h-9 text-xs">Diserahkan</TableHead>
                              <TableHead className="h-9 text-xs">Status</TableHead>
                              <TableHead className="h-9 text-xs">Nilai</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {submissions.data.slice(0, 10).map((submission) => (
                              <TableRow key={submission.id} className="h-10">
                                <TableCell className="py-2 text-sm font-medium">
                                  {submission.student_name}
                                </TableCell>
                                <TableCell className="py-2 text-xs">{submission.assignment_title}</TableCell>
                                <TableCell className="py-2 text-xs text-muted-foreground">
                                  {formatDistanceToNow(
                                    new Date(submission.submitted_at),
                                    {
                                      addSuffix: true,
                                      locale: idLocale,
                                    },
                                  )}
                                </TableCell>
                                <TableCell className="py-2">
                                  <Badge
                                    variant={
                                      submission.status === "graded"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="text-[10px] px-1.5 py-0 h-5"
                                  >
                                    {submission.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-2 text-xs">
                                  {submission.grade !== null ? submission.grade : "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        Belum ada pengumpulan tugas
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          )}

          {activeTab === "analytics" && (
            <TabsContent value="analytics" forceMount={true} className="mt-3 focus-visible:outline-none">
              <motion.div
                key="analytics"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-3"
              >
                {analyticsLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : analytics ? (
                  <>
                    <div className="grid gap-3 md:grid-cols-2">
                      {/* Module Completion Chart */}
                      <Card className="border border-gray-200 dark:border-gray-800">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Penyelesaian Modul</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={analytics.module_completion}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis
                                dataKey="module_title"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                tick={{ fontSize: 10 }}
                                interval={0}
                              />
                              <YAxis tick={{ fontSize: 10 }} />
                              <Tooltip contentStyle={{ fontSize: '12px' }} />
                              <Bar dataKey="completion_rate" fill="#8884d8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Grade Distribution Chart */}
                      <Card className="border border-gray-200 dark:border-gray-800">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Distribusi Nilai</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie
                                data={analytics.grade_distribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="count"
                              >
                                {analytics.grade_distribution.map((_, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ fontSize: '12px' }} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="flex flex-wrap justify-center gap-2 mt-2">
                            {analytics.grade_distribution.map((entry, index) => (
                              <div key={index} className="flex items-center gap-1 text-[10px]">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span>{entry.range}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="border border-gray-200 dark:border-gray-800">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">Statistik Kursus</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="flex flex-col">
                            <p className="text-xs text-muted-foreground">
                              Rata-rata Nilai
                            </p>
                            <p className="text-xl font-bold">
                              {analytics.avg_score}
                            </p>
                          </div>
                          <div className="flex flex-col">
                            <p className="text-xs text-muted-foreground">
                              Tugas Pending
                            </p>
                            <p className="text-xl font-bold">
                              {analytics.pending_submissions}
                            </p>
                          </div>
                          <div className="flex flex-col">
                            <p className="text-xs text-muted-foreground">
                              Siswa Aktif
                            </p>
                            <p className="text-xl font-bold">
                              {analytics.active_students}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Data analytics tidak tersedia
                  </div>
                )}
              </motion.div>
            </TabsContent>
          )}
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
