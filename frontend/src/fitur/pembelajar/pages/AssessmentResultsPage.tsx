import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CheckCircle2,
    XCircle,
    AlertCircle,
    ArrowLeft,
    RotateCcw,
    Trophy,
    Target,
    LayoutList,
    ChevronDown
} from 'lucide-react';
import { Button } from '@/komponen/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/komponen/ui/card';
import { Badge } from '@/komponen/ui/badge';
import { Progress } from '@/komponen/ui/progress';
import { Skeleton } from '@/komponen/ui/skeleton';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/komponen/ui/accordion";
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
        <div className="min-h-screen bg-zinc-50/50 pb-12">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-100 shadow-sm mb-8">
                <div className="container max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/pembelajar/assessments')}
                                className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                            >
                                <ArrowLeft className="h-4 w-4 text-gray-600" />
                            </Button>
                            <div>
                                <h1 className="text-sm font-black uppercase tracking-widest text-zinc-400">Hasil Penilaian</h1>
                                <p className="text-base font-bold text-gray-800 line-clamp-1">{assessment.judul}</p>
                            </div>
                        </div>
                        {(assessment.jumlah_percobaan === -1 || (attempt?.nomor_percobaan < assessment.jumlah_percobaan)) && (
                            <Button
                                size="sm"
                                className="rounded-xl font-bold h-9 bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200"
                                onClick={() => navigate(`/pembelajar/penilaian/${assessmentId}`)}
                            >
                                <RotateCcw className="h-3.5 w-3.5 mr-2" />
                                Coba Lagi
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="container max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Stats (Sticky on Desktop) */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                        <Card className="rounded-[24px] border-none shadow-xl shadow-gray-200/50 bg-white overflow-hidden relative">
                            {/* Background Decorative */}
                            <div className={`absolute top-0 w-full h-32 ${isPassed ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full -ml-8 -mb-8 blur-xl" />
                            </div>

                            <CardContent className="pt-16 pb-8 px-8 relative text-center">
                                <div className={`mx-auto w-20 h-20 rounded-full border-4 border-white shadow-lg flex items-center justify-center mb-4 ${isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                    {isPassed ? <Trophy className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
                                </div>

                                <h2 className="text-2xl font-black text-gray-800 mb-1">
                                    {isPassed ? 'Selamat, Lulus!' : 'Belum Lulus'}
                                </h2>
                                <p className="text-sm text-gray-500 font-medium mb-6">
                                    {isPassed ? 'Anda telah menguasai materi ini.' : 'Tingkatkan pemahaman dan coba lagi.'}
                                </p>

                                <div className="flex flex-col items-center justify-center mb-8">
                                    <div className="text-6xl font-black text-gray-800 tracking-tighter mb-2">
                                        {Math.round(attempt.nilai || 0)}
                                        <span className="text-2xl text-gray-300 ml-1">/100</span>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isPassed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        Passing Grade: {assessment.nilai_kelulusan}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="text-xl font-black text-emerald-500">{correctCount}</div>
                                        <div className="text-[9px] uppercase font-bold text-gray-400">Benar</div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="text-xl font-black text-rose-500">{incorrectCount}</div>
                                        <div className="text-[9px] uppercase font-bold text-gray-400">Salah</div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="text-xl font-black text-gray-400">{unansweredCount}</div>
                                        <div className="text-[9px] uppercase font-bold text-gray-400">Kosong</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Question Review (Scrollable) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <LayoutList className="h-5 w-5 text-gray-400" />
                                    Pembahasan Soal
                                </h3>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{questions.length} Butir Soal</span>
                            </div>

                            <Accordion type="single" collapsible className="w-full">
                                {questions.map((question, index) => {
                                    const answer = getAnswerForQuestion(question.id);
                                    const userAnswer = answer?.jawaban_pengguna_multiple || answer?.jawaban_pengguna;
                                    const isCorrect = answer?.benar === true;
                                    const isWrong = answer?.benar === false;
                                    const isUnanswered = !answer;

                                    return (
                                        <AccordionItem key={question.id} value={question.id} className="border-b border-gray-50 last:border-0">
                                            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50/50 group">
                                                <div className="flex items-center gap-4 text-left w-full pr-4">
                                                    <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-bold text-xs ring-2 ring-offset-2 ${isCorrect ? 'bg-emerald-100 text-emerald-600 ring-emerald-500/20' :
                                                            isWrong ? 'bg-rose-100 text-rose-600 ring-rose-500/20' :
                                                                'bg-gray-100 text-gray-400 ring-gray-200'
                                                        }`}>
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm text-gray-700 line-clamp-1 group-hover:text-violet-600 transition-colors">
                                                            {question.pertanyaan}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isCorrect ? 'text-emerald-600' :
                                                                    isWrong ? 'text-rose-600' :
                                                                        'text-gray-400'
                                                                }`}>
                                                                {isCorrect ? 'Benar' : isWrong ? 'Salah' : 'Tidak Dijawab'}
                                                            </span>
                                                            <span className="text-[10px] text-gray-300">•</span>
                                                            <span className="text-[10px] text-gray-400 font-medium">
                                                                {answer?.poin_diperoleh || 0} / {question.poin} Poin
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-6 pb-6 pt-2 bg-gray-50/30">
                                                <QuestionRenderer
                                                    question={question}
                                                    answer={userAnswer}
                                                    onAnswerChange={() => { }}
                                                    disabled={true}
                                                    showCorrectAnswer={true}
                                                    variant="plain"
                                                />
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
