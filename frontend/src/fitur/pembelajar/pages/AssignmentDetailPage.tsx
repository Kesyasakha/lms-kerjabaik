import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Upload,
    File,
    X,
    CheckCircle,
    AlertCircle,
    Calendar,
    Clock,
    FileText,
    MessageSquare
} from 'lucide-react';
import { Button } from '@/komponen/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/komponen/ui/card';

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

    if (isLoading) return <Skeleton className="h-screen w-full" />;
    if (!assignment) return <div className="p-8 text-center text-gray-500">Tugas tidak ditemukan</div>;

    return (
        <div className="min-h-screen bg-zinc-50/50 pb-12">
            {/* Minimalist Header */}
            <div className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-100 shadow-sm mb-6">
                <div className="container max-w-6xl mx-auto px-4 py-3">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/pembelajar/assessments')}
                            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 text-gray-500"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">Project</span>
                                <span className="text-[10px] font-medium text-gray-400">/</span>
                                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider truncate">{assignment.asesmen?.kursus?.judul}</span>
                            </div>
                            <h1 className="text-base font-bold text-gray-900 truncate leading-tight">{assignment.judul}</h1>
                        </div>
                        {isGraded && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-bold">Nilai: {submission.nilai}/100</span>
                            </div>
                        )}
                        {needsRevision && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
                                <AlertCircle className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-bold">Perlu Revisi</span>
                            </div>
                        )}
                        {isWaitingForGrade && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg border border-sky-100">
                                <Clock className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-bold">Menunggu Dinilai</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="container max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* Left Column: Assignment Details */}
                    <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
                        <Card className="rounded-2xl border-gray-200 shadow-sm bg-white overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
                                    <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-violet-500" />
                                        Detail Tugas
                                    </h2>
                                    {assignment.deadline && (
                                        <div className="flex items-center gap-1.5 text-[10px] text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
                                            <Calendar className="h-3 w-3" />
                                            <span className="font-bold">
                                                {format(new Date(assignment.deadline), 'd MMM yyyy, HH:mm', { locale: localeId })}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="prose prose-sm prose-gray dark:prose-invert max-w-none">
                                    <div className="text-xs text-gray-600 leading-relaxed space-y-3">
                                        {assignment.deskripsi}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Work Area */}
                    <div className="lg:col-span-7 space-y-4">

                        {/* Status & Feedback Area */}
                        {needsRevision && submission?.feedback && (
                            <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
                                <div className="flex gap-3">
                                    <MessageSquare className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wide">Instruksi Revisi</h3>
                                        <p className="text-amber-800/90 text-xs leading-relaxed italic">"{submission.feedback}"</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isGraded && (
                            <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5 flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 text-emerald-600 shadow-sm">
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-emerald-900">Selesai & Dinilai</h3>
                                    {submission.feedback && (
                                        <p className="text-emerald-700 text-xs mt-1">"{submission.feedback}"</p>
                                    )}
                                </div>
                                <div className="text-center px-4 py-2 bg-white rounded-xl shadow-sm border border-emerald-100">
                                    <div className="text-xl font-black text-emerald-600">{submission.nilai}</div>
                                    <div className="text-[9px] font-bold text-emerald-400 uppercase">Poin</div>
                                </div>
                            </div>
                        )}

                        {/* Submission Form */}
                        {!isGraded && (
                            <Card className="rounded-2xl border-gray-200 shadow-sm overflow-hidden bg-white">
                                <CardHeader className="px-6 pt-6 pb-3 border-b border-gray-50 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-sm font-bold text-gray-800">Upload Pekerjaan</CardTitle>
                                        <p className="text-[10px] text-gray-400 mt-0.5">Kirim file PDF/DOCX (Max 10MB)</p>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-5">

                                    {/* Upload Zone */}
                                    {isWaitingForGrade && !file ? (
                                        <div className="bg-sky-50 rounded-xl p-4 border border-sky-100 flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg shadow-sm text-sky-500">
                                                <File className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sky-900 text-xs">File Terkirim</p>
                                                <a
                                                    href={submission.url_berkas}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-[10px] text-sky-600 hover:underline truncate block"
                                                >
                                                    Lihat dokumen anda
                                                </a>
                                            </div>
                                            <div className="text-[10px] font-bold text-sky-400 px-2 py-1 bg-white rounded-md border border-sky-100">
                                                Menunggu Penilaian
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={`group relative border border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer ${file
                                                ? 'border-violet-200 bg-violet-50/30'
                                                : 'border-gray-300 hover:border-violet-400 hover:bg-violet-50/10'
                                                }`}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={handleDrop}
                                            onClick={() => !file && fileInputRef.current?.click()}
                                        >
                                            {file ? (
                                                <div className="flex items-center gap-3 text-left">
                                                    <div className="p-2.5 bg-white rounded-xl shadow-sm border border-violet-100 text-violet-600">
                                                        <File className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-gray-800 text-xs truncate">{file.name}</p>
                                                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFile(null);
                                                        }}
                                                        className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-lg transition-colors"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center py-2">
                                                    <div className="p-2.5 bg-gray-100 rounded-full text-gray-500 group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors mb-2">
                                                        <Upload className="h-5 w-5" />
                                                    </div>
                                                    <p className="text-xs font-semibold text-gray-600 group-hover:text-violet-700 transition-colors">
                                                        Klik atau drag file ke sini
                                                    </p>
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

                                    {/* Notes Field */}
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-0.5">Catatan (Opsional)</Label>
                                        <Textarea
                                            placeholder="Tulis pesan untuk instruktur..."
                                            value={catatan}
                                            onChange={(e) => setCatatan(e.target.value)}
                                            disabled={isWaitingForGrade && !file}
                                            className="rounded-xl border-gray-200 bg-gray-50 text-xs min-h-[80px] focus:ring-violet-500/20 focus:border-violet-500 resize-none placeholder:text-gray-400"
                                        />
                                    </div>

                                    <Button
                                        className="w-full rounded-xl h-10 text-xs font-bold bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200 disabled:opacity-50 disabled:shadow-none"
                                        onClick={handleSubmit}
                                        disabled={submitMutation.isPending || (isWaitingForGrade && !file)}
                                    >
                                        {submitMutation.isPending ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Loading...
                                            </span>
                                        ) : needsRevision ? (
                                            'Kirim Revisi'
                                        ) : isWaitingForGrade && !file ? (
                                            'Menunggu Penilaian'
                                        ) : (
                                            'Kumpulkan Tugas'
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
