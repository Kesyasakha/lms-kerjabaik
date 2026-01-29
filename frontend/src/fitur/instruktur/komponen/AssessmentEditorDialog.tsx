import { useState, useEffect } from "react";
import { pemberitahuan } from "@/pustaka/pemberitahuan";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Switch } from "@/komponen/ui/switch";
import {
  useCreateAssessment,
  useUpdateAssessment,
} from "../hooks/useAssessments";
import type { Assessment, AssessmentType } from "../tipe/instructor.types";

interface AssessmentEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  kursusId: string;
  moduleId?: string;
  assessment?: Assessment | null;
}

export function AssessmentEditorDialog({
  isOpen,
  onClose,
  kursusId,
  moduleId,
  assessment,
}: AssessmentEditorDialogProps) {
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [tipe, setTipe] = useState<AssessmentType>("kuis");
  const [passingScore, setPassingScore] = useState(70);
  const [durasiMenit, setDurasiMenit] = useState(0);
  const [jumlahPercobaan, setJumlahPercobaan] = useState(1);
  const [acakSoal, setAcakSoal] = useState(false);
  const [tampilkanJawaban, setTampilkanJawaban] = useState(true);
  const [status, setStatus] = useState<"draft" | "published" | "archived">(
    "draft",
  );

  const createMutation = useCreateAssessment();
  const updateMutation = useUpdateAssessment();

  useEffect(() => {
    if (assessment) {
      setJudul(assessment.judul);
      setDeskripsi(assessment.deskripsi || "");
      setTipe(assessment.tipe);
      setPassingScore(assessment.nilai_kelulusan);
      setDurasiMenit(assessment.durasi_menit || 0);
      setJumlahPercobaan(assessment.jumlah_percobaan);
      setAcakSoal(assessment.acak_soal);
      setTampilkanJawaban(assessment.tampilkan_jawaban);
      setStatus(assessment.status);
    } else {
      setJudul("");
      setDeskripsi("");
      setTipe("kuis");
      setPassingScore(70);
      setDurasiMenit(0);
      setJumlahPercobaan(1);
      setAcakSoal(false);
      setTampilkanJawaban(true);
      setStatus("draft");
    }
  }, [assessment, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      id_modul: moduleId || null,
      judul,
      deskripsi,
      tipe,
      nilai_kelulusan: passingScore,
      durasi_menit: durasiMenit > 0 ? durasiMenit : null,
      jumlah_percobaan: jumlahPercobaan,
      acak_soal: acakSoal,
      tampilkan_jawaban: tampilkanJawaban,
      status,
    };

    pemberitahuan.tampilkanPemuatan(assessment ? "Menyimpan perubahan..." : "Membuat asesmen...");

    const onSuccess = () => {
      pemberitahuan.hilangkanPemuatan();
      pemberitahuan.sukses(assessment ? "Asesmen berhasil diperbarui" : "Asesmen berhasil dibuat");
      onClose();
    };

    const onError = (error: any) => {
      pemberitahuan.hilangkanPemuatan();
      pemberitahuan.gagal(error.message || "Gagal menyimpan asesmen");
    };

    if (assessment) {
      updateMutation.mutate(
        { assessmentId: assessment.id, data },
        { onSuccess, onError },
      );
    } else {
      createMutation.mutate({ kursusId, data }, { onSuccess, onError });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {assessment ? "Edit Asesmen" : "Tambah Asesmen Baru"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="judul">Judul Asesmen</Label>
              <Input
                id="judul"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Contoh: Kuis Akhir Modul 1"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="deskripsi">Deskripsi (Opsional)</Label>
              <Textarea
                id="deskripsi"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Berikan instruksi singkat untuk asesmen ini..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tipe">Tipe</Label>
                <Select
                  value={tipe}
                  onValueChange={(value) => setTipe(value as AssessmentType)}
                  disabled={!!assessment} // Prevent type change after creation for now
                >
                  <SelectTrigger id="tipe">
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kuis">Kuis (Auto Grade)</SelectItem>
                    <SelectItem value="tugas">Tugas (Manual Grade)</SelectItem>
                    <SelectItem value="ujian">Ujian</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) =>
                    setStatus(value as "draft" | "published" | "archived")
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (Tersembunyi)</SelectItem>
                    <SelectItem value="published">Published (Aktif)</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="passingScore">Passing Score (0-100)</Label>
              <Input
                id="passingScore"
                type="number"
                min="0"
                max="100"
                value={passingScore}
                onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)}
              />
            </div>

            {tipe !== "tugas" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="durasi">Durasi (Menit, 0 = No Limit)</Label>
                  <Input
                    id="durasi"
                    type="number"
                    min="0"
                    value={durasiMenit}
                    onChange={(e) => setDurasiMenit(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="percobaan">Maksimal Percobaan</Label>
                  <Input
                    id="percobaan"
                    type="number"
                    min="1"
                    value={jumlahPercobaan}
                    onChange={(e) =>
                      setJumlahPercobaan(parseInt(e.target.value) || 1)
                    }
                  />
                </div>
              </div>
            )}

            {tipe !== "tugas" && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Acak Soal</Label>
                    <p className="text-xs text-muted-foreground">
                      Urutan soal akan diacak untuk setiap peserta
                    </p>
                  </div>
                  <Switch checked={acakSoal} onCheckedChange={setAcakSoal} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Tampilkan Jawaban</Label>
                    <p className="text-xs text-muted-foreground">
                      Tampilkan jawaban benar setelah kuis selesai
                    </p>
                  </div>
                  <Switch
                    checked={tampilkanJawaban}
                    onCheckedChange={setTampilkanJawaban}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending || !judul}>
              {isPending
                ? "Menyimpan..."
                : assessment
                  ? "Simpan Perubahan"
                  : "Buat Asesmen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
