import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/komponen/ui/dialog";
import { Button } from "@/komponen/ui/button";
import { Input } from "@/komponen/ui/input";
import { Label } from "@/komponen/ui/label";
import { Textarea } from "@/komponen/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/komponen/ui/select";
import { Badge } from "@/komponen/ui/badge";
import { Skeleton } from "@/komponen/ui/skeleton";
import { Avatar, AvatarFallback } from "@/komponen/ui/avatar";
import { FileText, Download, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useSubmissionDetail } from "../hooks/useAssessments";
import { useGradeSubmission } from "../hooks/useAssessments";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { pemberitahuan } from "@/pustaka/pemberitahuan";

interface GradingDialogProps {
  submissionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GradingDialog({
  submissionId,
  open,
  onOpenChange,
}: GradingDialogProps) {
  const { data: submission, isLoading } = useSubmissionDetail(submissionId);
  const gradeSubmissionMutation = useGradeSubmission();

  const [grade, setGrade] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [status, setStatus] = useState<
    "graded" | "rejected" | "revision_requested"
  >("graded");

  // Initialize form when submission loads
  useEffect(() => {
    if (submission) {
      setGrade(submission.grade?.toString() || "");
      setFeedback(submission.feedback || "");
      if (submission.status !== "pending") {
        setStatus(submission.status as any);
      }
    }
  }, [submission]);

  const handleSubmit = async () => {
    if (!submission) return;

    const gradeValue = parseFloat(grade);

    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 100) {
      pemberitahuan.gagal("Nilai harus antara 0-100");
      return;
    }

    try {
      pemberitahuan.tampilkanPemuatan("Menyimpan penilaian...");
      await gradeSubmissionMutation.mutateAsync({
        submissionId,
        gradeData: {
          grade: gradeValue,
          feedback: feedback.trim() || undefined,
          status,
        },
      });

      pemberitahuan.sukses(`Nilai ${submission.student_name} berhasil disimpan`);
      pemberitahuan.hilangkanPemuatan();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      pemberitahuan.hilangkanPemuatan();
      pemberitahuan.gagal("Gagal menyimpan nilai");
    }
  };

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-lg">Penilaian Tugas</DialogTitle>
          <DialogDescription className="text-xs">
            Berikan nilai dan feedback untuk peserta
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : submission ? (
            <div className="space-y-4">
              {/* Student Info */}
              <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/20">
                <Avatar className="h-10 w-10 border-2 border-background">
                  <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                    {getInitials(submission.student_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm truncate">{submission.student_name}</h3>
                    <Badge
                      variant={
                        submission.status === "pending"
                          ? "secondary"
                          : submission.status === "graded"
                            ? "default"
                            : "destructive"
                      }
                      className="text-[10px] h-5 px-1.5"
                    >
                      {submission.status === "pending" ? "Menunggu" :
                        submission.status === "graded" ? "Dinilai" :
                          submission.status === "rejected" ? "Ditolak" : "Revisi"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-muted-foreground truncate">
                      {submission.student_email}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(submission.submitted_at), {
                        addSuffix: true,
                        locale: idLocale,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assignment Info */}
              <div className="grid gap-2 border rounded-lg p-3">
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tugas</Label>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      Min. Lulus: {submission.assignment_max_score}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm mt-1">{submission.assignment_title}</h4>
                </div>

                {/* File / Content */}
                <div className="mt-1">
                  {submission.url_berkas ? (
                    <div className="flex items-center gap-2 p-2 rounded border bg-background">
                      <FileText className="h-4 w-4 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {submission.url_berkas.split("/").pop() || "berkas_tugas"}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="h-6 text-[10px]" asChild>
                        <a
                          href={submission.url_berkas}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="mr-1 h-3 w-3" />
                          Unduh
                        </a>
                      </Button>
                    </div>
                  ) : submission.text_content ? (
                    <div className="rounded border p-2 bg-background max-h-32 overflow-y-auto">
                      <p className="whitespace-pre-wrap text-xs text-muted-foreground">
                        {submission.text_content}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Tidak ada lampiran.</p>
                  )}
                </div>
              </div>

              {/* Grading Form */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-sm">Form Penilaian</h4>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="grade" className="text-xs">
                      Nilai (0-100)
                    </Label>
                    <Input
                      id="grade"
                      type="number"
                      min="0"
                      max="100"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="0"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="status" className="text-xs">Status Penilaian</Label>
                    <Select
                      value={status}
                      onValueChange={(value: any) => setStatus(value)}
                    >
                      <SelectTrigger id="status" className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="graded" className="text-xs">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            Dinilai
                          </div>
                        </SelectItem>
                        <SelectItem value="revision_requested" className="text-xs">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-orange-500" />
                            Minta Revisi
                          </div>
                        </SelectItem>
                        <SelectItem value="rejected" className="text-xs">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-3 w-3 text-red-500" />
                            Ditolak
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="feedback" className="text-xs">Feedback Instruktur</Label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Berikan catatan, saran, atau alasan penolakan..."
                    rows={3}
                    className="text-xs resize-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground text-sm">
              Submission tidak ditemukan
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t bg-muted/10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={gradeSubmissionMutation.isPending}
            className="h-8 text-xs"
          >
            Batal
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!submission || gradeSubmissionMutation.isPending}
            className="h-8 text-xs"
          >
            {gradeSubmissionMutation.isPending
              ? "Menyimpan..."
              : "Simpan Penilaian"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
