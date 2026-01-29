import { Card, CardContent, CardFooter, CardHeader } from '@/komponen/ui/card';
import { Badge } from '@/komponen/ui/badge';
import { Progress } from '@/komponen/ui/progress';
import { Button } from '@/komponen/ui/button';
import { BookOpen, Clock, User, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Enrollment } from '../tipe';
import { motion } from 'framer-motion';

interface CourseCardProps {
    enrollment: Enrollment;
    onContinue?: (enrollmentId: string) => void;
}

/**
 * Komponen kartu kursus untuk pembelajar dengan desain premium "Sharp".
 */
export function CourseCard({ enrollment, onContinue }: CourseCardProps) {
    const { kursus, persentase_kemajuan, status } = enrollment;

    if (!kursus) return null;

    const getBadgeVariant = (status: string) => {
        switch (status) {
            case 'aktif':
                return 'default';
            case 'selesai':
                return 'secondary';
            case 'dibatalkan':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const getTingkatColor = (tingkat?: string) => {
        switch (tingkat) {
            case 'pemula':
                return 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
            case 'menengah':
                return 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
            case 'lanjutan':
                return 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
            default:
                return 'bg-slate-50 text-slate-700 border border-slate-100 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20';
        }
    };

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full"
        >
            <Card className="h-full flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 rounded-[6px]">
                {/* Thumbnail Section */}
                <div className="relative h-44 bg-slate-100 dark:bg-zinc-900 overflow-hidden shrink-0">
                    {kursus.url_gambar_mini ? (
                        <img
                            src={kursus.url_gambar_mini}
                            alt={kursus.judul}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-900 dark:to-zinc-800">
                            <BookOpen className="h-10 w-10 text-slate-300 dark:text-zinc-700" />
                        </div>
                    )}

                    {/* Status Floating Badge */}
                    <div className="absolute top-3 right-3 z-10">
                        <Badge
                            variant={getBadgeVariant(status)}
                            className="rounded-sm border-0 font-bold px-2.5 py-0.5 text-[10px] uppercase tracking-wider"
                        >
                            {status === 'aktif' ? 'Sedang Belajar' : status === 'selesai' ? 'Selesai' : status}
                        </Badge>
                    </div>
                </div>

                <CardHeader className="p-4 pb-2 space-y-2.5">
                    {/* Categories & Level */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {kursus.kategori && (
                            <Badge variant="outline" className="h-5 px-2 text-[9px] font-bold uppercase tracking-tight rounded-sm bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400">
                                {kursus.kategori}
                            </Badge>
                        )}
                        {kursus.tingkat && (
                            <span className={`text-[9px] font-bold uppercase tracking-tight px-2 py-0.5 rounded-sm ${getTingkatColor(kursus.tingkat)}`}>
                                {kursus.tingkat}
                            </span>
                        )}
                    </div>

                    <h3 className="font-bold text-base leading-snug line-clamp-2 text-gray-900 dark:text-zinc-100">
                        {kursus.judul}
                    </h3>
                </CardHeader>

                <CardContent className="p-4 pt-0 space-y-4 flex-grow">
                    {/* Metadata */}
                    <div className="space-y-1.5">
                        {kursus.instruktur && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                <User className="h-3.5 w-3.5" />
                                <span className="line-clamp-1">{kursus.instruktur.nama_lengkap}</span>
                            </div>
                        )}
                        {kursus.durasi_menit && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{Math.floor(kursus.durasi_menit / 60)}j {kursus.durasi_menit % 60}m</span>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar Section */}
                    <div className="pt-1">
                        <div className="flex items-center justify-between text-[10px] font-bold mb-1.5 uppercase tracking-tighter">
                            <span className="text-muted-foreground">Progres Belajar</span>
                            <span className="text-primary">{Math.round(persentase_kemajuan)}%</span>
                        </div>
                        <Progress value={persentase_kemajuan} className="h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full" />
                    </div>
                </CardContent>

                <CardFooter className="p-4 pt-0">
                    {status === 'aktif' ? (
                        <Button
                            className="w-full rounded-sm font-bold h-10 text-sm shadow-sm"
                            onClick={() => onContinue?.(enrollment.id)}
                            asChild
                        >
                            <Link to={`/pembelajar/learn/${enrollment.id}`} className="flex items-center justify-center gap-2">
                                Lanjutkan belajar
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </Button>
                    ) : status === 'selesai' ? (
                        <Button
                            className="w-full rounded-sm font-bold h-10 text-sm border-gray-200 dark:border-zinc-800"
                            variant="outline"
                            asChild
                        >
                            <Link to={`/pembelajar/kursus/${kursus.id}`}>
                                Lihat detail
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            className="w-full rounded-sm font-bold h-10 text-sm"
                            variant="secondary"
                            disabled
                        >
                            Dibatalkan
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </motion.div>
    );
}
