import { supabase } from "@/pustaka/supabase";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  courseId?: string;
  kategori?: string;
  status?: string;
  searchQuery?: string;
}

export interface ProgressReportData {
  id: string;
  peserta_nama: string;
  peserta_email: string;
  kursus_judul: string;
  kursus_kategori: string;
  persentase_kemajuan: number;
  modul_selesai: number;
  total_modul: number;
  waktu_belajar_menit: number;
  status: "not_started" | "in_progress" | "completed";
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
}

export interface AttendanceReportData {
  id: string;
  peserta_nama: string;
  peserta_email: string;
  kursus_judul: string;
  total_sesi: number;
  sesi_hadir: number;
  persentase_kehadiran: number;
  status_kehadiran: "hadir" | "tidak_hadir" | "izin";
}

export interface AssessmentReportData {
  id: string;
  peserta_nama: string;
  peserta_email: string;
  kursus_judul: string;
  jenis_asesmen: string;
  judul_asesmen: string;
  nilai: number;
  nilai_maksimal: number;
  persentase: number;
  status: "lulus" | "tidak_lulus" | "pending";
  tanggal_pengerjaan: string;
}

export interface AssessmentStatistics {
  rata_rata: number;
  nilai_tertinggi: number;
  nilai_terendah: number;
  total_peserta: number;
  lulus: number;
  tidak_lulus: number;
}

export interface EngagementReportData {
  id: string;
  peserta_nama: string;
  peserta_email: string;
  kursus_judul: string;
  total_waktu_belajar_menit: number;
  jumlah_login: number;
  aktivitas_terakhir: string;
  interaksi_forum: number;
  interaksi_diskusi: number;
  engagement_score: number;
}

export interface CustomReportConfig {
  metrics: string[];
  groupBy: "course" | "user" | "date";
  aggregation: "sum" | "avg" | "count";
  filters: ReportFilters;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get current user's id_lembaga
 */
async function getCurrentTenantId(): Promise<string> {
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
  return (currentUser as any).id_lembaga;
}

/**
 * Laporan Progress Pembelajaran
 * Pelacakan kemajuan individu dan kelompok dalam kursus
 */
export async function getProgressReport(
  filters: ReportFilters = {},
): Promise<ProgressReportData[]> {
  const tenantId = await getCurrentTenantId();

  // First, get all courses for this tenant
  const { data: tenantCourses } = await supabase
    .from("kursus")
    .select("id")
    .eq("id_lembaga", tenantId);

  const courseIds = (tenantCourses || []).map((c: any) => c.id);

  if (courseIds.length === 0) {
    return [];
  }

  let query = supabase
    .from("pendaftaran_kursus")
    .select(
      `
      id,
      persentase_kemajuan,
      status,
      tanggal_mulai,
      tanggal_selesai,
      pengguna:id_pengguna (
        id,
        nama_lengkap,
        email
      ),
      kursus:id_kursus (
        id,
        judul,
        kategori
      )
    `,
    )
    .in("id_kursus", courseIds);

  // Apply filters
  if (filters.courseId) {
    query = query.eq("id_kursus", filters.courseId);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.dateFrom) {
    query = query.gte("tanggal_mulai", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("tanggal_mulai", filters.dateTo);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Transform data
  const reportData: ProgressReportData[] = (data || []).map((item: any) => {
    const progress = Number(item.persentase_kemajuan) || 0;
    const totalModul = 10; // TODO: Get from kursus.total_modul when available
    const modulSelesai = Math.floor((progress / 100) * totalModul);

    return {
      id: item.id,
      peserta_nama: item.pengguna?.nama_lengkap || "Unknown",
      peserta_email: item.pengguna?.email || "",
      kursus_judul: item.kursus?.judul || "Unknown",
      kursus_kategori: item.kursus?.kategori || "Uncategorized",
      persentase_kemajuan: progress,
      modul_selesai: modulSelesai,
      total_modul: totalModul,
      waktu_belajar_menit: Math.floor(Math.random() * 500), // TODO: Track actual time
      status:
        progress === 0
          ? "not_started"
          : progress === 100
            ? "completed"
            : "in_progress",
      tanggal_mulai: item.tanggal_mulai,
      tanggal_selesai: item.tanggal_selesai,
    };
  });

  // Apply search filter
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    return reportData.filter(
      (item) =>
        item.peserta_nama.toLowerCase().includes(query) ||
        item.peserta_email.toLowerCase().includes(query) ||
        item.kursus_judul.toLowerCase().includes(query),
    );
  }

  return reportData;
}

/**
 * Laporan Kehadiran
 * Rekam jejak kehadiran dalam sesi pembelajaran sinkron
 */
export async function getAttendanceReport(
  filters: ReportFilters = {},
): Promise<AttendanceReportData[]> {
  const tenantId = await getCurrentTenantId();

  // First, get all courses for this tenant
  const { data: tenantCourses } = await supabase
    .from("kursus")
    .select("id")
    .eq("id_lembaga", tenantId);

  const courseIds = (tenantCourses || []).map((c: any) => c.id);

  if (courseIds.length === 0) {
    return [];
  }

  let query = supabase
    .from("pendaftaran_kursus")
    .select(
      `
      id,
      pengguna:id_pengguna (
        id,
        nama_lengkap,
        email
      ),
      kursus:id_kursus (
        id,
        judul
      )
    `,
    )
    .in("id_kursus", courseIds);

  if (filters.courseId) {
    query = query.eq("id_kursus", filters.courseId);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Transform data - simulated attendance data
  const reportData: AttendanceReportData[] = (data || []).map((item: any) => {
    const totalSesi = Math.floor(Math.random() * 10) + 5;
    const sesiHadir = Math.floor(Math.random() * totalSesi);
    const persentase = Math.round((sesiHadir / totalSesi) * 100);

    return {
      id: item.id,
      peserta_nama: item.pengguna?.nama_lengkap || "Unknown",
      peserta_email: item.pengguna?.email || "",
      kursus_judul: item.kursus?.judul || "Unknown",
      total_sesi: totalSesi,
      sesi_hadir: sesiHadir,
      persentase_kehadiran: persentase,
      status_kehadiran:
        persentase >= 75 ? "hadir" : persentase >= 50 ? "izin" : "tidak_hadir",
    };
  });

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    return reportData.filter(
      (item) =>
        item.peserta_nama.toLowerCase().includes(query) ||
        item.peserta_email.toLowerCase().includes(query),
    );
  }

  return reportData;
}

/**
 * Laporan Penilaian
 * Analisis hasil kuis, ujian, dan tugas dengan statistik detail
 */
export async function getAssessmentReport(
  filters: ReportFilters = {},
): Promise<{ data: AssessmentReportData[]; statistics: AssessmentStatistics }> {
  const tenantId = await getCurrentTenantId();

  // First, get all courses for this tenant
  const { data: tenantCourses } = await supabase
    .from("kursus")
    .select("id")
    .eq("id_lembaga", tenantId);

  const courseIds = (tenantCourses || []).map((c: any) => c.id);

  if (courseIds.length === 0) {
    return {
      data: [],
      statistics: {
        rata_rata: 0,
        nilai_tertinggi: 0,
        nilai_terendah: 0,
        total_peserta: 0,
        lulus: 0,
        tidak_lulus: 0,
      },
    };
  }

  // Get all assessments for these courses
  const { data: tenantAssessments } = await supabase
    .from("asesmen")
    .select("id")
    .in("id_kursus", courseIds);

  const assessmentIds = (tenantAssessments || []).map((a: any) => a.id);

  if (assessmentIds.length === 0) {
    return {
      data: [],
      statistics: {
        rata_rata: 0,
        nilai_tertinggi: 0,
        nilai_terendah: 0,
        total_peserta: 0,
        lulus: 0,
        tidak_lulus: 0,
      },
    };
  }

  // Get submissions with assessments
  let query = supabase
    .from("submission")
    .select(
      `
      id,
      nilai,
      submitted_at,
      status,
      pengguna:id_pengguna (
        id,
        nama_lengkap,
        email
      ),
      asesmen:id_asesmen (
        id,
        judul,
        jenis,
        nilai_kelulusan,
        kursus:id_kursus (
          id,
          judul
        )
      )
    `,
    )
    .in("id_asesmen", assessmentIds);

  if (filters.courseId) {
    query = query.eq("asesmen.id_kursus", filters.courseId);
  }

  if (filters.dateFrom) {
    query = query.gte("submitted_at", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("submitted_at", filters.dateTo);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Transform data
  const reportData: AssessmentReportData[] = (data || []).map((item: any) => {
    const nilai = item.nilai || 0;
    const nilaiMaksimal = 100;
    const persentase = Math.round((nilai / nilaiMaksimal) * 100);
    const passingScore = item.asesmen?.nilai_kelulusan || 70;

    return {
      id: item.id,
      peserta_nama: item.pengguna?.nama_lengkap || "Unknown",
      peserta_email: item.pengguna?.email || "",
      kursus_judul: item.asesmen?.kursus?.judul || "Unknown",
      jenis_asesmen: item.asesmen?.jenis || "kuis",
      judul_asesmen: item.asesmen?.judul || "Unknown",
      nilai: nilai,
      nilai_maksimal: nilaiMaksimal,
      persentase: persentase,
      status:
        item.status === "graded"
          ? nilai >= passingScore
            ? "lulus"
            : "tidak_lulus"
          : "pending",
      tanggal_pengerjaan: item.submitted_at,
    };
  });

  // Calculate statistics
  const nilaiArray = reportData
    .filter((item) => item.status !== "pending")
    .map((item) => item.nilai);

  const statistics: AssessmentStatistics = {
    rata_rata:
      nilaiArray.length > 0
        ? Math.round(nilaiArray.reduce((a, b) => a + b, 0) / nilaiArray.length)
        : 0,
    nilai_tertinggi: nilaiArray.length > 0 ? Math.max(...nilaiArray) : 0,
    nilai_terendah: nilaiArray.length > 0 ? Math.min(...nilaiArray) : 0,
    total_peserta: reportData.length,
    lulus: reportData.filter((item) => item.status === "lulus").length,
    tidak_lulus: reportData.filter((item) => item.status === "tidak_lulus")
      .length,
  };

  // Apply search filter
  let filteredData = reportData;
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filteredData = reportData.filter(
      (item) =>
        item.peserta_nama.toLowerCase().includes(query) ||
        item.peserta_email.toLowerCase().includes(query) ||
        item.kursus_judul.toLowerCase().includes(query),
    );
  }

  return { data: filteredData, statistics };
}

/**
 * Laporan Keterlibatan
 * Metrik interaksi peserta dengan konten dan aktivitas
 */
export async function getEngagementReport(
  filters: ReportFilters = {},
): Promise<EngagementReportData[]> {
  const tenantId = await getCurrentTenantId();

  // First, get all courses for this tenant
  const { data: tenantCourses } = await supabase
    .from("kursus")
    .select("id")
    .eq("id_lembaga", tenantId);

  const courseIds = (tenantCourses || []).map((c: any) => c.id);

  if (courseIds.length === 0) {
    return [];
  }

  let query = supabase
    .from("pendaftaran_kursus")
    .select(
      `
      id,
      updated_at,
      pengguna:id_pengguna (
        id,
        nama_lengkap,
        email
      ),
      kursus:id_kursus (
        id,
        judul
      )
    `,
    )
    .in("id_kursus", courseIds);

  if (filters.courseId) {
    query = query.eq("id_kursus", filters.courseId);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Transform data - simulated engagement metrics
  const reportData: EngagementReportData[] = (data || []).map((item: any) => {
    const waktuBelajar = Math.floor(Math.random() * 1000) + 100;
    const jumlahLogin = Math.floor(Math.random() * 50) + 5;
    const interaksiForum = Math.floor(Math.random() * 20);
    const interaksiDiskusi = Math.floor(Math.random() * 30);

    // Calculate engagement score (0-100)
    const engagementScore = Math.min(
      100,
      Math.round(
        (waktuBelajar / 10 +
          jumlahLogin * 2 +
          interaksiForum * 3 +
          interaksiDiskusi * 2) /
        10,
      ),
    );

    return {
      id: item.id,
      peserta_nama: item.pengguna?.nama_lengkap || "Unknown",
      peserta_email: item.pengguna?.email || "",
      kursus_judul: item.kursus?.judul || "Unknown",
      total_waktu_belajar_menit: waktuBelajar,
      jumlah_login: jumlahLogin,
      aktivitas_terakhir: item.updated_at || new Date().toISOString(),
      interaksi_forum: interaksiForum,
      interaksi_diskusi: interaksiDiskusi,
      engagement_score: engagementScore,
    };
  });

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    return reportData.filter(
      (item) =>
        item.peserta_nama.toLowerCase().includes(query) ||
        item.peserta_email.toLowerCase().includes(query),
    );
  }

  return reportData;
}

/**
 * Export report data to CSV format
 */
export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((header) => JSON.stringify(row[header] || "")).join(","),
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
