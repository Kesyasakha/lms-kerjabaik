import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Clock,
    ChevronRight,
    AlertCircle,
    Play,
    Timer,
    ClipboardList,
    Trophy,
    ArrowLeft,
    Award
} from 'lucide-react';
import { TickCircle } from 'iconsax-react';
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
            if (!assessmentId || !assessment || !isLoading) return;

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
                    // Start new attempt only if we don't have one and not currently loading questions
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
                        ? [...soal].sort(() => Math.random() - 0.5)
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
    }, [assessmentId, attemptId, !!assessment]);

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
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        
        if (h > 0) {
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const currentQuestion = questions[currentQuestionIndex];
    const answeredCount = Object.keys(answers).filter(k => answers[k]).length;

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
            <div className="min-h-screen bg-zinc-50/50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-2xl"
                >
                    <Card className="rounded-[32px] border-zinc-200/50 shadow-2xl shadow-zinc-200/50 overflow-hidden bg-white/80 backdrop-blur-xl">
                        {/* Compact Header */}
                        <div className="px-8 pt-8 pb-4 flex items-start justify-between gap-6">
                            <div className="space-y-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate('/pembelajar/assessments')}
                                    className="text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 -ml-3 h-8 px-3 rounded-full"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                                    <span className="text-[11px] font-bold">Kembali</span>
                                </Button>
                                
                                <div className="space-y-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 text-violet-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-violet-100">
                                        <Trophy className="h-3 w-3" />
                                        Asesmen
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-black text-zinc-900 leading-tight">
                                        {assessment.judul}
                                    </h1>
                                    <p className="text-sm font-medium text-zinc-500 leading-relaxed max-w-lg">
                                        {assessment.deskripsi || "Persiapkan diri Anda dengan baik. Pastikan koneksi internet stabil sebelum memulai ujian ini."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6">
                            {/* Stats Grid - Single Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 items-center justify-center flex flex-col text-center">
                                    <div className="mb-2 p-2 bg-blue-100 text-blue-600 rounded-xl">
                                        <Timer className="h-4 w-4" />
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Durasi</span>
                                    <span className="text-sm font-black text-zinc-800">{assessment.durasi_menit} Menit</span>
                                </div>
                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 items-center justify-center flex flex-col text-center">
                                    <div className="mb-2 p-2 bg-purple-100 text-purple-600 rounded-xl">
                                        <ClipboardList className="h-4 w-4" />
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Soal</span>
                                    <span className="text-sm font-black text-zinc-800">{questions.length} Butir</span>
                                </div>
                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 items-center justify-center flex flex-col text-center">
                                    <div className="mb-2 p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                                        <Trophy className="h-4 w-4" />
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">KKM</span>
                                    <span className="text-sm font-black text-zinc-800">{assessment.nilai_kelulusan}%</span>
                                </div>
                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 items-center justify-center flex flex-col text-center">
                                    <div className="mb-2 p-2 bg-amber-100 text-amber-600 rounded-xl">
                                        <Award className="h-4 w-4" />
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Poin</span>
                                    <span className="text-sm font-black text-zinc-800">{totalPoints}</span>
                                </div>
                            </div>

                            {/* Actions & Warning */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <p className="text-[11px] font-medium leading-tight">
                                        <span className="font-bold">Penting:</span> Waktu akan berjalan otomatis saat tombol ditekan. Dilarang refresh halaman.
                                    </p>
                                </div>

                                <Button
                                    className="w-full h-12 rounded-xl text-base font-black bg-zinc-900 hover:bg-black text-white shadow-xl shadow-zinc-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                                    onClick={() => setViewMode('taking')}
                                >
                                    <span>MULAI MENGERJAKAN</span>
                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50/50 p-4 lg:p-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content - Question Area */}
                <div className="lg:col-span-3 space-y-4">
                    <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden">
                        <CardContent className="p-6">
                            {/* Question Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-[10px] font-black uppercase tracking-widest text-violet-600 mb-1">
                                        SOAL {currentQuestionIndex + 1} / {questions.length}
                                    </h2>
                                    <div className="h-1 w-8 bg-violet-600 rounded-full" />
                                </div>
                                <div className="px-2 py-0.5 bg-gray-100 rounded-md text-[9px] font-bold text-gray-500 uppercase tracking-wider border border-gray-200">
                                    {currentQuestion?.poin || 0} Poin
                                </div>
                            </div>

                            {/* Question Title */}
                            <div className="mb-6">
                                {currentQuestion && (
                                    <QuestionRenderer
                                        question={currentQuestion}
                                        answer={answers[currentQuestion.id]}
                                        onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
                                    />
                                )}
                            </div>

                            {/* Navigation Buttons (Bottom of Card) */}
                            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl font-bold border-gray-200 bg-white hover:bg-gray-50 text-gray-700 min-w-[100px] h-9 text-xs"
                                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentQuestionIndex === 0}
                                >
                                    <ArrowLeft className="h-3.5 w-3.5 mr-2" />
                                    Sebelumnya
                                </Button>

                                <Button
                                    size="sm"
                                    className="rounded-xl font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200 min-w-[100px] h-9 text-xs"
                                    onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                    disabled={currentQuestionIndex === questions.length - 1}
                                >
                                    Selanjutnya
                                    <ChevronRight className="h-3.5 w-3.5 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - Timer & Navigation */}
                <div className="space-y-4">
                    {/* Timer Card */}
                    <Card className="border-none shadow-md shadow-blue-100/50 bg-gradient-to-br from-white to-blue-50/50 rounded-2xl overflow-hidden">
                        <CardContent className="p-4 text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">SISA WAKTU</p>
                            {timeRemaining !== null ? (
                                <div className="flex flex-col items-center">
                                    <div className="text-2xl font-black text-gray-800 font-mono tracking-tighter mb-3 flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-blue-500 animate-pulse" />
                                        {formatTime(timeRemaining)}
                                    </div>
                                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                            style={{ 
                                                width: `${(timeRemaining / (assessment?.durasi_menit ? assessment.durasi_menit * 60 : 1)) * 100}%` 
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center py-1">
                                    <Timer className="h-6 w-6 text-gray-300 mb-1" />
                                    <span className="text-sm font-black text-gray-400">Tanpa Batas</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Navigation Grid */}
                    <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-800 text-sm">Navigasi Soal</h3>
                            </div>

                            {/* Legend */}
                            <div className="flex flex-wrap gap-2 mb-4 text-[9px] font-medium text-gray-500">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-blue-600" /> Aktif
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> Dijawab
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-gray-200" /> Belum
                                </div>
                            </div>

                            {/* Grid */}
                            <div className="grid grid-cols-5 gap-2">
                                {questions.map((q, index) => {
                                    const isCurrent = index === currentQuestionIndex;
                                    const isAnswered = !!answers[q.id];
                                    
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentQuestionIndex(index)}
                                            className={`
                                                aspect-square rounded-lg text-[10px] font-bold transition-all duration-200 border
                                                ${isCurrent 
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200 scale-105 z-10' 
                                                    : isAnswered 
                                                        ? 'bg-emerald-500 text-white border-emerald-500' 
                                                        : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200 hover:bg-blue-50'
                                                }
                                            `}
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Submit Button */}
                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <Button
                                    className="w-full h-10 rounded-xl font-bold bg-gray-900 hover:bg-black text-white shadow-lg shadow-gray-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    onClick={() => setShowSubmitDialog(true)}
                                >
                                    <TickCircle className="h-4 w-4" variant="Bulk" />
                                    <span>Kumpulkan Ujian</span>
                                </Button>
                                <p className="text-[9px] text-gray-400 text-center mt-2 leading-tight">
                                    Cek kembali jawaban sebelum mengumpulkan.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
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
