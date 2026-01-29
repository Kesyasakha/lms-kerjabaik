import { useState, useEffect } from "react";
import { pemberitahuan } from "@/pustaka/pemberitahuan";
import { Button } from "@/komponen/ui/button";
import { Input } from "@/komponen/ui/input";
import { Label } from "@/komponen/ui/label";
import { Textarea } from "@/komponen/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/komponen/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/komponen/ui/select";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  GripVertical,
} from "lucide-react";
import {
  useAssessmentQuestions,
  useSaveQuestions,
} from "../hooks/useAssessments";
import type { QuestionType, SaveQuestionData } from "../tipe/instructor.types";
import { Skeleton } from "@/komponen/ui/skeleton";

interface QuizBuilderProps {
  assessmentId: string;
  onSaveSuccess?: () => void;
}

export function QuizBuilder({ assessmentId, onSaveSuccess }: QuizBuilderProps) {
  const { data: existingQuestions, isLoading } =
    useAssessmentQuestions(assessmentId);
  const saveMutation = useSaveQuestions();

  const [questions, setQuestions] = useState<SaveQuestionData[]>([]);

  useEffect(() => {
    if (existingQuestions) {
      setQuestions(
        existingQuestions.map((q) => ({
          id: q.id,
          pertanyaan: q.pertanyaan,
          tipe: q.tipe,
          opsi: q.opsi || { choices: ["", "", "", ""] },
          jawaban_benar: q.jawaban_benar || "",
          poin: q.poin,
          penjelasan: q.penjelasan || "",
          urutan: q.urutan,
        })),
      );
    }
  }, [existingQuestions]);

  const addQuestion = () => {
    const newQuestion: SaveQuestionData = {
      pertanyaan: "",
      tipe: "pilihan_ganda",
      opsi: { choices: ["", "", "", ""] },
      jawaban_benar: "0", // Index of correct choice
      poin: 10,
      penjelasan: "",
      urutan: questions.length,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    // Update urutan
    setQuestions(newQuestions.map((q, i) => ({ ...q, urutan: i })));
  };

  const updateQuestion = (index: number, data: Partial<SaveQuestionData>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...data };
    setQuestions(newQuestions);
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === questions.length - 1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const newQuestions = [...questions];
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[newIndex];
    newQuestions[newIndex] = temp;

    // Update urutan
    setQuestions(newQuestions.map((q, i) => ({ ...q, urutan: i })));
  };

  const handleSave = () => {
    pemberitahuan.tampilkanPemuatan("Menyimpan pertanyaan...");
    saveMutation.mutate(
      { assessmentId, questions },
      {
        onSuccess: () => {
          pemberitahuan.hilangkanPemuatan();
          pemberitahuan.sukses("Pertanyaan berhasil disimpan");
          if (onSaveSuccess) onSaveSuccess();
        },
        onError: (error: any) => {
          pemberitahuan.hilangkanPemuatan();
          pemberitahuan.gagal(error.message || "Gagal menyimpan pertanyaan");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Daftar Pertanyaan ({questions.length})
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addQuestion}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pertanyaan
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending || questions.length === 0}
          >
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? "Menyimpan..." : "Simpan Semua"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {questions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground mb-4">
                Belum ada pertanyaan. Mulai dengan menambah pertanyaan baru.
              </p>
              <Button onClick={addQuestion}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Pertanyaan Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          questions.map((q, qIndex) => (
            <Card key={qIndex} className="relative">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  Pertanyaan #{qIndex + 1}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveQuestion(qIndex, "up")}
                    disabled={qIndex === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveQuestion(qIndex, "down")}
                    disabled={qIndex === questions.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeQuestion(qIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-8 space-y-2">
                    <Label>Teks Pertanyaan</Label>
                    <Textarea
                      placeholder="Masukkan pertanyaan di sini..."
                      value={q.pertanyaan}
                      onChange={(e) =>
                        updateQuestion(qIndex, { pertanyaan: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Tipe</Label>
                      <Select
                        value={q.tipe}
                        onValueChange={(val) =>
                          updateQuestion(qIndex, { tipe: val as QuestionType })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pilihan_ganda">
                            Pilihan Ganda
                          </SelectItem>
                          <SelectItem value="benar_salah">
                            Benar / Salah
                          </SelectItem>
                          <SelectItem value="isian_singkat">
                            Isian Singkat
                          </SelectItem>
                          <SelectItem value="esai">
                            Esai (Manual Grade)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Poin</Label>
                      <Input
                        type="number"
                        min="0"
                        value={q.poin}
                        onChange={(e) =>
                          updateQuestion(qIndex, {
                            poin: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {q.tipe === "pilihan_ganda" && (
                  <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                    <Label className="text-xs uppercase text-muted-foreground">
                      Opsi Jawaban
                    </Label>
                    {q.opsi.choices.map((choice: string, cIndex: number) => (
                      <div key={cIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={String(q.jawaban_benar) === String(cIndex)}
                          onChange={() =>
                            updateQuestion(qIndex, {
                              jawaban_benar: String(cIndex),
                            })
                          }
                          className="h-4 w-4 text-primary"
                        />
                        <Input
                          placeholder={`Opsi ${cIndex + 1}`}
                          value={choice}
                          onChange={(e) => {
                            const newChoices = [...q.opsi.choices];
                            newChoices[cIndex] = e.target.value;
                            updateQuestion(qIndex, {
                              opsi: { ...q.opsi, choices: newChoices },
                            });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {q.tipe === "benar_salah" && (
                  <div className="flex gap-4 pl-4 border-l-2 border-primary/20">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={q.jawaban_benar === "true"}
                        onChange={() =>
                          updateQuestion(qIndex, { jawaban_benar: "true" })
                        }
                      />
                      <Label>Benar</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={q.jawaban_benar === "false"}
                        onChange={() =>
                          updateQuestion(qIndex, { jawaban_benar: "false" })
                        }
                      />
                      <Label>Salah</Label>
                    </div>
                  </div>
                )}

                {q.tipe === "isian_singkat" && (
                  <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                    <Label>Jawaban Benar</Label>
                    <Input
                      placeholder="Masukkan kunci jawaban..."
                      value={q.jawaban_benar || ""}
                      onChange={(e) =>
                        updateQuestion(qIndex, {
                          jawaban_benar: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <Label className="text-xs text-muted-foreground">
                    Penjelasan Jawaban (Opsional)
                  </Label>
                  <Textarea
                    placeholder="Berikan alasan mengapa jawaban tersebut benar..."
                    value={q.penjelasan || ""}
                    onChange={(e) =>
                      updateQuestion(qIndex, { penjelasan: e.target.value })
                    }
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {questions.length > 0 && (
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending
              ? "Menyimpan Semua Pertanyaan..."
              : "Simpan Semua Pertanyaan"}
          </Button>
        </div>
      )}
    </div>
  );
}
