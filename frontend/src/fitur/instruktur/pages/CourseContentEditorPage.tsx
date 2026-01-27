import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
// Card component imports removed as they were unused
import { Button } from "@/komponen/ui/button";
import { Badge } from "@/komponen/ui/badge";
import { Skeleton } from "@/komponen/ui/skeleton";
// AlertDialog dihapus karena menggunakan Notiflix
import { pemberitahuan } from "@/pustaka/pemberitahuan";
import {
  ArrowLeft,
  Plus,
  GripVertical,
  Edit,
  Trash2,
  Clock,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { useInstructorCourseDetail } from "../hooks/useInstructorCourses";
import {
  useModules,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
  useReorderModules,
} from "../hooks/useModules";
import { ModuleEditorDialog } from "../komponen/ModuleEditorDialog";
import { ModuleContentEditor } from "../komponen/ModuleContentEditor";
import type { Module, CreateModuleData } from "../api/modulesApi";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/pustaka/utils";

// --- Sortable Module Item (Sidebar) ---

interface SortableModuleItemProps {
  module: Module;
  isSelected: boolean;
  onSelect: (module: Module) => void;
  onEdit: (module: Module) => void;
  onDelete: (module: Module) => void;
}

function SortableModuleItem({
  module,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: SortableModuleItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(module)}
      className={cn(
        "group flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-all hover:bg-accent",
        isSelected ? "bg-accent border-primary ring-1 ring-primary" : "bg-card",
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{module.judul}</h4>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {module.durasi_menit || 0}m
          </span>
        </div>
      </div>

      <div
        className={cn(
          "flex items-center gap-1",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      >
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(module);
          }}
        >
          <Edit className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(module);
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {isSelected && <ChevronRight className="h-4 w-4 text-primary" />}
    </div>
  );
}

// --- Main Page Component ---

export default function CourseContentEditorPage() {
  const { id: kursusId } = useParams<{ id: string }>();

  // State
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null); // For editing metadata
  const [activeModule, setActiveModule] = useState<Module | null>(null); // For content editing

  // Queries & Mutations
  const { data: course, isLoading: courseLoading } = useInstructorCourseDetail(
    kursusId!,
  );
  const { data: modules, isLoading: modulesLoading } = useModules(kursusId!);
  const createModuleMutation = useCreateModule();
  const updateModuleMutation = useUpdateModule();
  const deleteModuleMutation = useDeleteModule();
  const reorderModulesMutation = useReorderModules();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Auto-select first module
  useEffect(() => {
    if (modules && modules.length > 0 && !activeModule) {
      setActiveModule(modules[0]);
    }
  }, [modules, activeModule]);

  // Handlers
  const handleAddModule = () => {
    setSelectedModule(null);
    setEditorOpen(true);
  };

  const handleEditModule = (module: Module) => {
    setSelectedModule(module);
    setEditorOpen(true);
  };

  const handleDeleteModule = (module: Module) => {
    pemberitahuan.konfirmasi(
      "Hapus Modul?",
      `Apakah Anda yakin ingin menghapus modul **${module.judul}**? Aksi ini akan menghapus semua konten di dalamnya secara permanen.`,
      async () => {
        try {
          pemberitahuan.tampilkanPemuatan("Menghapus modul...");
          await deleteModuleMutation.mutateAsync({
            moduleId: module.id,
            kursusId: kursusId!,
          });
          pemberitahuan.sukses("Modul berhasil dihapus.");
          if (activeModule?.id === module.id) {
            setActiveModule(null);
          }
        } catch (error) {
          pemberitahuan.gagal("Gagal menghapus modul.");
        } finally {
          pemberitahuan.hilangkanPemuatan();
        }
      }
    );
  };

  const handleSaveModule = async (data: CreateModuleData) => {
    try {
      pemberitahuan.tampilkanPemuatan(selectedModule ? "Memperbarui modul..." : "Menambahkan modul...");
      if (selectedModule) {
        await updateModuleMutation.mutateAsync({
          moduleId: selectedModule.id,
          data,
        });
        pemberitahuan.sukses("Modul berhasil diperbarui.");
      } else {
        await createModuleMutation.mutateAsync({
          kursusId: kursusId!,
          data,
        });
        pemberitahuan.sukses("Modul baru berhasil ditambahkan.");
      }
      setEditorOpen(false);
      setSelectedModule(null);
    } catch (error) {
      console.error("Failed to save module", error);
      pemberitahuan.gagal("Gagal menyimpan modul.");
    } finally {
      pemberitahuan.hilangkanPemuatan();
    }
  };

  // handleConfirmDelete dihapus karena logika dipindah ke handleDeleteModule

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && modules) {
      const oldIndex = modules.findIndex((m) => m.id === active.id);
      const newIndex = modules.findIndex((m) => m.id === over.id);
      const newOrder = arrayMove(modules, oldIndex, newIndex);
      reorderModulesMutation.mutate({
        kursusId: kursusId!,
        moduleIds: newOrder.map((m) => m.id),
      });
      pemberitahuan.sukses("Urutan modul berhasil diperbarui.");
    }
  };

  if (courseLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!course) return <div>Kursus tidak ditemukan</div>;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b mb-6">
        <div>
          <Link
            to={`/instruktur/kursus/${kursusId}`}
            className="flex items-center text-sm text-muted-foreground hover:text-primary mb-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Detail
          </Link>
          <h1 className="text-2xl font-bold">{course.judul}</h1>
          <p className="text-muted-foreground">Editor Konten</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(`/course/${kursusId}`, "_blank")}
          >
            Pratinjau Kursus
          </Button>
          <Button onClick={handleAddModule}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Modul
          </Button>
        </div>
      </div>

      {/* Editor Layout */}
      <div className="flex flex-1 gap-6 min-h-0">
        {/* Left Sidebar: Module List */}
        <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold px-1">Daftar Modul</h3>
            <Badge variant="secondary">{modules?.length || 0}</Badge>
          </div>

          <div className="flex-1 space-y-2">
            {modulesLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={modules?.map((m) => m.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  {modules?.map((module) => (
                    <SortableModuleItem
                      key={module.id}
                      module={module}
                      isSelected={activeModule?.id === module.id}
                      onSelect={setActiveModule}
                      onEdit={handleEditModule}
                      onDelete={handleDeleteModule}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}

            {modules?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <p className="text-sm">Belum ada modul</p>
                <Button
                  variant="link"
                  onClick={handleAddModule}
                  className="h-auto p-0 text-xs"
                >
                  Buat modul baru
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Area: Content Editor */}
        <div className="flex-1 bg-background rounded-lg border shadow-sm flex flex-col min-h-0">
          {activeModule ? (
            <div className="flex flex-col h-full">
              <div className="border-b p-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">Modul {activeModule.urutan}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />{" "}
                    {activeModule.durasi_menit || 0} menit
                  </span>
                </div>
                <h2 className="text-xl font-bold">{activeModule.judul}</h2>
                {activeModule.deskripsi && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeModule.deskripsi}
                  </p>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <ModuleContentEditor
                  moduleId={activeModule.id}
                  kursusId={kursusId!}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
              <BookOpen className="h-16 w-16 mb-4 opacity-20" />
              <h3 className="text-lg font-semibold">Pilih Modul</h3>
              <p>Pilih modul di sidebar kiri untuk mengelola kontennya</p>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <ModuleEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        module={selectedModule}
        onSave={handleSaveModule}
        isLoading={
          createModuleMutation.isPending || updateModuleMutation.isPending
        }
      />

      {/* Konfirmasi hapus menggunakan Notiflix */}
    </div>
  );
}
