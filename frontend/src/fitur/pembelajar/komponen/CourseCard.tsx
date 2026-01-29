import { Badge } from '@/komponen/ui/badge';
import { Progress } from '@/komponen/ui/progress';
import { Button } from '@/komponen/ui/button';
import { BookOpen, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Enrollment } from '../tipe';
import { motion } from 'framer-motion';

interface CourseCardProps {
    enrollment: Enrollment;
    onContinue?: (enrollmentId: string) => void;
    variant?: 'grid' | 'list';
}

/**
 * Komponen kartu kursus untuk pembelajar dengan desain premium yang compact.
 */
export function CourseCard({ enrollment, onContinue, variant = 'grid' }: CourseCardProps) {
    const { kursus, persentase_kemajuan, status } = enrollment;

    if (!kursus) return null;

    const getBadgeVariant = (status: string) => {
        switch (status) {
            case 'aktif': return 'default';
            case 'selesai': return 'secondary';
            default: return 'outline';
        }
    };

    const getTingkatColor = (tingkat?: string) => {
        switch (tingkat) {
            case 'pemula': return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400';
            case 'menengah': return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400';
            case 'lanjutan': return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400';
            default: return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    if (variant === 'list') {
        return (
            <motion.div
                whileHover={{ y: -2 }}
                className="group relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 p-4"
            >
                <div className="flex flex-col md:flex-row gap-5 items-center">
                    {/* Thumbnail List */}
                    <div className="w-full md:w-48 h-32 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-zinc-800 relative">
                        {kursus.url_gambar_mini ? (
                            <img src={kursus.url_gambar_mini} alt={kursus.judul} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="h-8 w-8 text-slate-300 dark:text-zinc-700" />
                            </div>
                        )}
                        <div className="absolute top-2 right-2">
                            <Badge variant={getBadgeVariant(status)} className="rounded-sm font-bold text-[9px] uppercase px-1.5 py-0.5">
                                {status === 'aktif' ? 'Belajar' : 'Selesai'}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {kursus.kategori && <Badge variant="outline" className="text-[9px] h-5 font-bold uppercase rounded-sm">{kursus.kategori}</Badge>}
                            {kursus.tingkat && <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm border ${getTingkatColor(kursus.tingkat)}`}>{kursus.tingkat}</span>}
                        </div>
                        <h3 className="font-bold text-base text-gray-900 dark:text-zinc-100 leading-tight line-clamp-1">{kursus.judul}</h3>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                            {kursus.instruktur && <div className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-primary/60" /><span>{kursus.instruktur.nama_lengkap}</span></div>}
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-primary/60" />
                                <span>{Math.floor((kursus.durasi_menit || 0) / 60)}j {(kursus.durasi_menit || 0) % 60}m</span>
                            </div>
                        </div>
                        <div className="w-full max-w-xs">
                            <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                                <span className="text-muted-foreground uppercase opacity-60">Progres</span>
                                <span className="text-primary">{Math.round(persentase_kemajuan)}%</span>
                            </div>
                            <Progress value={persentase_kemajuan} className="h-1 bg-slate-100 dark:bg-zinc-800 rounded-full" />
                        </div>
                    </div>

                    {/* Action List */}
                    <div className="w-full md:w-auto md:pl-5 md:border-l border-gray-100 dark:border-zinc-800 flex items-center">
                        <Button className="w-full md:w-auto rounded-lg font-bold h-9 text-xs px-5 shadow-sm transition-all active:scale-95" onClick={() => onContinue?.(enrollment.id)} asChild>
                            <Link to={`/pembelajar/learn/${enrollment.id}`}>
                                {status === 'aktif' ? 'Lanjutkan Belajar' : 'Tinjau Materi'}
                            </Link>
                        </Button>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Grid View (Default) - Compact version
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="group bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-[12px] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
        >
            <div className="relative h-40 overflow-hidden shrink-0 bg-slate-100 dark:bg-zinc-800">
                {kursus.url_gambar_mini ? (
                    <img src={kursus.url_gambar_mini} alt={kursus.judul} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-slate-300 dark:text-zinc-700" />
                    </div>
                )}
                <div className="absolute top-2.5 right-2.5">
                    <Badge variant={getBadgeVariant(status)} className="rounded-md font-bold text-[9px] uppercase px-2 py-0.5 shadow-sm border-0">
                        {status === 'aktif' ? 'Belajar' : 'Selesai'}
                    </Badge>
                </div>
            </div>

            <div className="p-4 flex flex-col flex-1 space-y-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {kursus.kategori && <Badge variant="outline" className="text-[9px] h-4.5 px-1.5 font-bold uppercase rounded-sm border-gray-200 text-gray-500">{kursus.kategori}</Badge>}
                    {kursus.tingkat && <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm border ${getTingkatColor(kursus.tingkat)}`}>{kursus.tingkat}</span>}
                </div>

                <h3 className="font-bold text-sm leading-tight text-gray-900 dark:text-zinc-100 line-clamp-2 h-9">
                    {kursus.judul}
                </h3>

                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                        <User className="h-3 w-3 text-primary/70" />
                        <span className="truncate">{kursus.instruktur?.nama_lengkap}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                        <Clock className="h-3 w-3 text-primary/70" />
                        <span>{Math.floor((kursus.durasi_menit || 0) / 60)}j {(kursus.durasi_menit || 0) % 60}m</span>
                    </div>
                </div>

                <div className="pt-2 mt-auto">
                    <div className="flex items-center justify-between text-[10px] font-bold mb-1.5">
                        <span className="text-gray-400 uppercase tracking-tighter">Progres Belajar</span>
                        <span className="text-primary">{Math.round(persentase_kemajuan)}%</span>
                    </div>
                    <Progress value={persentase_kemajuan} className="h-1 bg-slate-100 dark:bg-zinc-800 rounded-full" />
                </div>
            </div>

            <div className="p-4 pt-0">
                <Button className="w-full rounded-lg font-bold h-9 text-xs shadow-none group-hover:shadow-md transition-all active:scale-[0.98]" onClick={() => onContinue?.(enrollment.id)} asChild>
                    <Link to={`/pembelajar/learn/${enrollment.id}`}>
                        {status === 'aktif' ? 'Lanjutkan Belajar' : 'Tinjau Materi'}
                    </Link>
                </Button>
            </div>
        </motion.div>
    );
}
