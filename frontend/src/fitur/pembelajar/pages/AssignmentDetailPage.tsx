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

    if (isLoading) return <Skeleton className="h-screen w-full" />;
    if (!assignment) return <div className="p-8 text-center text-gray-500">Tugas tidak ditemukan</div>;

    return (
        <div className="min-h-screen bg-zinc-50/50 pb-12">
            {/* Minimalist Header */}
            <div className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-100 shadow-sm mb-8">
                <div className="container max-w-7xl mx-auto px-4 py-3">
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
                                <span className="text-[10px] font-black uppercase tracking-widest text-violet-500 bg-violet-50 px-2 py-0.5 rounded-md">Project</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{assignment.asesmen?.kursus?.judul}</span>
                            </div>
                            <h1 className="text-sm font-bold text-gray-900 truncate">{assignment.judul}</h1>
                        </div>
                        {isGraded && (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none font-bold">
                                Nilai: {submission.nilai}/100
                            </Badge>
                        )}
                        {needsRevision && (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none font-bold">
                                Perlu Revisi
                            </Badge>
                        )}
                        {isWaitingForGrade && (
                            <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-200 border-none font-bold">
                                Menunggu Dinilai
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <div className="container max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEft Column: Assignment Details (Sticky) */}
                    <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                        <Card className="rounded-[24px] border-none shadow-xl shadow-gray-200/50 bg-white overflow-hidden">
                            <div className="h-2 w-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                            <CardContent className="p-8">
                                <h1 className="text-2xl font-black text-gray-800 leading-tight mb-4">{assignment.judul}</h1>

                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 border-b border-gray-100 pb-6">
                                    {assignment.deadline && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-rose-500" />
                                            <span className="font-semibold text-rose-600">
                                                Deadline: {format(new Date(assignment.deadline), 'd MMM yyyy, HH:mm', { locale: localeId })}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="prose prose-sm prose-gray dark:prose-invert max-w-none">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Instruksi Pengerjaan
                                    </h3>
                                    <div className="text-gray-600 leading-relaxed space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100/50">
                                        {assignment.deskripsi}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Work Area */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* Status & Feedback Area */}
                        {needsRevision && submission?.feedback && (
                            <div className="bg-amber-50 rounded-[24px] border border-amber-100 p-6 relative overflow-hidden">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0 text-amber-600">
                                        <MessageSquare className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-amber-900">Catatan dari Instruktur</h3>
                                        <p className="text-amber-800/90 text-sm leading-relaxed italic">"{submission.feedback}"</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isGraded && (
                            <div className="bg-emerald-50 rounded-[24px] border border-emerald-100 p-6 relative overflow-hidden">
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 text-emerald-600">
                                        <CheckCircle className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-emerald-900">Tugas Telah Dinilai</h3>
                                        <p className="text-emerald-800/80 text-sm">Kerja bagus! Anda telah menyelesaikan tugas ini.</p>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <div className="text-3xl font-black text-emerald-600">{submission.nilai}</div>
                                        <div className="text-[10px] font-bold text-emerald-400 uppercase">Poin</div>
                                    </div>
                                </div>
                                {submission.feedback && (
                                    <div className="mt-4 pt-4 border-t border-emerald-200/50">
                                        <p className="text-xs font-bold text-emerald-800 mb-1">Feedback:</p>
                                        <p className="text-emerald-700 text-sm italic">"{submission.feedback}"</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Submission Form */}
                        {!isGraded && (
                            <Card className="rounded-[24px] border-gray-100 shadow-sm overflow-hidden bg-white">
                                <CardHeader className="px-8 pt-8 pb-4 border-b border-gray-50 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-bold text-gray-800">Area Pengumpulan</CardTitle>
                                        <p className="text-xs text-gray-500 mt-1">Format: PDF, DOCX (Maks. 10MB)</p>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">

                                    {/* Upload Zone */}
                                    {isWaitingForGrade && !file ? (
                                        <div className="bg-sky-50 rounded-2xl p-6 border border-sky-100 flex items-center gap-4">
                                            <div className="p-3 bg-white rounded-xl shadow-sm text-sky-500">
                                                <File className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sky-900 text-sm">File Terkirim</p>
                                                <a
                                                    href={submission.url_berkas}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs text-sky-600 hover:underline truncate block"
                                                >
                                                    Lihat berkas pengumpulan
                                                </a>
                                            </div>
                                            <div className="text-xs font-bold text-sky-400 px-3 py-1 bg-white rounded-full">
                                                Menunggu Penilaian
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={`group relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer ${file
                                                ? 'border-violet-200 bg-violet-50/30'
                                                : 'border-gray-200 hover:border-violet-400 hover:bg-violet-50/10'
                                                }`}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={handleDrop}
                                            onClick={() => !file && fileInputRef.current?.click()}
                                        >
                                            {file ? (
                                                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                                                    <div className="p-4 bg-white rounded-2xl shadow-lg shadow-violet-100 text-violet-600 mb-4 relative group-hover:scale-105 transition-transform">
                                                        <File className="h-8 w-8" />
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setFile(null);
                                                            }}
                                                            className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full hover:bg-rose-600 transition-colors shadow-sm"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                    <p className="font-bold text-gray-800">{file.name}</p>
                                                    <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-widest">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center py-4">
                                                    <div className="p-4 bg-gray-50 rounded-full text-gray-400 group-hover:bg-violet-50 group-hover:text-violet-500 transition-colors mb-4">
                                                        <Upload className="h-8 w-8" />
                                                    </div>
                                                    <p className="font-bold text-gray-700 group-hover:text-violet-700 transition-colors">
                                                        Klik untuk upload atau drag file
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        Dukungan file: PDF, DOC, DOCX
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
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Catatan Tambahan</Label>
                                        <Textarea
                                            placeholder="Tuliskan pesan untuk instruktur..."
                                            value={catatan}
                                            onChange={(e) => setCatatan(e.target.value)}
                                            disabled={isWaitingForGrade && !file}
                                            className="rounded-xl border-gray-200 bg-gray-50/50 min-h-[100px] focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none"
                                        />
                                    </div>

                                    <Button
                                        className="w-full rounded-xl h-12 font-bold bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200 disabled:opacity-50 disabled:shadow-none"
                                        onClick={handleSubmit}
                                        disabled={submitMutation.isPending || (isWaitingForGrade && !file)}
                                    >
                                        {submitMutation.isPending ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Mengunggah...
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
