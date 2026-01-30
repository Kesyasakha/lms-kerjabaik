import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Menu,
    CheckCircle,
    ArrowLeft,
    Clock,
    FileText
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

import { pemberitahuan } from '@/pustaka/pemberitahuan';

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
            pemberitahuan.tampilkanPemuatan("Menyimpan progress...");
            await updateProgressMutation.mutateAsync({
                enrollmentId,
                materiId: currentMaterialId,
                progressPersen: 100,
                waktubelajarDetik: 0, // TODO: track actual time
                status: 'selesai'
            });
            pemberitahuan.sukses('Materi berhasil diselesaikan!');
        } catch (error) {
            pemberitahuan.gagal('Gagal menyimpan progress belajar.');
        } finally {
            pemberitahuan.hilangkanPemuatan();
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

    const isFirstMaterial = allMaterials.findIndex(m => m.id === currentMaterialId) === 0;
    const isLastMaterial = allMaterials.findIndex(m => m.id === currentMaterialId) === allMaterials.length - 1;

    return (
        <div className="flex h-screen bg-gray-50/50 dark:bg-zinc-950 overflow-hidden">
            {/* Sidebar for Desktop - Made slimmer (w-72) */}
            <div className="hidden lg:block w-72 h-full border-r bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
                <LearningSidebar
                    course={course}
                    progress={progress || []}
                    currentMaterialId={currentMaterialId || undefined}
                    onSelectMaterial={handleSelectMaterial}
                />
            </div>

            {/* Main Content */}
            <div className="relative flex-1 flex flex-col h-full overflow-hidden">
                {/* Header - Compact */}
                <header className="h-16 border-b flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 sticky top-0 z-20">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden shrink-0 h-9 w-9">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-72">
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
                            className="h-9 gap-2 shrink-0 font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-2"
                            onClick={() => navigate(courseId ? `/pembelajar/kursus/${courseId}` : '/pembelajar/dashboard')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Kembali</span>
                        </Button>

                        <Separator orientation="vertical" className="h-5 mx-1 hidden sm:block bg-gray-200 dark:bg-zinc-700" />

                        <div className="flex flex-col min-w-0">
                            <h1 className="font-semibold text-sm sm:text-base truncate text-gray-900 dark:text-white leading-tight">
                                {currentMaterial?.judul}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg text-xs font-medium px-3 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                            onClick={handlePrevious}
                            disabled={allMaterials.findIndex(m => m.id === currentMaterialId) === 0}
                        >
                            <ChevronLeft className="h-3.5 w-3.5 sm:mr-1" />
                            <span className="hidden sm:inline">Sebelumnya</span>
                        </Button>
                        <Button
                            className="h-8 rounded-lg text-xs font-medium px-3 bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-gray-100"
                            size="sm"
                            onClick={() => {
                                handleComplete();
                                handleNext();
                            }}
                            disabled={allMaterials.findIndex(m => m.id === currentMaterialId) === allMaterials.length - 1}
                        >
                            <span className="hidden sm:inline">Selanjutnya</span>
                            <ChevronRight className="h-3.5 w-3.5 sm:ml-1" />
                        </Button>
                    </div>
                </header>

                {/* Content Area - Reduced Padding */}
                <div className="flex-1 overflow-y-auto w-full">
                    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24">
                        {currentMaterial ? (
                            <>
                                {currentMaterial.tipe === 'video' && currentMaterial.url_berkas ? (
                                    <div className="rounded-xl overflow-hidden bg-black aspect-video shadow-lg ring-1 ring-black/10">
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
                                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-100 dark:border-zinc-800">
                                        <TextContent content={currentMaterial.konten} />
                                    </div>
                                ) : currentMaterial.tipe === 'dokumen' && currentMaterial.url_berkas ? (
                                    <Card className="rounded-xl p-4 shadow-none border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                        <div className="aspect-[3/4] w-full bg-gray-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
                                            <iframe
                                                src={currentMaterial.url_berkas}
                                                className="w-full h-full"
                                                title={currentMaterial.judul}
                                            />
                                        </div>
                                        <div className="mt-4 flex justify-between items-center px-1">
                                            <p className="text-xs text-muted-foreground italic">Scroll untuk membaca dokumen</p>
                                        </div>
                                    </Card>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800">
                                        <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-3">
                                            <FileText className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium">Konten tidak tersedia</p>
                                    </div>
                                )}

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="rounded-md font-medium text-[10px] uppercase tracking-wider h-5 px-2">
                                                {currentMaterial.tipe}
                                            </Badge>
                                            {progress?.find(p => p.id_materi === currentMaterial.id)?.status === 'selesai' && (
                                                <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 rounded-md font-medium text-[10px] h-5 px-2 shadow-none">
                                                    Selesai
                                                </Badge>
                                            )}
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">{currentMaterial.judul}</h2>
                                        {currentMaterial.durasi_menit && (
                                            <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5" />
                                                {currentMaterial.durasi_menit} menit
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Bottom Navigation - Only for Last Material */}
                                {isLastMaterial && (
                                    <div className="flex items-center justify-end pt-8 border-t border-gray-100 dark:border-zinc-800 mt-2">
                                        <Button
                                            className="rounded-xl font-bold h-12 bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-black dark:hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-gray-200/50 dark:shadow-zinc-900/50 w-full sm:w-auto px-8"
                                            size="lg"
                                            onClick={async () => {
                                                await handleComplete();
                                                navigate(courseId ? `/pembelajar/kursus/${courseId}` : '/pembelajar/dashboard');
                                            }}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Selesai & Keluar
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                    <ArrowLeft className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pilih materi</h3>
                                <p className="text-sm text-gray-500 mt-1">Pilih materi dari sidebar di sebelah kiri.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
