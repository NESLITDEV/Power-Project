import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";
import path from "path";

// Default API URL in case environment variable is not set
const DEFAULT_API_URL = "https://6368-154-192-137-11.ngrok-free.app/api";

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 3000,
  },
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_APP_API_URL || DEFAULT_API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
        configure: (proxy, options) => {
          proxy.on("error", (err, req, res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, res) => {
            proxyReq.setHeader("ngrok-skip-browser-warning", "true");
          });
        },
      },
    },
  },
});
