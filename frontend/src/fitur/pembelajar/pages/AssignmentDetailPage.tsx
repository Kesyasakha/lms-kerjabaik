import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Upload,
    File,
    X,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/komponen/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/komponen/ui/card';
import { Badge } from '@/komponen/ui/badge';
import { Textarea } from '@/komponen/ui/textarea';
import { Label } from '@/komponen/ui/label';
import { Skeleton } from '@/komponen/ui/skeleton';
import { useAssignments, useSubmitAssignment } from '@/fitur/pembelajar/api/learnerApi';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export function AssignmentDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: assignments, isLoading } = useAssignments();
    const submitMutation = useSubmitAssignment();

    const [file, setFile] = useState<File | null>(null);
    const [catatan, setCatatan] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const assignment = assignments?.find(a => a.id === id);
    const submission = assignment?.pengumpulan_tugas;
    const isSubmitted = !!submission;
    const isWaitingForGrade = submission?.status === 'dikumpulkan';
    const isGraded = submission?.status === 'dinilai';
    const needsRevision = submission?.status === 'perlu_revisi';

    // Auto-save draft catatan
    useEffect(() => {
        const timer = setTimeout(() => {
            if (catatan && !isSubmitted) {
                localStorage.setItem(`assignment-draft-${id}`, catatan);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [catatan, id, isSubmitted]);

    // Restore draft on mount
    useEffect(() => {
        const draft = localStorage.getItem(`assignment-draft-${id}`);
        if (draft && !submission) {
            setCatatan(draft);
            toast.info('Draft catatan dipulihkan');
        }
    }, [id, submission]);

    // Warn before leave if unsaved
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if ((catatan || file) && !isSubmitted) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [catatan, file, isSubmitted]);

    const validateFile = (file: File): string | null => {
        if (!assignment) return "Assignment data not loaded yet.";

        const maxSize = assignment.max_file_size || 10485760; // 10MB default
        if (file.size > maxSize) {
            return `File terlalu besar. Maksimal ${(maxSize / 1024 / 1024).toFixed(0)}MB. File Anda: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
        }

        const ext = file.name.split('.').pop()?.toLowerCase();
        const allowed = assignment.allowed_extensions || ['pdf', 'doc', 'docx'];
        if (!ext || !allowed.includes(ext)) {
            return `Format file tidak didukung. Gunakan: ${allowed.join(', ')}. File Anda: .${ext}`;
        }

        return null;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        const error = validateFile(selectedFile);
        if (error) {
            toast.error(error);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        setFile(selectedFile);
        toast.success(`File "${selectedFile.name}" siap diupload`);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files?.[0];
        if (!droppedFile) return;

        const error = validateFile(droppedFile);
        if (error) {
            toast.error(error);
            return;
        }

        setFile(droppedFile);
        toast.success(`File "${droppedFile.name}" siap diupload`);
    };

    const handleSubmit = async () => {
        if (!file && !needsRevision && !isSubmitted) {
            toast.error('Mohon pilih file tugas terlebih dahulu');
            return;
        }

        if (needsRevision && !file) {
            toast.error('Mohon lampirkan file revisi Anda');
            return;
        }

        try {
            if (file) {
                await submitMutation.mutateAsync({
                    tugasId: id!,
                    file,
                    catatan
                });
                toast.success('Tugas berhasil dikumpulkan!');
                navigate('/pembelajar/assessments');
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('Gagal mengumpulkan tugas');
        }
    };

    if (isLoading) return <Skeleton className="h-96 w-full" />;
    if (!assignment) return <div>Tugas tidak ditemukan</div>;

    return (
        <div className="space-y-8 max-w-4xl mx-auto py-8">
            <Button
                variant="ghost"
                onClick={() => navigate('/pembelajar/assessments')}
                className="mb-4 pl-3 pr-4 rounded-xl font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Pusat Asesmen
            </Button>

            <Card className="rounded-2xl shadow-none border-border/60 overflow-hidden bg-white dark:bg-zinc-950">
                <CardHeader className="p-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-muted pb-8 mb-8">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-none font-bold text-[10px] px-3 uppercase tracking-wider">{assignment.asesmen?.kursus?.judul}</Badge>
                                {isGraded && (
                                    <Badge className="bg-emerald-50 text-emerald-700 border-none rounded-full shadow-none font-bold text-[10px] px-3 uppercase tracking-wider">
                                        Nilai: {submission.nilai} / 100
                                    </Badge>
                                )}
                            </div>
                            <CardTitle className="text-3xl font-black text-gray-900 dark:text-white leading-tight">{assignment.judul}</CardTitle>
                        </div>
                        {assignment.deadline && (
                            <div className="md:text-right shrink-0">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Tenggat Waktu</p>
                                <p className="font-black text-rose-600 text-sm">
                                    {format(new Date(assignment.deadline), 'd MMM yyyy, HH:mm', { locale: localeId })}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="prose dark:prose-invert max-w-none">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 mb-4 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Deskripsi Tugas
                        </h3>
                        <p className="whitespace-pre-wrap text-base text-gray-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-border/40 italic">
                            {assignment.deskripsi}
                        </p>
                    </div>
                </CardHeader>
            </Card>

            {!isGraded && (
                <Card className="rounded-2xl shadow-none border-border/60 overflow-hidden bg-white dark:bg-zinc-950">
                    <CardHeader className="p-8 pb-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold">Pengumpulan Tugas</CardTitle>
                                <CardDescription className="text-xs font-medium mt-1">
                                    Pastikan file dalam format PDF atau DOCX dengan resolusi yang jelas (Maks. 10MB)
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        {needsRevision && (
                            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-6 rounded-2xl flex items-start gap-4 mb-4 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600">
                                    <AlertCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-black text-amber-900 dark:text-amber-100 uppercase tracking-widest text-[10px]">Perlu Revisi</p>
                                    <p className="text-amber-800 dark:text-amber-200 text-sm mt-1 leading-relaxed font-medium">
                                        Instruktur meminta Anda untuk melakukan revisi. Silakan unggah perbaikan Anda di bawah ini.
                                    </p>
                                    {submission?.feedback && (
                                        <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-900/40">
                                            <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest mb-1">Pesan Instruktur:</p>
                                            <p className="text-sm text-amber-900/80 dark:text-amber-100/80 italic font-serif">"{submission.feedback}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {isWaitingForGrade && !file ? (
                            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl flex items-center justify-between border border-border/40 group hover:border-sky-500/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-2xl text-sky-600 dark:text-sky-400">
                                        <File className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">Tugas Terikirim</p>
                                        <a
                                            href={submission.url_berkas}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-bold mt-1 inline-block"
                                        >
                                            Pratonton Berkas
                                        </a>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Dikirim Pada</span>
                                    <p className="text-xs font-bold text-gray-700 dark:text-zinc-400">
                                        {submission.created_at && format(new Date(submission.created_at), 'd MMM, HH:mm')}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div
                                className={`group relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${file
                                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900/50'
                                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                                    }`}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                onClick={() => !file && fileInputRef.current?.click()}
                            >
                                {file ? (
                                    <div className="flex flex-col items-center">
                                        <div className="p-4 bg-zinc-900 dark:bg-zinc-100 rounded-2xl text-white dark:text-zinc-900 mb-4 shadow-sm">
                                            <File className="h-10 w-10" />
                                        </div>
                                        <p className="font-bold text-lg text-gray-900 dark:text-white">{file.name}</p>
                                        <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">
                                            Ukuran: {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="mt-6 rounded-xl font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFile(null);
                                            }}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Batalkan & Ganti
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:scale-110 transition-all duration-300 mb-4 shadow-inner">
                                            <Upload className="h-10 w-10" />
                                        </div>
                                        <p className="font-bold text-gray-900 dark:text-white">Seret file ke sini atau klik untuk memilih</p>
                                        <p className="text-xs font-medium text-muted-foreground mt-2 italic">Ekstensi yang didukung: PDF, DOCX (Maks. 10MB)</p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Catatan Tambahan (Opsional)</Label>
                            <Textarea
                                placeholder="Tambahkan informasi tambahan jika diperlukan..."
                                value={catatan}
                                onChange={(e) => setCatatan(e.target.value)}
                                disabled={isWaitingForGrade && !file}
                                className="rounded-2xl border-border/40 min-h-[120px] focus-visible:ring-primary/20"
                            />
                        </div>

                        <Button
                            className="w-full rounded-2xl h-12 font-black bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-200 shadow-lg text-base"
                            onClick={handleSubmit}
                            disabled={submitMutation.isPending || (isWaitingForGrade && !file)}
                        >
                            {submitMutation.isPending
                                ? 'Sedang Mengunggah...'
                                : isWaitingForGrade && !file
                                    ? 'Menunggu Penilaian'
                                    : needsRevision
                                        ? 'Kirim Revisi Tugas'
                                        : 'Kumpulkan Tugas Sekarang'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {isGraded && (
                <Card className="rounded-2xl shadow-none border-emerald-200/50 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                            <CardTitle className="font-black text-xl">Hasil Penilaian</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-6">
                        <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-emerald-100 dark:border-zinc-800">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Skor Akhir</span>
                                <p className="text-sm font-bold text-gray-500">Bagus! Tugas Anda telah dinilai.</p>
                            </div>
                            <span className="text-4xl font-black text-emerald-600">{submission.nilai} <span className="text-sm text-muted-foreground font-medium">/ 100</span></span>
                        </div>
                        {submission.feedback && (
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-emerald-100 dark:border-zinc-800">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Feedback dari Instruktur</p>
                                <p className="text-gray-700 dark:text-zinc-300 italic font-medium leading-relaxed">"{submission.feedback}"</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

