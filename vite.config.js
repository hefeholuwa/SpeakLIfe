import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    open: true
  },
        build: {
          outDir: 'dist',
          sourcemap: false,
          minify: 'terser',
          rollupOptions: {
            output: {
              manualChunks: {
                vendor: ['react', 'react-dom'],
                ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs', '@radix-ui/react-accordion', '@radix-ui/react-alert-dialog'],
                supabase: ['@supabase/supabase-js'],
                utils: ['clsx', 'tailwind-merge', 'class-variance-authority'],
                icons: ['lucide-react'],
                forms: ['react-hook-form', '@hookform/resolvers', 'zod']
              },
              entryFileNames: `assets/[name]-[hash].js`,
              chunkFileNames: `assets/[name]-[hash].js`,
              assetFileNames: `assets/[name]-[hash].[ext]`
            }
          },
          chunkSizeWarningLimit: 1000,
          target: 'es2015',
          cssCodeSplit: true
        },
  define: {
    global: 'globalThis',
  }
})
