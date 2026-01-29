import { useState } from "react";
import { pemberitahuan } from "@/pustaka/pemberitahuan";
import { Button } from "@/komponen/ui/button";
import { Label } from "@/komponen/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/komponen/ui/card";
import { Save, Info } from "lucide-react";
import { useUpdateAssessment } from "../hooks/useAssessments";
import type { Assessment } from "../tipe/instructor.types";
import TextEditor from "@/komponen/ui/TextEditor";

interface AssignmentBuilderProps {
  assessment: Assessment;
  onSaveSuccess?: () => void;
}

export function AssignmentBuilder({
  assessment,
  onSaveSuccess,
}: AssignmentBuilderProps) {
  const [instructions, setInstructions] = useState(assessment.deskripsi || "");
  const updateMutation = useUpdateAssessment();

  const handleSave = () => {
    pemberitahuan.tampilkanPemuatan("Menyimpan instruksi...");
    updateMutation.mutate(
      {
        assessmentId: assessment.id,
        data: { deskripsi: instructions },
      },
      {
        onSuccess: () => {
          pemberitahuan.hilangkanPemuatan();
          pemberitahuan.sukses("Instruksi tugas berhasil disimpan");
          if (onSaveSuccess) onSaveSuccess();
        },
        onError: (error: any) => {
          pemberitahuan.hilangkanPemuatan();
          pemberitahuan.gagal(error.message || "Gagal menyimpan instruksi");
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Instruksi Tugas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Tuliskan detail tugas, kriteria penilaian, dan instruksi
              pengumpulan untuk mahasiswa.
            </Label>
            <div className="min-h-[300px] border rounded-md">
              <TextEditor
                value={instructions}
                onChange={setInstructions}
                placeholder="Tulis instruksi tugas di sini..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {updateMutation.isPending
                ? "Menyimpan..."
                : "Simpan Instruksi Tugas"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">Tips:</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Gunakan format yang jelas untuk poin-poin tugas.</li>
            <li>Sebutkan format file yang diharapkan (PDF, Link, dll).</li>
            <li>
              Cantumkan kriteria penilaian agar mahasiswa paham standar yang
              diharapkan.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
