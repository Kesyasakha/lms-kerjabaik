import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 3000,     // Paksa jalan di port 3000
    host: true,     // "true" artinya = 0.0.0.0 (Bisa diakses dari luar container)
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split Recharts first (tergantung agar tidak circular)
          if (id.includes("recharts")) {
            return "recharts-vendor";
          }
          
          // React dan React Router - include react-dom dan react-router-dom
          if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
            return "react-vendor";
          }
          
          // UI vendor - lucide-react dan @radix-ui
          if (id.includes("lucide-react") || id.includes("@radix-ui")) {
            return "ui-vendor";
          }
          
          // TanStack Query
          if (id.includes("@tanstack/react-query")) {
            return "tanstack-vendor";
          }
          
          // Utils vendor - zod, date-fns, sonner
          if (id.includes("zod") || id.includes("date-fns") || id.includes("sonner")) {
            return "utils-vendor";
          }
          
          // Sisa kode aplikasi yang belum terpisah (split per domain untuk mengurangi ukuran chunk utama)
          if (id.includes("frontend/src/fitur/admin/pages")) {
            return "admin-pages";
          }
          if (id.includes("frontend/src/fitur/superadmin/pages")) {
            return "superadmin-pages";
          }
          if (id.includes("frontend/src/fitur/instruktur/pages")) {
            return "instruktur-pages";
          }
          if (id.includes("frontend/src/fitur/pembelajar/pages")) {
            return "pembelajar-pages";
          }
          // Additional finer-grained component-level chunks
          if (id.includes("frontend/src/fitur/admin/komponen")) {
            return "admin-komponen";
          }
          if (id.includes("frontend/src/fitur/superadmin/komponen")) {
            return "superadmin-komponen";
          }
          if (id.includes("frontend/src/fitur/instruktur/komponen")) {
            return "instruktur-komponen";
          }
          if (id.includes("frontend/src/fitur/pembelajar/komponen")) {
            return "pembelajar-komponen";
          }
          // Fallback umum untuk modul lain
          if (id.includes("src/")) {
            return "app-code";
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
});
