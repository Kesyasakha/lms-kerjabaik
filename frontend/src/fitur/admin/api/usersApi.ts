import { supabase } from "@/pustaka/supabase";
import type {
  AdminUserFilters,
  AdminUserData,
  PaginatedUsers,
  BulkImportResult,
} from "../tipe/admin.types";

/**
 * Get users for current admin's tenant
 */
export async function getAdminUsers(
  filters?: AdminUserFilters,
): Promise<PaginatedUsers> {
  // Get current user to filter by tenant
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Not authenticated");

  // Get current user's id_lembaga
  const { data: currentUser } = (await supabase
    .from("pengguna")
    .select("id_lembaga")
    .eq("auth_id", authUser.id)
    .single()) as { data: { id_lembaga: string } | null };

  if (!currentUser) throw new Error("User not found");

  let query = supabase
    .from("pengguna")
    .select("*", { count: "exact" })
    .eq("id_lembaga", currentUser.id_lembaga) // Tenant isolation
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters?.search) {
    query = query.or(
      `nama_lengkap.ilike.%${filters.search}%,email.ilike.%${filters.search}%`,
    );
  }

  if (filters?.role) {
    query = query.eq("role", filters.role);
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

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data || [],
    count: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Create user for admin's tenant
 */
export async function createAdminUser(userData: AdminUserData) {
  // Get current user's id_lembaga
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Not authenticated");

  const { data: currentUser } = (await supabase
    .from("pengguna")
    .select("id_lembaga")
    .eq("auth_id", authUser.id)
    .single()) as { data: { id_lembaga: string } | null };

  if (!currentUser) throw new Error("User not found");

  // Call create-user Edge Function
  const { data, error } = await supabase.functions.invoke("create-user", {
    body: {
      ...userData,
      id_lembaga: currentUser.id_lembaga, // Force tenant isolation
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Update user in admin's tenant
 */
export async function updateAdminUser(
  userId: string,
  userData: Partial<AdminUserData>,
) {
  // Get current user's id_lembaga for validation
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Not authenticated");

  const { data: currentUser } = (await supabase
    .from("pengguna")
    .select("id_lembaga")
    .eq("auth_id", authUser.id)
    .single()) as { data: { id_lembaga: string } | null };

  if (!currentUser) throw new Error("User not found");

  // Update user (RLS will ensure tenant isolation)
  const { data, error } = await supabase
    .from("pengguna")
    // @ts-ignore - TypeScript issue with Supabase generated types
    .update({
      nama_lengkap: userData.nama_lengkap,
      role: userData.role,
      status: userData.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .eq("id_lembaga", currentUser.id_lembaga) // Double check tenant isolation
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete user in admin's tenant
 */
export async function deleteAdminUser(userId: string) {
  // Get current user's id_lembaga
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Not authenticated");

  const { data: currentUser } = (await supabase
    .from("pengguna")
    .select("id_lembaga")
    .eq("auth_id", authUser.id)
    .single()) as { data: { id_lembaga: string } | null };

  if (!currentUser) throw new Error("User not found");

  // Call delete-user Edge Function
  const { data, error } = await supabase.functions.invoke("delete-user", {
    body: {
      id_pengguna: userId,
      id_lembaga: currentUser.id_lembaga, // For validation
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Bulk import users from CSV
 */
export async function bulkImportUsers(file: File): Promise<BulkImportResult> {
  // Read CSV file
  const text = await file.text();
  const lines = text.split("\n").filter((line) => line.trim());

  // Skip header row
  const dataLines = lines.slice(1);

  const result: BulkImportResult = {
    success: 0,
    failed: 0,
    errors: [],
    createdUsers: [],
  };

  // Get current user's id_lembaga
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Not authenticated");

  const { data: currentUser } = (await supabase
    .from("pengguna")
    .select("id_lembaga")
    .eq("auth_id", authUser.id)
    .single()) as { data: { id_lembaga: string } | null };

  if (!currentUser) throw new Error("User not found");

  // Process each row
  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    const cols = line.split(",").map((col) => col.trim());

    // Expect: nama_lengkap, email, password, role
    if (cols.length < 4) {
      result.failed++;
      result.errors.push({
        row: i + 2, // +2 because header is row 1
        email: cols[1] || "",
        error:
          "Invalid CSV format (expected: nama_lengkap,email,password,role)",
      });
      continue;
    }

    const [nama_lengkap, email, password, role] = cols;

    // Validate role
    if (!["admin", "instruktur", "pembelajar"].includes(role)) {
      result.failed++;
      result.errors.push({
        row: i + 2,
        email,
        error: `Invalid role: ${role}`,
      });
      continue;
    }

    try {
      const user = await createAdminUser({
        nama_lengkap,
        email,
        password,
        role: role as "admin" | "instruktur" | "pembelajar",
      });

      result.success++;
      result.createdUsers.push(user);
    } catch (error: any) {
      result.failed++;
      result.errors.push({
        row: i + 2,
        email,
        error: error.message || "Unknown error",
      });
    }
  }

  return result;
}

/**
 * Get user stats for admin dashboard
 */
export async function getAdminUserStats() {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Not authenticated");

  const { data: currentUser } = (await supabase
    .from("pengguna")
    .select("id_lembaga")
    .eq("auth_id", authUser.id)
    .single()) as { data: { id_lembaga: string } | null };

  if (!currentUser) throw new Error("User not found");

  // Run queries in parallel
  const [total, active, nonActive, suspended] = await Promise.all([
    supabase
      .from("pengguna")
      .select("*", { count: "exact", head: true })
      .eq("id_lembaga", currentUser.id_lembaga),
    supabase
      .from("pengguna")
      .select("*", { count: "exact", head: true })
      .eq("id_lembaga", currentUser.id_lembaga)
      .eq("status", "aktif"),
    supabase
      .from("pengguna")
      .select("*", { count: "exact", head: true })
      .eq("id_lembaga", currentUser.id_lembaga)
      .eq("status", "nonaktif"),
    supabase
      .from("pengguna")
      .select("*", { count: "exact", head: true })
      .eq("id_lembaga", currentUser.id_lembaga)
      .eq("status", "suspended"),
  ]);

  return {
    total: total.count || 0,
    active: active.count || 0,
    nonActive: nonActive.count || 0,
    suspended: suspended.count || 0
  };
}
