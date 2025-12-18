import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    // 关键：将构建输出目录指向后端的静态资源目录
    outDir: '../backend/static',
    // 关键：构建前清空旧文件，防止缓存干扰
    emptyOutDir: true,
  }
})