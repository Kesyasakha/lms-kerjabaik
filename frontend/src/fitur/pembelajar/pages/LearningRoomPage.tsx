import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Menu,
    CheckCircle,
    ArrowLeft,
    Clock
} from 'lucide-react';
import { Button } from '@/komponen/ui/button';
import { Card } from '@/komponen/ui/card';
import { Badge } from '@/komponen/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/komponen/ui/sheet';
import { Skeleton } from '@/komponen/ui/skeleton';
import { Separator } from '@/komponen/ui/separator';
import { useCourseDetail } from '@/fitur/pembelajar/api/catalogApi';
import {
    useEnrollments,
    useCourseProgress,
    useUpdateProgress
} from '@/fitur/pembelajar/api/learnerApi';
import { VideoPlayer } from '../komponen/VideoPlayer';
import { TextContent } from '../komponen/TextContent';
import { LearningSidebar } from '../komponen/LearningSidebar';

import { toast } from 'sonner';

export function LearningRoomPage() {
    const { enrollmentId } = useParams<{ enrollmentId: string }>();
    const navigate = useNavigate();
    const [currentMaterialId, setCurrentMaterialId] = useState<string | null>(null);

    // Fetch data
    const { data: enrollments } = useEnrollments();
    const enrollment = enrollments?.find(e => e.id === enrollmentId);
    const courseId = enrollment?.id_kursus;

    const { data: course, isLoading: courseLoading } = useCourseDetail(courseId || '');
    const { data: progress, isLoading: progressLoading } = useCourseProgress(enrollmentId || '');
    const updateProgressMutation = useUpdateProgress();

    // Find current material
    const allMaterials = course?.modul?.flatMap(m => m.materi || []) || [];
    const currentMaterial = allMaterials.find(m => m.id === currentMaterialId);

    // Initialize current material
    useEffect(() => {
        if (allMaterials.length > 0 && !currentMaterialId) {
            // Logic untuk resume last studied material bisa ditambahkan di sini
            // Untuk sekarang default ke materi pertama yang belum selesai atau materi pertama
            const firstUnfinished = allMaterials.find(m => {
                const prog = progress?.find(p => p.id_materi === m.id);
                return !prog || prog.status !== 'selesai';
            });
            setCurrentMaterialId(firstUnfinished?.id || allMaterials[0].id);
        }
    }, [allMaterials, currentMaterialId, progress]);

    const handleSelectMaterial = (materialId: string) => {
        setCurrentMaterialId(materialId);
    };

    const handleProgressUpdate = (_percent: number, _time: number) => {
        // Only update every 5% or 30 seconds to avoid spamming
        // For simplicity we'll implement throttling later if needed
    };

    const handleComplete = async () => {
        if (!enrollmentId || !currentMaterialId) return;

        try {
            await updateProgressMutation.mutateAsync({
                enrollmentId,
                materiId: currentMaterialId,
                progressPersen: 100,
                waktubelajarDetik: 0, // TODO: track actual time
                status: 'selesai'
            });
            toast.success('Materi diselesaikan!');
        } catch (error) {
            toast.error('Gagal menyimpan progress');
        }
    };

    const handleNext = () => {
        const currentIndex = allMaterials.findIndex(m => m.id === currentMaterialId);
        if (currentIndex < allMaterials.length - 1) {
            setCurrentMaterialId(allMaterials[currentIndex + 1].id);
        }
    };

    const handlePrevious = () => {
        const currentIndex = allMaterials.findIndex(m => m.id === currentMaterialId);
        if (currentIndex > 0) {
            setCurrentMaterialId(allMaterials[currentIndex - 1].id);
        }
    };

    if (courseLoading || progressLoading || !enrollment) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Skeleton className="h-12 w-12 rounded-full" />
            </div>
        );
    }

    if (!course) return null;

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Sidebar for Desktop */}
            <div className="hidden lg:block w-80 h-full border-r">
                <LearningSidebar
                    course={course}
                    progress={progress || []}
                    currentMaterialId={currentMaterialId || undefined}
                    onSelectMaterial={handleSelectMaterial}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="h-[72px] border-b flex items-center justify-between px-6 bg-white dark:bg-zinc-950/50 backdrop-blur-md sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden shrink-0">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-80">
                                <LearningSidebar
                                    course={course}
                                    progress={progress || []}
                                    currentMaterialId={currentMaterialId || undefined}
                                    onSelectMaterial={(id) => {
                                        handleSelectMaterial(id);
                                    }}
                                />
                            </SheetContent>
                        </Sheet>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 shrink-0 font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200 rounded-xl px-3"
                            onClick={() => navigate('/pembelajar/dashboard')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Kembali</span>
                        </Button>

                        <Separator orientation="vertical" className="h-6 mx-2 hidden sm:block" />

                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 truncate">Sedang Dipelajari</span>
                            <h1 className="font-bold text-sm sm:text-base truncate text-gray-900 dark:text-white leading-tight">
                                {currentMaterial?.judul}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 ml-4">
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl font-bold h-9 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200 shadow-none"
                            onClick={handlePrevious}
                            disabled={allMaterials.findIndex(m => m.id === currentMaterialId) === 0}
                        >
                            <ChevronLeft className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">Kembali</span>
                        </Button>
                        <Button
                            className="rounded-xl font-bold h-9 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-200 shadow-sm"
                            size="sm"
                            onClick={() => {
                                handleComplete();
                                handleNext();
                            }}
                            disabled={allMaterials.findIndex(m => m.id === currentMaterialId) === allMaterials.length - 1}
                        >
                            <span className="hidden sm:inline">Materi Selanjutnya</span>
                            <ChevronRight className="h-4 w-4 sm:ml-1" />
                        </Button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-zinc-50/50 dark:bg-zinc-950/20">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {currentMaterial ? (
                            <>
                                {currentMaterial.tipe === 'video' && currentMaterial.url_berkas ? (
                                    <div className="rounded-2xl overflow-hidden shadow-2xl shadow-primary/5 bg-black ring-1 ring-white/10 aspect-video">
                                        {(currentMaterial.url_berkas.includes('youtube.com') || currentMaterial.url_berkas.includes('youtu.be')) ? (
                                            <iframe
                                                src={currentMaterial.url_berkas.includes('watch?v=')
                                                    ? currentMaterial.url_berkas.replace('watch?v=', 'embed/')
                                                    : currentMaterial.url_berkas.includes('youtu.be/')
                                                        ? `https://www.youtube.com/embed/${currentMaterial.url_berkas.split('youtu.be/')[1]}`
                                                        : currentMaterial.url_berkas}
                                                className="w-full h-full"
                                                allowFullScreen
                                            />
                                        ) : (
                                            <VideoPlayer
                                                url={currentMaterial.url_berkas}
                                                onComplete={handleComplete}
                                                onProgress={handleProgressUpdate}
                                                autoPlay
                                            />
                                        )}
                                    </div>
                                ) : currentMaterial.tipe === 'teks' && currentMaterial.konten ? (
                                    <Card className="rounded-2xl p-8 md:p-12 shadow-none border-border/60 bg-white dark:bg-zinc-900 overflow-hidden relative">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                                        <TextContent content={currentMaterial.konten} />
                                        <div className="mt-12 flex justify-center border-t pt-8">
                                            <Button
                                                className="rounded-xl font-bold px-8 h-11"
                                                onClick={handleComplete}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Saya Mengerti & Tandai Selesai
                                            </Button>
                                        </div>
                                    </Card>
                                ) : currentMaterial.tipe === 'dokumen' && currentMaterial.url_berkas ? (
                                    <Card className="rounded-2xl p-4 shadow-none border-border/60 bg-white dark:bg-zinc-900 overflow-hidden">
                                        <div className="aspect-[3/4] w-full bg-muted rounded-xl overflow-hidden ring-1 ring-black/5">
                                            <iframe
                                                src={currentMaterial.url_berkas}
                                                className="w-full h-full"
                                                title={currentMaterial.judul}
                                            />
                                        </div>
                                        <div className="mt-4 flex justify-between items-center p-2">
                                            <p className="text-sm font-medium text-muted-foreground italic">Gunakan kontrol di atas untuk membaca dokumen</p>
                                            <Button
                                                className="rounded-xl font-bold h-10 px-6"
                                                onClick={handleComplete}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Tandai Selesai
                                            </Button>
                                        </div>
                                    </Card>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-80 bg-muted/30 rounded-2xl border-2 border-dashed border-muted">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                            <Menu className="h-8 w-8 text-muted-foreground/30" />
                                        </div>
                                        <p className="text-muted-foreground font-bold">Konten tidak didukung atau kosong</p>
                                    </div>
                                )}

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-8 border-t border-muted">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="rounded-full font-bold text-[10px] uppercase tracking-wider bg-primary/5 text-primary border-none px-3">
                                                Materi {currentMaterial.tipe}
                                            </Badge>
                                            {progress?.find(p => p.id_materi === currentMaterial.id)?.status === 'selesai' && (
                                                <Badge className="bg-emerald-50 text-emerald-700 border-none rounded-full shadow-none font-bold text-[10px] px-3">
                                                    Selesai
                                                </Badge>
                                            )}
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{currentMaterial.judul}</h2>
                                        {currentMaterial.durasi_menit && (
                                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Estimasi waktu belajar: {currentMaterial.durasi_menit} menit
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                    <ArrowLeft className="h-10 w-10 text-muted-foreground/20" />
                                </div>
                                <h3 className="text-xl font-bold">Pilih materi untuk mulai belajar</h3>
                                <p className="text-muted-foreground mt-2 max-w-sm">Gunakan bar samping untuk menavigasi modul dan materi yang tersedia dalam kursus ini.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
