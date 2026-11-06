import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// 5173 evita conflito com o back-end Spring Boot (8080)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
});
