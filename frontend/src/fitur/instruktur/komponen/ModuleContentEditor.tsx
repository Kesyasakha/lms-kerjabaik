import { useState } from "react";
import { pemberitahuan } from "@/pustaka/pemberitahuan";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  FileText,
  Video,
  File,
  MoreVertical,
  GripVertical,
  Trash2,
  Edit2,
  Loader2,
  HelpCircle,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/komponen/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/komponen/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/komponen/ui/dialog";
import { Input } from "@/komponen/ui/input";
import { Label } from "@/komponen/ui/label";

import TextEditor from "@/komponen/ui/TextEditor";
import {
  useContents,
  useCreateContent,
  useUpdateContent,
  useDeleteContent,
  useReorderContents,
} from "../hooks/useContent";
import {
  useModuleAssessments,
  useUpdateAssessment,
  useDeleteAssessment,
} from "../hooks/useAssessments";
import type {
  Content,
  CreateContentData,
  ContentType,
} from "../api/contentApi";
import type { Assessment } from "../tipe/instructor.types";
import { AssessmentEditorDialog } from "./AssessmentEditorDialog";
import { QuizBuilder } from "./QuizBuilder";
import { AssignmentBuilder } from "./AssignmentBuilder";

// --- Sub-components for Content Items ---

interface SortableContentItemProps {
  content: Content;
  onEdit: (content: Content) => void;
  onDelete: (content: Content) => void;
}

function SortableContentItem({
  content,
  onEdit,
  onDelete,
}: SortableContentItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: content.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = () => {
    switch (content.tipe) {
      case "text":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "video":
        return <Video className="h-4 w-4 text-red-500" />;
      case "file":
        return <File className="h-4 w-4 text-yellow-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex items-center gap-2 rounded-lg border bg-card p-2 shadow-sm transition-colors hover:bg-accent/50"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="flex items-center justify-center p-1.5 rounded-md bg-muted">
        <Icon />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{content.judul}</h4>
        <p className="text-[10px] text-muted-foreground capitalize">
          {content.tipe}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(content)}>
            <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(content)}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// --- Assessment Item ---

interface AssessmentItemProps {
  assessment: Assessment;
  onEdit: (assessment: Assessment) => void;
  onBuilder: (assessment: Assessment) => void;
  onDelete: (assessment: Assessment) => void;
  onPublish: (assessment: Assessment) => void;
}

function AssessmentItem({
  assessment,
  onEdit,
  onBuilder,
  onDelete,
  onPublish,
}: AssessmentItemProps) {
  const Icon = () => {
    switch (assessment.tipe) {
      case "kuis":
        return <HelpCircle className="h-4 w-4 text-purple-500" />;
      case "tugas":
        return <ClipboardList className="h-4 w-4 text-green-500" />;
      case "ujian":
        return <CheckCircle2 className="h-4 w-4 text-orange-500" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="group relative flex items-center gap-2 rounded-lg border bg-card p-2 shadow-sm transition-colors hover:bg-accent/50">
      {/* Assesmen belum support reorder antar tabel di MVP ini */}
      <div className="text-muted-foreground/20">
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="flex items-center justify-center p-1.5 rounded-md bg-muted">
        <Icon />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{assessment.judul}</h4>
        <div className="flex items-center gap-2">
          <p className="text-[10px] text-muted-foreground capitalize">
            {assessment.tipe === "kuis" ? "Kuis Otomatis" : "Tugas Mandiri"}
          </p>
          <span className="text-[10px] px-1.5 py-0 rounded-full bg-muted border font-medium uppercase">
            {assessment.status}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[10px]"
          onClick={() => onBuilder(assessment)}
        >
          {assessment.tipe === "tugas" ? "Edit Instruksi" : "Susun Soal"}
        </Button>

        {assessment.status === "draft" && (
          <Button
            variant="default"
            size="sm"
            className="h-7 text-[10px] bg-green-600 hover:bg-green-700 text-white"
            onClick={() => onPublish(assessment)}
          >
            <CheckCircle2 className="mr-1 h-3 w-3" /> Publikasikan
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(assessment)}>
              <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit Pengaturan
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(assessment)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// --- Main Component ---

export function ModuleContentEditor({
  moduleId,
  kursusId,
}: {
  moduleId: string;
  kursusId: string;
}) {
  const { data: contents, isLoading: isContentsLoading } =
    useContents(moduleId);
  const { data: assessments, isLoading: isAssessmentsLoading } =
    useModuleAssessments(moduleId);

  const createContent = useCreateContent();
  const updateContent = useUpdateContent();
  const deleteContent = useDeleteContent();
  const reorderContents = useReorderContents();
  const updateAssessment = useUpdateAssessment();
  const deleteAssessment = useDeleteAssessment();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [contentType, setContentType] = useState<ContentType>("text");
  const [isSaving, setIsSaving] = useState(false);

  // States for Assessment
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(
    null,
  );
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [activeBuilderAssessment, setActiveBuilderAssessment] =
    useState<Assessment | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [body, setBody] = useState(""); // HTML for text, URL for video

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const resetForm = () => {
    setTitle("");
    setBody("");
    setEditingContent(null);
    setContentType("text");
  };

  const handleOpenCreate = (type: ContentType) => {
    resetForm();
    setContentType(type);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (content: Content) => {
    setEditingContent(content);
    setContentType(content.tipe === ("teks" as any) ? "text" : content.tipe);
    setTitle(content.judul);
    setBody(
      content.tipe === ("teks" as any) || content.tipe === "text"
        ? content.body || ""
        : content.url_berkas || "",
    );
    setIsDialogOpen(true);
  };

  const handleDeleteContent = (content: Content) => {
    pemberitahuan.konfirmasi(
      "Hapus Materi?",
      `Apakah Anda yakin ingin menghapus materi **${content.judul}**?`,
      async () => {
        try {
          pemberitahuan.tampilkanPemuatan("Menghapus materi...");
          await deleteContent.mutateAsync({
            contentId: content.id,
            moduleId,
          });
          pemberitahuan.sukses("Materi berhasil dihapus.");
        } catch (error) {
          pemberitahuan.gagal("Gagal menghapus materi.");
        } finally {
          pemberitahuan.hilangkanPemuatan();
        }
      }
    );
  };

  const handleDeleteAssessment = (assessment: Assessment) => {
    pemberitahuan.konfirmasi(
      "Hapus Asesmen?",
      `Apakah Anda yakin ingin menghapus asesmen **${assessment.judul}**?`,
      async () => {
        try {
          pemberitahuan.tampilkanPemuatan("Menghapus asesmen...");
          await deleteAssessment.mutateAsync({
            assessmentId: assessment.id,
            moduleId,
            kursusId,
          });
          pemberitahuan.sukses("Asesmen berhasil dihapus.");
        } catch (error) {
          pemberitahuan.gagal("Gagal menghapus asesmen.");
        } finally {
          pemberitahuan.hilangkanPemuatan();
        }
      }
    );
  };

  const handleSave = async () => {
    if (!title) {
      pemberitahuan.gagal("Judul materi wajib diisi");
      return;
    }

    if (contentType === "video" && !body) {
      pemberitahuan.gagal("Link video wajib diisi");
      return;
    }

    if (isSaving) return;

    setIsSaving(true);
    pemberitahuan.tampilkanPemuatan(
      editingContent ? "Menyimpan perubahan..." : "Menambahkan materi..."
    );
    try {
      const data: CreateContentData = {
        tipe: contentType,
        judul: title,
        body: contentType === "text" ? body : undefined,
        url_berkas: contentType !== "text" ? body : undefined,
      };

      if (editingContent) {
        await updateContent.mutateAsync({ contentId: editingContent.id, data });
        pemberitahuan.sukses("Materi berhasil diperbarui");
      } else {
        await createContent.mutateAsync({ moduleId, data });
        pemberitahuan.sukses("Materi baru berhasil ditambahkan");
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Failed to save content in handleSave:", error);
      pemberitahuan.gagal(
        error?.message || "Terjadi kesalahan saat menyimpan materi"
      );
    } finally {
      setIsSaving(false);
      pemberitahuan.hilangkanPemuatan();
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && contents) {
      const oldIndex = contents.findIndex((c) => c.id === active.id);
      const newIndex = contents.findIndex((c) => c.id === over.id);
      const newOrder = arrayMove(contents, oldIndex, newIndex);
      reorderContents.mutate({
        moduleId,
        contentIds: newOrder.map((c) => c.id),
      });
      pemberitahuan.sukses("Urutan materi berhasil diperbarui");
    }
  };

  const handlePublishAssessment = async (assessment: Assessment) => {
    pemberitahuan.konfirmasi(
      "Publikasikan Asesmen?",
      `Anda akan mempublikasikan **${assessment.judul}**. Siswa akan dapat melihat dan mengerjakan asesmen ini. Lanjutkan?`,
      async () => {
        try {
          pemberitahuan.tampilkanPemuatan("Mempublikasikan...");
          await updateAssessment.mutateAsync({
            assessmentId: assessment.id,
            data: { status: "published" },
          });
          pemberitahuan.sukses("Asesmen berhasil dipublikasikan.");
        } catch (error) {
          console.error("Failed to publish assessment:", error);
          pemberitahuan.gagal("Gagal mempublikasikan asesmen.");
        } finally {
          pemberitahuan.hilangkanPemuatan();
        }
      },
      undefined,
      "Ya, Publikasikan",
    );
  };

  const isLoading = isContentsLoading || isAssessmentsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* aksi Bar */}
      <div className="flex flex-wrap gap-2 pb-3 border-b">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => handleOpenCreate("text")}
        >
          <FileText className="mr-2 h-3.5 w-3.5 text-blue-500" /> Teks
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => handleOpenCreate("video")}
        >
          <Video className="mr-2 h-3.5 w-3.5 text-red-500" /> Video
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => {
            setEditingAssessment(null);
            setIsAssessmentDialogOpen(true);
          }}
        >
          <HelpCircle className="mr-2 h-3.5 w-3.5 text-purple-500" /> Kuis
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => {
            setEditingAssessment(null);
            setIsAssessmentDialogOpen(true);
          }}
        >
          <ClipboardList className="mr-2 h-3.5 w-3.5 text-green-500" /> Tugas
        </Button>
      </div>

      <div className="space-y-3">
        {(contents && contents.length > 0) ||
          (assessments && assessments.length > 0) ? (
          <>
            {contents && contents.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={contents.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {contents.map((content) => (
                      <SortableContentItem
                        key={content.id}
                        content={content}
                        onEdit={handleOpenEdit}
                        onDelete={handleDeleteContent}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {assessments && assessments.length > 0 && (
              <div className="space-y-2 pt-2">
                <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
                  Kuis & Tugas
                </h5>
                {assessments.map((assessment) => (
                  <AssessmentItem
                    key={assessment.id}
                    assessment={assessment}
                    onEdit={(a) => {
                      setEditingAssessment(a);
                      setIsAssessmentDialogOpen(true);
                    }}
                    onBuilder={(a) => {
                      setActiveBuilderAssessment(a);
                      setIsBuilderOpen(true);
                    }}
                    onPublish={handlePublishAssessment}
                    onDelete={handleDeleteAssessment}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
            <p className="text-sm">Belum ada konten di modul ini.</p>
            <p className="text-xs">
              Tambahkan materi atau asesmen untuk memulai.
            </p>
          </div>
        )}
      </div>

      {/* Editor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* ... existing dialog content ... */}
          <DialogHeader>
            <DialogTitle>
              {editingContent
                ? "Edit Konten"
                : `Tambah Konten ${contentType === "text" ? "Teks" : "Video"}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Judul Materi</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Pengenalan Dasar"
              />
            </div>

            {contentType === "text" && (
              <div className="space-y-2">
                <Label>Isi Materi</Label>
                <div className="border rounded-md overflow-hidden bg-background">
                  <TextEditor value={body} onChange={setBody} />
                </div>
              </div>
            )}

            {contentType === "video" && (
              <div className="space-y-2">
                <Label>Link Video (YouTube/Vimeo)</Label>
                <Input
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
                {body && (body.includes("youtube.com") || body.includes("youtu.be") || body.includes("vimeo.com")) && (
                  <div className="aspect-video mt-4 rounded-lg overflow-hidden bg-black/10">
                    <iframe
                      src={body.includes("watch?v=")
                        ? body.replace("watch?v=", "embed/")
                        : body.includes("youtu.be/")
                          ? `https://www.youtube.com/embed/${body.split("youtu.be/")[1]}`
                          : body}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={!title || isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assessment Dialogs */}
      <AssessmentEditorDialog
        isOpen={isAssessmentDialogOpen}
        onClose={() => setIsAssessmentDialogOpen(false)}
        kursusId={kursusId}
        moduleId={moduleId}
        assessment={editingAssessment}
      />

      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeBuilderAssessment?.tipe === "tugas" ? (
                <ClipboardList className="h-5 w-5 text-green-500" />
              ) : (
                <HelpCircle className="h-5 w-5 text-purple-500" />
              )}
              {activeBuilderAssessment?.tipe === "tugas"
                ? "Editor Instruksi Tugas"
                : "Builder Soal Kuis"}
              : {activeBuilderAssessment?.judul}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {activeBuilderAssessment?.tipe === "tugas" ? (
              <AssignmentBuilder
                assessment={activeBuilderAssessment}
                onSaveSuccess={() => setIsBuilderOpen(false)}
              />
            ) : activeBuilderAssessment ? (
              <QuizBuilder
                assessmentId={activeBuilderAssessment.id}
                onSaveSuccess={() => setIsBuilderOpen(false)}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
