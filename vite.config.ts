import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { seo } from "./seo/plugin";

export default defineConfig({
  plugins: [react(), seo()],
  build: { outDir: "dist", assetsInlineLimit: 0 },
});
