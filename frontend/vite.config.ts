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
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Skip node_modules yang tidak perlu di-split
          if (id.includes("node_modules")) {
            // React core libraries - harus dalam satu chunk untuk menghindari circular dependencies
            if (
              id.includes("react") || 
              id.includes("react-dom") || 
              id.includes("react-router-dom") ||
              id.includes("scheduler")
            ) {
              return "react-vendor";
            }
            
            // Recharts (harus terpisah karena dependency yang kompleks)
            if (id.includes("recharts")) {
              return "recharts-vendor";
            }
            
            // UI libraries
            if (id.includes("lucide-react") || id.includes("@radix-ui")) {
              return "ui-vendor";
            }
            
            // TanStack Query
            if (id.includes("@tanstack/react-query")) {
              return "tanstack-vendor";
            }
            
            // Supabase
            if (id.includes("@supabase")) {
              return "supabase-vendor";
            }
            
            // Utils vendor
            if (id.includes("zod") || id.includes("date-fns") || id.includes("sonner")) {
              return "utils-vendor";
            }
            
            // Sisa vendor libraries
            return "vendor";
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false, // Disable sourcemap untuk production
    minify: 'esbuild', // Use esbuild untuk minification yang lebih cepat dan reliable
  },
});
