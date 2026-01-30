
import {
    CheckCircle,
    PlayCircle,
    FileText,
    Lock
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/komponen/ui/accordion';
import { ScrollArea } from '@/komponen/ui/scroll-area';
import { cn } from '@/pustaka/utils';
import type { Course, MaterialProgress } from '../tipe';

interface LearningSidebarProps {
    course: Course;
    progress: MaterialProgress[];
    currentMaterialId?: string;
    onSelectMaterial: (materialId: string) => void;
    className?: string;
}

export function LearningSidebar({
    course,
    progress,
    currentMaterialId,
    onSelectMaterial,
    className,
}: LearningSidebarProps) {
    // Group progress by id_materi for easy lookup
    const progressMap = progress.reduce((acc, p) => {
        acc[p.id_materi] = p;
        return acc;
    }, {} as Record<string, MaterialProgress>);

    const getMaterialIcon = (type: string, isCompleted: boolean) => {
        if (isCompleted) return <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />;

        switch (type) {
            case 'video':
                return <PlayCircle className="h-3.5 w-3.5" />;
            case 'dokumen':
            case 'teks':
            default:
                return <FileText className="h-3.5 w-3.5" />;
        }
    };

    return (
        <div className={cn("flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-gray-100 dark:border-zinc-800", className)}>
            <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
                <h2 className="font-semibold text-sm line-clamp-1 text-gray-900 dark:text-white" title={course.judul}>
                    {course.judul}
                </h2>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>Progress</span>
                    <span>{Math.round((progress.filter(p => p.status === 'selesai').length / (course.modul?.reduce((acc, m) => acc + (m.materi?.length || 0), 0) || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-zinc-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.round((progress.filter(p => p.status === 'selesai').length / (course.modul?.reduce((acc, m) => acc + (m.materi?.length || 0), 0) || 1)) * 100)}%` }}
                    />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <Accordion
                    type="multiple"
                    defaultValue={course.modul?.map(m => m.id)}
                    className="w-full"
                >
                    {course.modul?.sort((a, b) => a.urutan - b.urutan).map((modul, index) => (
                        <AccordionItem key={modul.id} value={modul.id} className="border-gray-100 dark:border-zinc-800 last:border-0">
                            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <div className="flex flex-col items-start text-left gap-0.5">
                                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                        Modul {index + 1}: {modul.judul}
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-normal">
                                        {modul.materi?.length || 0} Materi • {modul.materi?.reduce((acc, m) => acc + (m.durasi_menit || 0), 0)} Menit
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-0">
                                <div className="flex flex-col border-t border-gray-50 dark:border-zinc-800/50 bg-gray-50/50 dark:bg-zinc-900/50">
                                    {modul.materi?.sort((a, b) => a.urutan - b.urutan).map((materi) => {
                                        const prog = progressMap[materi.id];
                                        const isCompleted = prog?.status === 'selesai';
                                        const isCurrent = currentMaterialId === materi.id;
                                        const isLocked = false; // TODO: Implement lock logic

                                        return (
                                            <button
                                                key={materi.id}
                                                onClick={() => !isLocked && onSelectMaterial(materi.id)}
                                                disabled={isLocked}
                                                className={cn(
                                                    "flex items-start gap-3 px-4 py-2.5 text-xs transition-colors",
                                                    isCurrent
                                                        ? "bg-white dark:bg-zinc-800 text-primary font-medium border-l-[3px] border-primary shadow-sm"
                                                        : "border-l-[3px] border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-gray-200",
                                                    isLocked && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                <div className={cn(
                                                    "mt-0.5",
                                                    isCurrent ? "text-primary" : isCompleted ? "text-emerald-500" : "text-gray-400"
                                                )}>
                                                    {getMaterialIcon(materi.tipe, isCompleted)}
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <span className={cn("line-clamp-2", isCurrent && "text-primary dark:text-primary-foreground")}>
                                                        {materi.judul}
                                                    </span>
                                                    {materi.durasi_menit && (
                                                        <span className="block mt-0.5 text-[10px] text-gray-400">
                                                            {materi.durasi_menit} m
                                                        </span>
                                                    )}
                                                </div>
                                                {isLocked && <Lock className="h-3 w-3 text-gray-300" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </ScrollArea>
        </div>
    );
}
