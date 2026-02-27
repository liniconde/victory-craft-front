import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
  root: __dirname,
  publicDir: false,
  // Provide a minimal `process.env` for libs that reference it at runtime
  define: {
    "process.env": {},
  },
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss({ config: resolve(__dirname, "tailwind.config.js") }),
        autoprefixer(),
      ],
    },
  },
  server: {
    port: 4173,
    fs: {
      allow: [resolve(__dirname, "..", "..")],
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/remote.tsx"),
      name: "VictoryVideosMfe",
      formats: ["iife"],
      fileName: () => "mfe-videos.js",
    },
    cssCodeSplit: false,
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "mfe-videos.css";
          }
          return "assets/[name]-[hash][extname]";
        },
        inlineDynamicImports: true,
      },
    },
  },
});
