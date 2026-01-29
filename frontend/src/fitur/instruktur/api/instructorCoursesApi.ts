import { supabase } from "@/pustaka/supabase";
import type {
  InstructorCourse,
  InstructorCourseDetail,
  CourseFilters,
  PaginatedCourses,
} from "../tipe/instructor.types";

/**
 * Get courses taught by current instructor
 */
export async function getInstructorCourses(
  filters?: CourseFilters,
): Promise<PaginatedCourses> {
  // Get current user
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Not authenticated");

  // Get current user's data
  const { data: currentUser } = (await supabase
    .from("pengguna")
    .select("id, id_lembaga, role")
    .eq("auth_id", authUser.id)
    .single()) as {
      data: { id: string; id_lembaga: string; role: string } | null;
    };

  if (!currentUser) throw new Error("User not found");
  if (currentUser.role !== "instruktur") {
    throw new Error("Unauthorized: Only instructors can access this");
  }

  // Build query - filter by instructor_id and id_lembaga
  let query = supabase
    .from("kursus")
    .select("*", { count: "exact" })
    .eq("id_instruktur", currentUser.id) // Only courses taught by this instructor
    .eq("id_lembaga", currentUser.id_lembaga) // Tenant isolation
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters?.search) {
    query = query.or(
      `judul.ilike.%${filters.search}%,deskripsi.ilike.%${filters.search}%`,
    );
  }

  if (filters?.kategori) {
    query = query.eq("kategori", filters.kategori);
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  // Pagination
  const page = filters?.page || 1;
  const limit = filters?.limit || 12;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  const {
    data: courses,
    error,
    count,
  } = (await query) as {
    data: InstructorCourse[] | null;
    error: unknown;
    count: number | null;
  };

  if (error) throw error;

  // Enrich with computed fields (enrollment stats)
  const enrichedCourses = await Promise.all(
    (courses || []).map(async (course) => {
      // Get enrollment count
      const { count: enrollmentCount } = await supabase
        .from("pendaftaran_kursus")
        .select("*", { count: "exact", head: true })
        .eq("id_kursus", course.id);

      // Get assignment/assessment IDs for this course
      const { data: assessments } = (await supabase
        .from("asesmen")
        .select("id")
        .eq("id_kursus", course.id)) as { data: { id: string }[] | null };

      const assessmentIds = assessments?.map((a) => a.id) || [];

      // Get pending submissions count (percobaan_asesmen)
      let pendingCount = 0;
      let avg_score: number | null = null;

      if (assessmentIds.length > 0) {
        const { count } = await supabase
          .from("percobaan_asesmen")
          .select("*", { count: "exact", head: true })
          .in("id_asesmen", assessmentIds)
          .eq("status", "selesai")
          .is("nilai", null); // Pending grading
        pendingCount = count || 0;

        // Get average score
        const { data: avgData } = (await supabase
          .from("percobaan_asesmen")
          .select("nilai")
          .in("id_asesmen", assessmentIds)
          .eq("status", "selesai")
          .not("nilai", "is", null)) as { data: { nilai: number }[] | null };

        avg_score =
          avgData && avgData.length > 0
            ? avgData.reduce((sum, s) => sum + (s.nilai || 0), 0) /
            avgData.length
            : null;
      }

      // Get completion rate (students who completed all modules - mocked for now or use enrollment status)
      const { count: completedCount } = await supabase
        .from("pendaftaran_kursus")
        .select("*", { count: "exact", head: true })
        .eq("id_kursus", course.id)
        .eq("status", "selesai"); // 'selesai' instead of 'completed'

      const completion_rate =
        enrollmentCount && enrollmentCount > 0
          ? ((completedCount || 0) / enrollmentCount) * 100
          : 0;

      return {
        ...course,
        total_peserta: enrollmentCount || 0,
        completion_rate: Math.round(completion_rate * 10) / 10,
        avg_score: avg_score ? Math.round(avg_score * 10) / 10 : null,
        pending_submissions: pendingCount || 0,
      } as InstructorCourse;
    }),
  );

  return {
    data: enrichedCourses,
    count: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Get course detail with enrollment statistics
 */
export async function getInstructorCourseDetail(
  kursusId: string,
): Promise<InstructorCourseDetail> {
  // Get current user
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Not authenticated");

  // Get current user's data
  const { data: currentUser } = (await supabase
    .from("pengguna")
    .select("id, id_lembaga, role")
    .eq("auth_id", authUser.id)
    .single()) as {
      data: { id: string; id_lembaga: string; role: string } | null;
    };

  if (!currentUser) throw new Error("User not found");
  if (currentUser.role !== "instruktur") {
    throw new Error("Unauthorized: Only instructors can access this");
  }

  // Get course - verify it belongs to this instructor
  const { data: course, error } = (await supabase
    .from("kursus")
    .select("*")
    .eq("id", kursusId)
    .eq("id_instruktur", currentUser.id) // Verify ownership
    .eq("id_lembaga", currentUser.id_lembaga) // Tenant isolation
    .single()) as { data: InstructorCourse | null; error: any };

  if (error) throw error;
  if (!course) throw new Error("Course not found or access denied");

  // Get enrollment statistics
  const { count: totalEnrolled } = await supabase
    .from("pendaftaran_kursus")
    .select("*", { count: "exact", head: true })
    .eq("id_kursus", kursusId);

  const { count: activeStudents } = await supabase
    .from("pendaftaran_kursus")
    .select("*", { count: "exact", head: true })
    .eq("id_kursus", kursusId)
    .eq("status", "aktif");

  const { count: completedStudents } = await supabase
    .from("pendaftaran_kursus")
    .select("*", { count: "exact", head: true })
    .eq("id_kursus", kursusId)
    .eq("status", "selesai");

  const completion_rate =
    totalEnrolled && totalEnrolled > 0
      ? ((completedStudents || 0) / totalEnrolled) * 100
      : 0;

  // Get module count
  const { count: moduleCount } = await supabase
    .from("modul")
    .select("*", { count: "exact", head: true })
    .eq("id_kursus", kursusId);

  // Get total assignments
  const { count: totalAssignments } = await supabase
    .from("asesmen")
    .select("*", { count: "exact", head: true })
    .eq("id_kursus", kursusId);

  return {
    ...course,
    enrollment_stats: {
      total_enrolled: totalEnrolled || 0,
      active_students: activeStudents || 0,
      completed_students: completedStudents || 0,
      completion_rate: Math.round(completion_rate * 10) / 10,
    },
    module_count: moduleCount || 0,
    total_assignments: totalAssignments || 0,
  };
}

/**
 * Get enrollments for a specific course
 */
export async function getCourseEnrollments(kursusId: string) {
  // Get current user
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Not authenticated");

  // Get current user's data
  const { data: currentUser } = (await supabase
    .from("pengguna")
    .select("id, id_lembaga, role")
    .eq("auth_id", authUser.id)
    .single()) as {
      data: { id: string; id_lembaga: string; role: string } | null;
    };

  if (!currentUser) throw new Error("User not found");
  if (currentUser.role !== "instruktur") {
    throw new Error("Unauthorized: Only instructors can access this");
  }

  // Verify course belongs to this instructor
  const { data: course } = await supabase
    .from("kursus")
    .select("id")
    .eq("id", kursusId)
    .eq("id_instruktur", currentUser.id)
    .eq("id_lembaga", currentUser.id_lembaga)
    .single();

  if (!course) throw new Error("Course not found or access denied");

  // Get enrollments with student info
  const { data, error } = await supabase
    .from("pendaftaran_kursus")
    .select(
      `
      *,
      pengguna:id_pengguna (
        id,
        nama_lengkap,
        email
      )
    `,
    )
    .eq("id_kursus", kursusId)
    .order("tanggal_mulai", { ascending: false });

  if (error) throw error;

  return data;
}
