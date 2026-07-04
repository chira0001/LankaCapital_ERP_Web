import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
//import path from 'path'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],

  server: {
    port: 5173,
    proxy: {

      "/api": {
        target: "http://localhost:8080", // adjust if your Spring Boot app runs on a different port
        changeOrigin: true,
      },
    },

  },

  //add Configure path aliases 
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }, 
})






