import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/komponen/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/komponen/ui/card";
import { Badge } from "@/komponen/ui/badge";
import { Skeleton } from "@/komponen/ui/skeleton";
import { Avatar, AvatarFallback } from "@/komponen/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/komponen/ui/tabs";
import { CheckCircle2, Circle, Activity } from "lucide-react";
import { useStudentProgress } from "../hooks/useStudentProgress";
import { formatDistanceToNow, format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

interface StudentDetailDialogProps {
  kursusId: string;
  studentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentDetailDialog({
  kursusId,
  studentId,
  open,
  onOpenChange,
}: StudentDetailDialogProps) {
  const { data: progress, isLoading } = useStudentProgress(kursusId, studentId);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Progres Peserta</DialogTitle>
          <DialogDescription>
            Pantau detail progres dan nilai peserta
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        ) : progress ? (
          <div className="space-y-6">
            {/* Student Info */}
            <div className="flex items-start gap-4 rounded-lg border p-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {getInitials(progress.student_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  {progress.student_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {progress.student_email}
                </p>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Terdaftar sejak{" "}
                    {format(new Date(progress.enrollment_date), "dd MMM yyyy", {
                      locale: idLocale,
                    })}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {progress.progress_percentage}%
                </div>
                <p className="text-sm text-muted-foreground">Progres</p>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="modules">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="modules">Progres Modul</TabsTrigger>
                <TabsTrigger value="grades">Nilai</TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                {/* Modules Tab */}
                <TabsContent value="modules" className="mt-4 outline-none">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="space-y-3"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Progres Modul</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {progress.module_progress.length > 0 ? (
                          <div className="space-y-3">
                            {progress.module_progress.map((module) => (
                              <div
                                key={module.module_id}
                                className="flex items-center justify-between gap-3 rounded-lg border p-3"
                              >
                                <div className="flex items-center gap-3">
                                  {module.completed ? (
                                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                                  ) : (
                                    <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                                  )}
                                  <div className="flex-1">
                                    <p className="font-medium">{module.module_title}</p>
                                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                                      {/* Simple Status Info */}
                                      <span>
                                        {module.completed ? "Selesai" : "Belum Selesai"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {module.completed && (
                                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">Selesai</Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-8 text-center text-muted-foreground text-sm">
                            <Circle className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                            <p>Belum ada data modul tersedia</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* Grades Tab */}
                <TabsContent value="grades" className="mt-4 outline-none">
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="space-y-3"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Nilai Assignment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {progress.grades.length > 0 ? (
                          <div className="space-y-3">
                            {progress.grades.map((grade) => (
                              <div
                                key={grade.assignment_id}
                                className="flex items-center justify-between rounded-lg border p-3"
                              >
                                <div className="flex-1">
                                  <p className="font-medium">
                                    {grade.assignment_title}
                                  </p>
                                  <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                                    <Badge
                                      variant={
                                        grade.status === "graded"
                                          ? "default"
                                          : grade.status === "pending"
                                            ? "secondary"
                                            : "outline"
                                      }
                                    >
                                      {grade.status === "graded"
                                        ? "Dinilai"
                                        : grade.status === "pending"
                                          ? "Menunggu"
                                          : "Belum Dikumpulkan"}
                                    </Badge>
                                    {grade.submitted_at && (
                                      <span>
                                        Dikumpulkan{" "}
                                        {formatDistanceToNow(
                                          new Date(grade.submitted_at),
                                          {
                                            addSuffix: true,
                                            locale: idLocale,
                                          },
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  {grade.grade !== null ? (
                                    <div>
                                      <span
                                        className={`text-2xl font-bold ${grade.grade >= 75
                                          ? "text-green-600"
                                          : grade.grade >= 60
                                            ? "text-yellow-600"
                                            : "text-red-600"
                                          }`}
                                      >
                                        {grade.grade}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        /{grade.max_score}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-8 text-center text-muted-foreground text-sm">
                            <Activity className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                            <p>Belum ada data nilai asesmen</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Data tidak ditemukan
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
