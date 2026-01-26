import { Card, CardContent, CardFooter, CardHeader } from '@/komponen/ui/card';
import { Badge } from '@/komponen/ui/badge';
import { Progress } from '@/komponen/ui/progress';
import { Button } from '@/komponen/ui/button';
import { BookOpen, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Enrollment } from '../tipe';

interface CourseCardProps {
    enrollment: Enrollment;
    onContinue?: (enrollmentId: string) => void;
}

/**
 * Komponen card untuk menampilkan kursus yang diikuti
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
                return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
            case 'menengah':
                return 'bg-amber-50 text-amber-700 border border-amber-200';
            case 'lanjutan':
                return 'bg-rose-50 text-rose-700 border border-rose-200';
            default:
                return 'bg-slate-50 text-slate-700 border border-slate-200';
        }
    };

    return (
        <Card className="rounded-2xl shadow-none hover:shadow-lg transition-all duration-300 overflow-hidden border-border/60 hover:border-primary/50 group hover:-translate-y-1 bg-white dark:bg-zinc-950 flex flex-col h-full">
            {/* Thumbnail */}
            <div className="relative h-44 bg-muted overflow-hidden">
                {kursus.url_gambar_mini ? (
                    <img
                        src={kursus.url_gambar_mini}
                        alt={kursus.judul}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                        <BookOpen className="h-12 w-12 text-primary/20" />
                    </div>
                )}



                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-10">
                    <Badge variant={getBadgeVariant(status)} className="rounded-full shadow-sm border-0 font-bold px-3">
                        {status === 'aktif' ? 'Sedang Belajar' : status === 'selesai' ? 'Selesai' : status}
                    </Badge>
                </div>
            </div>

            <CardHeader className="p-5 pb-2 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                    {kursus.kategori && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                            {kursus.kategori}
                        </div>
                    )}
                    {kursus.tingkat && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getTingkatColor(kursus.tingkat).replace('bg-emerald-50', 'bg-emerald-50/50').replace('bg-amber-50', 'bg-amber-50/50').replace('bg-rose-50', 'bg-rose-50/50')}`}>
                            {kursus.tingkat}
                        </span>
                    )}
                </div>

                <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                    {kursus.judul}
                </h3>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-4 flex-grow">
                {/* Instruktur & Info */}
                <div className="flex flex-col gap-2">
                    {kursus.instruktur && (
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-3 w-3 text-primary" />
                            </div>
                            <span>{kursus.instruktur.nama_lengkap}</span>
                        </div>
                    )}

                    {kursus.durasi_menit && (
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <div className="w-5 h-5 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                                <Clock className="h-3 w-3" />
                            </div>
                            <span>{Math.floor(kursus.durasi_menit / 60)}j {kursus.durasi_menit % 60}m</span>
                        </div>
                    )}
                </div>

                {/* Progress */}
                <div className="pt-2">
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                        <span className="text-muted-foreground uppercase tracking-tighter">Progres Belajar</span>
                        <span className="text-primary">{Math.round(persentase_kemajuan)}%</span>
                    </div>
                    <Progress value={persentase_kemajuan} className="h-1.5 bg-muted rounded-full" />
                </div>
            </CardContent>

            <CardFooter className="p-5 pt-0">
                {status === 'aktif' ? (
                    <Button
                        className="w-full rounded-xl font-bold shadow-sm h-11"
                        onClick={() => onContinue?.(enrollment.id)}
                        asChild
                    >
                        <Link to={`/pembelajar/learn/${enrollment.id}`}>
                            Lanjutkan Belajar
                        </Link>
                    </Button>
                ) : status === 'selesai' ? (
                    <Button
                        className="w-full rounded-xl font-bold h-11 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200"
                        variant="outline"
                        asChild
                    >
                        <Link to={`/pembelajar/kursus/${kursus.id}`}>
                            Lihat Detail
                        </Link>
                    </Button>
                ) : (
                    <Button
                        className="w-full rounded-xl font-bold h-11"
                        variant="secondary"
                        disabled
                    >
                        Dibatalkan
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
