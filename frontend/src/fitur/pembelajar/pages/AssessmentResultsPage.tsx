import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/komponen/ui/button';
import { Card, CardContent, CardHeader } from '@/komponen/ui/card';
import { Badge } from '@/komponen/ui/badge';
import { Progress } from '@/komponen/ui/progress';
import { Skeleton } from '@/komponen/ui/skeleton';
import { supabase } from '@/pustaka/supabase';
import { QuestionRenderer } from '../komponen/QuestionRenderer';
import type { AssessmentAttempt, Question, Answer } from '../tipe';

export function AssessmentResultsPage() {
    const { assessmentId } = useParams<{ assessmentId: string }>();
    const navigate = useNavigate();

    const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [assessment, setAssessment] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadResults();
    }, [assessmentId]);

    const loadResults = async () => {
        if (!assessmentId) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data: pengguna } = await supabase
                .from('pengguna')
                .select('id')
                .eq('auth_id', user.id)
                .single<{ id: string }>();

            if (!pengguna) throw new Error('Pengguna not found');

            // Load assessment info
            const { data: assessmentData } = await supabase
                .from('asesmen')
                .select('*')
                .eq('id', assessmentId)
                .single();

            setAssessment(assessmentData);

            // Load latest attempt
            const { data: attemptData, error: attemptError } = await supabase
                .from('percobaan_asesmen')
                .select('*')
                .eq('id_asesmen', assessmentId)
                .eq('id_pengguna', pengguna.id)
                .eq('status', 'selesai')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (attemptError || !attemptData) {
                console.error('No finished attempt found', attemptError);
                navigate(`/pembelajar/penilaian/${assessmentId}`);
                return;
            }

            const currentAttempt = attemptData as AssessmentAttempt;
            setAttempt(currentAttempt);

            // Load questions
            const { data: questionsData } = await supabase
                .from('soal')
                .select('*')
                .eq('id_asesmen', assessmentId)
                .order('urutan', { ascending: true });

            setQuestions(questionsData as Question[] || []);

            // Load answers
            const { data: answersData } = await supabase
                .from('jawaban')
                .select('*')
                .eq('id_percobaan', currentAttempt.id);

            setAnswers(answersData as Answer[] || []);

            setIsLoading(false);
        } catch (error) {
            console.error('Error loading results:', error);
            navigate(`/pembelajar/assessments`);
        }
    };

    const getAnswerForQuestion = (questionId: string) => {
        return answers.find(a => a.id_soal === questionId);
    };

    const correctCount = answers.filter(a => a.benar === true).length;
    const incorrectCount = answers.filter(a => a.benar === false).length;
    const unansweredCount = questions.length - answers.length;
    const isPassed = (attempt?.nilai || 0) >= (assessment?.nilai_kelulusan || 70);

    if (isLoading) {
        return <Skeleton className="h-screen w-full" />;
    }

    if (!attempt || !assessment) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Hasil tidak ditemukan</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 py-8">
            <div className="container max-w-5xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/pembelajar/assessments')}
                        className="mb-4 pl-3 pr-4 rounded-xl font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kembali ke Pusat Asesmen
                    </Button>

                    <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Hasil Penilaian</span>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">{assessment.judul}</h1>
                    </div>
                </div>

                {/* Score Card */}
                <Card className="mb-8 rounded-2xl shadow-none border-border/60 overflow-hidden bg-white dark:bg-zinc-950">
                    <CardHeader className="p-6 md:p-8 pb-0">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Ringkasan Nilai</h3>
                            <Badge variant={isPassed ? 'default' : 'destructive'} className="rounded-full px-4 py-1.5 font-bold shadow-sm border-0">
                                {isPassed ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        LULUS
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        TIDAK LULUS
                                    </>
                                )}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 pt-6">
                        <div className="flex flex-col items-center justify-center mb-8 p-8 rounded-2xl bg-muted/30 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="text-7xl font-black text-primary mb-2 drop-shadow-sm">
                                {Math.round(attempt.nilai || 0)}
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                <span>Skor Anda</span>
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                <span>Minimal: {assessment.nilai_kelulusan}</span>
                            </div>
                        </div>

                        <Progress value={attempt.nilai || 0} className="h-2 mb-8 bg-muted rounded-full" />

                        <div className="grid grid-cols-3 gap-6 text-center">
                            <div className="p-5 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 group hover:scale-105 transition-transform cursor-default">
                                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
                                    {correctCount}
                                </div>
                                <p className="text-[10px] font-bold text-emerald-700/70 dark:text-emerald-300/60 uppercase tracking-widest">Benar</p>
                            </div>
                            <div className="p-5 bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/30 group hover:scale-105 transition-transform cursor-default">
                                <div className="text-3xl font-black text-rose-600 dark:text-rose-400 mb-1">
                                    {incorrectCount}
                                </div>
                                <p className="text-[10px] font-bold text-rose-700/70 dark:text-rose-300/60 uppercase tracking-widest">Salah</p>
                            </div>
                            <div className="p-5 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-2xl border border-zinc-100 dark:border-zinc-900/30 group hover:scale-105 transition-transform cursor-default">
                                <div className="text-3xl font-black text-zinc-600 dark:text-zinc-400 mb-1">
                                    {unansweredCount}
                                </div>
                                <p className="text-[10px] font-bold text-zinc-700/70 dark:text-zinc-300/60 uppercase tracking-widest">Kosong</p>
                            </div>
                        </div>

                        {assessment.tampilkan_jawaban && (
                            <div className="mt-8 p-5 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 group">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                        <AlertCircle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-blue-900 dark:text-blue-100 italic">
                                            Pembahasan Tersedia
                                        </p>
                                        <p className="text-xs text-blue-800/70 dark:text-blue-200/60 mt-1 leading-relaxed">
                                            Scroll ke bawah untuk melihat analisis dan pembahasan setiap soal demi meningkatkan pemahaman Anda.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Questions Review */}
                {assessment.tampilkan_jawaban && (<div className="space-y-6">
                    <h2 className="text-2xl font-bold">Pembahasan Soal</h2>
                    {questions.map((question, index) => {
                        const answer = getAnswerForQuestion(question.id);
                        const userAnswer = answer?.jawaban_pengguna_multiple || answer?.jawaban_pengguna;

                        return (
                            <div key={question.id} className="relative">
                                <div className="absolute -left-4 top-6">
                                    {answer?.benar === true ? (
                                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                                    ) : answer?.benar === false ? (
                                        <XCircle className="h-6 w-6 text-red-500" />
                                    ) : (
                                        <AlertCircle className="h-6 w-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="ml-4">
                                    <div className="mb-2 flex items-center gap-2">
                                        <Badge variant="outline">Soal {index + 1}</Badge>
                                        {answer && (
                                            <Badge variant={answer.benar ? 'default' : 'destructive'}>
                                                {answer.poin_diperoleh}/{question.poin} poin
                                            </Badge>
                                        )}
                                    </div>
                                    <QuestionRenderer
                                        question={question}
                                        answer={userAnswer}
                                        onAnswerChange={() => { }}
                                        disabled={true}
                                        showCorrectAnswer={true}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
                )}

                {/* Actions */}
                <div className="mt-12 flex justify-center gap-4">
                    <Button
                        variant="outline"
                        className="rounded-xl font-bold px-8 h-11 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200"
                        onClick={() => navigate('/pembelajar/assessments')}
                    >
                        Tutup Hasil
                    </Button>
                    {(assessment.jumlah_percobaan === -1 ||
                        (attempt.nomor_percobaan < assessment.jumlah_percobaan)) && (
                            <Button
                                className="rounded-xl font-bold px-8 h-11 shadow-sm"
                                onClick={() => navigate(`/pembelajar/penilaian/${assessmentId}`)}
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Coba Lagi
                            </Button>
                        )}
                </div>
            </div>
        </div>
    );
}
