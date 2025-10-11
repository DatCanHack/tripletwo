import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/", // 🔑 Quan trọng: để asset build dùng đường dẫn tuyệt đối
});
