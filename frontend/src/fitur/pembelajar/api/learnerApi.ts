import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/pustaka/supabase';
import { useAuthStore } from '@/fitur/autentikasi/stores/authStore';
import type {
    Enrollment,
    MaterialProgress,
    LearnerStats,
    UpcomingDeadline,
    RecentActivity,
    Assignment,
    AssignmentSubmission,
    Assessment,
    AssessmentAttempt,
    Answer,
} from '../tipe';

// ============================================================================
// Query Keys
// ============================================================================

export const learnerKeys = {
    all: ['learner'] as const,
    enrollments: () => [...learnerKeys.all, 'enrollments'] as const,
    enrollment: (id: string) => [...learnerKeys.all, 'pendaftaran_kursus', id] as const,
    courseProgress: (enrollmentId: string) => [...learnerKeys.all, 'kemajuan_belajar', enrollmentId] as const,
    stats: () => [...learnerKeys.all, 'stats'] as const,
    deadlines: () => [...learnerKeys.all, 'deadlines'] as const,
    activities: () => [...learnerKeys.all, 'activities'] as const,
    assignments: () => [...learnerKeys.all, 'assignments'] as const,
    assignment: (id: string) => [...learnerKeys.all, 'assignment', id] as const,
    assignmentSubmission: (assessmentId: string) => [...learnerKeys.all, 'assignmentSubmission', assessmentId] as const,
    assessments: () => [...learnerKeys.all, 'assessments'] as const,
    assessment: (id: string) => [...learnerKeys.all, 'assessment', id] as const,
    attempts: (assessmentId?: string) => (assessmentId ? [...learnerKeys.all, 'attempts', assessmentId] : [...learnerKeys.all, 'attempts']) as const,
};

// ============================================================================
// Enrollment Queries
// ============================================================================

/**
 * Fetch semua enrollment (kursus yang diikuti) oleh pembelajar
 */
export function useEnrollments() {
    return useQuery({
        queryKey: learnerKeys.enrollments(),
        queryFn: async () => {
            const { user: pengguna } = useAuthStore.getState();
            if (!pengguna) throw new Error('Pengguna not found');

            const { data, error } = await supabase
                .from('pendaftaran_kursus')
                .select(`
          *,
          kursus:id_kursus (
            id,
            judul,
            deskripsi,
            url_gambar_mini,
            kategori,
            tingkat,
            durasi_menit,
            instruktur:id_instruktur (
              id,
              nama_lengkap,
              url_foto
            )
          )
        `)
                .eq('id_pengguna', pengguna.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Enrollment[];
        },
    });
}

/**
 * Enroll ke kursus baru
 */
export function useEnrollCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (kursusId: string) => {
            const { user: pengguna } = useAuthStore.getState();
            if (!pengguna) throw new Error('Pengguna not found');

            const { data, error } = await supabase
                .from('pendaftaran_kursus')
                .insert({
                    id_kursus: kursusId,
                    id_pengguna: pengguna.id,
                    status: 'aktif',
                } as any)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: learnerKeys.enrollments() });
            queryClient.invalidateQueries({ queryKey: learnerKeys.stats() });
        },
    });
}

// ============================================================================
// Progress Queries
// ============================================================================

/**
 * Fetch progress kursus
 */
export function useCourseProgress(enrollmentId: string) {
    return useQuery({
        queryKey: learnerKeys.courseProgress(enrollmentId),
        queryFn: async () => {
            const { user: pengguna } = useAuthStore.getState();
            if (!pengguna) throw new Error('Pengguna not found');

            const { data, error } = await supabase
                .from('kemajuan_belajar')
                .select(`
          *,
          materi:id_materi (
            id,
            judul,
            tipe,
            urutan,
            id_modul,
            modul:id_modul (
              urutan
            )
          )
        `)
                .eq('id_pendaftaran', enrollmentId)
                .eq('id_pengguna', pengguna.id);

            if (error) throw error;

            // Sort data berdasarkan urutan modul kemudian urutan materi
            const sortedData = (data as any[]).sort((a, b) => {
                const modulOrderA = a.materi?.modul?.urutan ?? 0;
                const modulOrderB = b.materi?.modul?.urutan ?? 0;

                if (modulOrderA !== modulOrderB) {
                    return modulOrderA - modulOrderB;
                }

                return (a.materi?.urutan ?? 0) - (b.materi?.urutan ?? 0);
            });

            return sortedData as MaterialProgress[];
        },
        enabled: !!enrollmentId,
    });
}

/**
 * Update progress materi
 */
export function useUpdateProgress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: {
            enrollmentId: string;
            materiId: string;
            progressPersen: number;
            waktubelajarDetik: number;
            status: 'belum_mulai' | 'sedang_belajar' | 'selesai';
        }) => {
            const { user: pengguna } = useAuthStore.getState();
            if (!pengguna) throw new Error('Pengguna not found');

            // 1. Update material progress
            const { error: upsertError } = await supabase
                .from('kemajuan_belajar')
                .upsert({
                    id_pendaftaran: params.enrollmentId,
                    id_materi: params.materiId,
                    id_pengguna: pengguna.id,
                    persentase_kemajuan: params.progressPersen,
                    waktu_belajar_detik: params.waktubelajarDetik,
                    status: params.status,
                    terakhir_diakses: new Date().toISOString(),
                } as any, {
                    onConflict: 'id_pendaftaran,id_materi'
                });

            if (upsertError) throw upsertError;

            // 2. Recalculate and update enrollment progress
            const { data: enrollment } = await supabase
                .from('pendaftaran_kursus')
                .select(`
                    id_kursus,
                    kursus:id_kursus (
                        modul (
                            materi (id)
                        )
                    )
                `)
                .eq('id', params.enrollmentId)
                .single<any>();

            if (enrollment) {
                const allMaterials = enrollment.kursus?.modul?.flatMap((m: any) => m.materi || []) || [];
                const totalMaterials = allMaterials.length;

                if (totalMaterials > 0) {
                    const { count: completedCount } = await supabase
                        .from('kemajuan_belajar')
                        .select('*', { count: 'exact', head: true })
                        .eq('id_pendaftaran', params.enrollmentId)
                        .eq('status', 'selesai');

                    const newProgressPersen = ((completedCount || 0) / totalMaterials) * 100;

                    await (supabase.from('pendaftaran_kursus') as any)
                        .update({
                            persentase_kemajuan: newProgressPersen,
                            status: newProgressPersen >= 100 ? 'selesai' : 'aktif'
                        })
                        .eq('id', params.enrollmentId);
                }
            }

            return { success: true };
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: learnerKeys.courseProgress(variables.enrollmentId) });
            queryClient.invalidateQueries({ queryKey: learnerKeys.enrollments() });
            queryClient.invalidateQueries({ queryKey: learnerKeys.stats() });
        },
    });
}

// ============================================================================
// Stats & Dashboard Queries
// ============================================================================

/**
 * Fetch statistik pembelajar untuk dashboard
 */
export function useLearnerStats() {
    return useQuery({
        queryKey: learnerKeys.stats(),
        queryFn: async () => {
            const { user: pengguna } = useAuthStore.getState();
            if (!pengguna) throw new Error('Pengguna not found');

            // Count kursus aktif
            const { count: kursusAktif } = await supabase
                .from('pendaftaran_kursus')
                .select('*', { count: 'exact', head: true })
                .eq('id_pengguna', pengguna.id)
                .eq('status', 'aktif');

            // Count kursus selesai
            const { count: kursusSelesai } = await supabase
                .from('pendaftaran_kursus')
                .select('*', { count: 'exact', head: true })
                .eq('id_pengguna', pengguna.id)
                .eq('status', 'selesai');

            // TODO: Count tugas pending dan ujian pending
            // Untuk sekarang hardcode 0
            const tugasPending = 0;
            const ujianPending = 0;

            // Calculate rata-rata progress
            const { data: enrollments } = await supabase
                .from('pendaftaran_kursus')
                .select('persentase_kemajuan')
                .eq('id_pengguna', pengguna.id)
                .eq('status', 'aktif')
                .returns<{ persentase_kemajuan: number }[]>();

            const rataRataProgress = enrollments && enrollments.length > 0
                ? enrollments.reduce((sum, e) => sum + (e.persentase_kemajuan || 0), 0) / enrollments.length
                : 0;

            return {
                total_kursus_aktif: kursusAktif || 0,
                total_kursus_selesai: kursusSelesai || 0,
                total_tugas_pending: tugasPending,
                total_ujian_pending: ujianPending,
                rata_rata_progress: Math.round(rataRataProgress),
            } as LearnerStats;
        },
    });
}

/**
 * Fetch upcoming deadlines
 */
export function useUpcomingDeadlines() {
    return useQuery({
        queryKey: learnerKeys.deadlines(),
        queryFn: async () => {
            // TODO: Implement setelah tabel tugas dibuat
            return [] as UpcomingDeadline[];
        },
    });
}

/**
 * Fetch recent activities
 */
export function useRecentActivities() {
    return useQuery({
        queryKey: learnerKeys.activities(),
        queryFn: async () => {
            // TODO: Implement dengan audit log atau activity tracking
            return [] as RecentActivity[];
        },
    });
}

// ============================================================================
// Assignment Queries
// ============================================================================

/**
 * Fetch daftar tugas
 */
export function useAssignments() {
    return useQuery({
        queryKey: learnerKeys.assignments(),
        queryFn: async () => {
            const { user: pengguna } = useAuthStore.getState();
            if (!pengguna) throw new Error('Pengguna not found');

            // Get all tugas with user's submission (if any)
            const { data, error } = await supabase
                .from('tugas')
                .select(`
                    *,
                    asesmen:id_asesmen (
                        id,
                        kursus:id_kursus (
                            id,
                            judul
                        )
                    ),
                    pengumpulan_tugas (
                        id,
                        id_pengguna,
                        status,
                        nilai,
                        feedback,
                        url_berkas,
                        created_at
                    )
                `)
                .order('deadline', { ascending: true });

            if (error) throw error;

            // Filter to only show user's own submissions
            const filtered = data?.map((tugas: any) => ({
                ...tugas,
                pengumpulan_tugas: Array.isArray(tugas.pengumpulan_tugas)
                    ? tugas.pengumpulan_tugas.find((p: any) => p.id_pengguna === pengguna.id)
                    : tugas.pengumpulan_tugas
            }));

            return filtered as Assignment[];
        },
    });
}

/**
 * Submit tugas
 */
export function useSubmitAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: {
            tugasId: string;
            file: File;
            catatan?: string;
        }) => {
            const { user: pengguna } = useAuthStore.getState();
            if (!pengguna) throw new Error('Pengguna not found');

            // 1. Upload file to Storage
            const fileExt = params.file.name.split('.').pop();
            const fileName = `${params.tugasId}/${pengguna.id}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('assignments')
                .upload(fileName, params.file);

            if (uploadError) throw uploadError;

            // 2. Get signed URL (7 days expiry) instead of public URL
            const { data: signedUrlData, error: urlError } = await supabase.storage
                .from('assignments')
                .createSignedUrl(fileName, 60 * 60 * 24 * 7); // 7 days

            if (urlError) throw urlError;

            // 3. Insert/Update pengumpulan_tugas record
            const { data, error } = await supabase
                .from('pengumpulan_tugas')
                .upsert({
                    id_tugas: params.tugasId,
                    id_pengguna: pengguna.id,
                    url_berkas: signedUrlData.signedUrl,
                    catatan: params.catatan,
                    status: 'dikumpulkan',
                } as any, {
                    onConflict: 'id_tugas,id_pengguna'
                })
                .select()
                .single();

            if (error) throw error;
            return data as AssignmentSubmission;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: learnerKeys.assignments() });
        },
    });
}

// ============================================================================
// Assessment Queries
// ============================================================================

/**
 * Fetch daftar asesmen (ujian/kuis)
 */
export function useAssessments(kursusId?: string) {
    return useQuery({
        queryKey: learnerKeys.assessments(),
        queryFn: async () => {
            let query = supabase
                .from('asesmen')
                .select('*')
                .eq('status', 'published');

            if (kursusId) {
                query = query.eq('id_kursus', kursusId);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            return data as Assessment[];
        },
    });
}

/**
 * Fetch semua percobaan asesmen milik pembelajar (untuk optimasi list)
 */
export function useAllAssessmentAttempts() {
    return useQuery({
        queryKey: learnerKeys.attempts(),
        queryFn: async () => {
            const { user: pengguna } = useAuthStore.getState();
            if (!pengguna) throw new Error('Pengguna not found');

            const { data, error } = await supabase
                .from('percobaan_asesmen')
                .select('*')
                .eq('id_pengguna', pengguna.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as AssessmentAttempt[];
        },
    });
}

/**
 * Fetch percobaan asesmen (specific assessment)
 */
export function useAssessmentAttempts(assessmentId: string) {
    return useQuery({
        queryKey: learnerKeys.attempts(assessmentId),
        queryFn: async () => {
            const { user: pengguna } = useAuthStore.getState();
            if (!pengguna) throw new Error('Pengguna not found');

            const { data, error } = await supabase
                .from('percobaan_asesmen')
                .select('*')
                .eq('id_asesmen', assessmentId)
                .eq('id_pengguna', pengguna.id)
                .order('nomor_percobaan', { ascending: false });

            if (error) throw error;
            return data as AssessmentAttempt[];
        },
        enabled: !!assessmentId,
    });
}

/**
 * Mulai asesmen baru
 */
export function useStartAssessment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (assessmentId: string) => {
            const { user: pengguna } = useAuthStore.getState();
            if (!pengguna) throw new Error('Pengguna not found');

            // Get nomor percobaan terakhir
            const { data: lastAttempt } = await supabase
                .from('percobaan_asesmen')
                .select('nomor_percobaan')
                .eq('id_asesmen', assessmentId)
                .eq('id_pengguna', pengguna.id)
                .order('nomor_percobaan', { ascending: false })
                .maybeSingle<{ nomor_percobaan: number }>();

            const nomorPercobaan = (lastAttempt?.nomor_percobaan || 0) + 1;

            const { data, error } = await supabase
                .from('percobaan_asesmen')
                .insert({
                    id_asesmen: assessmentId,
                    id_pengguna: pengguna.id,
                    nomor_percobaan: nomorPercobaan,
                    status: 'sedang_berjalan',
                } as any)
                .select()
                .single();

            if (error) throw error;
            return data as AssessmentAttempt;
        },
        onSuccess: (_, assessmentId) => {
            queryClient.invalidateQueries({ queryKey: learnerKeys.attempts(assessmentId) });
        },
    });
}

/**
 * Submit jawaban soal
 */
export function useSubmitAnswer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: {
            percobaanId: string;
            soalId: string;
            jawabanPengguna?: string;
            jawabanPenggunaMultiple?: string[];
        }) => {
            const { data, error } = await (supabase.from('jawaban') as any)
                .upsert({
                    id_percobaan: params.percobaanId,
                    id_soal: params.soalId,
                    jawaban_pengguna: params.jawabanPengguna,
                    jawaban_pengguna_multiple: params.jawabanPenggunaMultiple,
                }, {
                    onConflict: 'id_percobaan,id_soal'
                })
                .select()
                .single();

            if (error) throw error;
            return data as Answer;
        },
        onSuccess: () => {
            // Invalidate attempts untuk refresh data
            queryClient.invalidateQueries({ queryKey: learnerKeys.all });
        },
    });
}

/**
 * Finish asesmen
 */
export function useFinishAssessment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (percobaanId: string) => {
            const { data, error } = await (supabase.from('percobaan_asesmen') as any)
                .update({
                    status: 'selesai',
                    waktu_selesai: new Date().toISOString(),
                })
                .eq('id', percobaanId)
                .select()
                .single();

            if (error) throw error;
            return data as AssessmentAttempt;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: learnerKeys.all });
        },
    });
}

/**
 * Fetch status pengumpulan tugas untuk asesmen tertentu
 */
export function useAssignmentSubmissionByAssessment(assessmentId: string) {
    return useQuery({
        queryKey: learnerKeys.assignmentSubmission(assessmentId),
        queryFn: async () => {
            const { user: pengguna } = useAuthStore.getState();
            if (!pengguna) return null;

            // Cari tugas yang terkait dengan asesmen ini
            const { data: tugas } = await supabase
                .from('tugas')
                .select('id')
                .eq('id_asesmen', assessmentId)
                .maybeSingle<{ id: string }>();

            if (!tugas) return null;

            // Ambil pengumpulan tugas
            const { data, error } = await supabase
                .from('pengumpulan_tugas')
                .select('*')
                .eq('id_tugas', tugas.id)
                .eq('id_pengguna', pengguna.id)
                .maybeSingle();

            if (error) throw error;
            return data as AssignmentSubmission | null;
        },
        enabled: !!assessmentId,
    });
}
