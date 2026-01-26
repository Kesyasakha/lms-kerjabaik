import { supabase } from "@/pustaka/supabase";

// Dashboard stats interface
export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  recentUsers: RecentUser[];
  recentCourses: RecentCourse[];
  enrollmentsByStatus: EnrollmentByStatus[];
}

export interface RecentUser {
  id: string;
  nama_lengkap: string;
  email: string;
  role: string;
  created_at: string;
}

export interface RecentCourse {
  id: string;
  judul: string;
  status: string;
  instruktur_nama: string | null;
  enrollment_count: number;
  created_at: string;
}

export interface EnrollmentByStatus {
  status: string;
  count: number;
}

/**
 * Get dashboard statistics for admin
 * Includes user counts, course counts, enrollment stats, and recent activity
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  // Get current user's id_lembaga
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Not authenticated");

  const { data: currentUser } = await supabase
    .from("pengguna")
    .select("id_lembaga")
    .eq("auth_id", authUser.id)
    .single();

  if (!currentUser) throw new Error("User not found");
  const tenantId = (currentUser as any).id_lembaga;

  // Fetch all stats in parallel
  const [
    usersResult,
    coursesResult,
    enrollmentsResult,
    recentUsersResult,
    recentCoursesResult,
  ] = await Promise.all([
    // Total users in tenant
    supabase
      .from("pengguna")
      .select("id", { count: "exact", head: true })
      .eq("id_lembaga", tenantId),

    // Total courses in tenant
    supabase
      .from("kursus")
      .select("id", { count: "exact", head: true })
      .eq("id_lembaga", tenantId),

    // Enrollment stats - get enrollments for courses in this tenant
    supabase
      .from("pendaftaran_kursus")
      .select("id, status, kursus!inner(id_lembaga)")
      .eq("kursus.id_lembaga", tenantId),

    // Recent 5 users
    supabase
      .from("pengguna")
      .select("id, nama_lengkap, email, role, created_at")
      .eq("id_lembaga", tenantId)
      .order("created_at", { ascending: false })
      .limit(5),

    // Recent 5 courses with instructor
    supabase
      .from("kursus")
      .select(
        `
        id,
        judul,
        status,
        created_at,
        instruktur:pengguna!id_instruktur(nama_lengkap)
      `,
      )
      .eq("id_lembaga", tenantId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Process enrollment stats
  const enrollments = (enrollmentsResult.data || []) as any[];
  const totalEnrollments = enrollments.length;
  const activeEnrollments = enrollments.filter(
    (e) => e.status === "active",
  ).length;
  const completedEnrollments = enrollments.filter(
    (e) => e.status === "completed",
  ).length;

  // Group enrollments by status
  const statusCounts: Record<string, number> = {};
  enrollments.forEach((e) => {
    statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
  });
  const enrollmentsByStatus: EnrollmentByStatus[] = Object.entries(
    statusCounts,
  ).map(([status, count]) => ({ status, count }));

  // Process recent users
  const recentUsers: RecentUser[] = (
    (recentUsersResult.data || []) as any[]
  ).map((u) => ({
    id: u.id,
    nama_lengkap: u.nama_lengkap || "Unknown",
    email: u.email || "",
    role: u.role || "pembelajar",
    created_at: u.created_at,
  }));

  // Process recent courses - get enrollment count separately
  const recentCoursesData = (recentCoursesResult.data || []) as any[];
  const recentCourses: RecentCourse[] = [];

  for (const c of recentCoursesData) {
    // Get enrollment count for each course
    const { count } = await supabase
      .from("pendaftaran_kursus")
      .select("id", { count: "exact", head: true })
      .eq("id_kursus", c.id);

    recentCourses.push({
      id: c.id,
      judul: c.judul,
      status: c.status,
      instruktur_nama: c.instruktur?.nama_lengkap || null,
      enrollment_count: count || 0,
      created_at: c.created_at,
    });
  }

  return {
    totalUsers: usersResult.count || 0,
    totalCourses: coursesResult.count || 0,
    totalEnrollments,
    activeEnrollments,
    completedEnrollments,
    recentUsers,
    recentCourses,
    enrollmentsByStatus,
  };
}
