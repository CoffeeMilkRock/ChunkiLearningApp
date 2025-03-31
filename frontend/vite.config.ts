import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/laban": {
        target: "https://dict.laban.vn",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/laban/, ""),
      },
      "/laban-script": {
        target: "https://stc-laban.zdn.vn",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/laban-script/, ""),
      },
      "/translate": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
