import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/", // Set base path untuk assets (ubah jika deploy di subdirectory)
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
    // Disable manual chunks untuk menghindari circular dependency issues
    // Vite akan otomatis melakukan code splitting yang aman
    rollupOptions: {
      output: {
        // Hanya split vendor yang sangat besar untuk optimasi loading
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Recharts adalah library yang sangat besar, split terpisah
            if (id.includes("recharts")) {
              return "recharts-vendor";
            }
            // Semua vendor lainnya dalam satu chunk untuk menghindari dependency issues
            return "vendor";
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'esbuild',
    // Target modern browsers untuk build yang lebih kecil dan cepat
    target: 'esnext',
  },
});
