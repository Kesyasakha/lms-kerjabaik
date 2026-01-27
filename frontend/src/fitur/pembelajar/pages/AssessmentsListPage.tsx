import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Clock,
    Trophy,
    AlertCircle,
    Play,
    CheckCircle2,
    Search,
    FileText,
    GraduationCap
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/komponen/ui/table";
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

        if (days < 0) return <Badge variant="destructive" className="rounded-md font-bold text-[10px] px-2 h-6">Terlewat</Badge>;
        if (days <= 3) return <Badge className="bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-0 rounded-md shadow-sm font-bold text-[10px] px-2 h-6">Sisa {days} hari</Badge>;
        return <span className="text-xs text-muted-foreground font-medium">{format(date, 'd MMM yyyy', { locale: localeId })}</span>;
    };

    const AssessmentRow = ({ assessment }: { assessment: Assessment }) => {
        const { data: attempts } = useAssessmentAttempts(assessment.id);
        const bestScore = attempts?.reduce((max, attempt) => Math.max(max, attempt.nilai || 0), 0) || 0;
        const totalAttempts = attempts?.length || 0;
        const hasActiveAttempt = attempts?.some(a => a.status === 'sedang_berjalan');
        const canTakeAssessment = assessment.jumlah_percobaan === -1 || totalAttempts < assessment.jumlah_percobaan;

        const getStatusBadge = () => {
            if (hasActiveAttempt) {
                return <Badge className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-0 shadow-sm rounded-md font-bold text-[10px] px-2 h-6">Sedang Berlangsung</Badge>;
            }
            if (totalAttempts === 0) {
                return <Badge variant="secondary" className="font-bold rounded-md border-0 text-[10px] px-2 h-6">Belum Dikerjakan</Badge>;
            }
            if (bestScore >= assessment.nilai_kelulusan) {
                return <Badge className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-0 shadow-sm rounded-md font-bold text-[10px] px-2 h-6">Lulus</Badge>;
            }
            return <Badge variant="destructive" className="rounded-md shadow-sm border-0 font-bold text-[10px] px-2 h-6">Belum Lulus</Badge>;
        };

        return (
            <TableRow className="group hover:bg-muted/10 transition-colors border-b last:border-0">
                <TableCell className="py-2.5 px-4 w-[40px]">
                    <div className={`p-2 rounded-lg ${assessment.tipe === 'ujian' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                        {assessment.tipe === 'ujian' ? <AlertCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                </TableCell>
                <TableCell className="py-2.5">
                    <div>
                        <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{assessment.judul}</h4>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{assessment.deskripsi}</p>
                    </div>
                </TableCell>
                <TableCell className="py-2.5 text-center">
                    <Badge variant="outline" className="font-mono text-[10px] font-normal">
                        {assessment.durasi_menit} mnt
                    </Badge>
                </TableCell>
                <TableCell className="py-2.5 text-center">
                    <span className="text-xs font-medium">{assessment.nilai_kelulusan}%</span>
                </TableCell>
                <TableCell className="py-2.5">
                    {getStatusBadge()}
                </TableCell>
                <TableCell className="py-2.5 text-center">
                    {totalAttempts > 0 ? (
                        <span className={`text-sm font-bold ${bestScore >= assessment.nilai_kelulusan ? 'text-green-600' : 'text-red-600'}`}>
                            {bestScore}%
                        </span>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    )}
                </TableCell>
                <TableCell className="py-2.5 text-right px-4">
                    <div className="flex justify-end gap-2">
                        {hasActiveAttempt ? (
                            <Button size="sm" className="h-7 text-xs font-bold" onClick={() => {
                                const activeAttempt = attempts?.find(a => a.status === 'sedang_berjalan');
                                navigate(`/pembelajar/penilaian/${assessment.id}/take/${activeAttempt?.id}`);
                            }}>
                                Lanjutkan
                            </Button>
                        ) : canTakeAssessment ? (
                            <Button size="sm" variant={totalAttempts === 0 ? "default" : "outline"} className="h-7 text-xs font-bold" onClick={() => navigate(`/pembelajar/penilaian/${assessment.id}`)}>
                                <Play className="w-3 h-3 mr-1" />
                                {totalAttempts === 0 ? 'Mulai' : 'Ulang'}
                            </Button>
                        ) : (
                            <Button size="sm" variant="ghost" disabled className="h-7 text-xs">Habis</Button>
                        )}
                        {totalAttempts > 0 && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => navigate(`/pembelajar/penilaian/${assessment.id}/results`)}>
                                Hasil
                            </Button>
                        )}
                    </div>
                </TableCell>
            </TableRow>
        );
    };

    if (isLoadingAssessments || isLoadingAssignments) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pusat Asesmen</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Kelola tugas proyek dan kuis ujian Anda dalam satu tempat yang terorganisir.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari asesmen atau tugas..."
                            className="pl-9 h-9 text-sm rounded-lg border-muted-foreground/20 focus:border-primary/50 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Tabs defaultValue="exams" className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 mb-6">
                    <TabsTrigger
                        value="exams"
                        className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                    >
                        Kuis & Ujian
                    </TabsTrigger>
                    <TabsTrigger
                        value="tasks"
                        className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                    >
                        Tugas Proyek
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="exams" className="space-y-4 outline-none">
                    {quizzesAndExams && quizzesAndExams.length > 0 ? (
                        <div className="rounded-md border border-border/60 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 border-b hover:bg-muted/30">
                                        <TableHead className="w-[40px]"></TableHead>
                                        <TableHead className="font-bold text-foreground py-3">Asesmen</TableHead>
                                        <TableHead className="font-bold text-foreground py-3 text-center">Durasi</TableHead>
                                        <TableHead className="font-bold text-foreground py-3 text-center">Min. Lulus</TableHead>
                                        <TableHead className="font-bold text-foreground py-3">Status</TableHead>
                                        <TableHead className="font-bold text-foreground py-3 text-center">Nilai Terbaik</TableHead>
                                        <TableHead className="font-bold text-foreground py-3 text-right px-4">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {quizzesAndExams.map((assessment) => (
                                        <AssessmentRow key={assessment.id} assessment={assessment} />
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <EmptyState message="Belum ada kuis atau ujian yang tersedia untuk Anda." />
                    )}
                </TabsContent>

                <TabsContent value="tasks" className="space-y-4 outline-none">
                    <div className="rounded-md border border-border/60 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 border-b hover:bg-muted/30">
                                    <TableHead className="w-[40px]"></TableHead>
                                    <TableHead className="font-bold text-foreground py-3">Tugas</TableHead>
                                    <TableHead className="font-bold text-foreground py-3">Kursus</TableHead>
                                    <TableHead className="font-bold text-foreground py-3">Deadline</TableHead>
                                    <TableHead className="font-bold text-foreground py-3">Status</TableHead>
                                    <TableHead className="font-bold text-foreground py-3">Nilai</TableHead>
                                    <TableHead className="font-bold text-foreground py-3 text-right px-4">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAssignments && filteredAssignments.length > 0 ? (
                                    filteredAssignments.map((assignment) => {
                                        const status = assignment.pengumpulan_tugas?.status || 'belum_dikerjakan';
                                        return (
                                            <TableRow key={assignment.id} className="group hover:bg-muted/10 transition-colors border-b last:border-0">
                                                <TableCell className="py-2.5 px-4">
                                                    <div className="p-2 bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 rounded-lg">
                                                        <Trophy className="w-4 h-4" />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-2.5">
                                                    <div>
                                                        <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{assignment.judul}</h4>
                                                        <p className="text-[10px] text-muted-foreground line-clamp-1">{assignment.deskripsi}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-2.5">
                                                    <Badge variant="outline" className="font-normal text-[10px] text-muted-foreground truncate max-w-[150px]">
                                                        {assignment.asesmen?.kursus?.judul}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-2.5">
                                                    {getDeadlineStatus(assignment.deadline)}
                                                </TableCell>
                                                <TableCell className="py-2.5">
                                                    {status === 'belum_dikerjakan' && <Badge variant="secondary" className="font-bold text-[10px] px-2 h-6">Belum Submit</Badge>}
                                                    {status === 'perlu_revisi' && <Badge variant="outline" className="font-bold text-[10px] px-2 h-6 border-orange-500 text-orange-600">Revisi</Badge>}
                                                    {status === 'dikumpulkan' && <Badge className="bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 font-bold text-[10px] px-2 h-6 border-0">Dikumpulkan</Badge>}
                                                    {status === 'dinilai' && <Badge className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] px-2 h-6 border-0">Dinilai</Badge>}
                                                    {status === 'ditolak' && <Badge variant="destructive" className="font-bold text-[10px] px-2 h-6">Ditolak</Badge>}
                                                </TableCell>
                                                <TableCell className="py-2.5">
                                                    {status === 'dinilai' ? (
                                                        <span className="font-bold text-sm text-green-600">{assignment.pengumpulan_tugas?.nilai}/100</span>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-2.5 text-right px-4">
                                                    <Button size="sm" variant="ghost" className="h-7 text-xs font-bold text-muted-foreground hover:text-primary" onClick={() => navigate(`/pembelajar/assignments/${assignment.id}`)}>
                                                        {status === 'belum_dikerjakan' ? 'Kerjakan' : 'Detail'}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            <EmptyState message="Tidak ada tugas yang ditemukan." />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
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
