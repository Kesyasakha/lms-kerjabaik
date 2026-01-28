import { supabase } from "@/pustaka/supabase";
import type {
  AdminCourseFilters,
  PaginatedCourses,
  CourseAssignment,
  KursusWithInstructor,
  InstructorBasic,
} from "../tipe/courses.types";

/**
 * Get courses for current admin's tenant
 */
export async function getAdminCourses(
  filters?: AdminCourseFilters,
): Promise<PaginatedCourses> {
  // Get current user to filter by tenant
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Not authenticated");

  // Get current user's id_lembaga
  const { data: currentUser } = await supabase
    .from("pengguna")
    .select("id_lembaga")
    .eq("auth_id", authUser.id)
    .single();

  if (!currentUser) throw new Error("User not found");
  const tenantId = (currentUser as any).id_lembaga;

  let query = supabase
    .from("kursus")
    .select(
      `
      *,
      instruktur:pengguna!id_instruktur(
        id,
        nama_lengkap,
        email
      ),
      pendaftaran_kursus(count)
    `,
      { count: "exact" },
    )
    .eq("id_lembaga", tenantId) // Tenant isolation
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

  if (filters?.id_instruktur) {
    query = query.eq("id_instruktur", filters.id_instruktur);
  }

  // Pagination
  const page = filters?.page || 1;
  const limit = filters?.limit || 12;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  const coursesWithEnrollment = (data || []).map((course: any) => ({
    ...course,
    enrollment_count: course.pendaftaran_kursus?.[0]?.count || 0,
  }));

  return {
    data: coursesWithEnrollment as KursusWithInstructor[],
    count: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Assign instructor to course
 */
export async function assignInstructor(assignment: CourseAssignment) {
  // Get current user's id_lembaga for validation
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

  // Verify instructor is in same tenant
  const { data: instructor } = await supabase
    .from("pengguna")
    .select("id_lembaga")
    .eq("id", assignment.id_instruktur)
    .single();

  if (!instructor || (instructor as any).id_lembaga !== tenantId) {
    throw new Error("Instructor not found in your tenant");
  }

  // Update course
  const { data, error } = await supabase
    .from("kursus")
    // @ts-ignore: Supabase type inference issue
    .update({
      id_instruktur: assignment.id_instruktur,
      updated_at: new Date().toISOString(),
    })
    .eq("id", assignment.id_kursus)
    .eq("id_lembaga", tenantId) // Double check tenant isolation
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update course visibility/status
 */
export async function updateCourseVisibility(
  kursusId: string,
  status: "draft" | "published" | "archived",
) {
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

  // Update course
  const { data, error } = await supabase
    .from("kursus")
    // @ts-ignore: Supabase type inference issue
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", kursusId)
    .eq("id_lembaga", tenantId) // Tenant isolation
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get instructors for current tenant
 */
export async function getInstructors(): Promise<InstructorBasic[]> {
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

  // Get instructors
  const { data, error } = await supabase
    .from("pengguna")
    .select("id, nama_lengkap, email")
    .eq("id_lembaga", tenantId)
    .eq("role", "instruktur")
    .eq("status", "aktif")
    .order("nama_lengkap");

  if (error) throw error;
  return (data as InstructorBasic[]) || [];
}

/**
 * Get course detail by ID
 */
export async function getCourseDetail(kursusId: string) {
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

  // Get course with instructor and enrollment stats
  const { data: course, error } = await supabase
    .from("kursus")
    .select(
      `
      *,
      instruktur:pengguna!id_instruktur(
        id,
        nama_lengkap,
        email
      )
    `,
    )
    .eq("id", kursusId)
    .eq("id_lembaga", tenantId) // Tenant isolation
    .single();

  if (error) throw error;
  if (!course) throw new Error("Course not found");

  // Get enrollment count
  const { count: enrollmentCount } = await supabase
    .from("pendaftaran_kursus")
    .select("*", { count: "exact", head: true })
    .eq("id_kursus", kursusId);

  // Get active enrollment count
  const { count: activeCount } = await supabase
    .from("pendaftaran_kursus")
    .select("*", { count: "exact", head: true })
    .eq("id_kursus", kursusId)
    .eq("status", "active");

  // Get completed enrollment count
  const { count: completedCount } = await supabase
    .from("pendaftaran_kursus")
    .select("*", { count: "exact", head: true })
    .eq("id_kursus", kursusId)
    .eq("status", "completed");

  return {
    ...(course as KursusWithInstructor),
    stats: {
      totalEnrollments: enrollmentCount || 0,
      activeEnrollments: activeCount || 0,
      completedEnrollments: completedCount || 0,
    },
  };
}

/**
 * Create new course
 */
export interface CreateCourseData {
  judul: string;
  deskripsi?: string;
  kategori?: string;
  url_gambar_mini?: string;
  id_instruktur?: string;
  status: "draft" | "published";
  enrollment_policy?: "self_enrollment" | "admin_approval" | "auto_enrollment";
}

export async function createAdminCourse(courseData: CreateCourseData) {
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

  // If instructor is assigned, verify they are in the same tenant
  if (courseData.id_instruktur) {
    const { data: instructor } = await supabase
      .from("pengguna")
      .select("id_lembaga")
      .eq("id", courseData.id_instruktur)
      .single();

    if (!instructor || (instructor as any).id_lembaga !== tenantId) {
      throw new Error("Instructor not found in your tenant");
    }
  }

  const { data, error } = await supabase
    .from("kursus")
    // @ts-ignore: Supabase type inference issue
    .insert({
      ...courseData,
      id_instruktur: courseData.id_instruktur || null,
      id_lembaga: tenantId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update course
 */
export async function updateAdminCourse(
  kursusId: string,
  courseData: Partial<CreateCourseData>,
) {
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

  // If instructor is assigned, verify they are in the same tenant
  if (courseData.id_instruktur) {
    const { data: instructor } = await supabase
      .from("pengguna")
      .select("id_lembaga")
      .eq("id", courseData.id_instruktur)
      .single();

    if (!instructor || (instructor as any).id_lembaga !== tenantId) {
      throw new Error("Instructor not found in your tenant");
    }
  }

  const { data, error } = await supabase
    .from("kursus")
    // @ts-ignore
    .update({
      ...courseData,
      id_instruktur: courseData.id_instruktur || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", kursusId)
    .eq("id_lembaga", tenantId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete course
 */
export async function deleteAdminCourse(kursusId: string) {
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

  const { error } = await supabase
    .from("kursus")
    .delete()
    .eq("id", kursusId)
    .eq("id_lembaga", tenantId);

  if (error) throw error;
  return true;
}

/**
 * Upload course image
 */
export async function uploadCourseImage(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `covers/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("courses")
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("courses").getPublicUrl(fileName);
  return data.publicUrl;
}
