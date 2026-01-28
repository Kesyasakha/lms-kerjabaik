import { supabase } from "@/pustaka/supabase";
import type { Database } from "@/shared/tipe/database.types";

type Pengguna = Database["public"]["Tables"]["pengguna"]["Row"];

export interface GlobalUserFilters {
  search?: string;
  role?: string;
  status?: string;
  id_lembaga?: string;
  page?: number;
  limit?: number;
}

export interface PenggunaWithTenant extends Pengguna {
  tenant_name?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  nama_lengkap: string;
  role: "admin" | "instruktur" | "pembelajar";
  id_lembaga: string | null;
}

export interface UpdateUserData {
  nama_lengkap?: string;
  email?: string;
  role?: "admin" | "instruktur" | "pembelajar" | "superadmin";
  id_lembaga?: string;
  status?: "aktif" | "nonaktif" | "suspended";
}

/**
 * Search users across all tenants
 */
export async function searchGlobalUsers(filters?: GlobalUserFilters) {
  let query = supabase
    .from("pengguna")
    .select(
      `
      *,
      tenant:id_lembaga (
        id,
        nama
      )
    `,
      { count: "exact" },
    )
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

  if (filters?.id_lembaga) {
    query = query.eq("id_lembaga", filters.id_lembaga);
  }

  // Pagination
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  // Transform data to include tenant name
  const users: PenggunaWithTenant[] =
    data?.map((user: any) => ({
      ...user,
      tenant_name: user.tenant?.nama,
    })) || [];

  return {
    data: users,
    count: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Get user by ID
 */
// ...existing code...
export async function getGlobalUser(id: string) {
  const { data, error } = await supabase
    .from("pengguna")
    .select(
      `
      *,
      tenant:id_lembaga (
        id,
        nama
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) throw error;

  const user = data as unknown as PenggunaWithTenant;

  return {
    ...user,
    tenant_name: (data as any).tenant?.nama,
  };
}

/**
 * Update user status globally
 */
export async function updateUserStatus(
  userId: string,
  status: "aktif" | "nonaktif" | "suspended",
): Promise<Pengguna> {
  const { data, error } = await supabase
    .from("pengguna")
    // @ts-ignore
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as Pengguna;
}

/**
 * Get admin users for all tenants
 */
export async function getAdminUsers() {
  const { data, error } = await supabase
    .from("pengguna")
    .select(
      `
      *,
      tenant:id_lembaga (
        id,
        nama
      )
    `,
    )
    .in("role", ["admin", "superadmin"])
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data?.map((user: any) => ({
    ...user,
    tenant_name: user.tenant?.nama,
  }));
}

/**
 * Create new user
 */
export async function createGlobalUser(userData: CreateUserData) {
  try {
    const { data, error } = await supabase.functions.invoke("create-user", {
      body: userData,
    });

    if (error) {
      // FunctionsHttpError has a context property which is the Response
      if (typeof (error as any).context?.json === 'function') {
        const body = await (error as any).context.json();
        if (body && body.error) {
          throw new Error(body.error);
        }
      }
      throw error;
    }
    return data;
  } catch (err: any) {
    // Re-throw with clean message
    throw new Error(err.message || "Gagal menghubungi layanan pendaftaran.");
  }
}

/**
 * Update user
 */
export async function updateGlobalUser(
  userId: string,
  userData: UpdateUserData,
): Promise<Pengguna> {
  const { data, error } = await supabase
    .from("pengguna")
    // @ts-ignore
    .update({
      ...userData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as Pengguna;
}

/**
 * Delete user
 */
export async function deleteGlobalUser(userId: string) {
  try {
    const { data, error } = await supabase.functions.invoke("delete-user", {
      body: { user_id: userId },
    });

    if (error) {
      if (typeof (error as any).context?.json === 'function') {
        const body = await (error as any).context.json();
        if (body && body.error) {
          throw new Error(body.error);
        }
      }
      throw error;
    }
    return data;
  } catch (err: any) {
    throw new Error(err.message || "Gagal menghubungi layanan penghapusan.");
  }
}
