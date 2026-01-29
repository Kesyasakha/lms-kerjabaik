import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Clock,
    ChevronRight,
    ChevronLeft,
    AlertCircle,
    Play,
    Timer,
    ClipboardList,
    Trophy,
    ArrowLeft
} from 'lucide-react';
import { Button } from '@/komponen/ui/button';
import { Skeleton } from '@/komponen/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/komponen/ui/dialog';
import {
    useAssessments,
    useStartAssessment,
    useSubmitAnswer,
    useFinishAssessment
} from '@/fitur/pembelajar/api/learnerApi';
import { QuestionRenderer } from '../komponen/QuestionRenderer';
import { toast } from 'sonner';
import {
    Card,
    CardContent
} from '@/komponen/ui/card';
import { motion } from 'framer-motion';
import { supabase } from '@/pustaka/supabase';

export function TakeAssessmentPage() {
    const { assessmentId, attemptId } = useParams<{ assessmentId: string; attemptId?: string }>();
    const navigate = useNavigate();

    const { data: assessments } = useAssessments();
    const startMutation = useStartAssessment();
    const submitAnswerMutation = useSubmitAnswer();
    const finishMutation = useFinishAssessment();

    const [currentAttempt, setCurrentAttempt] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'intro' | 'taking'>('intro');
    const [isLoading, setIsLoading] = useState(true);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);

    const autoSaveTimerRef = useRef<NodeJS.Timeout>();
    const assessment = assessments?.find(a => a.id === assessmentId);

    // Load assessment data and questions
    useEffect(() => {
        const loadData = async () => {
            if (!assessmentId) return;

            try {
                // If attemptId provided, load existing attempt
                if (attemptId) {
                    const { data: attempt } = (await supabase
                        .from('percobaan_asesmen')
                        .select('*')
                        .eq('id', attemptId)
                        .single()) as { data: { id: string; waktu_mulai: string } | null };

                    if (attempt) {
                        setCurrentAttempt(attempt);

                        // Load existing answers
                        const { data: existingAnswers } = (await supabase
                            .from('jawaban')
                            .select('*')
                            .eq('id_percobaan', attemptId)) as { data: { id_soal: string; jawaban_pengguna: string | null; jawaban_pengguna_multiple: any }[] | null };

                        const answersMap: Record<string, string | string[]> = {};
                        existingAnswers?.forEach(ans => {
                            answersMap[ans.id_soal] = ans.jawaban_pengguna_multiple || ans.jawaban_pengguna || '';
                        });
                        setAnswers(answersMap);

                        // Calculate remaining time
                        if (assessment?.durasi_menit) {
                            const startTime = new Date(attempt.waktu_mulai).getTime();
                            const now = Date.now();
                            const elapsed = Math.floor((now - startTime) / 1000);
                            const total = assessment.durasi_menit * 60;
                            setTimeRemaining(Math.max(0, total - elapsed));
                        }
                    }
                } else {
                    // Start new attempt
                    const newAttempt = await startMutation.mutateAsync(assessmentId);
                    setCurrentAttempt(newAttempt);

                    if (assessment?.durasi_menit) {
                        setTimeRemaining(assessment.durasi_menit * 60);
                    }
                }

                // Load questions
                const { data: soal } = (await supabase
                    .from('soal')
                    .select('*')
                    .eq('id_asesmen', assessmentId)
                    .order('urutan', { ascending: true })) as { data: any[] | null };

                if (soal) {
                    // Shuffle if required
                    const finalQuestions = assessment?.acak_soal
                        ? soal.sort(() => Math.random() - 0.5)
                        : soal;
                    setQuestions(finalQuestions);
                }

                setIsLoading(false);
            } catch (error) {
                console.error('Error loading assessment:', error);
                toast.error('Gagal memuat ujian');
                navigate('/pembelajar/assessments');
            }
        };

        loadData();
    }, [assessmentId, attemptId, assessment]);

    // Timer countdown
    useEffect(() => {
        if (timeRemaining === null || timeRemaining <= 0) return;

        const interval = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev === null || prev <= 1) {
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeRemaining]);

    // Auto-save answers
    const saveAnswer = useCallback(async (questionId: string, answer: string | string[]) => {
        if (!currentAttempt) return;

        try {
            await submitAnswerMutation.mutateAsync({
                percobaanId: currentAttempt.id,
                soalId: questionId,
                jawabanPengguna: typeof answer === 'string' ? answer : undefined,
                jawabanPenggunaMultiple: Array.isArray(answer) ? answer : undefined,
            });
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }, [currentAttempt, submitAnswerMutation]);

    // Debounced auto-save
    const handleAnswerChange = (questionId: string, answer: string | string[]) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));

        // Clear existing timer
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        // Set new timer for auto-save
        autoSaveTimerRef.current = setTimeout(() => {
            saveAnswer(questionId, answer);
        }, 2000);
    };

    const handleAutoSubmit = async () => {
        if (!currentAttempt) return;

        toast.info('Waktu habis! Ujian akan dikumpulkan otomatis...');
        await handleSubmit();
    };

    const handleSubmit = async () => {
        if (!currentAttempt) return;

        try {
            // Save all pending answers
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }

            // Finish assessment
            await finishMutation.mutateAsync(currentAttempt.id);

            toast.success('Ujian berhasil dikumpulkan!');
            navigate(`/pembelajar/penilaian/${assessmentId}/results`);
        } catch (error) {
            toast.error('Gagal mengumpulkan ujian');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const currentQuestion = questions[currentQuestionIndex];
    const answeredCount = Object.keys(answers).filter(k => answers[k]).length;
    const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

    if (isLoading) {
        return <Skeleton className="h-screen w-full" />;
    }

    if (!assessment) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <AlertCircle className="h-12 w-12 text-rose-500" />
                <p className="font-bold text-gray-800">Assessment not found</p>
                <Button variant="outline" onClick={() => navigate('/pembelajar/assessments')}>Kembali</Button>
            </div>
        );
    }

    if (viewMode === 'intro') {
        const totalPoints = questions.reduce((sum, q) => sum + (q.poin || 0), 0);

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="min-h-screen bg-zinc-50/50 flex items-center justify-center p-4"
            >
                <Card className="max-w-xl w-full rounded-3xl border-gray-200 shadow-xl shadow-gray-200/50 overflow-hidden bg-white">
                    <div className="bg-violet-600 p-8 text-white relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/pembelajar/assessments')}
                            className="bg-white/10 hover:bg-white/20 text-white border-0 mb-6 rounded-xl h-8 px-3"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Kembali</span>
                        </Button>
                        <h1 className="text-2xl font-black leading-tight mb-2">{assessment.judul}</h1>
                        <p className="text-white/80 text-xs font-medium line-clamp-2 leading-relaxed">
                            {assessment.deskripsi || "Persiapkan diri Anda dengan baik sebelum memulai asesmen ini."}
                        </p>
                    </div>

                    <CardContent className="p-8">
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-4 hover:border-violet-200 transition-colors group">
                                <div className="p-2.5 bg-white rounded-xl text-violet-600 shadow-sm transition-transform group-hover:scale-110">
                                    <Timer className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Durasi</p>
                                    <h4 className="font-bold text-gray-800">{assessment.durasi_menit} Menit</h4>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-4 hover:border-violet-200 transition-colors group">
                                <div className="p-2.5 bg-white rounded-xl text-violet-600 shadow-sm transition-transform group-hover:scale-110">
                                    <ClipboardList className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Soal</p>
                                    <h4 className="font-bold text-gray-800">{questions.length} Butir</h4>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-4 hover:border-violet-200 transition-colors group">
                                <div className="p-2.5 bg-white rounded-xl text-violet-600 shadow-sm transition-transform group-hover:scale-110">
                                    <Trophy className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lulus</p>
                                    <h4 className="font-bold text-gray-800">{assessment.nilai_kelulusan}%</h4>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-4 hover:border-violet-200 transition-colors group">
                                <div className="p-2.5 bg-white rounded-xl text-violet-600 shadow-sm transition-transform group-hover:scale-110">
                                    <Trophy className="h-5 w-5 opacity-0 invisible" />
                                    <span className="absolute inset-0 flex items-center justify-center font-black text-violet-600">Σ</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Poin</p>
                                    <h4 className="font-bold text-gray-800">{totalPoints} Poin</h4>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100/50 flex gap-4">
                                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                                <div className="text-xs text-amber-800/80 leading-relaxed font-medium">
                                    <p className="font-bold text-amber-900 mb-1 leading-none uppercase tracking-tighter text-[10px]">Instruksi Penting:</p>
                                    Jangan refresh halaman saat ujian berlangsung. Pastikan koneksi internet Anda stabil. Jawaban akan tersimpan otomatis.
                                </div>
                            </div>

                            <Button
                                className="w-full h-14 rounded-2xl text-lg font-black bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200 transition-all active:scale-95"
                                onClick={() => setViewMode('taking')}
                            >
                                <Play className="h-5 w-5 mr-3 fill-white" />
                                MULAI ASESMEN SEKARANG
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50/50">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="container max-w-4xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Aktif</span>
                            </div>
                            <h1 className="text-base font-black truncate text-gray-800 dark:text-white leading-tight">{assessment.judul}</h1>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            {timeRemaining !== null && (
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all shadow-sm ${timeRemaining < 300
                                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                                    : 'bg-zinc-50 border-gray-200 text-gray-700'
                                    }`}>
                                    <Clock className={`h-3.5 w-3.5 ${timeRemaining < 300 ? 'animate-pulse' : ''}`} />
                                    <span className="font-mono font-black tracking-widest text-xs">{formatTime(timeRemaining)}</span>
                                </div>
                            )}

                            <Button
                                size="sm"
                                className="rounded-xl font-bold h-9 px-4 bg-gray-800 hover:bg-gray-900 shadow-lg shadow-gray-200/50"
                                onClick={() => setShowSubmitDialog(true)}
                            >
                                Kumpulkan
                            </Button>
                        </div>
                    </div>

                    {/* Compact Progress bar */}
                    <div className="mt-3 relative h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-violet-600 transition-all duration-700 ease-in-out rounded-full shadow-[0_0_8px_rgba(124,58,237,0.4)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Question Container */}
            <div className="container max-w-4xl mx-auto px-4 py-8">
                {currentQuestion && (
                    <QuestionRenderer
                        question={currentQuestion}
                        answer={answers[currentQuestion.id]}
                        onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
                    />
                )}

                {/* Navigation - Compact Style */}
                <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <Button
                        variant="ghost"
                        className="rounded-xl font-bold h-10 px-4 hover:bg-gray-50 flex-1 md:flex-none w-full md:w-auto text-xs"
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Soal Sebelumnya
                    </Button>

                    <div className="flex gap-1.5 flex-wrap justify-center flex-1 max-w-sm px-4">
                        {questions.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentQuestionIndex(index)}
                                className={`w-7 h-7 rounded-lg border-2 transition-all duration-300 text-[10px] font-black flex items-center justify-center ${index === currentQuestionIndex
                                    ? 'border-violet-600 bg-violet-600 text-white shadow-md shadow-violet-200'
                                    : answers[questions[index].id]
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                                        : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-violet-200'
                                    }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    <Button
                        variant="ghost"
                        className="rounded-xl font-bold h-10 px-4 hover:bg-gray-50 flex-1 md:flex-none w-full md:w-auto text-xs text-violet-600"
                        onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                        disabled={currentQuestionIndex === questions.length - 1}
                    >
                        Soal Selanjutnya
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </div>

            {/* Submit Confirmation Dialog */}
            <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <DialogContent className="rounded-[32px] max-w-sm border-0 p-8">
                    <DialogHeader className="space-y-4">
                        <div className="w-16 h-16 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-2 text-amber-500 border border-amber-100">
                            <AlertCircle className="h-8 w-8" />
                        </div>
                        <DialogTitle className="text-center text-2xl font-black text-gray-800">Selesai Berjuang?</DialogTitle>
                        <DialogDescription className="text-center text-gray-500 font-medium leading-relaxed">
                            Anda telah menjawab <span className="text-violet-600 font-black">{answeredCount} dari {questions.length}</span> soal dengan sungguh-sungguh.
                            {answeredCount < questions.length && (
                                <div className="mt-4 p-4 bg-rose-50 rounded-2xl text-rose-600 text-xs font-bold ring-1 ring-rose-100 flex gap-3 items-center">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <span>Hati-hati! Sisa {questions.length - answeredCount} soal belum terjawab.</span>
                                </div>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="grid grid-cols-2 gap-3 mt-8">
                        <Button
                            variant="ghost"
                            className="rounded-2xl font-bold h-12 hover:bg-gray-100"
                            onClick={() => setShowSubmitDialog(false)}
                        >
                            Periksa Lagi
                        </Button>
                        <Button
                            className="rounded-2xl font-black h-12 bg-gray-800 hover:bg-gray-900 shadow-xl shadow-gray-200 transition-all active:scale-95"
                            onClick={handleSubmit}
                        >
                            Kumpulkan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
