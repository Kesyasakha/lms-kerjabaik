import { supabase } from "@/pustaka/supabase";
import type {
  EnrolledStudent,
  StudentProgressDetail,
  StudentFilters,
  PaginatedStudents,
  StudentEngagement,
  CourseAnalytics,
  ModuleCompletion,
  GradeDistribution,
} from "../tipe/instructor.types";

/**
 * Get enrolled students for a course
 */
export async function getEnrolledStudents(
  kursusId: string,
  filters?: StudentFilters,
): Promise<PaginatedStudents> {
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

  // Get total modules for progress calculation
  const { count: totalModules } = await supabase
    .from("modul")
    .select("*", { count: "exact", head: true })
    .eq("id_kursus", kursusId);

  // Build query for enrollments
  let query = supabase
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
      { count: "exact" },
    )
    .eq("id_kursus", kursusId)
    .order("tanggal_mulai", { ascending: false });

  // Apply filters
  if (filters?.search) {
    // Note: We'll filter in memory since we need to search in joined table
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  // Pagination
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  const { data: enrollments, error, count } = await query;

  if (error) throw error;

  // Enrich with progress data
  const students: EnrolledStudent[] = await Promise.all(
    (enrollments || []).map(async (enrollment: any) => {
      const studentId = enrollment.id_pengguna;

      // Use progress from enrollment table directly
      const progress_percentage = enrollment.persentase_kemajuan || 0;

      // Get average score from assessments (percobaan_asesmen)
      const { data: submissions } = (await supabase
        .from("percobaan_asesmen")
        .select("nilai")
        .eq("id_pengguna", studentId)
        .in(
          "id_asesmen",
          ((await supabase
            .from("asesmen")
            .select("id")
            .eq("id_kursus", kursusId)
          ) as { data: { id: string }[] | null }).data?.map((a) => a.id) || [],
        )
        .eq("status", "selesai")
        .not("nilai", "is", null)) as { data: { nilai: number | null }[] | null };

      const avg_score =
        submissions && submissions.length > 0
          ? submissions.reduce((sum, s) => sum + (s.nilai || 0), 0) /
          submissions.length
          : null;

      // Mock last activity for now as activity_log table is missing
      const lastActivityTimestamp = enrollment.updated_at;

      // Determine status
      const status =
        enrollment.status === "selesai"
          ? "completed"
          : enrollment.status === "dibatalkan"
            ? "inactive"
            : "active";

      return {
        id: enrollment.id,
        student_id: studentId,
        student_name: enrollment.pengguna?.nama_lengkap || "Unknown",
        student_email: enrollment.pengguna?.email || "",
        enrollment_date: enrollment.tanggal_mulai,
        progress_percentage: Math.round(progress_percentage * 10) / 10,
        completed_modules: 0, // Not easily calculated without complex join
        total_modules: totalModules || 0,
        avg_score: avg_score ? Math.round(avg_score * 10) / 10 : null,
        last_activity: lastActivityTimestamp,
        status: status as "active" | "inactive" | "completed",
      };
    }),
  );

  // Apply search filter in memory if needed
  let filteredStudents = students;
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filteredStudents = students.filter(
      (s) =>
        s.student_name.toLowerCase().includes(searchLower) ||
        s.student_email.toLowerCase().includes(searchLower),
    );
  }

  // Apply progress range filter
  if (filters?.progress_min !== undefined) {
    filteredStudents = filteredStudents.filter(
      (s) => s.progress_percentage >= filters.progress_min!,
    );
  }
  if (filters?.progress_max !== undefined) {
    filteredStudents = filteredStudents.filter(
      (s) => s.progress_percentage <= filters.progress_max!,
    );
  }

  return {
    data: filteredStudents,
    count: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Get detailed progress for a specific student
 */
export async function getStudentProgress(
  kursusId: string,
  studentId: string,
): Promise<StudentProgressDetail> {
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
  const { data: course } = (await supabase
    .from("kursus")
    .select("id, judul")
    .eq("id", kursusId)
    .eq("id_instruktur", currentUser.id)
    .eq("id_lembaga", currentUser.id_lembaga)
    .single()) as { data: { id: string; judul: string } | null };

  if (!course) throw new Error("Course not found or access denied");

  // Get student info
  const { data: student } = (await supabase
    .from("pengguna")
    .select("id, nama_lengkap, email")
    .eq("id", studentId)
    .eq("id_lembaga", currentUser.id_lembaga)
    .single()) as { data: { id: string; nama_lengkap: string; email: string } | null };

  if (!student) throw new Error("Student not found");

  // Get Enrollment Data
  const { data: enrollment } = (await supabase
    .from("pendaftaran_kursus")
    .select("tanggal_mulai, persentase_kemajuan, status, updated_at, id_pengguna")
    .eq("id_kursus", kursusId)
    .eq("id_pengguna", studentId)
    .single()) as { data: { tanggal_mulai: string; persentase_kemajuan: number; status: string; updated_at: string; id_pengguna: string } | null };

  if (!enrollment) throw new Error("Student is not enrolled in this course");

  // 1. Get Quiz/Exam Data from percobaan_asesmen
  const { data: quizAttemptsData } = (await supabase
    .from("percobaan_asesmen")
    .select(`
      nilai, 
      status, 
      created_at, 
      asesmen:id_asesmen (
        id, 
        judul, 
        poin,
        tipe
      )
    `)
    .eq("id_pengguna", studentId)
    .in(
      "id_asesmen",
      ((await supabase
        .from("asesmen")
        .select("id")
        .eq("id_kursus", kursusId)
        .not("tipe", "eq", "tugas") // Exclude tasks from quiz attempts
      ) as { data: { id: string }[] | null }).data?.map((a) => a.id) || []
    )) as {
      data: {
        nilai: number | null;
        status: string;
        created_at: string;
        asesmen: {
          id: string;
          judul: string;
          poin: number;
          tipe: string;
        }
      }[] | null
    };

  const quizGradesMap = new Map<string, any>();
  (quizAttemptsData || []).forEach((g) => {
    const score = g.nilai ? Number(g.nilai) : null;
    const existing = quizGradesMap.get(g.asesmen.id);

    // Update if not exists or if current is graded and existing is not, or if current score is higher
    if (!existing ||
      (score !== null && (existing.grade === null || score > existing.grade)) ||
      (g.status === 'selesai' && existing.status !== 'graded')) {
      quizGradesMap.set(g.asesmen.id, {
        assignment_id: g.asesmen.id,
        assignment_title: g.asesmen.judul,
        grade: score,
        max_score: g.asesmen.poin || 100,
        submitted_at: g.created_at,
        status: (g.status === "selesai" ? "graded" : "pending") as "graded" | "pending" | "not_submitted",
        type: g.asesmen.tipe
      });
    }
  });
  const quizGrades = Array.from(quizGradesMap.values());

  // 2. Get Task Submission Data from pengumpulan_tugas
  const { data: courseAssessments } = (await supabase
    .from("asesmen")
    .select("id")
    .eq("id_kursus", kursusId)
    .eq("tipe", "tugas")) as { data: { id: string }[] | null };

  const assessmentIdsForTasks = (courseAssessments || []).map(a => a.id);

  const { data: tasks } = (await supabase
    .from("tugas")
    .select("id, id_asesmen, judul")
    .in("id_asesmen", assessmentIdsForTasks)) as { data: { id: string, id_asesmen: string, judul: string }[] | null };

  const taskIds = (tasks || []).map(t => t.id);

  const { data: submissionsData } = (await supabase
    .from("pengumpulan_tugas")
    .select(`
      id,
      id_tugas,
      nilai,
      status,
      created_at,
      tugas:id_tugas (
        id_asesmen,
        judul
      )
    `)
    .eq("id_pengguna", studentId)
    .in("id_tugas", taskIds)) as {
      data: {
        id: string;
        id_tugas: string;
        nilai: number | null;
        status: string;
        created_at: string;
        tugas: {
          id_asesmen: string;
          judul: string;
        }
      }[] | null
    };

  const taskGradesMap = new Map<string, any>();
  (submissionsData || []).forEach((s) => {
    const score = s.nilai ? Number(s.nilai) : null;
    const existing = taskGradesMap.get(s.tugas.id_asesmen);

    if (!existing || (score !== null && (existing.grade === null || score > existing.grade))) {
      taskGradesMap.set(s.tugas.id_asesmen, {
        assignment_id: s.tugas.id_asesmen,
        assignment_title: s.tugas.judul,
        grade: score,
        max_score: 100, // Default for tasks
        submitted_at: s.created_at,
        status: (s.status === "dinilai" ? "graded" : "pending") as "graded" | "pending" | "not_submitted",
        type: "tugas"
      });
    }
  });
  const taskGrades = Array.from(taskGradesMap.values());

  // Combine both types of grades
  const grades = [...quizGrades, ...taskGrades];

  // 3. Get Module Progress Data (Real Implementation via Materi)
  // Fetch all modules for the course
  const { data: modulesData } = (await supabase
    .from("modul")
    .select("id, judul, urutan")
    .eq("id_kursus", kursusId)
    .order("urutan", { ascending: true })) as {
      data: { id: string; judul: string; urutan: number }[] | null;
    };

  // Fetch all materials (materi) for these modules
  const { data: materiData } = (await supabase
    .from("materi")
    .select("id, id_modul")
    .in("id_modul", (modulesData || []).map(m => m.id))) as {
      data: { id: string, id_modul: string }[] | null
    };

  // Fetch real progress from kemajuan_belajar (mapped to materi)
  const { data: kemajuanData } = (await supabase
    .from("kemajuan_belajar")
    .select("id_materi, status, updated_at")
    .eq("id_pengguna", studentId)
    .in("id_materi", (materiData || []).map(mat => mat.id))) as {
      data: { id_materi: string, status: string, updated_at: string | null }[] | null
    };

  const moduleProgress = (modulesData || []).map((m) => {
    // A module is completed if ALL its materials are 'selesai'
    const moduleMaterials = (materiData || []).filter(mat => mat.id_modul === m.id);
    const completedMaterials = moduleMaterials.filter(mat =>
      (kemajuanData || []).some(k => k.id_materi === mat.id && k.status === 'selesai')
    );

    const isCompleted = moduleMaterials.length > 0 && completedMaterials.length === moduleMaterials.length;

    // Use the latest material completion date as module completion date
    const completionDates = (kemajuanData || [])
      .filter(k => moduleMaterials.some(mat => mat.id === k.id_materi) && k.status === 'selesai' && k.updated_at)
      .map(k => new Date(k.updated_at!).getTime());

    const latestCompletion = completionDates.length > 0 ? new Date(Math.max(...completionDates)).toISOString() : null;

    return {
      module_id: m.id,
      module_title: m.judul,
      module_order: m.urutan,
      completed: isCompleted,
      completed_at: latestCompletion,
      time_spent_minutes: 0,
    };
  });

  return {
    student_id: studentId,
    student_name: student.nama_lengkap,
    student_email: student.email,
    id_kursus: kursusId,
    kursus_judul: course.judul,
    enrollment_date: enrollment.tanggal_mulai,
    progress_percentage: enrollment.persentase_kemajuan || 0,
    module_progress: moduleProgress,
    grades: grades,
    engagement: {
      total_login_count: 0,
      last_login: null,
      total_time_spent_minutes: 0,
      avg_session_duration_minutes: 0,
      activity_log: [],
    },
  };
}

/**
 * Get student engagement metrics
 */
export async function getStudentEngagement(
  _kursusId: string,
  _studentId: string,
): Promise<StudentEngagement> {
  // Mock implementation as activity_log table missing
  return {
    total_login_count: 0,
    last_login: null,
    total_time_spent_minutes: 0,
    avg_session_duration_minutes: 0,
    activity_log: [],
  };
}

/**
 * Get course analytics
 */
export async function getCourseAnalytics(
  kursusId: string,
): Promise<CourseAnalytics> {
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
  const { data: course } = (await supabase
    .from("kursus")
    .select("id, judul")
    .eq("id", kursusId)
    .eq("id_instruktur", currentUser.id)
    .eq("id_lembaga", currentUser.id_lembaga)
    .single()) as { data: { id: string; judul: string } | null };

  if (!course) throw new Error("Course not found or access denied");

  // Get enrollment stats
  const { count: totalStudents } = await supabase
    .from("pendaftaran_kursus")
    .select("*", { count: "exact", head: true })
    .eq("id_kursus", kursusId);

  const { count: activeStudents } = await supabase
    .from("pendaftaran_kursus")
    .select("*", { count: "exact", head: true })
    .eq("id_kursus", kursusId)
    .eq("status", "aktif"); // 'aktif' based on schema

  const { count: completedStudents } = await supabase
    .from("pendaftaran_kursus")
    .select("*", { count: "exact", head: true })
    .eq("id_kursus", kursusId)
    .eq("status", "selesai"); // 'selesai' based on schema

  const completionRate =
    totalStudents && totalStudents > 0
      ? ((completedStudents || 0) / totalStudents) * 100
      : 0;

  // Get assessment IDs
  const { data: assessments } = (await supabase
    .from("asesmen")
    .select("id")
    .eq("id_kursus", kursusId)) as { data: { id: string }[] | null };
  const assessmentIds = assessments?.map((a) => a.id) || [];

  let submissions: any[] = [];
  if (assessmentIds.length > 0) {
    const { data } = await supabase
      .from("percobaan_asesmen")
      .select("nilai, status")
      .in("id_asesmen", assessmentIds);
    submissions = data || [];
  }

  // Calculate Average Score (completed submissions with score)
  const scoredSubmissions = submissions.filter(
    (s) => s.status === "selesai" && s.nilai !== null,
  );
  const avgScore =
    scoredSubmissions.length > 0
      ? scoredSubmissions.reduce((sum, s) => sum + (s.nilai || 0), 0) /
      scoredSubmissions.length
      : 0;

  // Pending submissions (finished but no grade)
  const pendingSubmissions = submissions.filter(
    (s) => s.status === "selesai" && s.nilai === null,
  ).length;

  // Module Completion Stats (Mocked as modul_progress table is missing)
  const { data: modules } = (await supabase
    .from("modul")
    .select("id, title:judul")
    .eq("id_kursus", kursusId)) as { data: { id: string; title: string }[] | null };

  const moduleCompletion: ModuleCompletion[] = (modules || []).map(
    (module) => ({
      module_id: module.id,
      module_title: module.title,
      total_students: totalStudents || 0,
      completed_count: 0, // Mock
      completion_rate: 0, // Mock
      avg_time_spent_minutes: 0, // Mock
    }),
  );

  // Grade Distribution
  const gradeRanges = [
    { range: "0-20", min: 0, max: 20 },
    { range: "21-40", min: 21, max: 40 },
    { range: "41-60", min: 41, max: 60 },
    { range: "61-80", min: 61, max: 80 },
    { range: "81-100", min: 81, max: 100 },
  ];

  const gradeDistribution: GradeDistribution[] = gradeRanges.map((r) => {
    const count = scoredSubmissions.filter(
      (s) => s.nilai !== null && s.nilai >= r.min && s.nilai <= r.max,
    ).length;
    const percentage =
      scoredSubmissions.length > 0
        ? (count / scoredSubmissions.length) * 100
        : 0;

    return {
      range: r.range,
      count,
      percentage: Math.round(percentage * 10) / 10,
    };
  });

  return {
    id_kursus: kursusId,
    kursus_judul: course.judul,
    total_students: totalStudents || 0,
    active_students: activeStudents || 0,
    completed_students: completedStudents || 0,
    completion_rate: Math.round(completionRate * 10) / 10,
    avg_score: Math.round(avgScore * 10) / 10,
    pending_submissions: pendingSubmissions,
    module_completion: moduleCompletion,
    grade_distribution: gradeDistribution,
    engagement_trend: [],
  };
}
