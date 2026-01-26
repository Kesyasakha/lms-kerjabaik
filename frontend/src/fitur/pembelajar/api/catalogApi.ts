import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/pustaka/supabase';
import type { Course } from '@/fitur/pembelajar/tipe';

// ============================================================================
// Query Keys untuk Katalog Kursus
// ============================================================================

export const catalogKeys = {
    all: ['catalog'] as const,
    courses: (filters?: CatalogFilters) => [...catalogKeys.all, 'courses', filters] as const,
    course: (id: string) => [...catalogKeys.all, 'course', id] as const,
};

// ============================================================================
// Types untuk Filters
// ============================================================================

export interface CatalogFilters {
    search?: string;
    kategori?: string;
    tingkat?: 'pemula' | 'menengah' | 'lanjutan';
    page?: number;
    limit?: number;
}

// ============================================================================
// Katalog Kursus Queries
// ============================================================================

/**
 * Fetch katalog kursus dengan filter dan pagination
 */
export function useCatalogCourses(filters?: CatalogFilters) {
    return useQuery({
        queryKey: catalogKeys.courses(filters),
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data: pengguna } = (await supabase
                .from('pengguna')
                .select('id_lembaga')
                .eq('auth_id', user.id)
                .single()) as { data: { id_lembaga: string } | null };

            if (!pengguna) throw new Error('Pengguna not found');

            // Build query
            let query = supabase
                .from('kursus')
                .select(`
          *,
          instruktur:id_instruktur (
            id,
            nama_lengkap,
            url_foto
          )
        `, { count: 'exact' })
                .eq('id_lembaga', pengguna.id_lembaga)
                .eq('status', 'published')
                .order('created_at', { ascending: false });

            // Apply filters
            if (filters?.search) {
                query = query.or(`judul.ilike.%${filters.search}%,deskripsi.ilike.%${filters.search}%`);
            }

            if (filters?.kategori) {
                query = query.eq('kategori', filters.kategori);
            }

            if (filters?.tingkat) {
                query = query.eq('tingkat', filters.tingkat);
            }

            // Pagination
            const page = filters?.page || 1;
            const limit = filters?.limit || 12;
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            query = query.range(from, to);

            const { data, error, count } = await query;

            if (error) throw error;

            return {
                courses: data as Course[],
                total: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit),
            };
        },
    });
}

/**
 * Fetch detail kursus dengan modul dan materi
 */
export function useCourseDetail(courseId: string) {
    return useQuery({
        queryKey: catalogKeys.course(courseId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from('kursus')
                .select(`
          *,
          instruktur:id_instruktur (
            id,
            nama_lengkap,
            email,
            url_foto
          ),
          modul (
            id,
            judul,
            deskripsi,
            urutan,
            durasi_menit,
            materi (
              id,
              judul,
              tipe,
              konten,
              url_berkas,
              urutan,
              durasi_menit,
              wajib
            )
          )
        `)
                .eq('id', courseId)
                .eq('status', 'published')
                .single();

            if (error) throw error;
            return data as Course;
        },
        enabled: !!courseId,
    });
}

/**
 * Check apakah user sudah enroll ke kursus
 */
export function useIsEnrolled(courseId: string) {
    return useQuery({
        queryKey: [...catalogKeys.course(courseId), 'enrolled'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

            const { data: pengguna } = (await supabase
                .from('pengguna')
                .select('id')
                .eq('auth_id', user.id)
                .single()) as { data: { id: string } | null };

            if (!pengguna) return false;

            const { data, error } = (await supabase
                .from('pendaftaran_kursus')
                .select('id, status')
                .eq('id_kursus', courseId)
                .eq('id_pengguna', pengguna.id)
                .maybeSingle()) as { data: { id: string; status: string } | null, error: any };

            if (error) throw error;
            return data ? { enrolled: true, status: data.status, enrollmentId: data.id } : { enrolled: false };
        },
        enabled: !!courseId,
    });
}

/**
 * Fetch kategori kursus yang tersedia
 */
export function useCourseCategories() {
    return useQuery({
        queryKey: [...catalogKeys.all, 'categories'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data: pengguna } = (await supabase
                .from('pengguna')
                .select('id_lembaga')
                .eq('auth_id', user.id)
                .single()) as { data: { id_lembaga: string } | null };

            if (!pengguna) throw new Error('Pengguna not found');

            const { data, error } = (await supabase
                .from('kursus')
                .select('kategori')
                .eq('id_lembaga', pengguna.id_lembaga)
                .eq('status', 'published')
                .not('kategori', 'is', null)) as { data: { kategori: string | null }[] | null, error: any };

            if (error) throw error;
            if (!data) return [];

            // Get unique categories
            const categories = [...new Set(data.map(item => item.kategori))].filter(Boolean);
            return categories as string[];
        },
    });
}
