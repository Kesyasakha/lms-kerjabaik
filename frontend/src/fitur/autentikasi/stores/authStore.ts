import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/pustaka/supabase";
import { queryClient } from "@/pustaka/queryClient";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Database } from "@/shared/tipe/database.types";

type Pengguna = Database["public"]["Tables"]["pengguna"]["Row"];

type AuthUser = Pengguna;

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
        // Jika sudah diinisialisasi, jangan lakukan apa-apa
        if (useAuthStore.getState().isInitialized) return;

        try {
          // Hanya set loading jika belum loading
          set({ isLoading: true });

          // Check current session
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            // Fetch user data from pengguna table
            const { data: pengguna, error } = await supabase
              .from("pengguna")
              .select("*")
              .eq("auth_id", session.user.id)
              .single();

            if (error) throw error;

            set({
              session: session.user,
              user: pengguna as AuthUser,
            });
          } else {
            set({
              session: null,
              user: null,
            });
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "SIGNED_IN" && session?.user) {
              const { data: pengguna } = await supabase
                .from("pengguna")
                .select("*")
                .eq("auth_id", session.user.id)
                .single();

              set({
                session: session.user,
                user: pengguna || null,
              });
            } else if (event === "SIGNED_OUT" || event === "USER_UPDATED") {
              if (event === "SIGNED_OUT") {
                queryClient.clear();
                set({
                  session: null,
                  user: null,
                });
              }
            }
          });

          set({ isInitialized: true, isLoading: false });
        } catch (error) {
          // Tangani AbortError (lock competition di Supabase)
          if (error instanceof Error && error.name === "AbortError") {
            // Jika ini call pertama yang gagal karena lock, 
            // setInitialized agar tidak dipanggil lagi dan matikan loading
            set({ isInitialized: true, isLoading: false });
            return;
          }

          console.error("Error initializing auth:", error);
          set({
            session: null,
            user: null,
            isLoading: false,
            isInitialized: true,
          });
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

          // Clear React Query cache sebelum logout
          queryClient.clear();

          await supabase.auth.signOut();

          set({
            session: null,
            user: null,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
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
