import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Clock,
    ChevronRight,
    ChevronLeft,
    AlertCircle
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
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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

    if (!assessment || !currentAttempt) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Assessment not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b shadow-sm">
                <div className="container max-w-5xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Sedang Mengerjakan</span>
                            <h1 className="text-lg font-bold truncate text-gray-900 dark:text-white leading-tight">{assessment.judul}</h1>
                            <p className="text-[10px] font-bold text-muted-foreground mt-0.5 uppercase tracking-tighter">
                                Butir Soal: {currentQuestionIndex + 1} / {questions.length}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            {timeRemaining !== null && (
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors shadow-sm ${timeRemaining < 300
                                    ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
                                    : 'bg-white dark:bg-zinc-900 border-muted-foreground/20'
                                    }`}>
                                    <Clock className={`h-4 w-4 ${timeRemaining < 300 ? 'animate-pulse' : ''}`} />
                                    <span className="font-mono font-black tracking-widest text-sm">{formatTime(timeRemaining)}</span>
                                </div>
                            )}

                            <Button
                                className="rounded-xl font-bold h-10 px-6 shadow-sm shadow-primary/20"
                                onClick={() => setShowSubmitDialog(true)}
                            >
                                Kumpulkan
                            </Button>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                        <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 px-0.5">
                            <span>{answeredCount} / {questions.length} Terjawab</span>
                            <span>{Math.round(progress)}% Selesai</span>
                        </div>
                        <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                            <div
                                className="h-full bg-primary transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Question */}
            <div className="container max-w-5xl mx-auto px-4 py-8">
                {currentQuestion && (
                    <QuestionRenderer
                        question={currentQuestion}
                        answer={answers[currentQuestion.id]}
                        onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
                    />
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-12 pt-8 border-t border-muted/50 gap-6">
                    <Button
                        variant="outline"
                        className="rounded-xl font-bold h-11 px-6 border-muted-foreground/20 hover:bg-muted"
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Sebelumnya
                    </Button>

                    <div className="hidden md:flex gap-2 flex-wrap justify-center flex-1 max-w-md">
                        {questions.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentQuestionIndex(index)}
                                className={`w-9 h-9 rounded-full border-2 transition-all duration-200 text-xs font-bold flex items-center justify-center ${index === currentQuestionIndex
                                    ? 'border-primary bg-primary text-primary-foreground shadow-md scale-110'
                                    : answers[questions[index].id]
                                        ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                        : 'border-muted text-muted-foreground hover:border-primary/30'
                                    }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        className="rounded-xl font-bold h-11 px-6 border-muted-foreground/20 hover:bg-muted"
                        onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                        disabled={currentQuestionIndex === questions.length - 1}
                    >
                        Selanjutnya
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </div>

            {/* Submit Confirmation Dialog */}
            <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <DialogContent className="rounded-2xl max-w-sm">
                    <DialogHeader className="space-y-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 text-primary">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <DialogTitle className="text-center text-xl font-bold">Kumpulkan Ujian?</DialogTitle>
                        <DialogDescription className="text-center font-medium">
                            Anda telah menjawab <span className="text-primary font-bold">{answeredCount} dari {questions.length}</span> soal.
                            {answeredCount < questions.length && (
                                <span className="block mt-4 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 rounded-xl text-xs font-bold leading-relaxed">
                                    <AlertCircle className="inline h-3 w-3 mr-1 mb-0.5" />
                                    Peringatan: Masih ada {questions.length - answeredCount} soal yang belum Anda jawab.
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="grid grid-cols-2 gap-3 sm:justify-center mt-6">
                        <Button variant="outline" className="rounded-xl font-bold h-11" onClick={() => setShowSubmitDialog(false)}>
                            Batal
                        </Button>
                        <Button className="rounded-xl font-bold h-11 shadow-sm shadow-primary/20" onClick={handleSubmit}>
                            Selesaikan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
