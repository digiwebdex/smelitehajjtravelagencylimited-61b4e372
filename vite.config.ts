import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import viteCompression from "vite-plugin-compression";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const useVPS = !!env.VITE_API_URL;

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      // Pre-compress assets at build time so Nginx can serve .br/.gz directly (much smaller than runtime gzip)
      mode === "production" && viteCompression({
        algorithm: "brotliCompress",
        ext: ".br",
        threshold: 1024,
        deleteOriginFile: false,
      }),
      mode === "production" && viteCompression({
        algorithm: "gzip",
        ext: ".gz",
        threshold: 1024,
        deleteOriginFile: false,
      }),
      // Optimize raster images at build time (PNG/JPG/WebP) — significantly reduces payload
      mode === "production" && ViteImageOptimizer({
        png: { quality: 95, compressionLevel: 9 },
        jpeg: { quality: 92, progressive: true, mozjpeg: true },
        jpg: { quality: 92, progressive: true, mozjpeg: true },
        webp: { quality: 92, effort: 6, lossless: false },
        svg: {
          multipass: true,
          plugins: [
            { name: "preset-default", params: { overrides: { removeViewBox: false } } },
          ],
        },
        cache: true,
        cacheLocation: "node_modules/.cache/vite-image-optimizer",
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // When VITE_API_URL is set (VPS build), swap Supabase client with VPS client
        ...(useVPS ? {
          "@/integrations/supabase/client": path.resolve(__dirname, "./src/lib/vpsClient.ts"),
        } : {}),
      },
      dedupe: ["react", "react-dom", "@tanstack/react-query"],
    },
    optimizeDeps: {
      include: ["react", "react-dom", "@tanstack/react-query"],
    },
    build: {
      // Split large vendor libraries into separate chunks for better caching & parallel download
      // IMPORTANT: Bundle React + all UI libs that depend on React together to avoid
      // "Cannot read properties of undefined (reading 'createContext')" errors caused by
      // chunks loading before React is initialized.
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (!id.includes("node_modules")) return;
            // Heavy isolated libs - lazy loaded only when admin/PDF features are used
            if (id.includes("jspdf") || id.includes("html2canvas") || id.includes("xlsx")) {
              return "doc-vendor";
            }
            if (id.includes("recharts") || id.includes("d3-")) {
              return "chart-vendor";
            }
            if (id.includes("@dnd-kit") || id.includes("react-day-picker")) {
              return "admin-vendor";
            }
            if (id.includes("date-fns")) {
              return "date-vendor";
            }
            // Animation library — split out so it doesn't block first paint
            if (id.includes("framer-motion") || id.includes("motion-dom") || id.includes("motion-utils")) {
              return "motion-vendor";
            }
            // Form stack (only used in modals/admin) — lazy
            if (id.includes("react-hook-form") || id.includes("@hookform") || id.includes("/zod/")) {
              return "form-vendor";
            }
            // Carousel libs (only on Gallery/Testimonials) — lazy
            if (id.includes("embla-carousel")) {
              return "carousel-vendor";
            }
            // Toast / command / drawer libs — only used after interaction
            if (id.includes("sonner") || id.includes("cmdk") || id.includes("vaul") || id.includes("input-otp") || id.includes("react-resizable-panels")) {
              return "ui-extra-vendor";
            }
            // Supabase client — heavy but needed for almost every page; keep separate so it can be cached independently
            if (id.includes("@supabase")) {
              return "supabase-vendor";
            }
            // Radix primitives — split into critical (used in Header/Hero) vs lazy
            if (id.includes("@radix-ui/react-dialog") || id.includes("@radix-ui/react-alert-dialog") ||
                id.includes("@radix-ui/react-popover") || id.includes("@radix-ui/react-select") ||
                id.includes("@radix-ui/react-tabs") || id.includes("@radix-ui/react-accordion") ||
                id.includes("@radix-ui/react-checkbox") || id.includes("@radix-ui/react-radio-group") ||
                id.includes("@radix-ui/react-switch") || id.includes("@radix-ui/react-scroll-area") ||
                id.includes("@radix-ui/react-toast") || id.includes("@radix-ui/react-menubar") ||
                id.includes("@radix-ui/react-context-menu") || id.includes("@radix-ui/react-hover-card") ||
                id.includes("@radix-ui/react-collapsible") || id.includes("@radix-ui/react-navigation-menu") ||
                id.includes("@radix-ui/react-progress") || id.includes("@radix-ui/react-slider") ||
                id.includes("@radix-ui/react-toggle") || id.includes("@radix-ui/react-aspect-ratio") ||
                id.includes("@radix-ui/react-avatar")) {
              return "radix-vendor";
            }
            // lucide-react — tree-shakes per icon, but bundle the rest separately
            if (id.includes("lucide-react")) {
              return "icons-vendor";
            }
            // Core: React, react-router, tanstack — must stay together for first paint
            return "vendor";
          },
        },
      },
      chunkSizeWarningLimit: 1500,
      cssCodeSplit: true,
      reportCompressedSize: false,
      modulePreload: {
        // Don't auto-preload heavy chunks - only the core vendor chunk
        resolveDependencies: (filename, deps) => {
          return deps.filter(
            (dep) =>
              !dep.includes("doc-vendor") &&
              !dep.includes("chart-vendor") &&
              !dep.includes("admin-vendor") &&
              !dep.includes("motion-vendor") &&
              !dep.includes("form-vendor") &&
              !dep.includes("carousel-vendor") &&
              !dep.includes("ui-extra-vendor") &&
              !dep.includes("date-vendor") &&
              !dep.includes("icons-vendor") &&
              !dep.includes("AdminDashboard")
          );
        },
      },
    },
  };
});
