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
    TrendUp
} from 'iconsax-react';
import { Search } from 'lucide-react';
import { motion } from "framer-motion";
import {
    Card,
    CardContent,
} from '@/komponen/ui/card';
import { Input } from '@/komponen/ui/input';
import { Button } from '@/komponen/ui/button';
import { Badge } from '@/komponen/ui/badge';
import { Skeleton } from '@/komponen/ui/skeleton';
import {
    useEnrollments,
    useAssessments,
    useAssessmentAttempts,
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

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 },
};

export function AssessmentsListPage() {
    const navigate = useNavigate();
    const { data: enrollments } = useEnrollments();
    const { data: assessments, isLoading: isLoadingAssessments } = useAssessments();
    const { data: assignmentsList, isLoading: isLoadingAssignments } = useAssignments();

    const [searchTerm, setSearchTerm] = useState('');

    // Get unique course IDs from enrollments for filtering
    const enrolledCourseIds = enrollments?.map(e => e.id_kursus) || [];

    // Filter Kuis & Ujian (Exams)
    // Only show exams from enrolled courses
    const quizzesAndExams = assessments?.filter(a =>
        enrolledCourseIds.includes(a.id_kursus) &&
        (a.tipe === 'kuis' || a.tipe === 'ujian')
    ).filter(a =>
        a.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.deskripsi && a.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Filter Tugas Proyek (Tasks/Assignments)
    // Only show assignments from enrolled courses
    const filteredAssignments = assignmentsList?.filter(a =>
        (a.asesmen?.kursus?.id && enrolledCourseIds.includes(a.asesmen.kursus.id))
    ).filter(a =>
        a.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.asesmen?.kursus?.judul && a.asesmen.kursus.judul.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const pendingAssignments = filteredAssignments?.filter(
        a => !a.pengumpulan_tugas || a.pengumpulan_tugas.status === 'perlu_revisi'
    );



    const AssessmentCard = ({ assessment }: { assessment: Assessment }) => {
        const { data: attempts } = useAssessmentAttempts(assessment.id);
        const bestScore = attempts?.reduce((max, attempt) => Math.max(max, attempt.nilai || 0), 0) || 0;
        const totalAttempts = attempts?.length || 0;
        const hasActiveAttempt = attempts?.some(a => a.status === 'sedang_berjalan');
        const canTakeAssessment = assessment.jumlah_percobaan === -1 || totalAttempts < assessment.jumlah_percobaan;

        const getStatusBadge = () => {
            if (hasActiveAttempt) {
                return <Badge className="bg-amber-50 text-amber-600 border-amber-100 font-bold text-[10px] px-2 h-6">Sedang Berlangsung</Badge>;
            }
            if (totalAttempts === 0) {
                return <Badge variant="outline" className="text-gray-400 border-gray-200 font-bold text-[10px] px-2 h-6">Belum Dikerjakan</Badge>;
            }
            if (bestScore >= (assessment.nilai_kelulusan || 70)) {
                return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold text-[10px] px-2 h-6">Lulus</Badge>;
            }
            return <Badge className="bg-rose-50 text-rose-600 border-rose-100 font-bold text-[10px] px-2 h-6">Belum Lulus</Badge>;
        };

        return (
            <motion.div
                variants={item}
                whileHover={{ y: -2 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-4 flex flex-col md:flex-row md:items-center gap-5"
            >
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
            </motion.div>
        );
    };

    if (isLoadingAssessments || isLoadingAssignments) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
                </div>
                <div className="space-y-4 pt-10">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
                </div>
            </div>
        );
    }

    const totalStats = {
        assessments: (quizzesAndExams?.length || 0),
        tasks: (pendingAssignments?.length || 0),
        passed: assessments?.filter(a => {
            // This is a simplified check since we can't easily hook into every attempt here without extra effect
            return false; // placeholder for actual complex logic
        }).length || 0
    };

    return (
        <motion.div
            className="space-y-8 pb-10"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {/* Header & Search */}
            <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">Pusat Asesmen</h1>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                        Selesaikan kuis, ujian, dan tugas proyek Anda untuk mengukur pemahaman materi.
                    </p>
                </div>

                <div className="relative group w-full lg:w-80">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Cari asesmen atau tugas..."
                        className="pl-10 h-10 text-xs bg-white border-gray-200 rounded-xl focus-visible:ring-primary/10 hover:border-violet-200 transition-all shadow-sm shadow-gray-100/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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

            <Tabs defaultValue="exams" className="w-full">
                <motion.div variants={item} className="mb-6">
                    <TabsList className="bg-gray-100/50 p-1 rounded-xl w-fit border border-gray-200">
                        <TabsTrigger
                            value="exams"
                            className="rounded-lg px-6 py-2 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                        >
                            Kuis & Ujian
                        </TabsTrigger>
                        <TabsTrigger
                            value="tasks"
                            className="rounded-lg px-6 py-2 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                        >
                            Tugas Proyek
                        </TabsTrigger>
                    </TabsList>
                </motion.div>

                <TabsContent value="exams" className="space-y-4 outline-none">
                    <div className="grid grid-cols-1 gap-4">
                        {quizzesAndExams && quizzesAndExams.length > 0 ? (
                            quizzesAndExams.map((assessment) => (
                                <AssessmentCard key={assessment.id} assessment={assessment} />
                            ))
                        ) : (
                            <EmptyState message="Belum ada kuis atau ujian yang tersedia untuk Anda." />
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="tasks" className="space-y-4 outline-none">
                    <div className="grid grid-cols-1 gap-4">
                        {filteredAssignments && filteredAssignments.length > 0 ? (
                            filteredAssignments.map((assignment) => {
                                const status = assignment.pengumpulan_tugas?.status || 'belum_dikerjakan';
                                return (
                                    <motion.div
                                        key={assignment.id}
                                        variants={item}
                                        whileHover={{ y: -2 }}
                                        className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-4 flex flex-col md:flex-row md:items-center gap-5"
                                    >
                                        <div className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center bg-orange-50 text-orange-500">
                                            <ClipboardText size={24} variant="Bold" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-gray-800 truncate">{assignment.judul}</h4>
                                                {status === 'belum_dikerjakan' && <Badge variant="outline" className="text-gray-400 border-gray-200 font-bold text-[10px] px-2 h-6">Belum Submit</Badge>}
                                                {status === 'perlu_revisi' && <Badge className="bg-orange-50 text-orange-600 border-orange-100 font-bold text-[10px] px-2 h-6">Perlu Revisi</Badge>}
                                                {status === 'dikumpulkan' && <Badge className="bg-sky-50 text-sky-600 border-sky-100 font-bold text-[10px] px-2 h-6">Ditinjau</Badge>}
                                                {status === 'dinilai' && <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold text-[10px] px-2 h-6">Selesai</Badge>}
                                                {status === 'ditolak' && <Badge className="bg-rose-50 text-rose-600 border-rose-100 font-bold text-[10px] px-2 h-6">Ditolak</Badge>}
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-1">{assignment.deskripsi || "Tidak ada deskripsi tersedia."}</p>

                                            <div className="flex flex-wrap items-center gap-4 mt-3">
                                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
                                                    <Timer1 size={14} variant="Bulk" className="text-gray-300" />
                                                    <span>Tenggat: {assignment.deadline ? format(new Date(assignment.deadline), 'd MMM yyyy', { locale: localeId }) : '-'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
                                                    <InfoCircle size={14} variant="Bulk" className="text-gray-300" />
                                                    <span>Kursus: {assignment.asesmen?.kursus?.judul || '-'}</span>
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
                                    </motion.div>
                                );
                            })
                        ) : (
                            <EmptyState message="Tidak ada tugas proyek yang ditemukan." />
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <motion.div variants={item} className="bg-white rounded-3xl border border-dashed border-gray-300 py-16 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Receipt2 size={40} variant="Bulk" className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{message}</h3>
            <p className="text-xs text-gray-400 max-w-sm">
                Silakan daftar kursus terlebih dahulu atau hubungi instruktur jika Anda merasa seharusnya ada tugas di sini.
            </p>
        </motion.div>
    );
}
