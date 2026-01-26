import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Clock,
    Trophy,
    AlertCircle,
    Play,
    CheckCircle2,
    Search
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
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
    TabsTrigger,
} from '@/komponen/ui/tabs';
import type { Assessment } from '../tipe';

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

    const submittedAssignments = filteredAssignments?.filter(
        a => a.pengumpulan_tugas?.status === 'dikumpulkan'
    );

    const gradedAssignments = filteredAssignments?.filter(
        a => a.pengumpulan_tugas?.status === 'dinilai' || a.pengumpulan_tugas?.status === 'ditolak'
    );

    const getDeadlineStatus = (deadline?: string) => {
        if (!deadline) return null;
        const date = new Date(deadline);
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days < 0) return <Badge variant="destructive" className="rounded-full shadow-sm border-0 font-bold px-3">Terlewat</Badge>;
        if (days <= 3) return <Badge className="bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-0 rounded-full shadow-sm font-bold px-3">Sisa {days} hari</Badge>;
        return <Badge variant="secondary" className="rounded-full border-0 font-bold px-3 text-[10px]">Tenggat: {format(date, 'd MMM', { locale: localeId })}</Badge>;
    };

    const AssessmentCard = ({ assessment }: { assessment: Assessment }) => {
        const { data: attempts } = useAssessmentAttempts(assessment.id);
        const bestScore = attempts?.reduce((max, attempt) => Math.max(max, attempt.nilai || 0), 0) || 0;
        const totalAttempts = attempts?.length || 0;
        const hasActiveAttempt = attempts?.some(a => a.status === 'sedang_berjalan');
        const canTakeAssessment = assessment.jumlah_percobaan === -1 || totalAttempts < assessment.jumlah_percobaan;

        const getStatusBadge = () => {
            if (hasActiveAttempt) {
                return <Badge className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-0 shadow-sm rounded-full font-bold px-3">Sedang Berlangsung</Badge>;
            }
            if (totalAttempts === 0) {
                return <Badge variant="secondary" className="font-bold rounded-full border-0 px-3">Belum Dikerjakan</Badge>;
            }
            if (bestScore >= assessment.nilai_kelulusan) {
                return <Badge className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-0 shadow-sm rounded-full font-bold px-3">Lulus</Badge>;
            }
            return <Badge variant="destructive" className="rounded-full shadow-sm border-0 font-bold px-3">Belum Lulus</Badge>;
        };

        return (
            <Card className="hover:shadow-lg transition-all duration-300 rounded-2xl shadow-none border-border/60 hover:-translate-y-1 hover:border-primary/50 group flex flex-col h-full bg-white dark:bg-zinc-950 overflow-hidden">
                <CardHeader className="p-6 pb-2">
                    <div className="flex justify-between items-start gap-2 mb-3">
                        <Badge variant="outline" className="capitalize rounded-full bg-muted/50 border-none px-3 font-bold text-[10px] tracking-wider">
                            {assessment.tipe}
                        </Badge>
                        {getStatusBadge()}
                    </div>
                    <CardTitle className="text-lg font-bold leading-tight group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors line-clamp-2">{assessment.judul}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-2 text-sm font-medium">
                        {assessment.deskripsi}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-4 space-y-6 flex-grow flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-[11px] font-bold uppercase tracking-tight">
                        {assessment.durasi_menit && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                    <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span>{assessment.durasi_menit} menit</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                <Trophy className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span>Minimal {assessment.nilai_kelulusan}%</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="w-6 h-6 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                                <AlertCircle className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                            </div>
                            <span>
                                {assessment.jumlah_percobaan === -1
                                    ? 'Unlimited'
                                    : `${totalAttempts}/${assessment.jumlah_percobaan} percobaan`
                                }
                            </span>
                        </div>
                        {totalAttempts > 0 && (
                            <div className="flex items-center gap-1.5 text-emerald-600 col-span-2 pt-2 border-t border-dashed">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                                    <CheckCircle2 className="h-3 w-3" />
                                </div>
                                <span>
                                    Nilai terbaik: <span className="text-sm">{bestScore}%</span>
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 pt-2">
                        {hasActiveAttempt ? (
                            <Button
                                className="flex-1 rounded-xl font-bold h-10 shadow-sm"
                                onClick={() => {
                                    const activeAttempt = attempts?.find(a => a.status === 'sedang_berjalan');
                                    navigate(`/pembelajar/penilaian/${assessment.id}/take/${activeAttempt?.id}`);
                                }}
                            >
                                Lanjutkan
                            </Button>
                        ) : canTakeAssessment ? (
                            <Button
                                className="flex-1 rounded-xl font-bold h-10 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-200"
                                onClick={() => navigate(`/pembelajar/penilaian/${assessment.id}`)}
                            >
                                <Play className="h-3.5 w-3.5 mr-2" />
                                {totalAttempts === 0 ? 'Mulai Sekarang' : 'Coba Lagi'}
                            </Button>
                        ) : (
                            <Button className="flex-1 rounded-xl font-bold h-10" variant="secondary" disabled>
                                Percobaan Habis
                            </Button>
                        )}

                        {totalAttempts > 0 && (
                            <Button
                                variant="outline"
                                className="rounded-xl font-bold h-10 px-4 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200"
                                onClick={() => navigate(`/pembelajar/penilaian/${assessment.id}/results`)}
                            >
                                Hasil
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    if (isLoadingAssessments || isLoadingAssignments) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-64" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pusat Asesmen</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Kelola tugas proyek dan kuis ujian Anda dalam satu tempat yang terorganisir.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari asesmen atau tugas..."
                            className="pl-10 h-10 rounded-xl border-muted-foreground/20 focus:border-primary/50 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Tabs defaultValue="exams" className="w-full">
                <TabsList className="inline-flex h-11 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground mb-8">
                    <TabsTrigger value="exams" className="rounded-lg px-6 py-2">Kuis & Ujian</TabsTrigger>
                    <TabsTrigger value="tasks" className="rounded-lg px-6 py-2">Tugas Proyek</TabsTrigger>
                </TabsList>

                <TabsContent value="exams" className="space-y-6 outline-none">
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl flex items-start gap-4 border border-blue-100 dark:border-blue-900/30 mb-6 group">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-blue-900 dark:text-blue-100 italic">Ruang Ujian</h3>
                            <p className="text-xs text-blue-700/70 dark:text-blue-300/60 mt-1 leading-relaxed">
                                Kerjakan kuis dan ujian untuk menguji pemahaman teori Anda. Hasil akan langsung keluar setelah dikumpulkan.
                            </p>
                        </div>
                    </div>
                    {quizzesAndExams && quizzesAndExams.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {quizzesAndExams.map((assessment) => (
                                <AssessmentCard key={assessment.id} assessment={assessment} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState message="Belum ada kuis atau ujian yang tersedia untuk Anda." />
                    )}
                </TabsContent>

                <TabsContent value="tasks" className="space-y-6 outline-none">
                    <div className="bg-orange-50/50 dark:bg-orange-900/10 p-4 rounded-xl flex items-start gap-4 border border-orange-100 dark:border-orange-900/30 mb-6 group">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                            <Trophy className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-orange-900 dark:text-orange-100 italic">Pusat Tugas</h3>
                            <p className="text-xs text-orange-700/70 dark:text-orange-300/60 mt-1 leading-relaxed">
                                Kirimkan tugas praktik atau proyek akhir Anda untuk mendapatkan penilaian dan feedback dari instruktur.
                            </p>
                        </div>
                    </div>

                    <Tabs defaultValue="pending" className="w-full">
                        <TabsList className="inline-flex h-10 items-center justify-center rounded-xl bg-muted/50 p-1 text-muted-foreground mb-6">
                            <TabsTrigger value="pending" className="rounded-lg px-4 py-1.5 text-xs font-bold">
                                Perlu Dikerjakan
                                {pendingAssignments && pendingAssignments.length > 0 && (
                                    <Badge variant="secondary" className="ml-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-none">
                                        {pendingAssignments.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="submitted" className="rounded-lg px-4 py-1.5 text-xs font-bold">Dikumpulkan</TabsTrigger>
                            <TabsTrigger value="graded" className="rounded-lg px-4 py-1.5 text-xs font-bold">Dinilai</TabsTrigger>
                        </TabsList>

                        <TabsContent value="pending" className="mt-4 outline-none">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {pendingAssignments && pendingAssignments.length > 0 ? (
                                    pendingAssignments.map((assignment) => (
                                        <Card key={assignment.id} className="flex flex-col rounded-2xl shadow-none hover:shadow-lg transition-all duration-300 border-border/60 hover:-translate-y-1 hover:border-primary/50 group bg-white dark:bg-zinc-950 overflow-hidden h-full">
                                            <CardHeader className="p-6 pb-2">
                                                <div className="flex justify-between items-start gap-2 mb-3">
                                                    <Badge variant="outline" className="rounded-full bg-muted/50 border-none px-3 font-bold text-[10px] tracking-wider truncate max-w-[150px]">{assignment.asesmen?.kursus?.judul}</Badge>
                                                    {getDeadlineStatus(assignment.deadline)}
                                                </div>
                                                <CardTitle className="line-clamp-2 mt-2 text-lg font-bold group-hover:text-primary transition-colors leading-tight">{assignment.judul}</CardTitle>
                                                <CardDescription className="line-clamp-2 mt-2 text-sm font-medium">
                                                    {assignment.deskripsi}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-6 pt-4 mt-auto">
                                                <Button
                                                    className="w-full rounded-xl font-bold h-10 shadow-sm"
                                                    onClick={() => navigate(`/pembelajar/assignments/${assignment.id}`)}
                                                >
                                                    <Play className="h-3.5 w-3.5 mr-2" />
                                                    Kerjakan Tugas
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="col-span-full">
                                        <EmptyState message="Tidak ada tugas yang perlu dikerjakan saat ini" />
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="submitted" className="mt-4 outline-none">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {submittedAssignments && submittedAssignments.length > 0 ? (
                                    submittedAssignments.map((assignment) => (
                                        <Card key={assignment.id} className="rounded-2xl shadow-none hover:shadow-lg transition-all duration-300 border-border/60 hover:-translate-y-1 hover:border-primary/50 group bg-white dark:bg-zinc-950 overflow-hidden flex flex-col h-full">
                                            <CardHeader className="p-6 pb-2">
                                                <div className="flex justify-between items-start gap-2 mb-3">
                                                    <Badge variant="outline" className="rounded-full bg-muted/50 border-none px-3 font-bold text-[10px] tracking-wider truncate max-w-[150px]">{assignment.asesmen?.kursus?.judul}</Badge>
                                                    <Badge className="bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800 rounded-full shadow-sm border-0 font-bold px-3">
                                                        Dikumpulkan
                                                    </Badge>
                                                </div>
                                                <CardTitle className="line-clamp-2 mt-2 text-lg font-bold group-hover:text-primary transition-colors leading-tight">{assignment.judul}</CardTitle>
                                                <CardDescription className="text-xs font-bold text-muted-foreground mt-2">
                                                    Dikumpulkan: {assignment.pengumpulan_tugas?.created_at ? format(new Date(assignment.pengumpulan_tugas.created_at), 'd MMM HH:mm', { locale: localeId }) : '-'}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-6 pt-4 mt-auto">
                                                <Button
                                                    variant="outline"
                                                    className="w-full rounded-xl font-bold h-10 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200"
                                                    onClick={() => navigate(`/pembelajar/assignments/${assignment.id}`)}
                                                >
                                                    Lihat Detail
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="col-span-full">
                                        <EmptyState message="Belum ada tugas yang dikumpulkan" />
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="graded" className="mt-4 outline-none">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {gradedAssignments && gradedAssignments.length > 0 ? (
                                    gradedAssignments.map((assignment) => (
                                        <Card key={assignment.id} className="rounded-2xl shadow-none hover:shadow-lg transition-all duration-300 border-border/60 hover:-translate-y-1 hover:border-primary/50 group bg-white dark:bg-zinc-950 overflow-hidden flex flex-col h-full">
                                            <CardHeader className="p-6 pb-2">
                                                <div className="flex justify-between items-start gap-2 mb-3">
                                                    <Badge variant="outline" className="rounded-full bg-muted/50 border-none px-3 font-bold text-[10px] tracking-wider truncate max-w-[150px]">{assignment.asesmen?.kursus?.judul}</Badge>
                                                    {assignment.pengumpulan_tugas?.status === 'ditolak' ? (
                                                        <Badge variant="destructive" className="rounded-full shadow-sm border-0 font-bold px-3">
                                                            Ditolak
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 rounded-full shadow-sm border-0 font-bold px-3">
                                                            Nilai: {assignment.pengumpulan_tugas?.nilai}/100
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardTitle className="line-clamp-2 mt-2 text-lg font-bold group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors leading-tight">{assignment.judul}</CardTitle>
                                                <CardDescription className="line-clamp-2 text-xs font-medium text-muted-foreground mt-2 italic">
                                                    "{assignment.pengumpulan_tugas?.feedback || "Tidak ada feedback"}"
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-6 pt-4 mt-auto">
                                                <Button
                                                    variant="outline"
                                                    className="w-full rounded-xl font-bold h-10 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200"
                                                    onClick={() => navigate(`/pembelajar/assignments/${assignment.id}`)}
                                                >
                                                    Lihat Hasil
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="col-span-full">
                                        <EmptyState message="Belum ada tugas yang dinilai" />
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <Card className="border-dashed border-2 rounded-2xl shadow-none bg-muted/5 border-muted/50">
            <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground text-center font-medium">
                    {message}<br />
                    <span className="text-xs opacity-70">Daftar kursus terlebih dahulu untuk mengakses asesmen.</span>
                </p>
            </CardContent>
        </Card>
    );
}
