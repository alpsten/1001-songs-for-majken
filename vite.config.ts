import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/1001-songs-for-majken/',
  plugins: [react(), tailwindcss()],
})
