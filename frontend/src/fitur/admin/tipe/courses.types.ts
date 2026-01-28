import type { Database } from "@/shared/tipe/database.types";

type Kursus = Database["public"]["Tables"]["kursus"]["Row"];

/**
 * Enrollment policy types
 */
export type EnrollmentPolicy =
  | "self_enrollment"
  | "admin_approval"
  | "auto_enrollment";

/**
 * Course with instructor info
 */
export interface KursusWithInstructor extends Kursus {
  instruktur?: {
    id: string;
    nama_lengkap: string;
    email: string;
  } | null;
  enrollment_count?: number;
  url_gambar_mini?: string | null;
}

/**
 * Course filters for admin
 */
export interface AdminCourseFilters {
  search?: string;
  kategori?: string;
  status?: "draft" | "published" | "archived";
  id_instruktur?: string;
  page?: number;
  limit?: number;
}

/**
 * Paginated courses response
 */
export interface PaginatedCourses {
  data: KursusWithInstructor[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Course assignment data
 */
export interface CourseAssignment {
  id_kursus: string;
  id_instruktur: string;
}

/**
 * Course stats
 */
export interface CourseStats {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  averageProgress: number;
}

/**
 * Basic instructor info
 */
export interface InstructorBasic {
  id: string;
  nama_lengkap: string;
  email: string;
}
