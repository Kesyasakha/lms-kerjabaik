import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    InfoCircle,
    Play,
    Eye,
    Receipt2,
    TickCircle,
    Ranking,
    Timer1,
    ClipboardText,
    Chart,
    TrendUp,
    Sort,
    Filter
} from 'iconsax-react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import {
    Card,
    CardContent,
} from '@/komponen/ui/card';
import { Input } from '@/komponen/ui/input';
import { Button } from '@/komponen/ui/button';
import { Badge } from '@/komponen/ui/badge';
import { Skeleton } from '@/komponen/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/komponen/ui/select";
import {
    useEnrollments,
    useAssessments,
    useAllAssessmentAttempts,
    useAssignments
} from '@/fitur/pembelajar/api/learnerApi';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/komponen/ui/tabs';
import type { Assessment } from '../tipe';

export function AssessmentsListPage() {
    const navigate = useNavigate();

    // Animasi variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    const { data: enrollments, isLoading: isLoadingEnrollments } = useEnrollments();
    const { data: assessments, isLoading: isLoadingAssessments } = useAssessments();
    const { data: assignmentsList, isLoading: isLoadingAssignments } = useAssignments();
    const { data: allAttempts, isLoading: isLoadingAttempts } = useAllAssessmentAttempts();

    const isDataLoading = isLoadingEnrollments || isLoadingAssessments || isLoadingAssignments || isLoadingAttempts;

    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('exams');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    // Get unique course IDs from enrollments for filtering
    const enrolledCourseIds = enrollments?.map(e => e.id_kursus) || [];

    // Filter Kuis & Ujian (Exams)
    const quizzesAndExams = assessments?.filter(a =>
        enrolledCourseIds.includes(a.id_kursus) &&
        (a.tipe === 'kuis' || a.tipe === 'ujian')
    ).filter(a =>
        a.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.deskripsi && a.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    // Filter Tugas Proyek (Tasks/Assignments)
    const filteredAssignments = assignmentsList?.filter(a =>
        (a.asesmen?.kursus?.id && enrolledCourseIds.includes(a.asesmen.kursus.id))
    ).filter(a =>
        a.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.asesmen?.kursus?.judul && a.asesmen.kursus.judul.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    const pendingAssignments = filteredAssignments?.filter(
        a => !a.pengumpulan_tugas || a.pengumpulan_tugas.status === 'perlu_revisi'
    );

    const totalStats = {
        assessments: (quizzesAndExams?.length || 0),
        tasks: (pendingAssignments?.length || 0),
        passed: assessments?.filter(a => {
            const assessmentAttempts = allAttempts?.filter(at => at.id_asesmen === a.id) || [];
            const bestScore = assessmentAttempts.reduce((max, attempt) => Math.max(max, attempt.nilai || 0), 0);
            return bestScore >= (a.nilai_kelulusan || 70);
        }).length || 0
    };

    const AssessmentCard = ({ assessment, courseName }: { assessment: Assessment, courseName?: string }) => {
        const attempts = allAttempts?.filter(a => a.id_asesmen === assessment.id) || [];
        const bestScore = attempts.reduce((max, attempt) => Math.max(max, attempt.nilai || 0), 0) || 0;
        const totalAttempts = attempts.length || 0;
        const hasActiveAttempt = attempts.some(a => a.status === 'sedang_berjalan');
        const canTakeAssessment = assessment.jumlah_percobaan === -1 || totalAttempts < assessment.jumlah_percobaan;

        const getStatusBadge = () => {
            if (hasActiveAttempt) {
                return <Badge className="bg-amber-50 text-amber-600 border-amber-100 font-bold text-[10px] px-2 h-6 hover:bg-amber-50 cursor-default">Sedang Berlangsung</Badge>;
            }
            if (totalAttempts === 0) {
                return <Badge variant="outline" className="text-gray-400 border-gray-200 font-bold text-[10px] px-2 h-6 hover:bg-transparent cursor-default">Belum Dikerjakan</Badge>;
            }
            if (bestScore >= (assessment.nilai_kelulusan || 70)) {
                return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold text-[10px] px-2 h-6 hover:bg-emerald-50 cursor-default">Lulus</Badge>;
            }
            return <Badge className="bg-rose-50 text-rose-600 border-rose-100 font-bold text-[10px] px-2 h-6 hover:bg-rose-50 cursor-default">Belum Lulus</Badge>;
        };

        return (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-4 flex flex-col md:flex-row md:items-center gap-5">
                <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${assessment.tipe === 'ujian' ? 'bg-rose-50 text-rose-500' : 'bg-violet-50 text-violet-500'}`}>
                    {assessment.tipe === 'ujian' ? <Receipt2 size={24} variant="Bold" /> : <TickCircle size={24} variant="Bold" />}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-800 truncate">{assessment.judul}</h4>
                        {getStatusBadge()}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">{assessment.deskripsi || "Tidak ada deskripsi tersedia."}</p>

                    <div className="flex flex-wrap items-center gap-4 mt-3">
                         {/* Course Label Added Here */}
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                             <InfoCircle size={14} variant="Bulk" className="text-gray-400" />
                             <span className="truncate max-w-[200px]">Kursus: {courseName || '-'}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
                            <Timer1 size={14} variant="Bulk" className="text-gray-300" />
                            <span>{assessment.durasi_menit} Menit</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
                            <Ranking size={14} variant="Bulk" className="text-gray-300" />
                            <span>Min. Kelulusan: {assessment.nilai_kelulusan}%</span>
                        </div>
                        {totalAttempts > 0 && (
                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
                                <TrendUp size={14} variant="Bulk" className="text-emerald-400" />
                                <span className="text-emerald-600 font-bold">Skor Terbaik: {bestScore}%</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 md:pl-4 md:border-l border-gray-100">
                    {hasActiveAttempt ? (
                        <Button
                            size="sm"
                            className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-9 px-4 text-xs font-bold transition-all active:scale-95"
                            onClick={() => {
                                const activeAttempt = attempts?.find(a => a.status === 'sedang_berjalan');
                                navigate(`/pembelajar/penilaian/${assessment.id}/take/${activeAttempt?.id}`);
                            }}
                        >
                            Lanjutkan
                        </Button>
                    ) : canTakeAssessment ? (
                        <Button
                            size="sm"
                            className={`${totalAttempts === 0 ? 'bg-primary' : 'bg-white text-primary border-primary/20 hover:bg-primary/5'} rounded-xl h-9 px-4 text-xs font-bold transition-all active:scale-95`}
                            onClick={() => navigate(`/pembelajar/penilaian/${assessment.id}`)}
                        >
                            <Play size={14} variant="Bold" className="mr-1.5" />
                            {totalAttempts === 0 ? 'Mulai Sekarang' : 'Ulangi Asesmen'}
                        </Button>
                    ) : (
                        <Button size="sm" variant="ghost" disabled className="rounded-xl h-9 px-4 text-xs font-bold opacity-50 cursor-not-allowed">
                            Kesempatan Habis
                        </Button>
                    )}

                    {totalAttempts > 0 && (
                        <button
                            onClick={() => navigate(`/pembelajar/penilaian/${assessment.id}/results`)}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all active:scale-90"
                            title="Lihat Hasil"
                        >
                            <Eye size={18} />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 pb-10"
        >
            {/* Header, Search & Filter */}
            <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">Pusat Asesmen</h1>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                        Selesaikan kuis, ujian, dan tugas proyek Anda untuk mengukur pemahaman materi.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative group w-full lg:w-80">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Cari asesmen atau tugas..."
                            className="pl-10 h-10 text-xs bg-white border-gray-200 rounded-xl focus-visible:ring-primary/10 hover:border-violet-200 transition-all shadow-sm shadow-gray-100/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <Select value={sortOrder} onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}>
                        <SelectTrigger className="w-full sm:w-[140px] h-10 rounded-xl text-xs font-medium bg-white border-gray-200 hover:border-violet-200 transition-all shadow-sm shadow-gray-100/50">
                            <div className="flex items-center gap-2">
                                <Sort size={16} className="text-gray-500" />
                                <SelectValue placeholder="Urutkan" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-100 shadow-xl shadow-gray-200/50">
                            <SelectItem value="newest" className="text-xs font-medium focus:bg-gray-50 focus:text-primary cursor-pointer">Terbaru</SelectItem>
                            <SelectItem value="oldest" className="text-xs font-medium focus:bg-gray-50 focus:text-primary cursor-pointer">Terlama</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <Card className="shadow-sm border-gray-200 rounded-2xl">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Kuis/Ujian</p>
                            <h3 className="text-2xl font-black text-gray-800">{totalStats.assessments}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                            <Receipt2 size={20} variant="Bulk" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-gray-200 rounded-2xl">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tugas Aktif</p>
                            <h3 className="text-2xl font-black text-gray-800">{totalStats.tasks}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                            <ClipboardText size={20} variant="Bulk" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-gray-200 rounded-2xl">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rata-rata Skor</p>
                            <div className="flex items-center gap-2">
                                <h3 className="text-2xl font-black text-gray-800">85%</h3>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">+5%</span>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500">
                            <Chart size={20} variant="Bulk" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-gray-200 rounded-2xl">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Asesmen Lulus</p>
                            <h3 className="text-2xl font-black text-gray-800">{totalStats.passed}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                            <TickCircle size={20} variant="Bulk" />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={item}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="mb-6">
                        <TabsList className="bg-gray-100/50 p-1 rounded-xl w-fit border border-gray-200 relative">
                            <TabsTrigger
                                value="exams"
                                className="relative rounded-lg px-6 py-2 text-xs font-bold transition-all data-[state=active]:text-primary z-10"
                            >
                                {activeTab === 'exams' && (
                                    <motion.div
                                        layoutId="active-tab-pill"
                                        className="absolute inset-0 bg-white rounded-lg shadow-sm"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-20">Kuis & Ujian</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="tasks"
                                className="relative rounded-lg px-6 py-2 text-xs font-bold transition-all data-[state=active]:text-primary z-10"
                            >
                                {activeTab === 'tasks' && (
                                    <motion.div
                                        layoutId="active-tab-pill"
                                        className="absolute inset-0 bg-white rounded-lg shadow-sm"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-20">Tugas Proyek</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <AnimatePresence mode="popLayout">
                        {activeTab === 'exams' && (
                            <TabsContent value="exams" key="exams" forceMount className="space-y-4 outline-none">
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="grid grid-cols-1 gap-4"
                                >
                                    {isDataLoading ? (
                                        Array(3).fill(0).map((_, i) => (
                                            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <Skeleton className="w-12 h-12 rounded-2xl" />
                                                    <div className="space-y-2 flex-1">
                                                        <Skeleton className="h-5 w-1/3" />
                                                        <Skeleton className="h-4 w-1/2" />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Skeleton className="h-4 w-20" />
                                                    <Skeleton className="h-4 w-20" />
                                                </div>
                                            </div>
                                        ))
                                    ) : quizzesAndExams && quizzesAndExams.length > 0 ? (
                                        quizzesAndExams.map((assessment) => {
                                             const course = enrollments?.find(e => e.id_kursus === assessment.id_kursus)?.kursus;
                                             return (
                                                <AssessmentCard 
                                                    key={assessment.id} 
                                                    assessment={assessment} 
                                                    courseName={course?.judul}
                                                />
                                            );
                                        })
                                    ) : (
                                        <EmptyState message="Belum ada kuis atau ujian yang tersedia untuk Anda." />
                                    )}
                                </motion.div>
                            </TabsContent>
                        )}

                        {activeTab === 'tasks' && (
                            <TabsContent value="tasks" key="tasks" forceMount className="space-y-4 outline-none">
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="grid grid-cols-1 gap-4"
                                >
                                    {isDataLoading ? (
                                        Array(3).fill(0).map((_, i) => (
                                            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <Skeleton className="w-12 h-12 rounded-2xl" />
                                                    <div className="space-y-2 flex-1">
                                                        <Skeleton className="h-5 w-1/3" />
                                                        <Skeleton className="h-4 w-1/2" />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Skeleton className="h-4 w-20" />
                                                    <Skeleton className="h-4 w-20" />
                                                </div>
                                            </div>
                                        ))
                                    ) : filteredAssignments && filteredAssignments.length > 0 ? (
                                        filteredAssignments.map((assignment) => {
                                            const status = assignment.pengumpulan_tugas?.status || 'belum_dikerjakan';
                                            return (
                                                <div
                                                    key={assignment.id}
                                                    className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-4 flex flex-col md:flex-row md:items-center gap-5"
                                                >
                                                    <div className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center bg-orange-50 text-orange-500">
                                                        <ClipboardText size={24} variant="Bold" />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-gray-800 truncate">{assignment.judul}</h4>
                                                            {status === 'belum_dikerjakan' && <Badge variant="outline" className="text-gray-400 border-gray-200 font-bold text-[10px] px-2 h-6 hover:bg-transparent cursor-default">Belum Submit</Badge>}
                                                            {status === 'perlu_revisi' && <Badge className="bg-orange-50 text-orange-600 border-orange-100 font-bold text-[10px] px-2 h-6 hover:bg-orange-50 cursor-default">Perlu Revisi</Badge>}
                                                            {status === 'dikumpulkan' && <Badge className="bg-sky-50 text-sky-600 border-sky-100 font-bold text-[10px] px-2 h-6 hover:bg-sky-50 cursor-default">Ditinjau</Badge>}
                                                            {status === 'dinilai' && <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold text-[10px] px-2 h-6 hover:bg-emerald-50 cursor-default">Selesai</Badge>}
                                                            {status === 'ditolak' && <Badge className="bg-rose-50 text-rose-600 border-rose-100 font-bold text-[10px] px-2 h-6 hover:bg-rose-50 cursor-default">Ditolak</Badge>}
                                                        </div>
                                                        <p className="text-xs text-gray-500 line-clamp-1">{assignment.deskripsi || "Tidak ada deskripsi tersedia."}</p>

                                                        <div className="flex flex-wrap items-center gap-4 mt-3">
                                                            
                                                             {/* Course Label Added Here */}
                                                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                                                <InfoCircle size={14} variant="Bulk" className="text-gray-400" />
                                                                <span className="truncate max-w-[200px]">Kursus: {assignment.asesmen?.kursus?.judul || '-'}</span>
                                                            </div>

                                                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
                                                                <Timer1 size={14} variant="Bulk" className="text-gray-300" />
                                                                <span>Tenggat: {assignment.deadline ? format(new Date(assignment.deadline), 'd MMM yyyy', { locale: localeId }) : '-'}</span>
                                                            </div>
                                                            {status === 'dinilai' && (
                                                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
                                                                    <TrendUp size={14} variant="Bulk" className="text-emerald-400" />
                                                                    <span className="text-emerald-600 font-bold">Nilai: {assignment.pengumpulan_tugas?.nilai}/100</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 md:pl-4 md:border-l border-gray-100">
                                                        <Button
                                                            size="sm"
                                                            className={`${status === 'belum_dikerjakan' || status === 'perlu_revisi' ? 'bg-primary' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'} rounded-xl h-9 px-4 text-xs font-bold transition-all active:scale-95`}
                                                            onClick={() => navigate(`/pembelajar/assignments/${assignment.id}`)}
                                                        >
                                                            {status === 'belum_dikerjakan' ? 'Kerjakan Sekarang' : status === 'perlu_revisi' ? 'Revisi Tugas' : 'Lihat Detail'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <EmptyState message="Tidak ada tugas proyek yang ditemukan." />
                                    )}
                                </motion.div>
                            </TabsContent>
                        )}
                    </AnimatePresence>
                </Tabs>
            </motion.div>
        </motion.div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 py-16 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Receipt2 size={40} variant="Bulk" className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{message}</h3>
            <p className="text-xs text-gray-400 max-w-sm">
                Silakan daftar kursus terlebih dahulu atau hubungi instruktur jika Anda merasa seharusnya ada tugas di sini.
            </p>
        </div>
    );
}
