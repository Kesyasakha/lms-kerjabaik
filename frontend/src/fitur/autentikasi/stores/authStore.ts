import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/pustaka/supabase";
import { queryClient } from "@/pustaka/queryClient";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Database } from "@/shared/tipe/database.types";

type Pengguna = Database["public"]["Tables"]["pengguna"]["Row"];

export type AuthUser = Pengguna;

interface AuthState {
  user: AuthUser | null;
  session: SupabaseUser | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setSession: (session: SupabaseUser | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,
      isInitialized: false,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ isLoading: loading }),

      initialize: async () => {
        const state = useAuthStore.getState();
        // Cegah inisialisasi ganda secara paralel
        if (state.isInitialized) return;

        try {
          set({ isLoading: true });

          // Ambil sesi dengan timeout 5 detik agar tidak hang selamanya
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Supabase timeout")), 5000)
          );

          const { data: { session } } = (await Promise.race([
            sessionPromise,
            timeoutPromise,
          ])) as any;

          if (session?.user) {
            const { data: pengguna, error } = await supabase
              .from("pengguna")
              .select("*")
              .eq("auth_id", session.user.id)
              .single();

            if (!error && pengguna) {
              set({
                session: session.user,
                user: pengguna as AuthUser,
              });
            }
          }

          // Daftarkan listener transisi auth hanya sekali
          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`Auth event: ${event}`); // Debug log

            if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
              if (session?.user) {
                // Strict optimization:
                // Jika user ID sama dengan yang ada di state, JANGAN fetch ke database.
                // Cukup update session tokennya saja.
                const currentUser = useAuthStore.getState().user;
                if (currentUser && currentUser.auth_id === session.user.id) {
                  set({
                    session: session.user,
                    isLoading: false // Pastikan loading mati
                  });
                  return;
                }

                // Hanya fetch jika user benar-benar baru atau belum ada di state
                const { data: pengguna } = await supabase
                  .from("pengguna")
                  .select("*")
                  .eq("auth_id", session.user.id)
                  .single();

                set({
                  session: session.user,
                  user: pengguna || null,
                  isLoading: false,
                });
              }
            } else if (event === "SIGNED_OUT") {
              queryClient.clear();
              set({
                session: null,
                user: null,
                isLoading: false,
              });
            }
          });
        } catch (error) {
          console.error("Auth init error:", error);
        } finally {
          // Garansi state initialized dan loading berhenti apapun hasilnya
          set({ isInitialized: true, isLoading: false });
        }
      },

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (data.user) {
            // Fetch user data from pengguna table
            const { data: pengguna, error: penggunaError } = await supabase
              .from("pengguna")
              .select("*")
              .eq("auth_id", data.user.id)
              .single();

            if (penggunaError) throw penggunaError;

            set({
              session: data.user,
              user: pengguna as AuthUser,
              isLoading: false,
            });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });

          // Clear React Query cache
          queryClient.clear();

          // Buat promise race antara signOut dan timeout 3 detik
          // Ini mencegah UI stuck loading jika Supabase tidak merespon
          await Promise.race([
            supabase.auth.signOut(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Logout timeout")), 3000)
            )
          ]).catch((err) => {
            console.warn("Logout process timed out or failed, forcing local cleanup:", err);
          });
        } catch (error) {
          console.error("Error asking supabase to sign out:", error);
        } finally {
          // Selalu bersihkan state lokal apapun yang terjadi
          set({
            session: null,
            user: null,
            isLoading: false,
          });

          // Paksa reload halaman jika perlu untuk memastikan bersih total
          // window.location.href = '/login'; // Optional: jika state bandel
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
      }),
    },
  ),
);
