import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminUsers,
  getAdminUserStats,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  bulkImportUsers,
} from "../api/usersApi";
import { createAuditLog } from "@/fitur/superadmin/api/auditLogsApi";
import type { AdminUserFilters, AdminUserData } from "../tipe/admin.types";
import { useAuthStore } from "@/fitur/autentikasi/stores/authStore";

/**
 * Hook untuk query users dalam tenant admin
 * Query key includes id_lembaga untuk memastikan cache isolation per tenant
 */
export function useAdminUsers(filters?: AdminUserFilters) {
  const { user: currentUser } = useAuthStore();

  return useQuery({
    queryKey: ["admin-users", currentUser?.id_lembaga, filters],
    queryFn: () => getAdminUsers(filters),
    staleTime: 1000 * 10, // 10 seconds
    enabled: !!currentUser?.id_lembaga, // Only run if user has id_lembaga
  });
}

/**
 * Hook untuk create user
 */
export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: AdminUserData) => createAdminUser(data),
    onSuccess: () => {
      // Invalidate dengan id_lembaga untuk cache isolation
      queryClient.invalidateQueries({
        queryKey: ["admin-users", currentUser?.id_lembaga],
      });
    },
  });
}

/**
 * Hook untuk update user
 */
export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: Partial<AdminUserData>;
    }) => updateAdminUser(userId, data),
    onSuccess: async (_, variables) => {
      // Invalidate dengan id_lembaga untuk cache isolation
      queryClient.invalidateQueries({
        queryKey: ["admin-users", currentUser?.id_lembaga],
      });

      // Log activity
      if (currentUser) {
        await createAuditLog({
          id_pengguna: currentUser.id,
          aksi: "UPDATE",
          tipe_sumber_daya: "pengguna",
          id_sumber_daya: variables.userId,
          detail: {
            changes: variables.data,
            updated_by_admin: true,
          },
        });
      }
    },
  });
}

/**
 * Hook untuk delete user
 */
export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  return useMutation({
    mutationFn: (userId: string) => deleteAdminUser(userId),
    onSuccess: () => {
      // Invalidate dengan id_lembaga untuk cache isolation
      queryClient.invalidateQueries({
        queryKey: ["admin-users", currentUser?.id_lembaga],
      });
    },
  });
}

/**
 * Hook untuk bulk import users
 */
export function useBulkImportUsers() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  return useMutation({
    mutationFn: (file: File) => bulkImportUsers(file),
    onSuccess: () => {
      // Invalidate dengan id_lembaga untuk cache isolation
      queryClient.invalidateQueries({
        queryKey: ["admin-users", currentUser?.id_lembaga],
      });
    },
  });
}

/**
 * Hook untuk get user stats
 */
export function useAdminUserStats() {
  const { user: currentUser } = useAuthStore();

  return useQuery({
    queryKey: ["admin-user-stats", currentUser?.id_lembaga],
    queryFn: () => getAdminUserStats(),
    staleTime: 1000 * 30, // 30 seconds
    enabled: !!currentUser?.id_lembaga,
  });
}
